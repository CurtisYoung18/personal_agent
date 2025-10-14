# 部署指南 - Vercel + Neon

本指南将帮助你将 Personal Agent 部署到 Vercel，使用 Neon 作为数据库。

## 准备工作

在开始之前，请确保你有：

- ✅ GitHub/GitLab/Bitbucket 账号
- ✅ Vercel 账号（可使用 GitHub 登录）
- ✅ Neon 数据库账号
- ✅ GPTBots 账号和 Bot ID

## 第一步：配置 Neon 数据库

### 1.1 创建 Neon 项目

1. 访问 [https://neon.tech](https://neon.tech)
2. 使用 GitHub 账号登录
3. 点击 "Create a project"
4. 选择区域（建议选择离你用户最近的区域）
5. 输入项目名称，如 "personal-agent"
6. 点击 "Create project"

### 1.2 获取数据库连接信息

创建项目后，Neon 会自动创建一个数据库。在项目仪表板中：

1. 点击 "Connection Details"
2. 复制以下连接字符串：
   - **Pooled connection** (用于 POSTGRES_URL 和 POSTGRES_PRISMA_URL)
   - **Direct connection** (用于 POSTGRES_URL_NON_POOLING)
3. 记录以下信息：
   - Host
   - Database name
   - User
   - Password

### 1.3 初始化数据库

1. 在 Neon 控制台，点击 "SQL Editor"
2. 复制 `sql/init.sql` 的内容
3. 粘贴到 SQL Editor
4. 点击 "Run" 执行

你应该看到成功信息：
```
CREATE TABLE
CREATE INDEX
INSERT 0 3
```

### 1.4 验证数据库

运行以下查询验证表已创建：

```sql
SELECT * FROM users;
```

你应该看到 3 个默认用户。

## 第二步：配置 GPTBots API

本项目使用 GPTBots Conversation API（streaming 模式）代替 iframe。

### 2.1 API 配置

**已配置的 API Key**：
```
API Key: app-uwMHXO95dlUZeUKkM7C8VtTW
Endpoint: https://api-sg.gptbots.ai
```

### 2.2 API 功能

项目通过以下 API 与 GPTBots 交互：

1. **创建对话**: `/api/conversation/create`
   - 为每个用户创建唯一的对话 ID
   
2. **发送消息**: `/api/conversation/send`
   - 支持 streaming 实时响应
   - SSE (Server-Sent Events) 流式传输

无需额外配置 Bot URL 或 iframe

## 第三步：准备代码

### 3.1 验证 API Key

确认 `.env.local` 中有：

```env
GPTBOTS_API_KEY=app-uwMHXO95dlUZeUKkM7C8VtTW
```

### 3.2 提交代码

```bash
git add .
git commit -m "配置 GPTBots API"
git push origin main
```

## 第四步：部署到 Vercel

### 4.1 导入项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 选择你的 Git 仓库
4. 点击 "Import"

### 4.2 配置环境变量

在 "Configure Project" 页面，展开 "Environment Variables"：

添加以下环境变量（从 Neon 获取）：

| 键 | 值 | 说明 |
|---|---|---|
| `POSTGRES_URL` | `postgres://user:pass@host/db` | Pooled connection |
| `POSTGRES_PRISMA_URL` | `postgres://user:pass@host/db?pgbouncer=true` | Prisma connection |
| `POSTGRES_URL_NON_POOLING` | `postgres://user:pass@host/db` | Direct connection |
| `POSTGRES_USER` | `your_user` | 数据库用户名 |
| `POSTGRES_HOST` | `ep-xxx.neon.tech` | 数据库主机 |
| `POSTGRES_PASSWORD` | `your_password` | 数据库密码 |
| `POSTGRES_DATABASE` | `neondb` | 数据库名称 |
| `GPTBOTS_API_KEY` | `app-uwMHXO95dlUZeUKkM7C8VtTW` | GPTBots API Key（必需）|

**重要提示**：
- 确保连接字符串包含 `?sslmode=require`
- Neon 默认使用 SSL 连接
- 不要在连接字符串中包含空格

### 4.3 部署

1. 点击 "Deploy"
2. 等待构建完成（通常 1-2 分钟）
3. 构建成功后，Vercel 会提供一个 URL

### 4.4 访问应用

点击提供的 URL，你应该看到登录页面。

使用默认账号测试：
- 账号：`demo`
- 密码：`demo123`

## 第五步：配置自定义域名（可选）

### 5.1 添加域名

1. 在 Vercel 项目中，点击 "Settings" → "Domains"
2. 输入你的域名
3. 点击 "Add"

### 5.2 配置 DNS

Vercel 会提供 DNS 配置说明：

**A 记录方式**：
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME 方式**：
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

在你的域名注册商处添加这些记录。

### 5.3 等待生效

DNS 传播通常需要几分钟到几小时。

## 常见问题排查

### 问题 1: 数据库连接失败

**错误信息**：`Connection error: getaddrinfo ENOTFOUND`

**解决方案**：
1. 检查环境变量是否正确
2. 确认 Neon 数据库是否在运行
3. 检查连接字符串是否包含 `?sslmode=require`

### 问题 2: 登录失败

**错误信息**：`账号或密码不正确`

**解决方案**：
1. 在 Neon SQL Editor 中运行：
   ```sql
   SELECT * FROM users;
   ```
2. 确认用户是否存在
3. 检查密码是否匹配

### 问题 3: 构建失败

**错误信息**：`Module not found` 或 `Type error`

**解决方案**：
1. 检查 `package.json` 中的依赖
2. 本地运行 `npm install` 确保依赖正确
3. 运行 `npm run build` 测试构建
4. 检查 TypeScript 错误

### 问题 4: 消息发送失败

**错误信息**：`发送失败` 或 `創建對話失敗`

**解决方案**：
1. 检查 `GPTBOTS_API_KEY` 环境变量是否正确
2. 验证 API Key: `app-uwMHXO95dlUZeUKkM7C8VtTW`
3. 查看 Vercel Function Logs 获取详细错误
4. 确认 GPTBots API 服务状态

## 环境变量管理

### 本地开发

创建 `.env.local` 文件：

```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://...?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="your_user"
POSTGRES_HOST="your_host.neon.tech"
POSTGRES_PASSWORD="your_password"
POSTGRES_DATABASE="your_database"
GPTBOTS_API_KEY="your_api_key"
```

### 生产环境

通过 Vercel Dashboard 管理：
1. Project → Settings → Environment Variables
2. 添加/编辑变量
3. 重新部署以应用更改

## 数据库维护

### 添加新用户

在 Neon SQL Editor 中：

```sql
INSERT INTO users (account, password, name) 
VALUES ('newuser', 'password123', '新用户');
```

**⚠️ 生产环境请使用加密密码！**

### 修改密码

```sql
UPDATE users 
SET password = 'new_password' 
WHERE account = 'username';
```

### 查看所有用户

```sql
SELECT id, account, name, last_login 
FROM users 
ORDER BY created_at DESC;
```

### 删除用户

```sql
DELETE FROM users 
WHERE account = 'username';
```

## 监控和日志

### Vercel 日志

1. Project → Deployments
2. 选择特定部署
3. 查看 "Function Logs"

### 数据库监控

1. Neon Dashboard → 选择项目
2. "Monitoring" 标签页
3. 查看连接数、查询性能等

## 安全建议

### 生产环境清单

- [ ] 修改默认密码
- [ ] 实现密码加密（bcrypt）
- [ ] 启用 HTTPS（Vercel 自动提供）
- [ ] 配置环境变量保护
- [ ] 定期备份数据库
- [ ] 实现速率限制
- [ ] 添加 CSRF 保护
- [ ] 配置 CORS 策略
- [ ] 启用日志监控

### 密码加密实现

安装依赖：
```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

更新 API：
```typescript
import bcrypt from 'bcrypt'

// 注册时
const hashedPassword = await bcrypt.hash(password, 10)

// 登录时
const isValid = await bcrypt.compare(password, storedHash)
```

## 更新和维护

### 更新代码

```bash
git pull origin main
git add .
git commit -m "更新说明"
git push origin main
```

Vercel 会自动检测更新并重新部署。

### 数据库迁移

如需修改表结构：

1. 在 Neon SQL Editor 执行 ALTER 语句
2. 更新相关的 TypeScript 接口
3. 测试后部署

### 回滚部署

如果新部署有问题：

1. Vercel Dashboard → Deployments
2. 找到之前的成功部署
3. 点击 "⋯" → "Promote to Production"

## 获取帮助

如果遇到问题：

1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 查看 [Neon 文档](https://neon.tech/docs)
3. 检查项目 GitHub Issues
4. 查看 Vercel 和 Neon 的状态页面

---

**祝部署顺利！** 🚀

