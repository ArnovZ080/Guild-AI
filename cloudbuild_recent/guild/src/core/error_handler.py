"""
Enhanced Error Handler
Provides retry logic, fallback strategies, and graceful degradation for production workflows.
"""

import asyncio
import logging
from typing import Any, Callable, Optional, Dict, List, Type
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import traceback

logger = logging.getLogger(__name__)


class ErrorSeverity(Enum):
    """Error severity levels"""
    LOW = "low"          # Minor issues, continue operation
    MEDIUM = "medium"    # Important but recoverable
    HIGH = "high"        # Serious, may affect user experience
    CRITICAL = "critical"  # System-threatening, requires immediate attention


class ErrorCategory(Enum):
    """Error categorization for handling strategies"""
    NETWORK = "network"              # Network/API failures
    RATE_LIMIT = "rate_limit"        # API rate limiting
    AUTHENTICATION = "authentication"  # Auth failures
    VALIDATION = "validation"        # Input validation errors
    RESOURCE = "resource"            # Resource exhaustion
    TIMEOUT = "timeout"              # Operation timeouts
    INTEGRATION = "integration"      # Third-party integration failures
    INTERNAL = "internal"            # Internal logic errors
    UNKNOWN = "unknown"              # Unclassified errors


@dataclass
class ErrorContext:
    """Context information for an error"""
    error: Exception
    category: ErrorCategory
    severity: ErrorSeverity
    timestamp: datetime
    component: str
    operation: str
    user_id: Optional[str] = None
    retry_count: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)
    stacktrace: str = ""


@dataclass
class RetryConfig:
    """Configuration for retry behavior"""
    max_retries: int = 3
    initial_delay: float = 1.0  # seconds
    max_delay: float = 60.0      # seconds
    exponential_base: float = 2.0
    jitter: bool = True
    retry_on: List[Type[Exception]] = field(default_factory=lambda: [Exception])
    dont_retry_on: List[Type[Exception]] = field(default_factory=list)


class EnhancedErrorHandler:
    """
    Comprehensive error handling system with retry logic and graceful degradation.
    """
    
    def __init__(self):
        self.error_log: List[ErrorContext] = []
        self.error_callbacks: Dict[ErrorCategory, List[Callable]] = {}
        self.fallback_strategies: Dict[str, Callable] = {}
        
    def categorize_error(self, error: Exception) -> ErrorCategory:
        """Categorize an error for appropriate handling"""
        error_str = str(error).lower()
        error_type = type(error).__name__.lower()
        
        # Network-related errors
        if any(keyword in error_str for keyword in ['connection', 'timeout', 'network', 'unreachable']):
            return ErrorCategory.NETWORK
        
        # Rate limiting
        if any(keyword in error_str for keyword in ['rate limit', 'too many requests', '429']):
            return ErrorCategory.RATE_LIMIT
        
        # Authentication
        if any(keyword in error_str for keyword in ['auth', 'unauthorized', '401', '403', 'forbidden']):
            return ErrorCategory.AUTHENTICATION
        
        # Validation
        if 'validation' in error_str or 'invalid' in error_str:
            return ErrorCategory.VALIDATION
        
        # Resource exhaustion
        if any(keyword in error_str for keyword in ['memory', 'quota', 'limit exceeded']):
            return ErrorCategory.RESOURCE
        
        # Timeout
        if 'timeout' in error_str or 'timeout' in error_type:
            return ErrorCategory.TIMEOUT
        
        # Integration failures
        if any(keyword in error_str for keyword in ['api', 'integration', 'service']):
            return ErrorCategory.INTEGRATION
        
        return ErrorCategory.UNKNOWN
    
    def assess_severity(self, error: Exception, category: ErrorCategory) -> ErrorSeverity:
        """Assess error severity"""
        # Critical errors
        if category == ErrorCategory.AUTHENTICATION:
            return ErrorSeverity.CRITICAL
        
        # High severity
        if category in [ErrorCategory.RESOURCE, ErrorCategory.INTEGRATION]:
            return ErrorSeverity.HIGH
        
        # Medium severity
        if category in [ErrorCategory.NETWORK, ErrorCategory.RATE_LIMIT, ErrorCategory.TIMEOUT]:
            return ErrorSeverity.MEDIUM
        
        # Low severity
        if category == ErrorCategory.VALIDATION:
            return ErrorSeverity.LOW
        
        return ErrorSeverity.MEDIUM
    
    async def execute_with_retry(
        self,
        func: Callable,
        *args,
        config: Optional[RetryConfig] = None,
        component: str = "unknown",
        operation: str = "unknown",
        user_id: Optional[str] = None,
        **kwargs
    ) -> Any:
        """
        Execute a function with retry logic and exponential backoff.
        
        Args:
            func: Function to execute (can be sync or async)
            *args: Positional arguments for func
            config: Retry configuration
            component: Component name for logging
            operation: Operation name for logging
            user_id: User identifier
            **kwargs: Keyword arguments for func
            
        Returns:
            Result of successful function execution
            
        Raises:
            Last exception if all retries exhausted
        """
        if config is None:
            config = RetryConfig()
        
        last_error = None
        
        for attempt in range(config.max_retries):
            try:
                # Execute function (handle both sync and async)
                if asyncio.iscoroutinefunction(func):
                    result = await func(*args, **kwargs)
                else:
                    result = func(*args, **kwargs)
                
                # Success!
                if attempt > 0:
                    logger.info(
                        f"Operation succeeded after {attempt + 1} attempts: "
                        f"{component}.{operation}"
                    )
                
                return result
                
            except Exception as e:
                last_error = e
                
                # Check if we should retry this error
                should_retry = self._should_retry(e, config)
                
                if not should_retry or attempt == config.max_retries - 1:
                    # Don't retry or out of retries
                    category = self.categorize_error(e)
                    severity = self.assess_severity(e, category)
                    
                    error_context = ErrorContext(
                        error=e,
                        category=category,
                        severity=severity,
                        timestamp=datetime.now(),
                        component=component,
                        operation=operation,
                        user_id=user_id,
                        retry_count=attempt + 1,
                        stacktrace=traceback.format_exc()
                    )
                    
                    await self._handle_error(error_context)
                    raise
                
                # Calculate delay with exponential backoff
                delay = self._calculate_delay(
                    attempt,
                    config.initial_delay,
                    config.exponential_base,
                    config.max_delay,
                    config.jitter
                )
                
                logger.warning(
                    f"Attempt {attempt + 1}/{config.max_retries} failed for "
                    f"{component}.{operation}: {str(e)}. "
                    f"Retrying in {delay:.2f}s..."
                )
                
                await asyncio.sleep(delay)
        
        # Should never reach here, but just in case
        raise last_error
    
    def _should_retry(self, error: Exception, config: RetryConfig) -> bool:
        """Determine if an error should trigger a retry"""
        # Check dont_retry_on list first
        for exc_type in config.dont_retry_on:
            if isinstance(error, exc_type):
                return False
        
        # Check retry_on list
        for exc_type in config.retry_on:
            if isinstance(error, exc_type):
                return True
        
        return False
    
    def _calculate_delay(
        self,
        attempt: int,
        initial_delay: float,
        base: float,
        max_delay: float,
        jitter: bool
    ) -> float:
        """Calculate retry delay with exponential backoff"""
        import random
        
        # Exponential backoff
        delay = initial_delay * (base ** attempt)
        
        # Cap at max delay
        delay = min(delay, max_delay)
        
        # Add jitter to prevent thundering herd
        if jitter:
            delay = delay * (0.5 + random.random())
        
        return delay
    
    async def _handle_error(self, context: ErrorContext):
        """Handle an error according to its category and severity"""
        # Log error
        self.error_log.append(context)
        self._log_error(context)
        
        # Execute category-specific callbacks
        callbacks = self.error_callbacks.get(context.category, [])
        for callback in callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(context)
                else:
                    callback(context)
            except Exception as e:
                logger.error(f"Error in error callback: {e}")
        
        # Report critical errors immediately
        if context.severity == ErrorSeverity.CRITICAL:
            await self._report_critical_error(context)
    
    def _log_error(self, context: ErrorContext):
        """Log error with appropriate level"""
        log_message = (
            f"[{context.severity.value.upper()}] {context.category.value}: "
            f"{context.component}.{context.operation} - {str(context.error)}"
        )
        
        if context.user_id:
            log_message += f" (user: {context.user_id})"
        
        if context.severity == ErrorSeverity.CRITICAL:
            logger.critical(log_message)
            logger.critical(f"Stacktrace:\n{context.stacktrace}")
        elif context.severity == ErrorSeverity.HIGH:
            logger.error(log_message)
        elif context.severity == ErrorSeverity.MEDIUM:
            logger.warning(log_message)
        else:
            logger.info(log_message)
    
    async def _report_critical_error(self, context: ErrorContext):
        """Report critical errors to monitoring/alerting systems"""
        # TODO: Integrate with monitoring system (e.g., Sentry, PagerDuty)
        logger.critical(
            f"CRITICAL ERROR ALERT: {context.component}.{context.operation} failed. "
            f"Error: {str(context.error)}"
        )
        
        # Could send to error tracking service:
        # await sentry_client.capture_exception(context.error, extra={
        #     "component": context.component,
        #     "operation": context.operation,
        #     "user_id": context.user_id,
        #     "category": context.category.value,
        #     "severity": context.severity.value
        # })
    
    def register_error_callback(
        self,
        category: ErrorCategory,
        callback: Callable[[ErrorContext], None]
    ):
        """Register a callback for a specific error category"""
        if category not in self.error_callbacks:
            self.error_callbacks[category] = []
        
        self.error_callbacks[category].append(callback)
        logger.info(f"Registered error callback for category: {category.value}")
    
    def register_fallback(self, operation_key: str, fallback_func: Callable):
        """Register a fallback strategy for an operation"""
        self.fallback_strategies[operation_key] = fallback_func
        logger.info(f"Registered fallback for operation: {operation_key}")
    
    async def execute_with_fallback(
        self,
        primary_func: Callable,
        fallback_key: str,
        *args,
        component: str = "unknown",
        operation: str = "unknown",
        **kwargs
    ) -> Any:
        """
        Execute function with fallback strategy if it fails.
        
        Args:
            primary_func: Primary function to try
            fallback_key: Key for registered fallback strategy
            *args: Arguments for functions
            component: Component name
            operation: Operation name
            **kwargs: Keyword arguments
            
        Returns:
            Result from primary or fallback function
        """
        try:
            # Try primary function
            if asyncio.iscoroutinefunction(primary_func):
                return await primary_func(*args, **kwargs)
            else:
                return primary_func(*args, **kwargs)
                
        except Exception as e:
            logger.warning(
                f"Primary function {component}.{operation} failed: {str(e)}. "
                f"Attempting fallback..."
            )
            
            # Try fallback
            if fallback_key in self.fallback_strategies:
                fallback_func = self.fallback_strategies[fallback_key]
                
                try:
                    if asyncio.iscoroutinefunction(fallback_func):
                        result = await fallback_func(*args, **kwargs)
                    else:
                        result = fallback_func(*args, **kwargs)
                    
                    logger.info(f"Fallback succeeded for {component}.{operation}")
                    return result
                    
                except Exception as fallback_error:
                    logger.error(
                        f"Fallback also failed for {component}.{operation}: "
                        f"{str(fallback_error)}"
                    )
                    raise
            else:
                logger.error(f"No fallback registered for key: {fallback_key}")
                raise
    
    def get_error_report(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        category: Optional[ErrorCategory] = None,
        severity: Optional[ErrorSeverity] = None
    ) -> Dict[str, Any]:
        """Generate error report for analysis"""
        filtered_errors = self.error_log
        
        # Apply filters
        if start_time:
            filtered_errors = [e for e in filtered_errors if e.timestamp >= start_time]
        
        if end_time:
            filtered_errors = [e for e in filtered_errors if e.timestamp <= end_time]
        
        if category:
            filtered_errors = [e for e in filtered_errors if e.category == category]
        
        if severity:
            filtered_errors = [e for e in filtered_errors if e.severity == severity]
        
        # Calculate statistics
        total_errors = len(filtered_errors)
        
        by_category = {}
        by_severity = {}
        by_component = {}
        
        for error in filtered_errors:
            # By category
            cat = error.category.value
            by_category[cat] = by_category.get(cat, 0) + 1
            
            # By severity
            sev = error.severity.value
            by_severity[sev] = by_severity.get(sev, 0) + 1
            
            # By component
            comp = error.component
            by_component[comp] = by_component.get(comp, 0) + 1
        
        return {
            "total_errors": total_errors,
            "by_category": by_category,
            "by_severity": by_severity,
            "by_component": by_component,
            "recent_errors": [
                {
                    "timestamp": e.timestamp.isoformat(),
                    "category": e.category.value,
                    "severity": e.severity.value,
                    "component": e.component,
                    "operation": e.operation,
                    "error": str(e.error),
                    "retry_count": e.retry_count
                }
                for e in filtered_errors[-10:]  # Last 10 errors
            ]
        }


# Global error handler instance
error_handler = EnhancedErrorHandler()


# Convenience functions

async def execute_with_retry(
    func: Callable,
    *args,
    max_retries: int = 3,
    component: str = "unknown",
    operation: str = "unknown",
    **kwargs
) -> Any:
    """Execute function with retry logic"""
    config = RetryConfig(max_retries=max_retries)
    return await error_handler.execute_with_retry(
        func, *args, config=config, component=component, operation=operation, **kwargs
    )


async def execute_with_fallback(
    primary_func: Callable,
    fallback_func: Callable,
    *args,
    component: str = "unknown",
    operation: str = "unknown",
    **kwargs
) -> Any:
    """Execute function with fallback"""
    # Register fallback
    fallback_key = f"{component}.{operation}"
    error_handler.register_fallback(fallback_key, fallback_func)
    
    # Execute with fallback
    return await error_handler.execute_with_fallback(
        primary_func, fallback_key, *args,
        component=component, operation=operation, **kwargs
    )


def register_error_callback(category: ErrorCategory, callback: Callable):
    """Register error callback for a category"""
    error_handler.register_error_callback(category, callback)

