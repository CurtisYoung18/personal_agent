// 本地開發用的模擬數據庫
// 僅在本地測試時使用，部署時將使用真實的 Vercel Postgres
// 基於真實的衛生防護中心食物中毒案例

export interface Patient {
  id: string
  case_number: string
  name: string
  email: string | null
  phone: string
  age: number | null
  gender: string | null
  occupation: string | null
  event_location: string
  event_date: string
  event_summary: string
  symptoms: any
  onset_datetime: string | null
  food_history: string | null
  notes: string | null
}

export const mockPatients: Patient[] = [
  {
    id: '1',
    case_number: '20251010-001',
    name: '葉問',
    email: 'yip.man@example.com',
    phone: '99998888',
    age: 34,
    gender: '男',
    occupation: 'Finance',
    event_location: '旺角彌敦道520號CDB Plaza 30樓The Seafood House',
    event_date: '2025-10-08',
    event_summary: 'The Seafood House 10月8日晚宴',
    symptoms: {
      stomach_pain: true,
      nausea: true,
      vomiting: { occurred: true, count: 2 },
      diarrhea: { occurred: true, count: 10 },
      fever: { occurred: true, max_temp: 39 },
      numbness: false,
      temperature_inversion: false,
      weakness: true,
      dizziness: true,
      rapid_heartbeat: false,
      other: null
    },
    onset_datetime: '2025-10-10 05:00:00',
    food_history: '9/10 晚餐：在家用餐；午餐：大快活；早餐：沒有進食\n8/10 晚餐：疑似問題餐；午餐：忘記；早餐：沒有進食\n7/10 晚餐：忘記；午餐：忘記；早餐：沒有進食',
    notes: '就醫：GP；已收集糞便樣本（OPD）；同意食環署聯絡跟進\n進食食物：鮑魚、青口、carbonara、Ham pizza、Octopus Resotto、Green pepper、烤豬柳、日本生蠔、西班牙生蠔、愛爾蘭生蠔、美國生蠔、蔬菜PIZZA、羊架、酒'
  },
  {
    id: '2',
    case_number: '20251010-002',
    name: 'Lam Lok',
    email: null,
    phone: '97684471',
    age: null,
    gender: null,
    occupation: null,
    event_location: '旺角彌敦道520號CDB Plaza 30樓The Seafood House',
    event_date: '2025-10-08',
    event_summary: 'The Seafood House 10月8日晚宴',
    symptoms: null,
    onset_datetime: null,
    food_history: null,
    notes: null
  },
  {
    id: '3',
    case_number: '20251010-003',
    name: 'Pretty',
    email: 'Dm_hito@dh.gov.hk',
    phone: '1',
    age: null,
    gender: null,
    occupation: null,
    event_location: '旺角彌敦道520號CDB Plaza 30樓The Seafood House',
    event_date: '2025-10-08',
    event_summary: 'The Seafood House 10月8日晚宴',
    symptoms: null,
    onset_datetime: null,
    food_history: null,
    notes: null
  },
  {
    id: '4',
    case_number: '20251010-004',
    name: 'Shaun Wun',
    email: null,
    phone: '55418888',
    age: null,
    gender: null,
    occupation: null,
    event_location: '旺角彌敦道520號CDB Plaza 30樓The Seafood House',
    event_date: '2025-10-08',
    event_summary: 'The Seafood House 10月8日晚宴',
    symptoms: null,
    onset_datetime: null,
    food_history: null,
    notes: null
  },
  {
    id: '5',
    case_number: '20251010-005',
    name: '凌兆楷 Wilfred',
    email: null,
    phone: '66837316',
    age: null,
    gender: null,
    occupation: null,
    event_location: '旺角彌敦道520號CDB Plaza 30樓The Seafood House',
    event_date: '2025-10-08',
    event_summary: 'The Seafood House 10月8日晚宴',
    symptoms: null,
    onset_datetime: null,
    food_history: null,
    notes: null
  },
  {
    id: '6',
    case_number: '20251010-006',
    name: 'Venus',
    email: null,
    phone: '64740051',
    age: null,
    gender: null,
    occupation: null,
    event_location: '旺角彌敦道520號CDB Plaza 30樓The Seafood House',
    event_date: '2025-10-08',
    event_summary: 'The Seafood House 10月8日晚宴',
    symptoms: null,
    onset_datetime: null,
    food_history: null,
    notes: null
  },
]

// 根據 email 和 phone 查找患者（支持電郵或電話登入）
export function findPatientByEmailAndPhone(
  email: string,
  phone: string
): Patient | undefined {
  return mockPatients.find(
    (p) => (p.email && p.email === email) || p.phone === phone
  )
}

// 根據 ID 查找患者
export function findPatientById(id: string): Patient | undefined {
  return mockPatients.find((p) => p.id === id)
}

