# 🚀 部署說明

## 📊 當前狀態

✅ GitHub 推送成功  
✅ Vercel 自動部署中  
✅ Logo 已添加到登入頁面  
✅ 管理後台已部署  

---

## 🔗 訪問鏈接

### 患者登入
```
https://your-vercel-url.vercel.app
```

### 管理後台
```
https://your-vercel-url.vercel.app/admin

用戶名：admin
密碼：admin123
```

---

## ⚙️ 下一步：初始化 Supabase 數據庫

### 1. 進入 Supabase Dashboard
https://supabase.com/dashboard

### 2. 選擇您的項目

### 3. 打開 SQL Editor
在左側菜單選擇 "SQL Editor"

### 4. 運行初始化腳本
- 點擊 "New Query"
- 複製 `/sql/init.sql` 的全部內容
- 粘貼到編輯器
- 點擊 "Run" 或按 Ctrl/Cmd + Enter

### 5. 驗證數據
運行以下查詢：
```sql
SELECT id, name, phone, case_number FROM patients;
```

應該看到 6 條記錄。

### 6. 重新部署 Vercel
- 回到 Vercel Dashboard
- Deployments → 最新部署 → ... → Redeploy

---

## 🧪 當前可用的測試方式

### 方式 1：使用模擬數據（當前）
- 即使連接了 Supabase，系統會自動使用 `lib/db-mock.ts` 的數據
- 所有測試賬號立即可用
- 無需配置數據庫

### 方式 2：使用真實數據庫（可選）
- 運行上述 Supabase 初始化步驟
- 數據持久化存儲
- 支持完整的 CRUD 操作

---

## 💡 智能回退機制

系統會按照以下順序嘗試獲取數據：

1. **檢查環境變量** `POSTGRES_URL`
   - ✅ 存在 → 嘗試連接數據庫
   - ❌ 不存在 → 使用模擬數據

2. **嘗試連接數據庫**
   - ✅ 成功 → 使用真實數據
   - ❌ 失敗 → 回退到模擬數據

3. **查詢數據**
   - ✅ 有數據 → 返回數據庫記錄
   - ❌ 空表 → 回退到模擬數據

這樣設計確保：
- 開發環境無需配置數據庫
- 線上環境數據庫未初始化時仍可測試
- 生產環境可以使用真實數據庫

---

## 📝 更新內容

### ✅ Logo 優化
- 香港衛生署 Logo 顯示在登入卡片頂部
- 標題改為「食物中毒調查問卷」
- 添加「Demo 演示平台」標籤
- 登入成功後不顯示 Logo（節省空間）

### ✅ 電話輸入優化
- Placeholder 改為：`例如：9123 4567`
- 提示文字：「請輸入 8 位數字（無需加區號 +852）」
- 按鈕文字改為「開始訪談」

### ✅ 文檔更新
- README 添加管理後台訪問說明
- README 添加數據庫回退機制說明
- TESTING.md 添加常見問題解答

---

**部署完成！** 🎉

