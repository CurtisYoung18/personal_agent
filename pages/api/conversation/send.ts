import { NextApiRequest, NextApiResponse } from 'next';

// 創建對話的 API 端點
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ success: false, message: 'Missing userId or message' });
  }

  const GPTBOTS_API_KEY = process.env.GPTBOTS_API_KEY;
  const GPTBOTS_ENDPOINT = process.env.GPTBOTS_ENDPOINT || 'sg';

  if (!GPTBOTS_API_KEY) {
    console.warn('⚠️ GPTBOTS_API_KEY is not set. Running in local mode.');
    // 本地模式：返回模擬回复
    return res.status(200).json({ 
      success: true, 
      response: '您好！歡迎參與本次訪談，我將協助您完成問卷調查。',
      mode: 'local'
    });
  }

  try {
    // Step 1: 創建對話
    console.log('📤 創建對話 for user:', userId);
    console.log('🔑 Using API Key:', GPTBOTS_API_KEY ? `${GPTBOTS_API_KEY.substring(0, 10)}...` : 'NOT SET');
    console.log('🌐 Endpoint:', GPTBOTS_ENDPOINT);
    
    const createConversationResponse = await fetch(
      `https://api-${GPTBOTS_ENDPOINT}.gptbots.ai/v1/conversation`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GPTBOTS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      }
    );

    const conversationData = await createConversationResponse.json();
    
    console.log('📥 創建對話響應:', conversationData);

    if (!createConversationResponse.ok || !conversationData.conversation_id) {
      console.error('❌ 創建對話失敗:', {
        status: createConversationResponse.status,
        statusText: createConversationResponse.statusText,
        data: conversationData
      });
      throw new Error(`Failed to create conversation: ${JSON.stringify(conversationData)}`);
    }

    const conversationId = conversationData.conversation_id;
    console.log('✅ 對話已創建:', conversationId);

    // Step 2: 發送消息
    console.log('📤 發送消息:', message);
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
          response_mode: 'blocking',
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

    const messageData = await sendMessageResponse.json();
    
    console.log('📥 發送消息響應:', messageData);

    if (!sendMessageResponse.ok) {
      console.error('❌ 發送消息失敗:', messageData);
      throw new Error('Failed to send message');
    }

    // 提取 AI 的回复
    let aiResponse = '';
    if (messageData.output && messageData.output.length > 0) {
      const firstOutput = messageData.output[0];
      if (firstOutput.content && firstOutput.content.text) {
        aiResponse = firstOutput.content.text;
      }
    }

    console.log('✅ AI 回复:', aiResponse);

    return res.status(200).json({
      success: true,
      response: aiResponse,
      conversation_id: conversationId,
      message_id: messageData.message_id,
    });
  } catch (error) {
    console.error('❌ Error in conversation API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during conversation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

