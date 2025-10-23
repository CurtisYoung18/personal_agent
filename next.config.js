/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // API 路由配置（Vercel 免费版限制为 4.5MB）
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
}

module.exports = nextConfig

