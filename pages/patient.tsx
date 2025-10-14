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

  // Effect 1: 加載患者信息
  useEffect(() => {
    if (!id) {
      router.push('/')
      return
    }

    const loadPatientInfo = async () => {
      try {
        const response = await fetch(`/api/patient?id=${id}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setPatientInfo(data.patient)
          
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

  // Effect 2: 同步用戶屬性並顯示 iframe
  useEffect(() => {
    if (!patientInfo || !iframeUrl || hasInitialized.current) return

    hasInitialized.current = true

    const initializeConversation = async () => {
      setIsInitializing(true)
      setInitMessage(`${patientInfo.name}，您好`)

      try {
        const userId = patientInfo.caseNumber || patientInfo.phone
        console.log('📤 同步用戶屬性到 GPTBots...')
        console.log('📋 原始患者信息:', patientInfo)
        
        // 處理用戶屬性：年齡轉為整數並添加單位，null 值使用 "please provide"
        // 格式化事件日期為可讀格式（精確到天）
        const formatCaseTime = (dateStr: string | null | undefined) => {
          if (!dateStr) return 'please provide'
          try {
            const date = new Date(dateStr)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}年${month}月${day}日`
          } catch {
            return 'please provide'
          }
        }

        const properties = {
          age: patientInfo.age ? `${Math.floor(patientInfo.age)}歲` : 'please provide',
          case_id: patientInfo.caseNumber || 'please provide',
          detail: patientInfo.eventSummary || 'please provide',
          mobile: patientInfo.phone || 'please provide',
          patient_name: patientInfo.name || 'please provide',
          sex: patientInfo.gender || 'please provide',
          case_time: formatCaseTime(patientInfo.eventDate || null),
        }

        console.log('📤 準備同步的屬性:', properties)

        const syncResponse = await fetch('/api/sync-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, properties }),
        })
        
        const syncResult = await syncResponse.json()
        console.log('✅ 用戶屬性已同步，結果:', syncResult)
        setInitMessage(`正在為 ${patientInfo.name} 準備問卷...`)
        
        // 直接顯示 iframe，對話將在 iframe 內開始
        setTimeout(() => {
          setShowIframe(true)
          setIsInitializing(false)
        }, 800)
      } catch (error) {
        console.error('❌ 同步失敗:', error)
        setInitMessage('正在進入問卷...')
        
        // 即使同步失敗也顯示 iframe
        setTimeout(() => {
          setShowIframe(true)
          setIsInitializing(false)
        }, 1000)
      }
    }

    initializeConversation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientInfo, iframeUrl])

  // Effect 3: iframe 加載後設置用戶 ID
  useEffect(() => {
    if (!showIframe || !patientInfo) return

    const currentPatientInfo = patientInfo
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    if (!iframe) return

    const handleIframeLoad = () => {
      console.log('🎬 iframe 已加載')
      
      setTimeout(() => {
        if (iframe && iframe.contentWindow) {
          // 只發送用戶 ID，歡迎消息由 Agent 自動顯示
          iframe.contentWindow.postMessage(
            JSON.stringify({ 
              type: 'UserId', 
              data: currentPatientInfo.caseNumber || currentPatientInfo.phone 
            }),
            '*'
          )
          console.log('✅ 用戶 ID 已傳送至 iframe')
        }
      }, 1000)
    }

    if (iframe.contentDocument?.readyState === 'complete') {
      handleIframeLoad()
    } else {
      iframe.addEventListener('load', handleIframeLoad)
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIframe])

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

  // 初始化階段
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

  // iframe 顯示階段
  return (
    <div className={`patient-page ${showIframe ? 'fade-in' : ''}`}>
      {/* 頂部導航欄（包含系統信息和患者信息） */}
      <header className="patient-page-header">
        <div className="header-logo">
          <img src="/logo.png" alt="香港衛生署" />
        </div>
        <div className="header-content">
          <div className="header-system-info">
            <h1>香港衛生署內部系統</h1>
            <p>智能化呈報傳染病平台</p>
          </div>
          <div className="header-patient-info">
            <span className="patient-item">
              <strong>受訪者：</strong>{patientInfo.name}
            </span>
            <span className="patient-separator">|</span>
            <span className="patient-item">
              <strong>案件：</strong>{patientInfo.caseNumber}
            </span>
            <span className="patient-separator">|</span>
            <span className="patient-item">
              <strong>事件：</strong>{patientInfo.eventSummary}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          登出
        </button>
      </header>

      {/* iframe 容器（毛玻璃效果） */}
      <div className="patient-content-wrapper">
        <div className="patient-agent-container">
          <div className="glass-card">
            <iframe
              src={iframeUrl || 'about:blank'}
              width="100%"
              height="100%"
              title="Patient Interview Agent"
              allow="microphone *"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              style={{ border: 'none', borderRadius: '12px' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
