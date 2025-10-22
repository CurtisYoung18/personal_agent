import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface User {
  id: number
  account: string
  name: string
  avatar_url?: string
  created_at: string
  last_login: string | null
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState({
    account: '',
    password: '',
    name: '',
    avatar_url: '',
  })
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState('')
  
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState({
    account: '',
    password: '',
    name: '',
    avatar_url: '',
  })
  const [editPreviewAvatar, setEditPreviewAvatar] = useState('')

  useEffect(() => {
    let hasRun = false
    
    const checkAuth = () => {
      if (hasRun) return
      hasRun = true
      
      const savedUserId = localStorage.getItem('admin_saved_user_id')
      const savedAccount = localStorage.getItem('admin_saved_account')
      
      if (savedUserId && savedAccount) {
        sessionStorage.setItem('admin_authenticated', 'true')
        setIsAuthenticated(true)
        fetchUsers()
      } else {
        setCheckingAuth(false)
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    
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
        sessionStorage.setItem('admin_authenticated', 'true')
        localStorage.setItem('admin_saved_user_id', data.userId)
        localStorage.setItem('admin_saved_account', account)
        
        setIsAuthenticated(true)
        setLoading(true)
        fetchUsers()
      } else {
        setAuthError(data.message || '登录失败，请检查您的账号和密码')
      }
    } catch (err) {
      setAuthError('网络错误，请稍后重试')
    } finally {
      setAuthLoading(false)
    }
  }
  
  const handleLogout = () => {
    if (confirm('确定要登出吗？')) {
      sessionStorage.removeItem('admin_authenticated')
      localStorage.removeItem('admin_saved_user_id')
      localStorage.removeItem('admin_saved_account')
      setIsAuthenticated(false)
      setShowLoginForm(false)
      setAccount('')
      setPassword('')
    }
  }

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
        setNewUser({ account: '', password: '', name: '', avatar_url: '' })
        setPreviewAvatar('')
        setShowAddForm(false)
        fetchUsers()
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

  // 开始编辑用户
  const startEditUser = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      account: user.account,
      password: '', // 不显示原密码
      name: user.name || '',
      avatar_url: user.avatar_url || '',
    })
    setEditPreviewAvatar(user.avatar_url || '')
    setShowAddForm(false) // 关闭添加表单
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingUser(null)
    setEditFormData({
      account: '',
      password: '',
      name: '',
      avatar_url: '',
    })
    setEditPreviewAvatar('')
  }

  // 提交编辑
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!editingUser) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingUser.id,
          ...editFormData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('用户更新成功！')
        cancelEdit()
        fetchUsers()
      } else {
        setError(data.message || '更新用户失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    }
  }

  // 处理编辑表单的头像上传
  const handleEditAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      alert('仅支持 PNG、JPEG、JPG、WEBP、GIF 格式的图片')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB（建议使用压缩后的图片）')
      return
    }

    setUploadingAvatar(true)
    setError('')

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64Image = event.target?.result as string
        setEditPreviewAvatar(base64Image)
        setEditFormData({ ...editFormData, avatar_url: base64Image })
        setUploadingAvatar(false)
        console.log('✅ 头像已转换为 base64，大小:', (base64Image.length / 1024).toFixed(2), 'KB')
      }

      reader.onerror = () => {
        setError('读取文件失败')
        setUploadingAvatar(false)
      }

      reader.readAsDataURL(file)
    } catch (err) {
      setError('头像处理失败')
      setUploadingAvatar(false)
    }
  }

  // 处理编辑表单的 URL 输入
  const handleEditAvatarUrlChange = (url: string) => {
    setEditFormData({ ...editFormData, avatar_url: url })
    if (url.trim()) {
      setEditPreviewAvatar(url)
    } else {
      setEditPreviewAvatar('')
    }
  }

  // 处理头像上传（转换为 base64 直接存储到数据库）
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      alert('仅支持 PNG、JPEG、JPG、WEBP、GIF 格式的图片')
      return
    }

    // 验证文件大小（2MB，base64 会增大约 33%）
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB（建议使用压缩后的图片）')
      return
    }

    setUploadingAvatar(true)
    setError('')

    try {
      // 读取文件为 base64
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64Image = event.target?.result as string
        
        // 设置预览
        setPreviewAvatar(base64Image)
        
        // 直接将 base64 设置为 avatar_url，存储到数据库
        setNewUser({ ...newUser, avatar_url: base64Image })
        
        setUploadingAvatar(false)
        console.log('✅ 头像已转换为 base64，大小:', (base64Image.length / 1024).toFixed(2), 'KB')
      }

      reader.onerror = () => {
        setError('读取文件失败')
        setUploadingAvatar(false)
      }

      reader.readAsDataURL(file)
    } catch (err) {
      setError('头像处理失败')
      setUploadingAvatar(false)
    }
  }

  // 处理头像 URL 输入（支持直接输入图片 URL）
  const handleAvatarUrlChange = (url: string) => {
    setNewUser({ ...newUser, avatar_url: url })
    
    // 实时预览 URL
    if (url.trim()) {
      setPreviewAvatar(url)
    } else {
      setPreviewAvatar('')
    }
  }

  if (!isAuthenticated) {
    if (checkingAuth) {
      return (
        <div className="admin-page">
          <div className="admin-login-container">
            <div className="admin-login-card">
              <p>检查登录状态...</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="admin-page">
        <div className="admin-login-container">
          <div className={`admin-login-wrapper ${showLoginForm ? 'flipped' : ''}`}>
            <div className="login-front">
              <div className="welcome-logo">
                <img src="/imgs/bg_4.avif" alt="Logo" />
              </div>
              <h1>管理后台</h1>
              <p>Personal Agent Admin</p>
              <button className="enter-btn" onClick={() => setShowLoginForm(true)}>
                进入登录
              </button>
            </div>

            <div className="login-back">
              <button className="back-btn" onClick={() => setShowLoginForm(false)}>
                ← 返回
              </button>
              <h2>管理员登录</h2>
              <p>请输入您的账号和密码</p>
              {authError && <div className="auth-error">{authError}</div>}
              <form onSubmit={handleAdminLogin}>
                <div className="form-group">
                  <label>账号</label>
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="请输入账号"
                    required
                    disabled={authLoading}
                  />
                </div>
                <div className="form-group">
                  <label>密码</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    required
                    disabled={authLoading}
                  />
                </div>
                <button type="submit" className="btn-login" disabled={authLoading}>
                  {authLoading ? '登录中...' : '登录'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <style jsx>{`
          .admin-login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            perspective: 1000px;
          }

          .admin-login-wrapper {
            position: relative;
            width: 100%;
            max-width: 400px;
            height: 500px;
            transition: transform 0.6s;
            transform-style: preserve-3d;
          }

          .admin-login-wrapper.flipped {
            transform: rotateY(180deg);
          }

          .login-front, .login-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .login-back {
            transform: rotateY(180deg);
          }

          .welcome-logo {
            width: 100px;
            height: 100px;
            margin-bottom: 30px;
          }

          .welcome-logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            animation: float 3s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          .login-front h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            color: #333;
          }

          .login-front p {
            color: #666;
            margin-bottom: 30px;
          }

          .enter-btn {
            padding: 12px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }

          .enter-btn:hover {
            transform: translateY(-2px);
          }

          .back-btn {
            align-self: flex-start;
            padding: 8px 16px;
            background: #f0f0f0;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 20px;
          }

          .login-back h2 {
            margin: 0 0 10px 0;
            font-size: 24px;
            color: #333;
          }

          .login-back p {
            color: #666;
            margin-bottom: 20px;
          }

          .auth-error {
            background: #fee;
            color: #c33;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            width: 100%;
          }

          .form-group {
            margin-bottom: 20px;
            width: 100%;
          }

          .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
            text-align: left;
          }

          .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
          }

          .form-group input:focus {
            outline: none;
            border-color: #667eea;
          }

          .btn-login {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }

          .btn-login:hover:not(:disabled) {
            transform: translateY(-2px);
          }

          .btn-login:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .admin-login-card {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            text-align: center;
          }
        `}</style>
      </div>
    )
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
          <button className="btn-logout" onClick={handleLogout}>
            登出
          </button>
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
              <div className="form-group">
                <label>用户头像</label>
                <div className="avatar-upload-container">
                  {(previewAvatar || newUser.avatar_url) && (
                    <div className="avatar-preview">
                      <img 
                        src={previewAvatar || newUser.avatar_url} 
                        alt="头像预览" 
                        onError={(e) => {
                          e.currentTarget.src = '/imgs/4k_5.png'
                          setError('图片加载失败，请检查 URL 是否有效')
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="avatar-input-tabs">
                    <div className="tab-buttons">
                      <button 
                        type="button"
                        className={`tab-btn ${!newUser.avatar_url.startsWith('http') ? 'active' : ''}`}
                        onClick={() => {
                          setNewUser({ ...newUser, avatar_url: '' })
                          setPreviewAvatar('')
                        }}
                      >
                        📁 上传本地图片
                      </button>
                      <button 
                        type="button"
                        className={`tab-btn ${newUser.avatar_url.startsWith('http') ? 'active' : ''}`}
                        onClick={() => {
                          setNewUser({ ...newUser, avatar_url: '' })
                          setPreviewAvatar('')
                        }}
                      >
                        🔗 输入图片 URL
                      </button>
                    </div>

                    {!newUser.avatar_url.startsWith('http') ? (
                      <div className="upload-section">
                        <input
                          type="file"
                          accept=".png,.jpeg,.jpg,.webp,.gif"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="file-input"
                        />
                        {uploadingAvatar && <span className="uploading-text">处理中...</span>}
                        <p className="helper-text">
                          💡 支持 PNG、JPEG、JPG、WEBP、GIF 格式<br/>
                          📦 最大 2MB（会转为 base64 存储到数据库）
                        </p>
                      </div>
                    ) : (
                      <div className="url-input-section">
                        <input
                          type="url"
                          value={newUser.avatar_url}
                          onChange={(e) => handleAvatarUrlChange(e.target.value)}
                          placeholder="https://i.imgur.com/example.png"
                          className="url-input"
                        />
                        <p className="helper-text">
                          💡 输入可访问的图片 URL，支持实时预览<br/>
                          🌐 推荐使用 Imgur、Cloudinary 等图床链接
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-submit" disabled={uploadingAvatar}>
                {uploadingAvatar ? '上传中...' : '添加用户'}
              </button>
            </form>
          </div>
        )}

        {/* 编辑用户表单 */}
        {editingUser && (
          <div className="add-user-form">
            <h3>✏️ 编辑用户: {editingUser.account}</h3>
            <form onSubmit={handleEditUser}>
              <div className="form-group">
                <label>账号 *</label>
                <input
                  type="text"
                  required
                  value={editFormData.account}
                  onChange={(e) => setEditFormData({ ...editFormData, account: e.target.value })}
                  placeholder="输入账号"
                />
              </div>
              <div className="form-group">
                <label>密码（留空则不修改）</label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="输入新密码（可选）"
                />
              </div>
              <div className="form-group">
                <label>姓名</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="输入姓名（可选）"
                />
              </div>
              <div className="form-group">
                <label>用户头像</label>
                <div className="avatar-upload-container">
                  {(editPreviewAvatar || editFormData.avatar_url) && (
                    <div className="avatar-preview">
                      <img 
                        src={editPreviewAvatar || editFormData.avatar_url} 
                        alt="头像预览" 
                        onError={(e) => {
                          e.currentTarget.src = '/imgs/4k_5.png'
                          setError('图片加载失败，请检查 URL 是否有效')
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="avatar-input-tabs">
                    <div className="tab-buttons">
                      <button 
                        type="button"
                        className={`tab-btn ${!editFormData.avatar_url.startsWith('http') ? 'active' : ''}`}
                        onClick={() => {
                          setEditFormData({ ...editFormData, avatar_url: '' })
                          setEditPreviewAvatar('')
                        }}
                      >
                        📁 上传本地图片
                      </button>
                      <button 
                        type="button"
                        className={`tab-btn ${editFormData.avatar_url.startsWith('http') ? 'active' : ''}`}
                        onClick={() => {
                          setEditFormData({ ...editFormData, avatar_url: '' })
                          setEditPreviewAvatar('')
                        }}
                      >
                        🔗 输入图片 URL
                      </button>
                    </div>

                    {!editFormData.avatar_url.startsWith('http') ? (
                      <div className="upload-section">
                        <input
                          type="file"
                          accept=".png,.jpeg,.jpg,.webp,.gif"
                          onChange={handleEditAvatarUpload}
                          disabled={uploadingAvatar}
                          className="file-input"
                        />
                        {uploadingAvatar && <span className="uploading-text">处理中...</span>}
                        <p className="helper-text">
                          💡 支持 PNG、JPEG、JPG、WEBP、GIF 格式<br/>
                          📦 最大 2MB（会转为 base64 存储到数据库）
                        </p>
                      </div>
                    ) : (
                      <div className="url-input-section">
                        <input
                          type="url"
                          value={editFormData.avatar_url}
                          onChange={(e) => handleEditAvatarUrlChange(e.target.value)}
                          placeholder="https://i.imgur.com/example.png"
                          className="url-input"
                        />
                        <p className="helper-text">
                          💡 输入可访问的图片 URL，支持实时预览<br/>
                          🌐 推荐使用 Imgur、Cloudinary 等图床链接
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={uploadingAvatar}>
                  {uploadingAvatar ? '处理中...' : '保存修改'}
                </button>
                <button type="button" className="btn-cancel" onClick={cancelEdit}>
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="users-table-container">
          <h2>用户列表 ({users.length})</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>头像</th>
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
                  <td colSpan={7} className="empty-state">
                    暂无用户数据，请添加用户
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div className="user-avatar-cell">
                        <img 
                          src={user.avatar_url || '/imgs/4k_5.png'} 
                          alt={user.name || user.account}
                          className="table-avatar"
                        />
                      </div>
                    </td>
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
                      <div className="action-buttons">
                        <button 
                          className="btn-edit"
                          onClick={() => startEditUser(user)}
                        >
                          ✏️ 编辑
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          🗑️ 删除
                        </button>
                      </div>
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
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }

        .admin-header > div {
          flex: 1;
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

        .btn-logout {
          padding: 10px 20px;
          background: #ff4757;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-logout:hover {
          background: #ff3838;
          transform: translateY(-2px);
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

        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .btn-edit {
          background: #667eea;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-edit:hover {
          background: #5568d3;
          transform: translateY(-1px);
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

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .btn-cancel {
          background: #95a5a6;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-cancel:hover {
          background: #7f8c8d;
          transform: translateY(-2px);
        }

        .loading {
          text-align: center;
          padding: 60px;
          font-size: 18px;
          color: white;
        }

        .avatar-upload-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .avatar-preview {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          margin: 0 auto;
        }

        .avatar-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-input-tabs {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .tab-buttons {
          display: flex;
          gap: 10px;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 10px;
        }

        .tab-btn {
          flex: 1;
          padding: 10px 15px;
          background: #f5f5f5;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-btn:hover {
          background: #ebebeb;
          border-color: #ccc;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .upload-section,
        .url-input-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .file-input {
          padding: 10px;
          border: 2px dashed #ddd;
          border-radius: 8px;
          background: #fafafa;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .file-input:hover {
          border-color: #667eea;
          background: #f5f7ff;
        }

        .url-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .url-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .uploading-text {
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
        }

        .helper-text {
          color: #999;
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
          text-align: center;
        }

        .user-avatar-cell {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .table-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #ddd;
        }
      `}</style>
    </div>
  )
}

