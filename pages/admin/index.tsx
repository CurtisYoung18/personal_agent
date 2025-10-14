import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface User {
  id: number
  account: string
  name: string
  created_at: string
  last_login: string | null
}

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // 新增用户表单
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({
    account: '',
    password: '',
    name: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
      } else {
        setError(data.message || '加载用户列表失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('用户添加成功！')
        setNewUser({ account: '', password: '', name: '' })
        setShowAddForm(false)
        fetchUsers() // 刷新列表
      } else {
        setError(data.message || '添加用户失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('确定要删除此用户吗？')) return
    
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('用户删除成功！')
        fetchUsers() // 刷新列表
      } else {
        setError(data.message || '删除用户失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <h1>🔐 用户管理后台</h1>
          <p>Personal Agent - Admin Dashboard</p>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <div className="admin-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '取消' : '➕ 添加新用户'}
          </button>
          <button 
            className="btn-secondary"
            onClick={fetchUsers}
          >
            🔄 刷新
          </button>
        </div>

        {showAddForm && (
          <div className="add-user-form">
            <h3>添加新用户</h3>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>账号</label>
                <input
                  type="text"
                  value={newUser.account}
                  onChange={(e) => setNewUser({ ...newUser, account: e.target.value })}
                  required
                  placeholder="输入账号"
                />
              </div>
              <div className="form-group">
                <label>密码</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  placeholder="输入密码"
                />
              </div>
              <div className="form-group">
                <label>姓名</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="输入姓名（可选）"
                />
              </div>
              <button type="submit" className="btn-submit">添加用户</button>
            </form>
          </div>
        )}

        <div className="users-table-container">
          <h2>用户列表 ({users.length})</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>账号</th>
                <th>姓名</th>
                <th>创建时间</th>
                <th>最后登录</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    暂无用户数据，请添加用户
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td><strong>{user.account}</strong></td>
                    <td>{user.name || '-'}</td>
                    <td>{new Date(user.created_at).toLocaleString('zh-CN')}</td>
                    <td>
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleString('zh-CN')
                        : '从未登录'
                      }
                    </td>
                    <td>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        🗑️ 删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .admin-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }

        .admin-header h1 {
          font-size: 32px;
          color: #333;
          margin: 0 0 10px 0;
        }

        .admin-header p {
          color: #666;
          margin: 0;
        }

        .error-banner {
          background: #fee;
          color: #c33;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #c33;
        }

        .admin-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .add-user-form {
          background: #f9f9f9;
          padding: 25px;
          border-radius: 8px;
          margin-bottom: 30px;
          border: 2px solid #e0e0e0;
        }

        .add-user-form h3 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #555;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn-submit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .users-table-container {
          margin-top: 30px;
        }

        .users-table-container h2 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .users-table th {
          background: #f5f5f5;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #555;
          border-bottom: 2px solid #ddd;
        }

        .users-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
          color: #333;
        }

        .users-table tbody tr:hover {
          background: #f9f9f9;
        }

        .empty-state {
          text-align: center;
          color: #999;
          padding: 40px !important;
        }

        .btn-delete {
          background: #ff4757;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-delete:hover {
          background: #ff3838;
          transform: translateY(-1px);
        }

        .loading {
          text-align: center;
          padding: 60px;
          font-size: 18px;
          color: white;
        }
      `}</style>
    </div>
  )
}

