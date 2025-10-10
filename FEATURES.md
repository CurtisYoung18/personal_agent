# 功能实现说明

本文档详细说明了根据补充资料实现的所有功能。

## 📋 业务逻辑实现

### 1. ✅ 模拟 5 个患者数据

创建了 5 个真实的香港患者数据，包含完整信息：

| 字段 | 说明 | 示例 |
|------|------|------|
| name | 姓名（繁体中文） | 陈大文 |
| email | 邮箱 | chen.dawen@example.com |
| phone | 香港电话 | +852 9123 4567 |
| age | 年龄 | 45 |
| gender | 性别 | 男/女 |
| id_card | 香港身份证 | H123456(7) |
| address | 香港地址 | 香港九龍旺角彌敦道688號... |
| occupation | 职业 | 金融分析師 |
| medical_history | 病史 | 高血壓病史5年... |

数据位置：
- **本地测试**：`lib/db-mock.ts`
- **生产环境**：`sql/init.sql`

### 2. ✅ 邮箱和电话验证

实现流程：
1. 用户在登录界面输入邮箱和电话
2. 前端发送 POST 请求到 `/api/verify`
3. API 在数据库中查询匹配的患者
4. 验证成功返回 `patientId`
5. 前端跳转到 `/patient?id={patientId}`

关键代码：
```typescript
// pages/api/verify.ts
const patient = findPatientByEmailAndPhone(email, phone)
if (!patient) {
  return res.status(401).json({
    success: false,
    message: '邮箱或电话号码不匹配，请重试'
  })
}
```

### 3. ✅ iframe 集成 GPTBots Agent

根据补充资料实现了两种方案：

#### 方案一：URL 参数传递 user_id
```typescript
const baseUrl = 'https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html'
const userId = data.patient.email
setIframeUrl(`${baseUrl}?user_id=${encodeURIComponent(userId)}`)
```

**优点**：简单直接，立即生效

#### 方案二：postMessage 动态设置（补充方案）
```typescript
iframe.contentWindow.postMessage(
  JSON.stringify({ type: 'UserId', data: patientInfo.email }),
  '*'
)
```

**优点**：可以在 iframe 加载后动态更新信息

### 4. ✅ 患者信息传递到 Agent

验证通过后，系统执行以下步骤：

1. **获取完整患者信息**
   ```typescript
   GET /api/patient?id={patientId}
   ```

2. **通过 URL 传递 user_id**
   - iframe URL 自动包含 `?user_id={email}`
   - GPTBots 系统识别该用户

3. **通过 postMessage 发送属性（可选）**
   ```javascript
   {
     name: "陈大文",
     email: "chen.dawen@example.com",
     phone: "+852 9123 4567",
     age: "45",
     gender: "男",
     id_card: "H123456(7)",
     address: "香港九龍旺角...",
     occupation: "金融分析師",
     medical_history: "高血壓病史5年..."
   }
   ```

### 5. ✅ Agent 可以识别用户

根据补充资料中的用户体系：

```
登录验证
    ↓
获取 user_id (email)
    ↓
iframe URL: ?user_id=chen.dawen@example.com
    ↓
GPTBots 识别用户身份
    ↓
Agent 知道当前对话的患者信息
```

## 🔧 技术实现细节

### 数据库自动切换

系统自动检测环境并选择数据源：

```typescript
const USE_REAL_DB = process.env.POSTGRES_URL ? true : false

if (USE_REAL_DB && sql) {
  // 使用 Vercel Postgres
  const result = await sql`SELECT * FROM patients...`
} else {
  // 使用本地模拟数据
  const patient = findPatientByEmailAndPhone(email, phone)
}
```

**本地开发**：无需配置数据库，使用 `lib/db-mock.ts`  
**Vercel 部署**：自动连接 Vercel Postgres

### iframe 安全设置

根据补充资料配置 iframe：

```html
<iframe
  src="https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html?user_id=xxx"
  allow="microphone *"
  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
/>
```

- `allow="microphone *"`：允许使用麦克风（语音交互）
- `sandbox`：安全沙箱配置

### 用户属性映射

| 数据库字段 | Agent 属性名 | 用途 |
|-----------|-------------|------|
| email | user_id | 用户唯一标识 |
| name | name | 患者姓名 |
| phone | phone | 联系电话 |
| age | age | 年龄信息 |
| gender | gender | 性别 |
| id_card | id_card | 身份证号 |
| address | address | 居住地址 |
| occupation | occupation | 职业信息 |
| medical_history | medical_history | 病史记录 |

## 📊 API 端点

### POST /api/verify
验证患者身份

**请求：**
```json
{
  "email": "chen.dawen@example.com",
  "phone": "+852 9123 4567"
}
```

**响应（成功）：**
```json
{
  "success": true,
  "patientId": "1",
  "message": "验证成功"
}
```

**响应（失败）：**
```json
{
  "success": false,
  "message": "邮箱或电话号码不匹配，请重试"
}
```

### GET /api/patient?id={id}
获取患者完整信息

**响应：**
```json
{
  "success": true,
  "patient": {
    "id": "1",
    "name": "陈大文",
    "email": "chen.dawen@example.com",
    "phone": "+852 9123 4567",
    "age": 45,
    "gender": "男",
    "idCard": "H123456(7)",
    "address": "香港九龍旺角彌敦道688號旺角中心15樓A室",
    "occupation": "金融分析師",
    "medicalHistory": "高血壓病史5年，目前服用降壓藥控制，偶有頭暈症狀"
  }
}
```

## 🎨 UI/UX 特性

### 登录界面
- 渐变紫色背景
- 居中白色卡片
- 动画淡入效果
- 输入框聚焦高亮
- 错误提示醒目显示
- 加载状态反馈

### iframe 页面
- 全屏显示
- 无边框无滚动条
- 完全沉浸式体验
- 加载动画

### 响应式设计
- 移动端适配
- 平板适配
- 桌面端优化

## 🔐 安全特性

1. **API 验证**：所有 API 都验证请求方法和参数
2. **SQL 注入防护**：使用参数化查询
3. **XSS 防护**：输入自动转义
4. **HTTPS**：Vercel 自动启用
5. **iframe Sandbox**：限制不安全操作

## 📱 跨平台支持

- ✅ Chrome / Edge (推荐)
- ✅ Safari
- ✅ Firefox
- ✅ 移动端浏览器
- ✅ iPad / 平板

## 🌐 GPTBots 集成说明

### user_id 的作用

根据补充资料，设置 user_id 后：

1. **Tools 调用**：Agent 调用 Tools 时，user_id 在 Header 中
2. **用户属性**：属性数据归属于该 user_id
3. **对话日志**：对话记录归属于该 user_id
4. **事件回调**：GA4/webhook 携带该信息

### 匿名 ID 与 user_id

- **匿名 ID**：iframe 自动生成（浏览器指纹）
- **user_id**：开发者设置（患者邮箱）
- **关联**：同一 user_id 可以关联多个匿名 ID（跨设备）

### conversation_id 生成

```
user_id (邮箱) 
    ↓
自动生成 conversation_id
    ↓
承载对话内容
```

## 🎯 完成的需求

### ✅ 需求一：简洁 iframe 展示
- 无导航栏
- 全屏 iframe
- 居中显示

### ✅ 需求二：轻量数据库
- Vercel Postgres（生产）
- 模拟数据（开发）
- 存储患者完整信息

### ✅ 需求三：身份验证
- 邮箱 + 电话验证
- 验证通过才能访问
- 美观的登录界面

### ✅ 需求四：信息传递
- 通过 API 获取患者信息
- URL 参数传递 user_id
- postMessage 发送属性
- Agent 能识别患者身份

## 📈 下一步优化建议

1. **用户属性 API**：通过 GPTBots API 主动推送用户属性
2. **会话管理**：添加登出功能
3. **日志记录**：记录用户访问日志
4. **多语言**：支持英文界面
5. **密码保护**：添加额外的密码验证层

---

**当前版本**：v1.0  
**最后更新**：2025-10-10  
**根据**：补充资料.md

