# 行程資料格式（TRIP DATA 區塊）

`template/trip.html` 分成兩部分：

- `/* ===== TRIP DATA START … */` 到 `/* ===== TRIP DATA END ===== */` 之間是**資料**。換目的地只改這裡。
- 之後全部是**引擎**（路線、時間軸、費用、地圖、照片、拖移、存檔……），不要改。

範本裡的資料是「葡萄牙 11 天」的完整範例，寫新目的地時照著它的形狀改。改完執行 `node scripts/check_data.mjs trip.html` 檢查。

ID 規則：全部小寫英數與底線，建議用「城市代碼_名稱」，例如 `kyo_fushimi`。城市代碼用 2～4 個大寫字母（`KYO`、`OSA`），在所有表格裡一致。

## 基本設定

| 常數 | 說明 |
|---|---|
| `TRIP_META` | `title` 標題、`eyebrow` 小標（航線）、`sub` 副標、`currency`、`local`（當地幣別符號）、`key`／`ckey`（瀏覽器暫存用的唯一名稱，每趟旅行不同）、`home`（出發城市中文名）、`extras`（每人行前雜支：`eur` 當地幣、`twd` 台幣、`carTwd` 租車才有的雜支、`note`／`carNote` 說明文字） |
| `FLIGHTS` | `out`／`back`：`day` 第幾天、`from`／`to` 機場三碼、`label`。查價連結用這裡組 |
| `DEFAULTS` | 頁面初始值：`start` 出發日、`mode`（`transit`／`hybrid`／`car`）、`strat` 住宿策略、`fx` 匯率、`flight` 每人機票台幣、`meal` 每日餐費、`pax`、`room`、`stays`（每城市 `{sel, price:[各選項雙人房價], custom:{…}}`）、`params`（租車、油價、停車：`park` + 城市代碼）、`must`（必去清單範例，可留空陣列） |
| `PARAM_LABELS` | `params` 在預算頁的標籤與步進值 |
| `MODE_DESC` | 三種交通方案的說明文字 |
| `CAR_DAYS` | 預設哪幾天有租車（引擎會依 `CAR_FROM` 重算，這裡只是初值） |

## 地點

`PLACES`：所有會出現在路線上的點。

```js
kyo_fushimi:{n:'伏見稻荷大社',a:'京都市伏見区深草藪之内町68',lat:34.9671,lng:135.7727,city:'KYO',poi:true,closed:[1]}
```

- `poi:true`：景點或餐廳，會出現在時間軸、可以拖移和跳過。車站、機場、加油站不加 `poi`。
- `closed`：休館的星期（0＝週日）。
- 其他選用欄位：`url`／`urlLabel`、`memo`（顯示在資訊卡）、`svc:true`（服務點，例如寄物）、`fuel:true`（還車前加油點）、`nopark:true`。
- 機場與車站名稱以「機場」「車站」「站」結尾（可加三碼），照片資料夾與時間軸會自動當成交通站。

`VISIT`：每個 `poi` 的停留方式 `[分鐘, 類型, 固定開始時間?, 說明?]`。

- 類型：`visit` 觀光、`meal` 用餐、`snack` 點心（不算正餐）、`show` 表演、`visitLunch`（逛的時候順便吃午餐）。
- 固定開始時間，例如 `'19:00'`：在 16:00 以後的用餐會被當成晚餐，必去餐廳會自動排到當天最後。

`POI_PRICE`：門票價格（窮遊／CP 值傾向會用來判斷）。`FAME`：知名度 1～3。
`TIX_OF`：門票名稱 → 地點 ID，跳過景點時一起扣掉門票。

## 每一天

`DAYS`：陣列，第 1 天是出發、倒數第 2 天是回程、最後一天是抵家。

```js
{start:'09:15',t:'標題（字串或 c=>字串）',note:'說明（字串或 c=>字串）',
 segs:c=>[ …路段… ], car:c=>[ …租車日的路段… ] /* 選用 */, tix:c=>[[名稱,價格,類別或null,付款方式]], meal:false /* 選用：不算餐費 */}
```

`c` 是當天的住宿：`c.S` 前一晚住宿的 ID、`c.E` 當晚住宿的 ID（都是 `STAY_城市代碼`），另有 `c.sb`／`c.eb` 城市代碼。依住宿策略不同，同一天可以寫成不同路線，例如 `c.eb==='SIN'?…:…`。

路段 `c` 類型：

| 類型 | 用途 | 欄位 |
|---|---|---|
| `city` | 市區移動，引擎依距離選步行或大眾運輸；超過 40 km 自動改城際火車或自駕估價 | `f`、`to`、`hint` |
| `drive` | 自駕 | `toll` 過路費 |
| `fixed` | 固定班次（火車、巴士、纜車、步道） | `label`、`fare`、`mins`、`tm`（`transit`／`walking`）、`walk:true`、`pay` |
| `airport` | 機場進出（用 `AIRPORT` 的票價） | |
| `flight` | 航班 | `label`、`fl:'out'`或`'back'` |

`tix` 類別：`null` 門票、`'transport'` 交通卡、`'bag'` 寄物（租車日自動免）。付款：`online`、`card`、`cash`、`either`（對照 `PAY`）。

## 天數與自由調整

| 常數 | 說明 |
|---|---|
| `DEF_PLAN` | 中段預設行程日，`'t2'`＝`DAYS` 第 2 天 |
| `DROP_ORDER` | 使用者縮短天數時的刪除順序（最不重要的放前面） |
| `FREE_CITIES` | 可以加「自由日」的城市（要有 `STAYS`） |
| `CAR_FROM` | 混合方案從原本第幾天開始租車 |
| `RET_AIR` | 可以回程的機場 `{城市:{id:機場PLACE,code:三碼}}`，第一個要等於 `FLIGHTS.back` 的城市 |
| `AIR_OF` | 最後一晚住哪個城市 → 從哪個 `RET_AIR` 回 |

## 住宿

`STAYS`：每個城市 `{label, en, opts:[…]}`。每個選項：

```js
{tag:'主選',n:'飯店名',a:'地址',lat:..,lng:..,rating:'Booking 8.8',range:'約 €80–110',p0:95,tel:'',mail:'',why:'選它的理由',
 rooms:[{t:'雙人房',cap:2,f:1},{t:'家庭房',cap:4,f:1.7}]}
```

`rooms.f` 是相對雙人房價的倍數，人數變動時用來判斷要訂哪些房型、房間夠不夠住。建議每個城市三個選項：主選、備案 A、省錢備案 B，可再加一間高檔選項。

`STRATS`：住宿策略，`nights` 長度要等於 `DAYS`，第 i 格是第 i+1 天晚上住哪個城市（出發日、回程日、抵家日填 `null`）。
`STAY_ORDER`：城市排列順序。`CITY_TAX`：住宿稅 `{v:每人每晚, max:最多晚數}`。

## 候選點與一日團

`CANDS`：每天下方的「可加入」選單。

```js
{id:'kyo_kiyomizu',n:'清水寺',a:'…',lat:..,lng:..,city:'KYO',day:3,fame:3,price:5,pay:'cash',dw:60,kind:'visit'}
```

`TOURS`：一日團。`for:'t3'` 表示可以取代原本第 3 天；`add:'POR'` 表示可以另外加一天，住在那個城市。

```js
tour_x:{for:'t3',city:'LIS',n:'一日團：…',meet:'集合點',lat:..,lng:..,start:'08:00',dur:510,price:80,lunch:false,ph:'借用照片的地點ID',
  incl:'包含什麼',rating:'評分（評論數）',src:'參考來源網址',why:'推薦理由'}
```

一定要附 `src`，價格寫來源頁的成人價。

## 交通、地圖、其他

| 常數 | 說明 |
|---|---|
| `FARE` | 各城市單程市區交通票價 |
| `CAP` | 各城市 24 小時票上限（當天市區交通超過就封頂） |
| `AIRPORT` | `{城市:{fare,mins,label}}` 機場到市區的大眾運輸 |
| `HUBS` | 轉機機場選項 `{代碼:{id,n}}` |
| `MAP_GEO`／`MAP_BOUNDS` | 用 `scripts/make_map_geo.py` 產生 |
| `CITY_LABELS` | 地圖上的城市標籤 `{n,city,lat,lng}`，順序也決定照片資料夾編號 |
| `CITY_ZH`、`CITY_HUE`、`COVER_OF` | 城市中文名、沒照片時的底色色相、城市封面照的 key（`cover_01`…，編號要和 `CITY_LABELS` 順序一致） |
| `PHOTO_ALIAS` | 資料夾名稱沒寫 `[id]` 時的對照表 |
| `PHOTOS` | 照片清單；留 `{}`，由頁面照片資料夾或 `build_photos.py` 填 |
| `PAY`、`CASH`、`CASH_TIPS` | 付款方式名稱、現金估算參數、付款小提醒 |
| `MEAL` | 午餐、晚餐的時間與餐費分配 |
| `STYLES` | 旅遊傾向說明（窮遊、最大 CP 值、休閒、自訂） |
| `TIMELINE` | 出發前倒數待辦 `(add,day,car)=>[[日期,文字],…]` |
| `CHECK` | 申辦與準備清單、緊急聯絡（含當地代表處與使用者需要的大使館） |
| `BOOKLET_PLACES` | 列印小冊子「重要地點」要列出的 ID |
