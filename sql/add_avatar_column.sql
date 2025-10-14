-- 添加 avatar_url 字段到现有的 users 表
-- 如果您已经有用户数据，运行此脚本来更新表结构

-- 添加 avatar_url 列（如果不存在）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- 更新现有的 admin 用户，设置默认头像
UPDATE users 
SET avatar_url = '/imgs/4k_5.png' 
WHERE account = 'admin' AND avatar_url IS NULL;

-- 说明：
-- 1. 此脚本用于给现有的 users 表添加 avatar_url 字段
-- 2. 如果您是全新安装，请直接使用 init.sql
-- 3. 如果您已有用户数据，使用此脚本来升级表结构

