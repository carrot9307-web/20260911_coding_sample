# 開發計畫：本地端伺服器重構與控制腳本

- **建立時間**：2026-09-11
- **功能名稱**：本地端伺服器重構與啟動/關閉腳本 (local_server_refactor)
- **狀態**：已完成 (Completed)

---

## 1. 開發目標 (Goal)
將原先於雲端環境 (如 Google Cloud Run / AI Studio) 運行的 React + Vite 專案重構為適合本地 Windows 環境獨立執行的版本，解決跨平台指令不相容問題，並提供雙擊即可執行的啟動與關閉伺服器腳本。

---

## 2. 討論與設計細節 (Discussion & Design)

### 2.1 跨平台相容性重構
- 原 `package.json` 中的 `"clean"` 指令為 Linux 原生指令 `rm -rf dist server.js`，在 Windows CMD/PowerShell 執行時會報錯。
- **解決方案**：替換為 Node.js 原生內建模組指令 `node --input-type=module -e "import fs from 'fs'; fs.rmSync('dist', {recursive: true, force: true});"`，達到無依賴且跨平台。

### 2.2 本地環境變數管理
- 建立 `.env` 檔案，補足 `.env.example` 所需設定。
- 指定本地 `APP_URL="http://localhost:3000"` 與 `PORT=3000`。

### 2.3 伺服器啟動與關閉腳本
- 需求：使用者需能一鍵啟動與關閉伺服器，無須手動輸入複雜 command。
- 腳本規劃：
  - `start.bat` & `start.ps1`：
    1. 自動檢查 `node_modules` 是否存在，若無則自動執行 `npm install`。
    2. 自動檢查 Port 3000 是否已被佔用（若已被佔用則提醒使用者並開啟瀏覽器存取 `http://localhost:3000`）。
    3. 以背景最小化視窗啟動 Vite 開發伺服器。
  - `stop.bat` & `stop.ps1`：
    1. 透過 `netstat` (CMD) 或 `Get-NetTCPConnection` (PowerShell) 自動偵測佔用 Port 3000 的進程 PID。
    2. 強制結束該 PID 進程並釋放 Port 3000。

---

## 3. 變更檔案清單 (Proposed Changes)
- [MODIFY] `package.json`
- [NEW] `.env`
- [NEW] `start.bat`
- [NEW] `stop.bat`
- [NEW] `start.ps1`
- [NEW] `stop.ps1`
- [NEW] `README_LOCAL.md`

---

## 4. 驗證記錄 (Verification)
- [x] `package.json` 腳本修正完成。
- [x] `.env` 設定檔建立完成。
- [x] `start.bat` / `stop.bat` 語法與邏輯測試通過。
- [x] `start.ps1` / `stop.ps1` 語法與邏輯測試通過。
- [x] 成功將成果寫回 `doc/spec/04_server_control.md` 規格文件。
