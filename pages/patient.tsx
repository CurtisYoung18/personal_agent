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
  const [isInitializing, setIsInitializing] = useState(false)
  const [showIframe, setShowIframe] = useState(false)
  const [initMessage, setInitMessage] = useState('')

  useEffect(() => {
    if (!id) {
      router.push('/')
      return
    }

    // 獲取患者信息
    fetchPatientInfo(id as string)
  }, [id])

  // 當獲取到患者信息後，初始化對話
  useEffect(() => {
    if (!patientInfo || !iframeUrl || isInitializing || showIframe) return

    // 初始化對話：同步屬性 → 準備 iframe → 發送歡迎消息
    const initializeConversation = async () => {
      setIsInitializing(true)
      setInitMessage('正在建立連接...')

      try {
        // Step 1: 同步用戶屬性到 GPTBots
        const userId = patientInfo.caseNumber || patientInfo.phone
        console.log('📤 步驟 1: 同步用戶屬性...')
        await syncUserProperties(userId, patientInfo)
        
        setInitMessage(`您好 ${patientInfo.name}，正在為您準備訪談...`)
        
        // Step 2: 模擬 API 調用以顯示進度（實際消息將在 iframe 中發送）
        console.log('📤 步驟 2: 準備訪談環境...')
        await sendMessageViaAPI(userId, `你好，我是${patientInfo.name}`)
        
        setInitMessage('準備完成，正在進入訪談...')
        
        // Step 3: 顯示 iframe
        setTimeout(() => {
          setShowIframe(true)
          setIsInitializing(false)
        }, 800)
      } catch (error) {
        console.error('❌ 初始化對話失敗:', error)
        setInitMessage('正在進入訪談...')
        
        // 即使出錯也顯示 iframe
        setTimeout(() => {
          setShowIframe(true)
          setIsInitializing(false)
        }, 1000)
      }
    }

    // 開始初始化流程
    initializeConversation()
  }, [patientInfo, iframeUrl, isInitializing, showIframe])

  // 通過 Conversation API 發送消息並等待回复
  const sendMessageViaAPI = async (userId: string, message: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/conversation/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message }),
      })

      const data = await response.json()
      
      console.log('📥 API 響應:', data)
      
      if (data.success && data.response) {
        return data.response
      }
      
      // 記錄詳細錯誤
      console.error('❌ API 返回錯誤:', data)
      return null
    } catch (error) {
      console.error('⚠️ 發送消息失敗:', error)
      return null
    }
  }

  // 同步用戶屬性到 GPTBots
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
        console.log('ℹ️ 本地模式')
      }
    } catch (error) {
      console.warn('⚠️ 屬性同步失敗:', error)
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

  // 處理登出
  const handleLogout = () => {
    if (confirm('確定要登出嗎？')) {
      router.push('/')
    }
  }

  // 載入階段
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

  // 初始化階段（發送消息並等待回复）
  if (isInitializing || !showIframe) {
    return (
      <div className="initializing-container">
        <div className="init-card">
          <div className="init-logo">
            <img src="/logo.png" alt="香港衛生署" />
          </div>
          <div className="init-content">
            <div className="init-spinner"></div>
            <h2>{initMessage}</h2>
            <p className="init-hint">系統正在為您準備個性化訪談體驗</p>
          </div>
        </div>
      </div>
    )
  }

  // 監聽 iframe 加載並自動發送歡迎消息
  useEffect(() => {
    if (!showIframe || !patientInfo) return

    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    if (!iframe) return

    const handleIframeLoad = () => {
      console.log('🎬 iframe 已加載，發送歡迎消息')
      
      // 等待 1 秒確保 iframe 完全初始化
      setTimeout(() => {
        if (iframe && iframe.contentWindow) {
          // 發送用戶 ID
          iframe.contentWindow.postMessage(
            JSON.stringify({ 
              type: 'UserId', 
              data: patientInfo.caseNumber || patientInfo.phone 
            }),
            '*'
          )
          
          // 再等待 0.5 秒後發送歡迎消息
          setTimeout(() => {
            iframe.contentWindow?.postMessage(
              JSON.stringify({
                type: 'sendMessage',
                data: `你好，我是${patientInfo.name}`
              }),
              '*'
            )
            console.log('👋 已發送歡迎消息:', `你好，我是${patientInfo.name}`)
          }, 500)
        }
      }, 1000)
    }

    // 如果 iframe 已經加載完成
    if (iframe.contentDocument?.readyState === 'complete') {
      handleIframeLoad()
    } else {
      // 否則監聽 load 事件
      iframe.addEventListener('load', handleIframeLoad)
    }

    return () => {
      iframe.removeEventListener('load', handleIframeLoad)
    }
  }, [showIframe, patientInfo])

  // iframe 顯示階段（帶淡入動畫）
  return (
    <div className={`patient-container ${showIframe ? 'fade-in' : ''}`}>
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

