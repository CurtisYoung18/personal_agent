import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/router'
import { HiPhone, HiMail, HiArrowLeft, HiLockClosed, HiCheckCircle } from 'react-icons/hi'
import { BiLoaderAlt } from 'react-icons/bi'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone') // 默認使用手機號登入

  // 移除自動登錄功能，每次都需要重新輸入密碼

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 根據選擇的登入方式，只發送對應的字段
      const payload = loginMethod === 'phone' 
        ? { phone, email: '' }
        : { email, phone: '' }

      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 驗證成功，跳轉到患者頁面（會顯示過渡動畫並創建對話）
        router.push(`/patient?id=${data.patientId}`)
      } else {
        setError(data.message || '驗證失敗，請檢查您的資料')
      }
    } catch (err) {
      setError('網絡錯誤，請稍後重試')
    } finally {
      setLoading(false)
    }
  }

  const switchLoginMethod = () => {
    setLoginMethod(prev => prev === 'phone' ? 'email' : 'phone')
    setError('') // 清除錯誤
  }

  return (
    <div className="page-container">
      <div className={`page-wrapper ${showLoginForm ? 'flipped' : ''}`}>
        {/* 正面：Logo 歡迎頁 */}
        <div className="page-front">
          <div className="welcome-card">
            <img 
              src="/卫生署logo.png" 
              alt="香港特別行政區政府 衛生署 衛生防護中心" 
              className="chp-logo"
            />
            <div className="welcome-content">
              <h1>食物中毒調查問卷</h1>
              <span className="demo-badge">Demo 演示平台</span>
              <p className="welcome-desc">
                歡迎使用香港衛生署食物中毒調查系統
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
              <h2>患者身份驗證</h2>
              <p>請選擇登入方式</p>
            </div>

            {/* 登入方式切換器 */}
            <div className="login-method-switch">
              <button
                type="button"
                className={`method-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                onClick={() => setLoginMethod('phone')}
                disabled={loading}
              >
                <HiPhone className="method-icon" />
                <span>手機號碼</span>
              </button>
              <button
                type="button"
                className={`method-btn ${loginMethod === 'email' ? 'active' : ''}`}
                onClick={() => setLoginMethod('email')}
                disabled={loading}
              >
                <HiMail className="method-icon" />
                <span>電郵地址</span>
              </button>
              <div 
                className="method-slider" 
                style={{ 
                  transform: loginMethod === 'phone' ? 'translateX(0)' : 'translateX(100%)'
                }}
              />
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* 手機號輸入（帶動畫） */}
              <div 
                className={`form-group-animated ${loginMethod === 'phone' ? 'active' : ''}`}
                style={{
                  display: loginMethod === 'phone' ? 'block' : 'none'
                }}
              >
                <label htmlFor="phone">
                  <HiPhone className="label-icon" />
                  電話號碼
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="請輸入 8 位數字"
                  disabled={loading}
                  required={loginMethod === 'phone'}
                />
                <small className="input-hint">
                  例如：9123 4567（無需加區號 +852）
                </small>
              </div>

              {/* 郵箱輸入（帶動畫） */}
              <div 
                className={`form-group-animated ${loginMethod === 'email' ? 'active' : ''}`}
                style={{
                  display: loginMethod === 'email' ? 'block' : 'none'
                }}
              >
                <label htmlFor="email">
                  <HiMail className="label-icon" />
                  電郵地址
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="請輸入您的電郵地址"
                  disabled={loading}
                  required={loginMethod === 'email'}
                />
                <small className="input-hint">
                  郵箱不區分大小寫，例如：patient@example.com
                </small>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <BiLoaderAlt className="spinner-icon" />
                    驗證中...
                  </>
                ) : (
                  <>
                    <HiCheckCircle style={{ marginRight: '8px' }} />
                    開始訪談
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

