# 故障排查指南

## 🔧 常见问题及解决方案

### 问题 1: 登录页面显示旧的邮箱/电话登录

**症状**：
- 登录页面仍显示邮箱和电话输入框
- Logo 显示旧的图片
- 界面没有更新

**原因**：浏览器缓存或开发服务器未重启

**解决方案**：

#### 方案 A：清除浏览器缓存（推荐）

**Chrome/Edge**：
1. 按 `Cmd + Shift + Delete`（Mac）或 `Ctrl + Shift + Delete`（Windows）
2. 选择"缓存的图片和文件"
3. 点击"清除数据"
4. 或者直接按 `Cmd + Shift + R`（Mac）或 `Ctrl + Shift + R`（Windows）强制刷新

**Safari**：
1. 按 `Cmd + Option + E` 清空缓存
2. 然后按 `Cmd + R` 刷新页面

**Firefox**：
1. 按 `Cmd + Shift + Delete`（Mac）或 `Ctrl + Shift + Delete`（Windows）
2. 选择"缓存"
3. 点击"立即清除"

#### 方案 B：使用隐身/无痕模式

1. Chrome: `Cmd + Shift + N`（Mac）或 `Ctrl + Shift + N`（Windows）
2. Safari: `Cmd + Shift + N`
3. Firefox: `Cmd + Shift + P`（Mac）或 `Ctrl + Shift + P`（Windows）

#### 方案 C：重启开发服务器

```bash
# 停止当前服务器（Ctrl + C）
# 清除 Next.js 缓存
rm -rf .next

# 重新启动
npm run dev
```

#### 方案 D：完全清理并重建

```bash
# 停止开发服务器
# 清除所有缓存
rm -rf .next
rm -rf node_modules/.cache

# 重新启动
npm run dev
```

---

### 问题 2: 页面显示"中毒调查"等旧内容

**症状**：
- 页面仍显示医疗相关内容
- CSS 类名包含 "patient"

**原因**：浏览器缓存的旧 CSS 文件

**解决方案**：

1. **硬刷新页面**：
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

2. **清除浏览器缓存**（见上方方案 A）

3. **检查文件是否正确更新**：
   ```bash
   # 检查登录页面
   cat pages/index.tsx | grep -i "phone\|email\|電話\|電郵"
   # 应该没有结果
   
   # 检查是否有旧文件
   ls -la pages/patient.tsx
   # 应该显示 "No such file"
   ```

---

### 问题 3: Logo 图片不显示

**症状**：
- Logo 位置显示空白或损坏的图片图标

**解决方案**：

1. **确认图片文件存在**：
   ```bash
   ls -la public/imgs/bg_4.avif
   ```

2. **检查图片路径**：
   - 确认 `pages/index.tsx` 中的路径是 `/imgs/bg_4.avif`
   - 确认 `public/imgs/` 文件夹存在

3. **清除图片缓存**：
   - 在浏览器中按 `Cmd/Ctrl + Shift + R` 强制刷新

---

### 问题 4: API 调用失败

**症状**：
- 登录后显示错误
- 消息发送失败

**解决方案**：

1. **检查环境变量**：
   ```bash
   # 确认 .env.local 文件存在
   cat .env.local
   ```

2. **验证 API Key**：
   ```env
   GPTBOTS_API_KEY=app-uwMHXO95dlUZeUKkM7C8VtTW
   ```

3. **检查数据库连接**：
   - 确认 Neon 数据库正常运行
   - 验证连接字符串正确

---

### 问题 5: 开发服务器无法启动

**症状**：
- `npm run dev` 报错
- 端口被占用

**解决方案**：

1. **检查端口占用**：
   ```bash
   # Mac/Linux
   lsof -i :3000
   
   # 杀死占用端口的进程
   kill -9 <PID>
   ```

2. **重新安装依赖**：
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. **使用不同端口**：
   ```bash
   PORT=3001 npm run dev
   ```

---

## 🚀 完整重置步骤

如果以上方法都无效，执行完整重置：

```bash
# 1. 停止所有 Node 进程
killall node

# 2. 清除所有缓存
rm -rf .next
rm -rf node_modules
rm -rf node_modules/.cache
rm package-lock.json

# 3. 重新安装
npm install

# 4. 启动开发服务器
npm run dev
```

然后在浏览器中：
1. 清除所有缓存（Cmd/Ctrl + Shift + Delete）
2. 关闭所有标签页
3. 重新访问 `http://localhost:3000`

---

## ✅ 验证修改成功

访问 `http://localhost:3000`，应该看到：

### 登录页面
- ✅ 圆形 Logo（bg_4.avif）
- ✅ 标题："個人工作助手"
- ✅ 副标题："Personal Agent"
- ✅ 登录表单：账号 + 密码（不是邮箱/电话）

### 聊天页面
- ✅ 全屏背景图（wallpaper.jpg）
- ✅ 顶部显示："個人工作助手 - AI 智能聊天系統"
- ✅ 聊天气泡界面
- ✅ 实时消息显示

---

## 📞 仍然有问题？

1. **检查 Git 状态**：
   ```bash
   git status
   ```

2. **查看文件最后修改时间**：
   ```bash
   ls -lt pages/index.tsx
   ls -lt pages/chat.tsx
   ```

3. **对比文件内容**：
   ```bash
   # 应该看到 "account" 和 "password"，不应该有 "phone" 或 "email"
   grep -n "account\|password" pages/index.tsx
   ```

4. **查看浏览器控制台**：
   - 按 F12 打开开发者工具
   - 查看 Console 和 Network 标签
   - 检查是否有 404 错误（找不到图片）

---

**最后建议**：如果所有方法都试过了还是不行，尝试在不同的浏览器中打开（Chrome、Safari、Firefox），这样可以排除浏览器缓存问题。

