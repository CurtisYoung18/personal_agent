import { NextApiRequest, NextApiResponse } from 'next'

/**
 * 方案一：GPTBots 用戶屬性 API
 * 
 * 用途：將患者屬性同步到 GPTBots，Agent 可以直接訪問
 * 
 * 配置：需要在環境變量中設置
 * - GPTBOTS_API_KEY
 * - GPTBOTS_ENDPOINT
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { userId, properties } = req.body

  if (!userId || !properties) {
    return res.status(400).json({
      success: false,
      message: '缺少必要參數',
    })
  }

  // 檢查是否配置了 GPTBots API
  const apiKey = process.env.GPTBOTS_API_KEY
  const endpoint = process.env.GPTBOTS_ENDPOINT || 'us'

  if (!apiKey) {
    console.warn('⚠️ GPTBots API Key 未配置')
    console.log('📋 本地模式 - 用戶屬性:', properties)
    return res.status(200).json({
      success: true,
      message: '本地開發模式，屬性已記錄',
      synced: false,
      properties,
    })
  }

  try {
    // 調用 GPTBots 用戶屬性 API
    const gptbotsUrl = `https://api-${endpoint}.gptbots.ai/v1/property/update`

    // 構建屬性列表（不過濾任何值，包括 "please provide"）
    const propertyValues = Object.entries(properties).map(([key, value]) => ({
      property_name: key,
      value: String(value || ''), // 確保所有值都是字符串，null/undefined 轉為空字符串
    }))

    console.log('📤 正在同步到 GPTBots:', {
      url: gptbotsUrl,
      userId,
      properties: propertyValues,
    })
    console.log('📋 原始屬性:', properties)

    const response = await fetch(gptbotsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        property_values: propertyValues,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ GPTBots 用戶屬性同步成功!')
      console.log('📥 GPTBots 響應:', JSON.stringify(data, null, 2))

      return res.status(200).json({
        success: true,
        message: '用戶屬性已同步到 GPTBots',
        synced: true,
        gptbotsResponse: data,
      })
    } else {
      console.error('❌ GPTBots API 返回錯誤:', JSON.stringify(data, null, 2))
      console.error('❌ HTTP 狀態碼:', response.status)

      return res.status(response.status).json({
        success: false,
        message: 'GPTBots API 調用失敗',
        synced: false,
        error: data,
      })
    }
  } catch (error) {
    console.error('❌ GPTBots 用戶屬性同步錯誤:', error)

    return res.status(500).json({
      success: false,
      message: '伺服器錯誤',
      synced: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

