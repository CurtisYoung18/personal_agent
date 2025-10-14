import { NextApiRequest, NextApiResponse } from 'next'

// 发送消息到 GPTBots（streaming）
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { conversationId, message } = req.body

  if (!conversationId || !message) {
    return res.status(400).json({
      success: false,
      message: '缺少對話 ID 或消息內容',
    })
  }

  try {
    const apiKey = process.env.GPTBOTS_API_KEY
    if (!apiKey) {
      throw new Error('GPTBOTS_API_KEY not configured')
    }

    // 调用 GPTBots API 发送消息（streaming）
    const response = await fetch('https://api-sg.gptbots.ai/v2/conversation/message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        response_mode: 'streaming',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: message,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('GPTBots API Error:', errorData)
      return res.status(response.status).json({
        success: false,
        message: errorData.message || '發送消息失敗',
      })
    }

    // 设置 SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // 流式传输响应
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No response body')
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        res.write(chunk)
      }
    } finally {
      reader.releaseLock()
    }

    res.end()
  } catch (error) {
    console.error('Send message error:', error)
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: '伺服器錯誤，請稍後重試',
      })
    }
  }
}
