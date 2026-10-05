import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for n in ['m13a','m13b']:
            pg=await b.new_page(viewport={'width':1200,'height':1200})
            await pg.goto(f'file://{os.getcwd()}/{n}.html'); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(300)
            ov=await pg.evaluate("document.documentElement.scrollHeight>1200 || document.documentElement.scrollWidth>1200"); print(n,'overflow',ov)
            await pg.screenshot(path=f'{n}.png')
        await b.close()
asyncio.run(main())
