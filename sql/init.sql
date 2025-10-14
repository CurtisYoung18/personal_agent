-- Personal Agent 用戶認證表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  account VARCHAR(100) UNIQUE NOT NULL,       -- 帳號（唯一）
  password VARCHAR(255) NOT NULL,             -- 密碼
  name VARCHAR(100),                          -- 用戶名稱（可選）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP                        -- 最後登入時間
);

-- 創建索引以提高查詢性能
CREATE INDEX idx_account ON users(account);

-- 插入默認測試帳號
-- 密碼都是 "password123"（實際部署時請使用加密）
INSERT INTO users (account, password, name) VALUES
  ('admin', 'admin123', 'Curtis');

-- 說明：
-- 1. 這個 SQL 腳本用於初始化 Vercel Postgres 數據庫
-- 2. 部署到 Vercel 後，您需要在 Vercel 控制台中運行這個腳本
-- 3. 或者使用 Vercel Postgres 的 Query 功能直接執行
-- 4. 實際部署時，密碼應該使用 bcrypt 或其他加密方式存儲

