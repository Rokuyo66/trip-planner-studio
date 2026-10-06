#!/usr/bin/env python3
"""把照片資料夾轉成網頁用的縮圖，並把照片清單寫進 trip.html（要把頁面發佈到網路上時才需要）。

用法：python3 build_photos.py <照片根目錄> <trip.html> [輸出 img 資料夾，預設 trip.html 旁的 img/]
需要 Pillow：pip install pillow
平常在自己電腦上看行程，不必執行這支：直接在頁面「選單 → 存檔 → 選擇照片資料夾」，之後按「重整照片」即可。
"""
import os, re, sys, json
from PIL import Image, ImageOps

def key_of(parts, alias):
    for i in range(len(parts) - 1, -1, -1):
        n = parts[i].strip(); m = re.search(r'\[([A-Za-z0-9_]+)\]$', n)
        if m: return m.group(1)
        if n in alias: return alias[n]
        if re.match(r'^_?(城市封面|cover)$', n, re.I):
            cm = re.match(r'^(\d+)_', parts[i - 1] if i else '')
            if cm: return 'cover_' + cm.group(1)
    return None

def main():
    if len(sys.argv) < 3: print(__doc__); sys.exit(1)
    root, trip = sys.argv[1], sys.argv[2]
    out = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(os.path.abspath(trip)), 'img')
    os.makedirs(out, exist_ok=True)
    html = open(trip, encoding='utf-8').read()
    m = re.search(r'const PHOTO_ALIAS=(\{.*?\});', html); alias = {}
    if m:
        try: alias = json.loads(re.sub(r"'", '"', m.group(1)))
        except Exception: alias = {}
    man = {}
    for dp, dn, fn in os.walk(root):
        imgs = sorted(f for f in fn if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')))
        if not imgs: continue
        parts = os.path.relpath(dp, root).split(os.sep)
        key = key_of(parts, alias)
        if not key: continue
        for i, f in enumerate(imgs):
            im = ImageOps.exif_transpose(Image.open(os.path.join(dp, f))).convert('RGB')
            long = 2000 if key.startswith('cover') else 1400
            im.thumbnail((long, long), Image.LANCZOS)
            name = f'{key}_{i + 1}.webp'; im.save(os.path.join(out, name), 'WEBP', quality=74, method=6)
            man.setdefault(key, []).append({'f': 'img/' + name, 'w': im.width, 'h': im.height})
    js = 'const PHOTOS=' + json.dumps(man, ensure_ascii=False, separators=(',', ':')) + ';'
    html2, n = re.subn(r'const PHOTOS=\{.*?\};', lambda _: js, html, count=1, flags=re.S)
    if not n: print('trip.html 裡找不到 const PHOTOS=…;'); sys.exit(1)
    open(trip, 'w', encoding='utf-8').write(html2)
    tot = sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out))
    print(f'{len(man)} 個地點、{sum(len(v) for v in man.values())} 張照片，共 {tot / 1e6:.1f} MB → {out}')

main()
