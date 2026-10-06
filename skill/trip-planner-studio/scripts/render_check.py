#!/usr/bin/env python3
"""用無頭瀏覽器打開 trip.html，逐天列出時間軸，順便抓 JavaScript 錯誤。

用法：python3 render_check.py trip.html [--strat 策略鍵]
需要 Playwright（pip install playwright && playwright install chromium）；沒有就跳過這一步，改用 Chrome 手動逐天看。

看輸出時對照每家餐廳、景點的營業時間：
  - 用餐開始時間要落在餐廳營業時間內（午餐別排在開門前）
  - 有固定時間的點（夕陽、點燈、表演）前面若出現很長的「自由」，考慮把前面的行程往後挪或加候選點
  - 頁面錯誤不是空的就要修
"""
import asyncio, re, sys

TYPES = ('交通', '觀光', '用餐', '自由', '住宿', '航班')


def compact(body):
    ls = [l.strip() for l in body.split('\n') if l.strip() and l.strip() not in ('⇄', '⠿', '移到…', '地圖', '地點')]
    out, i = [], 0
    while i < len(ls):
        if re.fullmatch(r'\d\d:\d\d', ls[i]):
            t1 = ls[i]
            t2 = ls[i + 1] if i + 1 < len(ls) and re.fullmatch(r'\d\d:\d\d', ls[i + 1]) else ''
            j = i + (2 if t2 else 1)
            if j < len(ls) and ls[j] in TYPES:
                name = re.sub(r'^\d+', '', ls[j + 1]).replace('☆', '').strip() if j + 1 < len(ls) else ''
                out.append(f'  {t1}{"–" + t2 if t2 else "      "}  {ls[j]}  {name}')
                i = j + 2
                continue
        i += 1
    return out


async def main(path, strat=None):
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1300, 'height': 1000})
        await pg.route('http*://**', lambda r: r.abort())  # 字型與地圖連結不需要
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + path, wait_until='domcontentloaded')
        await pg.wait_for_timeout(1500)
        if strat:
            await pg.evaluate(f"document.querySelector('[data-strat=\"{strat}\"]').click()")
            await pg.wait_for_timeout(500)
        txt = await pg.evaluate('document.body.innerText')
        n = int((re.search(r'天數\n(\d+) 天', txt) or [0, 0])[1])
        for d in range(1, n + 1):
            await pg.get_by_text(re.compile(rf'^D{d}$')).first.click()
            await pg.wait_for_timeout(400)
            txt = await pg.evaluate('document.body.innerText')
            m = re.search(rf'\nD{d}　([^\n]*)\n([^\n]*)\n([^\n]*)\n([^\n]*)(.*?)(?=\n可加入的景點|\Z)', txt, re.S)
            if not m:
                print(f'D{d}：找不到這天的內容'); continue
            print(f'D{d} {m.group(1)} {m.group(2)}（{m.group(3)}，{m.group(4)}）')
            print('\n'.join(compact(m.group(5))))
        print('頁面錯誤：', errs or '無')
        await b.close()
        return 1 if errs else 0


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    st = sys.argv[sys.argv.index('--strat') + 1] if '--strat' in sys.argv else None
    sys.exit(asyncio.run(main(__import__('os').path.abspath(sys.argv[1]), st)))
