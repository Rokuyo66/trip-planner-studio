#!/usr/bin/env node
// 用法：node check_data.mjs <trip.html>
// 檢查行程資料的參照是否一致：每段路線的起訖點、門票對照、候選點、住宿、日模組設定。
import { loadTrip } from './_load.mjs';
const file = process.argv[2];
if (!file) { console.error('用法：node check_data.mjs <trip.html>'); process.exit(1); }
const { data: D } = loadTrip(file);
const errs = [], warns = [];
const T = c => 'STAY_' + c;
const known = id => id && (D.PLACES[id] || String(id).startsWith('STAY_') || (D.CANDS || []).some(c => c.id === id) || (D.TOURS || {})[id]);
const must = ['TRIP_META','FLIGHTS','PLACES','STAYS','STRATS','DAYS','VISIT','MEAL','CANDS','FAME','DEFAULTS','MAP_GEO','MAP_BOUNDS','CITY_LABELS','CITY_ZH','DEF_PLAN','DROP_ORDER','FREE_CITIES','RET_AIR','AIR_OF','COVER_OF','CITY_HUE','POI_PRICE','TOURS','FARE','CAP','AIRPORT','TIX_OF','STYLES','CHECK','TIMELINE'];
must.forEach(n => { if (D[n] === undefined) errs.push(`缺少資料常數 ${n}`); });
const L = D.DAYS.length;
Object.entries(D.STRATS).forEach(([k, s]) => { if (s.nights.length !== L) errs.push(`STRATS.${k}.nights 長度 ${s.nights.length} ≠ DAYS ${L}`); s.nights.forEach(c => { if (c && !D.STAYS[c]) errs.push(`STRATS.${k} 用到沒有 STAYS 的城市 ${c}`); }); });
Object.entries(D.STRATS).forEach(([k, s]) => {
  D.DAYS.forEach((d, i) => {
    const eb = s.nights[i] || null, sb = i >= 1 ? (s.nights[i - 1] || null) : null;
    const c = { S: sb ? T(sb) : null, E: eb ? T(eb) : null, sb, eb };
    let segs = [];
    try { segs = (d.segs(c) || []).concat(d.car ? (d.car(c) || []) : []); } catch (e) { errs.push(`D${i + 1}（${k}）segs 執行錯誤：${e.message}`); }
    segs.forEach(g => {
      [g.f, g.to].forEach(id => { if (id === null || id === undefined) { if (i > 0 && i < L - 1) warns.push(`D${i + 1}（${k}）有起訖點是 null（前一晚或當晚沒住宿？）`); } else if (!known(id)) errs.push(`D${i + 1}（${k}）路線用到不存在的地點 ${id}`); });
      if (!['city', 'drive', 'fixed', 'airport', 'flight'].includes(g.c)) errs.push(`D${i + 1} 未知的路段類型 c:'${g.c}'`);
      if (g.c === 'fixed' && (g.mins == null || g.fare == null)) errs.push(`D${i + 1} fixed 路段 ${g.f}→${g.to} 缺 mins 或 fare`);
    });
    try { (d.tix(c) || []).forEach(t => { if (!Array.isArray(t) || t.length < 4) errs.push(`D${i + 1} 門票格式應為 [名稱, 價格, 類別或null, 付款]`); }); } catch (e) { errs.push(`D${i + 1} tix 執行錯誤：${e.message}`); }
  });
});
Object.entries(D.PLACES).forEach(([id, p]) => { if (typeof p.lat !== 'number' || typeof p.lng !== 'number') errs.push(`PLACES.${id} 缺座標`); if (p.poi && !D.VISIT[id] && !p.tour) warns.push(`景點 ${id} 沒有 VISIT 停留時間（會用預設值）`); });
Object.keys(D.VISIT).forEach(id => { if (!known(id)) warns.push(`VISIT 有不存在的地點 ${id}`); });
Object.entries(D.TIX_OF).forEach(([n, id]) => { if (!known(id)) warns.push(`TIX_OF「${n}」對到不存在的地點 ${id}`); });
(D.CANDS || []).forEach(c => { ['id','n','lat','lng','city','day','dw','kind'].forEach(k => { if (c[k] === undefined) errs.push(`CANDS ${c.id || '?'} 缺 ${k}`); }); });
Object.entries(D.STAYS).forEach(([c, st]) => { const pr = D.DEFAULTS.stays && D.DEFAULTS.stays[c]; if (!pr) errs.push(`DEFAULTS.stays 缺城市 ${c}`); st.opts.forEach((o, i) => { if (!o.rooms || !o.rooms.length) errs.push(`STAYS.${c}[${i}] 缺 rooms`); }); });
const M = D.TRIP_META || {};
const HOME = M.homeDay === false ? 0 : 1;   // 有沒有「抵家日」：短程航線當天到家設 homeDay:false
D.DEF_PLAN.forEach(t => { const n = +t.slice(1); if (!(n >= 2 && n <= L - 1 - HOME)) errs.push(`DEF_PLAN 的 ${t} 超出中段範圍 t2～t${L - 1 - HOME}`); });
Object.entries(D.STRATS).forEach(([k, s]) => {
  if (HOME && s.nights[0]) warns.push(`STRATS.${k}.nights[0] 有城市，但 D1 是長程夜班機；當天就住當地的短程行程請設 TRIP_META.homeDay:false`);
  s.nights.slice(L - HOME).forEach((c, j) => { if (c) errs.push(`STRATS.${k}.nights 最後 ${HOME + 1} 格（回程${HOME ? '與抵家' : ''}）要是 null`); });
});
if (M.local && M.local !== '€' && !M.k) warns.push('非歐元幣別請設 TRIP_META.k（約等於 1 歐元的當地金額，例如日圓 100），旅遊傾向的門檻才會跟著換算');

// 排程檢查：照 DEFAULTS.start 推出每天星期幾，對 PLACES.closed；同一家餐廳不要排兩次；休閒傾向每天主景點不超過 2 個
const WDN = ['日', '一', '二', '三', '四', '五', '六'];
const start = D.DEFAULTS.start ? new Date(D.DEFAULTS.start + 'T12:00:00') : null;
const mealIds = {};
Object.entries(D.STRATS).forEach(([k, s]) => {
  D.DAYS.forEach((d, i) => {
    const eb = s.nights[i] || null, sb = i >= 1 ? (s.nights[i - 1] || null) : null;
    let segs = []; try { segs = d.segs({ S: sb ? T(sb) : null, E: eb ? T(eb) : null, sb, eb }) || []; } catch (e) { return; }
    const pois = [...new Set(segs.flatMap(g => [g.f, g.to]).filter(id => D.PLACES[id] && D.PLACES[id].poi))];
    if (start) {
      const wd = new Date(start.getTime() + i * 864e5).getDay();
      pois.forEach(id => { const cl = D.PLACES[id].closed; if (cl && cl.includes(wd)) errs.push(`D${i + 1}（週${WDN[wd]}，${k}）排到 ${D.PLACES[id].n}，但它週${WDN[wd]}休`); });
    }
    const isMeal = id => { const v = D.VISIT[id]; return v && (v[1] === 'meal' || v[1] === 'snack' || v[1] === 'show'); };
    if (k === D.DEFAULTS.strat) {
      pois.filter(isMeal).forEach(id => (mealIds[id] = mealIds[id] || []).push(i + 1));
      const main = pois.filter(id => !isMeal(id));
      if (D.DEFAULTS.style === 'leisure' && main.length > 2) warns.push(`D${i + 1} 預設傾向是休閒，但排了 ${main.length} 個主景點（${main.map(id => D.PLACES[id].n).join('、')}）；按「休閒」會被砍到 2 個`);
    }
  });
});
Object.entries(mealIds).forEach(([id, ds]) => { if (ds.length > 1) warns.push(`${D.PLACES[id].n} 在 D${ds.join('、D')} 都排了，換一家比較好`); });
Object.entries(D.TOURS || {}).forEach(([id, t]) => { if (!t.for && !t.add) errs.push(`TOURS.${id} 要有 for（取代哪天）或 add（可加在哪個城市）`); if (!t.src) warns.push(`TOURS.${id} 沒有參考來源 src`); });
D.FREE_CITIES.forEach(c => { if (!D.STAYS[c]) errs.push(`FREE_CITIES 的 ${c} 沒有 STAYS`); });
Object.values(D.RET_AIR).forEach(r => { if (!D.PLACES[r.id]) errs.push(`RET_AIR 用到不存在的機場 ${r.id}`); });
if (!Object.keys(D.MAP_GEO).some(k => Array.isArray(D.MAP_GEO[k]) && Array.isArray(D.MAP_GEO[k][0]))) errs.push('MAP_GEO 沒有任何國界多邊形');
console.log(`DAYS ${L} 天、地點 ${Object.keys(D.PLACES).length} 個、候選 ${(D.CANDS || []).length} 個、一日團 ${Object.keys(D.TOURS || {}).length} 個`);
warns.forEach(w => console.log('注意：' + w));
errs.forEach(e => console.log('錯誤：' + e));
console.log(errs.length ? `有 ${errs.length} 個錯誤要修` : '檢查通過');
process.exit(errs.length ? 1 : 0);
