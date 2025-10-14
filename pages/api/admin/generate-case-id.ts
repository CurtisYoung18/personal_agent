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
    
    // 生成事件简写（取事件摘要的首字母或关键词）
    // 例如："The Seafood House 10月8日晚宴" => "SEAFOOD"
    const eventKeyword = extractEventKeyword(event_summary)
    
    // 生成 case_id: HKHP_{EVENT}_{序号}
    const caseId = `HKHP_${eventKeyword}_${nextNumber}`
    
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

// 提取事件关键词
function extractEventKeyword(eventSummary: string): string {
  // 尝试提取餐厅名或关键词
  // 优先匹配英文大写词
  const englishMatch = eventSummary.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/)
  if (englishMatch) {
    return englishMatch[0].replace(/\s+/g, '').toUpperCase().substring(0, 10)
  }
  
  // 如果没有英文，使用日期
  const dateMatch = eventSummary.match(/(\d+)月(\d+)日/)
  if (dateMatch) {
    return `${dateMatch[1].padStart(2, '0')}${dateMatch[2].padStart(2, '0')}`
  }
  
  // 默认使用事件的前几个字符
  return 'EVENT'
}

