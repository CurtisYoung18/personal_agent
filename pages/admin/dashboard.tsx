import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  age: number
  gender: string
  id_card: string
  address: string
  occupation: string
  medical_history: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [currentPatient, setCurrentPatient] = useState<Partial<Patient>>({})

  useEffect(() => {
    // 檢查管理員登入狀態
    const adminSession = localStorage.getItem('admin_session')
    if (!adminSession) {
      router.push('/admin')
      return
    }

    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/admin/patients')
      const data = await response.json()
      if (data.success) {
        setPatients(data.patients)
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_session')
    router.push('/admin')
  }

  const handleAddPatient = () => {
    setModalMode('add')
    setCurrentPatient({})
    setShowModal(true)
  }

  const handleEditPatient = (patient: Patient) => {
    setModalMode('edit')
    setCurrentPatient(patient)
    setShowModal(true)
  }

  const handleDeletePatient = async (id: string) => {
    if (!confirm('確定要刪除這個患者嗎？')) return

    try {
      const response = await fetch('/api/admin/patients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        alert('刪除成功')
        fetchPatients()
      } else {
        alert('刪除失敗')
      }
    } catch (error) {
      console.error('Failed to delete patient:', error)
      alert('刪除失敗')
    }
  }

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = modalMode === 'add' ? 'POST' : 'PUT'
    
    try {
      const response = await fetch('/api/admin/patients', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPatient),
      })

      if (response.ok) {
        alert(modalMode === 'add' ? '新增成功' : '更新成功')
        setShowModal(false)
        fetchPatients()
      } else {
        alert('操作失敗')
      }
    } catch (error) {
      console.error('Failed to save patient:', error)
      alert('操作失敗')
    }
  }

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>載入中...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header-bar">
        <div className="admin-title">
          <h1>📊 患者數據管理</h1>
          <p>共 {patients.length} 位患者</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          登出
        </button>
      </header>

      <div className="admin-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 搜尋患者姓名、電郵或電話..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={handleAddPatient} className="add-btn">
          ➕ 新增患者
        </button>
      </div>

      <div className="patients-table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>姓名</th>
              <th>電郵</th>
              <th>電話</th>
              <th>年齡</th>
              <th>性別</th>
              <th>職業</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.id}</td>
                <td>{patient.name}</td>
                <td>{patient.email}</td>
                <td>{patient.phone}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td>{patient.occupation}</td>
                <td className="actions">
                  <button
                    onClick={() => handleEditPatient(patient)}
                    className="edit-btn-small"
                  >
                    ✏️ 編輯
                  </button>
                  <button
                    onClick={() => handleDeletePatient(patient.id)}
                    className="delete-btn-small"
                  >
                    🗑️ 刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPatients.length === 0 && (
          <div className="no-data">
            <p>📭 暫無患者數據</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? '➕ 新增患者' : '✏️ 編輯患者'}</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>姓名 *</label>
                  <input
                    type="text"
                    value={currentPatient.name || ''}
                    onChange={(e) =>
                      setCurrentPatient({ ...currentPatient, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>電郵 *</label>
                  <input
                    type="email"
                    value={currentPatient.email || ''}
                    onChange={(e) =>
                      setCurrentPatient({ ...currentPatient, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>電話 *</label>
                  <input
                    type="tel"
                    value={currentPatient.phone || ''}
                    onChange={(e) =>
                      setCurrentPatient({ ...currentPatient, phone: e.target.value })
                    }
                    placeholder="+852 9123 4567"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>年齡</label>
                  <input
                    type="number"
                    value={currentPatient.age || ''}
                    onChange={(e) =>
                      setCurrentPatient({ ...currentPatient, age: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>性別</label>
                  <select
                    value={currentPatient.gender || ''}
                    onChange={(e) =>
                      setCurrentPatient({ ...currentPatient, gender: e.target.value })
                    }
                  >
                    <option value="">請選擇</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>身份證號</label>
                  <input
                    type="text"
                    value={currentPatient.id_card || ''}
                    onChange={(e) =>
                      setCurrentPatient({ ...currentPatient, id_card: e.target.value })
                    }
                    placeholder="H123456(7)"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>職業</label>
                <input
                  type="text"
                  value={currentPatient.occupation || ''}
                  onChange={(e) =>
                    setCurrentPatient({ ...currentPatient, occupation: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>地址</label>
                <input
                  type="text"
                  value={currentPatient.address || ''}
                  onChange={(e) =>
                    setCurrentPatient({ ...currentPatient, address: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>病史</label>
                <textarea
                  value={currentPatient.medical_history || ''}
                  onChange={(e) =>
                    setCurrentPatient({ ...currentPatient, medical_history: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  取消
                </button>
                <button type="submit" className="save-btn">
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

