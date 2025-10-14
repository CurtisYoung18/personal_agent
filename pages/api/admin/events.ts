import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET - 获取所有已有事件（不重复）
  if (req.method === 'GET') {
    try {
      console.log('🔍 Admin: 獲取已有事件列表...')
      const result = await sql`
        SELECT DISTINCT event_date, event_location, event_summary
        FROM patients
        WHERE event_date IS NOT NULL AND event_summary IS NOT NULL
        ORDER BY event_date DESC
      `
      console.log(`✅ Admin: 找到 ${result.rows.length} 個不同的事件`)
      
      const events = result.rows.map((row: any) => {
        // 格式化日期为 YYYY-MM-DD，去掉时间戳
        let formattedDate = row.event_date
        if (row.event_date) {
          const dateObj = new Date(row.event_date)
          const year = dateObj.getFullYear()
          const month = String(dateObj.getMonth() + 1).padStart(2, '0')
          const day = String(dateObj.getDate()).padStart(2, '0')
          formattedDate = `${year}-${month}-${day}`
        }
        
        return {
          date: formattedDate,
          location: row.event_location || '',
          summary: row.event_summary,
        }
      })

      return res.status(200).json({
        success: true,
        events,
      })
    } catch (error) {
      console.error('❌ Admin: 獲取事件列表失敗:', error)
      return res.status(500).json({
        success: false,
        message: '獲取事件列表失敗',
      })
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' })
}

