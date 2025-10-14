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
        // 驗證成功，跳轉到聊天頁面
        router.push(`/chat?id=${data.userId}`)
      } else {
        setError(data.message || '登入失敗，請檢查您的帳號和密碼')
      }
    } catch (err) {
      setError('網絡錯誤，請稍後重試')
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
              <h1>個人工作助手</h1>
              <span className="demo-badge">Personal Agent</span>
              <p className="welcome-desc">
                歡迎使用智能工作助手系統
              </p>
              <button 
                className="enter-btn"
                onClick={() => setShowLoginForm(true)}
              >
                進入登入
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
              <h2>用戶登入</h2>
              <p>請輸入您的帳號和密碼</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group-animated active">
                <label htmlFor="account">
                  <HiUser className="label-icon" />
                  帳號
                </label>
                <input
                  id="account"
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="請輸入帳號"
                  disabled={loading}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="form-group-animated active">
                <label htmlFor="password">
                  <HiLockClosed className="label-icon" />
                  密碼
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請輸入密碼"
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
                    登入中...
                  </>
                ) : (
                  <>
                    <HiCheckCircle style={{ marginRight: '8px' }} />
                    登入
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <HiLockClosed style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              <small>您的資料將會被保密處理</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
