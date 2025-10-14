#!/bin/bash

# 环境变量生成助手
# 帮助快速生成 Vercel 环境变量配置

echo "🔧 Vercel 环境变量配置助手"
echo "================================"
echo ""

# 提示用户输入 Neon 连接字符串
echo "📝 请从 Neon Console 复制您的数据库连接字符串"
echo "示例: postgres://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
echo ""
read -p "请粘贴您的 Neon 连接字符串: " NEON_URL

# 解析连接字符串
if [[ $NEON_URL =~ postgres://([^:]+):([^@]+)@([^/]+)/([^\?]+) ]]; then
  POSTGRES_USER="${BASH_REMATCH[1]}"
  POSTGRES_PASSWORD="${BASH_REMATCH[2]}"
  POSTGRES_HOST="${BASH_REMATCH[3]}"
  POSTGRES_DATABASE="${BASH_REMATCH[4]}"
  
  echo ""
  echo "✅ 解析成功！"
  echo ""
  echo "================================"
  echo "📋 复制以下内容到 Vercel Environment Variables："
  echo "================================"
  echo ""
  echo "1. GPTBOTS_API_KEY"
  echo "   Value: app-uwMHXO95dlUZeUKkM7C8VtTW"
  echo ""
  echo "2. POSTGRES_URL"
  echo "   Value: ${NEON_URL}"
  echo ""
  echo "3. POSTGRES_PRISMA_URL"
  echo "   Value: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}/${POSTGRES_DATABASE}?pgbouncer=true&connect_timeout=15"
  echo ""
  echo "4. POSTGRES_URL_NON_POOLING"
  echo "   Value: ${NEON_URL}"
  echo ""
  echo "5. POSTGRES_USER"
  echo "   Value: ${POSTGRES_USER}"
  echo ""
  echo "6. POSTGRES_HOST"
  echo "   Value: ${POSTGRES_HOST}"
  echo ""
  echo "7. POSTGRES_PASSWORD"
  echo "   Value: ${POSTGRES_PASSWORD}"
  echo "   ⚠️  建议设为 Secret (加密)"
  echo ""
  echo "8. POSTGRES_DATABASE"
  echo "   Value: ${POSTGRES_DATABASE}"
  echo ""
  echo "================================"
  echo ""
  
  # 生成 .env.local 文件
  cat > .env.local << EOF
# GPTBots API
GPTBOTS_API_KEY=app-uwMHXO95dlUZeUKkM7C8VtTW

# Neon Postgres Database
POSTGRES_URL=${NEON_URL}
POSTGRES_PRISMA_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}/${POSTGRES_DATABASE}?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=${NEON_URL}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_HOST=${POSTGRES_HOST}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DATABASE=${POSTGRES_DATABASE}
EOF
  
  echo "✅ .env.local 文件已生成（用于本地开发）"
  echo ""
  echo "📝 接下来的步骤："
  echo "1. 复制上面的环境变量到 Vercel Dashboard"
  echo "2. 在 Vercel → Settings → Environment Variables 中逐个添加"
  echo "3. 每个变量都选择 Production + Preview + Development"
  echo "4. 在 Neon SQL Editor 中运行 sql/init.sql"
  echo "5. 点击 Vercel 的 Redeploy 按钮"
  echo ""
  echo "🚀 部署完成后访问您的网站测试登录！"
  
else
  echo "❌ 解析失败！请检查连接字符串格式"
  echo ""
  echo "正确格式应该是："
  echo "postgres://username:password@host/database?sslmode=require"
fi

