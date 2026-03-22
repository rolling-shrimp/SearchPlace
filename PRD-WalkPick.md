# PRD：散步地點隨機抽籤系統（WalkPick）

## Context
使用者希望建立一個 RWD 網頁應用，解決「選擇障礙」問題——可以管理自己去過或想去的地點，並透過隨機骰子功能抽出今天要去散步的地方。整合 Google Maps API，提供視覺化地圖體驗。目標三月底上線 MVP。

---

## 1. 產品概覽

| 項目 | 內容 |
|------|------|
| **產品名稱** | WalkPick |
| **目標用戶** | 個人使用者，有選擇困難、喜歡散步探索 |
| **平台** | RWD 網頁（桌機 + 手機） |
| **技術棧** | Next.js 15 + Supabase + Google Maps API + Tailwind CSS |
| **部署平台** | Vercel（免費方案） |
| **目標上線日** | 2026-03-31（MVP） |

---

## 2. 系統架構

```mermaid
graph TB
    subgraph Client["前端 (Next.js + Tailwind)"]
        UI[RWD 網頁介面]
        MapView[Google Maps 地圖組件]
        DiceUI[骰子抽籤 UI]
    end

    subgraph Backend["後端 (Next.js API Routes)"]
        PlaceAPI["/api/places"]
        RecordAPI["/api/records"]
        WeatherAPI["/api/weather-proxy"]
    end

    subgraph DB["資料庫 (Supabase / PostgreSQL)"]
        PlacesTable[(places)]
        RecordsTable[(walk_records)]
        UserTable[(users)]
    end

    subgraph External["外部 API"]
        GMaps[Google Maps JavaScript API]
        GPlaces[Google Places API]
        GGeo[Google Geocoding API]
        GDir[Google Directions API]
        OWM[OpenWeatherMap API]
    end

    UI --> PlaceAPI
    UI --> RecordAPI
    MapView --> GMaps
    MapView --> GDir
    UI --> GPlaces
    PlaceAPI --> DB
    RecordAPI --> DB
    WeatherAPI --> OWM
    UI --> WeatherAPI
```

---

## 3. 使用者流程

```mermaid
flowchart TD
    Start([使用者開啟網頁]) --> Home[首頁：地圖 + 地點列表]
    Home --> Add[點擊「新增地點」]
    Home --> Dice[點擊「今天去哪？」骰子按鈕]
    Home --> History[查看散步紀錄]

    Add --> SearchPlace[輸入地點名稱\nGoogle Places 自動補全]
    SearchPlace --> SetTag[設定分類標籤\n公園/商圈/咖啡廳/其他]
    SetTag --> SavePlace[儲存地點]
    SavePlace --> Home

    Dice --> FilterModal[篩選條件彈窗\n分類 / 距離範圍]
    FilterModal --> CheckWeather{天氣是否\n適合戶外？}
    CheckWeather -- 晴天 --> RandomPick[隨機抽出地點]
    CheckWeather -- 雨天 --> FilterOutdoor[自動過濾戶外地點\n再抽籤]
    FilterOutdoor --> RandomPick
    RandomPick --> ResultCard[顯示結果卡片\n地點名稱 + 地圖 + 導航]
    ResultCard --> GoWalk{確定前往？}
    GoWalk -- 是 --> OpenNav[開啟 Google Maps 導航]
    GoWalk -- 換一個 --> RandomPick
    OpenNav --> AfterWalk[返回後記錄此次散步]
    AfterWalk --> LogRecord[填寫心情 / 評分 / 照片]
    LogRecord --> Home

    History --> ViewMap[地圖上顯示散步足跡]
    History --> Stats[統計：最常去 / 距離累計]
```

---

## 4. 資料模型

```mermaid
erDiagram
    PLACES {
        uuid id PK
        string name
        string address
        float lat
        float lng
        string category
        int weight_score
        boolean is_outdoor
        boolean is_visited_today
        timestamp created_at
        timestamp updated_at
    }

    WALK_RECORDS {
        uuid id PK
        uuid place_id FK
        date walked_at
        int mood_score
        int rating
        string notes
        string photo_url
        timestamp created_at
    }

    PLACES ||--o{ WALK_RECORDS : "has many"
```

---

## 5. Google Maps API 整合計畫

```mermaid
sequenceDiagram
    participant User as 使用者
    participant App as WalkPick 前端
    participant GMaps as Google Maps JS API
    participant GPlaces as Places API
    participant GGeo as Geocoding API
    participant GDir as Directions API

    User->>App: 輸入地點關鍵字
    App->>GPlaces: Autocomplete 請求
    GPlaces-->>App: 回傳地點建議清單
    User->>App: 選擇地點
    App->>GGeo: 取得經緯度
    GGeo-->>App: 回傳座標
    App->>GMaps: 在地圖上放置 Marker
    GMaps-->>User: 顯示地圖標記

    User->>App: 點擊「前往」
    App->>GDir: 請求從目前位置到目的地的路線
    GDir-->>App: 回傳路線資料
    App-->>User: 顯示路線 / 導航連結
```

---

## 6. 功能清單（MVP vs 進階）

### MVP（三月底上線）

| 優先級 | 功能 | 說明 |
|--------|------|------|
| P0 | 地點 CRUD | 新增、編輯、刪除地點，含分類標籤 |
| P0 | Google Maps 顯示 | 所有地點顯示在地圖上，可點擊 |
| P0 | Places Autocomplete | 輸入地點名稱自動補全 |
| P0 | 骰子隨機抽籤 | 可按分類篩選後隨機抽出 |
| P1 | 今日已去標記 | 避免當天重複抽到同一地點 |
| P1 | RWD 手機介面 | 手機操作體驗優化 |

### 進階功能（上線後迭代）

| 功能 | 說明 |
|------|------|
| 散步紀錄 | 每次散步的日期、心情評分、照片 |
| 距離篩選 | 根據 GPS 位置只抽「N km 內」地點 |
| 天氣整合 | 串接 OpenWeatherMap，雨天自動過濾戶外地點 |
| 加權骰子 | 高評分地點有更高機率被抽到 |
| 足跡地圖 | 在地圖上顯示歷史散步路線 |
| 統計頁面 | 最常去地點、總散步次數、累計距離 |
| 分享功能 | 產生分享連結讓朋友使用同一清單 |

---

## 7. 技術架構決策

```mermaid
graph LR
    subgraph 選擇原因
        A[Next.js 15] -->|App Router + Server Components| B[SEO + 效能]
        C[Supabase] -->|免費 PostgreSQL + Auth + Storage| D[快速開發]
        E[Tailwind CSS] -->|RWD utility-first| F[手機優先設計]
        G[Vercel] -->|一鍵部署 + 免費方案| H[零維運成本]
    end
```

---

## 8. 里程碑與時程

```mermaid
gantt
    title WalkPick 開發時程（2026-03）
    dateFormat  YYYY-MM-DD
    section 環境建立
    Next.js + Supabase 初始化     :done, setup, 2026-03-22, 1d
    資料庫 Schema 設計             :done, db, after setup, 1d
    section MVP 開發
    地點 CRUD + Supabase 串接      :active, crud, after db, 2d
    Google Maps 整合               :maps, after crud, 2d
    骰子隨機功能                   :dice, after maps, 1d
    section 優化與部署
    RWD UI 優化 (Tailwind)         :ui, after dice, 2d
    Vercel 部署 + 測試              :deploy, after ui, 1d
    section 上線
    MVP 上線                       :milestone, 2026-03-31, 0d
```

---

## 9. 檔案結構（Next.js App Router）

```
walkpick/
├── app/
│   ├── page.tsx                  # 首頁（地圖 + 地點列表）
│   ├── places/
│   │   ├── page.tsx              # 地點管理頁
│   │   └── [id]/page.tsx         # 地點詳情
│   ├── records/page.tsx          # 散步紀錄頁
│   └── api/
│       ├── places/route.ts       # 地點 CRUD API
│       ├── records/route.ts      # 紀錄 API
│       └── weather/route.ts      # 天氣代理 API
├── components/
│   ├── MapView.tsx               # Google Maps 組件
│   ├── DiceButton.tsx            # 骰子抽籤按鈕
│   ├── PlaceCard.tsx             # 地點卡片
│   ├── PlaceForm.tsx             # 新增/編輯表單
│   └── FilterModal.tsx           # 篩選條件彈窗
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── google-maps.ts            # Google Maps 工具函式
└── types/
    └── index.ts                  # TypeScript 型別定義
```

---

## 10. 環境變數清單

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=   # Google Maps / Places / Geocoding / Directions
NEXT_PUBLIC_SUPABASE_URL=          # Supabase 專案 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase 公開 Key
OPENWEATHERMAP_API_KEY=            # OpenWeatherMap（進階功能）
```

---

## 11. 驗收測試清單

- [ ] 可新增地點（含 Google Places 自動補全）
- [ ] 地點顯示在 Google Maps 地圖上
- [ ] 骰子按鈕可隨機抽出地點
- [ ] 依分類篩選後骰子功能正常
- [ ] 點擊地點可開啟導航連結
- [ ] 今日已去標記功能正常
- [ ] RWD：手機版介面顯示正常
- [ ] Vercel 部署成功，可公開存取
