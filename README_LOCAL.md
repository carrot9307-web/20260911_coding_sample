# 專案本地端執行說明指南 (Local Execution Guide)

本專案已完成本地開箱即用重構。您可以透過專案根目錄下的腳本在 Windows 電腦上輕鬆啟動與關閉伺服器。

---

## 🚀 快速啟動伺服器 (Start Server)

### 方法一：使用批次檔 (CMD / 推薦)
直接雙擊執行專案根目錄下的 **`start.bat`**。

### 方法二：使用 PowerShell 腳本
在 PowerShell 中執行：
```powershell
.\start.ps1
```

### 方法三：使用 npm 指令
```bash
npm run start
```

> **說明**：
> - 啟動腳本會自動檢查並安裝 `node_modules` (若尚未安裝)。
> - 伺服器啟動成功後，請於瀏覽器開啟：`http://localhost:3000`

---

## 🛑 關閉伺服器 (Stop Server)

### 方法一：使用批次檔 (CMD / 推薦)
直接雙擊執行專案根目錄下的 **`stop.bat`**。

### 方法二：使用 PowerShell 腳本
在 PowerShell 中執行：
```powershell
.\stop.ps1
```

### 方法三：使用 npm 指令
```bash
npm run stop
```

> **說明**：
> - 關閉腳本會自動尋找佔用 Port 3000 的進程並將其關閉，釋放通訊埠。

---

## 📁 專案架構與開發規範
- 系統設計規格：[DESIGN.md](file:///c:/Users/asus/Documents/新增資料夾/20260911_coding_sample/DESIGN.md)
- AI 開發協作規範：[AGENTS.md](file:///c:/Users/asus/Documents/新增資料夾/20260911_coding_sample/AGENTS.md)
- 開發計畫歷史：`doc/dev/plan_<功能名稱>.md`
- 系統分章規格書：`doc/spec/`
