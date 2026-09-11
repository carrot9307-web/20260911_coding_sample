# Windows PowerShell 伺服器關閉腳本
Write-Host "===================================================" -ForegroundColor Gold
Write-Host "  關閉本地開發伺服器 (Stop Local Server)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Gold
Write-Host ""

$connections = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

if ($connections) {
    foreach ($conn in $connections) {
        $pidNum = $conn.OwningProcess
        Write-Host "[執行] 找到佔用 Port 3000 之進程 (PID: $pidNum)，正在強制關閉..." -ForegroundColor Cyan
        Stop-Process -Id $pidNum -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[成功] 伺服器已順利關閉，Port 3000 已釋放。" -ForegroundColor Green
} else {
    Write-Host "[提示] 目前沒有偵測到在 Port 3000 運行的伺服器。" -ForegroundColor Yellow
}

Write-Host "===================================================" -ForegroundColor Gold
Read-Host -Prompt "按 Enter 鍵結束"
