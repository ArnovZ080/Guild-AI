import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            # The dev server is running on port 5173
            print("Navigating to http://localhost:5173...")
            await page.goto("http://localhost:5173", wait_until="networkidle")
            await asyncio.sleep(3) # Wait for animations or async rendering
            await page.screenshot(path="/app/rebuild_screenshot_dashboard.png")
            print("Successfully captured screenshot of the dashboard.")

            # Correctly navigate to the builder/workflow view
            print("Navigating to Builder...")
            await page.click('a[href="/builder"]')
            await page.wait_for_url("**/builder", wait_until="networkidle")
            await asyncio.sleep(3)
            await page.screenshot(path="/app/rebuild_screenshot_builder.png")
            print("Successfully captured screenshot of the Builder page.")

            print("\n✅ All pages verified and screenshots taken successfully!")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            print("Closing browser.")
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
