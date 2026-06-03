# Stop Next dev on port 3000 and wipe client/.next (fixes MODULE_NOT_FOUND chunk errors)
$root = Split-Path -Parent $PSScriptRoot
$nextDir = Join-Path $root "client\.next"

Write-Host "Stopping processes on port 3000..."
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
    ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }

Start-Sleep -Seconds 1

if (Test-Path $nextDir) {
    Write-Host "Removing $nextDir ..."
    Remove-Item -Recurse -Force $nextDir
    Write-Host "Done. Run .\scripts\start-all.ps1 or: cd client; npm run dev"
} else {
    Write-Host "No .next folder found. Start dev with: cd client; npm run dev"
}
