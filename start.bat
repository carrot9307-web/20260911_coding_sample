@echo off
chcp 65001 >nul
echo ===================================================
echo   啟動本地開發伺服器 (Local Development Server)
echo ===================================================
echo.

REM 1. 檢查 node_modules 是否存在
if not exist node_modules (
    echo [提示] 偵測到尚未安裝依賴套件 node_modules...
    echo [執行] 正在安裝項目 dependencies npm install...
    call npm install
    if errorlevel 1 (
        echo [錯誤] 套件安裝失敗，請檢查 npm 環境與網路連線。
        pause
        exit /b 1
    )
    echo [完成] 套件安裝完成！
    echo.
)

REM 2. 檢查埠號 3000 是否已被佔用
netstat -aon | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel%==0 (
    echo [警告] 伺服器目前已在運行中！
    echo [網址] 請直接訪問：http://localhost:3000
    echo [說明] 若要重新啟動，請先執行 stop.bat 關閉伺服器。
    echo ===================================================
    pause
    exit /b
)

REM 3. 啟動 Vite 開發伺服器
echo [執行] 正在啟動伺服器...
start "DevServer-Port3000" /min cmd /k "npm run dev"

REM 4. 等待伺服器啟動並檢查
echo [等待] 伺服器初始化中...
ping -n 4 127.0.0.1 >nul

echo [成功] 伺服器已成功啟動！
echo [網址] 請於瀏覽器開啟：http://localhost:3000
echo [關閉] 如需關閉伺服器，請執行 stop.bat
echo ===================================================
pause

