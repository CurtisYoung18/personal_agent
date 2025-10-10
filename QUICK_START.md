# 🚀 快速開始指南

## ✅ 配置已完成！

- ✅ GPTBots API Key 已配置
- ✅ Endpoint: Singapore (sg)
- ✅ 開發服務器已重啟

---

## 🎯 立即測試（5分鐘）

### 1️⃣ 測試登入和屬性同步

```bash
# 訪問
http://localhost:3000

# 登入
電話：99998888
```

**預期結果**：
- ✅ 跳轉到 iframe 頁面
- ✅ Console 顯示：`✅ 用戶屬性已同步到 GPTBots`
- ✅ 頂部顯示：葉問 [20251010-001] The Seafood House 10月8日晚宴

---

### 2️⃣ 在 GPTBots 中配置 Agent Prompt

1. **登入 GPTBots 平台**  
   https://www.gptbots.ai

2. **打開您的 Agent**  
   ID: `eek1z5tclbpvaoak5609epw`

3. **編輯 System Prompt**  
   添加以下內容：

```
您好 {{patient_name}}！

我是香港衛生防護中心嘅調查員，負責食物中毒事件調查。

根據我哋嘅記錄：
- 案例編號：{{case_id}}
- 事件：{{detail}}
- 您嘅年齡：{{age}} 歲
- 聯絡電話：{{mobile}}

由於您無法透過個人資料，請您盡快提供以下基本資料：

1. 中文姓名
2. 年齡  
3. 電話號碼

重要提示：呢個係疑似食物中毒事件調查，我哋正收集相關資料協助衛生防護中心調查，以確定感染源頭及防止進一步傳播。您嘅配合對保障公眾健康非常重要。

本次調查涉及八個部分，預計用時3-5分鐘。

請您先提供以上基本資料，我哋就可以開始調查。
```

4. **保存配置**

---

### 3️⃣ 測試 Agent 對話

1. **在瀏覽器中（http://localhost:3000）**  
   - 已登入的狀態下
   - 在 iframe 中開始對話

2. **預期 Agent 開場白**：
   ```
   您好 葉問！
   
   我是香港衛生防護中心嘅調查員，負責食物中毒事件調查。
   
   根據我哋嘅記錄：
   - 案例編號：20251010-001
   - 事件：The Seafood House 10月8日晚宴
   - 您嘅年齡：34 歲
   - 聯絡電話：99998888
   ...
   ```

3. **如果 Agent 正確顯示了患者信息**  
   🎉 **成功！** 用戶屬性已正確傳遞！

---

### 4️⃣ 測試多用戶隔離

**測試用戶 A**：
```
1. 登出當前用戶（點擊右上角「登出」）
2. 使用電話 99998888 登入
3. Agent 稱呼：「您好 葉問」
```

**測試用戶 B**：
```
1. 登出
2. 使用電話 97684471 登入
3. Agent 稱呼：「您好 Lam Lok」
```

**測試用戶 C**：
```
1. 登出
2. 使用電話 1，電郵 Dm_hito@dh.gov.hk 登入
3. Agent 稱呼：「您好 Pretty」
```

**驗證**：每個用戶看到的是自己的信息，互不干擾！

---

### 5️⃣ 測試會話記憶

```
1. 登入（電話：99998888）
2. 關閉瀏覽器標籤
3. 重新打開 http://localhost:3000
4. 應該自動跳轉到 iframe 頁面
5. Agent 仍然記得您是「葉問」
```

---

## 🔍 Console 輸出說明

### 成功的輸出
```javascript
📤 iframe URL: https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html?user_id=20251010-001&email=yip.man@example.com

📋 患者屬性（需要通過 API 傳遞）: {
  age: "34",
  case_id: "20251010-001",
  detail: "The Seafood House 10月8日晚宴",
  mobile: "99998888",
  patient_name: "葉問"
}

患者資訊已傳送至 iframe: {
  age: "34",
  case_id: "20251010-001",
  detail: "The Seafood House 10月8日晚宴",
  mobile: "99998888",
  patient_name: "葉問"
}

📤 正在同步到 GPTBots: {
  url: "https://api-sg.gptbots.ai/v1/property/update",
  userId: "20251010-001",
  properties: [
    {property_name: "age", value: "34"},
    {property_name: "case_id", value: "20251010-001"},
    {property_name: "detail", value: "The Seafood House 10月8日晚宴"},
    {property_name: "mobile", value: "99998888"},
    {property_name: "patient_name", value: "葉問"}
  ]
}

✅ GPTBots 用戶屬性同步成功!
✅ 用戶屬性已同步到 GPTBots
```

### 如果同步失敗
```javascript
❌ GPTBots API 調用失敗
// 或
❌ GPTBots 用戶屬性同步錯誤
```

**可能原因**：
1. API Key 錯誤
2. Endpoint 錯誤
3. GPTBots 服務暫時不可用
4. 網絡問題

---

## 📱 測試所有 6 個用戶

| ID | 姓名 | 電話 | 預期 user_id | 預期 patient_name |
|----|------|------|-------------|------------------|
| 1 | 葉問 | 99998888 | 20251010-001 | 葉問 |
| 2 | Lam Lok | 97684471 | 20251010-002 | Lam Lok |
| 3 | Pretty | 1 (電郵登入) | 20251010-003 | Pretty |
| 4 | Shaun Wun | 55418888 | 20251010-004 | Shaun Wun |
| 5 | 凌兆楷 Wilfred | 66837316 | 20251010-005 | 凌兆楷 Wilfred |
| 6 | Venus | 64740051 | 20251010-006 | Venus |

---

## 🎨 界面預覽

### 登入頁面
```
┌─────────────────────────────────┐
│                                 │
│     患者身份驗證                  │
│   請輸入您的電郵和電話以繼續        │
│                                 │
│   電郵地址（可選）                │
│   [________________]            │
│                                 │
│   電話號碼                       │
│   [99998888________]            │
│   請輸入電話號碼（不需要加 +852）  │
│                                 │
│        [ 登入 ]                 │
│                                 │
└─────────────────────────────────┘
```

### iframe 頁面（帶頂部欄）
```
┌────────────────────────────────────────┐
│ 葉問  [20251010-001]  The Seafood...  [登出] │
├────────────────────────────────────────┤
│                                        │
│          GPTBots Agent 對話            │
│                                        │
│  Agent: 您好 葉問！我是香港衛生...     │
│                                        │
│  User: [輸入對話...]                   │
│                                        │
└────────────────────────────────────────┘
```

---

## ✅ 檢查清單

測試前確認：

- [x] 開發服務器正在運行（http://localhost:3000）
- [x] `.env.local` 已創建並包含 API Key
- [x] GPTBots Agent 中已配置用戶屬性（5個字段）
- [x] GPTBots Agent Prompt 中使用了 `{{變量}}`

測試後確認：

- [ ] Console 顯示 `✅ 用戶屬性已同步到 GPTBots`
- [ ] Agent 正確顯示患者姓名
- [ ] Agent 正確顯示案例編號和事件詳情
- [ ] 刷新頁面會自動登入
- [ ] 不同用戶的信息不會混淆
- [ ] 登出功能正常

---

## 🆘 需要幫助？

如果遇到任何問題，請：

1. **查看 Console** - 所有錯誤都會顯示
2. **檢查網絡請求** - Network 標籤查看 API 調用
3. **查看文檔** - [GPTBOTS_INTEGRATION.md](./GPTBOTS_INTEGRATION.md)

---

**現在開始測試吧！** 🎉

刷新瀏覽器 → 登入 → 查看 Console → 驗證 Agent 對話

