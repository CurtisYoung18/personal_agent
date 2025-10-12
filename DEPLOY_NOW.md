# 🚀 立即部署指南

## ✅ 準備工作已完成

- ✅ Git 倉庫已初始化
- ✅ 代碼已提交
- ✅ 遠程地址已配置

---

## 📋 部署步驟（10分鐘完成）

### 第一步：在 GitHub 創建倉庫（2分鐘）

1. **打開瀏覽器訪問**：  
   https://github.com/new

2. **填寫倉庫信息**：
   - Repository name: `HP_HK`
   - Description: `香港衛生防護中心患者身份驗證系統 - 食物中毒案例調查`
   - Visibility: `Private`（建議）或 `Public`
   - **不要勾選** "Add a README file"
   - **不要勾選** "Add .gitignore"
   - **不要勾選** "Choose a license"

3. **點擊 "Create repository"**

4. **創建成功後，回到這裡繼續下一步** ⬇️

---

### 第二步：推送代碼到 GitHub（1分鐘）

倉庫創建成功後，在終端運行：

```bash
git push -u origin main
```

**如果需要登入 GitHub**：
- 輸入您的 GitHub 用戶名：`CurtisYoung18`
- 密碼：使用 Personal Access Token（不是密碼）

**如果沒有 Token**，快速創建：
1. 訪問：https://github.com/settings/tokens
2. 點擊 "Generate new token (classic)"
3. 勾選 `repo` 權限
4. 複製 Token 並使用它作為密碼

---

### 第三步：部署到 Vercel（3分鐘）

#### 方式一：通過 Vercel 網站（推薦）

1. **訪問 Vercel**：  
   https://vercel.com/new

2. **選擇 GitHub 倉庫**：
   - 點擊 "Import Git Repository"
   - 選擇 `CurtisYoung18/HP_HK`
   - 如果沒看到，點擊 "Adjust GitHub App Permissions"

3. **配置項目**：
   - Project Name: `hp-hk` 或您喜歡的名稱
   - Framework Preset: `Next.js`（自動檢測）
   - Root Directory: `./`
   - Build Command: `npm run build`（自動填充）
   - Output Directory: `.next`（自動填充）

4. **點擊 "Deploy"**

5. **等待部署完成**（約2-3分鐘）

---

### 第四步：配置 Vercel 環境變量（2分鐘）

部署完成後：

1. **進入項目設置**：
   - 點擊項目名稱
   - 選擇 "Settings" 標籤
   - 選擇 "Environment Variables"

2. **添加 GPTBots API 配置**：

   **第一個變量**：
   - Name: `GPTBOTS_API_KEY`
   - Value: `app-6nY4BK9TyrsrKKXAtk0LeYNc`
   - Environment: 選擇所有（Production, Preview, Development）
   - 點擊 "Save"

   **第二個變量**：
   - Name: `GPTBOTS_ENDPOINT`
   - Value: `sg`
   - Environment: 選擇所有
   - 點擊 "Save"

3. **重新部署**（使環境變量生效）：
   - 返回 "Deployments" 標籤
   - 點擊最新的部署
   - 點擊右上角三個點 "..."
   - 選擇 "Redeploy"
   - 確認

---

### 第五步：配置 Vercel Postgres 數據庫（3分鐘）

1. **在 Vercel 項目中**：
   - 選擇 "Storage" 標籤
   - 點擊 "Create Database"
   - 選擇 "Postgres"
   - Region: 選擇 `Singapore` 或 `Hong Kong`（最接近用戶）
   - 點擊 "Create"

2. **等待數據庫創建完成**（約1分鐘）

3. **初始化數據庫**：
   - 在數據庫頁面，點擊 "Query" 標籤
   - 打開本地文件 `sql/init.sql`
   - 複製所有內容
   - 粘貼到 Query 編輯器
   - 點擊 "Run Query"

4. **驗證數據**：
   ```sql
   SELECT * FROM patients;
   ```
   應該看到 6 個患者記錄

5. **重新部署**（使數據庫連接生效）：
   - 返回 "Deployments" 標籤
   - 重新部署一次

---

## 🎉 部署完成！

部署成功後，您會獲得一個 URL，例如：
```
https://hp-hk.vercel.app
```

### 測試線上版本

1. **訪問您的 Vercel URL**
2. **使用測試帳號登入**：
   ```
   電話：99998888
   ```
3. **驗證功能**：
   - ✅ 登入成功
   - ✅ iframe 加載
   - ✅ Agent 使用正確的患者姓名
   - ✅ 刷新頁面會自動登入

---

## 🔧 管理後台

部署後，管理後台也可以訪問：

```
https://hp-hk.vercel.app/admin

管理員帳號：
用戶名：admin
密碼：admin123
```

---

## 📱 分享給客戶

您可以將以下 URL 分享給香港的客戶：

```
https://hp-hk.vercel.app
```

配合測試帳號：
```
葉問：99998888
Lam Lok：97684471
Pretty：1（電郵：Dm_hito@dh.gov.hk）
Shaun Wun：55418888
凌兆楷 Wilfred：66837316
Venus：64740051
```

---

## 🎯 Vercel 控制台功能

部署後，您可以在 Vercel 控制台：

1. **查看部署日誌** - Deployments 標籤
2. **管理數據庫** - Storage 標籤
3. **查看環境變量** - Settings → Environment Variables
4. **查看訪問統計** - Analytics 標籤
5. **配置自定義域名** - Settings → Domains

---

## ⚠️ 重要提示

### 部署後必須做的事

1. **重新部署兩次**：
   - 第一次：初始部署
   - 第二次：添加環境變量後
   - 第三次：創建數據庫後

2. **驗證環境變量**：
   - 確保 `GPTBOTS_API_KEY` 和 `GPTBOTS_ENDPOINT` 都已設置
   - 在 Settings → Environment Variables 中檢查

3. **驗證數據庫**：
   - 確保數據庫已創建
   - 確保 `sql/init.sql` 已執行
   - 在數據庫 Query 中驗證數據

---

## 🆘 如果遇到問題

### 推送到 GitHub 失敗

**錯誤**：`remote: Repository not found`

**解決**：
1. 先在 GitHub 網站手動創建倉庫 `HP_HK`
2. 然後運行 `git push -u origin main`

**錯誤**：`Authentication failed`

**解決**：
1. 創建 Personal Access Token
2. 使用 Token 作為密碼（不是 GitHub 密碼）

### Vercel 部署失敗

**錯誤**：`Build failed`

**解決**：
1. 查看部署日誌
2. 確認 `package.json` 正確
3. 確認 Node.js 版本 >= 18

### 數據庫連接失敗

**錯誤**：`Database connection error`

**解決**：
1. 確認 Postgres 數據庫已創建
2. 確認已重新部署（讓環境變量生效）
3. 檢查環境變量是否正確注入

---

## 📞 支持

- GitHub: https://github.com/CurtisYoung18/HP_HK
- Vercel: https://vercel.com/dashboard
- GPTBots: https://www.gptbots.ai

---

**準備好了嗎？開始部署吧！** 🚀

### 下一步：

1. ✅ 您已完成：Git 初始化和提交
2. 📍 **現在**：在 GitHub 創建倉庫 → https://github.com/new
3. ⏳ **然後**：運行 `git push -u origin main`
4. ⏳ **接著**：在 Vercel 導入項目

