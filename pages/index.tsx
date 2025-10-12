import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 檢查是否已有記住的用戶
  useEffect(() => {
    const rememberedPatient = localStorage.getItem('hp_patient_session')
    if (rememberedPatient) {
      try {
        const patientData = JSON.parse(rememberedPatient)
        // 自動跳轉到患者頁面
        router.push(`/patient?id=${patientData.id}`)
      } catch (e) {
        // 如果解析失敗，清除無效數據
        localStorage.removeItem('hp_patient_session')
      }
    }
  }, [])

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
        body: JSON.stringify({ email, phone }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 儲存患者會話到 localStorage（記住用戶）
        localStorage.setItem('hp_patient_session', JSON.stringify({
          id: data.patientId,
          loginTime: new Date().toISOString(),
        }))
        
        // 驗證成功，跳轉到 iframe 頁面，並傳遞患者 ID
        router.push(`/patient?id=${data.patientId}`)
      } else {
        setError(data.message || '驗證失敗，請檢查您的電郵和電話')
      }
    } catch (err) {
      setError('網絡錯誤，請稍後重試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo 和標題 */}
        <div className="login-logo-section">
          <img 
            src="/卫生署logo.png" 
            alt="香港特別行政區政府 衛生署 衛生防護中心" 
            className="chp-logo"
          />
          <div className="login-title-section">
            <h1>食物中毒調查問卷</h1>
            <p className="demo-badge">Demo 演示平台</p>
          </div>
        </div>

        <div className="login-divider"></div>

        <div className="login-header">
          <h2>患者身份驗證</h2>
          <p>請輸入您的電話號碼以繼續訪談</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="phone">電話號碼 *</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="例如：9123 4567"
              required
              disabled={loading}
            />
            <small style={{color: '#718096', fontSize: '12px', marginTop: '4px'}}>
              請輸入 8 位數字（無需加區號 +852）
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="email">電郵地址（可選）</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="例如：patient@example.com"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '驗證中...' : '開始訪談'}
          </button>
        </form>

        <div className="login-footer">
          <small>🔒 您的資料將會被保密處理</small>
        </div>
      </div>
    </div>
  )
}

