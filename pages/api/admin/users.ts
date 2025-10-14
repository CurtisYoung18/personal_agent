import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // GET - 获取所有用户
    if (req.method === 'GET') {
      const result = await sql`
        SELECT id, account, name, created_at, last_login
        FROM users
        ORDER BY id ASC
      `

      return res.status(200).json({
        success: true,
        users: result.rows,
      })
    }

    // POST - 添加新用户
    if (req.method === 'POST') {
      const { account, password, name } = req.body

      if (!account || !password) {
        return res.status(400).json({
          success: false,
          message: '账号和密码不能为空',
        })
      }

      // 检查账号是否已存在
      const existing = await sql`
        SELECT id FROM users WHERE account = ${account}
      `

      if (existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: '该账号已存在',
        })
      }

      // 插入新用户
      const result = await sql`
        INSERT INTO users (account, password, name)
        VALUES (${account}, ${password}, ${name || null})
        RETURNING id, account, name
      `

      return res.status(201).json({
        success: true,
        user: result.rows[0],
        message: '用户添加成功',
      })
    }

    // DELETE - 删除用户
    if (req.method === 'DELETE') {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({
          success: false,
          message: '缺少用户 ID',
        })
      }

      await sql`
        DELETE FROM users WHERE id = ${id}
      `

      return res.status(200).json({
        success: true,
        message: '用户删除成功',
      })
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  } catch (error) {
    console.error('Admin API error:', error)
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

