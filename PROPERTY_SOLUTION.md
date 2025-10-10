# 用戶屬性傳遞解決方案

## ⚠️ 重要發現

根據 `補充資料.md` 的 iframe 文檔，**iframe URL 只支持兩個參數**：

1. ✅ `user_id` - 用戶身份ID
2. ✅ `email` - 用戶郵箱

❌ **其他屬性（age, case_id, detail, mobile, patient_name）不能通過 iframe URL 傳遞！**

## 🎯 正確的實現方案

要讓 Agent 訪問用戶的其他屬性（年齡、案例編號、事件詳情等），有以下三種方案：

---

### 方案一：使用 GPTBots 用戶屬性 API（推薦）⭐

**原理**：通過 GPTBots API 主動推送用戶屬性，Agent 可以直接讀取。

#### 步驟 1：獲取 GPTBots API Key

1. 登入 GPTBots 平台
2. 進入「設置」→「API 密鑰」
3. 創建新的 API Key
4. 記錄 API Key 和 endpoint（如：us、eu 等）

#### 步驟 2：配置環境變量

創建 `.env.local` 文件：

```bash
GPTBOTS_API_KEY="your_api_key_here"
GPTBOTS_ENDPOINT="us"  # 或您的實際 endpoint
```

#### 步驟 3：代碼已實現

我已經創建了 `/api/sync-user-properties.ts` API，在用戶登入後會自動調用：

```typescript
// 用戶登入成功後，自動執行
POST /api/sync-user-properties
{
  "userId": "20251010-001",
  "properties": {
    "age": "34",
    "case_id": "20251010-001",
    "detail": "The Seafood House 10月8日晚宴",
    "mobile": "99998888",
    "patient_name": "葉問"
  }
}

// 該 API 會調用 GPTBots
POST https://api-us.gptbots.ai/v1/property/update
Authorization: Bearer ${API_KEY}
{
  "user_id": "20251010-001",
  "property_values": [
    { "property_name": "age", "value": "34" },
    { "property_name": "case_id", "value": "20251010-001" },
    { "property_name": "detail", "value": "The Seafood House 10月8日晚宴" },
    { "property_name": "mobile", "value": "99998888" },
    { "property_name": "patient_name", "value": "葉問" }
  ]
}
```

#### 步驟 4：在 GPTBots 中配置用戶屬性

在 GPTBots Agent 設置中：
1. 進入「用戶」→「用戶屬性」
2. 添加以下屬性（您已經添加過了）：
   - `age` (number)
   - `case_id` (string)
   - `detail` (string)
   - `mobile` (string)
   - `patient_name` (string)

#### 步驟 5：Agent 使用屬性

在 Agent 的 Prompt 或對話中，可以使用：
```
您好 {{patient_name}}，我是衛生防護中心的調查員。
根據記錄，您參加了{{detail}}。
請問您當時有出現身體不適嗎？
```

**優點**：
- ✅ Agent 可以直接訪問所有屬性
- ✅ 屬性持久化存儲在 GPTBots
- ✅ 支持在 Prompt 中使用 {{變量}}
- ✅ 跨對話保留屬性

**缺點**：
- ❌ 需要配置 API Key
- ❌ 需要調用外部 API

---

### 方案二：使用 Tools 實時查詢（推薦）⭐⭐

**原理**：在 GPTBots 中配置一個 Tool，讓 Agent 主動調用您的 API 獲取患者信息。

#### 步驟 1：創建 Tool API

創建 `/api/tools/get-patient-info.ts`：

```typescript
export default async function handler(req, res) {
  // GPTBots 會在 Header 中傳遞 user_id
  const userId = req.headers['x-user-id'] || req.headers['user-id']
  
  if (!userId) {
    return res.status(400).json({ error: 'Missing user_id' })
  }
  
  // 根據案例編號查詢患者
  const patient = await findPatientByCaseNumber(userId)
  
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' })
  }
  
  // 返回患者信息
  return res.json({
    age: patient.age,
    case_id: patient.caseNumber,
    detail: patient.eventSummary,
    mobile: patient.phone,
    patient_name: patient.name,
    event_location: patient.eventLocation,
    event_date: patient.eventDate,
    // ... 其他需要的信息
  })
}
```

#### 步驟 2：在 GPTBots 中配置 Tool

1. 進入 Agent 設置 → Tools
2. 添加新 Tool：
   - **名稱**：`get_patient_info`
   - **描述**：獲取患者詳細信息
   - **API URL**：`https://your-domain.vercel.app/api/tools/get-patient-info`
   - **方法**：GET
   - **Headers**：無需配置（GPTBots 自動傳遞 user_id）

3. 在 Agent Prompt 中添加：
```
當用戶開始對話時，請先調用 get_patient_info 工具獲取患者信息。
然後根據獲取的信息進行個性化問候。
```

**優點**：
- ✅ 不需要 GPTBots API Key
- ✅ 數據實時從數據庫獲取（總是最新）
- ✅ 更安全（不在前端暴露數據）
- ✅ 靈活（可以返回任意數據）

**缺點**：
- ❌ 需要部署到公網（本地測試不行）
- ❌ Agent 需要主動調用 Tool

---

### 方案三：使用 Prompt 預填充（臨時方案）

**原理**：由於我們有完整的患者信息，可以在 iframe 加載後，通過 JavaScript 預填充對話。

#### 實現方式

在患者頁面加載後，自動發送一條包含患者信息的初始消息：

```typescript
// 在 iframe 加載完成後
const initialMessage = `
患者資料：
姓名：${patientInfo.name}
年齡：${patientInfo.age}
案例編號：${patientInfo.caseNumber}
事件：${patientInfo.eventSummary}
電話：${patientInfo.phone}
`

// 通過 postMessage 發送初始消息（如果 GPTBots 支持）
iframe.contentWindow.postMessage({
  type: 'SendMessage',
  data: initialMessage
}, '*')
```

**優點**：
- ✅ 簡單直接
- ✅ 不需要配置

**缺點**：
- ❌ 不確定 GPTBots 是否支持
- ❌ 信息會在對話中顯示
- ❌ 不夠優雅

---

## 💡 我的建議

### 短期方案（立即可用）

**使用方案二：Tools**

1. 我創建一個 API 端點
2. 您部署到 Vercel 後
3. 在 GPTBots 中配置 Tool
4. Agent 在對話開始時自動調用 Tool 獲取患者信息

**優勢**：
- 不需要 GPTBots API Key
- 部署後立即可用
- 數據安全（不在前端暴露）

### 長期方案（如果需要更多功能）

**使用方案一：用戶屬性 API**

如果您需要：
- 在 Prompt 中使用 {{變量}}
- 跨多個對話保留用戶信息
- 更複雜的用戶畫像

那麼應該使用用戶屬性 API。

---

## 🚀 現在該怎麼辦？

### 選項 A：我立即實現 Tools 方案

我可以創建：
1. `/api/tools/get-patient-info.ts` - Tool API 端點
2. 更新文檔說明如何在 GPTBots 中配置

### 選項 B：實現用戶屬性 API 方案

需要您提供：
1. GPTBots API Key
2. GPTBots endpoint（如：us, eu）

我會配置自動同步功能。

### 選項 C：兩個都實現

Tools 用於實時查詢，用戶屬性 API 用於持久化存儲。

---

**您希望使用哪個方案？** 🤔

或者您告訴我您的 GPTBots API Key 和 endpoint，我可以立即實現方案一，讓屬性立即可用！
