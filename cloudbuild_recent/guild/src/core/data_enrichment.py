"""
Data Enrichment Module for Guild-AI

This module provides comprehensive data enrichment capabilities for lead data,
including validation, cleaning, and enhancement using open-source libraries.
"""

import logging
import re
from typing import Dict, Any, List, Optional, Union
import pandas as pd
from bs4 import BeautifulSoup
import phonenumbers
from email_validator import validate_email, EmailNotValidError
from faker import Faker
import json

logger = logging.getLogger(__name__)

class DataEnricher:
    """
    Comprehensive data enrichment and validation system.
    """
    
    def __init__(self, enable_synthetic_data: bool = False):
        """
        Initialize the data enricher.
        
        Args:
            enable_synthetic_data: Whether to generate synthetic data for missing fields
        """
        self.fake = Faker()
        self.enable_synthetic_data = enable_synthetic_data
        logger.info(f"DataEnricher initialized (synthetic data: {enable_synthetic_data})")
    
    def enrich_lead(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enrich a single lead with validation and additional data.
        
        Args:
            lead: Raw lead data
            
        Returns:
            Enriched lead data
        """
        try:
            enriched_lead = lead.copy()
            
            # Process phone numbers
            enriched_lead = self._process_phone_numbers(enriched_lead)
            
            # Validate and normalize emails
            enriched_lead = self._process_emails(enriched_lead)
            
            # Clean and standardize text fields
            enriched_lead = self._clean_text_fields(enriched_lead)
            
            # Extract additional data from HTML content
            enriched_lead = self._extract_from_html(enriched_lead)
            
            # Add synthetic data if enabled and missing
            if self.enable_synthetic_data:
                enriched_lead = self._add_synthetic_data(enriched_lead)
            
            # Calculate data quality score
            enriched_lead['data_quality_score'] = self._calculate_quality_score(enriched_lead)
            
            return enriched_lead
            
        except Exception as e:
            logger.error(f"Error enriching lead: {e}")
            return lead
    
    def enrich_leads_batch(self, leads: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Enrich a batch of leads.
        
        Args:
            leads: List of raw lead data
            
        Returns:
            List of enriched lead data
        """
        enriched_leads = []
        
        for lead in leads:
            try:
                enriched_lead = self.enrich_lead(lead)
                enriched_leads.append(enriched_lead)
            except Exception as e:
                logger.error(f"Error enriching lead in batch: {e}")
                enriched_leads.append(lead)  # Return original if enrichment fails
        
        return enriched_leads
    
    def _process_phone_numbers(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """Process and validate phone numbers."""
        phone_fields = ['phone', 'mobile', 'telephone', 'contact_number']
        
        for field in phone_fields:
            if field in lead and lead[field]:
                try:
                    phone = str(lead[field]).strip()
                    
                    # Try to parse as US number first, then international
                    for country in ['US', None]:
                        try:
                            parsed = phonenumbers.parse(phone, country)
                            if phonenumbers.is_valid_number(parsed):
                                lead[f'{field}_formatted'] = phonenumbers.format_number(
                                    parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL
                                )
                                lead[f'{field}_valid'] = True
                                lead[f'{field}_country'] = phonenumbers.region_code_for_number(parsed)
                                break
                        except:
                            continue
                    else:
                        lead[f'{field}_valid'] = False
                        lead[f'{field}_formatted'] = phone
                        
                except Exception as e:
                    logger.warning(f"Error processing phone number {lead.get(field)}: {e}")
                    lead[f'{field}_valid'] = False
        
        return lead
    
    def _process_emails(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and normalize email addresses."""
        email_fields = ['email', 'email_address', 'contact_email']
        
        for field in email_fields:
            if field in lead and lead[field]:
                try:
                    email = str(lead[field]).strip().lower()
                    
                    # Basic email format validation
                    if re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                        try:
                            valid = validate_email(email)
                            lead[f'{field}_valid'] = True
                            lead[f'{field}_normalized'] = valid.email
                            lead[f'{field}_domain'] = valid.domain
                        except EmailNotValidError:
                            lead[f'{field}_valid'] = False
                            lead[f'{field}_normalized'] = email
                    else:
                        lead[f'{field}_valid'] = False
                        lead[f'{field}_normalized'] = email
                        
                except Exception as e:
                    logger.warning(f"Error processing email {lead.get(field)}: {e}")
                    lead[f'{field}_valid'] = False
        
        return lead
    
    def _clean_text_fields(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and standardize text fields."""
        text_fields = ['name', 'title', 'company', 'description', 'location', 'address']
        
        for field in text_fields:
            if field in lead and lead[field]:
                # Convert to string and clean
                text = str(lead[field]).strip()
                
                # Remove extra whitespace
                text = ' '.join(text.split())
                
                # Remove HTML tags if present
                if '<' in text and '>' in text:
                    soup = BeautifulSoup(text, 'html.parser')
                    text = soup.get_text()
                    text = ' '.join(text.split())
                
                # Capitalize names properly
                if field in ['name']:
                    text = text.title()
                
                # Capitalize titles properly
                elif field in ['title']:
                    text = self._capitalize_title(text)
                
                lead[field] = text
        
        return lead
    
    def _capitalize_title(self, title: str) -> str:
        """Properly capitalize job titles."""
        # Common words that should remain lowercase
        lowercase_words = {'of', 'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by'}
        
        words = title.split()
        capitalized_words = []
        
        for i, word in enumerate(words):
            if i == 0 or word.lower() not in lowercase_words:
                capitalized_words.append(word.capitalize())
            else:
                capitalized_words.append(word.lower())
        
        return ' '.join(capitalized_words)
    
    def _extract_from_html(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """Extract additional data from HTML content."""
        html_fields = ['description', 'bio', 'summary', 'content']
        
        for field in html_fields:
            if field in lead and lead[field] and '<' in str(lead[field]):
                try:
                    soup = BeautifulSoup(lead[field], 'html.parser')
                    
                    # Extract links
                    links = [a.get('href') for a in soup.find_all('a', href=True)]
                    if links:
                        lead[f'{field}_links'] = links
                    
                    # Extract social media links
                    social_links = {}
                    for link in links:
                        if 'linkedin.com' in link:
                            social_links['linkedin'] = link
                        elif 'twitter.com' in link or 'x.com' in link:
                            social_links['twitter'] = link
                        elif 'facebook.com' in link:
                            social_links['facebook'] = link
                        elif 'instagram.com' in link:
                            social_links['instagram'] = link
                    
                    if social_links:
                        lead['social_links'] = social_links
                    
                    # Extract clean text
                    lead[f'{field}_clean'] = soup.get_text()
                    lead[f'{field}_clean'] = ' '.join(lead[f'{field}_clean'].split())
                    
                except Exception as e:
                    logger.warning(f"Error extracting from HTML in field {field}: {e}")
        
        return lead
    
    def _add_synthetic_data(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """Add synthetic data for missing fields (development/testing only)."""
        # Add synthetic email if missing
        if not lead.get('email') and lead.get('name'):
            name = lead['name'].lower().replace(' ', '.')
            lead['email'] = f"{name}@example.com"
            lead['email_synthetic'] = True
        
        # Add synthetic phone if missing
        if not lead.get('phone'):
            lead['phone'] = self.fake.phone_number()
            lead['phone_synthetic'] = True
        
        # Add synthetic company if missing
        if not lead.get('company') and lead.get('name'):
            lead['company'] = f"{lead['name']} Consulting"
            lead['company_synthetic'] = True
        
        # Add synthetic location if missing
        if not lead.get('location'):
            lead['location'] = self.fake.city() + ', ' + self.fake.state()
            lead['location_synthetic'] = True
        
        return lead
    
    def _calculate_quality_score(self, lead: Dict[str, Any]) -> float:
        """Calculate a data quality score for the lead."""
        score = 0.0
        max_score = 0.0
        
        # Required fields
        required_fields = ['name', 'email', 'phone', 'company']
        for field in required_fields:
            max_score += 1.0
            if field in lead and lead[field]:
                score += 1.0
        
        # Optional fields
        optional_fields = ['title', 'location', 'description']
        for field in optional_fields:
            max_score += 0.5
            if field in lead and lead[field]:
                score += 0.5
        
        # Validation bonuses
        if lead.get('email_valid'):
            score += 0.5
            max_score += 0.5
        
        if lead.get('phone_valid'):
            score += 0.5
            max_score += 0.5
        
        # Social links bonus
        if lead.get('social_links'):
            score += 0.5
            max_score += 0.5
        
        return score / max_score if max_score > 0 else 0.0
    
    def validate_lead(self, lead: Dict[str, Any], min_quality_score: float = 0.6) -> Dict[str, Any]:
        """
        Validate a lead against quality criteria.
        
        Args:
            lead: Lead data to validate
            min_quality_score: Minimum quality score required
            
        Returns:
            Validation result with status and details
        """
        quality_score = lead.get('data_quality_score', 0.0)
        
        validation_result = {
            'is_valid': quality_score >= min_quality_score,
            'quality_score': quality_score,
            'min_required': min_quality_score,
            'missing_fields': [],
            'invalid_fields': [],
            'recommendations': []
        }
        
        # Check for missing required fields
        required_fields = ['name', 'email', 'phone']
        for field in required_fields:
            if not lead.get(field):
                validation_result['missing_fields'].append(field)
        
        # Check for invalid fields
        if lead.get('email') and not lead.get('email_valid', True):
            validation_result['invalid_fields'].append('email')
        
        if lead.get('phone') and not lead.get('phone_valid', True):
            validation_result['invalid_fields'].append('phone')
        
        # Generate recommendations
        if validation_result['missing_fields']:
            validation_result['recommendations'].append(
                f"Add missing fields: {', '.join(validation_result['missing_fields'])}"
            )
        
        if validation_result['invalid_fields']:
            validation_result['recommendations'].append(
                f"Fix invalid fields: {', '.join(validation_result['invalid_fields'])}"
            )
        
        if quality_score < min_quality_score:
            validation_result['recommendations'].append(
                f"Improve data quality (current: {quality_score:.2f}, required: {min_quality_score})"
            )
        
        return validation_result
    
    def export_enriched_data(self, leads: List[Dict[str, Any]], format: str = 'json', output_path: Optional[str] = None) -> str:
        """
        Export enriched lead data to a file.
        
        Args:
            leads: List of enriched lead data
            format: Export format ('json', 'csv', 'excel')
            output_path: Optional output path
            
        Returns:
            Path to the exported file
        """
        import tempfile
        import os
        
        if not output_path:
            temp_dir = tempfile.mkdtemp(prefix="guild_enriched_leads_")
            output_path = os.path.join(temp_dir, f"enriched_leads.{format}")
        
        if format == 'json':
            with open(output_path, 'w') as f:
                json.dump(leads, f, indent=2)
        elif format == 'csv':
            df = pd.DataFrame(leads)
            df.to_csv(output_path, index=False)
        elif format == 'excel':
            df = pd.DataFrame(leads)
            df.to_excel(output_path, index=False, engine='openpyxl')
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        logger.info(f"Exported {len(leads)} enriched leads to {output_path}")
        return output_path

# Convenience functions
def get_data_enricher(enable_synthetic_data: bool = False) -> DataEnricher:
    """Get an instance of the data enricher."""
    return DataEnricher(enable_synthetic_data=enable_synthetic_data)

def enrich_lead_data(lead: Dict[str, Any], enable_synthetic_data: bool = False) -> Dict[str, Any]:
    """Enrich a single lead."""
    enricher = get_data_enricher(enable_synthetic_data)
    return enricher.enrich_lead(lead)

def enrich_leads_batch(leads: List[Dict[str, Any]], enable_synthetic_data: bool = False) -> List[Dict[str, Any]]:
    """Enrich a batch of leads."""
    enricher = get_data_enricher(enable_synthetic_data)
    return enricher.enrich_leads_batch(leads)
