import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Missing userId' });
  }

  const GPTBOTS_API_KEY = process.env.GPTBOTS_API_KEY;
  const GPTBOTS_ENDPOINT = process.env.GPTBOTS_ENDPOINT || 'sg';

  if (!GPTBOTS_API_KEY) {
    console.warn('⚠️ GPTBOTS_API_KEY is not set. Running in local mode.');
    return res.status(200).json({ 
      success: true, 
      conversation_id: 'local-' + Date.now(),
      mode: 'local'
    });
  }

  try {
    console.log('📤 創建對話 for user:', userId);
    
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
        data: conversationData
      });
      throw new Error(`Failed to create conversation: ${JSON.stringify(conversationData)}`);
    }

    const conversationId = conversationData.conversation_id;
    console.log('✅ 對話已創建:', conversationId);

    return res.status(200).json({
      success: true,
      conversation_id: conversationId,
    });
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during conversation creation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

