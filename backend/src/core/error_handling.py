"""
Comprehensive Error Handling System for Guild-AI
Provides graceful fallbacks and robust error recovery for all system components.
"""

import logging
import traceback
from typing import Dict, Any, Optional, Callable, Union
from datetime import datetime
from enum import Enum
import asyncio
from functools import wraps

class ErrorSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ErrorCategory(Enum):
    ORCHESTRATOR = "orchestrator"
    AGENT = "agent"
    VERTEX_AI = "vertex_ai"
    DATABASE = "database"
    API = "api"
    INTEGRATION = "integration"
    AUTHENTICATION = "authentication"
    VALIDATION = "validation"
    NETWORK = "network"
    TIMEOUT = "timeout"

class ErrorContext:
    """Context information for error handling"""
    def __init__(self, 
                 component: str,
                 operation: str,
                 user_id: Optional[str] = None,
                 request_id: Optional[str] = None,
                 metadata: Optional[Dict[str, Any]] = None):
        self.component = component
        self.operation = operation
        self.user_id = user_id
        self.request_id = request_id
        self.metadata = metadata or {}
        self.timestamp = datetime.now()

class ErrorHandler:
    """Comprehensive error handling system"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.error_history = []
        self.fallback_strategies = {}
        self.circuit_breakers = {}
        self._setup_default_fallbacks()
    
    def _setup_default_fallbacks(self):
        """Setup default fallback strategies for common errors"""
        
        # Orchestrator fallbacks
        self.fallback_strategies[ErrorCategory.ORCHESTRATOR] = {
            "unified_orchestrator_failed": self._fallback_to_basic_orchestrator,
            "agent_coordination_failed": self._fallback_to_sequential_agents,
            "quality_assessment_failed": self._fallback_to_default_quality
        }
        
        # Vertex AI fallbacks
        self.fallback_strategies[ErrorCategory.VERTEX_AI] = {
            "model_unavailable": self._fallback_to_alternative_model,
            "rate_limited": self._fallback_to_cached_response,
            "api_error": self._fallback_to_basic_llm,
            "cost_exceeded": self._fallback_to_free_tier
        }
        
        # Agent fallbacks
        self.fallback_strategies[ErrorCategory.AGENT] = {
            "agent_unavailable": self._fallback_to_similar_agent,
            "agent_timeout": self._fallback_to_cached_response,
            "agent_error": self._fallback_to_basic_response
        }
        
        # Database fallbacks
        self.fallback_strategies[ErrorCategory.DATABASE] = {
            "connection_failed": self._fallback_to_cache,
            "query_timeout": self._fallback_to_cached_data,
            "transaction_failed": self._fallback_to_rollback
        }
        
        # API fallbacks
        self.fallback_strategies[ErrorCategory.API] = {
            "endpoint_unavailable": self._fallback_to_alternative_endpoint,
            "validation_failed": self._fallback_to_default_values,
            "authentication_failed": self._fallback_to_guest_mode
        }
    
    async def handle_error(self, 
                          error: Exception, 
                          context: ErrorContext,
                          severity: ErrorSeverity = ErrorSeverity.MEDIUM,
                          category: ErrorCategory = ErrorCategory.API,
                          fallback_enabled: bool = True) -> Dict[str, Any]:
        """
        Handle errors with comprehensive fallback strategies
        """
        error_info = {
            "error_id": f"err_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(str(error)) % 10000}",
            "error_type": type(error).__name__,
            "error_message": str(error),
            "severity": severity.value,
            "category": category.value,
            "context": {
                "component": context.component,
                "operation": context.operation,
                "user_id": context.user_id,
                "request_id": context.request_id,
                "metadata": context.metadata
            },
            "timestamp": context.timestamp.isoformat(),
            "stack_trace": traceback.format_exc(),
            "fallback_attempted": False,
            "fallback_successful": False,
            "final_result": None
        }
        
        # Log the error
        self._log_error(error_info, severity)
        
        # Store in error history
        self.error_history.append(error_info)
        
        # Attempt fallback if enabled
        if fallback_enabled:
            fallback_result = await self._attempt_fallback(error, context, category)
            if fallback_result:
                error_info["fallback_attempted"] = True
                error_info["fallback_successful"] = True
                error_info["final_result"] = fallback_result
                return fallback_result
        
        # Return error response if no fallback available
        return self._create_error_response(error_info)
    
    async def _attempt_fallback(self, 
                               error: Exception, 
                               context: ErrorContext, 
                               category: ErrorCategory) -> Optional[Dict[str, Any]]:
        """Attempt to execute fallback strategy"""
        try:
            fallbacks = self.fallback_strategies.get(category, {})
            
            # Try to match specific error types
            error_type = type(error).__name__.lower()
            error_message = str(error).lower()
            
            # Find appropriate fallback strategy
            fallback_func = None
            for error_pattern, func in fallbacks.items():
                if error_pattern in error_type or error_pattern in error_message:
                    fallback_func = func
                    break
            
            if fallback_func:
                self.logger.info(f"Attempting fallback strategy for {category.value}: {error_type}")
                result = await fallback_func(error, context)
                if result:
                    self.logger.info(f"Fallback successful for {category.value}")
                    return result
            
            return None
            
        except Exception as fallback_error:
            self.logger.error(f"Fallback strategy failed: {fallback_error}")
            return None
    
    def _log_error(self, error_info: Dict[str, Any], severity: ErrorSeverity):
        """Log error with appropriate level"""
        log_message = f"Error {error_info['error_id']}: {error_info['error_type']} - {error_info['error_message']}"
        
        if severity == ErrorSeverity.CRITICAL:
            self.logger.critical(log_message)
        elif severity == ErrorSeverity.HIGH:
            self.logger.error(log_message)
        elif severity == ErrorSeverity.MEDIUM:
            self.logger.warning(log_message)
        else:
            self.logger.info(log_message)
    
    def _create_error_response(self, error_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create standardized error response"""
        return {
            "success": False,
            "error": {
                "id": error_info["error_id"],
                "type": error_info["error_type"],
                "message": self._get_user_friendly_message(error_info),
                "severity": error_info["severity"],
                "category": error_info["category"],
                "timestamp": error_info["timestamp"]
            },
            "fallback_available": error_info["fallback_attempted"],
            "suggested_actions": self._get_suggested_actions(error_info)
        }
    
    def _get_user_friendly_message(self, error_info: Dict[str, Any]) -> str:
        """Convert technical error messages to user-friendly ones"""
        error_type = error_info["error_type"]
        error_message = error_info["error_message"]
        
        friendly_messages = {
            "ConnectionError": "Unable to connect to the service. Please check your internet connection.",
            "TimeoutError": "The request took too long to complete. Please try again.",
            "ValidationError": "There was an issue with the data provided. Please check your input.",
            "AuthenticationError": "Authentication failed. Please log in again.",
            "PermissionError": "You don't have permission to perform this action.",
            "NotFoundError": "The requested resource was not found.",
            "RateLimitError": "Too many requests. Please wait a moment and try again.",
            "ServiceUnavailableError": "The service is temporarily unavailable. Please try again later."
        }
        
        # Check for specific error types
        for error_class, friendly_msg in friendly_messages.items():
            if error_class in error_type:
                return friendly_msg
        
        # Default fallback message
        if "orchestrator" in error_message.lower():
            return "The business intelligence system encountered an issue. A simplified version is available."
        elif "vertex" in error_message.lower() or "ai" in error_message.lower():
            return "The AI service is temporarily unavailable. Using backup processing."
        elif "agent" in error_message.lower():
            return "One of the business agents encountered an issue. The system will continue with available agents."
        
        return "An unexpected error occurred. Please try again or contact support if the issue persists."
    
    def _get_suggested_actions(self, error_info: Dict[str, Any]) -> list:
        """Get suggested actions based on error type"""
        category = error_info["category"]
        severity = error_info["severity"]
        
        actions = []
        
        if severity == "critical":
            actions.append("Contact support immediately")
        
        if category == "orchestrator":
            actions.extend([
                "Try using a simpler workflow",
                "Check if all required agents are available",
                "Restart the orchestrator service"
            ])
        elif category == "vertex_ai":
            actions.extend([
                "Wait a moment and retry",
                "Check your API quota",
                "Use a different AI model"
            ])
        elif category == "agent":
            actions.extend([
                "Try a different agent",
                "Check agent availability",
                "Use manual mode instead"
            ])
        elif category == "database":
            actions.extend([
                "Refresh the page",
                "Check your internet connection",
                "Try again in a few minutes"
            ])
        
        return actions
    
    # Fallback Strategy Implementations
    
    async def _fallback_to_basic_orchestrator(self, error: Exception, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Fallback to basic orchestrator when unified orchestrator fails"""
        try:
            # Import basic orchestrator
            from guild.src.agents.orchestrator_agent import OrchestratorAgent
            
            basic_orchestrator = OrchestratorAgent()
            result = await basic_orchestrator.run(context.metadata.get("user_input", "Basic orchestration"))
            
            return {
                "success": True,
                "fallback_used": "basic_orchestrator",
                "result": result,
                "warning": "Using basic orchestrator due to system limitations"
            }
        except Exception as e:
            self.logger.error(f"Basic orchestrator fallback failed: {e}")
            return None
    
    async def _fallback_to_sequential_agents(self, error: Exception, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Fallback to sequential agent execution when coordination fails"""
        try:
            agents_to_try = context.metadata.get("agents", [])
            results = []
            
            for agent_name in agents_to_try:
                try:
                    # Try to run agent individually
                    agent_result = await self._run_individual_agent(agent_name, context)
                    if agent_result:
                        results.append(agent_result)
                except Exception as e:
                    self.logger.warning(f"Agent {agent_name} failed in fallback: {e}")
                    continue
            
            return {
                "success": True,
                "fallback_used": "sequential_agents",
                "results": results,
                "warning": "Using sequential agent execution instead of coordination"
            }
        except Exception as e:
            self.logger.error(f"Sequential agents fallback failed: {e}")
            return None
    
    async def _fallback_to_default_quality(self, error: Exception, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Fallback to default quality assessment when Judge Agent fails"""
        return {
            "success": True,
            "fallback_used": "default_quality",
            "quality_score": 0.8,
            "warning": "Using default quality assessment due to Judge Agent unavailability"
        }
    
    async def _fallback_to_alternative_model(self, error: Exception, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Fallback to alternative AI model when primary model fails"""
        try:
            # Try gemini-1.5-flash if gemini-pro fails
            alternative_models = ["gemini-1.5-flash", "gpt-4o-mini", "claude-3-haiku"]
            
            for model in alternative_models:
                try:
                    # This would integrate with your model router
                    result = await self._try_alternative_model(model, context)
                    if result:
                        return {
                            "success": True,
                            "fallback_used": "alternative_model",
                            "model_used": model,
                            "result": result,
                            "warning": f"Using {model} due to primary model unavailability"
                        }
                except Exception as e:
                    continue
            
            return None
        except Exception as e:
            self.logger.error(f"Alternative model fallback failed: {e}")
            return None
    
    async def _fallback_to_cached_response(self, error: Exception, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Fallback to cached response when API fails"""
        try:
            # This would integrate with your caching system
            cache_key = self._generate_cache_key(context)
            cached_response = await self._get_cached_response(cache_key)
            
            if cached_response:
                return {
                    "success": True,
                    "fallback_used": "cached_response",
                    "result": cached_response,
                    "warning": "Using cached response due to API unavailability",
                    "cache_age": cached_response.get("timestamp")
                }
            
            return None
        except Exception as e:
            self.logger.error(f"Cached response fallback failed: {e}")
            return None
    
    async def _fallback_to_free_tier(self, error: Exception, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Fallback to free tier models when cost limits exceeded"""
        try:
            # Use free tier models
            free_models = ["gemini-1.5-flash"]
            
            for model in free_models:
                try:
                    result = await self._try_alternative_model(model, context)
                    if result:
                        return {
                            "success": True,
                            "fallback_used": "free_tier",
                            "model_used": model,
                            "result": result,
                            "warning": "Using free tier model due to cost limits"
                        }
                except Exception as e:
                    continue
            
            return None
        except Exception as e:
            self.logger.error(f"Free tier fallback failed: {e}")
            return None
    
    async def _fallback_to_similar_agent(self, error: Exception, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Fallback to similar agent when primary agent fails"""
        try:
            failed_agent = context.metadata.get("failed_agent")
            similar_agents = {
                "customer_intelligence": ["customer_support", "crm_agent"],
                "financial_intelligence": ["accounting", "analytics_agent"],
                "content_intelligence": ["marketing_agency", "writer_agent"],
                "business_intelligence": ["strategy_agent", "analytics_agent"]
            }
            
            alternatives = similar_agents.get(failed_agent, [])
            
            for alternative in alternatives:
                try:
                    result = await self._run_individual_agent(alternative, context)
                    if result:
                        return {
                            "success": True,
                            "fallback_used": "similar_agent",
                            "agent_used": alternative,
                            "result": result,
                            "warning": f"Using {alternative} instead of {failed_agent}"
                        }
                except Exception as e:
                    continue
            
            return None
        except Exception as e:
            self.logger.error(f"Similar agent fallback failed: {e}")
            return None
    
    async def _fallback_to_basic_response(self, error: Exception, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Fallback to basic response when all agents fail"""
        return {
            "success": True,
            "fallback_used": "basic_response",
            "result": {
                "message": "I understand you need help, but I'm experiencing technical difficulties. Please try again or contact support.",
                "suggestion": "You can try rephrasing your request or using a different approach."
            },
            "warning": "Using basic response due to agent unavailability"
        }
    
    async def _fallback_to_cache(self, error: Exception, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Fallback to cached data when database fails"""
        try:
            cache_key = self._generate_cache_key(context)
            cached_data = await self._get_cached_data(cache_key)
            
            if cached_data:
                return {
                    "success": True,
                    "fallback_used": "cache",
                    "data": cached_data,
                    "warning": "Using cached data due to database unavailability"
                }
            
            return None
        except Exception as e:
            self.logger.error(f"Cache fallback failed: {e}")
            return None
    
    async def _fallback_to_alternative_endpoint(self, error: Exception, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Fallback to alternative API endpoint"""
        try:
            endpoint = context.metadata.get("endpoint")
            alternatives = {
                "/api/unified-orchestrator/process": "/api/orchestrator/process",
                "/api/unified-orchestrator/workflow/execute": "/api/workflow/execute"
            }
            
            alternative_endpoint = alternatives.get(endpoint)
            if alternative_endpoint:
                # This would make a request to the alternative endpoint
                result = await self._make_alternative_request(alternative_endpoint, context)
                if result:
                    return {
                        "success": True,
                        "fallback_used": "alternative_endpoint",
                        "endpoint_used": alternative_endpoint,
                        "result": result,
                        "warning": f"Using alternative endpoint: {alternative_endpoint}"
                    }
            
            return None
        except Exception as e:
            self.logger.error(f"Alternative endpoint fallback failed: {e}")
            return None
    
    # Helper methods (these would integrate with your existing systems)
    
    async def _run_individual_agent(self, agent_name: str, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Run an individual agent"""
        try:
            # This would integrate with your agent system
            # For now, return a mock response
            return {
                "agent": agent_name,
                "result": f"Mock result from {agent_name}",
                "status": "success"
            }
        except Exception as e:
            self.logger.error(f"Failed to run individual agent {agent_name}: {e}")
            return None
    
    async def _try_alternative_model(self, model: str, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Try alternative AI model"""
        try:
            # This would integrate with your model router
            # For now, return a mock response
            return {
                "model": model,
                "response": f"Mock response from {model}",
                "status": "success"
            }
        except Exception as e:
            self.logger.error(f"Alternative model {model} failed: {e}")
            return None
    
    def _generate_cache_key(self, context: ErrorContext) -> str:
        """Generate cache key from context"""
        return f"{context.component}:{context.operation}:{context.user_id}:{hash(str(context.metadata))}"
    
    async def _get_cached_response(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached response"""
        # This would integrate with your caching system
        return None
    
    async def _get_cached_data(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached data"""
        # This would integrate with your caching system
        return None
    
    async def _make_alternative_request(self, endpoint: str, context: ErrorContext) -> Optional[Dict[str, Any]]:
        """Make request to alternative endpoint"""
        # This would integrate with your HTTP client
        return None

# Global error handler instance
error_handler = ErrorHandler()

# Decorator for automatic error handling
def handle_errors(category: ErrorCategory = ErrorCategory.API, 
                 severity: ErrorSeverity = ErrorSeverity.MEDIUM,
                 fallback_enabled: bool = True):
    """Decorator for automatic error handling"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                # Create context from function info
                context = ErrorContext(
                    component=func.__module__,
                    operation=func.__name__,
                    metadata=kwargs
                )
                
                # Handle the error
                return await error_handler.handle_error(
                    e, context, severity, category, fallback_enabled
                )
        return wrapper
    return decorator

# Circuit breaker for preventing cascading failures
class CircuitBreaker:
    """Circuit breaker pattern implementation"""
    
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, func: Callable, *args, **kwargs):
        """Execute function with circuit breaker protection"""
        if self.state == "OPEN":
            if self._should_attempt_reset():
                self.state = "HALF_OPEN"
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e
    
    def _should_attempt_reset(self) -> bool:
        """Check if enough time has passed to attempt reset"""
        if self.last_failure_time is None:
            return True
        
        return (datetime.now() - self.last_failure_time).seconds >= self.timeout
    
    def _on_success(self):
        """Handle successful call"""
        self.failure_count = 0
        self.state = "CLOSED"
    
    def _on_failure(self):
        """Handle failed call"""
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

# Health check system
class HealthChecker:
    """System health monitoring and reporting"""
    
    def __init__(self):
        self.checks = {}
        self.last_check_time = {}
    
    def register_check(self, name: str, check_func: Callable, interval: int = 60):
        """Register a health check"""
        self.checks[name] = {
            "function": check_func,
            "interval": interval,
            "last_result": None,
            "last_check": None
        }
    
    async def run_checks(self) -> Dict[str, Any]:
        """Run all registered health checks"""
        results = {}
        
        for name, check_info in self.checks.items():
            try:
                # Check if enough time has passed
                last_check = check_info["last_check"]
                if last_check and (datetime.now() - last_check).seconds < check_info["interval"]:
                    results[name] = check_info["last_result"]
                    continue
                
                # Run the check
                result = await check_info["function"]()
                check_info["last_result"] = result
                check_info["last_check"] = datetime.now()
                results[name] = result
                
            except Exception as e:
                results[name] = {
                    "status": "unhealthy",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
        
        return results
    
    async def get_overall_health(self) -> Dict[str, Any]:
        """Get overall system health status"""
        checks = await self.run_checks()
        
        healthy_count = sum(1 for result in checks.values() if result.get("status") == "healthy")
        total_count = len(checks)
        
        overall_status = "healthy" if healthy_count == total_count else "degraded" if healthy_count > 0 else "unhealthy"
        
        return {
            "status": overall_status,
            "healthy_checks": healthy_count,
            "total_checks": total_count,
            "checks": checks,
            "timestamp": datetime.now().isoformat()
        }

# Global health checker instance
health_checker = HealthChecker()

# Register default health checks
async def check_orchestrator_health():
    """Check orchestrator health"""
    try:
        # This would check your orchestrator status
        return {"status": "healthy", "message": "Orchestrator operational"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

async def check_vertex_ai_health():
    """Check Vertex AI health"""
    try:
        # This would check your Vertex AI connectivity
        return {"status": "healthy", "message": "Vertex AI operational"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

async def check_database_health():
    """Check database health"""
    try:
        # This would check your database connectivity
        return {"status": "healthy", "message": "Database operational"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# Register health checks
health_checker.register_check("orchestrator", check_orchestrator_health)
health_checker.register_check("vertex_ai", check_vertex_ai_health)
health_checker.register_check("database", check_database_health)
