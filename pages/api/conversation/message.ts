import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { conversationId, message } = req.body;

  if (!conversationId || !message) {
    return res.status(400).json({ success: false, message: 'Missing conversationId or message' });
  }

  const GPTBOTS_API_KEY = process.env.GPTBOTS_API_KEY;
  const GPTBOTS_ENDPOINT = process.env.GPTBOTS_ENDPOINT || 'sg';

  if (!GPTBOTS_API_KEY) {
    console.warn('⚠️ GPTBOTS_API_KEY is not set. Running in local mode.');
    // 本地模式：返回模擬流式響應
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const mockResponse = '您好！歡迎參與本次訪談。我是香港衞生署的 AI 調查員，負責協助您完成食物中毒個案的問卷調查。請放心，所有資料都會嚴格保密。';
    
    for (let i = 0; i < mockResponse.length; i++) {
      res.write(`data: ${JSON.stringify({ content: mockResponse[i] })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  try {
    console.log('📤 發送消息 to conversation:', conversationId);
    
    const sendMessageResponse = await fetch(
      `https://api-${GPTBOTS_ENDPOINT}.gptbots.ai/v2/conversation/message`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GPTBOTS_API_KEY}`,
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
                }
              ],
            },
          ],
        }),
      }
    );

    if (!sendMessageResponse.ok) {
      throw new Error(`HTTP error! status: ${sendMessageResponse.status}`);
    }

    // 設置流式響應頭
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = sendMessageResponse.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          try {
            const parsed = JSON.parse(data);
            
            // 處理文本消息
            if (parsed.code === 3 && parsed.data) {
              res.write(`data: ${JSON.stringify({ content: parsed.data })}\n\n`);
            }
            
            // 處理結束標記
            if (parsed.code === 0) {
              res.write('data: [DONE]\n\n');
            }
          } catch (e) {
            // 忽略解析錯誤
          }
        }
      }
    }

    res.end();
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during message sending',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

