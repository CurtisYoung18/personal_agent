import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { HiPaperAirplane, HiRefresh } from 'react-icons/hi'
import { BiLoaderAlt } from 'react-icons/bi'

interface UserInfo {
  id: string
  account: string
  name: string | null
  avatar_url?: string
  lastLogin: string | null
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  images?: Array<{
    base64: string
    format: string
    name: string
  }>
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
  const [uploadedImages, setUploadedImages] = useState<Array<{base64: string, format: string, name: string}>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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

  // 加载用户信息并创建对话
  useEffect(() => {
    if (!id) {
      router.push('/')
      return
    }

    // 检查是否有登录标记（从登录页跳转过来）
    const isFromLogin = sessionStorage.getItem('logged_in')
    if (!isFromLogin) {
      console.warn('⚠️ 未检测到登录状态，返回登录页')
      router.push('/')
      return
    }

    // 防止 React StrictMode 双重运行
    let isMounted = true

    const initChat = async () => {
      try {
        // 1. 获取用户信息
        const userResponse = await fetch(`/api/user?id=${id}`)
        const userData = await userResponse.json()

        if (!isMounted) return // 如果组件已卸载，不继续执行

        if (!userResponse.ok || !userData.success) {
          sessionStorage.removeItem('logged_in')
          router.push('/')
          return
        }

        setUserInfo(userData.user)

        // 2. 创建对话
        const convResponse = await fetch('/api/conversation/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.user.account }),
        })

        const convData = await convResponse.json()

        if (!isMounted) return // 如果组件已卸载，不继续执行

        if (convResponse.ok && convData.success) {
          setConversationId(convData.conversationId)
        } else {
          throw new Error(convData.message || '创建对话失败')
        }
      } catch (err) {
        if (!isMounted) return
        console.error('❌ 初始化失败:', err)
        sessionStorage.removeItem('logged_in')
        alert('初始化失败，请重试')
        router.push('/')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initChat()
    
    // 清理函数
    return () => {
      isMounted = false
    }
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

  // 处理发送消息（streaming 模式）
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending || !userInfo) return

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

    // 创建临时的 AI 消息
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
          conversationId: conversationId || undefined,
          userId: userInfo.account,
          message: userMessage.content,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 处理 SSE 流式响应
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let receivedConversationId = ''

      if (!reader) {
        throw new Error('无法读取响应流')
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          // 移除 'data:' 前缀（如果有）
          let data = line.trim()
          if (data.startsWith('data:')) {
            data = data.slice(5).trim()
          }
          
          if (data === '[DONE]') continue
          
          if (!data) continue

          try {
            const json = JSON.parse(data)
            
            if (json.code === 3 && json.message === 'Text' && json.data) {
              fullContent += json.data
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, content: fullContent }
                    : msg
                )
              )
            }
          } catch (parseError) {
            // 忽略解析错误
          }
        }
      }

      if (!fullContent) {
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
      // 清除 sessionStorage 登录标记
      sessionStorage.removeItem('logged_in')
      sessionStorage.removeItem('user_id')
      
      // 清除 localStorage 保存的自动登录信息
      localStorage.removeItem('saved_user_id')
      localStorage.removeItem('saved_account')
      console.log('✅ 已清除所有登录信息')
      
      // 停止计时器
      resetTimer()
      // 返回登录页
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
      {/* 顶部导航栏 - 用户信息 + 登出 */}
      <header className="chat-page-header-minimal">
        <div className="header-user-profile">
          <img 
            src={userInfo.avatar_url || '/imgs/4k_5.png'} 
            alt="User" 
            className="user-profile-avatar" 
          />
          <span className="user-profile-name">{userInfo.name || userInfo.account}</span>
        </div>
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
                {msg.role === 'user' ? (
                  <img 
                    src={userInfo.avatar_url || '/imgs/4k_5.png'} 
                    alt="User" 
                    className="avatar-img" 
                  />
                ) : (
                  <img src="/imgs/bg_4.avif" alt="Bot" className="avatar-img" />
                )}
              </div>
              <div className="message-content">
                {msg.content !== '' && (
                  <div className="message-text">{msg.content}</div>
                )}
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
