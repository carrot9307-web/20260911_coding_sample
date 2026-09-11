@echo off
chcp 65001 >nul
echo ===================================================
echo   關閉本地開發伺服器 (Stop Local Server)
echo ===================================================
echo.

set FOUND=0

REM 搜尋所有佔用 3000 埠號且處於 LISTENING 狀態的 PID 並強制關閉
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    set FOUND=1
    echo [執行] 找到佔用 3000 埠號之進程 (PID: %%a)，正在強制關閉...
    taskkill /F /PID %%a >nul 2>&1
)

if %FOUND%==1 (
    echo [成功] 伺服器已順利關閉，Port 3000 已釋放。
) else (
    echo [提示] 目前沒有偵測到在 Port 3000 運行的伺服器。
)

echo ===================================================
pause
