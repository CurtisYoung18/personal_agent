# Personal Agent - 个人工作助手

一个基于 GPTBots AI Agent 的智能工作助手系统，使用 Next.js 构建，支持用户登录和私人聊天对话。

## 功能特点

- 🔐 **安全登录**：账户密码认证系统
- 💬 **智能对话**：集成 GPTBots AI Agent 进行智能对话
- ⏱️ **会话计时**：自动记录每次使用时长
- 🎨 **美观界面**：现代化 UI 设计，支持背景图片
- 📱 **响应式设计**：完美适配各种设备

## 技术栈

- **前端框架**: Next.js 14 + React 18 + TypeScript
- **样式**: CSS Modules + 渐变动画
- **数据库**: Neon Postgres (Vercel)
- **部署**: Vercel
- **AI 引擎**: GPTBots API

## 快速开始

### ⚠️ 重要提示

**如果您看到旧的界面（邮箱/电话登录）或旧的 Logo**，这是浏览器缓存问题：

**解决方法**：
- **Mac**: 按 `Cmd + Shift + R` (强制刷新)
- **Windows**: 按 `Ctrl + Shift + R` (强制刷新)
- 或使用**隐身/无痕模式**访问
- 或清除浏览器缓存后刷新

详细的故障排查指南请查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Vercel 账号
- Neon 数据库账号
- GPTBots API Key

### 本地开发

1. **克隆项目**
```bash
git clone <your-repo-url>
cd personal_agent
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

创建 `.env.local` 文件：
```env
# Neon Postgres 数据库连接
POSTGRES_URL="postgres://username:password@host/database"
POSTGRES_PRISMA_URL="postgres://username:password@host/database?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://username:password@host/database"
POSTGRES_USER="your_user"
POSTGRES_HOST="your_host"
POSTGRES_PASSWORD="your_password"
POSTGRES_DATABASE="your_database"

# GPTBots API（必需）
GPTBOTS_API_KEY="app-uwMHXO95dlUZeUKkM7C8VtTW"
```

4. **运行开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署到 Vercel

### 步骤 1: 创建 Neon 数据库

1. 访问 [Neon.tech](https://neon.tech) 并创建账号
2. 创建新项目和数据库
3. 获取连接字符串

### 步骤 2: 初始化数据库

在 Neon 控制台的 SQL Editor 中执行 `sql/init.sql` 文件的内容：

```sql
-- 创建用户表
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
CREATE INDEX idx_account ON users(account);

-- 插入测试账号（可选）
INSERT INTO users (account, password, name) VALUES
  ('admin', 'password123', '管理员'),
  ('demo', 'demo123', '演示账号');
```

### 步骤 3: 部署到 Vercel

1. **推送代码到 Git 仓库**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **导入项目到 Vercel**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "Add New Project"
   - 导入你的 Git 仓库

3. **配置环境变量**

在 Vercel 项目设置中添加以下环境变量：
```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
GPTBOTS_API_KEY (可选)
```

4. **部署**
   - Vercel 会自动构建和部署
   - 部署完成后获取你的应用 URL

### 步骤 4: 配置 GPTBots API

本项目使用 GPTBots Conversation API（streaming 模式）进行对话。

**API Key 配置**：
- API Key: `app-uwMHXO95dlUZeUKkM7C8VtTW`
- Endpoint: `https://api-sg.gptbots.ai`

在 Vercel 环境变量中添加：
```
GPTBOTS_API_KEY=app-uwMHXO95dlUZeUKkM7C8VtTW
```

> 注意：API Key 已内置在代码中，无需额外配置 Bot URL

## 项目结构

```
personal_agent/
├── pages/
│   ├── index.tsx          # 登录页面
│   ├── chat.tsx           # 聊天页面（GPTBots API streaming）
│   ├── _app.tsx           # App 配置
│   └── api/
│       ├── verify.ts      # 登录验证 API
│       ├── user.ts        # 用户信息 API
│       └── conversation/
│           ├── create.ts  # 创建对话 API
│           └── send.ts    # 发送消息 API（streaming）
├── styles/
│   └── globals.css        # 全局样式（含聊天界面）
├── public/
│   └── imgs/
│       ├── wallpaper.jpg  # 背景图片
│       └── bg_4.avif      # Logo 图片
├── lib/
│   └── db-mock.ts         # 本地开发模拟数据
├── sql/
│   └── init.sql           # 数据库初始化脚本
└── docs/
    └── 对话api.md          # GPTBots API 文档参考
```

## 默认账号

开发环境默认账号（请在生产环境中修改）：

| 账号 | 密码 | 说明 |
|------|------|------|
| admin | password123 | 管理员账号 |
| demo | demo123 | 演示账号 |

## 安全建议

⚠️ **重要**: 当前版本使用明文密码存储，仅供演示使用。生产环境请务必：

1. 使用 bcrypt 或其他方式加密密码
2. 添加 HTTPS
3. 实现 CSRF 保护
4. 添加速率限制
5. 使用环境变量管理敏感信息

### 推荐的密码加密方案

安装 bcrypt：
```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

在 API 中使用：
```typescript
import bcrypt from 'bcrypt'

// 注册时加密
const hashedPassword = await bcrypt.hash(password, 10)

// 登录时验证
const isValid = await bcrypt.compare(password, user.password)
```

## 自定义配置

### 更换背景图片

将你的背景图片放在 `public/imgs/` 目录下，然后在 `styles/globals.css` 中修改：

```css
background-image: url('/imgs/your-image.jpg');
```

### 更换 Logo

将你的 logo 图片放在 `public/imgs/` 目录下，然后在 `pages/index.tsx` 中修改：

```tsx
<img src="/imgs/your-logo.png" alt="Logo" className="logo-img" />
```

### 修改应用名称

在 `pages/index.tsx` 和 `pages/chat.tsx` 中搜索并替换 "个人工作助手" 为你的应用名称。

## 常见问题

### Q: 如何添加新用户？

A: 直接在 Neon 数据库中执行 SQL：
```sql
INSERT INTO users (account, password, name) VALUES
  ('newuser', 'password123', '新用户');
```

### Q: 如何更改 GPTBots Agent？

A: 在 `pages/chat.tsx` 中修改 `baseUrl`：
```typescript
const baseUrl = 'https://www.gptbots.ai/widget/YOUR_NEW_BOT_ID/chat.html'
```

### Q: 数据库连接失败怎么办？

A: 检查：
1. Neon 数据库是否正常运行
2. 环境变量是否正确配置
3. 数据库是否已初始化（运行 init.sql）
4. 连接字符串是否包含正确的凭据

### Q: 如何查看部署日志？

A: 在 Vercel Dashboard 中：
1. 选择你的项目
2. 点击 "Deployments"
3. 选择具体的部署
4. 查看 "Build Logs" 和 "Function Logs"

## 参考文档

- [GPTBots 对话 API 文档](./docs/对话api.md)
- [Next.js 文档](https://nextjs.org/docs)
- [Vercel 部署指南](https://vercel.com/docs)
- [Neon 数据库文档](https://neon.tech/docs)

## 开发路线图

- [ ] 添加密码加密
- [ ] 实现用户注册功能
- [ ] 添加聊天历史记录
- [ ] 支持多语言
- [ ] 添加用户偏好设置
- [ ] 集成更多 AI 功能

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请提交 Issue 或联系开发者。

---

**Made with ❤️ using Next.js and GPTBots**
