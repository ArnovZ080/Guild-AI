from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1920, 'height': 1080})
    page = context.new_page()
    try:
        page.goto("http://localhost:5175/")

        # Verify the main overview dashboard
        expect(page.locator("h3:has-text('Momentum Tracker')")).to_be_visible()
        page.screenshot(path="/app/jules-scratch/verification/final_dashboard.png")
        print("Saved final_dashboard.png")

        # Verify the builder page
        page.goto("http://localhost:5175/builder")
        expect(page.locator("h1:has-text('Workflow Builder')")).to_be_visible()
        page.screenshot(path="/app/jules-scratch/verification/final_builder.png")
        print("Saved final_builder.png")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        context.close()
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
