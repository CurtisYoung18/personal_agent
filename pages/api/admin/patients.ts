import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET - 获取所有患者
  if (req.method === 'GET') {
    try {
      console.log('🔍 Admin: 從數據庫獲取患者列表...')
      const result = await sql`
        SELECT id, case_number, name, email, phone, age, gender, occupation, 
               event_location, event_date, event_summary, symptoms, 
               food_history, notes
        FROM patients
        ORDER BY id ASC
      `
      console.log(`✅ Admin: 數據庫查詢成功，找到 ${result.rows.length} 條記錄`)
      
      const patients = result.rows.map((row: any) => ({
        id: row.id.toString(),
        case_number: row.case_number,
        name: row.name,
        email: row.email,
        phone: row.phone,
        age: row.age,
        gender: row.gender,
        occupation: row.occupation,
        event_location: row.event_location,
        event_date: row.event_date,
        event_summary: row.event_summary,
        symptoms: row.symptoms,
        food_history: row.food_history,
        notes: row.notes,
      }))

      console.log(`📊 Admin: 返回 ${patients.length} 條患者記錄`)
      return res.status(200).json({
        success: true,
        patients,
      })
    } catch (error) {
      console.error('❌ Admin: 獲取患者列表失敗:', error)
      return res.status(500).json({
        success: false,
        message: '獲取患者列表失敗',
      })
    }
  }

  // POST - 添加新患者
  if (req.method === 'POST') {
    const { 
      case_number, name, email, phone, age, gender, occupation,
      event_location, event_date, event_summary, symptoms, 
      food_history, notes 
    } = req.body

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: '姓名和電話為必填項',
      })
    }

    try {
      await sql`
        INSERT INTO patients (
          case_number, name, email, phone, age, gender, occupation,
          event_location, event_date, event_summary, symptoms,
          food_history, notes
        )
        VALUES (
          ${case_number || null}, ${name}, ${email || null}, ${phone}, 
          ${age || null}, ${gender || null}, ${occupation || null},
          ${event_location || null}, ${event_date || null}, ${event_summary || null},
          ${symptoms ? JSON.stringify(symptoms) : null},
          ${food_history || null}, ${notes || null}
        )
      `

      return res.status(200).json({
        success: true,
        message: '添加成功',
      })
    } catch (error) {
      console.error('Failed to add patient:', error)
      return res.status(500).json({
        success: false,
        message: '添加患者失败',
      })
    }
  }

  // PUT - 更新患者
  if (req.method === 'PUT') {
    const { 
      id, case_number, name, email, phone, age, gender, occupation,
      event_location, event_date, event_summary, symptoms,
      food_history, notes
    } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '缺少患者ID',
      })
    }

    try {
      await sql`
        UPDATE patients
        SET case_number = ${case_number || null},
            name = ${name}, 
            email = ${email || null}, 
            phone = ${phone}, 
            age = ${age || null}, 
            gender = ${gender || null}, 
            occupation = ${occupation || null},
            event_location = ${event_location || null},
            event_date = ${event_date || null},
            event_summary = ${event_summary || null},
            symptoms = ${symptoms ? JSON.stringify(symptoms) : null},
            food_history = ${food_history || null},
            notes = ${notes || null},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `

      return res.status(200).json({
        success: true,
        message: '更新成功',
      })
    } catch (error) {
      console.error('Failed to update patient:', error)
      return res.status(500).json({
        success: false,
        message: '更新患者失败',
      })
    }
  }

  // DELETE - 删除患者
  if (req.method === 'DELETE') {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '缺少患者ID',
      })
    }

    try {
      await sql`
        DELETE FROM patients
        WHERE id = ${id}
      `

      return res.status(200).json({
        success: true,
        message: '删除成功',
      })
    } catch (error) {
      console.error('Failed to delete patient:', error)
      return res.status(500).json({
        success: false,
        message: '删除患者失败',
      })
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed',
  })
}

