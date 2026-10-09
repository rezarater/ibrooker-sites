import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for n,out in [('m24','../M24-trans-afghan-route-watch-1200x1200.png')]:
            pg=await b.new_page(viewport={'width':1200,'height':1200})
            await pg.goto(f'file://{os.getcwd()}/{n}.html'); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(400)
            print(n,'overflow',await pg.evaluate("document.documentElement.scrollHeight>1200"))
            await pg.screenshot(path=out)
        await b.close()
asyncio.run(main())
