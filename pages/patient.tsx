import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface PatientInfo {
  id: string
  caseNumber: string
  name: string
  email: string | null
  phone: string
  age?: number | null
  gender?: string | null
  occupation?: string | null
  eventLocation: string
  eventDate: string
  eventSummary: string
  symptoms?: any
  onsetDatetime?: string | null
  foodHistory?: string | null
  notes?: string | null
}

export default function PatientPage() {
  const router = useRouter()
  const { id } = router.query
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null)
  const [iframeUrl, setIframeUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      // 檢查是否有記住的會話
      const rememberedPatient = localStorage.getItem('hp_patient_session')
      if (rememberedPatient) {
        try {
          const patientData = JSON.parse(rememberedPatient)
          router.push(`/patient?id=${patientData.id}`)
        } catch (e) {
          router.push('/')
        }
      } else {
        router.push('/')
      }
      return
    }

    // 獲取患者信息
    fetchPatientInfo(id as string)
  }, [id])

  // 使用 useEffect 监听 iframe 加载完成后，同步用户属性
  useEffect(() => {
    if (!patientInfo || !iframeUrl) return

    // 延迟同步，确保 iframe 已完全加载
    const timer = setTimeout(() => {
      const iframe = document.querySelector('iframe')
      if (iframe && iframe.contentWindow) {
        // 根據 GPTBots 用戶屬性字段構建數據
        const userProperties = {
          age: patientInfo.age?.toString() || '',
          case_id: patientInfo.caseNumber || '',
          detail: patientInfo.eventSummary || '',
          mobile: patientInfo.phone || '',
          patient_name: patientInfo.name || '',
        }

        // 發送用戶 ID（使用案例編號）
        iframe.contentWindow.postMessage(
          JSON.stringify({ 
            type: 'UserId', 
            data: patientInfo.caseNumber || patientInfo.phone 
          }),
          '*'
        )

        console.log('📤 患者資訊已傳送至 iframe:', userProperties)
        
        // 立即同步用戶屬性到 GPTBots
        const userId = patientInfo.caseNumber || patientInfo.phone
        syncUserProperties(userId, patientInfo)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [patientInfo, iframeUrl])

  // 同步用戶屬性到 GPTBots（可選）
  const syncUserProperties = async (userId: string, patient: any) => {
    try {
      const properties = {
        age: patient.age?.toString() || '',
        case_id: patient.caseNumber || '',
        detail: patient.eventSummary || '',
        mobile: patient.phone || '',
        patient_name: patient.name || '',
      }

      const response = await fetch('/api/sync-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, properties }),
      })

      const data = await response.json()
      
      if (data.synced) {
        console.log('✅ 用戶屬性已同步到 GPTBots')
      } else {
        console.log('ℹ️ 本地模式 - 請使用 Tools 方案')
      }
    } catch (error) {
      console.warn('⚠️ 屬性同步失敗（不影響使用）:', error)
    }
  }

  const fetchPatientInfo = async (patientId: string) => {
    try {
      const response = await fetch(`/api/patient?id=${patientId}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setPatientInfo(data.patient)
        
        // 使用 GPTBots iframe URL
        // 根據補充資料，iframe 只支持 user_id 和 email 兩個 URL 參數
        const baseUrl = 'https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html'
        
        // 使用案例編號作為 user_id（唯一標識）
        const userId = data.patient.caseNumber || data.patient.phone
        const userEmail = data.patient.email || ''
        
        // 只傳遞 GPTBots 支持的參數：user_id 和 email
        const params = new URLSearchParams({
          user_id: userId,
        })
        
        if (userEmail) {
          params.set('email', userEmail)
        }
        
        const fullUrl = `${baseUrl}?${params.toString()}`
        
        console.log('🔗 iframe URL:', fullUrl)
        console.log('📋 患者屬性（將通過 useEffect 同步）:', {
          age: data.patient.age?.toString() || '',
          case_id: data.patient.caseNumber || '',
          detail: data.patient.eventSummary || '',
          mobile: data.patient.phone || '',
          patient_name: data.patient.name || '',
        })
        
        setIframeUrl(fullUrl)
        // 屬性同步將在 useEffect 中執行，確保 iframe 已加載
      } else {
        // 驗證失敗，清除會話並返回登錄頁
        localStorage.removeItem('hp_patient_session')
        router.push('/')
      }
    } catch (err) {
      console.error('Failed to fetch patient info:', err)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>載入中...</p>
      </div>
    )
  }

  if (!patientInfo) {
    return null
  }

  // 處理登出
  const handleLogout = () => {
    if (confirm('確定要登出嗎？這將清除您的登入狀態。')) {
      localStorage.removeItem('hp_patient_session')
      router.push('/')
    }
  }

  return (
    <div className="patient-container">
      {/* 頂部狀態欄 */}
      <div className="patient-header">
        <div className="patient-info">
          <span className="patient-name">{patientInfo.name}</span>
          <span className="case-number">{patientInfo.caseNumber}</span>
          <span className="event-info">{patientInfo.eventSummary}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn-small">
          登出
        </button>
      </div>

      <iframe
        src={iframeUrl || 'about:blank'}
        className="patient-iframe"
        title="Patient Interview Agent"
        allow="microphone *"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  )
}

