# 🚀 快速启动指南

5 分钟内完成部署！

## ⚡ 快速部署步骤

### 1️⃣ 准备 Neon 数据库（2 分钟）

```bash
1. 访问 https://neon.tech 并登录
2. 创建新项目 "personal-agent"
3. 复制连接字符串
4. 在 SQL Editor 运行 sql/init.sql
```

### 2️⃣ 配置 API Key（1 分钟）

确认环境变量（已预配置）：

```env
GPTBOTS_API_KEY=app-uwMHXO95dlUZeUKkM7C8VtTW
```

> 使用 GPTBots Conversation API (streaming)，无需配置 Bot URL

### 3️⃣ 部署到 Vercel（2 分钟）

```bash
1. 推送代码到 GitHub
2. 访问 vercel.com/new
3. 导入你的仓库
4. 添加环境变量（从 Neon 复制）
5. 点击 Deploy
```

## 🎯 必需的环境变量

复制到 Vercel 的环境变量设置：

```
POSTGRES_URL=postgres://user:pass@host/db
POSTGRES_PRISMA_URL=postgres://user:pass@host/db?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgres://user:pass@host/db
POSTGRES_USER=your_user
POSTGRES_HOST=your_host.neon.tech
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=neondb
GPTBOTS_API_KEY=app-uwMHXO95dlUZeUKkM7C8VtTW
```

## 🔑 默认登录信息

```
账号: demo
密码: demo123
```

## ✅ 验证部署

1. 访问你的 Vercel URL
2. 使用默认账号登录
3. 应该看到聊天界面

## 🆘 遇到问题？

### 数据库连接失败
- 检查环境变量是否正确
- 确认在 Neon SQL Editor 运行了 init.sql

### 登录失败
- 确认数据库已初始化
- 运行 `SELECT * FROM users;` 验证用户存在

### 消息发送失败
- 检查 GPTBOTS_API_KEY 环境变量
- 查看 Vercel Function Logs
- 确认 GPTBots API 服务状态

## 📚 详细文档

- [完整 README](./README.md)
- [详细部署指南](./DEPLOYMENT.md)
- [GPTBots API 文档](./docs/对话api.md)

---

**需要帮助？** 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取详细的故障排查指南。

