# AGENTS.md — AI 助手開發協作與開發流程規範

本文件為 AI 助手 (AI Agents) 與開發團隊在維護與擴充本專案時必須嚴格遵守的規範與工作流程。

---

## 1. 核心開發流程與文檔規範 (Development Workflow & Documentation)

任何新功能開發或重大重構，必須遵循以下「**討論 -> 計畫 -> 執行 -> 歸檔規格**」四步驟流程：

### 步驟一：討論與擬定計畫
在撰寫任何程式碼前，AI 助手必須先與使用者討論確認需求細節。討論達成共識後，於 `doc/dev/` 資料夾下建立開發計畫文件，命名格式必須為：
```
doc/dev/plan_<功能名稱>.md
```
*範例：`doc/dev/plan_export_pdf.md`、`doc/dev/plan_local_server_refactor.md`*

### 步驟二：參照計畫執行開發
開發過程中必須隨時參照 `doc/dev/plan_<功能名稱>.md` 所規劃的變更檔案清單與驗證步驟進行開發，確保不遺漏需求且不引入 Side Effects。

### 步驟三：功能驗證
開發完成後，必須執行 `npm run lint` 與 `npm run build` 確定程式碼品質無誤，並進行實機功能測試。

### 步驟四：寫回規格書 (Spec Documentation)
功能驗證無誤後，必須將實作結果與規格變更更新寫回 `doc/spec/` 目錄下的分章節規格文件中：
- `doc/spec/01_overview.md` (系統概述)
- `doc/spec/02_architecture.md` (系統架構與技術棧)
- `doc/spec/03_features.md` (功能模組詳細規格)
- `doc/spec/04_server_control.md` (伺服器控制與運營規格)
- 若新增重大獨立模組，可擴充建立新章節（如 `doc/spec/05_<模組名稱>.md`）。

---

## 2. 程式碼規範與技術要求 (Coding Standards)

1. **跨平台相容性 (Cross-Platform Compatibility)**：
   - 專案主要運行於 Windows 本地環境。`package.json` 腳本不得包含 Linux 專用命令（如 `rm -rf`），應優先使用 Node.js 內建跨平台方法。
   - 保留與維護 `start.bat` / `stop.bat` / `start.ps1` / `stop.ps1` 伺服器控制腳本。

2. **設計系統一致性 (Design Consistency)**：
   - 所有 UI 改動必須遵循 [DESIGN.md](file:///c:/Users/asus/Documents/新增資料夾/20260911_coding_sample/DESIGN.md) 記載之 Art Deco 蓋茨比主題風格。
   - 使用指定之色彩 Token (`#0A0A0A`, `#141414`, `#D4AF37`, `#F2F0E4`) 及字型 (`Marcellus`, `Josefin Sans`)。

3. **TypeScript 型別嚴謹性**：
   - 所有的資料模型變更均需更新 `src/types.ts`，禁止隨意使用 `any` 型別。
