"""
Advanced Web Scraping System for Guild-AI

This module provides enhanced web scraping capabilities using Scrapy for robust,
scalable data collection. It integrates with the existing RAG pipeline and
provides data enrichment capabilities.
"""

import os
import json
import logging
import tempfile
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
import pandas as pd
from bs4 import BeautifulSoup
import phonenumbers
from email_validator import validate_email, EmailNotValidError
from faker import Faker

# Scrapy imports
try:
    import scrapy
    from scrapy.crawler import CrawlerProcess
    from scrapy.utils.project import get_project_settings
    from scrapy.http import Request
    SCRAPY_AVAILABLE = True
except ImportError:
    SCRAPY_AVAILABLE = False
    print("Warning: Scrapy not available. Install with: pip install scrapy")

logger = logging.getLogger(__name__)

class LeadEnrichmentPipeline:
    """
    Pipeline for enriching and validating scraped lead data.
    """
    
    def __init__(self):
        self.fake = Faker()
    
    def process_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process and enrich a single lead item.
        
        Args:
            item: Raw scraped lead data
            
        Returns:
            Enriched and validated lead data
        """
        try:
            # Validate and format phone numbers
            if 'phone' in item and item['phone']:
                item = self._process_phone_number(item)
            
            # Validate emails
            if 'email' in item and item['email']:
                item = self._validate_email(item)
            
            # Enrich missing data with synthetic data (for development/testing)
            item = self._enrich_missing_data(item)
            
            # Clean and standardize text fields
            item = self._clean_text_fields(item)
            
            return item
            
        except Exception as e:
            logger.error(f"Error processing lead item: {e}")
            return item
    
    def _process_phone_number(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Process and format phone numbers."""
        try:
            phone = item['phone']
            # Try to parse as US number first, then international
            for country in ['US', None]:
                try:
                    parsed = phonenumbers.parse(phone, country)
                    if phonenumbers.is_valid_number(parsed):
                        item['phone_formatted'] = phonenumbers.format_number(
                            parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL
                        )
                        item['phone_valid'] = True
                        break
                except:
                    continue
            else:
                item['phone_valid'] = False
                item['phone_formatted'] = phone
        except Exception as e:
            logger.warning(f"Error processing phone number {item.get('phone')}: {e}")
            item['phone_valid'] = False
        
        return item
    
    def _validate_email(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Validate email addresses."""
        try:
            email = item['email']
            valid = validate_email(email)
            item['email_valid'] = True
            item['email_normalized'] = valid.email
        except EmailNotValidError:
            item['email_valid'] = False
            item['email_normalized'] = email
        except Exception as e:
            logger.warning(f"Error validating email {item.get('email')}: {e}")
            item['email_valid'] = False
        
        return item
    
    def _enrich_missing_data(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich missing data with synthetic data for development/testing."""
        # Only add synthetic data if explicitly enabled
        if not os.getenv('ENABLE_SYNTHETIC_DATA', 'false').lower() == 'true':
            return item
        
        # Add synthetic email if missing
        if not item.get('email') and item.get('name'):
            name = item['name'].lower().replace(' ', '.')
            item['email'] = f"{name}@example.com"
            item['email_synthetic'] = True
        
        # Add synthetic phone if missing
        if not item.get('phone'):
            item['phone'] = self.fake.phone_number()
            item['phone_synthetic'] = True
        
        return item
    
    def _clean_text_fields(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and standardize text fields."""
        text_fields = ['name', 'title', 'company', 'description', 'location']
        
        for field in text_fields:
            if field in item and item[field]:
                # Strip whitespace and normalize
                item[field] = ' '.join(str(item[field]).split())
        
        return item

class GenericLeadSpider(scrapy.Spider):
    """
    Generic spider for scraping lead data from various sources.
    """
    
    name = 'generic_lead_spider'
    
    def __init__(self, start_urls=None, target_selectors=None, icp_criteria=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_urls = start_urls or []
        self.target_selectors = target_selectors or {}
        self.icp_criteria = icp_criteria or {}
        self.enrichment_pipeline = LeadEnrichmentPipeline()
        
        # Custom settings for this spider
        self.custom_settings = {
            'ROBOTSTXT_OBEY': True,
            'DOWNLOAD_DELAY': 2,
            'RANDOMIZE_DOWNLOAD_DELAY': True,
            'USER_AGENT': 'Guild-AI Scraper (+https://guild-ai.com/bot)',
            'FEEDS': {
                'leads.json': {'format': 'json', 'overwrite': True}
            }
        }
    
    def start_requests(self):
        """Generate initial requests."""
        for url in self.start_urls:
            yield Request(url, callback=self.parse, meta={'dont_cache': True})
    
    def parse(self, response):
        """
        Parse the response and extract lead data.
        """
        try:
            # Extract leads using configured selectors
            leads = self._extract_leads(response)
            
            for lead in leads:
                # Enrich the lead data
                enriched_lead = self.enrichment_pipeline.process_item(lead)
                
                # Check if lead meets ICP criteria
                if self._meets_icp(enriched_lead):
                    yield enriched_lead
            
            # Follow pagination links if available
            next_page = self._get_next_page(response)
            if next_page:
                yield response.follow(next_page, self.parse)
                
        except Exception as e:
            logger.error(f"Error parsing {response.url}: {e}")
    
    def _extract_leads(self, response) -> List[Dict[str, Any]]:
        """Extract lead data from response using configured selectors."""
        leads = []
        
        # Default selectors for common lead data
        default_selectors = {
            'name': 'h1, h2, h3, .name, .title, [class*="name"]',
            'title': '.title, .position, .job-title, [class*="title"]',
            'company': '.company, .organization, [class*="company"]',
            'email': 'a[href^="mailto:"], .email, [class*="email"]',
            'phone': 'a[href^="tel:"], .phone, [class*="phone"]',
            'location': '.location, .address, [class*="location"]',
            'description': '.description, .bio, .summary, [class*="description"]'
        }
        
        # Use custom selectors if provided, otherwise use defaults
        selectors = {**default_selectors, **self.target_selectors}
        
        # Find lead containers (individual lead entries)
        lead_containers = response.css('.lead, .person, .contact, .profile, .result').getall()
        
        if not lead_containers:
            # If no specific containers, treat the whole page as one lead
            lead_containers = [response.text]
        
        for container_html in lead_containers:
            lead_data = {}
            
            if isinstance(container_html, str):
                # Parse HTML container
                soup = BeautifulSoup(container_html, 'html.parser')
                
                for field, selector in selectors.items():
                    elements = soup.select(selector)
                    if elements:
                        # Get text content from first matching element
                        lead_data[field] = elements[0].get_text(strip=True)
                        
                        # For email/phone, try to get href attribute
                        if field in ['email', 'phone'] and elements[0].name == 'a':
                            href = elements[0].get('href', '')
                            if field == 'email' and href.startswith('mailto:'):
                                lead_data[field] = href.replace('mailto:', '')
                            elif field == 'phone' and href.startswith('tel:'):
                                lead_data[field] = href.replace('tel:', '')
            else:
                # Use Scrapy selectors for response objects
                for field, selector in selectors.items():
                    elements = container_html.css(selector)
                    if elements:
                        lead_data[field] = elements.get()
            
            # Add source URL
            lead_data['source_url'] = response.url
            
            if lead_data:  # Only add if we found some data
                leads.append(lead_data)
        
        return leads
    
    def _get_next_page(self, response) -> Optional[str]:
        """Get the next page URL for pagination."""
        next_selectors = [
            'a[rel="next"]',
            '.next',
            '.pagination .next',
            'a:contains("Next")',
            'a:contains(">")'
        ]
        
        for selector in next_selectors:
            next_link = response.css(selector).get()
            if next_link:
                return next_link
        
        return None
    
    def _meets_icp(self, lead: Dict[str, Any]) -> bool:
        """
        Check if a lead meets the Ideal Customer Profile criteria.
        """
        if not self.icp_criteria:
            return True  # No criteria means all leads are valid
        
        # Check required fields
        required_fields = self.icp_criteria.get('required_fields', [])
        for field in required_fields:
            if not lead.get(field):
                return False
        
        # Check keyword matching
        keyword_filters = self.icp_criteria.get('keyword_filters', {})
        for field, keywords in keyword_filters.items():
            if field in lead and lead[field]:
                field_value = lead[field].lower()
                if not any(keyword.lower() in field_value for keyword in keywords):
                    return False
        
        # Check exclusion keywords
        exclusion_filters = self.icp_criteria.get('exclusion_filters', {})
        for field, keywords in exclusion_filters.items():
            if field in lead and lead[field]:
                field_value = lead[field].lower()
                if any(keyword.lower() in field_value for keyword in keywords):
                    return False
        
        return True

class AdvancedScraper:
    """
    Advanced scraper that orchestrates Scrapy spiders for lead generation.
    """
    
    def __init__(self):
        if not SCRAPY_AVAILABLE:
            raise ImportError("Scrapy is required for advanced scraping. Install with: pip install scrapy")
        
        self.enrichment_pipeline = LeadEnrichmentPipeline()
        self.temp_dir = None
    
    def scrape_leads(self, 
                    urls: List[str], 
                    icp_criteria: Dict[str, Any],
                    target_selectors: Optional[Dict[str, str]] = None,
                    output_file: Optional[str] = None) -> Dict[str, Any]:
        """
        Scrape leads from multiple URLs using Scrapy.
        
        Args:
            urls: List of URLs to scrape
            icp_criteria: Ideal Customer Profile criteria for filtering
            target_selectors: Custom CSS selectors for data extraction
            output_file: Optional output file path
            
        Returns:
            Dictionary with scraping results
        """
        try:
            # Create temporary directory for Scrapy output
            self.temp_dir = tempfile.mkdtemp(prefix="guild_scraper_")
            
            # Set up Scrapy settings
            settings = get_project_settings()
            settings.update({
                'ROBOTSTXT_OBEY': True,
                'DOWNLOAD_DELAY': 2,
                'RANDOMIZE_DOWNLOAD_DELAY': True,
                'USER_AGENT': 'Guild-AI Scraper (+https://guild-ai.com/bot)',
                'FEEDS': {
                    os.path.join(self.temp_dir, 'leads.json'): {
                        'format': 'json', 
                        'overwrite': True
                    }
                }
            })
            
            # Run the spider
            process = CrawlerProcess(settings)
            process.crawl(
                GenericLeadSpider,
                start_urls=urls,
                target_selectors=target_selectors,
                icp_criteria=icp_criteria
            )
            process.start()
            
            # Read the results
            results_file = os.path.join(self.temp_dir, 'leads.json')
            leads = []
            
            if os.path.exists(results_file):
                with open(results_file, 'r') as f:
                    for line in f:
                        if line.strip():
                            leads.append(json.loads(line))
            
            # Clean up
            self._cleanup()
            
            return {
                'status': 'success',
                'leads_count': len(leads),
                'leads': leads,
                'urls_scraped': urls
            }
            
        except Exception as e:
            logger.error(f"Error in advanced scraping: {e}")
            self._cleanup()
            return {
                'status': 'error',
                'error': str(e),
                'leads_count': 0,
                'leads': []
            }
    
    def _cleanup(self):
        """Clean up temporary files."""
        if self.temp_dir and os.path.exists(self.temp_dir):
            import shutil
            shutil.rmtree(self.temp_dir)
            self.temp_dir = None
    
    def enrich_leads(self, leads: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Enrich a list of leads with validation and additional data.
        
        Args:
            leads: List of raw lead data
            
        Returns:
            List of enriched lead data
        """
        enriched_leads = []
        
        for lead in leads:
            try:
                enriched_lead = self.enrichment_pipeline.process_item(lead)
                enriched_leads.append(enriched_lead)
            except Exception as e:
                logger.error(f"Error enriching lead: {e}")
                enriched_leads.append(lead)  # Return original if enrichment fails
        
        return enriched_leads
    
    def export_to_excel(self, leads: List[Dict[str, Any]], output_path: str) -> bool:
        """
        Export leads to an Excel file.
        
        Args:
            leads: List of lead data
            output_path: Path to save the Excel file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            df = pd.DataFrame(leads)
            df.to_excel(output_path, index=False, engine='openpyxl')
            logger.info(f"Exported {len(leads)} leads to {output_path}")
            return True
        except Exception as e:
            logger.error(f"Error exporting to Excel: {e}")
            return False
    
    def export_to_csv(self, leads: List[Dict[str, Any]], output_path: str) -> bool:
        """
        Export leads to a CSV file.
        
        Args:
            leads: List of lead data
            output_path: Path to save the CSV file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            df = pd.DataFrame(leads)
            df.to_csv(output_path, index=False)
            logger.info(f"Exported {len(leads)} leads to {output_path}")
            return True
        except Exception as e:
            logger.error(f"Error exporting to CSV: {e}")
            return False

# Convenience functions for easy integration
def get_advanced_scraper() -> AdvancedScraper:
    """Get an instance of the advanced scraper."""
    return AdvancedScraper()

def scrape_leads_advanced(urls: List[str], 
                         icp_criteria: Dict[str, Any],
                         target_selectors: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Scrape leads using the advanced scraper."""
    scraper = get_advanced_scraper()
    return scraper.scrape_leads(urls, icp_criteria, target_selectors)
