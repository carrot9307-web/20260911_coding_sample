# 系統規格規格書 — 第四章：伺服器控制與本地執行 (Server Control & Local Execution)

## 4.1 規格簡介
為利開發者與使用者於 Windows 本地環境輕易執行與營運本系統，專案提供雙擊式 CMD 與 PowerShell 控制腳本，消弭平台相容性問題。

## 4.2 腳本與規格對照表

| 腳本名稱 | 適用環境 | 核心功能 |
| :--- | :--- | :--- |
| `start.bat` | Windows CMD | 檢查 `node_modules`（自動 npm install）、檢查 Port 3000、啟動 Vite 背景進程 |
| `stop.bat` | Windows CMD | 自動搜尋 Port 3000 LISTENING 進程 PID，強制 `taskkill` 釋放 Port 3000 |
| `start.ps1` | PowerShell | 同 `start.bat` 之 PowerShell 實作版本 |
| `stop.ps1` | PowerShell | 透過 `Get-NetTCPConnection` 與 `Stop-Process` 強制結束 Port 3000 進程 |

## 4.3 執行流程邏輯

### 4.3.1 啟動流程 (Startup Flow)
```
[雙擊 start.bat / start.ps1]
        │
        ▼
[檢查 node_modules 目錄是否存在？]
  ├── 否 ──> 執行 npm install 安裝套件
  └── 是 ──> 繼續
        │
        ▼
[檢查 Port 3000 是否已被佔用？]
  ├── 是 ──> 提示已在運行，引導至 http://localhost:3000
  └── 否 ──> 繼續
        │
        ▼
[背景啟動 Vite 開發伺服器 (npm run dev)]
        │
        ▼
[完成啟動，顯示提示網址 http://localhost:3000]
```

### 4.3.2 關閉流程 (Shutdown Flow)
```
[雙擊 stop.bat / stop.ps1]
        │
        ▼
[偵測佔用 Port 3000 且狀態為 LISTENING 之進程 PID]
  ├── 未找到 ──> 提示無運作中之伺服器
  └── 找到 PID ──> 強制終止該 PID (taskkill / Stop-Process) ──> 顯示釋放成功
```
