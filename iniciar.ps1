# Pasta da IA: fica dentro deste projeto, ao lado deste arquivo
$pastaIa = Join-Path $PSScriptRoot "minha-ia"

# Confere se o Node.js esta instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js nao encontrado. Instale em https://nodejs.org e abra um novo terminal." -ForegroundColor Red
    exit 1
}

# Primeira vez neste PC: instala as dependencias do Angular
if (-not (Test-Path (Join-Path $PSScriptRoot "node_modules"))) {
    Write-Host "Instalando as dependencias (so na primeira vez)..." -ForegroundColor Cyan
    Push-Location $PSScriptRoot
    npm.cmd install
    $codigo = $LASTEXITCODE
    Pop-Location
    if ($codigo -ne 0) {
        Write-Host "O npm install falhou. Veja a mensagem acima." -ForegroundColor Red
        exit 1
    }
}

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
    # Quando o Angular parar (Ctrl + C), derruba o servidor da IA tambem
    if ($servidor -and -not $servidor.HasExited) {
        Stop-Process -Id $servidor.Id -Force
        Write-Host "Servidor da IA encerrado." -ForegroundColor Cyan
    }
}