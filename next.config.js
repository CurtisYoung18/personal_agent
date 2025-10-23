/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 增加 API 路由的请求体大小限制
  api: {
    bodyParser: {
      sizeLimit: '10mb', // 允许最大 10MB 的请求体
    },
  },
}

module.exports = nextConfig

