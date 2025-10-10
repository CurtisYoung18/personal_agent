# HP HK - 患者身份验证系统

一个为香港客户设计的患者身份验证和问卷调查系统，通过 iframe 集成 AI Agent。

## ✨ 功能特性

### ✅ 需求一：简洁的 iframe 展示
- 无导航栏，专注于问卷调查
- 全屏 iframe 展示 agent 界面

### ✅ 需求二：轻量级数据库
- 使用 Vercel Postgres 存储患者信息
- 包含邮箱、电话、年龄、性别、病史等字段
- 快速查询和验证

### ✅ 需求三：身份验证系统
- 登录界面验证邮箱和电话
- 验证通过后才能访问 iframe
- 美观的现代化 UI

### ✅ 需求四：患者信息传递
- 验证成功后通过 API 获取患者完整信息
- 将患者信息作为 URL 参数传递给 iframe 中的 agent
- Agent 可以立即知道正在采访的患者身份

## 🏗️ 技术栈

- **前端框架**: Next.js 14 + React 18 + TypeScript
- **样式**: CSS (响应式设计)
- **数据库**: Vercel Postgres
- **部署平台**: Vercel
- **CDN**: 全球分布，香港节点优化

## 📁 项目结构

```
HP_HK/
├── pages/
│   ├── _app.tsx              # Next.js App 组件
│   ├── index.tsx             # 登录页面（需求三）
│   ├── patient.tsx           # 患者 iframe 页面（需求一、四）
│   └── api/
│       ├── verify.ts         # 验证 API（需求二、三）
│       └── patient.ts        # 患者信息 API（需求四）
├── styles/
│   └── globals.css           # 全局样式（现代化 UI）
├── sql/
│   └── init.sql              # 数据库初始化脚本（需求二）
├── package.json              # 依赖管理
├── tsconfig.json             # TypeScript 配置
├── next.config.js            # Next.js 配置
├── .env.example              # 环境变量模板
├── DEPLOYMENT.md             # 详细部署指南
└── README.md                 # 本文件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local，填入数据库连接信息
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 部署到 Vercel

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🎯 使用流程

1. **患者访问网站** → 看到登录界面
2. **输入邮箱和电话** → 系统验证身份
3. **验证成功** → 跳转到 iframe 页面
4. **系统获取患者完整信息** → 通过 URL 参数传递给 agent
5. **Agent 开始问卷调查** → 已知患者身份信息

## 📊 数据库结构

```sql
patients 表:
- id: 患者唯一 ID
- name: 姓名
- email: 邮箱（用于登录验证）
- phone: 电话（用于登录验证）
- age: 年龄
- gender: 性别
- medical_history: 病史
- created_at: 创建时间
- updated_at: 更新时间
```

## 🔧 配置 Agent URL

部署后，需要配置您的 agent iframe URL：

编辑 `pages/patient.tsx`，第 37 行：

```typescript
const baseUrl = 'YOUR_AGENT_IFRAME_URL' // 替换为实际的 iframe URL
```

## 🧪 測試帳號（真實案例：The Seafood House 食物中毒事件）

**事件**：2025年10月10日衛生防護中心食物中毒案例  
**地點**：旺角彌敦道520號CDB Plaza 30樓The Seafood House  
**涉及人數**：6人

| 案例編號 | 姓名 | 電話 | 電郵 | 狀態 |
|---------|------|------|------|------|
| 20251010-001 | 葉問 | 99998888 | yip.man@example.com | ✅ 已訪談 |
| 20251010-002 | Lam Lok | 97684471 | - | ⏳ 待訪談 |
| 20251010-003 | Pretty | 1 | Dm_hito@dh.gov.hk | ⏳ 待訪談 |
| 20251010-004 | Shaun Wun | 55418888 | - | ⏳ 待訪談 |
| 20251010-005 | 凌兆楷 Wilfred | 66837316 | - | ⏳ 待訪談 |
| 20251010-006 | Venus | 64740051 | - | ⏳ 待訪談 |

**測試登入**：
- 電話：`99998888`（葉問 - 已完成訪談）
- 電郵：可選填 `yip.man@example.com`

## 🌏 为什么选择 Vercel？

✅ **免费且功能完整** - 支持后端 API 和数据库  
✅ **全球 CDN** - 香港访问速度快  
✅ **自动 HTTPS** - iframe 需要安全连接  
✅ **零配置部署** - 推送代码即可上线  
✅ **Serverless** - 无需管理服务器  

## 📱 响应式设计

- ✅ 桌面端优化
- ✅ 平板适配
- ✅ 手机端支持

## 🔒 安全特性

- HTTPS 加密传输
- 数据库连接池
- SQL 注入防护（使用参数化查询）
- iframe sandbox 安全策略

## 🔧 管理后台

系统内置了完整的管理后台，支持患者数据的可视化管理：

### 访问地址
```
http://localhost:3000/admin
```

### 默认账号
- 用户名：`admin`
- 密码：`admin123`

### 功能特性
- ✅ 查看所有患者列表
- ✅ 搜索患者（姓名、邮箱、电话）
- ✅ 添加新患者
- ✅ 编辑患者信息
- ✅ 删除患者
- ✅ 响应式设计

详见 [管理后台使用指南](./ADMIN_GUIDE.md)

## 📖 相關文檔

- [CASE_DATA_UPDATE.md](./CASE_DATA_UPDATE.md) - **真實案例數據說明** ⭐
- [case_progress.md](./case_progress.md) - 原始案例資料
- [USER_PROPERTY_MAPPING.md](./USER_PROPERTY_MAPPING.md) - 字段映射說明
- [管理後台指南](./ADMIN_GUIDE.md) - 管理後台使用說明
- [本地測試指南](./LOCAL_TESTING.md) - 詳細的測試步驟
- [部署指南](./DEPLOYMENT.md) - 詳細的部署步驟
- [功能說明](./FEATURES.md) - 技術實現詳解
- [Vercel 文檔](https://vercel.com/docs)
- [Next.js 文檔](https://nextjs.org/docs)

## 📄 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**开发日期**: 2025-10-10  
**适用地区**: 香港及全球  
**部署平台**: Vercel

