# Inicia o sistema: API (banco de dados), servidor da IA e site (Angular).
# Na primeira vez instala tudo e pergunta a senha do MySQL, tudo na mesma execucao.
# Antes de subir, confere os requisitos (Windows, Node.js, MySQL, portas)
# e explica o que esta faltando, em vez de abrir um site que nao funciona.

# Pastas deste projeto
$pastaIa  = Join-Path $PSScriptRoot "minha-ia"
$pastaApi = Join-Path $PSScriptRoot "backend"

# Deixa o npm e o Angular mais rapidos e sem perguntas ou avisos de atualizacao
$env:NG_CLI_ANALYTICS           = "false"
$env:NPM_CONFIG_UPDATE_NOTIFIER = "false"
$env:NPM_CONFIG_AUDIT           = "false"
$env:NPM_CONFIG_FUND            = "false"

# ---------------------------------------------------------------------------
# Funcoes de apoio
# ---------------------------------------------------------------------------

# Mostra o problema em vermelho e encerra
function Falhar([string[]]$linhas) {
    Write-Host ""
    foreach ($linha in $linhas) {
        Write-Host $linha -ForegroundColor Red
    }
    Write-Host ""
    exit 1
}

# Diz se alguem esta escutando nesse endereco e porta (espera no maximo $espera ms)
function Porta-Aberta([string]$endereco, [int]$porta, [int]$espera = 1500) {
    $cliente = New-Object System.Net.Sockets.TcpClient
    try {
        $tarefa = $cliente.BeginConnect($endereco, $porta, $null, $null)
        if ($tarefa.AsyncWaitHandle.WaitOne($espera, $false) -and $cliente.Connected) {
            $cliente.EndConnect($tarefa)
            return $true
        }
        return $false
    } catch {
        return $false
    } finally {
        $cliente.Close()
    }
}

# Le um valor do arquivo .env (por exemplo DB_PORT). Se nao achar, devolve o padrao.
function Ler-Env([string]$arquivo, [string]$chave, [string]$padrao) {
    if (Test-Path $arquivo) {
        foreach ($linha in Get-Content $arquivo -Encoding UTF8) {
            if ($linha -match ('^\s*' + $chave + '\s*=\s*(.*)$')) {
                $valor = $Matches[1].Trim().Trim('"')
                if ($valor -ne "") { return $valor }
            }
        }
    }
    return $padrao
}

# Instala as dependencias de uma pasta (npm ci e mais rapido que npm install)
# O '| Out-Host' mostra o texto do npm sem misturar com o valor que a funcao devolve
function Instalar-Dependencias($pasta, $nome) {
    Write-Host "Instalando as dependencias $nome (so na primeira vez, pode levar alguns minutos)..." -ForegroundColor Cyan
    Push-Location $pasta

    if (Test-Path "package-lock.json") {
        npm.cmd ci --no-audit --no-fund --loglevel=error | Out-Host
        if ($LASTEXITCODE -ne 0) {
            npm.cmd install --no-audit --no-fund --loglevel=error | Out-Host
        }
    } else {
        npm.cmd install --no-audit --no-fund --loglevel=error | Out-Host
    }

    $codigo = $LASTEXITCODE
    Pop-Location
    return $codigo
}

# Confere se todos estes arquivos existem dentro de uma pasta node_modules.
# So existir a pasta nao basta: uma instalacao interrompida deixa a pasta pela metade.
function Dependencias-Completas([string]$pasta, [string[]]$arquivos) {
    foreach ($arquivo in $arquivos) {
        if (-not (Test-Path (Join-Path $pasta ("node_modules\" + $arquivo)))) {
            return $false
        }
    }
    return $true
}

# ---------------------------------------------------------------------------
# 1. Requisitos do computador
# ---------------------------------------------------------------------------

# Windows 10 ou mais novo (o Node.js 20+ nao roda em versoes antigas)
if ([Environment]::OSVersion.Version.Major -lt 10) {
    Falhar @(
        "Este projeto precisa do Windows 10 ou mais novo.",
        "O Node.js 20 (exigido pelo Angular 21) nao funciona em versoes antigas do Windows."
    )
}

# Node.js instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Falhar @(
        "Node.js nao encontrado.",
        "Instale a versao LTS em https://nodejs.org e abra um novo terminal (ou clique de novo no iniciar.cmd)."
    )
}

# Versao do Node.js aceita pelo Angular 21: 20.19+, 22.12+ ou 24+
$textoVersao = (& node --version) -replace "^v", ""
$versaoOk = $false
try {
    $v = [version]$textoVersao
    $versaoOk = ($v.Major -ge 24) -or
                ($v.Major -eq 22 -and $v.Minor -ge 12) -or
                ($v.Major -eq 20 -and $v.Minor -ge 19)
} catch {
    $versaoOk = $false
}
if (-not $versaoOk) {
    Falhar @(
        "O Node.js instalado (v$textoVersao) e antigo ou nao suportado.",
        "O Angular 21 precisa do Node.js 20.19 ou mais novo (ou 22.12+, ou 24+).",
        "Baixe a versao LTS em https://nodejs.org, instale e abra um novo terminal."
    )
}

# npm (vem junto com o Node.js)
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    Falhar @(
        "npm nao encontrado. Reinstale o Node.js em https://nodejs.org (versao LTS)."
    )
}

# ---------------------------------------------------------------------------
# 2. MySQL ligado
# ---------------------------------------------------------------------------

$arquivoEnv = Join-Path $pastaApi ".env"
$modeloEnv  = Join-Path $pastaApi ".env.example"

$fonteEnv = $modeloEnv
if (Test-Path $arquivoEnv) { $fonteEnv = $arquivoEnv }

$hostDb  = Ler-Env $fonteEnv "DB_HOST" "127.0.0.1"
$portaDb = [int](Ler-Env $fonteEnv "DB_PORT" "3306")

if (-not (Porta-Aberta $hostDb $portaDb)) {
    # Se o MySQL e deste computador, tenta ligar o servico (so funciona se este terminal for administrador)
    if ($hostDb -eq "127.0.0.1" -or $hostDb -eq "localhost") {
        $parados = @(Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue |
            Where-Object { $_.Status -ne "Running" })

        foreach ($servico in $parados) {
            Write-Host "MySQL desligado. Tentando ligar o servico $($servico.Name)..." -ForegroundColor Yellow
            try { Start-Service -Name $servico.Name -ErrorAction Stop } catch { }
        }

        if ($parados.Count -gt 0) {
            for ($i = 0; $i -lt 20; $i++) {
                if (Porta-Aberta $hostDb $portaDb 500) { break }
                Start-Sleep -Milliseconds 500
            }
        }
    }
}

if (-not (Porta-Aberta $hostDb $portaDb)) {
    Falhar @(
        "Nao consegui falar com o MySQL em ${hostDb}:${portaDb}.",
        "",
        "Se o MySQL ainda nao esta instalado:",
        "  Baixe o 'MySQL Installer' em https://dev.mysql.com/downloads/installer/",
        "  e instale o MySQL Server (guarde a senha do usuario root).",
        "",
        "Se ja esta instalado, ligue o servico:",
        "  Aperte Win + R, digite services.msc e inicie o servico que comeca com 'MySQL'.",
        "",
        "Se o MySQL usa outra porta ou outro computador, ajuste DB_HOST e DB_PORT em backend\.env.",
        "Depois rode o iniciar.cmd de novo."
    )
}

# ---------------------------------------------------------------------------
# 3. Portas livres
# ---------------------------------------------------------------------------

$portaApi = [int](Ler-Env $fonteEnv "PORT" "3000")

if (Porta-Aberta "127.0.0.1" $portaApi 500) {
    Falhar @(
        "A porta $portaApi (API) ja esta em uso.",
        "Feche outras janelas deste projeto que estejam abertas (ou o programa que usa essa porta) e tente de novo."
    )
}
if (Porta-Aberta "localhost" 4200 500) {
    Falhar @(
        "A porta 4200 (site) ja esta em uso.",
        "Feche outras janelas deste projeto que estejam abertas e tente de novo."
    )
}

# ---------------------------------------------------------------------------
# 4. Dependencias (so instala se faltar alguma coisa)
# ---------------------------------------------------------------------------

$arquivosAngular = @("@angular\cli\bin\ng.js", "@angular\core\package.json", "primeng\package.json", "rxjs\package.json")
$arquivosApi     = @("express\package.json", "mysql2\package.json", "dotenv\package.json", "cors\package.json")

if (-not (Dependencias-Completas $PSScriptRoot $arquivosAngular)) {
    if ((Instalar-Dependencias $PSScriptRoot "do Angular") -ne 0) {
        Falhar @(
            "A instalacao do Angular falhou. Veja a mensagem acima.",
            "Confira se o computador esta com internet e rode o iniciar.cmd de novo."
        )
    }
}

if (-not (Dependencias-Completas $pastaApi $arquivosApi)) {
    if ((Instalar-Dependencias $pastaApi "da API") -ne 0) {
        Falhar @(
            "A instalacao da API falhou. Veja a mensagem acima.",
            "Confira se o computador esta com internet e rode o iniciar.cmd de novo."
        )
    }
}

# ---------------------------------------------------------------------------
# 5. Senha do MySQL (so na primeira vez)
# ---------------------------------------------------------------------------

$precisaSenha = (-not (Test-Path $arquivoEnv)) -or
    (Select-String -Path $arquivoEnv -Pattern "troque_pela_sua_senha" -Quiet)

if ($precisaSenha) {
    Write-Host ""
    Write-Host "Primeira vez: vou configurar o banco de dados (MySQL)." -ForegroundColor Yellow
    $segura = Read-Host "Digite a senha do MySQL (se nao tiver senha, so aperte Enter)" -AsSecureString
    $senha  = (New-Object System.Net.NetworkCredential("", $segura)).Password

    # Se a senha tiver aspas, usa crase para envolver o valor
    $aspas = '"'
    if ($senha.Contains('"')) { $aspas = [string][char]96 }
    $linhaSenha = "DB_PASSWORD=" + $aspas + $senha + $aspas

    $origem = $modeloEnv
    if (Test-Path $arquivoEnv) { $origem = $arquivoEnv }

    $linhas = foreach ($linha in Get-Content $origem -Encoding UTF8) {
        if ($linha -match "^DB_PASSWORD=") { $linhaSenha } else { $linha }
    }

    # Grava sem BOM, para a API conseguir ler o arquivo
    [System.IO.File]::WriteAllLines($arquivoEnv, [string[]]$linhas, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "Configuracao salva em backend\.env." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# 6. Sobe a API e espera ela ficar pronta
# ---------------------------------------------------------------------------

Write-Host "Iniciando a API (banco de dados)..." -ForegroundColor Cyan
$api = Start-Process -FilePath "node" -ArgumentList "server.js" `
    -WorkingDirectory $pastaApi -NoNewWindow -PassThru

$apiPronta = $false
for ($i = 0; $i -lt 60; $i++) {
    if ($api.HasExited) { break }
    if (Porta-Aberta "127.0.0.1" $portaApi 300) { $apiPronta = $true; break }
    Start-Sleep -Milliseconds 500
}

if (-not $apiPronta) {
    if (-not $api.HasExited) { Stop-Process -Id $api.Id -Force }
    Falhar @(
        "A API nao conseguiu iniciar. Leia a mensagem acima.",
        "Se o erro for de acesso negado ao MySQL, a senha esta errada:",
        "apague o arquivo backend\.env e rode o iniciar.cmd de novo para digitar a senha outra vez."
    )
}

# ---------------------------------------------------------------------------
# 7. Sobe o servidor da IA, se der (sem ele o site abre, so sem a sugestao)
# ---------------------------------------------------------------------------

$servidor = $null
$exeIa = Join-Path $pastaIa "servidor.exe"

if (-not (Test-Path $exeIa)) {
    Write-Host "servidor.exe nao encontrado: o site abre, mas sem a sugestao da IA." -ForegroundColor Yellow
} elseif (-not [Environment]::Is64BitOperatingSystem) {
    Write-Host "O servidor da IA so roda em Windows de 64 bits: o site abre, mas sem a sugestao da IA." -ForegroundColor Yellow
} elseif (Porta-Aberta "127.0.0.1" 8080 500) {
    Write-Host "A porta 8080 ja esta em uso (talvez a IA ja esteja aberta). Nao vou abrir outra." -ForegroundColor Yellow
} else {
    # Tira a marca de 'baixado da internet' dos arquivos da IA, para o Windows nao bloquear
    Get-ChildItem -Path (Join-Path $pastaIa "*") -Include "*.exe", "*.dll" -ErrorAction SilentlyContinue |
        Unblock-File -ErrorAction SilentlyContinue

    Write-Host "Iniciando o servidor da IA..." -ForegroundColor Cyan
    try {
        $servidor = Start-Process -FilePath $exeIa -WorkingDirectory $pastaIa `
            -NoNewWindow -PassThru -ErrorAction Stop
        Start-Sleep -Seconds 2
        if ($servidor.HasExited) {
            Write-Host "O servidor da IA fechou logo ao abrir (antivirus ou politica do Windows podem ter bloqueado)." -ForegroundColor Yellow
            Write-Host "O site abre normalmente, so sem a sugestao da IA." -ForegroundColor Yellow
            $servidor = $null
        }
    } catch {
        Write-Host "Nao consegui abrir o servidor da IA: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "O site abre normalmente, so sem a sugestao da IA." -ForegroundColor Yellow
        $servidor = $null
    }
}

# ---------------------------------------------------------------------------
# 8. Sobe o site (Angular)
# ---------------------------------------------------------------------------

try {
    # Sobe o Angular direto pelo Node (mais rapido que passar pelo npx)
    Set-Location $PSScriptRoot
    Write-Host "Iniciando o Angular... quando aparecer 'Local: http://localhost:4200', abra esse endereco no navegador." -ForegroundColor Cyan

    $angular = Join-Path $PSScriptRoot "node_modules\@angular\cli\bin\ng.js"
    if (Test-Path $angular) {
        node $angular serve
    } else {
        npx.cmd ng serve
    }
}
finally {
    # Quando o Angular parar (Ctrl + C), derruba a API e a IA tambem
    foreach ($processo in @($api, $servidor)) {
        if ($processo -and -not $processo.HasExited) {
            Stop-Process -Id $processo.Id -Force
        }
    }
    Write-Host "Servidores encerrados." -ForegroundColor Cyan
}