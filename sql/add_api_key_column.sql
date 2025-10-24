-- 添加 API Key 字段到 users 表
-- 用于为不同用户分配不同性能的 AI agent

-- 添加 api_key 字段（用于 GPTBots API）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS api_key VARCHAR(500);

-- 为现有 admin 用户设置默认值（可选）
-- UPDATE users SET api_key = 'your-default-api-key' WHERE account = 'admin';

-- 说明：
-- 1. 在 Neon 控制台运行这个 SQL 脚本来更新表结构
-- 2. api_key: 存储用户的 GPTBots API Key
-- 3. 一个 API Key 对应一个 Bot，无需单独存储 Bot ID
-- 4. 不同用户可以配置不同的 API Key，从而使用不同性能的 agent
-- 5. 如果字段已存在，IF NOT EXISTS 会防止重复添加
-- 6. 留空则使用环境变量 GPTBOTS_API_KEY 中的默认配置

