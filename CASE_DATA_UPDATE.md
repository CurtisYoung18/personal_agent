# 真實案例數據更新說明

## 📋 更新概述

根據 `case_progress.md` 中的真實衛生防護中心食物中毒案例，系統已全面更新數據結構和業務邏輯。

## 🎯 案例背景

**事件**：2025年10月10日，衛生防護中心接獲1823轉介個案  
**地點**：旺角彌敦道520號CDB Plaza 30樓The Seafood House  
**日期**：2025年10月8日晚宴  
**報案人**：葉先生  

## 👥 涉及人員（共6人）

| ID | 姓名 | 聯繫方式 | 狀態 |
|----|------|---------|------|
| 1 | 葉問 | 99998888 | ✅ 已訪談 |
| 2 | Lam Lok | 97684471 | ⏳ 待訪談 |
| 3 | Pretty | Dm_hito@dh.gov.hk | ⏳ 待訪談 |
| 4 | Shaun Wun | 55418888 | ⏳ 待訪談 |
| 5 | 凌兆楷 Wilfred | 66837316 | ⏳ 待訪談 |
| 6 | Venus | 64740051 | ⏳ 待訪談 |

## 🔄 數據庫結構更新

### 新增字段

```sql
CREATE TABLE patients (
  -- 基本資訊
  id SERIAL PRIMARY KEY,
  case_number VARCHAR(50),           -- 案例編號（如：20251010-001）
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),                 -- 可選
  phone VARCHAR(50) NOT NULL,
  age INTEGER,
  gender VARCHAR(20),
  occupation VARCHAR(100),
  
  -- 事件資訊
  event_location VARCHAR(255),        -- 用餐地點
  event_date DATE,                    -- 用餐日期
  event_summary TEXT,                 -- 事件總結
  
  -- 症狀資訊
  symptoms JSONB,                     -- 症狀詳情（JSON格式）
  onset_datetime TIMESTAMP,           -- 病發時間
  
  -- 其他資訊
  food_history TEXT,                  -- 食物歷史
  notes TEXT,                         -- 備註
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 移除的字段
- `id_card`（身份證）- 改用 `case_number`
- `address`（地址）- 不需要
- `medical_history`（病史）- 改用 `symptoms` 和 `notes`

## 📊 用戶屬性映射更新

根據 GPTBots 配置，字段映射如下：

| GPTBots 屬性 | 數據庫字段 | 示例值 |
|-------------|-----------|--------|
| `age` | `age` | `34` |
| `case_id` | `case_number` | `20251010-001` |
| `detail` | `event_summary` | `The Seafood House 10月8日晚宴` |
| `mobile` | `phone` | `99998888` |
| `patient_name` | `name` | `葉問` |

### detail 字段說明
- **格式**：`{地點} {日期} {活動類型}`
- **示例**：
  - `The Seafood House 10月8日晚宴`
  - `香格里拉酒店9月2日婚宴晚宴`
  - `半島酒店12月25日聖誕派對`

## 🔐 登入邏輯更新

### 之前
- 必須提供：電郵 + 電話
- 兩者都匹配才能登入

### 現在
- 必須提供：電話號碼
- 可選提供：電郵
- 只需電話匹配即可登入

### 原因
根據 `case_progress.md`，部分人員只提供電話（如：Lam Lok, Shaun Wun）或只提供電郵（如：Pretty）。

## 📱 電話號碼格式

### 數據庫存儲
- 不帶國際區號：`99998888`
- 不帶加號：`97684471`

### 顯示格式
- Pretty 沒有電話，填 `"1"`
- 其他人直接使用8位數字

## 🧪 測試數據

### 案例 1：葉問（已完成訪談）
```
電話：99998888
電郵：yip.man@example.com
年齡：34
性別：男
職業：Finance
案例編號：20251010-001
事件總結：The Seafood House 10月8日晚宴

症狀：
- 肚痛 ✓
- 作嘔 ✓
- 嘔吐 x2
- 肚痾 x10
- 發燒 39°C
- 全身無力 ✓
- 暈眩 ✓

病發時間：2025-10-10 05:00

食物歷史：
9/10 晚餐：在家用餐；午餐：大快活
8/10 晚餐：疑似問題餐
7/10 忘記

進食食物：
鮑魚、青口、carbonara、Ham pizza、Octopus Resotto、
Green pepper、烤豬柳、日本生蠔、西班牙生蠔、
愛爾蘭生蠔、美國生蠔、蔬菜PIZZA、羊架、酒
```

### 案例 2-6：待訪談
```
2. Lam Lok - 97684471
3. Pretty - Dm_hito@dh.gov.hk (電話：1)
4. Shaun Wun - 55418888
5. 凌兆楷 Wilfred - 66837316
6. Venus - 64740051
```

## 🔍 本地測試

### 測試葉問（已訪談）
```
http://localhost:3000

電話：99998888
電郵：yip.man@example.com（可不填）
```

### 測試 Lam Lok（待訪談）
```
電話：97684471
電郵：（留空）
```

### 測試 Pretty（只有電郵）
```
電話：1
電郵：Dm_hito@dh.gov.hk
```

## 📤 傳遞給 iframe 的數據

```javascript
{
  age: "34",
  case_id: "20251010-001",
  detail: "The Seafood House 10月8日晚宴",
  mobile: "99998888",
  patient_name: "葉問"
}
```

## 💡 Agent 問卷流程

根據 `case_progress.md` 第91行備註：

> 問卷最後需要問受訪者是否有其他人共同進餐以及留下衛生防護中心的電話。

Agent 應該：
1. 收集患者個人資訊
2. 詢問症狀詳情
3. 了解食物歷史
4. **詢問是否有其他人共同進餐**
5. **提供衛生防護中心聯繫電話**

## 📝 數據採集重點

### 1. 個人資料
- 姓名、電話、性別、年齡、職業

### 2. 症狀
- 肚痛、作嘔、嘔吐（次數）
- 肚痾（次數/質地）
- 發燒（最高度數）
- 手腳麻痺、冷熱倒錯
- 全身無力、暈眩、心跳急速
- 其他症狀
- 病發時間、康復時間

### 3. 治療
- 就醫方式（Nil/Self/GP/A&E/Hosp/OPD）
- 是否收集糞便樣本
- 是否同意食環署聯絡

### 4. 食物列表
- 詳細記錄進食的所有食物
- 特別注意生食（如生蠔）

### 5. 食物歷史
- 病發前3天的飲食記錄
- 早餐、午餐、晚餐

## 🔄 更新的文件清單

- ✅ `sql/init.sql` - 數據庫結構和真實數據
- ✅ `lib/db-mock.ts` - 本地模擬數據
- ✅ `pages/patient.tsx` - 字段映射和 user_id
- ✅ `pages/index.tsx` - 登入界面（電郵可選）
- ✅ `pages/api/verify.ts` - 驗證邏輯
- ✅ `pages/api/patient.ts` - 患者信息 API
- ✅ `CASE_DATA_UPDATE.md` - 本文檔

## 📚 相關文檔

- [case_progress.md](./case_progress.md) - 原始案例資料
- [USER_PROPERTY_MAPPING.md](./USER_PROPERTY_MAPPING.md) - 字段映射說明
- [USER_PROPERTIES.md](./USER_PROPERTIES.md) - 用戶屬性詳細文檔

---

**更新日期**：2025-10-10  
**案例來源**：衛生防護中心真實食物中毒案例  
**案例編號**：20251010  
**涉及人數**：6人  
**已訪談**：1人（葉問）  
**待訪談**：5人

