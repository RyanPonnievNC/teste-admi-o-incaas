# Inicia o sistema: API (banco de dados), servidor da IA e site (Angular).
# Na primeira vez instala tudo e pergunta a senha do MySQL, tudo na mesma execucao.
# Depois disso abre direto.

# Pastas deste projeto
$pastaIa  = Join-Path $PSScriptRoot "minha-ia"
$pastaApi = Join-Path $PSScriptRoot "backend"

# Deixa o npm e o Angular mais rapidos e sem perguntas ou avisos de atualizacao
$env:NG_CLI_ANALYTICS           = "false"
$env:NPM_CONFIG_UPDATE_NOTIFIER = "false"
$env:NPM_CONFIG_AUDIT           = "false"
$env:NPM_CONFIG_FUND            = "false"

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

# Confere se o Node.js esta instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js nao encontrado. Instale em https://nodejs.org e abra um novo terminal." -ForegroundColor Red
    exit 1
}

# Primeira vez neste PC: dependencias do Angular
if (-not (Test-Path (Join-Path $PSScriptRoot "node_modules"))) {
    if ((Instalar-Dependencias $PSScriptRoot "do Angular") -ne 0) {
        Write-Host "A instalacao do Angular falhou. Veja a mensagem acima." -ForegroundColor Red
        exit 1
    }
}

# Primeira vez neste PC: dependencias da API
if (-not (Test-Path (Join-Path $pastaApi "node_modules"))) {
    if ((Instalar-Dependencias $pastaApi "da API") -ne 0) {
        Write-Host "A instalacao da API falhou. Veja a mensagem acima." -ForegroundColor Red
        exit 1
    }
}

# Configura o banco de dados (MySQL) perguntando a senha, sem precisar abrir arquivo
$arquivoEnv = Join-Path $pastaApi ".env"
$modeloEnv  = Join-Path $pastaApi ".env.example"
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

    $linhas = foreach ($linha in Get-Content $origem) {
        if ($linha -match "^DB_PASSWORD=") { $linhaSenha } else { $linha }
    }

    # Grava sem BOM, para a API conseguir ler o arquivo
    [System.IO.File]::WriteAllLines($arquivoEnv, [string[]]$linhas, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "Configuracao salva em backend\.env." -ForegroundColor Green
}

# Sobe a API (banco de dados)
Write-Host "Iniciando a API (banco de dados)..." -ForegroundColor Cyan
$api = Start-Process -FilePath "node" -ArgumentList "server.js" `
    -WorkingDirectory $pastaApi -NoNewWindow -PassThru

# Sobe o servidor da IA, se ele existir (sem ele o site abre, so sem a sugestao)
$servidor = $null
if (Test-Path "$pastaIa\servidor.exe") {
    Write-Host "Iniciando o servidor da IA..." -ForegroundColor Cyan
    $servidor = Start-Process -FilePath "$pastaIa\servidor.exe" `
        -WorkingDirectory $pastaIa -NoNewWindow -PassThru
} else {
    Write-Host "servidor.exe nao encontrado: o site abre, mas sem a sugestao da IA." -ForegroundColor Yellow
}

try {
    # Sobe o Angular direto pelo Node (mais rapido que passar pelo npx)
    Set-Location $PSScriptRoot
    Write-Host "Iniciando o Angular..." -ForegroundColor Cyan

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
