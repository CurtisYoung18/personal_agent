import { NextApiRequest, NextApiResponse } from 'next'
import { mockPatients } from '@/lib/db-mock'

/**
 * 方案二：GPTBots Tools API
 * 
 * 用途：讓 Agent 通過 Tool 調用此 API 獲取患者信息
 * 
 * GPTBots 會自動在 Header 中傳遞 user_id
 * 
 * 配置：在 GPTBots Agent 中添加此 Tool
 * - Tool 名稱：get_patient_info
 * - API URL：https://your-domain.vercel.app/api/tools/patient-info
 * - Method：GET
 */

// 如果有 Vercel Postgres 環境變量，則使用真實數據庫
const USE_REAL_DB = process.env.POSTGRES_URL ? true : false

let sql: any = null
if (USE_REAL_DB) {
  try {
    const postgres = require('@vercel/postgres')
    sql = postgres.sql
  } catch (e) {
    console.warn('Vercel Postgres not available, using mock data')
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // GPTBots 會在 Header 中傳遞 user_id
  const userId = req.headers['x-user-id'] || req.headers['user-id'] || req.query.user_id

  console.log('🔍 Tools API 被調用 - user_id:', userId)

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({
      error: 'Missing user_id',
      message: '需要提供 user_id',
    })
  }

  try {
    let patient: any = null

    if (USE_REAL_DB && sql) {
      // 使用真實數據庫 - 根據案例編號或電話查詢
      const result = await sql`
        SELECT * FROM patients
        WHERE case_number = ${userId} OR phone = ${userId}
        LIMIT 1
      `
      patient = result.rows.length > 0 ? result.rows[0] : null
    } else {
      // 使用模擬數據
      patient = mockPatients.find(
        (p) => p.case_number === userId || p.phone === userId
      )
    }

    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found',
        message: `未找到案例編號或電話為 ${userId} 的患者`,
      })
    }

    // 返回患者信息（供 Agent 使用）
    const patientInfo = {
      // 基本信息
      patient_name: patient.name,
      age: patient.age?.toString() || '',
      gender: patient.gender || '',
      occupation: patient.occupation || '',
      mobile: patient.phone || '',
      email: patient.email || '',
      
      // 案例信息
      case_id: patient.case_number || patient.caseNumber,
      detail: patient.event_summary || patient.eventSummary,
      event_location: patient.event_location || patient.eventLocation,
      event_date: patient.event_date || patient.eventDate,
      
      // 症狀信息（如果有）
      symptoms: patient.symptoms,
      onset_datetime: patient.onset_datetime || patient.onsetDatetime,
      
      // 其他信息
      food_history: patient.food_history || patient.foodHistory,
      notes: patient.notes,
    }

    console.log('✅ 返回患者信息給 Agent:', patientInfo)

    return res.status(200).json(patientInfo)
  } catch (error) {
    console.error('❌ Tools API 錯誤:', error)

    return res.status(500).json({
      error: 'Server error',
      message: '伺服器錯誤',
    })
  }
}

