import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

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
    // 使用真實數據庫查詢
    const result = await sql`
      SELECT id, case_number, name, email, phone, age, gender, occupation,
             event_location, event_date, event_summary,
             symptoms, onset_datetime, food_history, notes
      FROM patients
      WHERE id = ${id}
      LIMIT 1
    `
    
    const patient = result.rows.length > 0 ? result.rows[0] : null

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
        caseNumber: patient.case_number,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        occupation: patient.occupation,
        eventLocation: patient.event_location,
        eventDate: patient.event_date,
        eventSummary: patient.event_summary,
        symptoms: patient.symptoms,
        onsetDatetime: patient.onset_datetime,
        foodHistory: patient.food_history,
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

