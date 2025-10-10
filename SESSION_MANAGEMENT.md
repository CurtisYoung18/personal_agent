# 會話管理和用戶屬性傳遞說明

## 🎯 實現方案

本系統使用 **localStorage + URL 參數** 的方式，實現用戶會話記憶和屬性傳遞。

## 📋 功能特性

### 1. 自動記住用戶登入
- ✅ 用戶登入後，會話保存到 `localStorage`
- ✅ 刷新頁面或重新打開瀏覽器，自動登入
- ✅ 直到用戶主動登出或清除瀏覽器數據

### 2. 用戶屬性傳遞到 iframe
- ✅ 通過 **iframe URL 參數** 傳遞所有用戶屬性
- ✅ GPTBots Agent 可以直接讀取這些參數
- ✅ 不需要調用額外的 API

### 3. 登出功能
- ✅ iframe 頂部顯示用戶信息和登出按鈕
- ✅ 點擊登出清除會話，返回登入頁面

## 🔄 完整流程

```
1. 用戶輸入電話登入
   ↓
2. 驗證成功，保存到 localStorage
   {
     id: "1",
     loginTime: "2025-10-10T10:30:00.000Z"
   }
   ↓
3. 跳轉到 /patient?id=1
   ↓
4. 獲取患者完整信息
   ↓
5. 構建帶參數的 iframe URL
   https://www.gptbots.ai/widget/xxx/chat.html?
     user_id=20251010-001&
     age=34&
     case_id=20251010-001&
     detail=The%20Seafood%20House%2010%E6%9C%888%E6%97%A5%E6%99%9A%E5%AE%B4&
     mobile=99998888&
     patient_name=%E8%91%89%E5%95%8F
   ↓
6. Agent 在 iframe 中可以訪問這些參數
   ↓
7. 用戶關閉頁面再打開
   ↓
8. localStorage 檢測到會話
   ↓
9. 自動跳轉到 /patient?id=1
```

## 📤 傳遞的用戶屬性

### URL 參數格式

```
https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html?
  user_id=20251010-001&
  age=34&
  case_id=20251010-001&
  detail=The%20Seafood%20House%2010月8日晚宴&
  mobile=99998888&
  patient_name=葉問
```

### 參數說明

| 參數名 | 值 | 說明 |
|--------|---|------|
| `user_id` | `20251010-001` | 案例編號（唯一標識） |
| `age` | `34` | 年齡 |
| `case_id` | `20251010-001` | 案例編號（與 user_id 相同） |
| `detail` | `The Seafood House 10月8日晚宴` | 事件總結 |
| `mobile` | `99998888` | 電話號碼 |
| `patient_name` | `葉問` | 患者姓名 |

## 💾 localStorage 數據結構

### 存儲的會話數據

```javascript
{
  "id": "1",                              // 患者 ID
  "loginTime": "2025-10-10T10:30:00.000Z" // 登入時間
}
```

### 存儲位置

```
localStorage.getItem('hp_patient_session')
```

## 🔍 如何在 Agent 中使用這些屬性

### 方式一：在 iframe 內部讀取 URL 參數

如果您的 Agent 可以訪問 iframe 的 URL，可以這樣讀取：

```javascript
// 在 iframe 內部
const urlParams = new URLSearchParams(window.location.search)
const userId = urlParams.get('user_id')        // "20251010-001"
const age = urlParams.get('age')               // "34"
const caseId = urlParams.get('case_id')        // "20251010-001"
const detail = urlParams.get('detail')         // "The Seafood House 10月8日晚宴"
const mobile = urlParams.get('mobile')         // "99998888"
const patientName = urlParams.get('patient_name') // "葉問"
```

### 方式二：GPTBots 自動識別

GPTBots 會自動識別 URL 中的 `user_id` 參數，並將其他參數關聯到該用戶。

## 🖥️ UI 界面

### 登入頁面
- 電話號碼輸入框（必填）
- 電郵地址輸入框（可選）
- 登入按鈕
- 自動檢測 localStorage，有會話則自動跳轉

### Patient 頁面（iframe 頁面）
```
┌────────────────────────────────────────────────┐
│ 葉問  [20251010-001]  The Seafood House...  [登出] │
├────────────────────────────────────────────────┤
│                                                │
│                                                │
│              GPTBots iframe                    │
│         （顯示 Agent 對話界面）                  │
│                                                │
│                                                │
└────────────────────────────────────────────────┘
```

### 頂部狀態欄包含：
- 患者姓名
- 案例編號
- 事件總結
- 登出按鈕

## 🧪 測試方法

### 1. 測試自動登入

```bash
# 步驟：
1. 訪問 http://localhost:3000
2. 使用電話 99998888 登入
3. 成功進入 iframe 頁面
4. 關閉瀏覽器標籤
5. 重新打開 http://localhost:3000
6. 應該自動跳轉到 iframe 頁面（無需再次登入）
```

### 2. 檢查傳遞的參數

打開瀏覽器開發者工具（F12），在 Console 中查看：

```javascript
// 應該看到兩條日誌：
📤 傳遞給 iframe 的 URL: https://www.gptbots.ai/widget/...?user_id=...

📋 用戶屬性: {
  user_id: "20251010-001",
  age: "34",
  case_id: "20251010-001",
  detail: "The Seafood House 10月8日晚宴",
  mobile: "99998888",
  patient_name: "葉問"
}
```

### 3. 檢查 iframe src

在 Elements 標籤頁中找到 `<iframe>` 元素，查看 `src` 屬性：

```html
<iframe src="https://www.gptbots.ai/widget/eek1z5tclbpvaoak5609epw/chat.html?user_id=20251010-001&age=34&case_id=20251010-001&detail=The%20Seafood%20House%2010%E6%9C%888%E6%97%A5%E6%99%9A%E5%AE%B4&mobile=99998888&patient_name=%E8%91%89%E5%95%8F">
```

### 4. 測試登出

```bash
# 步驟：
1. 在 iframe 頁面點擊右上角「登出」按鈕
2. 確認對話框
3. 應該返回登入頁面
4. localStorage 中的 hp_patient_session 應該被清除
```

### 5. 檢查 localStorage

在 Console 中執行：

```javascript
// 查看存儲的會話
localStorage.getItem('hp_patient_session')
// 輸出：{"id":"1","loginTime":"2025-10-10T..."}

// 手動清除會話
localStorage.removeItem('hp_patient_session')
```

## ⚙️ 配置選項

### 修改會話持續時間

目前會話永久保存（直到用戶登出或清除瀏覽器數據）。

如果需要自動過期，可以在 `pages/patient.tsx` 的 `useEffect` 中添加：

```typescript
useEffect(() => {
  const rememberedPatient = localStorage.getItem('hp_patient_session')
  if (rememberedPatient) {
    try {
      const patientData = JSON.parse(rememberedPatient)
      
      // 檢查會話是否過期（例如：24小時）
      const loginTime = new Date(patientData.loginTime)
      const now = new Date()
      const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceLogin > 24) {
        // 會話過期，清除
        localStorage.removeItem('hp_patient_session')
        router.push('/')
        return
      }
      
      router.push(`/patient?id=${patientData.id}`)
    } catch (e) {
      localStorage.removeItem('hp_patient_session')
    }
  }
}, [])
```

## 🔒 安全考慮

### 當前實現
- ✅ localStorage 只在客戶端存儲
- ✅ 不包含敏感信息（只有患者 ID）
- ✅ 需要患者 ID 才能訪問數據
- ✅ 用戶可隨時登出清除會話

### 生產環境建議
1. **使用 HttpOnly Cookie**（更安全）
2. **添加 Session Token**（防止偽造）
3. **設置會話過期時間**（如 24 小時）
4. **記錄登入日誌**（審計追蹤）

## 📱 跨設備行為

### 同一瀏覽器
- ✅ 不同標籤頁共享會話
- ✅ 關閉重開瀏覽器，會話依然存在

### 不同瀏覽器
- ❌ Chrome 和 Safari 的會話不共享
- ❌ 需要分別登入

### 無痕模式
- ❌ 關閉無痕窗口，會話會被清除
- 每次需要重新登入

## 🎯 優勢

### 相比 API 方式
1. ✅ **更簡單** - 不需要配置 GPTBots API Key
2. ✅ **更直接** - 參數直接在 URL 中，Agent 可立即訪問
3. ✅ **更透明** - 可以在 Console 中直接看到傳遞的數據
4. ✅ **更靈活** - 可以傳遞任意參數

### 相比 postMessage 方式
1. ✅ **更可靠** - URL 參數在 iframe 加載時就存在
2. ✅ **無時序問題** - 不依賴 iframe 加載完成
3. ✅ **更簡單** - 不需要複雜的消息監聽

## 📝 常見問題

### Q: URL 參數有長度限制嗎？
**A**: 大多數瀏覽器支持 2000+ 字符的 URL。我們的參數很短，完全沒問題。

### Q: URL 中的中文會有問題嗎？
**A**: 不會。`encodeURIComponent()` 會自動編碼中文字符。

### Q: 刷新頁面會重新登入嗎？
**A**: 不會。localStorage 會記住會話，自動跳轉到 iframe 頁面。

### Q: 如何清除所有用戶的會話？
**A**: 用戶需要手動點擊「登出」按鈕，或清除瀏覽器數據。

### Q: 參數會在 iframe 中顯示嗎？
**A**: URL 參數在 iframe 的地址欄中不可見（被父頁面隱藏）。

## 🔄 更新日誌

**2025-10-10**
- ✅ 實現 localStorage 會話管理
- ✅ 添加自動登入功能
- ✅ 通過 URL 參數傳遞所有用戶屬性
- ✅ 添加頂部狀態欄和登出按鈕
- ✅ Console 輸出傳遞的參數（便於調試）

---

**相關文檔**：
- [USER_PROPERTY_MAPPING.md](./USER_PROPERTY_MAPPING.md) - 字段映射說明
- [CASE_DATA_UPDATE.md](./CASE_DATA_UPDATE.md) - 真實案例數據
- [補充資料.md](./補充資料.md) - GPTBots API 文檔

