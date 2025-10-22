import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { conversationId, page = '1', pageSize = '100' } = req.query

  if (!conversationId) {
    return res.status(400).json({ success: false, message: 'conversationId is required' })
  }

  const apiKey = process.env.GPTBOTS_API_KEY
  const endpoint = process.env.GPTBOTS_ENDPOINT || 'sg'

  if (!apiKey) {
    console.error('❌ GPTBOTS_API_KEY is not set')
    return res.status(500).json({ success: false, message: 'API Key not configured' })
  }

  try {
    const params = new URLSearchParams({
      conversation_id: conversationId as string,
      page: page as string,
      page_size: pageSize as string,
    })

    const url = `https://api-${endpoint}.gptbots.ai/v2/messages?${params.toString()}`
    
    console.log('📋 获取对话消息:', { conversationId, page, pageSize })

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ 获取对话消息失败:', data)
      return res.status(response.status).json({ 
        success: false, 
        message: data.message || 'Failed to fetch conversation messages' 
      })
    }

    console.log('✅ 对话消息获取成功，共', data.total, '条')
    return res.status(200).json({ 
      success: true, 
      messages: data.conversation_content || [],
      total: data.total || 0
    })

  } catch (error) {
    console.error('❌ 获取对话消息错误:', error)
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}

