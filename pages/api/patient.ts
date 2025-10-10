import { NextApiRequest, NextApiResponse } from 'next'
import { findPatientById } from '@/lib/db-mock'

// 如果有 Vercel Postgres 环境变量，则使用真实数据库
const USE_REAL_DB = process.env.POSTGRES_URL ? true : false

// 动态导入 Vercel Postgres（仅在需要时）
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
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: '缺少患者 ID',
    })
  }

  try {
    let patient: any = null

    if (USE_REAL_DB && sql) {
      // 使用真實數據庫
      const result = await sql`
        SELECT id, case_number, name, email, phone, age, gender, occupation,
               event_location, event_date, event_summary,
               symptoms, onset_datetime, food_history, notes
        FROM patients
        WHERE id = ${id}
        LIMIT 1
      `
      patient = result.rows.length > 0 ? result.rows[0] : null
    } else {
      // 使用模擬數據（本地開發）
      patient = findPatientById(id)
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: '未找到患者資訊',
      })
    }

    return res.status(200).json({
      success: true,
      patient: {
        id: patient.id.toString(),
        caseNumber: patient.case_number || patient.caseNumber,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        occupation: patient.occupation,
        eventLocation: patient.event_location || patient.eventLocation,
        eventDate: patient.event_date || patient.eventDate,
        eventSummary: patient.event_summary || patient.eventSummary,
        symptoms: patient.symptoms,
        onsetDatetime: patient.onset_datetime || patient.onsetDatetime,
        foodHistory: patient.food_history || patient.foodHistory,
        notes: patient.notes,
      },
    })
  } catch (error) {
    console.error('Database error:', error)
    return res.status(500).json({
      success: false,
      message: '伺服器錯誤，請稍後重試',
    })
  }
}

