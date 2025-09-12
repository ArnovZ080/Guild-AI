from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the local dev server
        page.goto("http://localhost:5173")

        # Wait for the "Content Performance Garden" heading
        garden_heading = page.get_by_role("heading", name="Content Performance Garden")
        expect(garden_heading).to_be_visible(timeout=15000)

        # Give a little extra time for animations to settle
        page.wait_for_timeout(1000)

        # Take a screenshot of the entire page
        screenshot_path = "jules-scratch/verification/verification.png"
        page.screenshot(path=screenshot_path)

        browser.close()
        print(f"Screenshot saved to {screenshot_path}")

if __name__ == "__main__":
    run_verification()
