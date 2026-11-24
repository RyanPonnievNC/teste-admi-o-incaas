# Inicia o sistema: API (banco de dados), servidor da IA e site (Angular).
# Na primeira vez instala tudo e pergunta a senha do MySQL, tudo na mesma execucao.
# Antes de subir, confere os requisitos (Windows, Node.js, MySQL, portas)
# e explica o que esta faltando, em vez de abrir um site que nao funciona.
# Se a instalacao das dependencias estiver incompleta ou desatualizada, refaz sozinho.
# As linhas cinzas "[ 1,2s]" mostram quanto tempo cada etapa levou.

# Cronometro: conta desde que este script comecou a rodar
$relogio = [System.Diagnostics.Stopwatch]::StartNew()

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

# Mostra, em cinza, quantos segundos se passaram ate esta etapa
function Marcar([string]$etapa) {
    Write-Host ("  [{0,5:N1}s] {1}" -f $relogio.Elapsed.TotalSeconds, $etapa) -ForegroundColor DarkGray
}

# Mostra o problema em vermelho e encerra
function Falhar([string[]]$linhas) {
    Write-Host ""
    foreach ($linha in $linhas) {
        Write-Host $linha -ForegroundColor Red
    }
    Write-Host ""
    exit 1
}

# Diz se alguem esta escutando nesse endereco e porta (espera no maximo $espera ms).
# Usado so para o MySQL: quando ele esta ligado, a resposta e instantanea.
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

# Diz se algum programa deste computador ja esta usando a porta.
# Pergunta direto ao Windows, sem tentar conectar, entao responde na hora
# (conectar numa porta fechada pode demorar ate o tempo limite).
function Porta-Em-Uso([int]$porta) {
    try {
        $escutas = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
        foreach ($escuta in $escutas) {
            if ($escuta.Port -eq $porta) { return $true }
        }
    } catch { }
    return $false
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

# Espaco livre (em MB) no disco da pasta. Devolve -1 se nao conseguir descobrir.
function Espaco-Livre-Mb([string]$pasta) {
    try {
        $raiz = [System.IO.Path]::GetPathRoot($pasta)
        $disco = New-Object System.IO.DriveInfo($raiz)
        return [int]($disco.AvailableFreeSpace / 1MB)
    } catch {
        return -1
    }
}

# Impressao digital do package-lock.json: muda quando o projeto ganha ou troca uma dependencia.
# Usa o .NET direto, porque o comando Get-FileHash nao existe em PowerShell mais antigo.
function Hash-Lock([string]$pasta) {
    $lock = Join-Path $pasta "package-lock.json"
    if (-not (Test-Path $lock)) { return "sem-lock" }

    try {
        $sha = [System.Security.Cryptography.SHA256]::Create()
        try {
            $bytes = [System.IO.File]::ReadAllBytes($lock)
            return ([System.BitConverter]::ToString($sha.ComputeHash($bytes))).Replace("-", "")
        } finally {
            $sha.Clear()
        }
    } catch {
        return "indisponivel"
    }
}

# Confere se TODAS as dependencias do package.json (dependencies e devDependencies)
# existem dentro de node_modules.
function Pacotes-Presentes([string]$pasta) {
    $pacote  = Join-Path $pasta "package.json"
    $modulos = Join-Path $pasta "node_modules"

    if (-not (Test-Path $pacote)) { return $false }

    try {
        $json = Get-Content -Path $pacote -Raw -Encoding UTF8 | ConvertFrom-Json
    } catch {
        return $false
    }

    foreach ($grupo in @($json.dependencies, $json.devDependencies)) {
        if ($null -eq $grupo) { continue }
        foreach ($item in $grupo.PSObject.Properties) {
            $arquivo = Join-Path $modulos (($item.Name -replace "/", "\") + "\package.json")
            if (-not (Test-Path $arquivo)) { return $false }
        }
    }
    return $true
}

# A instalacao so vale se: existe o marcador de "terminou com sucesso", o marcador
# bate com o package-lock.json atual e todas as dependencias estao presentes.
# Instalacao interrompida = sem marcador = o script refaz tudo.
function Dependencias-Completas([string]$pasta) {
    $marcador = Join-Path $pasta "node_modules\.instalado"
    if (-not (Test-Path $marcador)) { return $false }

    $salvo = Get-Content -Path $marcador -Raw -ErrorAction SilentlyContinue
    if ($null -eq $salvo) { return $false }
    if ($salvo.Trim() -ne (Hash-Lock $pasta)) { return $false }

    return (Pacotes-Presentes $pasta)
}

# Instala as dependencias de uma pasta (npm ci e mais rapido que npm install).
# Devolve 0 se deu tudo certo. So grava o marcador de sucesso no final.
# O '| Out-Host' mostra o texto do npm sem misturar com o valor que a funcao devolve
function Instalar-Dependencias([string]$pasta, [string]$nome) {
    Write-Host "Instalando as dependencias $nome (pode levar alguns minutos). Nao feche esta janela..." -ForegroundColor Cyan

    # Avisos de coisas que costumam estragar a instalacao
    if ($pasta -match "OneDrive") {
        Write-Host "Aviso: o projeto esta dentro do OneDrive. A sincronizacao pode corromper a instalacao; prefira uma pasta fora dele (ex.: C:\projetos)." -ForegroundColor Yellow
    }
    if ($PSScriptRoot.Length -gt 100) {
        Write-Host "Aviso: o caminho da pasta do projeto e muito longo. O Windows pode falhar ao criar arquivos; prefira algo curto (ex.: C:\projetos)." -ForegroundColor Yellow
    }

    $livre = Espaco-Livre-Mb $pasta
    if ($livre -ge 0 -and $livre -lt 1500) {
        Write-Host "Pouco espaco no disco: so $livre MB livres. Libere pelo menos 1,5 GB e tente de novo." -ForegroundColor Red
        return 1
    }

    # Tira o marcador antes: se a instalacao for interrompida, a proxima execucao refaz tudo
    Remove-Item -Path (Join-Path $pasta "node_modules\.instalado") -Force -ErrorAction SilentlyContinue

    $opcoes = @("--no-audit", "--no-fund", "--loglevel=error", "--fetch-retries=5", "--fetch-retry-mintimeout=2000")
    $codigo = 1

    Push-Location $pasta

    if (Test-Path "package-lock.json") {
        npm.cmd ci @opcoes | Out-Host
        $codigo = $LASTEXITCODE
    }
    if ($codigo -ne 0) {
        if (Test-Path "package-lock.json") {
            Write-Host "O 'npm ci' nao deu certo. Tentando de outro jeito (npm install)..." -ForegroundColor Yellow
        }
        npm.cmd install @opcoes | Out-Host
        $codigo = $LASTEXITCODE
    }

    Pop-Location

    if ($codigo -ne 0) { return $codigo }

    # O npm disse que deu certo: confere se esta tudo la mesmo antes de gravar o marcador
    if (-not (Pacotes-Presentes $pasta)) {
        Write-Host "O npm terminou, mas ainda faltam pacotes na pasta node_modules." -ForegroundColor Red
        return 1
    }

    Set-Content -Path (Join-Path $pasta "node_modules\.instalado") -Value (Hash-Lock $pasta) -Encoding ASCII
    return 0
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
Marcar "Windows, Node.js e npm conferidos"

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
Marcar "MySQL respondendo"

# ---------------------------------------------------------------------------
# 3. Portas livres
# ---------------------------------------------------------------------------

$portaApi = [int](Ler-Env $fonteEnv "PORT" "3000")

if (Porta-Em-Uso $portaApi) {
    Falhar @(
        "A porta $portaApi (API) ja esta em uso.",
        "Feche outras janelas deste projeto que estejam abertas (ou o programa que usa essa porta) e tente de novo."
    )
}
if (Porta-Em-Uso 4200) {
    Falhar @(
        "A porta 4200 (site) ja esta em uso.",
        "Feche outras janelas deste projeto que estejam abertas e tente de novo."
    )
}
Marcar "Portas livres"

# ---------------------------------------------------------------------------
# 4. Dependencias (so instala se estiver incompleto, interrompido ou desatualizado)
# ---------------------------------------------------------------------------

if (-not (Dependencias-Completas $PSScriptRoot)) {
    if ((Instalar-Dependencias $PSScriptRoot "do Angular") -ne 0) {
        Falhar @(
            "A instalacao do Angular falhou. Veja a mensagem acima.",
            "Causas comuns: sem internet, pouco espaco no disco, antivirus bloqueando arquivos,",
            "projeto dentro do OneDrive ou em um caminho muito longo.",
            "Feche outros programas que usem a pasta e rode o iniciar.cmd de novo: ele refaz a instalacao do zero."
        )
    }
    Marcar "Dependencias do Angular instaladas"
}

if (-not (Dependencias-Completas $pastaApi)) {
    if ((Instalar-Dependencias $pastaApi "da API") -ne 0) {
        Falhar @(
            "A instalacao da API falhou. Veja a mensagem acima.",
            "Causas comuns: sem internet, pouco espaco no disco ou antivirus bloqueando arquivos.",
            "Rode o iniciar.cmd de novo: ele refaz a instalacao do zero."
        )
    }
    Marcar "Dependencias da API instaladas"
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

# Olha a cada 0,2 s se a API ja abriu a porta (ate 30 s)
$apiPronta = $false
for ($i = 0; $i -lt 150; $i++) {
    if ($api.HasExited) { break }
    if (Porta-Em-Uso $portaApi) { $apiPronta = $true; break }
    Start-Sleep -Milliseconds 200
}

if (-not $apiPronta) {
    if (-not $api.HasExited) { Stop-Process -Id $api.Id -Force }
    Falhar @(
        "A API nao conseguiu iniciar. Leia a mensagem acima.",
        "Se o erro for de acesso negado ao MySQL, a senha esta errada:",
        "apague o arquivo backend\.env e rode o iniciar.cmd de novo para digitar a senha outra vez."
    )
}
Marcar "API pronta"

# ---------------------------------------------------------------------------
# 7. Sobe o servidor da IA, se der (sem ele o site abre, so sem a sugestao)
# ---------------------------------------------------------------------------

$servidor = $null
$exeIa = Join-Path $pastaIa "servidor.exe"

if (-not (Test-Path $exeIa)) {
    Write-Host "servidor.exe nao encontrado: o site abre, mas sem a sugestao da IA." -ForegroundColor Yellow
} elseif (-not [Environment]::Is64BitOperatingSystem) {
    Write-Host "O servidor da IA so roda em Windows de 64 bits: o site abre, mas sem a sugestao da IA." -ForegroundColor Yellow
} elseif (Porta-Em-Uso 8080) {
    Write-Host "A porta 8080 ja esta em uso (talvez a IA ja esteja aberta). Nao vou abrir outra." -ForegroundColor Yellow
} else {
    # Tira a marca de 'baixado da internet' dos arquivos da IA, para o Windows nao bloquear
    Get-ChildItem -Path (Join-Path $pastaIa "*") -Include "*.exe", "*.dll" -ErrorAction SilentlyContinue |
        Unblock-File -ErrorAction SilentlyContinue

    Write-Host "Iniciando o servidor da IA..." -ForegroundColor Cyan
    try {
        $servidor = Start-Process -FilePath $exeIa -WorkingDirectory $pastaIa `
            -NoNewWindow -PassThru -ErrorAction Stop

        # Se o programa for bloqueado ou nao conseguir abrir a porta, ele fecha quase na hora
        Start-Sleep -Milliseconds 500
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
Marcar "Servidor da IA conferido"

# ---------------------------------------------------------------------------
# 8. Sobe o site (Angular)
# ---------------------------------------------------------------------------

try {
    # Sobe o Angular direto pelo Node (mais rapido que passar pelo npx)
    Set-Location $PSScriptRoot
    Marcar "Tudo pronto. Agora o Angular vai compilar o site (e a etapa mais demorada)"
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