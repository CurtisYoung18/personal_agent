import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 簡單的管理員驗證（實際項目中應該使用更安全的方式）
    // 預設管理員帳號：admin / admin123
    if (username === 'admin' && password === 'admin123') {
      // 設置 session（簡單實現，使用 localStorage）
      localStorage.setItem('admin_session', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('使用者名稱或密碼錯誤')
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-header">
          <h1>🔐 管理員登入</h1>
          <p>患者數據管理系統</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">管理員帳號</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '登入中...' : '登入'}
          </button>

          <div className="admin-hint">
            <small>💡 預設帳號：admin / admin123</small>
          </div>
        </form>
      </div>
    </div>
  )
}

