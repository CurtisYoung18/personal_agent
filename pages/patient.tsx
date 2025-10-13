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

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function PatientPage() {
  const router = useRouter()
  const { id } = router.query
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  // 滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  // Effect 2: 初始化對話
  useEffect(() => {
    if (!patientInfo || hasInitialized.current) return

    hasInitialized.current = true

    const initializeConversation = async () => {
      try {
        const userId = patientInfo.caseNumber || patientInfo.phone
        console.log('📤 初始化對話...')

        // Step 1: 同步用戶屬性
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

        // Step 2: 創建對話
        const createResponse = await fetch('/api/conversation/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })

        const createData = await createResponse.json()
        if (createData.success && createData.conversation_id) {
          setConversationId(createData.conversation_id)
          console.log('✅ 對話已創建:', createData.conversation_id)

          // Step 3: 發送歡迎消息
          await sendMessage(`你好，我是${patientInfo.name}`, createData.conversation_id, true)
        }
      } catch (error) {
        console.error('❌ 初始化失敗:', error)
      }
    }

    initializeConversation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientInfo])

  // 發送消息
  const sendMessage = async (message: string, convId?: string, isWelcome = false) => {
    const targetConvId = convId || conversationId
    if (!targetConvId || !patientInfo) return

    // 添加用戶消息
    if (!isWelcome) {
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, userMessage])
      setInputMessage('')
    }

    setIsSending(true)

    try {
      const response = await fetch('/api/conversation/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: targetConvId,
          message: message,
        }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader')

      let aiMessage = ''
      let currentMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }

      // 添加一個空的 AI 消息用於流式更新
      setMessages(prev => [...prev, currentMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                aiMessage += parsed.content
                // 更新最後一條消息
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = {
                    ...currentMessage,
                    content: aiMessage,
                  }
                  return newMessages
                })
              }
            } catch (e) {
              // 忽略解析錯誤
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ 發送消息失敗:', error)
    } finally {
      setIsSending(false)
    }
  }

  // 處理發送
  const handleSend = () => {
    if (!inputMessage.trim() || isSending) return
    sendMessage(inputMessage.trim())
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

  return (
    <div className="chat-container">
      {/* 頂部信息卡片 */}
      <div className="chat-header">
        <div className="header-card">
          <div className="header-gradient">
            <div className="header-content">
              <div className="logo-circle">
                <img src="/logo.png" alt="香港衞生署" />
              </div>
              <h1>香港衞生署</h1>
              <p className="subtitle">智能化呈報傳染病平台</p>
              <p className="subtitle-en">Smart Disease Reporting Platform</p>
            </div>
          </div>

          <div className="info-section">
            <div className="alert-card">
              <div className="alert-icon">⚠️</div>
              <h4>緊急食物中毒事件調查</h4>
              <div className="alert-content">
                <div className="event-info">
                  <span>🏨</span>
                  <span>{patientInfo.eventSummary}</span>
                </div>
                <div className="patient-info">
                  <span>👤</span>
                  <span>當前調查對象：{patientInfo.name}</span>
                </div>
              </div>
            </div>

            <button onClick={handleLogout} className="logout-btn">
              登出
            </button>
          </div>
        </div>
      </div>

      {/* 對話區域 */}
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className="message-bubble">
              <div className="message-content">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString('zh-HK', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區域 */}
      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="輸入您的回答..."
            disabled={isSending}
            className="message-input"
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isSending}
            className="send-btn"
          >
            <i className="ri-send-plane-fill"></i>
          </button>
        </div>
      </div>
    </div>
  )
}
