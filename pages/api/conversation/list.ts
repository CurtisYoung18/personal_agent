import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { userId, startTime, endTime, page = '1', pageSize = '20' } = req.query

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' })
  }

  const apiKey = process.env.GPTBOTS_API_KEY
  const endpoint = process.env.GPTBOTS_ENDPOINT || 'sg'

  if (!apiKey) {
    console.error('❌ GPTBOTS_API_KEY is not set')
    return res.status(500).json({ success: false, message: 'API Key not configured' })
  }

  try {
    // 构建查询参数
    const params = new URLSearchParams({
      conversation_type: 'API',
      user_id: userId as string,
      start_time: startTime as string || '0',
      end_time: endTime as string || Date.now().toString(),
      page: page as string,
      page_size: pageSize as string,
    })

    const url = `https://api-${endpoint}.gptbots.ai/v1/bot/conversation/page?${params.toString()}`
    
    console.log('📋 获取对话列表:', { userId, page, pageSize })

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ 获取对话列表失败:', data)
      return res.status(response.status).json({ 
        success: false, 
        message: data.message || 'Failed to fetch conversation list' 
      })
    }

    console.log('✅ 对话列表获取成功，共', data.total, '条')
    return res.status(200).json({ 
      success: true, 
      list: data.list || [],
      total: data.total || 0
    })

  } catch (error) {
    console.error('❌ 获取对话列表错误:', error)
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}

