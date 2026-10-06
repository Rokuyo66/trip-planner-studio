# Trip Planner Studio

一個給 Claude 用的 Skill：說出目的地，Claude 查好景點、餐廳、住宿、交通與一日團，做出一個**會自己重算的旅遊規劃網頁**，再幫你開好照片資料夾。

![葡萄牙範例](docs/preview.png)

## 這個網頁能做什麼

- **每天的路線自動串接**：步行、地鐵、火車、自駕、計程車依距離自動選，每段都有時間與費用。點路段可以換交通方式。
- **改什麼都即時重算**：出發日、回程日、天數、人數、房型、交通方案（大眾／混合／自駕）、住宿策略、旅遊傾向。
- **拖移景點**：按住 ⠿ 拖曳排序；「移到…」把景點換到別天；觀光／用餐標籤點一下就能互換。
- **天數自由調整**：刪掉某天、加自由日、加一日團，回程機場跟著最後一晚的城市變。
- **機票查價與價格紀錄**：一鍵帶日期與人數開 Google Flights／Skyscanner／Kayak；每次查到的價格記一筆，畫出走勢、標最低價、設定目標價，最新一筆自動帶進預算。
- **住宿三選一＋自訂**：照實際房型判斷人數住不住得下，自訂住宿可以上傳照片比較。
- **一日團**：可以取代某天或另外加一天，附參考來源。
- **地圖**：當天路線高亮，點地點看細節。
- **照片牆**：3D 捲動的照片、跟著日期換的封面背景、亮色／暗色主題。
- **出發準備**：倒數待辦、申辦清單、現金估算，還能輸出 A4 旅遊小冊子列印。
- **存檔**：下載成 JSON，換電腦或留版本都可以。

## 怎麼用

### 用在 Claude Code／Claude（推薦）

1. 把 `skill/trip-planner-studio/` 整個資料夾放進你的 skills 目錄，例如 `~/.claude/skills/trip-planner-studio/`。
2. 對 Claude 說：「用 trip-planner-studio 幫我規劃 2027 年 4 月京都 7 天，兩個人」。
3. Claude 會查資料、產生 `trip.html`、建好照片資料夾。
4. 用 Chrome 或 Edge 打開 `trip.html`，在「選單 → 存檔 → 選擇照片資料夾」選照片資料夾。
5. 之後補了照片，按右上角「重整照片」就好。

### 直接看範例

`skill/trip-planner-studio/template/trip.html` 本身就是一份完整的葡萄牙 11 天行程（里斯本、辛特拉、孔布拉、波多、杜羅河谷），直接用瀏覽器打開就能玩。範例不含照片，可以用 `scripts/make_photo_folders.mjs` 開資料夾自己放。

## 檔案

```
skill/trip-planner-studio/
├── SKILL.md                     # 給 Claude 的流程說明
├── template/trip.html           # 引擎＋葡萄牙範例資料（單一檔案）
├── reference/
│   ├── data-format.md           # 資料格式（含幣別與短程航線設定）
│   └── example-kyoto.js         # 京都 7 天範例資料（日圓、短程直飛）
└── scripts/
    ├── check_data.mjs           # 檢查資料參照、公休日衝突、重複餐廳、休閒節奏
    ├── render_check.py          # 無頭瀏覽器逐天列出時間軸、抓頁面錯誤（需 Playwright）
    ├── make_photo_folders.mjs   # 依行程建立照片資料夾
    ├── make_map_geo.py          # 產生地圖國界
    └── build_photos.py          # 要發佈到網路時，把照片轉成縮圖並寫進頁面
```

需要：Node.js 18+（腳本）、Python 3（地圖與照片腳本，`build_photos.py` 另需 `pip install pillow`；`render_check.py` 另需 Playwright，選用）。

任何幣別都可以用：日圓、韓圜、歐元…，短程航線（當天到、當天回）也支援，設定方式見 `reference/data-format.md`。

## 注意

- 範例裡的票價、營業時間、房價是 2026 年查的估計值，實際以官網為準。
- 照片請使用你有權使用的圖片，不要把別人的照片公開發佈。
- 地圖國界資料來自 [world-atlas](https://github.com/topojson/world-atlas)（Natural Earth，公有領域）。

## 授權

MIT
