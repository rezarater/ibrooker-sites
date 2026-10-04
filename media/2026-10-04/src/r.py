import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for n,w,h in [('m6',400,400),('m7',1200,1200),('m8',1200,1200)]:
            pg=await b.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
            await pg.goto(f'file://{__import__("os").getcwd()}/{n}.html'); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f'{n}.png')
        await b.close()
asyncio.run(main())
