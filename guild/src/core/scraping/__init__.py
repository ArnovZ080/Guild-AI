"""
Advanced Scraping Module for Guild-AI

This module provides enhanced web scraping capabilities using Scrapy and other
open-source tools for robust, scalable data collection.
"""

from .advanced_scraper import (
    AdvancedScraper,
    LeadEnrichmentPipeline,
    GenericLeadSpider,
    get_advanced_scraper,
    scrape_leads_advanced
)

__all__ = [
    'AdvancedScraper',
    'LeadEnrichmentPipeline', 
    'GenericLeadSpider',
    'get_advanced_scraper',
    'scrape_leads_advanced'
]
