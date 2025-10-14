import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { event_date, event_summary } = req.body

  if (!event_date || !event_summary) {
    return res.status(400).json({
      success: false,
      message: '缺少事件日期或事件詳情',
    })
  }

  try {
    console.log('🔍 生成 case_id:', { event_date, event_summary })
    
    // 查找该事件下已有的患者数量
    const result = await sql`
      SELECT COUNT(*) as count
      FROM patients
      WHERE event_date = ${event_date} AND event_summary = ${event_summary}
    `
    
    const existingCount = parseInt(result.rows[0].count, 10)
    const nextNumber = existingCount + 1
    
    // 直接使用事件详情作为 case_id 的中间部分
    // 例如："The Seafood House 10月8日晚宴" => "HKHP_The Seafood House 10月8日晚宴_1"
    const caseId = `HKHP_${event_summary}_${nextNumber}`
    
    console.log(`✅ 生成的 case_id: ${caseId} (現有患者: ${existingCount})`)
    
    return res.status(200).json({
      success: true,
      caseId,
      eventCount: existingCount,
      nextNumber,
    })
  } catch (error) {
    console.error('❌ 生成 case_id 失敗:', error)
    return res.status(500).json({
      success: false,
      message: '生成案例編號失敗',
    })
  }
}

