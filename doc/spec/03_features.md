# 系統規格規格書 — 第三章：核心功能模組 (Core Features & Modules)

## 3.1 看板任務管理 (Kanban Board)
- **多欄位管理**：預設包含「待處理 (Backlog)」、「進行中 (In Progress)」、「審核中 (Review)」、「已完成 (Done)」，支援新增/修改/刪除欄位與欄位排序。
- **卡片操作**：支援拖曳移動欄位、設定優先級 (High, Medium, Low)、指派負責人、設定到期日與新增標籤。
- **詳細內容 Modal**：可檢視與新增評論、上傳與預覽附件（支援圖片 Lightbox 放大與貼上上傳）。

## 3.2 甘特圖時程檢視 (Gantt Chart)
- 視覺化呈獻各任務的時間跨度與交期，支援以月/週/日檢視。

## 3.3 RFI 請示單追蹤系統 (RFI Tracker)
- **單據流轉**：支援草稿 (DRAFT) -> 提出 (OPEN) -> 已回覆 (ANSWERED) -> 已關閉 (CLOSED) 狀態流轉。
- **官方答覆機制**：專案管理員可對請示填寫決議答覆。
- **一鍵生成任務**：可將已有答覆之 RFI 請示直接轉化為看板可執行的 Task。

## 3.4 模擬 API 控制台 (ApiConsoleDrawer)
- 視覺化端點除錯主機，支援測試 Auth、Kanban、RFI 與 Media 上傳端點，實時紀錄 Request/Response 日誌與回應延遲。

## 3.5 權限控制 (RBAC)
- 提供 Admin, Manager, Engineer, Inspector 等多角色切換體驗不同操作權限。
