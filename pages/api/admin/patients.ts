import { NextApiRequest, NextApiResponse } from 'next'
import { mockPatients, findPatientById } from '@/lib/db-mock'

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
  // GET - 获取所有患者
  if (req.method === 'GET') {
    try {
      let patients: any[] = []

      if (USE_REAL_DB && sql) {
        const result = await sql`
          SELECT id, name, email, phone, age, gender, id_card, address, occupation, medical_history
          FROM patients
          ORDER BY id ASC
        `
        patients = result.rows.map((row: any) => ({
          id: row.id.toString(),
          name: row.name,
          email: row.email,
          phone: row.phone,
          age: row.age,
          gender: row.gender,
          id_card: row.id_card,
          address: row.address,
          occupation: row.occupation,
          medical_history: row.medical_history,
        }))
      } else {
        patients = mockPatients
      }

      return res.status(200).json({
        success: true,
        patients,
      })
    } catch (error) {
      console.error('Failed to fetch patients:', error)
      return res.status(500).json({
        success: false,
        message: '获取患者列表失败',
      })
    }
  }

  // POST - 添加新患者
  if (req.method === 'POST') {
    const { name, email, phone, age, gender, id_card, address, occupation, medical_history } =
      req.body

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: '姓名、邮箱和电话为必填项',
      })
    }

    try {
      if (USE_REAL_DB && sql) {
        await sql`
          INSERT INTO patients (name, email, phone, age, gender, id_card, address, occupation, medical_history)
          VALUES (${name}, ${email}, ${phone}, ${age || null}, ${gender || null}, ${id_card || null}, 
                  ${address || null}, ${occupation || null}, ${medical_history || null})
        `
      } else {
        // 本地模拟数据 - 实际不会真正添加，仅用于开发测试
        const newId = (mockPatients.length + 1).toString()
        mockPatients.push({
          id: newId,
          name,
          email,
          phone,
          age: age || 0,
          gender: gender || '',
          id_card: id_card || '',
          address: address || '',
          occupation: occupation || '',
          medical_history: medical_history || '',
        })
      }

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
    const { id, name, email, phone, age, gender, id_card, address, occupation, medical_history } =
      req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        message: '缺少患者ID',
      })
    }

    try {
      if (USE_REAL_DB && sql) {
        await sql`
          UPDATE patients
          SET name = ${name}, email = ${email}, phone = ${phone}, 
              age = ${age || null}, gender = ${gender || null}, id_card = ${id_card || null},
              address = ${address || null}, occupation = ${occupation || null}, 
              medical_history = ${medical_history || null},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
        `
      } else {
        // 本地模拟数据 - 更新内存中的数据
        const index = mockPatients.findIndex((p) => p.id === id)
        if (index !== -1) {
          mockPatients[index] = {
            id,
            name,
            email,
            phone,
            age: age || 0,
            gender: gender || '',
            id_card: id_card || '',
            address: address || '',
            occupation: occupation || '',
            medical_history: medical_history || '',
          }
        }
      }

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
      if (USE_REAL_DB && sql) {
        await sql`
          DELETE FROM patients
          WHERE id = ${id}
        `
      } else {
        // 本地模拟数据 - 从内存中删除
        const index = mockPatients.findIndex((p) => p.id === id)
        if (index !== -1) {
          mockPatients.splice(index, 1)
        }
      }

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

