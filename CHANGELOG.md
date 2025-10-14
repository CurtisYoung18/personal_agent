# 更新日志

## v2.0.0 - 2024-10-14

### 🚀 重大更新：从 iframe 迁移到 API 模式

#### ✨ 新功能

1. **GPTBots Conversation API 集成**
   - 使用 API: `app-uwMHXO95dlUZeUKkM7C8VtTW`
   - Endpoint: `https://api-sg.gptbots.ai`
   - Streaming 实时响应
   - SSE (Server-Sent Events) 流式传输

2. **全新聊天界面**
   - 消息气泡样式
   - 实时打字指示器
   - 自动滚动到最新消息
   - 优雅的动画效果

3. **新增 API 端点**
   - `/api/conversation/create` - 创建对话
   - `/api/conversation/send` - 发送消息（streaming）

#### 🎨 UI 改进

1. **背景图片**
   - 登录后页面使用 `wallpaper.jpg` 全屏背景
   - 40% 透明度，完美的视觉效果

2. **登录页面**
   - 圆形动画 Logo（bg_4.avif）
   - 浮动动画效果
   - 现代化设计

3. **聊天界面**
   - 用户消息：右侧，渐变紫色背景
   - AI 消息：左侧，浅灰色背景
   - Emoji 头像：👤 用户 / 🤖 AI
   - 美化滚动条

#### 🔧 技术改进

1. **移除 iframe 依赖**
   - 不再需要配置 Bot URL
   - 直接使用 GPTBots API
   - 更好的控制和自定义能力

2. **Streaming 支持**
   - 实时显示 AI 响应
   - 逐字显示效果
   - 更好的用户体验

3. **环境变量简化**
   - API Key 已预配置
   - 减少配置步骤

#### 📝 文档更新

1. **README.md**
   - 更新项目结构
   - API 配置说明
   - 功能特点介绍

2. **DEPLOYMENT.md**
   - API 部署指南
   - 环境变量配置
   - 故障排查更新

3. **QUICKSTART.md**
   - 快速启动指南
   - 简化部署步骤

#### 🗑️ 移除内容

- ❌ iframe 集成方式
- ❌ 旧的患者相关 API
- ❌ 管理员后台（简化为单纯聊天系统）

#### ⚙️ 配置要求

**必需的环境变量**：
```env
# 数据库（Neon）
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE

# GPTBots API（必需）
GPTBOTS_API_KEY=app-uwMHXO95dlUZeUKkM7C8VtTW
```

#### 🎯 核心功能

- ✅ 账户密码登录
- ✅ GPTBots AI 对话（streaming）
- ✅ 会话计时器
- ✅ 重新开始对话
- ✅ 实时消息显示
- ✅ 响应式设计

---

## v1.0.0 - Initial Release

### 初始功能

- 基础登录系统
- iframe 集成 GPTBots
- 患者管理系统
- 管理员后台

---

**升级指南**：

如果你正在从 v1.0.0 升级：

1. 添加 `GPTBOTS_API_KEY` 环境变量
2. 删除旧的 iframe 相关代码
3. 更新所有依赖：`npm install`
4. 重新部署到 Vercel

**迁移注意事项**：

- v2.0.0 不向后兼容 v1.0.0
- 数据库结构已简化（users 表）
- 删除了患者和管理员相关功能
- 专注于个人助手功能

