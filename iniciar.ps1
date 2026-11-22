# Pastas deste projeto
$pastaIa  = Join-Path $PSScriptRoot "minha-ia"
$pastaApi = Join-Path $PSScriptRoot "backend"

# Confere se o Node.js esta instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js nao encontrado. Instale em https://nodejs.org e abra um novo terminal." -ForegroundColor Red
    exit 1
}

# Primeira vez neste PC: instala as dependencias do Angular
if (-not (Test-Path (Join-Path $PSScriptRoot "node_modules"))) {
    Write-Host "Instalando as dependencias do Angular (so na primeira vez)..." -ForegroundColor Cyan
    Push-Location $PSScriptRoot
    npm.cmd install
    $codigo = $LASTEXITCODE
    Pop-Location
    if ($codigo -ne 0) {
        Write-Host "O npm install falhou. Veja a mensagem acima." -ForegroundColor Red
        exit 1
    }
}

# Primeira vez neste PC: instala as dependencias da API
if (-not (Test-Path (Join-Path $pastaApi "node_modules"))) {
    Write-Host "Instalando as dependencias da API (so na primeira vez)..." -ForegroundColor Cyan
    Push-Location $pastaApi
    npm.cmd install
    $codigo = $LASTEXITCODE
    Pop-Location
    if ($codigo -ne 0) {
        Write-Host "O npm install da API falhou. Veja a mensagem acima." -ForegroundColor Red
        exit 1
    }
}

# Confere o arquivo .env com a senha do MySQL
if (-not (Test-Path (Join-Path $pastaApi ".env"))) {
    Copy-Item (Join-Path $pastaApi ".env.example") (Join-Path $pastaApi ".env")
    Write-Host "Criei o arquivo backend\.env." -ForegroundColor Yellow
    Write-Host "Abra esse arquivo, coloque a senha do seu MySQL em DB_PASSWORD e rode de novo." -ForegroundColor Yellow
    exit 1
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
    # Sobe o Angular na pasta deste projeto
    Set-Location $PSScriptRoot
    Write-Host "Iniciando o Angular..." -ForegroundColor Cyan
    npx.cmd ng serve
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