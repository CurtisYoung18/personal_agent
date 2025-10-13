-- 創建食物中毒案例患者信息表
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  case_number VARCHAR(50),                    -- 案例編號
  name VARCHAR(100) NOT NULL,                 -- 姓名
  email VARCHAR(255),                         -- 電郵（可選）
  phone VARCHAR(50) NOT NULL,                 -- 電話
  age INTEGER,                                -- 年齡
  gender VARCHAR(20),                         -- 性別
  occupation VARCHAR(100),                    -- 職業
  
  -- 事件資訊
  event_location VARCHAR(255),                -- 用餐地點
  event_date DATE,                            -- 用餐日期
  event_summary TEXT,                         -- 事件總結（detail字段用）
  
  -- 症狀資訊
  symptoms JSONB,                             -- 症狀詳情（JSON格式）
  onset_datetime TIMESTAMP,                   -- 病發時間
  
  -- 其他資訊
  food_history TEXT,                          -- 食物歷史
  notes TEXT,                                 -- 備註
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 創建索引以提高查詢性能
CREATE INDEX idx_phone ON patients(phone);
CREATE INDEX idx_case_number ON patients(case_number);
CREATE INDEX idx_event_date ON patients(event_date);

-- 插入真實案例數據：2025年10月10日 The Seafood House 食物中毒事件
-- 案例1: 葉問（已完成護士訪談）
INSERT INTO patients (
  case_number, name, email, phone, age, gender, occupation,
  event_location, event_date, event_summary,
  symptoms, onset_datetime,
  food_history, notes
) VALUES (
  '20251010-001',
  '葉問',
  'yip.man@example.com',
  '99998888',
  34,
  '男',
  'Finance',
  '旺角彌敦道520號CDB Plaza 30樓The Seafood House',
  '2025-10-08',
  'The Seafood House 10月8日晚宴',
  '{
    "stomach_pain": true,
    "nausea": true,
    "vomiting": {"occurred": true, "count": 2},
    "diarrhea": {"occurred": true, "count": 10},
    "fever": {"occurred": true, "max_temp": 39},
    "numbness": false,
    "temperature_inversion": false,
    "weakness": true,
    "dizziness": true,
    "rapid_heartbeat": false,
    "other": null
  }'::jsonb,
  '2025-10-10 05:00:00',
  '9/10 晚餐：在家用餐；午餐：大快活；早餐：沒有進食
8/10 晚餐：疑似問題餐；午餐：忘記；早餐：沒有進食
7/10 晚餐：忘記；午餐：忘記；早餐：沒有進食',
  '就醫：GP；已收集糞便樣本（OPD）；同意食環署聯絡跟進
進食食物：鮑魚、青口、carbonara、Ham pizza、Octopus Resotto、Green pepper、烤豬柳、日本生蠔、西班牙生蠔、愛爾蘭生蠔、美國生蠔、蔬菜PIZZA、羊架、酒'
);

-- 案例2-6: 同席用餐者（待訪談）
INSERT INTO patients (case_number, name, phone, email, age, gender, event_location, event_date, event_summary, onset_datetime) VALUES
  ('20251010-002', 'Lam Lok', '97684471', NULL, 28, '男', '旺角彌敦道520號CDB Plaza 30樓The Seafood House', '2025-10-08', 'The Seafood House 10月8日晚宴', '2025-10-09 12:00:00'),
  ('20251010-003', 'Pretty', '1', 'Dm_hito@dh.gov.hk', 25, '女', '旺角彌敦道520號CDB Plaza 30樓The Seafood House', '2025-10-08', 'The Seafood House 10月8日晚宴', '2025-10-09 08:30:00'),
  ('20251010-004', 'Shaun Wun', '55418888', NULL, 32, '男', '旺角彌敦道520號CDB Plaza 30樓The Seafood House', '2025-10-08', 'The Seafood House 10月8日晚宴', '2025-10-09 15:00:00'),
  ('20251010-005', '凌兆楷 Wilfred', '66837316', NULL, 29, '男', '旺角彌敦道520號CDB Plaza 30樓The Seafood House', '2025-10-08', 'The Seafood House 10月8日晚宴', '2025-10-09 10:30:00'),
  ('20251010-006', 'Venus', '64740051', NULL, 26, '女', '旺角彌敦道520號CDB Plaza 30樓The Seafood House', '2025-10-08', 'The Seafood House 10月8日晚宴', '2025-10-09 14:00:00');

-- 說明：
-- 1. 這個 SQL 腳本用於初始化 Vercel Postgres 數據庫
-- 2. 部署到 Vercel 後，您需要在 Vercel 控制台中運行這個腳本
-- 3. 或者使用 Vercel Postgres 的 Query 功能直接執行
-- 4. 本數據基於真實的衛生防護中心食物中毒案例

