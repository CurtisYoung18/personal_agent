# 用戶屬性字段映射說明

根據 GPTBots 用戶屬性配置，本系統將患者資訊映射到以下字段。

## 📊 字段映射表

| GPTBots 屬性名 | 外顯名稱 | 類型 | 數據庫字段 | 說明 |
|---------------|---------|------|-----------|------|
| `age` | 年齡 | number | `age` | 患者年齡 |
| `case_id` | 病案ID | string | `id_card` | 使用身份證號作為病案ID |
| `detail` | 病案 | string | `medical_history` | 患者詳細病史記錄 |
| `mobile` | 電話 | string | `phone` | 患者聯絡電話（不帶加號） |
| `patient_name` | 患者姓名 | string | `name` | 患者全名 |

## 🔄 實現邏輯

### 代碼位置
`pages/patient.tsx` 第 45-51 行

```typescript
const userProperties = {
  age: patientInfo.age?.toString() || '',              // 年齡
  case_id: patientInfo.idCard || '',                   // 病案ID（使用身份證）
  detail: patientInfo.medicalHistory || '',            // 病案詳情（病史）
  mobile: patientInfo.phone || '',                     // 電話
  patient_name: patientInfo.name || '',                // 患者姓名
}
```

## 📝 字段詳細說明

### 1. age（年齡）
- **來源**：數據庫 `age` 字段
- **格式**：數字轉字符串
- **示例**：`"45"`
- **用途**：Agent 可根據年齡提供個性化建議

### 2. case_id（病案ID）
- **來源**：數據庫 `id_card` 字段
- **格式**：香港身份證格式
- **示例**：`"H123456(7)"`
- **用途**：唯一標識患者病案

### 3. detail（病案）
- **來源**：數據庫 `medical_history` 字段
- **格式**：文本
- **示例**：`"高血壓病史5年，目前服用降壓藥控制，偶有頭暈症狀"`
- **用途**：Agent 了解患者病史，提供專業建議

### 4. mobile（電話）
- **來源**：數據庫 `phone` 字段
- **格式**：包含國際區號的電話號碼
- **示例**：`"+852 9123 4567"`
- **注意**：圖片中標註「不帶加號的電話號碼」，但數據庫存儲的是帶 +852 的格式
- **用途**：聯絡患者、發送通知

### 5. patient_name（患者姓名）
- **來源**：數據庫 `name` 字段
- **格式**：繁體中文姓名
- **示例**：`"陳大文"`
- **用途**：個性化問候和對話

## 🔍 數據流

```
數據庫（Postgres）
    ↓
API /api/patient?id=1
    ↓
PatientInfo 對象
    ↓
映射為 userProperties
    ↓
Console 輸出（調試）
    ↓
傳遞給 iframe（URL + postMessage）
    ↓
GPTBots Agent 接收
```

## 📤 傳遞方式

### 方式一：URL 參數
```
https://www.gptbots.ai/widget/.../chat.html?user_id=chen.dawen@example.com
```
- ✅ 已實現
- 用途：設置用戶唯一標識

### 方式二：postMessage
```javascript
iframe.contentWindow.postMessage(
  JSON.stringify({ type: 'UserId', data: 'chen.dawen@example.com' }),
  '*'
)
```
- ✅ 已實現
- 用途：動態設置用戶ID

### 方式三：用戶屬性 API（可選）
如需將 `userProperties` 中的所有字段同步到 GPTBots，需要調用：

```typescript
POST https://api-${endpoint}.gptbots.ai/v1/property/update
Authorization: Bearer ${API_KEY}

{
  "user_id": "chen.dawen@example.com",
  "property_values": [
    { "property_name": "age", "value": "45" },
    { "property_name": "case_id", "value": "H123456(7)" },
    { "property_name": "detail", "value": "高血壓病史5年..." },
    { "property_name": "mobile", "value": "+852 9123 4567" },
    { "property_name": "patient_name", "value": "陳大文" }
  ]
}
```

## 🧪 測試驗證

### 1. 檢查 Console 輸出
打開瀏覽器開發者工具（F12），登入後應該看到：

```javascript
患者資訊已傳送至 iframe: {
  age: "45",
  case_id: "H123456(7)",
  detail: "高血壓病史5年，目前服用降壓藥控制，偶有頭暈症狀",
  mobile: "+852 9123 4567",
  patient_name: "陳大文"
}
```

### 2. 檢查 iframe URL
在 Elements 標籤查看 iframe 的 src：
```html
<iframe src="https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html?user_id=chen.dawen@example.com">
```

### 3. 在 Agent 中驗證
在 GPTBots Agent 配置中，可以使用這些屬性：
- `{{age}}` - 顯示年齡
- `{{patient_name}}` - 顯示患者姓名
- `{{detail}}` - 顯示病史
- 等等

## ⚠️ 注意事項

### 電話格式問題
- **數據庫存儲**：`"+852 9123 4567"`（帶加號和空格）
- **圖片要求**：「不帶加號的電話號碼」
- **當前實現**：保留原格式（帶加號）

如需移除加號，可修改：
```typescript
mobile: patientInfo.phone?.replace(/^\+/, '') || '',  // 移除開頭的 +
```

### 屬性查詢設置
根據圖片，所有屬性的「對話提取」都設置為「查詢」：
- ✅ 采集：已勾選
- ✅ 查詢：已勾選

這意味著 Agent 可以主動詢問這些資訊，也可以從對話中提取。

## 🔄 更新字段映射

如需添加新字段，請按以下步驟：

1. **更新數據庫**（如需要）
   ```sql
   ALTER TABLE patients ADD COLUMN new_field VARCHAR(255);
   ```

2. **更新 TypeScript 介面**
   ```typescript
   // pages/patient.tsx
   interface PatientInfo {
     // ... 現有字段
     newField?: string
   }
   ```

3. **更新映射邏輯**
   ```typescript
   const userProperties = {
     // ... 現有字段
     new_field: patientInfo.newField || '',
   }
   ```

4. **在 GPTBots 中配置**
   - 添加對應的用戶屬性
   - 設置屬性名稱和類型
   - 配置採集和查詢選項

## 📚 相關文檔

- [USER_PROPERTIES.md](./USER_PROPERTIES.md) - 用戶屬性傳遞詳細說明
- [補充資料.md](./補充資料.md) - GPTBots API 完整文檔
- [FEATURES.md](./FEATURES.md) - 功能技術實現

---

**最後更新**：2025-10-10  
**對應圖片**：GPTBots 用戶屬性配置截圖

