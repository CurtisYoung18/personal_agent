import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { HiPaperAirplane, HiRefresh } from 'react-icons/hi'
import { BiLoaderAlt } from 'react-icons/bi'

interface UserInfo {
  id: string
  account: string
  name: string | null
  lastLogin: string | null
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function ChatPage() {
  const router = useRouter()
  const { id } = router.query
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [conversationId, setConversationId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 計時器狀態
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerStartTimeRef = useRef<number>(0)

  // 計時器管理函數
  const startTimer = () => {
    const storageKey = `user_timer_${id}`
    const savedTime = localStorage.getItem(storageKey)
    const savedStartTime = localStorage.getItem(`${storageKey}_start`)
    
    if (savedTime && savedStartTime) {
      const previousElapsed = parseInt(savedTime, 10)
      const startTime = parseInt(savedStartTime, 10)
      const now = Date.now()
      const currentElapsed = previousElapsed + Math.floor((now - startTime) / 1000)
      setElapsedTime(currentElapsed)
      timerStartTimeRef.current = now
    } else {
      const now = Date.now()
      timerStartTimeRef.current = now
      localStorage.setItem(`${storageKey}_start`, now.toString())
      setElapsedTime(0)
    }
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1
        localStorage.setItem(storageKey, newTime.toString())
        return newTime
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }

  const resetTimer = () => {
    const storageKey = `user_timer_${id}`
    localStorage.removeItem(storageKey)
    localStorage.removeItem(`${storageKey}_start`)
    setElapsedTime(0)
    stopTimer()
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 自動滾動到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 加載用戶信息並創建對話
  useEffect(() => {
    if (!id) {
      router.push('/')
      return
    }

    const initChat = async () => {
      try {
        // 1. 獲取用戶信息
        const userResponse = await fetch(`/api/user?id=${id}`)
        const userData = await userResponse.json()

        if (!userResponse.ok || !userData.success) {
          router.push('/')
          return
        }

        setUserInfo(userData.user)

        // 2. 創建對話
        const convResponse = await fetch('/api/conversation/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.user.account }),
        })

        const convData = await convResponse.json()

        if (convResponse.ok && convData.success) {
          setConversationId(convData.conversationId)
          console.log('✅ 對話創建成功:', convData.conversationId)
        } else {
          throw new Error(convData.message || '創建對話失敗')
        }
      } catch (err) {
        console.error('初始化失敗:', err)
        alert('初始化失敗，請重試')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    initChat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // 啟動計時器
  useEffect(() => {
    if (!loading && id) {
      startTimer()
    }
    
    return () => {
      stopTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, id])

  // 處理發送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending || !conversationId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setSending(true)
    setIsStreaming(true)

    // 創建臨時的 AI 消息
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, aiMessage])

    try {
      const response = await fetch('/api/conversation/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: userMessage.content,
        }),
      })

      if (!response.ok) {
        throw new Error('發送失敗')
      }

      // 处理 SSE 流
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法读取响应')
      }

      let accumulatedText = ''
      let chunkCount = 0

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log(`✅ 流式传输完成，共收到 ${chunkCount} 个数据块`)
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        chunkCount++
        console.log(`📦 收到数据块 #${chunkCount}:`, chunk.substring(0, 100))
        
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.trim()) continue
          
          try {
            const data = JSON.parse(line)
            console.log('📝 解析数据:', data)
            
            // 检查不同的响应格式
            if (data.code === 3 && data.data) {
              // 文本消息
              accumulatedText += data.data
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, content: accumulatedText }
                    : msg
                )
              )
            } else if (data.code === 0) {
              // 结束标记
              console.log('✅ 收到结束标记')
            } else if (data.event === 'message' && data.data) {
              // 另一种可能的格式
              accumulatedText += data.data
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, content: accumulatedText }
                    : msg
                )
              )
            }
          } catch (e) {
            console.error('❌ JSON 解析错误:', e, '原始内容:', line)
          }
        }
      }
      
      // 如果没有收到任何内容，显示错误
      if (accumulatedText === '') {
        console.warn('⚠️ 未收到任何 AI 回复内容')
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: '(AI 未返回内容，请重试)' }
              : msg
          )
        )
      }
    } catch (error) {
      console.error('❌ 发送消息错误:', error)
      // 移除失败的 AI 消息
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId))
      alert('发送失败，请重试')
    } finally {
      setSending(false)
      setIsStreaming(false)
    }
  }

  // 处理登出
  const handleLogout = () => {
    if (confirm('确定要登出吗？')) {
      resetTimer()
      router.push('/')
    }
  }

  // 處理 Enter 鍵發送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 加载阶段
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>初始化中...</p>
      </div>
    )
  }

  if (!userInfo) {
    return null
  }

  return (
    <div className="chat-page fade-in">
      {/* 顶部导航栏 - 仅保留登出按钮 */}
      <header className="chat-page-header-minimal">
        <button onClick={handleLogout} className="logout-btn-minimal">
          登出
        </button>
      </header>

      {/* 聊天容器 */}
      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h2>👋 您好，{userInfo.name || userInfo.account}！</h2>
              <p>我是您的个人工作助手，有什么可以帮到您的吗？</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                {msg.role === 'assistant' && msg.content === '' && isStreaming && (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 輸入區域 */}
        <div className="chat-input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息...（Shift+Enter 换行，Enter 发送）"
            disabled={sending}
            rows={3}
            className="chat-input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sending}
            className="send-button"
          >
            {sending ? (
              <BiLoaderAlt className="spinner-icon" />
            ) : (
              <HiPaperAirplane />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
