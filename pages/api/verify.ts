import { NextApiRequest, NextApiResponse } from 'next'
import { findPatientByEmailAndPhone } from '@/lib/db-mock'

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
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { email, phone } = req.body

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: '請提供電話號碼',
    })
  }

  try {
    let patient: any = null

    if (USE_REAL_DB && sql) {
      try {
        // 嘗試使用真實數據庫
        if (email) {
          const result = await sql`
            SELECT id FROM patients
            WHERE (email = ${email} OR phone = ${phone})
            LIMIT 1
          `
          patient = result.rows.length > 0 ? result.rows[0] : null
        } else {
          const result = await sql`
            SELECT id FROM patients
            WHERE phone = ${phone}
            LIMIT 1
          `
          patient = result.rows.length > 0 ? result.rows[0] : null
        }
      } catch (dbError) {
        console.warn('數據庫查詢失敗，回退到模擬數據:', dbError)
        // 回退到模擬數據
        patient = findPatientByEmailAndPhone(email || '', phone)
      }
    } else {
      // 使用模擬數據
      patient = findPatientByEmailAndPhone(email || '', phone)
    }

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: '電話號碼或電郵不正確',
      })
    }

    return res.status(200).json({
      success: true,
      patientId: patient.id.toString(),
      message: '驗證成功',
    })
  } catch (error) {
    console.error('Verification error:', error)
    return res.status(500).json({
      success: false,
      message: '伺服器錯誤，請稍後重試',
    })
  }
}

