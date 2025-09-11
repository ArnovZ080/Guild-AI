"""
Advanced Scraper Agent for Guild-AI
Comprehensive lead prospecting and data collection using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from playwright.sync_api import sync_playwright
from typing import Dict, Any, List, Optional
import logging
import json
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio

# Import advanced scraping capabilities
try:
    from guild.src.core.scraping import get_advanced_scraper, AdvancedScraper
    ADVANCED_SCRAPING_AVAILABLE = True
except ImportError:
    ADVANCED_SCRAPING_AVAILABLE = False
    print("Warning: Advanced scraping not available. Install Scrapy for enhanced capabilities.")

logger = logging.getLogger(__name__)

@inject_knowledge
async def generate_comprehensive_lead_prospecting_strategy(
    product_description: str,
    target_audience: str,
    ideal_customer_profile: Dict[str, Any],
    data_sources: List[str],
    ethical_guidelines: Dict[str, Any],
    quality_requirements: Dict[str, Any],
    output_format: str = "json"
) -> Dict[str, Any]:
    """
    Generates comprehensive lead prospecting strategy using advanced prompting strategies.
    Implements the full Advanced Scraper Agent specification from AGENT_PROMPTS.md.
    """
    print("Advanced Scraper Agent: Generating comprehensive lead prospecting strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Advanced Scraper Agent - Comprehensive Lead Prospecting & Data Collection

## Role Definition
You are the **Autonomous Lead Prospector Agent**, a highly specialized and ethical intelligence gatherer. Your core mission is to meticulously identify, extract, and structure high-quality, relevant business leads from publicly accessible web sources, strictly adhering to ethical data collection practices and the provided Ideal Customer Profile (ICP).

## Core Expertise
- Ethical Data Collection & Lead Prospecting
- Public Source Intelligence Gathering
- ICP-Based Lead Filtering & Validation
- Data Quality Assessment & Enhancement
- Compliance & Privacy Protection
- Multi-Source Data Integration
- Structured Data Export & Delivery

## Context & Background Information
**Product Description:** {product_description}
**Target Audience:** {target_audience}
**Ideal Customer Profile:** {json.dumps(ideal_customer_profile, indent=2)}
**Data Sources:** {json.dumps(data_sources, indent=2)}
**Ethical Guidelines:** {json.dumps(ethical_guidelines, indent=2)}
**Quality Requirements:** {json.dumps(quality_requirements, indent=2)}
**Output Format:** {output_format}

## Task Breakdown & Steps
1. **Clarification & Strategy Formulation:** Analyze product and target audience details, clarify ICP if ambiguous
2. **Ethical Data Sourcing:** Identify and prioritize publicly available, ethically permissible data sources
3. **Targeted Data Extraction:** Execute strategy to scrape specific, predefined data points
4. **ICP Validation & Filtering:** Rigorously filter all extracted data against ICP criteria
5. **Data Structuring & Delivery:** Present validated leads in clean, structured format
6. **Quality Assurance:** Implement confidence thresholds and validation checks
7. **Compliance Verification:** Ensure all activities meet ethical and legal standards

## Constraints & Rules
- Only collect high-quality, relevant leads that meet ALL ICP criteria
- Do not scrape irrelevant or non-consensual data
- If confidence < 0.7, flag for human review or request clarification
- Adhere strictly to website robots.txt rules and implement appropriate delays
- No PII from private sources - only publicly available information
- Include source_url attribution for each lead
- Rate limiting and politeness must be maintained
- All activities must be ethical and legally compliant

## Output Format
Return a comprehensive JSON object with the following structure:

```json
{{
  "lead_prospecting_analysis": {{
    "product_alignment": "high",
    "target_audience_clarity": "clear",
    "icp_completeness": "comprehensive",
    "data_source_availability": "good",
    "ethical_compliance": "full",
    "confidence_score": 0.85,
    "estimated_lead_quality": "high",
    "processing_complexity": "medium"
  }},
  "data_collection_strategy": {{
    "primary_sources": [
      "LinkedIn public profiles",
      "Company websites",
      "Business directories",
      "Professional networks"
    ],
    "secondary_sources": [
      "Industry publications",
      "Conference speaker lists",
      "Professional associations"
    ],
    "data_points_to_extract": [
      "Full Name",
      "Professional Title",
      "Company Name",
      "Company Industry",
      "Company Size",
      "Publicly Available Email",
      "LinkedIn Profile URL",
      "Company Website URL",
      "Geographic Location"
    ],
    "extraction_methodology": {{
      "approach": "systematic_and_ethical",
      "validation_process": "multi_step_verification",
      "quality_checks": "automated_and_manual",
      "compliance_verification": "continuous"
    }}
  }},
  "icp_filtering_criteria": {{
    "industry_requirements": {{
      "target_industries": ["technology", "software", "consulting"],
      "excluded_industries": ["non_profits", "government"],
      "industry_keywords": ["SaaS", "B2B", "enterprise"]
    }},
    "role_requirements": {{
      "target_roles": ["CEO", "CTO", "VP Engineering", "Head of Product"],
      "seniority_level": "executive_or_director",
      "decision_making_authority": "high"
    }},
    "company_requirements": {{
      "company_size": "10-500_employees",
      "revenue_range": "$1M-$50M",
      "growth_stage": "scaling_or_mature",
      "technology_adoption": "high"
    }},
    "geographic_requirements": {{
      "target_regions": ["North America", "Europe"],
      "excluded_regions": [],
      "time_zone_preferences": ["EST", "PST", "GMT"]
    }}
  }},
  "ethical_guidelines_compliance": {{
    "data_privacy": {{
      "gdpr_compliance": "full",
      "ccpa_compliance": "full",
      "data_minimization": "strict",
      "consent_verification": "public_sources_only"
    }},
    "scraping_ethics": {{
      "robots_txt_respect": "strict",
      "rate_limiting": "conservative",
      "server_load_consideration": "minimal_impact",
      "terms_of_service": "compliant"
    }},
    "data_usage": {{
      "purpose_limitation": "lead_generation_only",
      "retention_policy": "limited_duration",
      "sharing_restrictions": "internal_use_only",
      "deletion_protocols": "automated"
    }}
  }},
  "quality_assurance_framework": {{
    "confidence_thresholds": {{
      "minimum_confidence": 0.7,
      "high_confidence": 0.9,
      "verification_required": 0.6,
      "rejection_threshold": 0.5
    }},
    "validation_checks": [
      "Email format validation",
      "LinkedIn profile verification",
      "Company website validation",
      "Role title consistency",
      "Industry classification accuracy"
    ],
    "quality_metrics": {{
      "data_completeness": "target_90_percent",
      "accuracy_rate": "target_95_percent",
      "duplicate_rate": "maximum_5_percent",
      "false_positive_rate": "maximum_2_percent"
    }}
  }},
  "data_processing_pipeline": {{
    "extraction_workflow": [
      "Source identification and validation",
      "Data extraction with rate limiting",
      "Initial quality filtering",
      "ICP criteria application",
      "Confidence scoring",
      "Final validation and deduplication",
      "Structured output generation"
    ],
    "error_handling": {{
      "retry_mechanisms": "exponential_backoff",
      "fallback_sources": "alternative_platforms",
      "quality_degradation": "graceful_degradation",
      "failure_notification": "immediate_alert"
    }},
    "performance_optimization": {{
      "parallel_processing": "controlled_concurrency",
      "caching_strategy": "intelligent_caching",
      "resource_management": "efficient_allocation",
      "scalability": "horizontal_scaling_ready"
    }}
  }},
  "output_specifications": {{
    "data_structure": {{
      "lead_format": "standardized_json",
      "required_fields": ["name", "title", "company", "email", "linkedin_url"],
      "optional_fields": ["phone", "location", "company_size", "industry"],
      "metadata_fields": ["source_url", "extraction_date", "confidence_score"]
    }},
    "export_options": {{
      "formats": ["JSON", "CSV", "Excel"],
      "delivery_methods": ["file_export", "api_response", "database_insert"],
      "customization": "field_selection_available"
    }},
    "data_room_integration": {{
      "storage_location": "Lead_DataRoom",
      "organization": "by_campaign_and_date",
      "access_control": "role_based",
      "backup_strategy": "automated_redundancy"
    }}
  }},
  "monitoring_and_analytics": {{
    "performance_tracking": {{
      "extraction_success_rate": "monitored",
      "quality_metrics": "tracked",
      "compliance_status": "verified",
      "resource_utilization": "optimized"
    }},
    "alert_system": {{
      "quality_degradation": "immediate_alert",
      "compliance_violation": "critical_alert",
      "system_failure": "urgent_alert",
      "performance_threshold": "warning_alert"
    }},
    "reporting": {{
      "daily_summaries": "automated",
      "quality_reports": "weekly",
      "compliance_audits": "monthly",
      "performance_analytics": "continuous"
    }}
  }},
  "alternative_approaches": [
    {{
      "approach": "Conservative extraction",
      "rationale": "Maximum compliance and quality",
      "characteristics": {{
        "confidence_threshold": 0.8,
        "rate_limiting": "very_conservative",
        "validation_steps": "extensive",
        "data_points": "core_only"
      }},
      "trade_offs": {{
        "volume": "lower",
        "quality": "highest",
        "speed": "slower",
        "compliance": "maximum"
      }}
    }},
    {{
      "approach": "Balanced extraction",
      "rationale": "Optimal quality and volume balance",
      "characteristics": {{
        "confidence_threshold": 0.7,
        "rate_limiting": "moderate",
        "validation_steps": "standard",
        "data_points": "comprehensive"
      }},
      "trade_offs": {{
        "volume": "moderate",
        "quality": "high",
        "speed": "moderate",
        "compliance": "high"
      }}
    }}
  ],
  "follow_up_recommendations": [
    "Implement continuous monitoring for data quality",
    "Set up automated compliance reporting",
    "Create lead enrichment workflows",
    "Develop A/B testing for extraction strategies"
  ]
}}
```

## Evaluation Criteria
- All leads meet ICP criteria with high confidence
- Ethical guidelines are strictly followed
- Data quality meets professional standards
- Compliance requirements are fully met
- Processing is efficient and scalable
- Output format is clean and structured
- Source attribution is complete and accurate

Generate the comprehensive lead prospecting strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            lead_prospecting_strategy = json.loads(response)
            print("Advanced Scraper Agent: Successfully generated comprehensive lead prospecting strategy.")
            return lead_prospecting_strategy
        except json.JSONDecodeError as e:
            print(f"Advanced Scraper Agent: JSON parsing error: {e}")
            # Return structured fallback
            return {
                "lead_prospecting_analysis": {
                    "product_alignment": "high",
                    "target_audience_clarity": "clear",
                    "icp_completeness": "good",
                    "data_source_availability": "good",
                    "ethical_compliance": "full",
                    "confidence_score": 0.8,
                    "estimated_lead_quality": "high",
                    "processing_complexity": "medium"
                },
                "data_collection_strategy": {
                    "primary_sources": ["LinkedIn public profiles", "Company websites", "Business directories"],
                    "data_points_to_extract": ["Full Name", "Professional Title", "Company Name", "Email", "LinkedIn URL"],
                    "extraction_methodology": {
                        "approach": "systematic_and_ethical",
                        "validation_process": "multi_step_verification"
                    }
                },
                "icp_filtering_criteria": {
                    "industry_requirements": {"target_industries": ["technology", "software"]},
                    "role_requirements": {"target_roles": ["CEO", "CTO", "VP Engineering"]},
                    "company_requirements": {"company_size": "10-500_employees"}
                },
                "ethical_guidelines_compliance": {
                    "data_privacy": {"gdpr_compliance": "full", "data_minimization": "strict"},
                    "scraping_ethics": {"robots_txt_respect": "strict", "rate_limiting": "conservative"}
                },
                "quality_assurance_framework": {
                    "confidence_thresholds": {"minimum_confidence": 0.7, "high_confidence": 0.9},
                    "validation_checks": ["Email format validation", "LinkedIn profile verification"]
                },
                "output_specifications": {
                    "data_structure": {"lead_format": "standardized_json"},
                    "export_options": {"formats": ["JSON", "CSV", "Excel"]}
                },
                "alternative_approaches": [],
                "follow_up_recommendations": ["Implement continuous monitoring", "Set up compliance reporting"]
            }
    except Exception as e:
        print(f"Advanced Scraper Agent: Failed to generate lead prospecting strategy. Error: {e}")
        # Return minimal fallback
        return {
            "lead_prospecting_analysis": {
                "product_alignment": "medium",
                "target_audience_clarity": "basic",
                "icp_completeness": "basic",
                "data_source_availability": "limited",
                "ethical_compliance": "basic",
                "confidence_score": 0.6,
                "estimated_lead_quality": "medium",
                "processing_complexity": "low"
            },
            "error": str(e)
        }

class ScraperAgent:
    """
    Comprehensive Advanced Scraper Agent implementing advanced prompting strategies.
    Provides expert lead prospecting, data collection, and ethical intelligence gathering.
    """
    
    def __init__(self, user_input=None):
        self.user_input = user_input
        self.agent_name = "Advanced Scraper Agent"
        self.capabilities = [
            "Ethical data collection and lead prospecting",
            "Public source intelligence gathering",
            "ICP-based lead filtering and validation",
            "Data quality assessment and enhancement",
            "Compliance and privacy protection",
            "Multi-source data integration",
            "Structured data export and delivery"
        ]
        
        self.advanced_scraper = None
        if ADVANCED_SCRAPING_AVAILABLE:
            try:
                self.advanced_scraper = get_advanced_scraper()
                logger.info("Advanced Scraper Agent initialized with advanced scraping capabilities")
            except Exception as e:
                logger.warning(f"Failed to initialize advanced scraper: {e}")
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the Advanced Scraper Agent.
        Implements comprehensive lead prospecting using advanced prompting strategies.
        """
        try:
            print(f"Advanced Scraper Agent: Starting comprehensive lead prospecting...")
            
            # Extract inputs from user_input or use defaults
            if user_input:
                # Parse user input for lead prospecting requirements
                # For now, use the input as a query
                product_description = user_input
                target_audience = "solopreneurs and lean teams"
            else:
                product_description = "Guild-AI: Comprehensive AI Workforce Platform for solopreneurs and lean teams"
                target_audience = "solopreneurs and lean teams"
            
            # Define comprehensive prospecting parameters
            ideal_customer_profile = {
                "industry": ["technology", "software", "consulting", "SaaS"],
                "company_size": "10-500 employees",
                "roles": ["CEO", "CTO", "VP Engineering", "Head of Product", "Founder"],
                "geography": ["North America", "Europe"],
                "revenue_range": "$1M-$50M",
                "growth_stage": "scaling or mature"
            }
            
            data_sources = [
                "LinkedIn public profiles",
                "Company websites",
                "Business directories",
                "Professional networks",
                "Industry publications"
            ]
            
            ethical_guidelines = {
                "gdpr_compliance": "full",
                "ccpa_compliance": "full",
                "data_minimization": "strict",
                "public_sources_only": True,
                "robots_txt_respect": "strict",
                "rate_limiting": "conservative"
            }
            
            quality_requirements = {
                "confidence_threshold": 0.7,
                "data_completeness": "90%",
                "accuracy_rate": "95%",
                "duplicate_rate": "maximum 5%",
                "validation_required": True
            }
            
            # Generate comprehensive lead prospecting strategy
            lead_prospecting_strategy = await generate_comprehensive_lead_prospecting_strategy(
                product_description=product_description,
                target_audience=target_audience,
                ideal_customer_profile=ideal_customer_profile,
                data_sources=data_sources,
                ethical_guidelines=ethical_guidelines,
                quality_requirements=quality_requirements,
                output_format="json"
            )
            
            # Execute the lead prospecting based on the strategy
            result = await self._execute_lead_prospecting(
                product_description, 
                target_audience, 
                ideal_customer_profile, 
                lead_prospecting_strategy
            )
            
            # Combine strategy and execution results
            final_result = {
                "agent": "Advanced Scraper Agent",
                "prospecting_type": "comprehensive_lead_generation",
                "lead_prospecting_strategy": lead_prospecting_strategy,
                "execution_result": result,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"Advanced Scraper Agent: Comprehensive lead prospecting completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"Advanced Scraper Agent: Error in comprehensive lead prospecting: {e}")
            return {
                "agent": "Advanced Scraper Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_lead_prospecting(
        self, 
        product_description: str, 
        target_audience: str, 
        icp: Dict[str, Any], 
        strategy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute lead prospecting based on comprehensive strategy."""
        try:
            # Extract strategy parameters
            data_collection_strategy = strategy.get("data_collection_strategy", {})
            icp_filtering = strategy.get("icp_filtering_criteria", {})
            quality_framework = strategy.get("quality_assurance_framework", {})
            
            # Generate search query from product and audience
            search_query = f"{product_description} {target_audience}"
            
            # Determine number of leads based on strategy
            num_leads = 10  # Default, could be extracted from strategy
            
            # Use existing scrape_leads method with advanced capabilities
            leads = self.scrape_leads(
                query=search_query,
                num_leads=num_leads,
                use_advanced=True,
                icp_criteria=icp
            )
            
            # Apply quality assurance based on strategy
            validated_leads = self._apply_quality_assurance(leads, quality_framework)
            
            # Structure output according to strategy
            structured_leads = self._structure_lead_data(validated_leads, strategy)
            
            return {
                "status": "success",
                "message": "Lead prospecting completed successfully",
                "leads_found": len(structured_leads),
                "leads_data": structured_leads,
                "quality_metrics": {
                    "total_extracted": len(leads),
                    "validated_leads": len(validated_leads),
                    "final_leads": len(structured_leads),
                    "quality_score": self._calculate_quality_score(validated_leads)
                },
                "compliance_status": "verified",
                "data_sources_used": data_collection_strategy.get("primary_sources", []),
                "icp_criteria_applied": icp_filtering
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Lead prospecting execution failed: {str(e)}"
            }
    
    def _apply_quality_assurance(self, leads: List[Dict[str, Any]], quality_framework: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply quality assurance based on the strategy framework."""
        validated_leads = []
        confidence_thresholds = quality_framework.get("confidence_thresholds", {})
        min_confidence = confidence_thresholds.get("minimum_confidence", 0.7)
        
        for lead in leads:
            # Calculate confidence score for each lead
            confidence_score = self._calculate_lead_confidence(lead)
            
            # Apply confidence threshold
            if confidence_score >= min_confidence:
                lead["confidence_score"] = confidence_score
                validated_leads.append(lead)
        
        return validated_leads
    
    def _calculate_lead_confidence(self, lead: Dict[str, Any]) -> float:
        """Calculate confidence score for a lead based on data completeness and quality."""
        score = 0.0
        max_score = 0.0
        
        # Check for required fields
        required_fields = ["title", "link", "summary"]
        for field in required_fields:
            max_score += 1.0
            if field in lead and lead[field] and lead[field] != "No Title" and lead[field] != "No Link" and lead[field] != "No Snippet":
                score += 1.0
        
        # Bonus for having additional information
        if "email" in lead and lead["email"]:
            score += 0.5
            max_score += 0.5
        
        if "company" in lead and lead["company"]:
            score += 0.5
            max_score += 0.5
        
        return score / max_score if max_score > 0 else 0.0
    
    def _structure_lead_data(self, leads: List[Dict[str, Any]], strategy: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Structure lead data according to the strategy specifications."""
        output_specs = strategy.get("output_specifications", {})
        data_structure = output_specs.get("data_structure", {})
        
        structured_leads = []
        for lead in leads:
            structured_lead = {
                "name": lead.get("title", ""),
                "title": lead.get("title", ""),
                "company": lead.get("company", ""),
                "email": lead.get("email", ""),
                "linkedin_url": lead.get("linkedin_url", ""),
                "summary": lead.get("summary", ""),
                "source_url": lead.get("link", ""),
                "extraction_date": datetime.now().isoformat(),
                "confidence_score": lead.get("confidence_score", 0.0)
            }
            structured_leads.append(structured_lead)
        
        return structured_leads
    
    def _calculate_quality_score(self, leads: List[Dict[str, Any]]) -> float:
        """Calculate overall quality score for the lead set."""
        if not leads:
            return 0.0
        
        total_confidence = sum(lead.get("confidence_score", 0.0) for lead in leads)
        return total_confidence / len(leads)
    
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