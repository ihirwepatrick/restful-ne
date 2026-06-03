# Stop TZW dev servers (client + API ports)
$ports = @(3000, 3001, 4000, 4001, 4002, 4003, 4004)

Write-Host "Stopping processes on ports: $($ports -join ', ')..."
foreach ($port in $ports) {
    Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        ForEach-Object {
            $procId = $_.OwningProcess
            if ($procId -and $procId -ne 0) {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Write-Host "  Stopped PID $procId on port $port"
            }
        }
}

Start-Sleep -Seconds 2
Write-Host "Done. Start again with: npm start"
