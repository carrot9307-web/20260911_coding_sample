# Windows PowerShell 伺服器啟動腳本
Write-Host "===================================================" -ForegroundColor Gold
Write-Host "  啟動本地開發伺服器 (Local Development Server)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Gold
Write-Host ""

# 1. 檢查 node_modules
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "[提示] 偵測到尚未安裝依賴套件 (node_modules)..." -ForegroundColor Yellow
    Write-Host "[執行] 正在安裝項目 dependencies (npm install)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[錯誤] 套件安裝失敗，請檢查環境與網路連線。" -ForegroundColor Red
        Read-Host -Prompt "按 Enter 鍵結束"
        exit
    }
}

# 2. 檢查 Port 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "[警告] 伺服器目前已在運行中！" -ForegroundColor Yellow
    Write-Host "[網址] 請直接訪問：http://localhost:3000" -ForegroundColor Green
    Read-Host -Prompt "按 Enter 鍵結束"
    exit
}

# 3. 啟動 Vite 開發伺服器
Write-Host "[執行] 正在啟動伺服器..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command npm run dev" -WindowStyle Minimized

Write-Host "[等待] 伺服器初始化中..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host "[成功] 伺服器已成功啟動！" -ForegroundColor Green
Write-Host "[網址] 請於瀏覽器開啟：http://localhost:3000" -ForegroundColor Green
Write-Host "[關閉] 如需關閉伺服器，請執行 .\stop.ps1 或 stop.bat" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Gold
