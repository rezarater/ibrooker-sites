import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for n,out in [('m23','../M23-iraq-metals-export-ban-1200x1200.png'),('m23fa','../M23-fa-iraq-metals-export-ban-1200x1200.png')]:
            pg=await b.new_page(viewport={'width':1200,'height':1200})
            await pg.goto(f'file://{os.getcwd()}/{n}.html'); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(400)
            ov=await pg.evaluate("document.documentElement.scrollHeight>1200 || document.documentElement.scrollWidth>1200"); print(n,'overflow',ov)
            await pg.screenshot(path=out)
        await b.close()
asyncio.run(main())
