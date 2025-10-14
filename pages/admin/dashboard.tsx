import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { 
  HiSearch, HiUserAdd, HiPencil, HiTrash, HiLogout, 
  HiChartBar, HiChatAlt2, HiDatabase, HiArrowLeft 
} from 'react-icons/hi'
import { BiLoaderAlt } from 'react-icons/bi'

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
  caseNumber?: string
  eventLocation?: string
  eventDate?: string
  eventSummary?: string
  onsetDatetime?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDataManagement, setShowDataManagement] = useState(false)
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
        // 轉換後端字段為前端格式
        const patientsWithConvertedFields = data.patients.map((p: any) => ({
          ...p,
          caseNumber: p.case_number,
          eventLocation: p.event_location,
          eventDate: p.event_date,
          eventSummary: p.event_summary,
        }))
        setPatients(patientsWithConvertedFields)
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

  // 根據事件日期自動生成案例編號
  const generateCaseNumber = (eventDate: string) => {
    if (!eventDate) return ''
    
    const date = new Date(eventDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const id = String(patients.length + 1).padStart(3, '0')
    
    return `HKDH-${year}-${month}${day}-${id}`
  }

  const handleAddPatient = () => {
    setModalMode('add')
    setCurrentPatient({})
    setShowModal(true)
  }

  const handleEditPatient = (patient: Patient) => {
    setModalMode('edit')
    // 格式化日期为 YYYY-MM-DD 格式，以便 date input 正确显示
    const formattedPatient = {
      ...patient,
      eventDate: patient.eventDate ? patient.eventDate.split('T')[0] : patient.eventDate
    }
    setCurrentPatient(formattedPatient)
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
    
    // 轉換字段名稱為後端格式
    const patientData = {
      ...currentPatient,
      case_number: currentPatient.caseNumber,
      event_location: currentPatient.eventLocation,
      event_date: currentPatient.eventDate,
      event_summary: currentPatient.eventSummary,
    }
    
    try {
      const response = await fetch('/api/admin/patients', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
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
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="admin-header-left">
          <img src="/logo.png" alt="香港衛生署" className="header-logo" />
          <div className="admin-title">
            <h1>香港衛生署內部系統</h1>
            <p>管理員控制台</p>
          </div>
        </div>
        <div className="admin-header-right">
          {!showDataManagement ? (
            <button 
              onClick={() => setShowDataManagement(true)} 
              className="nav-to-data-btn"
            >
              <HiDatabase /> 數據管理
            </button>
          ) : (
            <button 
              onClick={() => setShowDataManagement(false)} 
              className="nav-to-agent-btn"
            >
              <HiArrowLeft /> AI 助手
            </button>
          )}
          <button onClick={handleLogout} className="logout-btn">
            <HiLogout /> 登出
          </button>
        </div>
      </header>

      <div className="admin-content-wrapper">
        {/* Agent 頁面 */}
        <div className={`admin-view agent-view ${!showDataManagement ? 'active' : ''}`}>
          <div className="agent-container">
            <div className="glass-card">
              <iframe
                src="https://www.gptbots.ai/widget/eea8knlvhzyypa2hjsmkbod/chat.html"
                width="100%"
                height="100%"
                allow="microphone *"
                style={{ border: 'none', borderRadius: '16px' }}
                title="Internal Agent"
              />
            </div>
          </div>
        </div>

        {/* 數據管理頁面 */}
        <div className={`admin-view data-view ${showDataManagement ? 'active' : ''}`}>
          <div className="data-header">
            <h2>患者數據管理</h2>
            <span className="count-badge">{patients.length} 位患者</span>
          </div>

          <div className="data-controls">
            <div className="search-box">
              <HiSearch className="search-icon" />
              <input
                type="text"
                placeholder="搜尋患者姓名、電郵、電話或案例編號..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={handleAddPatient} className="add-btn">
              <HiUserAdd /> 新增患者
            </button>
          </div>

      <div className="patients-table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>姓名</th>
              <th>年齡</th>
              <th>性別</th>
              <th>電話</th>
              <th>電郵</th>
              <th>職業</th>
              <th>案例編號</th>
              <th>事件日期</th>
              <th>案發時間</th>
              <th>事件地點</th>
              <th>事件詳情</th>
              <th className="sticky-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.id}</td>
                <td className="name-cell"><strong>{patient.name}</strong></td>
                <td>{patient.age || '-'}</td>
                <td>
                  <span className={`gender-badge ${patient.gender === '男' ? 'male' : 'female'}`}>
                    {patient.gender || '-'}
                  </span>
                </td>
                <td>{patient.phone}</td>
                <td className="email-cell">{patient.email || '-'}</td>
                <td>{patient.occupation || '-'}</td>
                <td className="case-number-cell">{patient.caseNumber || '-'}</td>
                <td>{patient.eventDate || '-'}</td>
                <td className="datetime-cell">
                  {patient.onsetDatetime 
                    ? new Date(patient.onsetDatetime).toLocaleString('zh-HK', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'
                  }
                </td>
                <td className="location-cell">{patient.eventLocation || '-'}</td>
                <td className="summary-cell">{patient.eventSummary || '-'}</td>
                <td className="actions sticky-actions">
                  <button
                    onClick={() => handleEditPatient(patient)}
                    className="edit-btn-small"
                  >
                    <HiPencil /> 編輯
                  </button>
                  <button
                    onClick={() => handleDeletePatient(patient.id)}
                    className="delete-btn-small"
                  >
                    <HiTrash /> 刪除
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
        </div>
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
                    placeholder="example@example.com"
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
                  <label>年齡 *</label>
                  <input
                    type="number"
                    value={currentPatient.age || ''}
                    onChange={(e) =>
                      setCurrentPatient({ ...currentPatient, age: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>性別 *</label>
                  <select
                    value={currentPatient.gender || ''}
                    onChange={(e) =>
                      setCurrentPatient({ ...currentPatient, gender: e.target.value })
                    }
                    required
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
                <label>病史</label>
                <textarea
                  value={currentPatient.medical_history || ''}
                  onChange={(e) =>
                    setCurrentPatient({ ...currentPatient, medical_history: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>🔍 案例資訊</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>事件日期 *</label>
                  <input
                    type="date"
                    value={currentPatient.eventDate || ''}
                    onChange={(e) => {
                      const newDate = e.target.value
                      const newCaseNumber = generateCaseNumber(newDate)
                      setCurrentPatient({ 
                        ...currentPatient, 
                        eventDate: newDate,
                        caseNumber: newCaseNumber
                      })
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>案例編號（自動生成）</label>
                  <input
                    type="text"
                    value={currentPatient.caseNumber || ''}
                    readOnly
                    placeholder="請先選擇事件日期"
                    style={{ backgroundColor: '#f7fafc', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>事件地點</label>
                <input
                  type="text"
                  value={currentPatient.eventLocation || ''}
                  onChange={(e) =>
                    setCurrentPatient({ ...currentPatient, eventLocation: e.target.value })
                  }
                  placeholder="例如：The Seafood House, 尖沙咀"
                />
              </div>

              <div className="form-group">
                <label>事件詳情 * </label>
                <input
                  type="text"
                  value={currentPatient.eventSummary || ''}
                  onChange={(e) =>
                    setCurrentPatient({ ...currentPatient, eventSummary: e.target.value })
                  }
                  placeholder="例如：The Seafood House 晚宴"
                  required
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

