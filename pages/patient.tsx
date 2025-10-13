import { useEffect, useState, useRef } from 'react'
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
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!id) {
      router.push('/')
      return
    }

    // 獲取患者信息
    const loadPatientInfo = async () => {
      try {
        const response = await fetch(`/api/patient?id=${id}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setPatientInfo(data.patient)
          
          // 使用 GPTBots iframe URL
          const baseUrl = 'https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html'
          const userId = data.patient.caseNumber || data.patient.phone
          const userEmail = data.patient.email || ''
          
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
        } else {
          router.push('/')
        }
      } catch (err) {
        console.error('Failed to fetch patient info:', err)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    loadPatientInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // 當獲取到患者信息後，初始化對話
  useEffect(() => {
    if (!patientInfo || !iframeUrl || hasInitialized.current) return

    hasInitialized.current = true

    // 初始化對話：同步屬性 → 準備 iframe → 發送歡迎消息
    const initializeConversation = async () => {
      setIsInitializing(true)
      setInitMessage(`${patientInfo.name}，您好`)

      try {
        // Step 1: 同步用戶屬性到 GPTBots
        const userId = patientInfo.caseNumber || patientInfo.phone
        console.log('📤 步驟 1: 同步用戶屬性...')
        
        const properties = {
          age: patientInfo.age?.toString() || '',
          case_id: patientInfo.caseNumber || '',
          detail: patientInfo.eventSummary || '',
          mobile: patientInfo.phone || '',
          patient_name: patientInfo.name || '',
        }

        await fetch('/api/sync-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, properties }),
        })
        
        setInitMessage(`正在為 ${patientInfo.name} 準備問卷...`)
        
        // Step 2: 創建對話並發送歡迎消息
        console.log('📤 步驟 2: 準備訪談環境...')
        const response = await fetch('/api/conversation/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, message: `你好，我是${patientInfo.name}` }),
        })

        const data = await response.json()
        console.log('📥 API 響應:', data)
        
        setInitMessage('準備完成，正在進入問卷...')
        
        // Step 3: 顯示 iframe
        setTimeout(() => {
          setShowIframe(true)
          setIsInitializing(false)
        }, 800)
      } catch (error) {
        console.error('❌ 初始化對話失敗:', error)
        setInitMessage('正在進入問卷...')
        
        // 即使出錯也顯示 iframe
        setTimeout(() => {
          setShowIframe(true)
          setIsInitializing(false)
        }, 1000)
      }
    }

    // 開始初始化流程
    initializeConversation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientInfo, iframeUrl])

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
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage(
                JSON.stringify({
                  type: 'sendMessage',
                  data: `你好，我是${patientInfo.name}`
                }),
                '*'
              )
              console.log('👋 已發送歡迎消息:', `你好，我是${patientInfo.name}`)
            }
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
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad)
      }
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

