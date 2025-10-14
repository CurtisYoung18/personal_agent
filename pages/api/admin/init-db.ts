import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // 1. 删除旧的 patients 表（如果存在）
    await sql`DROP TABLE IF EXISTS patients`

    // 2. 创建 users 表（如果不存在）
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        account VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `

    // 3. 创建索引
    await sql`
      CREATE INDEX IF NOT EXISTS idx_account ON users(account)
    `

    // 4. 检查是否已有测试用户
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`
    const userCount = parseInt(existingUsers.rows[0].count)

    let message = '数据库表已创建/更新'

    // 5. 如果没有用户，插入测试用户
    if (userCount === 0) {
      await sql`
        INSERT INTO users (account, password, name) VALUES
          ('admin', 'admin123', '管理员'),
          ('user1', 'password1', '用户一'),
          ('demo', 'demo123', '演示账号')
        ON CONFLICT (account) DO NOTHING
      `
      message = '数据库初始化成功，已添加 3 个测试用户'
    }

    // 6. 获取当前所有用户
    const users = await sql`
      SELECT id, account, name, created_at, last_login
      FROM users
      ORDER BY id ASC
    `

    return res.status(200).json({
      success: true,
      message,
      userCount: users.rows.length,
      users: users.rows,
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return res.status(500).json({
      success: false,
      message: '数据库初始化失败',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

