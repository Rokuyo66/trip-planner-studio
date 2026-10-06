// 讀取 trip.html 的 TRIP DATA 區塊，回傳所有資料常數（不需要瀏覽器）
import fs from 'node:fs';
import vm from 'node:vm';
const NAMES = ['TRIP_META','FLIGHTS','CITY_TAX','PAY','CASH','CASH_TIPS','BOOKLET_PLACES','TIX_OF','VISIT','MEAL','CANDS','FAME','STYLES','CAR_DAYS','MODE_DESC','PLACES','STAYS','STRATS','STAY_ORDER','DAYS','FARE','CAP','AIRPORT','DEFAULTS','PARAM_LABELS','TIMELINE','CHECK','MAP_GEO','MAP_BOUNDS','CITY_LABELS','PHOTOS','CITY_ZH','DEF_PLAN','DROP_ORDER','FREE_CITIES','CAR_FROM','RET_AIR','AIR_OF','PHOTO_ALIAS','COVER_OF','CITY_HUE','HUBS','POI_PRICE','TOURS'];
export function loadTrip(file) {
  const html = fs.readFileSync(file, 'utf8');
  const a = html.indexOf('/* ===== TRIP DATA START');
  const b = html.indexOf('/* ===== TRIP DATA END');
  if (a < 0 || b < 0) throw new Error('找不到 TRIP DATA START / END 標記');
  const block = html.slice(a, b);
  const code = block + '\n;({' + NAMES.map(n => `${n}: typeof ${n}==='undefined'?undefined:${n}`).join(',') + '})';
  return { html, block, data: vm.runInNewContext(code, {}, { filename: 'TRIP_DATA' }) };
}
