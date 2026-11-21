# Pasta da IA: fica dentro deste projeto, ao lado deste arquivo
$pastaIa = Join-Path $PSScriptRoot "minha-ia"

# Confere se o servidor da IA foi compilado
if (-not (Test-Path "$pastaIa\servidor.exe")) {
    Write-Host "Nao achei $pastaIa\servidor.exe. Compile o servidor primeiro (veja minha-ia\README.md)." -ForegroundColor Red
    exit 1
}

# Sobe o servidor da IA neste mesmo terminal (na pasta dele, para achar dados\modelo.txt)
Write-Host "Iniciando o servidor da IA..." -ForegroundColor Cyan
$servidor = Start-Process -FilePath "$pastaIa\servidor.exe" `
    -WorkingDirectory $pastaIa -NoNewWindow -PassThru

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
    }
    Write-Host "Servidor da IA encerrado." -ForegroundColor Cyan
}