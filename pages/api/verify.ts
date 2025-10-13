import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

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

    // 使用真實數據庫查詢
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

