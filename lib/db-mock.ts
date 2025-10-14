// 本地開發用的模擬數據庫
// 僅在本地測試時使用，部署時將使用真實的 Vercel Postgres

export interface User {
  id: string
  account: string
  password: string
  name: string | null
  last_login: string | null
}

export const mockUsers: User[] = [
  {
    id: '1',
    account: 'admin',
    password: 'password123',
    name: '管理員',
    last_login: null
  },
  {
    id: '2',
    account: 'user1',
    password: 'password123',
    name: '用戶一',
    last_login: null
  },
  {
    id: '3',
    account: 'demo',
    password: 'demo123',
    name: '演示帳號',
    last_login: null
  }
]

// 根據帳號和密碼查找用戶
export function findUserByCredentials(
  account: string,
  password: string
): User | undefined {
  return mockUsers.find(
    (u) => u.account === account && u.password === password
  )
}

// 根據 ID 查找用戶
export function findUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id)
}

