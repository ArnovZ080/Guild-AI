from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Dict, Optional
import asyncio
import logging

class RateLimiter:
    """Rate limiting implementation for API endpoints"""
    
    def __init__(self):
        self.requests = defaultdict(lambda: deque())
        self.blocks = defaultdict(lambda: datetime.min)
        self.logger = logging.getLogger(__name__)
    
    def is_rate_limited(self, identifier: str, max_requests: int = 1000, window_minutes: int = 60) -> bool:
        """Check if identifier is rate limited"""
        now = datetime.now()
        
        # Check if currently blocked
        if now < self.blocks[identifier]:
            self.logger.warning(f"Rate limit blocked: {identifier}")
            return True
        
        # Clean old requests
        cutoff = now - timedelta(minutes=window_minutes)
        while self.requests[identifier] and self.requests[identifier][0] < cutoff:
            self.requests[identifier].popleft()
        
        # Check if over limit
        if len(self.requests[identifier]) >= max_requests:
            # Block for 5 minutes (reduced from 15)
            self.blocks[identifier] = now + timedelta(minutes=5)
            self.logger.warning(f"Rate limit exceeded for {identifier}, blocking for 5 minutes")
            return True
        
        # Record this request
        self.requests[identifier].append(now)
        return False
    
    def get_remaining_requests(self, identifier: str, max_requests: int = 1000) -> int:
        """Get remaining requests for identifier"""
        now = datetime.now()
        cutoff = now - timedelta(minutes=60)
        
        # Clean old requests
        while self.requests[identifier] and self.requests[identifier][0] < cutoff:
            self.requests[identifier].popleft()
        
        return max(0, max_requests - len(self.requests[identifier]))
    
    def get_reset_time(self, identifier: str) -> Optional[datetime]:
        """Get when the rate limit resets for an identifier"""
        if identifier in self.blocks and datetime.now() < self.blocks[identifier]:
            return self.blocks[identifier]
        return None
    
    def clear_rate_limit(self, identifier: str):
        """Clear rate limit for an identifier (admin function)"""
        if identifier in self.requests:
            del self.requests[identifier]
        if identifier in self.blocks:
            del self.blocks[identifier]
        self.logger.info(f"Rate limit cleared for {identifier}")

# Global rate limiter instance
rate_limiter = RateLimiter()

# Rate limit decorator
def rate_limit(max_requests: int = 100, window_minutes: int = 60):
    """Decorator for rate limiting endpoints"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract identifier from request (IP address or user ID)
            request = kwargs.get('request') or args[0] if args else None
            if request:
                identifier = getattr(request.client, 'host', 'unknown')
            else:
                identifier = 'unknown'
            
            if rate_limiter.is_rate_limited(identifier, max_requests, window_minutes):
                from fastapi import HTTPException
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "Rate limit exceeded",
                        "retry_after": rate_limiter.get_reset_time(identifier).isoformat() if rate_limiter.get_reset_time(identifier) else None
                    }
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
