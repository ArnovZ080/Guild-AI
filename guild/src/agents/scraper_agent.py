from playwright.sync_api import sync_playwright
from typing import Dict, Any, List, Optional
import logging
import json

# Import advanced scraping capabilities
try:
    from guild.src.core.scraping import get_advanced_scraper, AdvancedScraper
    ADVANCED_SCRAPING_AVAILABLE = True
except ImportError:
    ADVANCED_SCRAPING_AVAILABLE = False
    print("Warning: Advanced scraping not available. Install Scrapy for enhanced capabilities.")

logger = logging.getLogger(__name__)

class ScraperAgent:
    """
    Enhanced Scraper Agent with both basic Playwright and advanced Scrapy capabilities.
    """
    
    def __init__(self):
        self.advanced_scraper = None
        if ADVANCED_SCRAPING_AVAILABLE:
            try:
                self.advanced_scraper = get_advanced_scraper()
                logger.info("Scraper Agent initialized with advanced scraping capabilities")
            except Exception as e:
                logger.warning(f"Failed to initialize advanced scraper: {e}")
    
    def scrape_leads(self, 
                    query: str, 
                    num_leads: int = 10,
                    use_advanced: bool = True,
                    icp_criteria: Optional[Dict[str, Any]] = None) -> List[Dict[str, str]]:
        """
        Performs web scraping to find structured lead data.

        Args:
            query: The search query for the leads (e.g., "real estate agents in Cape Town").
            num_leads: The desired number of leads to find.
            use_advanced: Whether to use advanced Scrapy-based scraping
            icp_criteria: Ideal Customer Profile criteria for filtering

        Returns:
            A list of dictionaries, where each dictionary represents a lead.
        """
        logger.info(f"Scraper Agent: Scraping for '{query}'...")

        if use_advanced and self.advanced_scraper:
            return self._scrape_leads_advanced(query, num_leads, icp_criteria)
        else:
            return self._scrape_leads_basic(query, num_leads)
    
    def _scrape_leads_advanced(self, 
                              query: str, 
                              num_leads: int,
                              icp_criteria: Optional[Dict[str, Any]] = None) -> List[Dict[str, str]]:
        """
        Use advanced Scrapy-based scraping for better results.
        """
        try:
            # Generate search URLs based on query
            search_urls = self._generate_search_urls(query)
            
            # Set up ICP criteria if not provided
            if not icp_criteria:
                icp_criteria = self._extract_icp_from_query(query)
            
            # Use advanced scraper
            results = self.advanced_scraper.scrape_leads(
                urls=search_urls,
                icp_criteria=icp_criteria
            )
            
            if results['status'] == 'success':
                leads = results['leads'][:num_leads]
                logger.info(f"Advanced scraping found {len(leads)} leads")
                return leads
            else:
                logger.warning(f"Advanced scraping failed: {results.get('error')}")
                # Fall back to basic scraping
                return self._scrape_leads_basic(query, num_leads)
                
        except Exception as e:
            logger.error(f"Error in advanced scraping: {e}")
            # Fall back to basic scraping
            return self._scrape_leads_basic(query, num_leads)
    
    def _scrape_leads_basic(self, query: str, num_leads: int) -> List[Dict[str, str]]:
        """
        Basic Playwright-based scraping (original implementation).
        """
        leads = []

        with sync_playwright() as p:
            try:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()

                search_url = f"https://duckduckgo.com/?q={query}"
                page.goto(search_url, wait_until="networkidle")

                # This is a very simplified example of lead scraping.
                # A real implementation would be much more sophisticated, potentially
                # visiting each search result link to find contact information.

                # For now, we'll just scrape the titles and snippets from the search results page.
                result_elements_selector = 'article[data-testid="result"]'
                page.wait_for_selector(result_elements_selector, timeout=10000)

                results = page.query_selector_all(result_elements_selector)

                for result in results[:num_leads]:
                    title_element = result.query_selector('a[data-testid="result-title-a"]')
                    snippet_element = result.query_selector('div[data-testid="result-snippet"]')

                    title = title_element.inner_text() if title_element else "No Title"
                    link = title_element.get_attribute('href') if title_element else "No Link"
                    snippet = snippet_element.inner_text() if snippet_element else "No Snippet"

                    leads.append({
                        "title": title,
                        "link": link,
                        "summary": snippet
                    })

                browser.close()

                logger.info(f"Scraper Agent: Successfully scraped {len(leads)} potential leads.")
                return leads

            except Exception as e:
                logger.error(f"Scraper Agent: Error during lead scraping - {e}")
                if 'browser' in locals() and browser.is_connected():
                    browser.close()
                return []
    
    def _generate_search_urls(self, query: str) -> List[str]:
        """
        Generate search URLs based on the query.
        """
        # URL encode the query
        import urllib.parse
        encoded_query = urllib.parse.quote_plus(query)
        
        # Generate URLs for different search engines and platforms
        urls = [
            f"https://duckduckgo.com/?q={encoded_query}",
            f"https://www.google.com/search?q={encoded_query}",
            f"https://www.bing.com/search?q={encoded_query}",
        ]
        
        # Add LinkedIn search if it looks like a professional query
        if any(keyword in query.lower() for keyword in ['engineer', 'manager', 'director', 'ceo', 'founder']):
            linkedin_query = encoded_query.replace('+', '%20')
            urls.append(f"https://www.linkedin.com/search/results/people/?keywords={linkedin_query}")
        
        return urls
    
    def _extract_icp_from_query(self, query: str) -> Dict[str, Any]:
        """
        Extract basic ICP criteria from the search query.
        """
        query_lower = query.lower()
        
        icp_criteria = {
            'keyword_filters': {},
            'exclusion_filters': {}
        }
        
        # Extract industry keywords
        industries = ['tech', 'software', 'real estate', 'finance', 'healthcare', 'education']
        for industry in industries:
            if industry in query_lower:
                icp_criteria['keyword_filters']['title'] = [industry]
                break
        
        # Extract role keywords
        roles = ['engineer', 'manager', 'director', 'ceo', 'founder', 'agent', 'consultant']
        for role in roles:
            if role in query_lower:
                if 'keyword_filters' not in icp_criteria:
                    icp_criteria['keyword_filters'] = {}
                if 'title' not in icp_criteria['keyword_filters']:
                    icp_criteria['keyword_filters']['title'] = []
                icp_criteria['keyword_filters']['title'].append(role)
        
        # Extract location keywords
        locations = ['new york', 'san francisco', 'london', 'cape town', 'toronto']
        for location in locations:
            if location in query_lower:
                icp_criteria['keyword_filters']['location'] = [location]
                break
        
        return icp_criteria
    
    def export_leads(self, leads: List[Dict[str, Any]], format: str = 'json', output_path: Optional[str] = None) -> str:
        """
        Export leads to a file.
        
        Args:
            leads: List of lead data
            format: Export format ('json', 'csv', 'excel')
            output_path: Optional output path
            
        Returns:
            Path to the exported file
        """
        import tempfile
        import os
        
        if not output_path:
            temp_dir = tempfile.mkdtemp(prefix="guild_leads_")
            output_path = os.path.join(temp_dir, f"leads.{format}")
        
        if format == 'json':
            with open(output_path, 'w') as f:
                json.dump(leads, f, indent=2)
        elif format == 'csv':
            import pandas as pd
            df = pd.DataFrame(leads)
            df.to_csv(output_path, index=False)
        elif format == 'excel':
            if self.advanced_scraper:
                self.advanced_scraper.export_to_excel(leads, output_path)
            else:
                import pandas as pd
                df = pd.DataFrame(leads)
                df.to_excel(output_path, index=False, engine='openpyxl')
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        logger.info(f"Exported {len(leads)} leads to {output_path}")
        return output_path

# Backward compatibility function
def scrape_leads(query: str, num_leads: int = 10) -> List[Dict[str, str]]:
    """
    Backward compatibility function for the original scrape_leads function.
    
    Args:
        query: The search query for the leads
        num_leads: The desired number of leads to find
        
    Returns:
        A list of dictionaries, where each dictionary represents a lead.
    """
    agent = ScraperAgent()
    return agent.scrape_leads(query, num_leads, use_advanced=True)