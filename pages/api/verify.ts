import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { account, password } = req.body

  // 必須提供帳號和密碼
  if (!account || !password) {
    return res.status(400).json({
      success: false,
      message: '請提供帳號和密碼',
    })
  }

  try {
    // 使用真實數據庫查詢
    const result = await sql`
      SELECT id, account, name FROM users
      WHERE account = ${account} AND password = ${password}
      LIMIT 1
    `
    
    const user = result.rows.length > 0 ? result.rows[0] : null

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '帳號或密碼不正確',
      })
    }

    // 更新最後登入時間
    await sql`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${user.id}
    `

    return res.status(200).json({
      success: true,
      userId: user.id.toString(),
      account: user.account,
      name: user.name,
      message: '登入成功',
    })
  } catch (error) {
    console.error('Verification error:', error)
    return res.status(500).json({
      success: false,
      message: '伺服器錯誤，請稍後重試',
    })
  }
}

