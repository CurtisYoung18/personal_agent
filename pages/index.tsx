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
        <div className="login-header">
          <h1>患者身份驗證</h1>
          <p>請輸入您的電郵和電話以繼續</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">電郵地址（可選）</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">電話號碼</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="99998888"
              required
              disabled={loading}
            />
            <small style={{color: '#718096', fontSize: '12px', marginTop: '4px'}}>
              請輸入電話號碼（不需要加 +852）
            </small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '驗證中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  )
}

