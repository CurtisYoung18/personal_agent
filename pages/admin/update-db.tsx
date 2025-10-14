import { useState } from 'react'

export default function UpdateDatabase() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpdate = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/update-db', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
      } else {
        setError(data.message || '更新失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#333' }}>
          数据库更新工具
        </h1>
        <p style={{ margin: '0 0 30px 0', color: '#666', fontSize: '14px' }}>
          此工具将为 users 表添加 avatar_url 字段
        </p>

        <button
          onClick={handleUpdate}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
          }}
        >
          {loading ? '更新中...' : '执行数据库更新'}
        </button>

        {message && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '10px',
            border: '1px solid #c3e6cb',
          }}>
            ✅ {message}
          </div>
        )}

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '10px',
            border: '1px solid #f5c6cb',
          }}>
            ❌ {error}
          </div>
        )}

        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666',
        }}>
          <strong>说明：</strong>
          <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
            <li>此操作会为 users 表添加 avatar_url 字段</li>
            <li>如果字段已存在，不会重复添加</li>
            <li>会为 admin 用户设置默认头像</li>
            <li>操作安全，不会删除现有数据</li>
          </ul>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/admin" style={{ color: '#667eea', textDecoration: 'none' }}>
            ← 返回管理后台
          </a>
        </div>
      </div>
    </div>
  )
}

