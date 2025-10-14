-- Personal Agent 用户认证表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  account VARCHAR(100) UNIQUE NOT NULL,       -- 账号（唯一）
  password VARCHAR(255) NOT NULL,             -- 密码
  name VARCHAR(100),                          -- 用户名称（可选）
  avatar_url VARCHAR(500),                    -- 头像 URL（可选，默认使用 4k_5.png）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP                        -- 最后登入时间
);

-- 创建索引以提高查询性能
CREATE INDEX idx_account ON users(account);


INSERT INTO users (account, password, name, avatar_url) VALUES
  ('admin', 'admin123', 'Curtis', '/imgs/4k_5.png');

-- 说明：
-- 1. 这个 SQL 脚本用于初始化 Vercel Postgres 数据库
-- 2. 部署到 Vercel 后，您需要在 Vercel 控制台中运行这个脚本
-- 3. 或者使用 Vercel Postgres 的 Query 功能直接执行
-- 4. 实际部署时，密码应该使用 bcrypt 或其他加密方式存储
-- 5. avatar_url 存储头像路径，可以是本地路径(/imgs/xxx.png)或外部 URL

