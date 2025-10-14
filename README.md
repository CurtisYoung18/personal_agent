# Personal Agent

AI 智能工作助手系统

## 功能特性

### 用户功能
- 账号密码登录系统
- 记住登录状态（自动登录）
- 实时 AI 对话（streaming 逐字输出）
- 自定义用户头像
- 响应式界面设计

### 管理功能
- 管理员后台登录
- 用户管理（添加、删除、查看）
- 头像上传系统
- 用户数据统计

## 技术栈

- **前端**: Next.js + React + TypeScript
- **样式**: CSS Modules
- **数据库**: Vercel Postgres / Neon
- **AI**: GPTBots API (Streaming)
- **部署**: Vercel

## 默认账号

```
账号: admin
密码: admin123
```

## 环境变量

```env
# Database (Vercel Postgres or Neon)
POSTGRES_URL=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# GPTBots API
GPTBOTS_API_KEY=your_api_key_here
```

## License

MIT
