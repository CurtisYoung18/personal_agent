# 香港衛生署 - 食物中毒調查平台

基於 Next.js 的食物中毒個案訪談系統，整合 GPTBots AI Agent，支持患者身份驗證和數據管理。

---

## 🚀 快速開始

### 本地開發

```bash
# 安裝依賴
npm install

# 配置環境變量
cp .env.example .env.local
# 編輯 .env.local，添加 GPTBots API 配置

# 啟動開發服務器
npm run dev
```

訪問：http://localhost:3000

---

## 📋 功能特性

### ✅ 患者登入系統
- 電話號碼驗證（必須）
- 電郵驗證（可選）
- 自動記憶登入狀態

### ✅ GPTBots AI Agent 整合
- iframe 嵌入式對話界面
- 自動傳遞用戶屬性（user_id、email）
- 同步患者詳細信息到 GPTBots
- 個案編號、姓名、症狀等自動識別

### ✅ 管理後台
- 患者數據 CRUD 操作
- 搜索和篩選功能
- 個案進度追蹤

---

## 🗄️ 數據架構

### 患者信息表 (patients)

| 字段 | 類型 | 說明 |
|------|------|------|
| id | SERIAL | 主鍵 |
| case_number | VARCHAR | 個案編號 |
| name | VARCHAR | 姓名 |
| email | VARCHAR | 電郵（可選）|
| phone | VARCHAR | 電話號碼 |
| age | INTEGER | 年齡 |
| gender | VARCHAR | 性別 |
| occupation | VARCHAR | 職業 |
| event_location | TEXT | 事發地點 |
| event_date | DATE | 事發日期 |
| event_summary | TEXT | 事件摘要 |
| symptoms | JSONB | 症狀詳情 |
| onset_datetime | TIMESTAMP | 發病時間 |
| food_history | TEXT | 進食記錄 |
| notes | TEXT | 備註 |

---

## 🔧 環境變量

創建 `.env.local` 文件：

```env
# GPTBots 配置
GPTBOTS_API_KEY=your-api-key
GPTBOTS_ENDPOINT=sg

# 數據庫（Vercel/Supabase 自動配置）
POSTGRES_URL=your-database-url
```

---

## 📦 技術棧

- **框架**: Next.js 14
- **語言**: TypeScript
- **數據庫**: PostgreSQL (Supabase/Vercel Postgres)
- **樣式**: CSS Modules
- **AI 集成**: GPTBots API
- **部署**: Vercel

---

## 📚 項目結構

```
/
├── pages/
│   ├── index.tsx              # 患者登入頁面
│   ├── patient.tsx            # AI Agent 對話頁面
│   ├── admin/
│   │   ├── index.tsx          # 管理員登入
│   │   └── dashboard.tsx      # 管理後台
│   └── api/
│       ├── verify.ts          # 身份驗證 API
│       ├── patient.ts         # 患者信息 API
│       ├── sync-properties.ts # GPTBots 屬性同步
│       └── admin/
│           └── patients.ts    # 患者 CRUD API
├── lib/
│   └── db-mock.ts             # 本地開發模擬數據
├── sql/
│   └── init.sql               # 數據庫初始化腳本
└── styles/
    └── globals.css            # 全局樣式
```

---

## 🔑 訪問路徑

### 患者登入頁面
```
線上：https://your-vercel-url.vercel.app
本地：http://localhost:3000
```

### 管理後台
```
線上：https://your-vercel-url.vercel.app/admin
本地：http://localhost:3000/admin

登入憑證：
用戶名：admin
密碼：admin123
```

---

## 🗄️ 數據庫說明

### 本地開發
- 使用 `lib/db-mock.ts` 中的模擬數據
- 無需配置數據庫，開箱即用
- 包含 6 個測試患者數據

### 線上部署（Vercel/Supabase）
- 需要配置 `POSTGRES_URL` 環境變量
- 使用 `sql/init.sql` 初始化數據庫
- 如果未初始化數據庫，系統會自動回退到模擬數據

**重要**：如果您已連接 Supabase 但尚未運行 `sql/init.sql`，系統仍會使用本地模擬數據，因此測試賬號仍然有效。

---

## 🧪 測試

詳見 [TESTING.md](./TESTING.md)

---

## 📞 支援

如有問題，請聯繫開發團隊。

---

## 📄 許可證

© 2025 香港衛生署. All rights reserved.
