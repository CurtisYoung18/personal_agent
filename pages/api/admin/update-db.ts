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
    console.log('开始更新数据库结构...')

    // 检查 avatar_url 字段是否存在
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'avatar_url'
    `

    if (checkColumn.rows.length === 0) {
      // 字段不存在，添加字段
      console.log('avatar_url 字段不存在，正在添加...')
      
      await sql`
        ALTER TABLE users 
        ADD COLUMN avatar_url VARCHAR(500)
      `
      
      console.log('✅ avatar_url 字段添加成功')

      // 更新现有的 admin 用户
      await sql`
        UPDATE users 
        SET avatar_url = '/imgs/4k_5.png' 
        WHERE account = 'admin' AND avatar_url IS NULL
      `
      
      console.log('✅ 默认用户头像已设置')

      return res.status(200).json({
        success: true,
        message: '数据库更新成功！avatar_url 字段已添加。',
        updated: true,
      })
    } else {
      console.log('⚠️ avatar_url 字段已存在')
      return res.status(200).json({
        success: true,
        message: 'avatar_url 字段已存在，无需更新。',
        updated: false,
      })
    }
  } catch (error) {
    console.error('❌ 数据库更新失败:', error)
    return res.status(500).json({
      success: false,
      message: '数据库更新失败',
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

