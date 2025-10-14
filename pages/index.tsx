import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { HiUser, HiLockClosed, HiArrowLeft, HiCheckCircle } from 'react-icons/hi'
import { BiLoaderAlt } from 'react-icons/bi'

export default function LoginPage() {
  const router = useRouter()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // 检查是否有保存的登录信息
  useEffect(() => {
    let hasRun = false // 防止 React StrictMode 双重运行
    
    const checkAuth = () => {
      if (hasRun) return
      hasRun = true
      
      const savedUserId = localStorage.getItem('saved_user_id')
      const savedAccount = localStorage.getItem('saved_account')
      
      if (savedUserId && savedAccount) {
        sessionStorage.setItem('logged_in', 'true')
        sessionStorage.setItem('user_id', savedUserId)
        router.push(`/chat?id=${savedUserId}`)
      } else {
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 验证成功，设置登录标记
        sessionStorage.setItem('logged_in', 'true')
        sessionStorage.setItem('user_id', data.userId)
        
               if (rememberMe) {
                 localStorage.setItem('saved_user_id', data.userId)
                 localStorage.setItem('saved_account', account)
               } else {
                 localStorage.removeItem('saved_user_id')
                 localStorage.removeItem('saved_account')
               }
        
        // 跳转到聊天页面
        router.push(`/chat?id=${data.userId}`)
      } else {
        setError(data.message || '登录失败，请检查您的账号和密码')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 如果正在检查认证，显示加载状态
  if (checkingAuth) {
    return (
      <div className="page-container">
        <div className="checking-auth-container">
          <BiLoaderAlt className="spinner-icon-large" />
          <p>检查登录状态...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className={`page-wrapper ${showLoginForm ? 'flipped' : ''}`}>
        {/* 正面：Logo 歡迎頁 */}
        <div className="page-front">
          <div className="welcome-card">
            <div className="welcome-logo">
              <img 
                src="/imgs/bg_4.avif" 
                alt="Personal Agent Logo" 
                className="logo-img"
              />
            </div>
            <div className="welcome-content">
              <h1>个人工作助手</h1>
              <span className="demo-badge">Personal Agent</span>
              <p className="welcome-desc">
                欢迎使用智能工作助手系统
              </p>
              <button 
                className="enter-btn"
                onClick={() => setShowLoginForm(true)}
              >
                进入登录
              </button>
            </div>
          </div>
        </div>

        {/* 背面：登入表單 */}
        <div className="page-back">
          <div className="login-card">
            <button 
              className="back-btn"
              onClick={() => setShowLoginForm(false)}
              type="button"
            >
              <HiArrowLeft /> 返回
            </button>

            <div className="login-header">
              <h2>用户登录</h2>
              <p>请输入您的账号和密码</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group-animated active">
                <label htmlFor="account">
                  <HiUser className="label-icon" />
                  账号
                </label>
                <input
                  id="account"
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="请输入账号"
                  disabled={loading}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="form-group-animated active">
                <label htmlFor="password">
                  <HiLockClosed className="label-icon" />
                  密码
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  disabled={loading}
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* 记住我复选框 */}
              <div className="remember-me-container">
                <label className="remember-me-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkbox-text">记住我（下次自动登录）</span>
                </label>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <BiLoaderAlt className="spinner-icon" />
                    登录中...
                  </>
                ) : (
                  <>
                    <HiCheckCircle style={{ marginRight: '8px' }} />
                    登录
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <HiLockClosed style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              <small>您的资料将会被保密处理</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
