from playwright.sync_api import sync_playwright, Page, expect

def run(page: Page):
    """
    This test verifies that the new AgentPersonality components are displayed on the dashboard.
    """
    # 1. Arrange: Go to the dashboard page.
    page.goto("http://localhost:5173/dashboard", timeout=60000)

    # 2. Act: Wait for the agent personality cards to be visible.
    # We can identify them by the heading "Your AI Workforce".
    # Then we can find the agent cards within that section.
    expect(page.get_by_role("heading", name="Your AI Workforce")).to_be_visible(timeout=30000)

    # We can also check for a specific agent name.
    expect(page.get_by_role("heading", name="Dr. Insight")).to_be_visible()

    # 3. Assert: Confirm that the agent cards are present.
    # Let's count them to make sure all are rendered.
    # The parent of the grid is the motion.div, we need to find the grid inside it.
    workforce_section = page.locator("div.space-y-6")
    agent_cards = workforce_section.locator("> div.grid > div")
    expect(agent_cards).to_have_count(6)


    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/agents_view.png")

    print("Screenshot created successfully.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run(page)
        browser.close()

if __name__ == "__main__":
    main()
