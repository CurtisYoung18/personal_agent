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
    // 使用真实数据库查询
    const result = await sql`
      SELECT id, account, name, avatar_url, last_login
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `
    
    const user = result.rows.length > 0 ? result.rows[0] : null

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '未找到用户信息',
      })
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id.toString(),
        account: user.account,
        name: user.name,
        avatar_url: user.avatar_url || null, // 确保兼容旧数据
        lastLogin: user.last_login,
      },
    })
  } catch (error) {
    console.error('❌ Database error:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    
    // 如果是字段不存在的错误，尝试不使用 avatar_url 查询
    try {
      const fallbackResult = await sql`
        SELECT id, account, name, last_login
        FROM users
        WHERE id = ${id}
        LIMIT 1
      `
      
      const fallbackUser = fallbackResult.rows.length > 0 ? fallbackResult.rows[0] : null
      
      if (fallbackUser) {
        console.log('⚠️ 使用回退查询（没有 avatar_url 字段）')
        return res.status(200).json({
          success: true,
          user: {
            id: fallbackUser.id.toString(),
            account: fallbackUser.account,
            name: fallbackUser.name,
            avatar_url: null,
            lastLogin: fallbackUser.last_login,
          },
        })
      }
    } catch (fallbackError) {
      console.error('❌ Fallback query also failed:', fallbackError)
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器错误，请稍后重试',
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

