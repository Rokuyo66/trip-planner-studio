#!/usr/bin/env python3
"""產生行程頁地圖用的國界資料（MAP_GEO / MAP_BOUNDS）。

用法：
  python3 make_map_geo.py countries-10m.json 主要國家 [鄰國 ...] [--pad 0.6] [--tol 0.01] [--bbox 西,東,南,北]
  例：python3 make_map_geo.py countries-10m.json Portugal Spain
      python3 make_map_geo.py countries-10m.json Japan

countries-10m.json 取得方式（擇一）：
  npm pack world-atlas@2 && tar xzf world-atlas-2*.tgz   → package/countries-10m.json
  https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json
--bbox 只保留範圍內的島嶼／領土，並直接當成地圖範圍（例：葡萄牙本土 --bbox -10,-6,36.8,42.2）。
國名用英文（world-atlas 的 properties.name）。輸出兩行 JS，直接貼進 trip.html 的 TRIP DATA 區塊取代原本的 MAP_GEO 與 MAP_BOUNDS。
"""
import json, sys, math

def decode(topo):
    t = topo.get('transform'); sx, sy = (t['scale'] if t else (1, 1)); tx, ty = (t['translate'] if t else (0, 0))
    arcs = []
    for arc in topo['arcs']:
        x = y = 0; pts = []
        for p in arc:
            if t: x += p[0]; y += p[1]; pts.append((x * sx + tx, y * sy + ty))
            else: pts.append((p[0], p[1]))
        arcs.append(pts)
    return arcs

def ring(arcs, idxs):
    out = []
    for i in idxs:
        a = arcs[i] if i >= 0 else list(reversed(arcs[~i]))
        out.extend(a if not out else a[1:])
    return out

def simplify(pts, tol):
    if len(pts) < 4: return pts
    def d(p, a, b):
        if a == b: return math.dist(p, a)
        (x, y), (x1, y1), (x2, y2) = p, a, b
        return abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / math.hypot(x2 - x1, y2 - y1)
    keep = [False] * len(pts); keep[0] = keep[-1] = True; st = [(0, len(pts) - 1)]
    while st:
        i, j = st.pop(); best, k = 0, -1
        for m in range(i + 1, j):
            dd = d(pts[m], pts[i], pts[j])
            if dd > best: best, k = dd, m
        if best > tol: keep[k] = True; st += [(i, k), (k, j)]
    return [p for p, kk in zip(pts, keep) if kk]

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    opt = dict(zip(sys.argv[1::1], sys.argv[2::1]))
    pad = float(opt.get('--pad', 0.6)); tol = float(opt.get('--tol', 0.01))
    bbox = [float(v) for v in opt['--bbox'].split(',')] if '--bbox' in opt else None
    args = [a for a in args if not (bbox and a == opt.get('--bbox')) and a not in (opt.get('--pad'), opt.get('--tol'))]
    if len(args) < 2: print(__doc__); sys.exit(1)
    topo = json.load(open(args[0])); arcs = decode(topo)
    geoms = {g['properties']['name']: g for g in topo['objects']['countries']['geometries']}
    out = {}; main_key = None; mainpts = []
    for n, name in enumerate(args[1:]):
        g = geoms.get(name)
        if not g: print('找不到國家：', name, file=sys.stderr); continue
        polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
        rings = []
        for poly in polys:
            r = simplify(ring(arcs, poly[0]), tol)
            if bbox and not any(bbox[0] - 3 <= x <= bbox[1] + 3 and bbox[2] - 3 <= y <= bbox[3] + 3 for x, y in r): continue
            if len(r) >= 4: rings.append([[round(x, 3), round(y, 3)] for x, y in r])
        key = ''.join(c for c in name.upper() if c.isalpha())[:3]
        out[key] = rings
        if n == 0: main_key = key; mainpts = [p for r in rings for p in r if not bbox or (bbox[0] <= p[0] <= bbox[1] and bbox[2] <= p[1] <= bbox[3])]
    xs = [p[0] for p in mainpts]; ys = [p[1] for p in mainpts]
    w, e, s, nn = (bbox if bbox else (min(xs) - pad, max(xs) + pad, min(ys) - pad, max(ys) + pad))
    lat0 = round((s + nn) / 2, 1)
    geo = {'lat0': lat0, 'mainKey': main_key, **out}
    print('const MAP_GEO=' + json.dumps(geo, separators=(',', ':')) + ';')
    print('const MAP_BOUNDS=' + json.dumps({'w': round(w, 2), 'e': round(e, 2), 's': round(s, 2), 'n': round(nn, 2)}, separators=(',', ':')) + ';')

main()
