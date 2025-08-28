from playwright.sync_api import sync_playwright
from typing import Dict, Any

def search_web(query: str) -> Dict[str, Any]:
    """
    Performs a web search for a given query using a headless browser
    and returns the content of the top search result.

    Args:
        query: The search query.

    Returns:
        A dictionary containing the URL and the extracted text content.
    """
    print(f"Research Agent: Searching for '{query}' with Playwright...")

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # Use DuckDuckGo as it's generally more scraper-friendly than Google.
            search_url = f"https://duckduckgo.com/?q={query}"
            page.goto(search_url, wait_until="networkidle")

            # Find the first search result link.
            # This selector targets the main result links on DuckDuckGo's page.
            first_result_selector = 'a[data-testid="result-title-a"]'

            # Wait for the selector to ensure the page has loaded results
            page.wait_for_selector(first_result_selector, timeout=5000)

            first_result_href = page.get_attribute(first_result_selector, 'href')

            if not first_result_href:
                browser.close()
                return {"url": search_url, "content": "Could not find a valid search result link."}

            # Go to the first result page
            page.goto(first_result_href, wait_until="domcontentloaded")

            # Extract text content using Playwright's built-in method
            # This is generally more robust than BeautifulSoup for dynamic pages.
            text_content = page.evaluate("document.body.innerText")

            browser.close()

            print(f"Research Agent: Successfully fetched content from {first_result_href}")
            return {"url": first_result_href, "content": text_content[:5000]} # Limit content size

        except Exception as e:
            print(f"Research Agent: Error during Playwright web search - {e}")
            # Ensure browser is closed in case of an error
            if 'browser' in locals() and browser.is_connected():
                browser.close()
            return {"url": None, "content": f"An error occurred: {e}"}
