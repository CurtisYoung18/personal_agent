# 修复 401 登录错误和 Agent 不回复问题

## 🔍 问题诊断

您遇到的问题：
1. ❌ `/api/verify` 返回 401 错误（未授权）
2. ❌ Agent 不回复消息
3. ✅ 对话创建成功（`conversation_id: 68edf5ff0bb4a6363228eed6`）

**根本原因**：数据库中 `users` 表为空或未初始化

---

## 🚀 快速修复方案

### 方法 1：使用 Vercel 部署站点初始化（推荐）⭐

部署完成后，访问：

```
https://personal-agent-kappa.vercel.app/api/admin/init-db
```

使用 **POST** 请求（可以用浏览器插件如 Postman，或者 curl）：

```bash
curl -X POST https://personal-agent-kappa.vercel.app/api/admin/init-db
```

**这会自动**：
- ✅ 删除旧的 `patients` 表
- ✅ 创建新的 `users` 表
- ✅ 添加 3 个测试用户（admin, user1, demo）

---

### 方法 2：在 Neon SQL Editor 中手动运行

1. 访问 https://console.neon.tech/
2. 选择您的项目
3. 点击 **SQL Editor**
4. 复制并运行以下 SQL：

```sql
-- 删除旧表
DROP TABLE IF EXISTS patients;

-- 创建新表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  account VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_account ON users(account);

-- 插入测试用户
INSERT INTO users (account, password, name) VALUES
  ('admin', 'admin123', '管理員'),
  ('user1', 'password1', '用戶一'),
  ('demo', 'demo123', '演示賬號')
ON CONFLICT (account) DO NOTHING;

-- 验证
SELECT * FROM users;
```

---

### 方法 3：使用管理后台

部署完成后，访问：

```
https://personal-agent-kappa.vercel.app/admin
```

在管理后台可以：
- 📋 查看所有用户
- ➕ 添加新用户
- 🗑️ 删除用户

---

## ✅ 验证修复成功

### 步骤 1：检查数据库

在 Neon SQL Editor 中运行：

```sql
SELECT * FROM users;
```

应该看到 3 个用户：
- admin / admin123
- user1 / password1
- demo / demo123

### 步骤 2：测试登录

访问：https://personal-agent-kappa.vercel.app/

使用测试账号登录：
```
账号: admin
密码: admin123
```

**如果看到登录页面但还是报 401**：
1. 清除浏览器缓存（Cmd/Ctrl + Shift + R）
2. 等待 Vercel 部署完成（检查 Dashboard）
3. 确认环境变量已配置（Settings → Environment Variables）

### 步骤 3：测试聊天

登录成功后：
1. 输入消息："你好"
2. 应该收到 AI 回复

---

## 🐛 如果 Agent 还是不回复

### 检查 1：环境变量

确认 Vercel 中配置了：
```
GPTBOTS_API_KEY = app-uwMHXO95dlUZeUKkM7C8VtTW
```

### 检查 2：查看浏览器控制台

按 F12 打开开发者工具，查看 Console 标签：

**正常情况应该看到**：
```
✅ 對話創建成功: [conversation_id]
✅ 流式傳輸完成
```

**如果看到错误**：
- `Failed to load resource: 401` → 检查 GPTBOTS_API_KEY
- `Failed to load resource: 500` → 查看 Vercel 函数日志
- `網絡錯誤` → 检查网络连接

### 检查 3：Vercel 函数日志

1. 访问 Vercel Dashboard
2. 选择项目 → Deployments → 最新部署
3. 点击 **View Function Logs**
4. 查找 `/api/conversation/send` 的错误信息

---

## 📊 常见错误代码

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 401 Unauthorized | 数据库无用户数据 | 运行初始化 SQL 或调用 `/api/admin/init-db` |
| 401 at GPTBots API | API Key 错误 | 检查 `GPTBOTS_API_KEY` 环境变量 |
| 500 Server Error | 数据库连接失败 | 检查所有 `POSTGRES_*` 环境变量 |
| Network Error | Vercel 函数超时 | 检查 GPTBots API 状态 |

---

## 🎯 完整检查清单

部署后依次检查：

- [ ] Vercel 环境变量已配置（8 个变量）
- [ ] 数据库已初始化（users 表存在）
- [ ] 测试用户已添加（至少 3 个）
- [ ] 可以访问登录页面
- [ ] 可以成功登录（不报 401）
- [ ] 登录后看到聊天界面
- [ ] 可以发送消息
- [ ] 可以收到 AI 回复
- [ ] 管理后台可访问（/admin）

---

## 🔗 相关链接

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Console**: https://console.neon.tech/
- **管理后台**: https://personal-agent-kappa.vercel.app/admin
- **初始化 API**: https://personal-agent-kappa.vercel.app/api/admin/init-db

---

## 📞 仍然有问题？

1. **检查 Vercel 部署状态**
   - 确认部署成功（绿色 ✓）
   - 查看函数日志

2. **检查数据库连接**
   - 在 Neon Console 测试查询
   - 确认连接字符串正确

3. **检查 GPTBots API**
   - 确认 API Key 有效
   - 测试 API 是否可访问

4. **清除缓存**
   - 浏览器强制刷新（Cmd/Ctrl + Shift + R）
   - 使用隐身模式测试

---

**部署完成后，首先访问这个 URL 初始化数据库：**

```
POST https://personal-agent-kappa.vercel.app/api/admin/init-db
```

然后就可以正常使用了！🎉

