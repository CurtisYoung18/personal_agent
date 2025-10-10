# 部署指南

本项目使用 **Vercel** 平台部署，支持香港地区快速访问。

## 🚀 快速部署步骤

### 1. 准备工作

确保您已经：
- 有 GitHub 账号
- 有 Vercel 账号（可以用 GitHub 登录）

### 2. 推送代码到 GitHub

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Patient verification system"

# 创建 GitHub 仓库并推送（替换为您的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/hp-hk-demo.git
git branch -M main
git push -u origin main
```

### 3. 部署到 Vercel

#### 方式一：通过 Vercel 网站（推荐）

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Import Project"
3. 选择您的 GitHub 仓库
4. Vercel 会自动检测 Next.js 项目
5. 点击 "Deploy" 

#### 方式二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

### 4. 配置 Vercel Postgres 数据库

1. 在 Vercel 项目页面，进入 "Storage" 标签
2. 点击 "Create Database"
3. 选择 "Postgres"
4. 选择区域（建议选择 Hong Kong 或 Singapore）
5. 点击 "Create"

### 5. 初始化数据库

1. 在 Vercel Postgres 控制台中，点击 "Query"
2. 复制 `sql/init.sql` 文件的内容
3. 粘贴并执行

或者使用 Vercel CLI：

```bash
vercel env pull .env.local
npm install -g @vercel/postgres
# 然后手动执行 init.sql 中的语句
```

### 6. 配置 iframe URL

部署完成后，需要修改 agent iframe 的 URL：

1. 编辑 `pages/patient.tsx`
2. 找到第 37 行：
   ```typescript
   const baseUrl = 'YOUR_AGENT_IFRAME_URL'
   ```
3. 替换为您实际的 agent URL
4. 提交并推送到 GitHub，Vercel 会自动重新部署

## 🧪 测试账号

使用以下测试账号登录：

| 姓名 | 邮箱 | 电话 |
|------|------|------|
| 张三 | zhangsan@example.com | +852 9123 4567 |
| 李四 | lisi@example.com | +852 9234 5678 |
| 王五 | wangwu@example.com | +852 9345 6789 |

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入数据库连接信息

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 📝 数据库管理

### 添加新患者

```sql
INSERT INTO patients (name, email, phone, age, gender, medical_history) 
VALUES ('新患者', 'newpatient@example.com', '+852 9999 0000', 30, '女', '无');
```

### 查看所有患者

```sql
SELECT * FROM patients;
```

### 更新患者信息

```sql
UPDATE patients 
SET medical_history = '新的病史信息' 
WHERE email = 'zhangsan@example.com';
```

## 🌐 访问您的网站

部署成功后，您会获得一个 URL，格式如：
```
https://your-project-name.vercel.app
```

您可以：
1. 使用这个 URL 直接访问
2. 配置自定义域名（在 Vercel 项目设置中）

## 🔒 安全建议

1. **生产环境**：
   - 使用强密码管理数据库
   - 启用 HTTPS（Vercel 默认启用）
   - 考虑添加速率限制
   - 添加 CSRF 保护

2. **环境变量**：
   - 永远不要提交 `.env.local` 到 Git
   - 使用 Vercel 的环境变量管理

3. **数据库**：
   - 定期备份
   - 删除测试数据（生产环境）

## 🆘 常见问题

### Q: 部署后显示 500 错误
A: 检查 Vercel 日志，可能是数据库连接问题。确保已正确配置 Postgres 数据库。

### Q: 登录验证失败
A: 检查数据库中是否有对应的患者记录，确保邮箱和电话完全匹配。

### Q: iframe 显示空白
A: 检查 `pages/patient.tsx` 中的 iframe URL 是否正确配置。

### Q: 香港访问速度慢
A: Vercel 有全球 CDN，应该很快。如果慢，检查：
   - Vercel Postgres 区域选择
   - 浏览器网络设置

## 📞 技术支持

如有问题，请查看：
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Vercel Postgres 文档](https://vercel.com/docs/storage/vercel-postgres)

