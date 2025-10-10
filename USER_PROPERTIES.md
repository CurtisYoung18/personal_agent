# 用户属性传递机制说明

本文档详细说明了如何将患者信息传递给 GPTBots Agent iframe。

## 📊 当前实现方式

### 方式一：URL 参数传递 user_id ✅

**实现位置**：`pages/patient.tsx` 第 80-85 行

```typescript
const baseUrl = 'https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html'
const userId = data.patient.email
setIframeUrl(`${baseUrl}?user_id=${encodeURIComponent(userId)}`)
```

**结果 URL**：
```
https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html?user_id=chen.dawen@example.com
```

**优点**：
- ✅ 简单直接
- ✅ 立即生效
- ✅ GPTBots 自动识别用户身份
- ✅ 用于跨渠道用户身份关联

**用途**（根据补充资料）：
1. **Tools 调用**：Agent 调用 Tools 时，user_id 在 Header 中传递
2. **用户属性**：属性数据归属于该 user_id
3. **对话日志**：对话记录归属于该 user_id
4. **事件回调**：GA4/Webhook 携带该信息

### 方式二：postMessage 动态设置 ✅

**实现位置**：`pages/patient.tsx` 第 36-68 行

```typescript
useEffect(() => {
  if (!patientInfo) return

  const timer = setTimeout(() => {
    const iframe = document.querySelector('iframe')
    if (iframe && iframe.contentWindow) {
      // 发送用户 ID
      iframe.contentWindow.postMessage(
        JSON.stringify({ type: 'UserId', data: patientInfo.email }),
        '*'
      )
      
      console.log('Patient info sent to iframe:', userProperties)
    }
  }, 1000)

  return () => clearTimeout(timer)
}, [patientInfo])
```

**发送的数据**：
```javascript
{
  type: 'UserId',
  data: 'chen.dawen@example.com'
}
```

**优点**：
- ✅ 可以在 iframe 加载后动态更新
- ✅ 不受 URL 长度限制
- ✅ 可以发送复杂数据结构

## 🔄 完整数据流

```
用户登录
    ↓
验证邮箱 + 电话 (/api/verify)
    ↓
获取患者完整信息 (/api/patient?id=1)
    ↓
构建 iframe URL (含 user_id)
    ↓
加载 iframe
    ↓
通过 postMessage 发送 UserId
    ↓
GPTBots 识别用户身份
    ↓
Agent 开始对话（已知用户信息）
```

## 📦 传递的数据结构

### 完整的患者信息对象

```typescript
interface PatientInfo {
  id: string                    // 数据库 ID
  name: string                  // 姓名
  email: string                 // 邮箱（作为 user_id）
  phone: string                 // 电话
  age?: number                  // 年龄
  gender?: string               // 性别
  idCard?: string               // 身份证
  address?: string              // 地址
  occupation?: string           // 职业
  medicalHistory?: string       // 病史
}
```

### 实际发送给 iframe 的数据

**通过 URL**：
```
?user_id=chen.dawen@example.com
```

**通过 postMessage**：
```json
{
  "type": "UserId",
  "data": "chen.dawen@example.com"
}
```

**Console 输出（用于调试）**：
```javascript
{
  name: "陈大文",
  email: "chen.dawen@example.com",
  phone: "+852 9123 4567",
  age: "45",
  gender: "男",
  id_card: "H123456(7)",
  address: "香港九龍旺角彌敦道688號旺角中心15樓A室",
  occupation: "金融分析師",
  medical_history: "高血壓病史5年，目前服用降壓藥控制，偶有頭暈症狀"
}
```

## 🎯 如何在 Agent 中使用这些信息

### 1. user_id 的自动使用

GPTBots 系统自动识别 URL 中的 `user_id` 参数：

```
用户访问 iframe → 
GPTBots 读取 ?user_id=xxx → 
创建 conversation_id → 
关联到该 user_id
```

### 2. 在 Tools 中获取 user_id

当 Agent 调用您的 API Tools 时，GPTBots 会在 HTTP Header 中传递 user_id：

```javascript
// 您的 API 端点
app.post('/api/get-patient-info', (req, res) => {
  const userId = req.headers['x-user-id'] // GPTBots 传递的 user_id
  
  // 根据 user_id 查询患者信息
  const patient = await db.findPatientByEmail(userId)
  
  res.json({ patient })
})
```

### 3. 通过 GPTBots 用户属性 API 设置

**需要主动调用 GPTBots API**（当前未实现）：

```typescript
// 在验证成功后，调用 GPTBots API 设置用户属性
const updateUserProperties = async (userId: string, properties: any) => {
  const response = await fetch('https://api-${endpoint}.gptbots.ai/v1/property/update', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      property_values: [
        { property_name: 'name', value: properties.name },
        { property_name: 'age', value: properties.age },
        { property_name: 'medical_history', value: properties.medical_history },
        // ... 更多属性
      ],
    }),
  })
  
  return response.json()
}
```

## 🔧 进阶实现：完整的用户属性同步

如果您想让 Agent 直接访问所有患者属性，需要：

### 选项 A：通过 GPTBots 用户属性 API

在 `pages/patient.tsx` 中添加：

```typescript
const syncUserProperties = async (patientInfo: PatientInfo) => {
  const response = await fetch('/api/sync-user-properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientInfo }),
  })
  return response.json()
}

// 在获取患者信息后调用
if (data.success) {
  setPatientInfo(data.patient)
  await syncUserProperties(data.patient) // 同步到 GPTBots
  setIframeUrl(`${baseUrl}?user_id=${userId}`)
}
```

创建 API 端点 `pages/api/sync-user-properties.ts`：

```typescript
export default async function handler(req, res) {
  const { patientInfo } = req.body
  
  // 调用 GPTBots API
  const gptbotsResponse = await fetch(
    'https://api-${endpoint}.gptbots.ai/v1/property/update',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GPTBOTS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: patientInfo.email,
        property_values: [
          { property_name: 'name', value: patientInfo.name },
          { property_name: 'phone', value: patientInfo.phone },
          { property_name: 'age', value: patientInfo.age },
          { property_name: 'gender', value: patientInfo.gender },
          { property_name: 'id_card', value: patientInfo.idCard },
          { property_name: 'address', value: patientInfo.address },
          { property_name: 'occupation', value: patientInfo.occupation },
          { property_name: 'medical_history', value: patientInfo.medicalHistory },
        ],
      }),
    }
  )
  
  const result = await gptbotsResponse.json()
  res.json(result)
}
```

### 选项 B：通过 Tools 实时查询

在 GPTBots 中配置一个 Tool：

**Tool 名称**：`get_patient_info`

**API 端点**：`https://your-domain.vercel.app/api/tools/patient-info`

**Headers**：
- 自动包含 `X-User-Id`（GPTBots 自动添加）

**实现**：

```typescript
// pages/api/tools/patient-info.ts
export default async function handler(req, res) {
  const userId = req.headers['x-user-id'] // GPTBots 传递的 user_id
  
  // 根据 email (user_id) 查询患者
  const patient = await findPatientByEmail(userId)
  
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' })
  }
  
  res.json({
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    occupation: patient.occupation,
    medical_history: patient.medical_history,
    // ... 返回 Agent 需要的信息
  })
}
```

Agent 可以调用这个 Tool 获取完整患者信息。

## 🔍 调试技巧

### 1. 查看 Console 输出

打开浏览器开发者工具（F12），查看 Console：

```
Patient info sent to iframe: {
  name: "陈大文",
  email: "chen.dawen@example.com",
  ...
}
```

### 2. 检查 iframe URL

在 Elements 标签页中找到 `<iframe>` 元素，查看 `src` 属性：

```html
<iframe src="https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html?user_id=chen.dawen@example.com">
```

### 3. 监听 postMessage

在 Console 中运行：

```javascript
window.addEventListener('message', (event) => {
  console.log('Received message:', event.data)
})
```

### 4. 测试 user_id 是否生效

在 GPTBots Agent 中添加一个简单的 prompt：

```
当用户开始对话时，请说："您好，{user_id}，我是您的健康助手。"
```

如果显示正确的邮箱，说明 user_id 传递成功。

## 📊 数据流图

```
┌─────────────────┐
│  用户登录页面    │
│  (输入邮箱+电话)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  POST /api/verify│ ← 验证身份
└────────┬────────┘
         │
         ↓ 验证成功，返回 patientId
         │
┌─────────────────┐
│ GET /api/patient │ ← 获取完整患者信息
│    ?id=1         │
└────────┬────────┘
         │
         ↓ 返回患者完整数据
         │
┌─────────────────────────────────────┐
│  构建 iframe URL                     │
│  + ?user_id=chen.dawen@example.com  │
└────────┬───────────────────────────┘
         │
         ↓ 加载 iframe
         │
┌─────────────────────────────────────┐
│  postMessage 发送 UserId             │
│  { type: 'UserId', data: 'email' }  │
└────────┬───────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  GPTBots 系统                        │
│  - 识别 user_id                      │
│  - 创建 conversation_id              │
│  - 关联用户属性                       │
└────────┬───────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Agent 开始对话                      │
│  - 可通过 Tools 获取患者信息          │
│  - 对话记录关联到 user_id            │
└─────────────────────────────────────┘
```

## 🎯 总结

**当前实现**：
1. ✅ 通过 URL 参数传递 `user_id`（患者邮箱）
2. ✅ 通过 postMessage 发送 `UserId`
3. ✅ GPTBots 自动识别用户身份
4. ✅ 患者信息在 Console 中输出（调试用）

**如需 Agent 直接访问患者详细信息**：
- 选项 A：调用 GPTBots 用户属性 API（需要 API Key）
- 选项 B：配置 Tools 让 Agent 实时查询（推荐）

**推荐方案**：
使用 Tools 方式，因为：
- 🔐 更安全（不在前端暴露敏感信息）
- 🔄 实时数据（总是最新的）
- 🎯 按需获取（Agent 只获取需要的字段）

---

**相关文档**：
- [补充资料.md](./补充资料.md) - GPTBots API 详细文档
- [FEATURES.md](./FEATURES.md) - 功能实现说明

