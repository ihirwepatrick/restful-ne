# Start Docker + all TZW services in the current terminal (Cursor-friendly)
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Starting Docker containers..."
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker compose failed. Is Docker running?"
    exit 1
}

Write-Host "Waiting for databases..."
Start-Sleep -Seconds 3

$nextDir = Join-Path $root "client\.next"
if (Test-Path $nextDir) {
    Write-Host "Clearing Next.js cache (client\.next)..."
    Remove-Item -Recurse -Force $nextDir -ErrorAction SilentlyContinue
}

Write-Host "Starting all services in this terminal (Ctrl+C to stop)..."
npm run dev:all
