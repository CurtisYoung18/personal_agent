# 本地测试指南

本文档提供详细的本地测试步骤，确保所有功能在部署前正常工作。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

## 🧪 测试流程

### 测试一：登录验证功能

1. 打开浏览器访问 http://localhost:3000
2. 您应该看到登录界面
3. 使用以下任一测试账号登录：

**测试账号 1：陈大文**
- 邮箱：`chen.dawen@example.com`
- 电话：`+852 9123 4567`

**测试账号 2：李美玲**
- 邮箱：`li.meiling@example.com`
- 电话：`+852 9234 5678`

**测试账号 3：黃志強**
- 邮箱：`wong.chikong@example.com`
- 电话：`+852 9345 6789`

**测试账号 4：張小芬**
- 邮箱：`cheung.siufan@example.com`
- 电话：`+852 9456 7890`

**测试账号 5：林建華**
- 邮箱：`lam.kinwa@example.com`
- 电话：`+852 9567 8901`

4. 点击"登录"按钮

**预期结果**：
- ✅ 如果邮箱和电话匹配，页面应该跳转到 iframe 页面
- ❌ 如果不匹配，应该显示错误提示

### 测试二：验证失败情况

1. 在登录界面输入错误的邮箱或电话
2. 点击"登录"

**预期结果**：
- ❌ 应该显示红色错误提示："邮箱或电话号码不匹配，请重试"
- 停留在登录页面

### 测试三：iframe 加载和 user_id 传递

1. 使用正确的账号登录（例如：chen.dawen@example.com）
2. 登录成功后应该看到 GPTBots iframe
3. 打开浏览器开发者工具（F12）
4. 查看 Console 标签页

**预期结果**：
- ✅ iframe 应该成功加载
- ✅ Console 中应该看到：`Patient info sent to iframe: { name: "陈大文", email: "chen.dawen@example.com", ... }`
- ✅ iframe URL 应该包含 `?user_id=chen.dawen@example.com`

### 测试四：检查患者信息传递

1. 登录后，在浏览器开发者工具的 Network 标签页
2. 找到 `/api/patient?id=1` 请求
3. 查看响应内容

**预期结果**：
应该看到完整的患者信息：
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

### 测试五：响应式设计

在浏览器开发者工具中：
1. 切换到移动设备视图（Ctrl + Shift + M 或 Cmd + Shift + M）
2. 测试不同屏幕尺寸：
   - iPhone SE (375x667)
   - iPad (768x1024)
   - Desktop (1920x1080)

**预期结果**：
- ✅ 登录表单在所有设备上应该居中显示
- ✅ iframe 应该全屏显示
- ✅ 没有横向滚动条

## 🔍 调试技巧

### 查看当前使用的数据源

打开 `/pages/api/verify.ts`，查看第 5 行：
```typescript
const USE_REAL_DB = process.env.POSTGRES_URL ? true : false
```

- 如果 `USE_REAL_DB = false`：使用本地模拟数据（lib/db-mock.ts）
- 如果 `USE_REAL_DB = true`：使用 Vercel Postgres

### 查看 postMessage 发送的数据

在 `/pages/patient.tsx` 中，已经添加了 console.log：
```typescript
console.log('Patient info sent to iframe:', userProperties)
```

打开浏览器 Console 可以看到发送给 iframe 的完整患者信息。

### 检查 iframe URL

在浏览器开发者工具的 Elements 标签页：
1. 找到 `<iframe>` 元素
2. 查看 `src` 属性

应该是：
```
https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html?user_id=chen.dawen@example.com
```

## ✅ 测试检查清单

在提交代码前，确保以下所有项都通过：

- [ ] 本地开发服务器能正常启动（npm run dev）
- [ ] 登录页面正常显示
- [ ] 使用正确的邮箱和电话能成功登录
- [ ] 使用错误的邮箱或电话会显示错误提示
- [ ] 登录成功后能看到 iframe
- [ ] iframe URL 包含正确的 user_id 参数
- [ ] Console 显示患者信息已发送
- [ ] 所有 5 个测试账号都能正常登录
- [ ] 移动端响应式设计正常
- [ ] 没有 Console 错误（除了跨域警告，这是正常的）

## 🐛 常见问题

### Q: npm install 失败
**A**: 确保 Node.js 版本 >= 18，运行 `node -v` 检查版本

### Q: 页面空白，Console 显示模块错误
**A**: 重启开发服务器：
```bash
# 停止服务器 (Ctrl + C)
# 清除缓存
rm -rf .next
# 重新启动
npm run dev
```

### Q: iframe 不显示或显示 403 错误
**A**: 这是正常的。GPTBots iframe 有跨域限制，在本地测试时可能无法完全加载。部署到 Vercel 后就正常了。

### Q: Console 显示 "postMessage" 错误
**A**: 这也是正常的跨域限制。只要 iframe URL 正确包含 user_id，部署后就能正常工作。

### Q: 登录后立即跳回登录页
**A**: 检查 Console 是否有错误。可能是 API 路由问题，重启开发服务器试试。

## 📝 下一步

本地测试通过后，可以：

1. 提交代码到 GitHub
2. 部署到 Vercel
3. 配置 Vercel Postgres 数据库
4. 在线测试完整功能

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**提示**：本地测试使用的是模拟数据（lib/db-mock.ts），部署到 Vercel 后会自动切换到真实的 Postgres 数据库。

