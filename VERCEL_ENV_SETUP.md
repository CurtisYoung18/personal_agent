# Vercel 环境变量配置指南

## ⚠️ 重要：必须手动配置环境变量

部署前需要在 Vercel Dashboard 中手动添加以下环境变量。

---

## 📝 步骤 1: 获取 Neon 数据库连接信息

1. 登录到 [Neon Console](https://console.neon.tech/)
2. 选择您的项目
3. 点击 **Connection Details** 或 **Dashboard**
4. 复制连接字符串（Connection String）

示例连接字符串：
```
postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

---

## 📝 步骤 2: 在 Vercel 中配置环境变量

### 方法：通过 Vercel Dashboard（推荐）

1. **访问您的 Vercel 项目**
   - 进入 [Vercel Dashboard](https://vercel.com/dashboard)
   - 选择 `personal_agent` 项目

2. **打开设置**
   - 点击项目顶部的 **Settings** 标签
   - 在左侧菜单选择 **Environment Variables**

3. **添加以下环境变量**（逐个添加）：

#### 🔑 GPTBots API Key
```
Name: GPTBOTS_API_KEY
Value: app-uwMHXO95dlUZeUKkM7C8VtTW
Environment: Production, Preview, Development (全选)
```

#### 🗄️ Neon 数据库连接（从您的 Neon 项目复制）

##### 1. POSTGRES_URL
```
Name: POSTGRES_URL
Value: postgres://username:password@your-host.neon.tech/your-database?sslmode=require
Environment: Production, Preview, Development (全选)
```

##### 2. POSTGRES_PRISMA_URL
```
Name: POSTGRES_PRISMA_URL
Value: postgres://username:password@your-host.neon.tech/your-database?pgbouncer=true&connect_timeout=15
Environment: Production, Preview, Development (全选)
```

##### 3. POSTGRES_URL_NON_POOLING
```
Name: POSTGRES_URL_NON_POOLING
Value: postgres://username:password@your-host.neon.tech/your-database?sslmode=require
Environment: Production, Preview, Development (全选)
```

##### 4. POSTGRES_USER
```
Name: POSTGRES_USER
Value: your_username (从 Neon 连接字符串中提取)
Environment: Production, Preview, Development (全选)
```

##### 5. POSTGRES_HOST
```
Name: POSTGRES_HOST
Value: ep-xxx-xxx.region.aws.neon.tech (从 Neon 连接字符串中提取)
Environment: Production, Preview, Development (全选)
```

##### 6. POSTGRES_PASSWORD
```
Name: POSTGRES_PASSWORD
Value: your_password (从 Neon 连接字符串中提取)
Environment: Production, Preview, Development (全选)
Type: Secret (建议设为加密)
```

##### 7. POSTGRES_DATABASE
```
Name: POSTGRES_DATABASE
Value: your_database_name (从 Neon 连接字符串中提取)
Environment: Production, Preview, Development (全选)
```

---

## 📝 步骤 3: 解析 Neon 连接字符串

如果您的 Neon 连接字符串是：
```
postgres://myuser:mypassword123@ep-cool-morning-123456.us-east-2.aws.neon.tech/mydatabase?sslmode=require
```

则提取如下：
- **POSTGRES_USER**: `myuser`
- **POSTGRES_PASSWORD**: `mypassword123`
- **POSTGRES_HOST**: `ep-cool-morning-123456.us-east-2.aws.neon.tech`
- **POSTGRES_DATABASE**: `mydatabase`
- **POSTGRES_URL**: 完整的连接字符串
- **POSTGRES_PRISMA_URL**: 完整连接字符串 + `?pgbouncer=true&connect_timeout=15`
- **POSTGRES_URL_NON_POOLING**: 完整的连接字符串

---

## 📝 步骤 4: 初始化数据库

在 Neon SQL Editor 中运行：

```sql
-- 删除旧表（如果存在）
DROP TABLE IF EXISTS patients;

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

-- 插入测试用户
INSERT INTO users (account, password, name) VALUES
  ('admin', 'admin123', '管理员'),
  ('user1', 'password1', '用户一'),
  ('demo', 'demo123', '演示账号')
ON CONFLICT (account) DO NOTHING;
```

---

## 📝 步骤 5: 重新部署

1. **保存所有环境变量后**
2. 在 Vercel Dashboard 点击 **Redeploy** 按钮
3. 或者推送新的提交到 GitHub 触发自动部署

---

## ✅ 验证配置

配置完成后，您应该能够：

1. ✅ 访问您的 Vercel 部署 URL
2. ✅ 看到登录页面（圆形 Logo + 账号密码登录）
3. ✅ 使用测试账号登录：
   - 账号: `admin` / 密码: `admin123`
   - 账号: `user1` / 密码: `password1`
   - 账号: `demo` / 密码: `demo123`
4. ✅ 登录后能够与 AI 聊天

---

## 🐛 常见问题

### 问题 1: "POSTGRES_URL is not defined"

**原因**: 环境变量未正确配置

**解决**:
1. 检查 Vercel Dashboard → Settings → Environment Variables
2. 确认所有变量都已添加
3. 确认选择了正确的环境（Production/Preview/Development）
4. 点击 **Redeploy** 重新部署

### 问题 2: "Connection refused" 或数据库连接失败

**原因**: 数据库连接字符串错误

**解决**:
1. 回到 Neon Console 重新复制连接字符串
2. 确认包含 `?sslmode=require`
3. 确认密码中的特殊字符是否需要 URL 编码
4. 测试连接：在 Neon SQL Editor 中能否查询 `SELECT * FROM users;`

### 问题 3: "Table 'users' doesn't exist"

**原因**: 数据库未初始化

**解决**:
1. 在 Neon SQL Editor 中运行 `sql/init.sql` 文件内容
2. 验证表创建成功：`\dt` 或 `SELECT * FROM users;`

### 问题 4: GPTBots API 调用失败

**原因**: API Key 未配置或错误

**解决**:
1. 确认 `GPTBOTS_API_KEY` 值为：`app-uwMHXO95dlUZeUKkM7C8VtTW`
2. 检查 GPTBots 控制台确认 API Key 有效
3. 查看 Vercel 部署日志中的错误信息

---

## 📞 需要帮助？

查看详细的部署指南：
- 📄 [DEPLOYMENT.md](./DEPLOYMENT.md)
- 📄 [QUICKSTART.md](./QUICKSTART.md)
- 📄 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 🎯 快速检查清单

- [ ] Neon 数据库已创建
- [ ] `users` 表已创建（运行 `sql/init.sql`）
- [ ] 在 Vercel 中添加了 `GPTBOTS_API_KEY`
- [ ] 在 Vercel 中添加了所有 `POSTGRES_*` 变量
- [ ] 所有环境变量选择了 Production + Preview + Development
- [ ] 点击了 Redeploy 或推送了新提交
- [ ] 部署成功（状态显示绿色 ✓）
- [ ] 可以访问部署的网站
- [ ] 可以使用测试账号登录
- [ ] 可以发送消息并收到 AI 回复

完成所有步骤后，您的个人工作助手就部署成功了！🎉

