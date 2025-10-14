# Agent 不回复问题调试指南

## 🔍 问题现象

- ✅ 对话创建成功（显示 `conversation_id`）
- ✅ 用户消息发送成功
- ❌ AI 没有回复或回复为空

---

## 🛠️ 调试步骤

### 步骤 1：查看浏览器控制台

部署后，打开浏览器开发者工具（F12），查看 Console 标签：

**期望看到的日志**：
```
✅ 对话创建成功: [conversation_id]
📦 收到数据块 #1: {"code":3,"data":"你好"}
📝 解析数据: {code: 3, data: "你好"}
📦 收到数据块 #2: {"code":3,"data":"！"}
📝 解析数据: {code: 3, data: "！"}
✅ 收到结束标记
✅ 流式传输完成，共收到 X 个数据块
```

**如果看到错误**：
- `❌ JSON 解析错误` - GPTBots API 响应格式不正确
- `⚠️ 未收到任何 AI 回复内容` - API 返回了数据但格式不匹配
- `❌ 发送消息错误` - 网络或 API 调用失败

### 步骤 2：检查 Network 标签

1. 打开 Network 标签
2. 发送一条消息
3. 查找 `/api/conversation/send` 请求

**检查项**：
- Status: 应该是 200 OK
- Type: 应该是 `text/event-stream` 或 `xhr`
- Response: 查看原始响应数据

### 步骤 3：查看 Vercel 函数日志

1. 访问 Vercel Dashboard
2. 选择项目 → Deployments → 最新部署
3. 点击 **View Function Logs**
4. 查找 `/api/conversation/send` 的日志

**常见错误**：
```
Error: GPTBOTS_API_KEY not configured
→ 解决：在 Vercel 环境变量中添加 GPTBOTS_API_KEY

GPTBots API Error: 401 Unauthorized
→ 解决：检查 API Key 是否正确

GPTBots API Error: 404 Not Found
→ 解决：检查 conversation_id 是否有效

Timeout Error
→ 解决：GPTBots API 响应超时，检查 API 状态
```

---

## 🔧 可能的原因和解决方案

### 原因 1：GPTBots API Key 未配置或错误

**检查**：
```bash
# 在 Vercel Dashboard → Settings → Environment Variables
GPTBOTS_API_KEY = app-uwMHXO95dlUZeUKkM7C8VtTW
```

**验证**：
- 确认环境变量存在
- 确认已选择 Production + Preview + Development
- 重新部署项目

### 原因 2：GPTBots API 响应格式变化

当前代码支持两种格式：

**格式 1（当前使用）**：
```json
{"code":3,"data":"文本内容"}
{"code":0,"message":"完成"}
```

**格式 2（备选）**：
```json
{"event":"message","data":"文本内容"}
{"event":"done"}
```

**如果格式不匹配**：
1. 查看浏览器控制台的原始数据
2. 修改 `pages/chat.tsx` 中的解析逻辑
3. 添加新的格式支持

### 原因 3：Conversation ID 无效或过期

**解决方案**：
1. 刷新页面重新创建对话
2. 检查 `/api/conversation/create` 是否成功
3. 验证返回的 `conversation_id` 格式正确

### 原因 4：网络或 CORS 问题

**检查**：
- Network 标签中是否有 CORS 错误
- GPTBots API 是否可访问
- Vercel 函数是否超时（默认 10 秒）

**解决方案**：
```javascript
// 如果需要，可以在 vercel.json 中增加超时时间
{
  "functions": {
    "pages/api/conversation/send.ts": {
      "maxDuration": 60
    }
  }
}
```

---

## 📊 调试清单

部署后依次检查：

- [ ] Vercel 部署成功（绿色 ✓）
- [ ] 环境变量 `GPTBOTS_API_KEY` 已配置
- [ ] 可以成功登录
- [ ] 对话创建成功（console 显示 conversation_id）
- [ ] 发送消息后查看 console 日志
- [ ] 检查是否收到数据块（`📦 收到数据块`）
- [ ] 检查 JSON 解析是否成功（`📝 解析数据`）
- [ ] 查看 Network 标签的响应内容
- [ ] 查看 Vercel 函数日志

---

## 🧪 测试 API（手动）

### 测试对话创建

```bash
curl -X POST https://personal-agent-kappa.vercel.app/api/conversation/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin"}'
```

**期望响应**：
```json
{
  "success": true,
  "conversationId": "xxxxxxxxxx",
  "message": "对话创建成功"
}
```

### 测试发送消息

```bash
curl -X POST https://personal-agent-kappa.vercel.app/api/conversation/send \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "你的conversation_id",
    "message": "你好"
  }'
```

**期望响应**：
应该看到流式数据输出。

---

## 💡 临时解决方案

如果仍然无法解决，可以：

1. **使用非流式模式**：
   - 修改 `/api/conversation/send` 中的 `response_mode` 为 `blocking`
   - 这样会等待完整响应再返回（较慢但更可靠）

2. **检查 GPTBots API 文档**：
   - 访问 GPTBots 官方文档
   - 确认 API 端点和请求格式是否有更新
   - 当前使用的是 `/v2/conversation/message`

3. **联系 GPTBots 支持**：
   - 如果 API Key 有效但仍无响应
   - 可能是 GPTBots 服务端问题

---

## 📝 现在的增强功能

已添加的调试功能：

1. ✅ **详细的流式传输日志**
   - 显示每个收到的数据块
   - 显示解析后的数据结构
   - 统计总共收到的数据块数量

2. ✅ **多格式支持**
   - 支持 `code + data` 格式
   - 支持 `event + data` 格式
   - 可以轻松添加新格式

3. ✅ **错误提示**
   - 如果未收到内容，显示明确错误
   - 保留失败消息以便调试
   - 详细的错误日志

---

## 🚀 部署后操作

1. **清除浏览器缓存**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

2. **访问网站并登录**
   - 账号: admin
   - 密码: admin123

3. **打开浏览器控制台**（F12）

4. **发送测试消息**：`你好`

5. **观察 Console 日志**
   - 记录所有日志信息
   - 特别注意 `📦 收到数据块` 的内容
   - 如果看到数据但没有显示，说明格式需要调整

6. **如果仍有问题**，提供以下信息：
   - 浏览器 Console 的完整日志
   - Network 标签中的响应内容
   - Vercel 函数日志

---

现在代码已经添加了详细的调试日志，部署后可以清楚地看到 GPTBots API 的响应格式和内容，这样就可以快速定位问题了！🔍

