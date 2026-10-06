#!/usr/bin/env node
// 用法：node make_photo_folders.mjs <trip.html> <照片根目錄>
// 依行程資料建立「每個地點一個資料夾」，資料夾名稱結尾的 [id] 讓網頁認得照片屬於哪個地點。
import fs from 'node:fs';
import path from 'node:path';
import { loadTrip } from './_load.mjs';

const [, , tripFile, root] = process.argv;
if (!tripFile || !root) { console.error('用法：node make_photo_folders.mjs <trip.html> <照片根目錄>'); process.exit(1); }
const { data: D } = loadTrip(tripFile);
const order = D.CITY_LABELS.map(c => c.city);
const cityNo = c => { const cv = D.COVER_OF && D.COVER_OF[c]; const m = cv && cv.match(/cover_(\d+)/); return m ? m[1] : String(order.indexOf(c) + 1).padStart(2, '0'); };
const cityDir = c => `${cityNo(c)}_${(D.CITY_ZH && D.CITY_ZH[c]) || c}`;
const safe = s => String(s).replace(/[\\/:*?"<>|]/g, '／').replace(/\s+/g, ' ').trim();
const dirs = new Map();
const add = (city, label, id) => { if (!city || !order.includes(city)) return; dirs.set(path.join(root, cityDir(city), `${safe(label)} [${id}]`), 1); };

order.forEach(c => dirs.set(path.join(root, cityDir(c), '_城市封面'), 1));
const candIds = new Set((D.CANDS || []).map(c => c.id));
for (const [id, p] of Object.entries(D.PLACES)) {
  if (!p.poi || candIds.has(id) || p.tour) continue;
  const v = D.VISIT[id]; const meal = v && (v[1] === 'meal' || v[1] === 'snack');
  add(p.city, (meal ? '餐_' : '') + p.n, id);
}
(D.CANDS || []).forEach(c => add(c.city, '候選_' + c.n, c.id));
for (const [city, st] of Object.entries(D.STAYS)) st.opts.forEach((o, i) => add(city, `住_${o.n}（${o.tag}）`, `stay_${city.toLowerCase()}_${i}`));
for (const [id, t] of Object.entries(D.TOURS || {})) add(t.city, '一日團_' + t.n.replace(/^一日團：/, ''), id);
// 交通站：機場、車站與轉機機場
const hubDir = path.join(root, `${String(order.length + 1).padStart(2, '0')}_交通站`);
for (const [id, p] of Object.entries(D.PLACES)) if (/(機場|車站|站)( [A-Z]{3})?$/.test(p.n)) dirs.set(path.join(hubDir, `${safe(p.n)} [${id}]`), 1);
for (const h of Object.values(D.HUBS || {})) dirs.set(path.join(hubDir, `${safe(h.n)} [${h.id}]`), 1);
// 必去清單的範例項目
const near = (lat, lng) => D.CITY_LABELS.reduce((b, c) => { const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2; return d < b[0] ? [d, c.city] : b; }, [1e9, order[0]])[1];
((D.DEFAULTS && D.DEFAULTS.must) || []).forEach(m => { const ll = String(m.loc || '').split(',').map(Number); const city = ll.length === 2 && !isNaN(ll[0]) ? near(ll[0], ll[1]) : order[0]; dirs.set(path.join(root, cityDir(city), `必去_${safe(m.n)} [mu_${m.id}]`), 1); });

let made = 0;
for (const d of dirs.keys()) { if (!fs.existsSync(d)) { fs.mkdirSync(d, { recursive: true }); made++; } }
fs.writeFileSync(path.join(root, '放照片說明.txt'),
  '每個資料夾放 1～5 張照片（jpg／png／webp），第一張會當封面。\r\n資料夾名稱結尾的 [id] 不要改，網頁靠它認照片。\r\n放好後在行程頁按右上角「重整照片」（第一次要先在「選單 → 存檔」選擇這個資料夾）。\r\n');
console.log(`完成：共 ${dirs.size} 個資料夾，新建 ${made} 個 → ${root}`);
