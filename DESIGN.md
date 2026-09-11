# DESIGN.md — 專案設計系統與視覺規範 (Art Deco Gatsby Edition)

## 1. 視覺設計理念 (Design Philosophy)

本專案採用 **Art Deco (裝飾風藝術 / 大亨小傳風)** 設計風格，展現兼具歷史典雅與當代科技感的奢華視覺體驗。
設計原則強調幾何對稱線條、高對比金屬質感、深色夜空背景與精緻的微互動動畫。

---

## 2. 色彩系統 (Color Palette & Tokens)

### 2.1 主色調 (Primary Colors)
- **Deep Black Background**: `#0A0A0A` — 主背景色，展現神秘沉穩基底
- **Card Container Gray**: `#141414` / `#1E1E1E` — 元件卡片與 Modal 背景
- **Art Deco Gold**: `#D4AF37` — 奢華金，主要外框、強調標籤、焦點按鈕
- **Warm Champagne**: `#F3E5AB` — 淡金色，懸停與高亮狀態
- **Ivory Cream Text**: `#F2F0E4` — 主要文字顏色，高對比易讀性

### 2.2 狀態與輔助色 (Status Colors)
- **Navy Accent**: `#1E3D59` — 導覽列與對比按鈕背景
- **Emerald Green (Completed)**: `#17B978` — 已完成/已解決狀態
- **Crimson Red (High Priority / Overdue)**: `#E74C3C` / `#D9534F` — 高優先級與超期提醒
- **Amber Warning**: `#F39C12` — 審核中/待請示狀態

---

## 3. 字型排版規範 (Typography)

本專案透過 Google Fonts 導入雙主字型：

1. **Display / Headings**: `Marcellus`, serif
   - 用於系統標題、Modal 大標題、金屬質感 Logo 與關鍵數字統計。
2. **Body / Interface**: `Josefin Sans`, sans-serif
   - 用於內文、按鈕、表格、卡片敘述，字距稍微拉開 (`tracking-wider` 或 `tracking-widest`) 以展現古典線條感。

---

## 4. UI 視覺元件特徵 (Visual Components)

### 4.1 金屬微光邊框 (Gold Border & Glow)
- 使用 `border border-[#D4AF37]/30` 搭配微弱發光效果 `glow-gold` (`box-shadow: 0 0 15px rgba(212, 175, 55, 0.2)`).

### 4.2 菱形與對角幾何 (Geometric Elements)
- 圖示與徽章採用 `rotate-45` 菱形切割，並在內部將圖示與文字 `-rotate-45` 導正，創造典型的 Art Deco 幾何標誌。

### 4.3 滿版藝術底圖 (Art Deco Pattern Background)
- 背景加入全域 SVG 幾何紋理點綴，使頁面滾動時呈現細緻的立體幾何漸層。

---

## 5. 互動與微動畫 (Interactions & Micro-animations)

- **Hover Effects**: 所有可點擊元素滑鼠懸停時增加金色光澤與邊框亮化 (`hover:border-[#D4AF37] hover:text-[#D4AF37]`).
- **Modal Transitions**: Modal 與 Drawer 開啟時採用 Fade-In 與 Slide-In 效果。
- **Toast Notifications**: 底部跳出式通知採用金色幾何邊框外框與慢速淡入動畫。
