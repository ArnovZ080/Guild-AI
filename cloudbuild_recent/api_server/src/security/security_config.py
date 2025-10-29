"""
Security configuration for Guild AI
Centralized security settings and policies
"""

import os
from typing import Dict, List, Any
from enum import Enum

class SecurityLevel(Enum):
    """Security levels for different environments"""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

class SecurityConfig:
    """Centralized security configuration"""
    
    def __init__(self):
        self.environment = os.getenv('ENVIRONMENT', 'development')
        self.security_level = SecurityLevel(self.environment)
        
        # Rate limiting configuration
        self.rate_limits = {
            'default': {'requests': 100, 'window_minutes': 60},
            'auth': {'requests': 10, 'window_minutes': 15},
            'subscription': {'requests': 20, 'window_minutes': 60},
            'credits': {'requests': 30, 'window_minutes': 60},
            'chat': {'requests': 200, 'window_minutes': 60}
        }
        
        # Input validation rules
        self.input_validation = {
            'max_length': 50000,
            'max_file_size': 10 * 1024 * 1024,  # 10MB
            'allowed_file_types': ['.txt', '.pdf', '.docx', '.md'],
            'blocked_extensions': ['.exe', '.bat', '.sh', '.ps1', '.cmd']
        }
        
        # PII detection thresholds
        self.pii_thresholds = {
            'high_risk_count': 3,
            'max_pii_matches': 10,
            'block_on_high_risk': True
        }
        
        # Security headers
        self.security_headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        }
        
        # CORS configuration
        self.cors_config = {
            'allowed_origins': self._get_allowed_origins(),
            'allowed_methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            'allowed_headers': ['*'],
            'allow_credentials': True
        }
        
        # Trusted hosts
        self.trusted_hosts = self._get_trusted_hosts()
        
        # Logging configuration
        self.logging_config = {
            'log_level': 'INFO' if self.security_level == SecurityLevel.PRODUCTION else 'DEBUG',
            'log_file': 'logs/security.log',
            'max_log_size': 10 * 1024 * 1024,  # 10MB
            'backup_count': 5
        }
        
        # Encryption settings
        self.encryption = {
            'algorithm': 'AES-256-GCM',
            'key_rotation_days': 90,
            'require_encryption_at_rest': True
        }
        
        # Session security
        self.session_security = {
            'max_age_seconds': 3600,  # 1 hour
            'secure_cookies': self.security_level == SecurityLevel.PRODUCTION,
            'httponly_cookies': True,
            'samesite': 'strict'
        }
    
    def _get_allowed_origins(self) -> List[str]:
        """Get allowed CORS origins based on environment"""
        if self.security_level == SecurityLevel.PRODUCTION:
            return [
                'https://yourdomain.com',
                'https://www.yourdomain.com'
            ]
        elif self.security_level == SecurityLevel.STAGING:
            return [
                'https://staging.yourdomain.com',
                'http://localhost:3000'
            ]
        else:  # Development
            return [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://127.0.0.1:3000'
            ]
    
    def _get_trusted_hosts(self) -> List[str]:
        """Get trusted hosts based on environment"""
        if self.security_level == SecurityLevel.PRODUCTION:
            return [
                'yourdomain.com',
                'www.yourdomain.com',
                'api.yourdomain.com'
            ]
        elif self.security_level == SecurityLevel.STAGING:
            return [
                'staging.yourdomain.com',
                'localhost',
                '127.0.0.1'
            ]
        else:  # Development
            return [
                'localhost',
                '127.0.0.1',
                '*.local'
            ]
    
    def get_rate_limit(self, endpoint_type: str) -> Dict[str, int]:
        """Get rate limit configuration for endpoint type"""
        return self.rate_limits.get(endpoint_type, self.rate_limits['default'])
    
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.security_level == SecurityLevel.DEVELOPMENT
    
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.security_level == SecurityLevel.PRODUCTION
    
    def get_security_policy(self) -> Dict[str, Any]:
        """Get comprehensive security policy"""
        return {
            'environment': self.environment,
            'security_level': self.security_level.value,
            'rate_limits': self.rate_limits,
            'input_validation': self.input_validation,
            'pii_thresholds': self.pii_thresholds,
            'trusted_hosts': self.trusted_hosts,
            'logging': self.logging_config,
            'encryption': self.encryption,
            'session_security': self.session_security
        }

# Global security configuration
security_config = SecurityConfig()

# Security policies for different user types
USER_SECURITY_POLICIES = {
    'free': {
        'max_requests_per_hour': 100,
        'max_file_uploads_per_day': 5,
        'max_concurrent_sessions': 1,
        'require_2fa': False
    },
    'starter': {
        'max_requests_per_hour': 500,
        'max_file_uploads_per_day': 20,
        'max_concurrent_sessions': 3,
        'require_2fa': False
    },
    'professional': {
        'max_requests_per_hour': 2000,
        'max_file_uploads_per_day': 100,
        'max_concurrent_sessions': 5,
        'require_2fa': True
    },
    'enterprise': {
        'max_requests_per_hour': 10000,
        'max_file_uploads_per_day': 1000,
        'max_concurrent_sessions': 10,
        'require_2fa': True
    }
}

# Security incident severity levels
INCIDENT_SEVERITY = {
    'LOW': {
        'description': 'Minor security event',
        'response_time': '24 hours',
        'escalation': False
    },
    'MEDIUM': {
        'description': 'Moderate security concern',
        'response_time': '4 hours',
        'escalation': True
    },
    'HIGH': {
        'description': 'Serious security incident',
        'response_time': '1 hour',
        'escalation': True
    },
    'CRITICAL': {
        'description': 'Critical security breach',
        'response_time': '15 minutes',
        'escalation': True
    }
}

# Security monitoring thresholds
MONITORING_THRESHOLDS = {
    'failed_auth_attempts': 5,  # Alert after 5 failed attempts
    'rate_limit_hits': 10,      # Alert after 10 rate limit hits
    'pii_detections': 3,        # Alert after 3 PII detections
    'injection_attempts': 2,    # Alert after 2 injection attempts
    'unusual_activity': 20      # Alert after 20 unusual activities
}
