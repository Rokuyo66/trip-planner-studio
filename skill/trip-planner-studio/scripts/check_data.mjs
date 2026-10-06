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
D.DEF_PLAN.forEach(t => { const n = +t.slice(1); if (!(n >= 2 && n <= L - 2)) errs.push(`DEF_PLAN 的 ${t} 超出中段範圍 t2～t${L - 2}`); });
Object.entries(D.TOURS || {}).forEach(([id, t]) => { if (!t.for && !t.add) errs.push(`TOURS.${id} 要有 for（取代哪天）或 add（可加在哪個城市）`); if (!t.src) warns.push(`TOURS.${id} 沒有參考來源 src`); });
D.FREE_CITIES.forEach(c => { if (!D.STAYS[c]) errs.push(`FREE_CITIES 的 ${c} 沒有 STAYS`); });
Object.values(D.RET_AIR).forEach(r => { if (!D.PLACES[r.id]) errs.push(`RET_AIR 用到不存在的機場 ${r.id}`); });
if (!Object.keys(D.MAP_GEO).some(k => Array.isArray(D.MAP_GEO[k]) && Array.isArray(D.MAP_GEO[k][0]))) errs.push('MAP_GEO 沒有任何國界多邊形');
console.log(`DAYS ${L} 天、地點 ${Object.keys(D.PLACES).length} 個、候選 ${(D.CANDS || []).length} 個、一日團 ${Object.keys(D.TOURS || {}).length} 個`);
warns.forEach(w => console.log('注意：' + w));
errs.forEach(e => console.log('錯誤：' + e));
console.log(errs.length ? `有 ${errs.length} 個錯誤要修` : '檢查通過');
process.exit(errs.length ? 1 : 0);
