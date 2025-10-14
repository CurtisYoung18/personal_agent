import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: '缺少用戶 ID',
    })
  }

  try {
    // 使用真實數據庫查詢
    const result = await sql`
      SELECT id, account, name, last_login
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `
    
    const user = result.rows.length > 0 ? result.rows[0] : null

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '未找到用戶資訊',
      })
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id.toString(),
        account: user.account,
        name: user.name,
        lastLogin: user.last_login,
      },
    })
  } catch (error) {
    console.error('Database error:', error)
    return res.status(500).json({
      success: false,
      message: '伺服器錯誤，請稍後重試',
    })
  }
}

