import { NextApiRequest, NextApiResponse } from 'next'

// 创建对话 ID
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: '缺少用户 ID',
    })
  }

  try {
    const apiKey = process.env.GPTBOTS_API_KEY
    if (!apiKey) {
      throw new Error('GPTBOTS_API_KEY not configured')
    }

    // 调用 GPTBots API 创建对话
    const response = await fetch('https://api-sg.gptbots.ai/v1/conversation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('GPTBots API Error:', data)
      return res.status(response.status).json({
        success: false,
        message: data.message || '創建對話失敗',
      })
    }

    return res.status(200).json({
      success: true,
      conversationId: data.conversation_id,
      message: '對話創建成功',
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    return res.status(500).json({
      success: false,
      message: '伺服器錯誤，請稍後重試',
    })
  }
}

