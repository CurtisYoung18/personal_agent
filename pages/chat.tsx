import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { HiPaperAirplane, HiRefresh } from 'react-icons/hi'
import { BiLoaderAlt } from 'react-icons/bi'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

interface ConversationItem {
  conversation_id: string
  user_id: string
  recent_chat_time: number
  subject: string
  conversation_type: string
  message_count: number
  cost_credit: number
  bot_id: string
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
  const [showWelcome, setShowWelcome] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [conversationList, setConversationList] = useState<ConversationItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isUserScrollingRef = useRef(false)
  const shouldAutoScrollRef = useRef(true)
  
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
    if (shouldAutoScrollRef.current && !isUserScrollingRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 监听用户滚动行为（鼠标滚轮和触摸）
  useEffect(() => {
    const messagesContainer = document.querySelector('.chat-messages')
    if (!messagesContainer) return

    let scrollTimeout: NodeJS.Timeout
    let userInteractionTimeout: NodeJS.Timeout

    // 监听鼠标滚轮事件
    const handleWheel = () => {
      isUserScrollingRef.current = true
      shouldAutoScrollRef.current = false
      
      clearTimeout(userInteractionTimeout)
      userInteractionTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainer
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100
        
        if (isAtBottom) {
          isUserScrollingRef.current = false
          shouldAutoScrollRef.current = true
        }
      }, 3000)
    }

    // 监听触摸事件（移动端）
    const handleTouchStart = () => {
      isUserScrollingRef.current = true
      shouldAutoScrollRef.current = false
    }

    // 监听滚动事件（作为备用）
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100
      
      if (!isAtBottom && !isUserScrollingRef.current) {
        isUserScrollingRef.current = true
        shouldAutoScrollRef.current = false
      }
      
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const { scrollTop: newScrollTop, scrollHeight: newScrollHeight, clientHeight: newClientHeight } = messagesContainer
        const isStillAtBottom = newScrollTop + newClientHeight >= newScrollHeight - 100
        
        if (isStillAtBottom) {
          isUserScrollingRef.current = false
          shouldAutoScrollRef.current = true
        }
      }, 2000)
    }

    messagesContainer.addEventListener('wheel', handleWheel, { passive: true })
    messagesContainer.addEventListener('touchstart', handleTouchStart, { passive: true })
    messagesContainer.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      messagesContainer.removeEventListener('wheel', handleWheel)
      messagesContainer.removeEventListener('touchstart', handleTouchStart)
      messagesContainer.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
      clearTimeout(userInteractionTimeout)
    }
  }, [])

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
          setTimeout(() => setShowWelcome(true), 300)
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

  // 获取历史对话列表
  const fetchConversationList = async () => {
    if (!userInfo) return
    
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/conversation/list?userId=${userInfo.account}&page=1&pageSize=50`)
      const data = await response.json()
      
      if (data.success) {
        setConversationList(data.list || [])
      } else {
        console.error('获取历史对话失败:', data.message)
      }
    } catch (error) {
      console.error('获取历史对话错误:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  // 加载历史对话消息
  const loadHistoryMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/conversation/messages?conversationId=${convId}&page=1&pageSize=100`)
      const data = await response.json()
      
      if (data.success) {
        // 转换消息格式
        const historyMessages: Message[] = []
        data.messages.forEach((msg: any) => {
          if (msg.role === 'user') {
            // 用户消息
            msg.content.forEach((contentItem: any) => {
              contentItem.branch_content?.forEach((branch: any) => {
                if (branch.type === 'text') {
                  historyMessages.push({
                    id: msg.message_id,
                    role: 'user',
                    content: branch.text || '',
                    timestamp: msg.create_time
                  })
                }
              })
            })
          } else if (msg.role === 'assistant') {
            // AI消息
            let combinedText = ''
            msg.content.forEach((contentItem: any) => {
              contentItem.branch_content?.forEach((branch: any) => {
                if (branch.type === 'text') {
                  combinedText += branch.text || ''
                }
              })
            })
            if (combinedText) {
              historyMessages.push({
                id: msg.message_id,
                role: 'assistant',
                content: combinedText,
                timestamp: msg.create_time
              })
            }
          }
        })
        
        setMessages(historyMessages)
        setConversationId(convId)
        setShowHistory(false)
      }
    } catch (error) {
      console.error('加载历史消息错误:', error)
      alert('加载历史对话失败')
    }
  }

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
      <header className={`chat-page-header-minimal ${showHistory ? 'with-history' : ''}`}>
        <div className="header-user-profile">
          <button 
            onClick={() => {
              setShowHistory(!showHistory)
              if (!showHistory && conversationList.length === 0) {
                fetchConversationList()
              }
            }} 
            className="history-btn"
            title="历史对话"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L14.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.05 11C3.5 6.5 7.36 3 12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C8.64 21 5.74 19.18 4.26 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 16.5V11H8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
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

      {/* 历史对话侧边栏 */}
      {showHistory && (
        <div className="history-sidebar">
          <div className="history-header">
            <h3>历史对话</h3>
            <button onClick={() => setShowHistory(false)} className="close-history-btn">
              ✕
            </button>
          </div>
          <div className="history-list">
            {loadingHistory ? (
              <div className="history-loading">加载中...</div>
            ) : conversationList.length === 0 ? (
              <div className="history-empty">暂无历史对话</div>
            ) : (
              conversationList.map((conv) => (
                <div 
                  key={conv.conversation_id} 
                  className={`history-item ${conv.conversation_id === conversationId ? 'active' : ''}`}
                  onClick={() => loadHistoryMessages(conv.conversation_id)}
                >
                  <div className="history-item-subject">{conv.subject || '新对话'}</div>
                  <div className="history-item-info">
                    <span className="history-item-time">
                      {new Date(conv.recent_chat_time).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="history-item-count">{conv.message_count} 条消息</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 欢迎动画 */}
      {showWelcome && (
        <div className={`welcome-overlay ${messages.length > 0 ? 'hide' : ''}`}>
          <div className="welcome-content-animation">
            <div className="welcome-avatar">
              <img src={userInfo.avatar_url || '/imgs/4k_5.png'} alt="User" />
            </div>
            <h1 className="welcome-title">欢迎回来</h1>
            <h2 className="welcome-username">{userInfo.name || userInfo.account}</h2>
            <p className="welcome-subtitle">您的个人工作助手已准备就绪</p>
          </div>
        </div>
      )}

      {/* 聊天容器 */}
      <div className={`chat-container ${showHistory ? 'with-history' : ''}`}>
        <div className="chat-messages">
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
                  <div className="message-text">
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
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
