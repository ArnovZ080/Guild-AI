import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Listen for all console events and print them
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.type}: {msg.text}"))

        try:
            # The dev server should be on 5173
            print("Navigating to http://localhost:5173...")
            await page.goto("http://localhost:5173", wait_until="networkidle")
            print("Navigation complete. Waiting for console messages...")
            await asyncio.sleep(5) # Wait for any async errors

        except Exception as e:
            print(f"An error occurred during page load: {e}")
        finally:
            print("Closing browser.")
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
