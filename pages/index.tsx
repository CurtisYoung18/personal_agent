import { useState, FormEvent } from 'react'
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
        // 验证成功，跳转到聊天页面
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
