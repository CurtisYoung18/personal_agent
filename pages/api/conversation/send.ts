import { NextApiRequest, NextApiResponse } from 'next'

// 配置 API 路由以支持更大的请求体
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
}

// 发送消息到 GPTBots（streaming 模式）
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { conversationId, userId, message, files } = req.body

  if (!message && (!files || files.length === 0)) {
    return res.status(400).json({
      success: false,
      message: '缺少消息内容或文件',
    })
  }

  try {
    const apiKey = process.env.GPTBOTS_API_KEY
    if (!apiKey) {
      throw new Error('GPTBOTS_API_KEY not configured')
    }

    // 构建消息内容数组
    const content: any[] = []
    
    // 添加文本消息（如果有）
    if (message && message.trim()) {
      content.push({
        type: 'text',
        text: message,
      })
    }
    
    // 添加文件（如果有）
    if (files && files.length > 0) {
      // 按类型分组文件
      const filesByType: { [key: string]: any[] } = {}
      
      files.forEach((file: any) => {
        if (!filesByType[file.type]) {
          filesByType[file.type] = []
        }
        filesByType[file.type].push({
          base64_content: file.base64,
          format: file.format,
          name: file.name
        })
      })
      
      // 添加分组后的文件到 content
      Object.entries(filesByType).forEach(([type, items]) => {
        content.push({
          type: type,
          [type]: items
        })
      })
    }

    // 构建请求体
    const requestBody: any = {
      response_mode: 'streaming',  // 使用 streaming 模式实现逐字输出
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
    }

    // 如果有 conversation_id 则传入（继续对话）
    if (conversationId) {
      requestBody.conversation_id = conversationId
    }

    console.log('📤 发送到 GPTBots (streaming):', {
      hasConversationId: !!conversationId,
      userId,
      messageLength: message?.length || 0,
      filesCount: files?.length || 0
    })

    // 调用 GPTBots API 发送消息（streaming）
    const response = await fetch('https://api-sg.gptbots.ai/v2/conversation/message', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ GPTBots API Error:', errorData)
      return res.status(response.status).json({
        success: false,
        message: '发送消息失败',
      })
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')

    console.log('✅ 开始流式传输...')

    // 读取并转发流式响应
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          // 发送结束标记
          res.write('data: [DONE]\n\n')
          res.end()
          console.log('✅ 流式传输完成')
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        
        // 直接转发给前端
        res.write(chunk)
      }
    } catch (streamError) {
      console.error('❌ 流式传输错误:', streamError)
      if (!res.writableEnded) {
        res.write('data: {"error": "流式传输错误"}\n\n')
        res.end()
      }
    }
  } catch (error) {
    console.error('❌ Send message error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      apiKey: process.env.GPTBOTS_API_KEY ? 'Configured' : 'Missing'
    })
    
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '服务器错误，请稍后重试',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      })
    }
  }
}
