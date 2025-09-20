import re
from typing import Dict, List, Any, Tuple
import logging

class PIIDetector:
    """Detects and redacts Personally Identifiable Information (PII)"""
    
    # Regex patterns for different types of PII
    PATTERNS = {
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'phone': r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
        'ssn': r'\b\d{3}-?\d{2}-?\d{4}\b',
        'credit_card': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
        'ip_address': r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
        'url': r'https?://[^\s]+',
        'date_of_birth': r'\b(0?[1-9]|1[0-2])[/-](0?[1-9]|[12][0-9]|3[01])[/-](19|20)\d{2}\b',
        'address': r'\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b',
        'zip_code': r'\b\d{5}(?:-\d{4})?\b'
    }
    
    # High-risk patterns that should always be redacted
    HIGH_RISK_PATTERNS = [
        'ssn', 'credit_card', 'date_of_birth'
    ]
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def detect_pii(self, text: str) -> Dict[str, Any]:
        """Detect PII in text and return analysis"""
        detected_pii = {}
        total_matches = 0
        
        for pii_type, pattern in self.PATTERNS.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                detected_pii[pii_type] = {
                    'count': len(matches),
                    'matches': matches[:5],  # Limit to first 5 matches
                    'risk_level': 'HIGH' if pii_type in self.HIGH_RISK_PATTERNS else 'MEDIUM'
                }
                total_matches += len(matches)
        
        return {
            'has_pii': len(detected_pii) > 0,
            'pii_types': detected_pii,
            'total_matches': total_matches,
            'risk_level': self._calculate_risk_level(detected_pii),
            'requires_redaction': total_matches > 0
        }
    
    def _calculate_risk_level(self, detected_pii: Dict[str, Any]) -> str:
        """Calculate overall risk level based on detected PII"""
        high_risk_count = sum(1 for pii in detected_pii.values() if pii['risk_level'] == 'HIGH')
        total_count = len(detected_pii)
        
        if high_risk_count > 0:
            return 'HIGH'
        elif total_count > 3:
            return 'MEDIUM'
        elif total_count > 0:
            return 'LOW'
        else:
            return 'NONE'
    
    def redact_pii(self, text: str, redaction_char: str = '*') -> Tuple[str, Dict[str, Any]]:
        """Redact PII from text and return redacted text with metadata"""
        redacted_text = text
        redaction_log = {}
        
        for pii_type, pattern in self.PATTERNS.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                # Create redaction pattern
                if pii_type == 'email':
                    redacted_text = re.sub(pattern, lambda m: self._redact_email(m.group()), redacted_text, flags=re.IGNORECASE)
                elif pii_type == 'phone':
                    redacted_text = re.sub(pattern, '[REDACTED_PHONE]', redacted_text, flags=re.IGNORECASE)
                elif pii_type == 'ssn':
                    redacted_text = re.sub(pattern, '[REDACTED_SSN]', redacted_text, flags=re.IGNORECASE)
                elif pii_type == 'credit_card':
                    redacted_text = re.sub(pattern, '[REDACTED_CARD]', redacted_text, flags=re.IGNORECASE)
                elif pii_type == 'ip_address':
                    redacted_text = re.sub(pattern, '[REDACTED_IP]', redacted_text, flags=re.IGNORECASE)
                else:
                    redacted_text = re.sub(pattern, f'[REDACTED_{pii_type.upper()}]', redacted_text, flags=re.IGNORECASE)
                
                redaction_log[pii_type] = {
                    'count': len(matches),
                    'redacted': True
                }
        
        return redacted_text, redaction_log
    
    def _redact_email(self, email: str) -> str:
        """Redact email while preserving domain for context"""
        if '@' in email:
            local, domain = email.split('@', 1)
            if len(local) > 2:
                redacted_local = local[0] + '*' * (len(local) - 2) + local[-1]
            else:
                redacted_local = '*' * len(local)
            return f"{redacted_local}@{domain}"
        return '[REDACTED_EMAIL]'
    
    def should_block_request(self, text: str) -> bool:
        """Determine if request should be blocked due to PII risk"""
        pii_analysis = self.detect_pii(text)
        
        # Block if high-risk PII is detected
        if pii_analysis['risk_level'] == 'HIGH':
            return True
        
        # Block if too much PII is detected
        if pii_analysis['total_matches'] > 10:
            return True
        
        return False
    
    def create_safe_prompt(self, system_prompt: str, user_input: str) -> Dict[str, Any]:
        """Create a safe prompt by redacting PII"""
        # Detect PII in user input
        pii_analysis = self.detect_pii(user_input)
        
        if pii_analysis['has_pii']:
            # Redact PII from user input
            redacted_input, redaction_log = self.redact_pii(user_input)
            
            # Add PII warning to system prompt
            safe_system_prompt = system_prompt + """
            
IMPORTANT: The user's input contains potentially sensitive information that has been redacted for privacy. 
Do not attempt to reconstruct or guess the redacted information. 
Focus on answering their question while respecting their privacy.
"""
            
            return {
                'system_prompt': safe_system_prompt,
                'user_input': redacted_input,
                'original_input': user_input,
                'pii_analysis': pii_analysis,
                'redaction_log': redaction_log,
                'requires_redaction': True
            }
        else:
            return {
                'system_prompt': system_prompt,
                'user_input': user_input,
                'pii_analysis': pii_analysis,
                'requires_redaction': False
            }
    
    def log_pii_detection(self, user_id: str, ip_address: str, pii_analysis: Dict[str, Any]):
        """Log PII detection for monitoring"""
        if pii_analysis['has_pii']:
            self.logger.warning(f"PII detected for user {user_id} from {ip_address}: {pii_analysis}")

# Global PII detector instance
pii_detector = PIIDetector()
