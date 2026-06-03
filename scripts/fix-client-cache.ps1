# Stop Next dev on port 3000 and wipe client/.next (fixes MODULE_NOT_FOUND chunk errors)
$root = Split-Path -Parent $PSScriptRoot
$nextDir = Join-Path $root "client\.next"
$cacheDir = Join-Path $nextDir "cache"

Write-Host "Stopping processes on port 3000..."
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
    ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }

Start-Sleep -Seconds 2

if (Test-Path $nextDir) {
    Write-Host "Removing $nextDir ..."
    Remove-Item -Recurse -Force $nextDir -ErrorAction SilentlyContinue
    Write-Host "Done. Run: npm start  (or npm run dev:client)"
} else {
    Write-Host "No .next folder found. Run: npm start"
}
