import requests
from bs4 import BeautifulSoup
from typing import Dict, Any

def search_web(query: str) -> Dict[str, Any]:
    """
    Performs a web search for a given query and returns the content
    of the top search result.

    Args:
        query: The search query.

    Returns:
        A dictionary containing the URL and the extracted text content.
    """
    print(f"Research Agent: Searching for '{query}'...")

    try:
        # Use a search engine URL. This is a simplified example using Google.
        # In a real-world scenario, you might use a search API like SerpAPI or Google's Custom Search API.
        search_url = f"https://www.google.com/search?q={query}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

        response = requests.get(search_url, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes

        # Find the first search result link
        soup = BeautifulSoup(response.text, 'html.parser')

        # This is a brittle way to find search results and likely to break.
        # A real implementation should use a dedicated search API.
        link_tags = soup.find_all('a')
        first_result_url = None
        for link in link_tags:
            href = link.get('href')
            if href and href.startswith('/url?q='):
                first_result_url = href.split('/url?q=')[1].split('&sa=U')[0]
                break

        if not first_result_url:
            return {"url": search_url, "content": "Could not find a valid search result link."}

        # Fetch the content of the first result
        page_response = requests.get(first_result_url, headers=headers)
        page_response.raise_for_status()

        page_soup = BeautifulSoup(page_response.text, 'html.parser')

        # Extract text content
        # Remove script and style elements
        for script_or_style in page_soup(["script", "style"]):
            script_or_style.decompose()

        text_content = page_soup.get_text(separator='\n', strip=True)

        print(f"Research Agent: Successfully fetched content from {first_result_url}")
        return {"url": first_result_url, "content": text_content[:5000]} # Limit content size for now

    except requests.exceptions.RequestException as e:
        print(f"Research Agent: Error during web search - {e}")
        return {"url": None, "content": f"An error occurred: {e}"}
