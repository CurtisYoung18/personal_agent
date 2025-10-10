# 完整測試指南

## 🎉 GPTBots API 已配置！

您的配置：
- ✅ API Key: `app-6nY4BK9TyrsrKKXAtk0LeYNc`
- ✅ Endpoint: `sg` (新加坡)
- ✅ 開發服務器已重啟，正在加載新配置

---

## 🧪 測試步驟

### 第一步：測試用戶登入和屬性同步

1. **打開瀏覽器**  
   訪問：http://localhost:3000

2. **使用測試帳號登入**  
   ```
   電話：99998888
   電郵：yip.man@example.com（可不填）
   ```

3. **點擊「登入」按鈕**  
   應該會跳轉到 iframe 頁面

4. **打開開發者工具（F12）**  
   查看 Console 標籤，您應該看到：

   ```javascript
   📤 iframe URL: https://www.gptbots.ai/widget/...?user_id=20251010-001&email=yip.man@example.com
   
   📋 患者屬性（需要通過 API 傳遞）: {
     age: "34",
     case_id: "20251010-001",
     detail: "The Seafood House 10月8日晚宴",
     mobile: "99998888",
     patient_name: "葉問"
   }
   
   ✅ 用戶屬性已同步到 GPTBots  ← 關鍵！應該看到這條
   ```

   如果看到 `✅ 用戶屬性已同步到 GPTBots`，說明成功了！

---

### 第二步：在 GPTBots Agent 中驗證

1. **在 GPTBots 平台中打開您的 Agent**

2. **檢查用戶屬性是否已設置**  
   - 進入「用戶」→「用戶屬性」
   - 確認已添加這些屬性：
     - `age` (number)
     - `case_id` (string)
     - `detail` (string)
     - `mobile` (string)
     - `patient_name` (string)

3. **在 Agent Prompt 中使用變量**  
   在 System Prompt 或開場白中添加：
   
   ```
   您好 {{patient_name}}！
   
   我是香港衛生防護中心的調查員，負責食物中毒事件調查。
   
   根據我們的記錄：
   - 案例編號：{{case_id}}
   - 事件：{{detail}}
   - 您的年齡：{{age}} 歲
   - 聯絡電話：{{mobile}}
   
   由於您無法透過個人資料，請您盡快提供以下基本資料，以便我們能夠進行調查：
   
   1. 中文姓名
   2. 年齡
   3. 電話號碼
   
   重要提示：呢個係疑似食物中毒事件調查，我哋正收集相關資料協助衛生防護中心調查，以確定感染源頭及防止進一步傳播。您嘅配合對保障公眾健康非常重要。
   
   本次調查涉及八個部分，預計用時3-5分鐘。
   
   請您先提供以上基本資料，我哋就可以開始調查。
   ```

4. **測試對話**  
   在 iframe 中開始對話，Agent 應該會：
   - 使用患者的真實姓名問候
   - 顯示正確的案例編號
   - 顯示正確的事件詳情

---

### 第三步：測試多用戶隔離

驗證不同用戶的屬性不會互相干擾：

1. **測試用戶 A：葉問**
   ```
   電話：99998888
   ```
   Console 應該顯示：
   ```
   user_id: "20251010-001"
   patient_name: "葉問"
   age: "34"
   ```

2. **清除會話或使用無痕模式**
   ```javascript
   localStorage.removeItem('hp_patient_session')
   ```

3. **測試用戶 B：Lam Lok**
   ```
   電話：97684471
   ```
   Console 應該顯示：
   ```
   user_id: "20251010-002"
   patient_name: "Lam Lok"
   age: ""  // 待訪談，無年齡
   ```

4. **在 GPTBots 中查看**  
   兩個用戶應該有完全獨立的對話和屬性

---

### 第四步：測試 localStorage 會話記憶

1. **登入（電話：99998888）**
2. **關閉瀏覽器標籤**
3. **重新打開 http://localhost:3000**
4. **應該自動跳轉到 iframe 頁面**（無需再次登入！）
5. **點擊右上角「登出」按鈕**
6. **返回登入頁面**

---

## 🔍 調試檢查清單

### ✅ 如果看到這些，說明成功了

- [x] Console 顯示：`✅ 用戶屬性已同步到 GPTBots`
- [x] iframe 正常加載
- [x] Agent 在對話中使用了正確的患者姓名
- [x] 刷新頁面會自動登入
- [x] 不同用戶的對話互不干擾

### ⚠️ 如果遇到問題

#### Console 顯示：`ℹ️ 本地模式 - 請使用 Tools 方案`
**原因**：環境變量未加載  
**解決**：
```bash
# 停止服務器 (Ctrl + C)
# 重新啟動
npm run dev
```

#### Console 顯示：`❌ GPTBots API 調用失敗`
**原因**：API Key 或 endpoint 錯誤  
**解決**：檢查 `.env.local` 文件內容是否正確

#### Agent 沒有使用變量
**原因**：GPTBots 中未配置用戶屬性  
**解決**：
1. 進入 GPTBots → 用戶 → 用戶屬性
2. 確認已添加：age, case_id, detail, mobile, patient_name
3. 在 Prompt 中使用 `{{變量名}}`

#### 多用戶互相干擾
**原因**：user_id 設置錯誤（理論上不會發生）  
**解決**：檢查 Console 中的 user_id 是否唯一

---

## 📊 測試數據總結

| 用戶 | 電話 | user_id | patient_name | age | detail |
|------|------|---------|--------------|-----|--------|
| 葉問 | 99998888 | 20251010-001 | 葉問 | 34 | The Seafood House 10月8日晚宴 |
| Lam Lok | 97684471 | 20251010-002 | Lam Lok | - | The Seafood House 10月8日晚宴 |
| Pretty | 1 | 20251010-003 | Pretty | - | The Seafood House 10月8日晚宴 |

**每個用戶的 `user_id` 都不同，所以完全隔離！** ✅

---

## 🎯 預期效果

### 用戶 A（葉問）看到的 Agent 對話：
```
Agent: 您好 葉問！

我是香港衛生防護中心的調查員。根據我們的記錄：
- 案例編號：20251010-001
- 事件：The Seafood House 10月8日晚宴
- 您的年齡：34 歲
- 聯絡電話：99998888

請問您方便接受訪談嗎？
```

### 用戶 B（Lam Lok）看到的 Agent 對話：
```
Agent: 您好 Lam Lok！

我是香港衛生防護中心的調查員。根據我們的記錄：
- 案例編號：20251010-002
- 事件：The Seafood House 10月8日晚宴

請問您方便接受訪談嗎？
```

**完全不同的對話，完全隔離！** ✅

---

## 📝 下一步

1. **刷新瀏覽器** http://localhost:3000
2. **測試登入**（電話：99998888）
3. **查看 Console** 確認同步成功
4. **在 GPTBots 中配置 Prompt** 使用變量
5. **測試多個用戶** 驗證隔離性

---

**API 配置完成！請立即測試！** 🚀

