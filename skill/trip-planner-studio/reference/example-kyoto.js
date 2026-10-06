/* 範例：京都 2027 賞櫻 7 天（日圓、短程直飛、homeDay:false）。貼進 template/trip.html 的 TRIP DATA 區塊取代葡萄牙資料，再產生 MAP_GEO。 */
/* ===== TRIP DATA START：換目的地時只替換這一段（到 TRIP DATA END 為止）===== */
const TRIP_META={eyebrow:'TPE ⇄ KIX ・ 直飛約 2.5 小時',title:'京都 2027 賞櫻',sub:'京都 6 晚＋奈良一日，兩人慢遊 7 天。改日期、住宿、人數、交通或拖移景點，路線、時間與費用會即時重算。',currency:'JPY',local:'¥',k:100,curName:'日圓',key:'kyoto2027-plan-v1',ckey:'kyoto2027-check-v1',home:'台北',homeDay:false,modeLabels:{transit:'大眾交通（推薦）',hybrid:'混合（後段自駕）',car:'全程自駕'},fare0:230,
  taxi:{min:600,base:130,km:390,label:'計程車／GO／Uber（估；京都 0.95 km ¥500，每 255 m ¥100）'},
  rail:{base:200,km:17,km2:20,label:'JR／私鐵（依距離估價，以車站票價為準）',label2:'JR／私鐵／巴士（估）'},
  extras:{eur:0,twd:1100,carTwd:100,note:'旅平險約 NT$800、eSIM 約 NT$300（日本出國稅 ¥1,000 已含在機票）',carNote:'駕照日文譯本 NT$100'}};
const FLIGHTS={out:{day:1,from:'TPE',to:'KIX',label:'去程 台北 → 大阪關西'},back:{day:7,from:'KIX',to:'TPE',label:'回程 大阪關西 → 台北'}};
const CITY_TAX={KYO:{v:400,max:99},NAR:{v:0,max:0}};
const PAY={online:'線上預付',card:'可刷卡／感應',cash:'現金',either:'刷卡或現金（備現金）',ic:'ICOCA／交通 IC 卡'};
const CASH={perDay:1500,tips:0,reserve:5000,taxInCash:true};
const CASH_TIPS=['京都市區巴士、地鐵、JR、近鐵都能刷 ICOCA；也可以直接用感應信用卡搭地鐵與部分巴士，但 IC 卡最不容易出錯。','寺社的拜觀料、御守、老街小店、市場攤位常只收現金；奧丹、先斗町ますだ、祇をん萬屋都是現金付款。','京都住宿稅 2026/3 起分五級：每人每晚房價 ¥6,000–19,999 收 ¥400、¥20,000–49,999 收 ¥1,000，多在入住時另外收現金。','在日本不給小費。','超商（7-Eleven、Lawson）的 ATM 可用台灣金融卡或信用卡提領日圓；刷卡被問要不要用台幣結帳時選日圓（拒絕 DCC）。','在台灣先換 ¥30,000～50,000，留一些 ¥1,000 鈔與百圓硬幣給巴士和寺社。'];
const BOOKLET_PLACES=['kix','kyo_st','kyo_kintetsu','nar_kintetsu','teco_osa'];
const TIX_OF={'清水寺':'kyo_kiyomizu','銀閣寺':'kyo_ginkaku','天龍寺庭園':'kyo_tenryuji','東大寺大佛殿':'nar_todaiji','二條城（含二之丸御殿）':'kyo_nijo'};
const VISIT={
  kyo_kiyomizu:[120,'visit','','含沿二年坂、三年坂下坡慢逛'],kyo_maruyama:[60,'visit','17:45','枝垂櫻傍晚點燈'],
  kyo_tetsugaku:[60,'visit','','南禪寺端走到銀閣寺端約 2 km'],kyo_ginkaku:[60,'visit'],
  kyo_bamboo:[45,'visit','','9 點前人還不多'],kyo_tenryuji:[90,'visit','','從竹林北門進庭園'],
  nar_todaiji:[75,'visit','','大佛殿；奈良公園的鹿沿路都是'],nar_kasuga:[60,'visit','','萬燈籠參道'],
  kyo_nijo:[90,'visit','','二條城櫻花祭期間；夜間點燈需另購票'],kyo_inari:[120,'visit','16:00','傍晚人少；千本鳥居走到四辻約 1 小時來回'],
  kyo_shirakawa:[40,'visit','18:30','白川沿岸夜櫻'],
  kyo_inoda:[60,'meal','','老派咖啡館，京の朝食 ¥1,830'],kyo_yorozuya:[60,'meal','17:30','晚餐，九條蔥烏龍麵；L.O. 18:40'],
  kyo_okutan:[75,'meal','','湯豆腐套餐 ¥3,000–4,000'],kyo_masuda:[90,'meal','19:30','晚餐，京都家常菜 obanzai'],
  kyo_omen:[60,'meal','','招牌沾麵烏龍'],kyo_kyogoku:[75,'meal','18:30','晚餐，昭和老食堂'],
  kyo_sagano:[75,'meal','','湯豆腐、湯葉套餐'],kyo_katsukura:[60,'meal','18:30','晚餐，豬排定食'],
  nar_shizuka:[60,'meal','','奈良釜飯'],kyo_okaru:[45,'meal','18:30','晚餐，咖哩烏龍麵'],nar_beer:[75,'meal','17:30','晚餐，精釀啤酒配披薩'],
  kyo_nishiki:[75,'meal','','邊逛邊吃當午餐'],kyo_ramen:[60,'meal','18:30','晚餐，十家拉麵店一次選']};
const MEAL={lunchAfter:'12:00',dinnerAfter:'18:30',lunchMin:60,dinnerMin:75,split:{breakfast:0.15,lunch:0.35,dinner:0.5}};
/* 候選景點：選單用，依旅遊傾向自動加入或手動加入；day＝屬於第幾天 */
const CANDS=[
 {id:'kyo_pontocho',n:'先斗町・鴨川夜散步',a:'京都市中京区先斗町',lat:35.0062,lng:135.7705,city:'KYO',day:1,fame:2,price:0,pay:null,dw:30,kind:'visit'},
 {id:'kyo_kodaiji',n:'高台寺（春季夜間點燈）',a:'京都市東山区高台寺下河原町526',lat:35.0006,lng:135.7811,city:'KYO',day:2,fame:2,price:600,pay:'cash',dw:50,kind:'visit'},
 {id:'kyo_yasaka',n:'八坂神社',a:'京都市東山区祇園町北側625',lat:35.0037,lng:135.7785,city:'KYO',day:2,fame:3,price:0,pay:null,dw:20,kind:'visit'},
 {id:'kyo_incline',n:'蹴上傾斜鐵道（櫻花隧道）',a:'京都市左京区南禅寺草川町',lat:35.0094,lng:135.7909,city:'KYO',day:3,fame:3,price:0,pay:null,dw:30,kind:'visit'},
 {id:'kyo_nanzenji',n:'南禪寺・水路閣',a:'京都市左京区南禅寺福地町86',lat:35.0112,lng:135.7932,city:'KYO',day:3,fame:2,price:0,pay:null,dw:40,kind:'visit'},
 {id:'kyo_heian',n:'平安神宮神苑（紅枝垂櫻）',a:'京都市左京区岡崎西天王町97',lat:35.0160,lng:135.7824,city:'KYO',day:3,fame:3,price:600,pay:'cash',dw:60,kind:'visit'},
 {id:'kyo_togetsu',n:'渡月橋・嵐山河岸',a:'京都市右京区嵯峨天龍寺芒ノ馬場町',lat:35.0129,lng:135.6777,city:'KYO',day:4,fame:3,price:0,pay:null,dw:40,kind:'visit'},
 {id:'kyo_nonomiya',n:'野宮神社',a:'京都市右京区嵯峨野々宮町1',lat:35.0179,lng:135.6744,city:'KYO',day:4,fame:2,price:0,pay:null,dw:15,kind:'visit'},
 {id:'kyo_jojakko',n:'常寂光寺',a:'京都市右京区嵯峨小倉山小倉町3',lat:35.0211,lng:135.6689,city:'KYO',day:4,fame:1,price:500,pay:'cash',dw:45,kind:'visit'},
 {id:'kyo_torokko',n:'嵯峨野觀光小火車（2027 春新車）',a:'京都市右京区嵯峨天龍寺車道町（トロッコ嵯峨駅）',lat:35.0175,lng:135.6795,city:'KYO',day:4,fame:2,price:880,pay:'online',dw:90,kind:'visit'},
 {id:'nar_kofukuji',n:'興福寺・五重塔外觀',a:'奈良市登大路町48',lat:34.6830,lng:135.8318,city:'NAR',day:5,fame:2,price:0,pay:null,dw:30,kind:'visit'},
 {id:'nar_naramachi',n:'奈良町老街',a:'奈良市中院町',lat:34.6780,lng:135.8290,city:'NAR',day:5,fame:2,price:0,pay:null,dw:45,kind:'visit'},
 {id:'nar_nakatani',n:'中谷堂 搗麻糬',a:'奈良市橋本町29',lat:34.6817,lng:135.8288,city:'NAR',day:5,fame:2,price:200,pay:'cash',dw:15,kind:'snack'},
 {id:'kyo_kinkaku',n:'金閣寺',a:'京都市北区金閣寺町1',lat:35.0394,lng:135.7292,city:'KYO',day:6,fame:3,price:500,pay:'cash',dw:50,kind:'visit'},
 {id:'kyo_daigo',n:'醍醐寺（春季三寶院＋伽藍）',a:'京都市伏見区醍醐東大路町22',lat:34.9509,lng:135.8195,city:'KYO',day:6,fame:3,price:1500,pay:'either',dw:120,kind:'visit'},
 {id:'kyo_toji',n:'東寺（五重塔與不二櫻）',a:'京都市南区九条町1',lat:34.9806,lng:135.7477,city:'KYO',day:7,fame:2,price:500,pay:'cash',dw:50,kind:'visit'}
];
const FAME={kyo_kiyomizu:3,kyo_maruyama:3,kyo_tetsugaku:3,kyo_ginkaku:3,kyo_bamboo:3,kyo_tenryuji:3,nar_todaiji:3,nar_kasuga:2,kyo_nijo:3,kyo_inari:3,kyo_shirakawa:3,
  kyo_inoda:2,kyo_yorozuya:2,kyo_okutan:2,kyo_masuda:2,kyo_omen:2,kyo_kyogoku:2,kyo_sagano:2,kyo_katsukura:2,nar_shizuka:2,kyo_okaru:2,nar_beer:1,kyo_nishiki:3,kyo_ramen:2};
const STYLES={
  budget:{name:'窮遊',desc:'門票 ¥1,500 以上先拿掉，補上免費又有名的點（八坂神社、蹴上、南禪寺、渡月橋），每日餐費降到 ¥2,500。'},
  cp:{name:'最大 CP 值',desc:'保留知名度高的景點，拿掉票價高但知名度普通的，補上免費或便宜又有名的點，一天能走的點最多。'},
  leisure:{name:'休閒',desc:'每天只排 2 個主景點加午晚餐，其他放進每天下方的選單，想去再加。預設就是這個節奏。'},
  custom:{name:'自訂',desc:'你手動調整過景點，系統不再套用預設傾向。'}
};
const CAR_DAYS={transit:[],hybrid:[5,6,7],car:[2,3,4,5,6,7]};
const MODE_DESC={transit:'全程電車、地鐵、巴士（推薦）。京都市區塞車又難停車，大眾運輸最省也最準時。',hybrid:'D5 起租車：奈良一日自駕，最後一天開到關西機場還車（甲租乙還）。市區停車費高，效益不大。',car:'D2 起全程自駕，不建議：櫻花季東山、嵐山一帶塞車嚴重，寺社多半沒有停車場。'};

const PLACES = {
  tpe:{n:'桃園機場 TPE',a:'Taoyuan International Airport',lat:25.0797,lng:121.2342,city:'TPE'},
  kix:{n:'關西機場 KIX',a:'大阪府泉佐野市泉州空港北1',lat:34.4347,lng:135.2440,city:'KYO',nopark:true},
  kix_arr:{n:'關西機場入境大廳',a:'關西機場第 1 航廈 1F',lat:34.4340,lng:135.2445,city:'KYO'},
  kyo_st:{n:'京都車站',a:'京都市下京区東塩小路町',lat:34.9858,lng:135.7588,city:'KYO'},
  kyo_kintetsu:{n:'近鐵京都站',a:'京都市下京区東塩小路釜殿町（京都車站八條口側）',lat:34.9849,lng:135.7580,city:'KYO'},
  nar_kintetsu:{n:'近鐵奈良站',a:'奈良市東向中町28',lat:34.6843,lng:135.8279,city:'NAR'},
  kyo_inari_st:{n:'JR 稻荷站',a:'京都市伏見区深草稲荷御前町',lat:34.9670,lng:135.7700,city:'KYO'},
  kyo_saga_st:{n:'JR 嵯峨嵐山站',a:'京都市右京区嵯峨天龍寺車道町',lat:35.0181,lng:135.6810,city:'KYO'},
  kyo_kiyomizu:{n:'清水寺',a:'京都市東山区清水1-294',lat:34.9949,lng:135.7850,city:'KYO',poi:true,url:'https://www.kiyomizudera.or.jp/',urlLabel:'官網',memo:'6:00 開門，拜觀 ¥500；春季有夜間特別拜觀，日期出發前確認'},
  kyo_okutan:{n:'奧丹 清水（湯豆腐）',a:'京都市東山区清水3-340',lat:34.9972,lng:135.7813,city:'KYO',poi:true,closed:[4],memo:'週四休；平日 11:00–16:30、週末 11:00–17:30；豆腐套餐 ¥3,000／¥4,000，現金'},
  kyo_maruyama:{n:'圓山公園 祇園枝垂櫻',a:'京都市東山区円山町',lat:35.0030,lng:135.7810,city:'KYO',poi:true,memo:'免費；櫻花季傍晚起點燈'},
  kyo_masuda:{n:'先斗町ますだ',a:'京都市中京区先斗町通四条上ル下樵木町200',lat:35.0058,lng:135.7707,city:'KYO',poi:true,closed:[0],memo:'週日休，17:00–22:00；只收現金、不接受線上訂位，可打電話 075-221-6816'},
  kyo_tetsugaku:{n:'哲學之道',a:'京都市左京区鹿ケ谷〜浄土寺',lat:35.0215,lng:135.7945,city:'KYO',poi:true,memo:'免費；疏水道兩岸約 400 棵櫻花'},
  kyo_ginkaku:{n:'銀閣寺',a:'京都市左京区銀閣寺町2',lat:35.0270,lng:135.7982,city:'KYO',poi:true,memo:'拜觀 ¥1,000，3–11 月 8:30–17:00'},
  kyo_omen:{n:'名代おめん 銀閣寺本店',a:'京都市左京区浄土寺石橋町74',lat:35.0256,lng:135.7955,city:'KYO',poi:true,closed:[4],memo:'週四休（另有不定休）；平日 10:30–18:00、週末 10:30–16:00／17:00–20:30'},
  kyo_kyogoku:{n:'京極スタンド',a:'京都市中京区新京極通四条上ル中之町546',lat:35.0040,lng:135.7681,city:'KYO',poi:true,closed:[2],memo:'週二休，12:00–21:00；昭和初期開業的老食堂，晚餐約 ¥3,000；全店可吸菸'},
  kyo_bamboo:{n:'嵐山竹林小徑',a:'京都市右京区嵯峨小倉山田淵山町',lat:35.0170,lng:135.6716,city:'KYO',poi:true,memo:'免費、24 小時'},
  kyo_tenryuji:{n:'天龍寺',a:'京都市右京区嵯峨天龍寺芒ノ馬場町68',lat:35.0158,lng:135.6737,city:'KYO',poi:true,memo:'庭園 ¥500，8:30–17:00；春天的枝垂櫻在百花苑'},
  kyo_sagano:{n:'湯豆腐 嵯峨野',a:'京都市右京区嵯峨天龍寺芒ノ馬場町45',lat:35.0168,lng:135.6750,city:'KYO',poi:true,memo:'11:00–17:30（L.O. 16:30），豆腐賣完提早關；不定休；可刷卡'},
  kyo_katsukura:{n:'名代とんかつ かつくら 三条本店',a:'京都市中京区三条通寺町東入石橋町16',lat:35.0089,lng:135.7676,city:'KYO',poi:true,memo:'無休，11:00–21:00（L.O. 20:30），約 ¥1,500–2,500'},
  nar_todaiji:{n:'東大寺大佛殿',a:'奈良市雑司町406-1',lat:34.6890,lng:135.8398,city:'NAR',poi:true,memo:'大佛殿 ¥800；4–10 月 7:30–17:30'},
  nar_shizuka:{n:'志津香 公園店（釜飯）',a:'奈良市登大路町59-11',lat:34.6849,lng:135.8355,city:'NAR',poi:true,closed:[2],memo:'週二休；平日 11:00–15:00、週末 11:00–16:00；不接受訂位，釜飯現煮約 20 分鐘'},
  nar_kasuga:{n:'春日大社',a:'奈良市春日野町160',lat:34.6813,lng:135.8484,city:'NAR',poi:true,memo:'境內免費；本殿特別參拜另收費'},
  nar_beer:{n:'なら麦酒 ならまち醸造所',a:'奈良市紀寺町956-2',lat:34.6742,lng:135.8325,city:'NAR',poi:true,memo:'不定休；平日 11:00–19:00、週末到 20:00；奈良第一家精釀啤酒廠'},
  kyo_nijo:{n:'二條城',a:'京都市中京区二条通堀川西入二条城町541',lat:35.0142,lng:135.7481,city:'KYO',poi:true,url:'https://nijo-jocastle.city.kyoto.lg.jp/',urlLabel:'官網',memo:'入城＋二之丸御殿 ¥1,300；櫻花祭（2026 年 3/19–4/19）白天 8:45–17:00，夜間點燈 18:00–22:00 另購票'},
  kyo_nishiki:{n:'錦市場',a:'京都市中京区富小路通四条上る西大文字町609',lat:35.0050,lng:135.7650,city:'KYO',poi:true,memo:'約 130 家店，各店休日不同；週三、週日休的店較多'},
  kyo_inari:{n:'伏見稻荷大社',a:'京都市伏見区深草藪之内町68',lat:34.9671,lng:135.7727,city:'KYO',poi:true,memo:'免費、24 小時；傍晚人比白天少'},
  kyo_ramen:{n:'京都拉麵小路（京都車站大樓 10F）',a:'京都市下京区烏丸通塩小路下る東塩小路町901 京都駅ビル10F',lat:34.9853,lng:135.7582,city:'KYO',poi:true,memo:'11:00–22:00（L.O. 21:30），不定休'},
  kyo_inoda:{n:'イノダコーヒ本店',a:'京都市中京区堺町通三条下ル道祐町140',lat:35.0083,lng:135.7621,city:'KYO',poi:true,memo:'無休，7:00–18:00；町家外觀、洋館內裝的老咖啡館'},
  kyo_yorozuya:{n:'祇をん 萬屋（九條蔥烏龍麵）',a:'京都市東山区花見小路四条下ル二筋目西入ル小松町555-1',lat:35.0028,lng:135.7752,city:'KYO',poi:true,memo:'不定休；週一至六 12:30–15:00、17:30–19:00（L.O. 18:40）；必比登推薦；現金、不接受訂位'},
  kyo_shirakawa:{n:'祇園白川・巽橋',a:'京都市東山区元吉町',lat:35.0054,lng:135.7746,city:'KYO',poi:true,memo:'免費；白川兩岸櫻花，入夜點燈'},
  kyo_okaru:{n:'祇園 おかる（咖哩烏龍麵）',a:'京都市東山区八坂新地富永町132',lat:35.0048,lng:135.7740,city:'KYO',poi:true,memo:'午 11:00–15:00、晚 17:00–翌 2:30（週五六到 3:00）；不定休，週日晚上不一定開；約 ¥1,000'},
  teco_osa:{n:'台北駐大阪經濟文化辦事處',a:'大阪市北区中之島3-2-18 中之島フェスティバルタワー17F・19F',lat:34.6930,lng:135.4950,city:'KYO',url:'https://www.taiwanembassy.org/jposa/',urlLabel:'官網',memo:'總機 +81-6-6227-8623；急難救助 +81-90-8794-4568（日本境內撥 090-8794-4568）。轄區含京都、奈良'}
};
const STAYS = {
  KYO:{label:'京都',en:'Kyoto',opts:[
    {tag:'主選',n:'Hotel Gracery 京都三条',a:'京都市中京区六角通寺町東入桜之町420',lat:35.0060,lng:135.7678,rating:'Jalan 4.4（108 則）',range:'櫻花季雙人房約 ¥25,000–35,000',why:'2025 年 9 月新開，在新京極商店街裡；走路到錦市場、先斗町、祇園都在 15 分鐘內，晚上散步回飯店最方便。浴室與廁所分開、有浴缸。',rooms:[{t:'雙人房（17–18 m²）',cap:2,f:1},{t:'雙床房（23–25 m²）',cap:2,f:1.15}]},
    {tag:'備案 A',n:'三井花園飯店 京都四條',a:'京都市下京区西洞院通四条下ル妙伝寺町707-1',lat:35.0028,lng:135.7546,rating:'Jalan 4.3（3,317 則）',range:'櫻花季雙人房約 ¥22,000–30,000',why:'評論數最多、口碑穩定；有大浴場（開到早上 9 點），別館有三人房與四人房，多人同行也住得下。到四條站走路 6 分鐘。',rooms:[{t:'雙人房',cap:2,f:1},{t:'雙床房',cap:2,f:1.05},{t:'三人房（別館）',cap:3,f:1.45},{t:'四人房（別館）',cap:4,f:1.8}]},
    {tag:'備案 B（省錢）',n:'相鐵 Fresa Inn 京都四條烏丸',a:'京都市下京区四条通烏丸東入（四條站步行 2 分鐘）',lat:35.0035,lng:135.7605,rating:'icotto 3.4（32 則）',range:'櫻花季雙人房約 ¥14,000–20,000',why:'交通最方便的平價商務旅館，地鐵四條站、阪急烏丸站都在 2 分鐘內。房間小、收納空間少，評價中等。',rooms:[{t:'雙人房',cap:2,f:1},{t:'雙床房',cap:2,f:1.15}]},
    {tag:'高檔選項',n:'HOTEL KANRA KYOTO（ホテル カンラ 京都）',a:'京都市下京区烏丸通六条下る北町190',lat:34.9930,lng:135.7590,rating:'Jalan 4.8（345 則）',range:'雙人 ¥34,800 起，櫻花季約 ¥55,000–75,000',p0:65000,why:'全房有檜木浴缸、32 m² 起的町家風設計旅館，五條站走路 1 分鐘、京都站 12 分鐘。房價每人超過 ¥20,000 時，住宿稅是每人每晚 ¥1,000。',rooms:[{t:'和洋室（32 m² 起）',cap:2,f:1},{t:'大房型（可加床）',cap:3,f:1.5}]}]},
  NAR:{label:'奈良',en:'Nara',opts:[
    {tag:'主選',n:'奈良日航飯店',a:'奈良市三条本町8-1',lat:34.6812,lng:135.8195,rating:'奈良縣最大的車站直結飯店',range:'雙人房約 ¥18,000–28,000',why:'和 JR 奈良站直接相連，有大浴場；到奈良公園搭巴士約 10 分鐘。',rooms:[{t:'雙人房',cap:2,f:1},{t:'雙床房',cap:2,f:1.1},{t:'三人房',cap:3,f:1.5}]},
    {tag:'備案 A',n:'奈良華盛頓廣場飯店',a:'奈良市下三条町31-1',lat:34.6830,lng:135.8230,rating:'JR 奈良站步行 4 分鐘',range:'雙人房約 ¥12,000–18,000',why:'在 JR 奈良站與近鐵奈良站中間，平價、乾淨，晚上逛三條通方便。',rooms:[{t:'雙人房',cap:2,f:1},{t:'雙床房',cap:2,f:1.1}]}]}
};
// nights[i] = where you sleep at the end of day i+1
const STRATS = {
  base:{name:'一間住到底',nights:['KYO','KYO','KYO','KYO','KYO','KYO',null],
    desc:'京都同一間飯店住 6 晚，不必搬行李；奈良當天來回（近鐵約 45 分鐘）。',
    pros:'完全不換飯店，最輕鬆',cons:'看不到奈良的清晨和傍晚'},
  easy:{name:'奈良住一晚',nights:['KYO','KYO','KYO','KYO','NAR','KYO',null],
    desc:'D5 晚上住奈良：傍晚鹿群回林子、遊客散去的奈良公園最安靜；D6 早上回京都。大行李寄放在京都飯店，只帶過夜包。',
    pros:'奈良不用趕最後一班車',cons:'京都要分兩段訂房，入住 3 次'}
};
const STAY_ORDER=['KYO','NAR'];
const T=c=>'STAY_'+c;
// day plan. segs(ctx) / car(ctx): ctx = {S,E,sb,eb}  S/E = start/end stay tokens, sb/eb = their cities
const DAYS = [
 {start:'08:00',t:'抵達京都・祇園白川夜櫻',note:'早班機直飛關西（約 2.5 小時，日本比台灣快 1 小時）。HARUKA 特急到京都，先到飯店寄放行李，到イノダ吃遲來的午餐。傍晚在花見小路的萬屋吃九條蔥烏龍麵，再走到白川看夜櫻。',
  segs:c=>[{c:'flight',f:'tpe',to:'kix',label:'TPE → KIX 直飛',fl:'out'},
        {c:'fixed',f:'kix',to:'kix_arr',label:'飛行約 2 小時 30 分（時差 +1 小時）＋入境、領行李',fare:0,mins:255,tm:'transit'},
        {c:'airport',f:'kix_arr',to:c.E,hint:'HARUKA 到京都站，再搭地鐵或計程車到飯店'},
        {c:'city',f:c.E,to:'kyo_inoda'},
        {c:'city',f:'kyo_inoda',to:'kyo_yorozuya',hint:'地鐵東西線到三條京阪，或沿四條通走'},
        {c:'city',f:'kyo_yorozuya',to:'kyo_shirakawa',hint:'花見小路往北步行'},
        {c:'city',f:'kyo_shirakawa',to:c.E,hint:'過四條大橋走回去'}],
  tix:c=>[['ICOCA 交通卡（押金，退卡可退）',500,'transport','cash']]},
 {start:'08:30',t:'東山・清水寺與圓山夜櫻',note:'清水寺 6 點開門，9 點前人還不多。沿二年坂、三年坂下坡到奧丹吃湯豆腐。下午回飯店休息，傍晚到圓山公園看祇園枝垂櫻點燈，晚餐在先斗町。',
  segs:c=>[{c:'city',f:c.S,to:'kyo_kiyomizu',hint:'市巴士 207 或計程車到五條坂'},
        {c:'city',f:'kyo_kiyomizu',to:'kyo_okutan',hint:'沿三年坂、二年坂下坡'},
        {c:'city',f:'kyo_okutan',to:'kyo_maruyama',hint:'經八坂神社；等點燈前可回飯店休息'},
        {c:'city',f:'kyo_maruyama',to:'kyo_masuda',hint:'過四條大橋右轉先斗町'},
        {c:'city',f:'kyo_masuda',to:c.E}],
  tix:c=>[['清水寺',500,null,'cash']]},
 {start:'09:30',t:'哲學之道・銀閣寺',note:'從南禪寺端沿疏水道慢慢走到銀閣寺，兩岸都是櫻花。中午在おめん吃沾麵烏龍。下午自由：可以從下方選單加平安神宮神苑的紅枝垂櫻，或蹴上傾斜鐵道的櫻花隧道。',
  segs:c=>[{c:'city',f:c.S,to:'kyo_tetsugaku',hint:'地鐵東西線到蹴上，或市巴士 5 號'},
        {c:'city',f:'kyo_tetsugaku',to:'kyo_ginkaku',hint:'沿疏水道往北'},
        {c:'city',f:'kyo_ginkaku',to:'kyo_omen'},
        {c:'city',f:'kyo_omen',to:'kyo_kyogoku',hint:'市巴士 5 號回市中心'},
        {c:'city',f:'kyo_kyogoku',to:c.E}],
  tix:c=>[['銀閣寺',1000,null,'cash']]},
 {start:'07:30',t:'嵐山・竹林與天龍寺',note:'早上 9 點前到竹林小徑，從北門進天龍寺庭園。中午吃湯豆腐。下午可以從選單加渡月橋、野宮神社，或 2027 年春新車上路的嵯峨野小火車（要先上網預約）。',
  segs:c=>[{c:'city',f:c.S,to:'kyo_saga_st',hint:'地鐵到二條站轉 JR 嵯峨野線，或阪急到嵐山'},
        {c:'city',f:'kyo_saga_st',to:'kyo_bamboo'},
        {c:'city',f:'kyo_bamboo',to:'kyo_tenryuji',hint:'走竹林盡頭的天龍寺北門'},
        {c:'city',f:'kyo_tenryuji',to:'kyo_sagano'},
        {c:'city',f:'kyo_sagano',to:'kyo_katsukura',hint:'阪急嵐山線轉京都線到京都河原町'},
        {c:'city',f:'kyo_katsukura',to:c.E}],
  tix:c=>[['天龍寺庭園',500,null,'cash']]},
 {start:'08:30',t:c=>c.eb==='NAR'?'奈良一日（住奈良）':'奈良一日遊',
  note:c=>c.eb==='NAR'?'大行李寄放在京都飯店，只帶過夜包。近鐵到奈良，先看東大寺大佛，午餐吃釜飯，下午走春日大社的石燈籠參道。傍晚遊客散去，在奈良町喝精釀啤酒。'
    :'近鐵急行約 45 分鐘到奈良。出站就是奈良公園，一路有鹿。先看東大寺大佛，午餐吃釜飯，下午走春日大社的石燈籠參道，傍晚回京都，晚餐在祇園吃咖哩烏龍麵。',
  segs:c=>{const head=[{c:'city',f:c.S,to:'kyo_kintetsu',hint:'地鐵烏丸線到京都站'},
        {c:'fixed',f:'kyo_kintetsu',to:'nar_kintetsu',label:'近鐵京都線急行（約）',fare:760,mins:45,tm:'transit',pay:'ic'},
        {c:'city',f:'nar_kintetsu',to:'nar_todaiji',hint:'穿過奈良公園步行約 20 分鐘'},
        {c:'city',f:'nar_todaiji',to:'nar_shizuka'},
        {c:'city',f:'nar_shizuka',to:'nar_kasuga',hint:'沿春日大社參道'}];
    const tail=c.eb==='NAR'?[{c:'city',f:'nar_kasuga',to:'nar_beer',hint:'經奈良町老街'},{c:'city',f:'nar_beer',to:c.E}]
      :[{c:'city',f:'nar_kasuga',to:'nar_kintetsu',hint:'市內循環巴士或步行 25 分鐘'},
        {c:'fixed',f:'nar_kintetsu',to:'kyo_kintetsu',label:'近鐵奈良線・京都線急行（約）',fare:760,mins:45,tm:'transit',pay:'ic'},
        {c:'city',f:'kyo_kintetsu',to:'kyo_okaru',hint:'地鐵到四條轉阪急，或計程車'},
        {c:'city',f:'kyo_okaru',to:c.E}];
    return head.concat(tail);},
  car:c=>[{c:'drive',f:c.S,to:'nar_todaiji',toll:1300,hint:'京奈和道；停奈良縣營停車場'},
       {c:'city',f:'nar_todaiji',to:'nar_shizuka'},{c:'city',f:'nar_shizuka',to:'nar_kasuga'},
       {c:'drive',f:'nar_kasuga',to:c.E,toll:c.eb==='NAR'?0:1300}],
  tix:c=>[['東大寺大佛殿',800,null,'cash']]},
 {start:'08:45',t:c=>c.sb==='NAR'?'奈良 → 京都・二條城與伏見稻荷':'二條城・錦市場・伏見稻荷',
  note:c=>(c.sb==='NAR'?'早上搭近鐵回京都，先回飯店放下過夜包。':'')+'二條城櫻花祭期間白天先看御殿與庭園，中午到錦市場邊走邊吃，下午回飯店休息。傍晚去伏見稻荷，遊客比白天少，千本鳥居在夕陽下最漂亮。晚餐在京都車站的拉麵小路。',
  segs:c=>{const pre=c.sb==='NAR'?[{c:'city',f:c.S,to:'nar_kintetsu'},
        {c:'fixed',f:'nar_kintetsu',to:'kyo_kintetsu',label:'近鐵奈良線・京都線急行（約）',fare:760,mins:45,tm:'transit',pay:'ic'},
        {c:'city',f:'kyo_kintetsu',to:c.E,hint:'回飯店放過夜包'},
        {c:'city',f:c.E,to:'kyo_nijo',hint:'地鐵東西線二條城前站'}]
      :[{c:'city',f:c.S,to:'kyo_nijo',hint:'地鐵東西線二條城前站'}];
    return pre.concat([{c:'city',f:'kyo_nijo',to:'kyo_nishiki',hint:'地鐵到烏丸御池轉烏丸線，或計程車'},
        {c:'city',f:'kyo_nishiki',to:'kyo_inari_st',hint:'JR 奈良線京都 → 稻荷約 5 分鐘'},
        {c:'city',f:'kyo_inari_st',to:'kyo_inari'},
        {c:'city',f:'kyo_inari',to:'kyo_ramen',hint:'JR 回京都站'},
        {c:'city',f:'kyo_ramen',to:c.E}]);},
  tix:c=>[['二條城（含二之丸御殿）',1300,null,'either']]},
 {start:'10:30',t:'返程',note:'睡飽、退房，HARUKA 到關西機場，在機場吃午餐。國際線建議起飛前 2.5 小時到機場，回程班機建議訂 15:00 以後。',
  segs:c=>[{c:'airport',f:c.S,to:'kix',hint:'HARUKA（外國旅客優惠票）'},
        {c:'flight',f:'kix',to:'tpe',label:'KIX → TPE 直飛',fl:'back'}],
  car:c=>[{c:'drive',f:c.S,to:'kix',toll:2700,hint:'名神・阪神高速；關西機場附近還車'},{c:'flight',f:'kix',to:'tpe',label:'KIX → TPE 直飛',fl:'back'}],tix:c=>[]}
];
const FARE={KYO:230,NAR:250};
const CAP={KYO:1100};
const AIRPORT={KYO:{fare:2200,mins:95,label:'HARUKA 特急（外國旅客優惠票 WEST-QR，約）＋市區轉乘'}};
const WD=['日','一','二','三','四','五','六'];
const DEFAULTS = {start:'2027-04-01',mode:'transit',strat:'base',fx:0.206,flight:14000,meal:6000,pax:2,room:'double',skip:{},add:{},style:'leisure',mustIds:{},
  must:[],
  params:{rentDay:9000,insDay:1500,oneWay:5500,fuel:175,cons:7,parkKYO:2500,parkNAR:1500,stopPark:800,bigCar:3000},
  stays:{KYO:{sel:0,price:[30000,26000,17000,65000],custom:{n:'',a:'',coord:'',price:25000,cap:2}},NAR:{sel:0,price:[22000,15000],custom:{n:'',a:'',coord:'',price:15000,cap:2}}},
  places:{}};
const PARAM_LABELS={rentDay:['租金 ¥/天',500],insDay:['全險 ¥/天',100],oneWay:['甲地租乙地還 ¥',500],fuel:['油價 ¥/公升',5],cons:['油耗 L/100km',0.5],parkKYO:['京都過夜停車 ¥/晚',100],parkNAR:['奈良過夜停車 ¥/晚',100],stopPark:['景點停車 ¥/次',100],bigCar:['4 人以上換大車加價 ¥/天',500]};

const TIMELINE=(add,day,car)=>[
  [add(-180),'櫻花季京都飯店很早就滿：先訂可免費取消的房，之後再換更好的'],
  [add(-120),'用上方機票連結追蹤 TPE ⇄ KIX（Google Flights 可開價格追蹤）；早去晚回的班次最省假'],
  [add(-60),'在台灣旅行社或 Klook／KKday 買 HARUKA 外國旅客優惠票（WEST-QR，日本國內買不到）'],
  [add(-45),'一日團、嵯峨野小火車（若要搭）預約；二條城夜間點燈票開賣後購買'],
  [(()=>{const d=new Date(day(1)); d.setDate(d.getDate()-30); return d;})(),'2 月底氣象協會公布櫻花預測，花期偏早或偏晚就用「出發日」與天數調整'],
  [add(-21),'投保旅平險＋海外突發疾病；信用卡開通海外交易'+(car?'；監理站辦駕照日文譯本（NT$100）':'')],
  [add(-7),'填 Visit Japan Web 拿入境與海關 QR code；買日本 eSIM；換日圓'],
  [add(-1),'截圖：機票、住宿、Visit Japan Web QR、HARUKA QR、保險單']
];
const CHECK=[
 ['入境文件',[
  ['passport','護照效期需涵蓋停留期間（建議 6 個月以上）；台灣護照免簽停留 90 天'],
  ['vjw','Visit Japan Web：出發前填好入境審查與海關申報，取得 QR code'],
  ['jesta','JESTA 電子旅行授權預計 2028 年度才上路，2027 年 4 月入境不需要'],
  ['proof','手機與紙本各備一份：回程機票、住宿確認信']]],
 ['保險與金流',[
  ['ins','旅平險加保海外突發疾病，另加旅遊不便險（班機延誤、行李遺失）'],
  ['card','信用卡開通海外交易；準備兩張不同發卡組織的卡'],
  ['cash','換 ¥30,000～50,000 現金：寺社拜觀料、市場、老店多半只收現金'],
  ['taxfree','免稅：同一店家同日消費 ¥5,000（未稅）以上出示護照；日本預計 2026 年 11 月起改為「先付稅、出境時退稅」，出發前確認最新做法']]],
 ['交通',[
  ['haruka','HARUKA 外國旅客優惠票（WEST-QR，京都 ¥2,200）：只能在海外購買，用手機 QR 過閘門'],
  ['icoca','ICOCA：關西機場站可買；或用 iPhone／Android 錢包加入 ICOCA，搭巴士、地鐵、JR、近鐵都通'],
  ['pass','地鐵・巴士一日券 ¥1,100：當天搭 5 次巴士以上才划算；只到當天末班車'],
  ['bus','櫻花季清水寺、銀閣寺方向的巴士常常擠不上，2 人以上短程搭計程車很划算']]],
 ['預約與票券',[
  ['nijo','二條城櫻花祭夜間點燈：日期與票價每年公布，官網預購'],
  ['kiyomizu','清水寺春季夜間特別拜觀：約 3 月底到 4 月初，日期出發前確認'],
  ['torokko','嵯峨野觀光小火車：2027 年春新車登場，營運日與預約方式出發前確認'],
  ['masuda','先斗町ますだ：只能打電話訂位（075-221-6816），週日休']]],
 ['通訊與電力',[
  ['esim','日本 eSIM 或上網卡'],
  ['plug','插座 A 型（雙扁腳）、100V；台灣電器多數可以直接用'],
  ['apps','下載：Google 地圖離線地圖、GO（計程車）、Visit Japan Web、Klook／KKday']]],
 ['現況提醒（2026 年資料）',[
  ['sakura','京都平年滿開 4/4；2026 年預測 3/23 開花、3/30 滿開。2027 年預測每年 2 月公布'],
  ['tax','京都住宿稅 2026/3 起調高：每人每晚 ¥200～¥10,000，依房價分五級'],
  ['crowd','4/3–4/6 台灣清明連假、日本新學期開始前，熱門景點非常擁擠：清水寺、伏見稻荷、竹林都要早上 8 點前到'],
  ['wx','4 月初京都約 6～18°C，早晚冷：洋蔥式穿法，帶薄羽絨或風衣'],
  ['time','日本比台灣快 1 小時']]],
 ['緊急聯絡',[
  ['110','日本報警 110；火災、救護 119'],
  ['teco','台北駐大阪經濟文化辦事處（轄區含京都、奈良）：大阪市北区中之島3-2-18 中之島フェスティバルタワー17F。總機 +81-6-6227-8623，急難救助 +81-90-8794-4568','https://www.taiwanembassy.org/jposa/'],
  ['mofa','外交部緊急聯絡中心 +886-800-085-095'],
  ['save','以上電話存進手機通訊錄；地點庫可直接導航到辦事處']]]
];
const MAP_GEO={}; // 省略：python3 scripts/make_map_geo.py countries-10m.json Japan --bbox 134.9,136.3,34.2,35.35
const MAP_BOUNDS={"w":134.9,"e":136.3,"s":34.2,"n":35.35};
const CITY_LABELS=[{n:'京都',city:'KYO',lat:35.0116,lng:135.7681},{n:'奈良',city:'NAR',lat:34.6851,lng:135.8048}];
const PHOTOS={}; // 執行 scripts/build_photos.py 會把照片清單寫在這裡；也可以直接在頁面上「選擇照片資料夾」
const CITY_ZH={KYO:'京都',NAR:'奈良'};
const DEF_PLAN=['t2','t3','t4','t5','t6'];   // 中段預設行程日（t＝DAYS 的第幾天）
const DROP_ORDER=['t5','t4','t6','t3','t2']; // 縮短天數時的刪除順序
const FREE_CITIES=['KYO'];              // 可以加自由日的城市（要有 STAYS）
const CAR_FROM=5;                       // 混合方案從原本第幾天開始租車
const RET_AIR={KYO:{id:'kix',code:'KIX'}}; // 可回程的機場
const AIR_OF={KYO:'KYO',NAR:'KYO'};      // 最後一晚住哪 → 從哪個機場回
const PHOTO_ALIAS={'台灣桃園機場':'tpe','關西機場':'kix','京都車站':'kyo_st','近鐵奈良站':'nar_kintetsu'}; // 資料夾名沒寫 [id] 時的對照
const COVER_OF={KYO:'cover_01',NAR:'cover_02'};
const CITY_HUE={KYO:345,NAR:30};
const HUBS={};
const POI_PRICE={kyo_kiyomizu:500,kyo_ginkaku:1000,kyo_tenryuji:500,nar_todaiji:800,kyo_nijo:1300};
/* 一日團：for＝可取代哪個行程日（t5＝原 D5）；add＝可另外加一天（住哪個城市）。價格為來源頁的成人價（日圓約值） */
const TOURS={
  tour_nara:{for:'t5',city:'KYO',n:'一日團：奈良世界遺產半日巴士團（含午餐）',meet:'京都站八條口觀光巴士停車場（KYOTO AVANTI 前），08:25 集合',lat:34.9840,lng:135.7605,start:'08:40',dur:330,price:11500,lunch:true,ph:'nar_todaiji',
    incl:'冷氣巴士、英語導遊、東大寺門票、日式午餐；飲料自理。另有加京都景點的一日方案',rating:'GetYourGuide 9.8／10（56 則）',src:'https://www.travelocity.com/things-to-do/from-kyoto-nara-half-day-guided-bus-tour.a46038947.activity-details',
    why:'不想自己轉車、找路的話，坐上巴士就到東大寺與奈良公園，中午回到京都，下午還能休息。代價是看不到春日大社，行程時間被固定。'},
  tour_amano:{add:'KYO',city:'KYO',n:'一日團：天橋立＋伊根舟屋＋美山茅草屋',meet:'京都出發（集合地點與時間以預約頁為準）',lat:34.9858,lng:135.7588,start:'08:00',dur:690,price:8100,lunch:false,ph:'kyo_st',
    incl:'巴士來回、伊根灣遊船（看舟屋與海鷗）、天橋立與美山茅草屋之里自由參觀；午餐自理',rating:'Klook 5.0／5（1,134 則，萬人以上預訂）',src:'https://livejapan.com/en/in-kansai/in-pref-kyoto/in-kyoto-station_to-ji-temple/activity-cherry_blossom_tours/ac0198928/',
    why:'京都北部「海之京都」三個點自己去要轉好幾段火車和巴士，一天跑不完；跟團一天看完。適合想多加一天、換換城市風景的人。'}
};
/* ===== TRIP DATA END ===== */
