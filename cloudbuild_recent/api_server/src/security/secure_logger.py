import logging
import json
from datetime import datetime
from typing import Dict, Any
import hashlib
import os

class SecureLogger:
    """Secure logging implementation that redacts sensitive information"""
    
    def __init__(self):
        # Create logs directory if it doesn't exist
        os.makedirs('logs', exist_ok=True)
        
        self.logger = logging.getLogger('guild_ai_secure')
        self.logger.setLevel(logging.INFO)
        
        # Create secure formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # File handler for security events
        file_handler = logging.FileHandler('logs/security.log')
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)
        
        # Console handler for critical events
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.WARNING)
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
    
    def _redact_sensitive_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Redact sensitive information from log data"""
        sensitive_keys = [
            'password', 'token', 'key', 'secret', 'credential',
            'ssn', 'social_security', 'credit_card', 'cvv',
            'api_key', 'access_token', 'refresh_token'
        ]
        
        redacted_data = {}
        for key, value in data.items():
            if any(sensitive in key.lower() for sensitive in sensitive_keys):
                redacted_data[key] = '[REDACTED]'
            elif isinstance(value, dict):
                redacted_data[key] = self._redact_sensitive_data(value)
            elif isinstance(value, str) and len(value) > 50:
                # Redact long strings that might be tokens
                redacted_data[key] = value[:10] + '...[REDACTED]'
            else:
                redacted_data[key] = value
        
        return redacted_data
    
    def log_auth_event(self, event_type: str, user_id: str, ip_address: str, success: bool, details: Dict = None):
        """Log authentication events"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'user_id': user_id,
            'ip_address': ip_address,
            'success': success,
            'details': self._redact_sensitive_data(details or {})
        }
        
        self.logger.info(f"AUTH_EVENT: {json.dumps(log_data)}")
    
    def log_security_incident(self, incident_type: str, severity: str, details: Dict):
        """Log security incidents"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'incident_type': incident_type,
            'severity': severity,
            'details': self._redact_sensitive_data(details)
        }
        
        if severity == 'HIGH':
            self.logger.error(f"SECURITY_INCIDENT: {json.dumps(log_data)}")
        else:
            self.logger.warning(f"SECURITY_INCIDENT: {json.dumps(log_data)}")
    
    def log_api_access(self, endpoint: str, user_id: str, ip_address: str, method: str, status_code: int = None):
        """Log API access"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'endpoint': endpoint,
            'user_id': user_id,
            'ip_address': ip_address,
            'method': method,
            'status_code': status_code
        }
        
        self.logger.info(f"API_ACCESS: {json.dumps(log_data)}")
    
    def log_prompt_injection_attempt(self, user_id: str, ip_address: str, input_text: str, detection_result: Dict):
        """Log prompt injection attempts"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'user_id': user_id,
            'ip_address': ip_address,
            'input_length': len(input_text),
            'detection_result': detection_result,
            'input_hash': hashlib.sha256(input_text.encode()).hexdigest()[:16]  # Partial hash for correlation
        }
        
        self.logger.warning(f"PROMPT_INJECTION: {json.dumps(log_data)}")
    
    def log_rate_limit_hit(self, identifier: str, endpoint: str, limit: int):
        """Log rate limit hits"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'identifier': identifier,
            'endpoint': endpoint,
            'limit': limit
        }
        
        self.logger.warning(f"RATE_LIMIT_HIT: {json.dumps(log_data)}")
    
    def log_credit_usage(self, user_id: str, action_type: str, credits_used: int, remaining_credits: int):
        """Log credit usage for monitoring"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'user_id': user_id,
            'action_type': action_type,
            'credits_used': credits_used,
            'remaining_credits': remaining_credits
        }
        
        self.logger.info(f"CREDIT_USAGE: {json.dumps(log_data)}")
    
    def log_subscription_event(self, user_id: str, event_type: str, plan: str, amount: float = None):
        """Log subscription events"""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'user_id': user_id,
            'event_type': event_type,
            'plan': plan,
            'amount': amount
        }
        
        self.logger.info(f"SUBSCRIPTION_EVENT: {json.dumps(log_data)}")

# Global secure logger instance
secure_logger = SecureLogger()
