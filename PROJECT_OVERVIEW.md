# 项目总览

## 🎯 项目目标

搭建一个功能完善、适合演示的患者身份验证和问卷调查系统，通过 iframe 集成 GPTBots Agent。

## ✅ 已完成功能

### 1️⃣ 患者登录系统
- ✅ 美观的登录界面（渐变紫色背景）
- ✅ 邮箱 + 电话双重验证
- ✅ 错误提示和加载状态
- ✅ 响应式设计（支持移动端）

### 2️⃣ GPTBots Agent 集成
- ✅ 全屏 iframe 展示
- ✅ user_id 通过 URL 参数传递
- ✅ 通过 postMessage 动态设置
- ✅ 支持语音交互（microphone 权限）
- ✅ 沙箱安全策略

### 3️⃣ 患者数据管理
- ✅ 5 个真实的香港患者数据
- ✅ 完整信息（姓名、邮箱、电话、年龄、性别、身份证、地址、职业、病史）
- ✅ 本地模拟数据（开发用）
- ✅ Vercel Postgres（生产用）
- ✅ 自动环境检测和切换

### 4️⃣ 管理后台
- ✅ 管理员登录验证
- ✅ 患者列表可视化展示
- ✅ 实时搜索功能
- ✅ 添加患者（带表单验证）
- ✅ 编辑患者信息
- ✅ 删除患者（带确认）
- ✅ 响应式设计
- ✅ 现代化 UI

### 5️⃣ API 系统
- ✅ `/api/verify` - 患者身份验证
- ✅ `/api/patient` - 获取患者信息
- ✅ `/api/admin/patients` - 管理后台 CRUD

## 📂 项目结构

```
HP_HK/
├── pages/                          # Next.js 页面
│   ├── index.tsx                  # 患者登录页面
│   ├── patient.tsx                # iframe 展示页面
│   ├── admin/
│   │   ├── index.tsx             # 管理员登录
│   │   └── dashboard.tsx         # 管理后台主页
│   └── api/                       # API 路由
│       ├── verify.ts             # 患者验证
│       ├── patient.ts            # 获取患者信息
│       └── admin/
│           └── patients.ts       # 患者 CRUD
│
├── lib/
│   └── db-mock.ts                # 本地模拟数据
│
├── styles/
│   └── globals.css               # 全局样式
│
├── sql/
│   └── init.sql                  # 数据库初始化脚本
│
├── 文档/
│   ├── README.md                 # 项目说明
│   ├── goals.md                  # 原始需求
│   ├── 补充资料.md                # GPTBots 文档
│   ├── LOCAL_TESTING.md          # 本地测试指南
│   ├── DEPLOYMENT.md             # 部署指南
│   ├── FEATURES.md               # 功能实现说明
│   ├── ADMIN_GUIDE.md            # 管理后台指南
│   ├── USER_PROPERTIES.md        # 用户属性传递机制
│   └── PROJECT_OVERVIEW.md       # 本文件
│
└── 配置文件/
    ├── package.json              # 依赖管理
    ├── tsconfig.json             # TypeScript 配置
    ├── next.config.js            # Next.js 配置
    ├── .gitignore               # Git 忽略文件
    └── .env.example             # 环境变量模板
```

## 🚀 快速开始

### 1. 患者登录测试
```bash
访问：http://localhost:3000

测试账号：
邮箱：chen.dawen@example.com
电话：+852 9123 4567
```

### 2. 管理后台测试
```bash
访问：http://localhost:3000/admin

管理员账号：
用户名：admin
密码：admin123
```

## 📊 测试数据

| ID | 姓名 | 邮箱 | 电话 | 职业 |
|----|------|------|------|------|
| 1 | 陈大文 | chen.dawen@example.com | +852 9123 4567 | 金融分析師 |
| 2 | 李美玲 | li.meiling@example.com | +852 9234 5678 | 會計師 |
| 3 | 黃志強 | wong.chikong@example.com | +852 9345 6789 | 工程師 |
| 4 | 張小芬 | cheung.siufan@example.com | +852 9456 7890 | 市場經理 |
| 5 | 林建華 | lam.kinwa@example.com | +852 9567 8901 | 退休教師 |

## 🎨 技术栈

- **前端框架**: Next.js 14 + React 18 + TypeScript
- **样式**: CSS（响应式设计）
- **数据库**: Vercel Postgres（生产）/ 模拟数据（开发）
- **部署平台**: Vercel
- **Agent**: GPTBots iframe 集成

## 🔄 完整业务流程

### 患者端流程
```
1. 访问网站 (/)
   ↓
2. 输入邮箱 + 电话
   ↓
3. POST /api/verify 验证身份
   ↓
4. 验证成功，跳转到 /patient?id=1
   ↓
5. GET /api/patient?id=1 获取完整信息
   ↓
6. 构建 iframe URL（含 user_id）
   ↓
7. 加载 GPTBots Agent iframe
   ↓
8. 通过 postMessage 发送 UserId
   ↓
9. 患者与 Agent 对话
```

### 管理员流程
```
1. 访问 /admin
   ↓
2. 输入用户名 + 密码
   ↓
3. 验证成功，跳转到 /admin/dashboard
   ↓
4. 查看患者列表
   ↓
5. 增删改查操作
   ↓
6. 数据实时同步到数据库
```

## 📡 API 端点

### 患者端 API

**POST /api/verify**
```json
// 请求
{
  "email": "chen.dawen@example.com",
  "phone": "+852 9123 4567"
}

// 响应
{
  "success": true,
  "patientId": "1",
  "message": "验证成功"
}
```

**GET /api/patient?id=1**
```json
// 响应
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
    "address": "香港九龍旺角...",
    "occupation": "金融分析師",
    "medicalHistory": "高血壓病史5年..."
  }
}
```

### 管理端 API

**GET /api/admin/patients** - 获取所有患者  
**POST /api/admin/patients** - 添加患者  
**PUT /api/admin/patients** - 更新患者  
**DELETE /api/admin/patients** - 删除患者

## 🔐 安全特性

- ✅ 参数化 SQL 查询（防注入）
- ✅ 输入验证和清理
- ✅ iframe sandbox 安全策略
- ✅ HTTPS 加密（Vercel 自动）
- ⚠️ 管理员密码建议生产环境加强

## 🎯 用户属性传递

### 当前实现
1. **URL 参数**：`?user_id=chen.dawen@example.com`
2. **postMessage**：`{ type: 'UserId', data: 'email' }`

### Agent 如何使用
- GPTBots 自动识别 user_id
- Tools 调用时 user_id 在 Header 中
- 对话日志关联到 user_id
- 事件回调携带 user_id

详见：[USER_PROPERTIES.md](./USER_PROPERTIES.md)

## 📱 响应式支持

- ✅ 桌面端（1920x1080）
- ✅ 平板端（iPad）
- ✅ 移动端（iPhone）
- ✅ 自适应布局
- ✅ 触摸友好

## 🌐 浏览器支持

- ✅ Chrome / Edge（推荐）
- ✅ Safari
- ✅ Firefox
- ✅ 移动浏览器

## 📖 文档清单

| 文档 | 说明 |
|------|------|
| README.md | 项目概述和快速开始 |
| goals.md | 原始需求文档 |
| 补充资料.md | GPTBots API 文档 |
| LOCAL_TESTING.md | 本地测试详细指南 |
| DEPLOYMENT.md | Vercel 部署步骤 |
| FEATURES.md | 功能技术实现详解 |
| ADMIN_GUIDE.md | 管理后台使用指南 |
| USER_PROPERTIES.md | 用户属性传递机制 |
| PROJECT_OVERVIEW.md | 本总览文档 |

## 🔧 环境配置

### 本地开发
```bash
# 无需配置，直接运行
npm install
npm run dev
```

### 生产环境（Vercel）
```bash
# 需要配置以下环境变量
POSTGRES_URL=xxx
POSTGRES_PRISMA_URL=xxx
POSTGRES_URL_NON_POOLING=xxx
POSTGRES_USER=xxx
POSTGRES_HOST=xxx
POSTGRES_PASSWORD=xxx
POSTGRES_DATABASE=xxx

# Vercel 部署后会自动配置
```

## 🎬 Demo 演示流程

### 演示场景 1：患者登录和对话
1. 打开 http://localhost:3000
2. 展示登录界面的美观设计
3. 输入测试账号登录
4. 展示 iframe 加载和 user_id 传递
5. 在 Console 中展示传递的患者信息
6. 演示与 Agent 的对话

### 演示场景 2：管理后台
1. 打开 http://localhost:3000/admin
2. 管理员登录
3. 展示患者列表
4. 演示搜索功能
5. 演示添加新患者
6. 演示编辑患者信息
7. 演示删除患者
8. 刷新前端，验证数据已保存

### 演示场景 3：完整流程
1. 在管理后台添加新患者
2. 退出管理后台
3. 使用新患者账号登录前端
4. 成功进入 iframe
5. 展示 user_id 正确传递

## 🚀 下一步优化建议

### 功能增强
1. **数据导入导出**
   - Excel 批量导入
   - CSV 格式导出
   - 数据备份功能

2. **用户属性同步**
   - 调用 GPTBots 用户属性 API
   - 实时同步患者信息
   - 配置 Tools 供 Agent 查询

3. **统计分析**
   - 患者年龄分布图
   - 病史类型统计
   - 使用时长分析

4. **权限管理**
   - 多级管理员权限
   - 操作日志记录
   - 审计追踪

5. **国际化**
   - 中英文切换
   - 繁简体切换
   - 时区处理

### 安全加强
1. 使用 JWT Token
2. 密码加密存储
3. API 速率限制
4. CSRF 防护
5. XSS 防护增强

### 性能优化
1. 数据分页加载
2. 虚拟滚动
3. 图片懒加载
4. CDN 加速
5. 缓存策略

## 📞 支持

- GitHub: https://github.com/CurtisYoung18
- Vercel: 同一账号
- GPTBots Agent: https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html

## 📊 项目状态

- ✅ **核心功能**：100% 完成
- ✅ **文档**：100% 完成
- ✅ **本地测试**：通过
- ⏳ **生产部署**：待部署
- ⏳ **用户反馈**：待收集

---

**项目版本**：v1.0  
**最后更新**：2025-10-10  
**开发者**：Curtis Young  
**平台**：Vercel + Next.js + GPTBots

