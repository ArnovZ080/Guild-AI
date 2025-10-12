import os
from typing import Dict, List
import logging

class EnvironmentValidator:
    """Validates and manages environment variables securely"""
    
    REQUIRED_VARS = [
        'GOOGLE_CLOUD_PROJECT',
        'POSTGRES_PASSWORD',
        # PAYSTACK_SECRET_KEY is optional for now - only needed for payment features
        # 'PAYSTACK_SECRET_KEY',
    ]
    
    SENSITIVE_VARS = [
        'POSTGRES_PASSWORD',
        'PAYSTACK_SECRET_KEY',
        'DATABASE_URL',
        'PAYSTACK_PUBLIC_KEY'
        # DB_SECRET_NAME is just a reference name, not sensitive
    ]
    
    @classmethod
    def validate_environment(cls) -> Dict[str, any]:
        """Validate all required environment variables are present"""
        missing = []
        sensitive_exposed = []
        
        for var in cls.REQUIRED_VARS:
            if not os.getenv(var):
                missing.append(var)
        
        for var in cls.SENSITIVE_VARS:
            if os.getenv(var) and len(os.getenv(var)) < 20:
                sensitive_exposed.append(var)
        
        return {
            'valid': len(missing) == 0,
            'missing_vars': missing,
            'sensitive_exposed': sensitive_exposed
        }
    
    @classmethod
    def sanitize_logs(cls, data: str) -> str:
        """Remove sensitive data from logs"""
        for var in cls.SENSITIVE_VARS:
            if os.getenv(var):
                data = data.replace(os.getenv(var), f"[REDACTED_{var}]")
        return data
    
    @classmethod
    def get_secure_env(cls, key: str, default: str = None) -> str:
        """Get environment variable with security checks"""
        value = os.getenv(key, default)
        
        if key in cls.SENSITIVE_VARS and value:
            # Log that we're accessing a sensitive variable
            logging.info(f"Accessing sensitive environment variable: {key}")
        
        return value
