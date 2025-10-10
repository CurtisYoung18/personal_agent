# GPTBots 用戶屬性集成指南

## 🎯 問題說明

**發現**：iframe URL 只支持傳遞 `user_id` 和 `email` 兩個參數，其他屬性（age, case_id, detail, mobile, patient_name）**無法通過 URL 直接傳遞**。

**解決方案**：提供兩種方案讓 Agent 訪問這些屬性。

---

## 方案一：使用 GPTBots 用戶屬性 API ⭐⭐⭐

### 優點
- ✅ Agent 可以在 Prompt 中使用 `{{變量}}`
- ✅ 屬性持久化存儲
- ✅ 跨對話保留
- ✅ 自動同步

### 配置步驟

#### 1. 獲取 GPTBots API Key

1. 登入 https://www.gptbots.ai
2. 進入「設置」→「API 密鑰」
3. 點擊「創建新密鑰」
4. 複製 API Key（格式如：`sk-xxxxx`）
5. 查看您的 endpoint（通常是 `us`、`eu` 或 `ap`）

#### 2. 配置環境變量

**本地開發**：

創建 `.env.local` 文件：
```bash
GPTBOTS_API_KEY="sk-your-actual-api-key-here"
GPTBOTS_ENDPOINT="us"
```

**Vercel 部署**：

1. 進入 Vercel 項目設置
2. 選擇「Environment Variables」
3. 添加以下變量：
   - `GPTBOTS_API_KEY`: `sk-xxxxx`
   - `GPTBOTS_ENDPOINT`: `us`

#### 3. 重啟開發服務器

```bash
# 停止當前服務器 (Ctrl + C)
npm run dev
```

#### 4. 測試同步

1. 訪問 http://localhost:3000
2. 使用電話 `99998888` 登入
3. 查看 Console，應該看到：

```javascript
✅ 用戶屬性已同步到 GPTBots
```

#### 5. 在 GPTBots Agent 中使用

在 Agent 的 Prompt 中：

```
您好 {{patient_name}}！

我是香港衛生防護中心的調查員。根據我們的記錄：
- 案例編號：{{case_id}}
- 事件：{{detail}}
- 年齡：{{age}}
- 電話：{{mobile}}

我需要向您了解一些關於這次用餐後身體不適的情況。請問您方便接受訪談嗎？
```

Agent 會自動替換這些變量！

---

## 方案二：使用 Tools（推薦用於複雜查詢）⭐⭐

### 優點
- ✅ 不需要 API Key
- ✅ 實時從數據庫獲取（總是最新）
- ✅ 可以返回更複雜的數據
- ✅ 更安全

### 配置步驟

#### 1. 部署到 Vercel

Tools API 需要公網訪問，必須先部署。

#### 2. 在 GPTBots 中添加 Tool

1. 進入 Agent 設置 → Tools
2. 點擊「添加 Tool」
3. 填寫信息：

**基本信息**：
- Tool 名稱：`get_patient_info`
- 描述：`獲取患者的詳細信息，包括年齡、案例編號、事件詳情等`

**API 配置**：
- API URL：`https://your-project.vercel.app/api/tools/patient-info`
- Method：`GET`
- Headers：（留空，GPTBots 會自動傳遞 user_id）

**輸入參數**：無需配置（GPTBots 自動傳遞 user_id）

**輸出參數**：
```json
{
  "patient_name": "string",
  "age": "string",
  "case_id": "string",
  "detail": "string",
  "mobile": "string",
  "event_location": "string",
  "symptoms": "object"
}
```

#### 3. 在 Agent Prompt 中配置

```
當用戶開始對話時：
1. 先調用 get_patient_info 工具獲取患者信息
2. 使用獲取的信息進行個性化問候
3. 開始問卷調查

示例開場白：
"您好 {patient_name}！我是衛生防護中心的調查員。
根據我們的記錄，您在 {detail} 用餐後出現身體不適。
我需要向您了解一些情況..."
```

#### 4. 測試

部署後，當用戶登入並開始對話：
- Agent 會自動調用 `get_patient_info` Tool
- 獲取患者完整信息
- 使用信息進行對話

---

## 🔄 當前實現狀態

### ✅ 已實現

1. **iframe URL 傳遞**：
   - ✅ `user_id=20251010-001`
   - ✅ `email=yip.man@example.com`（如果有）

2. **用戶屬性 API**：
   - ✅ `/api/sync-properties` 已創建
   - ⏳ 需要配置 `GPTBOTS_API_KEY`

3. **Tools API**：
   - ✅ `/api/tools/patient-info` 已創建
   - ⏳ 需要部署到 Vercel
   - ⏳ 需要在 GPTBots 中配置

4. **localStorage 會話**：
   - ✅ 自動記住用戶
   - ✅ 刷新頁面不需要重新登入
   - ✅ 登出功能

---

## 🧪 測試方案

### 測試方案一（需要 API Key）

```bash
# 1. 創建 .env.local
echo 'GPTBOTS_API_KEY="sk-your-key"' > .env.local
echo 'GPTBOTS_ENDPOINT="us"' >> .env.local

# 2. 重啟服務器
npm run dev

# 3. 登入測試
# 電話：99998888

# 4. 查看 Console
# 應該看到：✅ 用戶屬性已同步到 GPTBots
```

### 測試方案二（需要部署）

```bash
# 1. 部署到 Vercel
git push

# 2. 在 GPTBots 中配置 Tool
# URL: https://your-project.vercel.app/api/tools/patient-info

# 3. 測試 Tool
# 在 GPTBots 中手動調用或讓 Agent 自動調用
```

---

## 📋 方案對比

| 特性 | 方案一：用戶屬性 API | 方案二：Tools |
|------|---------------------|--------------|
| 配置難度 | 簡單（只需 API Key） | 中等（需要配置 Tool） |
| 是否需要部署 | 否（本地也可以） | 是（必須部署） |
| Agent 使用方式 | `{{變量}}` 直接用 | 調用 Tool 獲取 |
| 數據實時性 | 登入時同步 | 每次對話實時查詢 |
| 適用場景 | 固定屬性（姓名、年齡等） | 動態數據（症狀、訪談記錄等） |
| 推薦度 | ⭐⭐⭐ | ⭐⭐ |

---

## 💡 我的建議

### 立即可用的方案

**使用方案一**，因為：
1. ✅ 配置簡單（只需要 API Key）
2. ✅ 本地開發可以測試
3. ✅ Agent 可以直接在 Prompt 中使用 `{{patient_name}}`
4. ✅ 更符合您的需求（在用戶登入時傳遞屬性）

### 配置方法

1. **獲取 API Key**（2分鐘）
2. **創建 `.env.local`**（1分鐘）
3. **重啟服務器**（10秒）
4. **測試**（1分鐘）

總共只需要 5 分鐘！

---

## 🎬 下一步

請告訴我：

1. **您想使用哪個方案？**
   - A: 方案一（用戶屬性 API）- 需要 API Key
   - B: 方案二（Tools）- 需要部署
   - C: 兩個都用

2. **如果選擇方案一**，請提供：
   - GPTBots API Key
   - GPTBots Endpoint（如：us, eu, ap）

我會幫您立即配置好！

---

**相關文檔**：
- [PROPERTY_SOLUTION.md](./PROPERTY_SOLUTION.md) - 詳細方案說明
- [SESSION_MANAGEMENT.md](./SESSION_MANAGEMENT.md) - 會話管理說明

