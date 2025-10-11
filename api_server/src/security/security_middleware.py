from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import time
import logging

from .input_sanitizer import InputSanitizer
from .rate_limiter import rate_limiter
from .secure_logger import secure_logger
from .env_validator import EnvironmentValidator

class SecurityMiddleware(BaseHTTPMiddleware):
    """Comprehensive security middleware for Guild AI"""
    
    def __init__(self, app):
        super().__init__(app)
        self.logger = logging.getLogger(__name__)
        
        # Validate environment on startup
        env_check = EnvironmentValidator.validate_environment()
        if not env_check['valid']:
            self.logger.error(f"Environment validation failed: {env_check}")
            raise RuntimeError("Environment validation failed")
        
        if env_check['sensitive_exposed']:
            self.logger.warning(f"Sensitive variables may be exposed: {env_check['sensitive_exposed']}")
    
    async def dispatch(self, request: Request, call_next: Callable):
        """Process request through security middleware"""
        start_time = time.time()
        
        # Get client information
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Rate limiting
        if rate_limiter.is_rate_limited(client_ip):
            secure_logger.log_rate_limit_hit(
                client_ip, 
                str(request.url), 
                100  # Default limit
            )
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "retry_after": rate_limiter.get_reset_time(client_ip).isoformat() if rate_limiter.get_reset_time(client_ip) else None
                }
            )
        
        # Input sanitization for POST/PUT requests
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                # Read request body
                body = await request.body()
                if body:
                    body_str = body.decode('utf-8')
                    
                    # Check for prompt injection
                    detection_result = InputSanitizer.detect_injection_attempt(body_str)
                    
                    if detection_result['is_suspicious']:
                        secure_logger.log_prompt_injection_attempt(
                            "anonymous",  # We don't have user_id yet
                            client_ip,
                            body_str,
                            detection_result
                        )
                        
                        if detection_result['severity'] == 'HIGH':
                            return JSONResponse(
                                status_code=400,
                                content={
                                    "error": "Suspicious input detected",
                                    "message": "Your request contains potentially harmful content. Please rephrase your question."
                                }
                            )
                    
                    # Sanitize input
                    sanitized_body = InputSanitizer.sanitize_input(body_str)
                    
                    # Create new request with sanitized body
                    if sanitized_body != body_str:
                        # We need to create a new request with sanitized body
                        # This is a simplified approach - in production you'd want more sophisticated handling
                        pass
                        
            except Exception as e:
                self.logger.error(f"Error in input sanitization: {e}")
                # Continue with request but log the error
        
        # Process request
        try:
            response = await call_next(request)
            
            # Log successful API access
            secure_logger.log_api_access(
                str(request.url),
                "anonymous",  # Would be extracted from JWT in production
                client_ip,
                request.method,
                response.status_code if hasattr(response, 'status_code') else 200
            )
            
            return response
            
        except HTTPException as e:
            # Log failed requests
            secure_logger.log_api_access(
                str(request.url),
                "anonymous",
                client_ip,
                request.method,
                e.status_code
            )
            raise e
            
        except Exception as e:
            # Log unexpected errors
            secure_logger.log_security_incident(
                "unexpected_error",
                "MEDIUM",
                {
                    "endpoint": str(request.url),
                    "method": request.method,
                    "error": str(e),
                    "client_ip": client_ip
                }
            )
            raise e
        
        finally:
            # Log request duration
            duration = time.time() - start_time
            if duration > 5.0:  # Log slow requests
                self.logger.warning(f"Slow request: {request.url} took {duration:.2f}s")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # More permissive CSP for Swagger UI to work (allows CDN resources)
        # Swagger UI needs to load from cdn.jsdelivr.net
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "img-src 'self' data: https://cdn.jsdelivr.net; "
            "font-src 'self' data: https://cdn.jsdelivr.net"
        )
        
        return response
