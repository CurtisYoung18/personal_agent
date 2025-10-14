#!/bin/bash

# 清除缓存脚本
# 用于解决浏览器显示旧界面的问题

echo "🧹 开始清除缓存..."
echo ""

# 清除 Next.js 构建缓存
if [ -d ".next" ]; then
  echo "✅ 清除 .next 文件夹..."
  rm -rf .next
  echo "   完成！"
else
  echo "ℹ️  .next 文件夹不存在，跳过"
fi

# 清除 node_modules 缓存
if [ -d "node_modules/.cache" ]; then
  echo "✅ 清除 node_modules/.cache..."
  rm -rf node_modules/.cache
  echo "   完成！"
else
  echo "ℹ️  node_modules/.cache 不存在，跳过"
fi

echo ""
echo "🎉 缓存清除完成！"
echo ""
echo "📝 接下来请："
echo "1. 重启开发服务器: npm run dev"
echo "2. 在浏览器中按 Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows) 强制刷新"
echo "3. 或使用隐身/无痕模式访问: http://localhost:3000"
echo ""
echo "✨ 现在应该能看到正确的登录界面了（账号+密码，圆形Logo）"

