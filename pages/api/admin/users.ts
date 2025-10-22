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
        SELECT id, account, name, avatar_url, created_at, last_login
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
      const { account, password, name, avatar_url } = req.body

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
        INSERT INTO users (account, password, name, avatar_url)
        VALUES (${account}, ${password}, ${name || null}, ${avatar_url || null})
        RETURNING id, account, name, avatar_url
      `

      return res.status(201).json({
        success: true,
        user: result.rows[0],
        message: '用户添加成功',
      })
    }

    // PUT - 更新用户信息
    if (req.method === 'PUT') {
      const { id, account, password, name, avatar_url } = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          message: '缺少用户 ID',
        })
      }

      // 检查账号是否被其他用户使用
      if (account) {
        const existing = await sql`
          SELECT id FROM users WHERE account = ${account} AND id != ${id}
        `

        if (existing.rows.length > 0) {
          return res.status(409).json({
            success: false,
            message: '该账号已被其他用户使用',
          })
        }
      }

      // 构建更新查询
      const updates = []
      const values: any[] = []
      
      if (account !== undefined) {
        updates.push(`account = $${updates.length + 1}`)
        values.push(account)
      }
      if (password !== undefined) {
        updates.push(`password = $${updates.length + 1}`)
        values.push(password)
      }
      if (name !== undefined) {
        updates.push(`name = $${updates.length + 1}`)
        values.push(name || null)
      }
      if (avatar_url !== undefined) {
        updates.push(`avatar_url = $${updates.length + 1}`)
        values.push(avatar_url || null)
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: '没有要更新的字段',
        })
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`)
      values.push(id)

      const query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING id, account, name, avatar_url
      `

      const result = await sql.query(query, values)

      return res.status(200).json({
        success: true,
        user: result.rows[0],
        message: '用户更新成功',
      })
    }

    // DELETE - 删除用户
    if (req.method === 'DELETE') {
      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          message: '缺少用户 ID',
        })
      }

      const userId = parseInt(id, 10)
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: '无效的用户 ID',
        })
      }

      await sql`
        DELETE FROM users WHERE id = ${userId}
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
    console.error('❌ Admin API error:', error)
    
    // 检查是否是数据库字段长度限制错误
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('value too long') || errorMessage.includes('string data right truncation')) {
      return res.status(400).json({
        success: false,
        message: '头像数据过大，请使用更小的图片（建议 < 1MB）或使用图片 URL',
        error: errorMessage,
      })
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试',
      error: errorMessage,
    })
  }
}

