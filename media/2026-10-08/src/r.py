import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for n,out in [('m22','../M22-corridor-brief-cover-2026-10-05-1200x627.png'),('m22fa','../M22-fa-corridor-brief-cover-2026-10-05-1200x627.png')]:
            pg=await b.new_page(viewport={'width':1200,'height':627})
            await pg.goto(f'file://{os.getcwd()}/{n}.html'); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(400)
            ov=await pg.evaluate("document.documentElement.scrollHeight>627 || document.documentElement.scrollWidth>1200"); print(n,'overflow',ov)
            await pg.screenshot(path=out)
        await b.close()
asyncio.run(main())
