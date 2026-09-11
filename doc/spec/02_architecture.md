# 系統規格規格書 — 第二章：系統架構與技術棧 (Architecture & Tech Stack)

## 2.1 技術棧 (Technology Stack)

| 層級 (Layer) | 技術項目 (Technology) | 版本 / 說明 |
| :--- | :--- | :--- |
| **前端核心 (Core)** | React + TypeScript | React 19 / TypeScript 5.8 |
| **建構工具 (Build Tool)** | Vite | Vite 6.2 |
| **樣式系統 (Styling)** | Tailwind CSS | Tailwind v4 (搭配 `@tailwindcss/vite`) |
| **圖示集 (Icons)** | Lucide React | Lucide Icons v0.546 |
| **字型 (Typography)** | Google Fonts | Marcellus (標題/展示) & Josefin Sans (內文) |
| **動態效果 (Animation)** | Motion (Framer Motion) | Motion v12 |
| **狀態管理 (State)** | React Context API | `AppContext` 全局狀態中心 |

## 2.2 目錄結構 (Directory Structure)

```
20260911_coding_sample/
├── .env                  # 本地端環境變數
├── .env.example          # 環境變數範本
├── AGENTS.md             # AI 助手與開發協作規範
├── DESIGN.md             # 視覺設計與 UI/UX 系統規範
├── README_LOCAL.md       # 本地執行說明文件
├── doc/                  # 專案文檔目錄
│   ├── dev/              # 開發階段計畫 (plan_<功能名稱>.md)
│   └── spec/             # 系統功能規格書 (分章節)
├── index.html            # 主入口 HTML
├── package.json          # 專案依賴與腳本設定
├── start.bat / start.ps1 # 伺服器啟動腳本 (CMD / PowerShell)
├── stop.bat / stop.ps1   # 伺服器關閉腳本 (CMD / PowerShell)
├── tsconfig.json         # TypeScript 設定檔
├── vite.config.ts        # Vite 建置與 Server 設定檔
└── src/
    ├── App.tsx           # 主視圖與 Modal 佈局
    ├── main.tsx          # React 掛載點
    ├── index.css         # 全域樣式與 Art Deco 主題設定
    ├── types.ts          # 資料結構與 TypeScript 介面定義
    ├── mockData.ts       # 初始化展示資料
    ├── components/       # UI 元件庫 (Kanban, Gantt, RFI, Drawer...)
    └── context/          # 全域狀態管理 (AppContext.tsx)
```
