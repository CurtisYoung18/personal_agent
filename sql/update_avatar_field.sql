-- 扩展 avatar_url 字段以支持 base64 图片
-- base64 图片大小约为原图的 133%，2MB 图片转 base64 约 2.7MB
-- TEXT 类型可以存储最大 1GB 的数据

ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;

-- 说明：
-- 1. 将 avatar_url 从 VARCHAR(500) 改为 TEXT 类型
-- 2. TEXT 类型可以存储大量文本，适合存储 base64 编码的图片
-- 3. 如果用户上传 2MB 的图片，base64 编码后约 2.7MB，完全可以存储
-- 4. 如果是 URL，TEXT 类型同样适用

