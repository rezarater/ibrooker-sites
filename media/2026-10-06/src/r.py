import asyncio, os
from playwright.async_api import async_playwright
JOBS=[('m4',1128,191,2),('m16',1280,720,1)]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        for n,w,h,sc in JOBS:
            pg=await b.new_page(viewport={'width':w,'height':h},device_scale_factor=sc)
            await pg.goto(f'file://{os.getcwd()}/{n}.html'); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(400)
            ov=await pg.evaluate(f"document.documentElement.scrollHeight>{h} || document.documentElement.scrollWidth>{w}"); print(n,'overflow',ov)
            await pg.screenshot(path=f'{n}.png')
        await b.close()
asyncio.run(main())
