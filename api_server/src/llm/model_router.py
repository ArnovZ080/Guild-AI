"""
Smart Model Router for Guild AI
Routes LLM requests to the most cost-effective model based on task requirements
"""

import os
import logging
from typing import Dict, Optional, Literal
from datetime import datetime, timedelta
from collections import defaultdict
from dataclasses import dataclass

logger = logging.getLogger(__name__)

TaskType = Literal['chat', 'orchestrate', 'content', 'strategy', 'analysis', 'planning', 'premium']
Complexity = Literal['low', 'medium', 'high']
UserTier = Literal['free', 'starter', 'growth', 'professional', 'enterprise']

@dataclass
class ModelConfig:
    """Configuration for a specific model"""
    name: str
    provider: str  # 'vertex_ai' or 'openai'
    cost_per_1m_input_tokens: float
    cost_per_1m_output_tokens: float
    free_tier_requests_per_min: int
    free_tier_tokens_per_day: int
    max_tokens: int
    best_for: list[str]

class UsageTracker:
    """Track usage against free tier limits"""
    
    def __init__(self):
        self.daily_tokens = defaultdict(int)
        self.minute_requests = defaultdict(lambda: [])
        self.last_reset = datetime.now()
    
    def reset_if_needed(self):
        """Reset counters if day has changed"""
        now = datetime.now()
        if now.date() > self.last_reset.date():
            self.daily_tokens.clear()
            self.last_reset = now
    
    def track_request(self, model_name: str, token_count: int):
        """Track a request for a specific model"""
        self.reset_if_needed()
        now = datetime.now()
        
        # Track daily tokens
        self.daily_tokens[model_name] += token_count
        
        # Track minute requests (keep last 60 seconds)
        self.minute_requests[model_name].append(now)
        cutoff = now - timedelta(seconds=60)
        self.minute_requests[model_name] = [
            t for t in self.minute_requests[model_name] if t > cutoff
        ]
    
    def within_limits(self, model_name: str, config: ModelConfig) -> bool:
        """Check if model is within free tier limits"""
        self.reset_if_needed()
        
        # Check daily token limit
        if self.daily_tokens[model_name] >= config.free_tier_tokens_per_day:
            logger.info(f"{model_name} daily token limit reached")
            return False
        
        # Check requests per minute
        if len(self.minute_requests[model_name]) >= config.free_tier_requests_per_min:
            logger.info(f"{model_name} requests per minute limit reached")
            return False
        
        return True
    
    def get_usage_stats(self, model_name: str) -> Dict:
        """Get current usage statistics"""
        self.reset_if_needed()
        return {
            'daily_tokens_used': self.daily_tokens[model_name],
            'requests_this_minute': len(self.minute_requests[model_name]),
            'last_reset': self.last_reset.isoformat()
        }

class ModelRouter:
    """Routes tasks to optimal models based on cost and capability"""
    
    # Model configurations
    MODELS = {
        'gemini-1.5-flash': ModelConfig(
            name='gemini-1.5-flash',
            provider='vertex_ai',
            cost_per_1m_input_tokens=0.075,
            cost_per_1m_output_tokens=0.30,
            free_tier_requests_per_min=15,
            free_tier_tokens_per_day=1_000_000,
            max_tokens=1_000_000,
            best_for=['chat', 'orchestrate', 'content', 'general']
        ),
        'gemini-1.5-pro': ModelConfig(
            name='gemini-1.5-pro',
            provider='vertex_ai',
            cost_per_1m_input_tokens=1.25,
            cost_per_1m_output_tokens=5.00,
            free_tier_requests_per_min=2,
            free_tier_tokens_per_day=32_000,
            max_tokens=2_000_000,
            best_for=['strategy', 'analysis', 'planning', 'complex_reasoning']
        ),
        'gemini-1.5-flash-002': ModelConfig(
            name='gemini-1.5-flash-002',
            provider='vertex_ai',
            cost_per_1m_input_tokens=0.075,
            cost_per_1m_output_tokens=0.30,
            free_tier_requests_per_min=15,
            free_tier_tokens_per_day=1_000_000,
            max_tokens=1_000_000,
            best_for=['chat', 'orchestrate', 'content']
        ),
        'gpt-4o-mini': ModelConfig(
            name='gpt-4o-mini',
            provider='openai',
            cost_per_1m_input_tokens=0.15,
            cost_per_1m_output_tokens=0.60,
            free_tier_requests_per_min=0,
            free_tier_tokens_per_day=0,
            max_tokens=128_000,
            best_for=['fallback', 'openai_specific']
        ),
        'gpt-4o': ModelConfig(
            name='gpt-4o',
            provider='openai',
            cost_per_1m_input_tokens=5.00,
            cost_per_1m_output_tokens=15.00,
            free_tier_requests_per_min=0,
            free_tier_tokens_per_day=0,
            max_tokens=128_000,
            best_for=['premium', 'enterprise_only']
        )
    }
    
    def __init__(self):
        self.usage_tracker = UsageTracker()
        self.default_model = 'gemini-1.5-flash'
        self.enable_cost_optimization = os.getenv('ENABLE_COST_OPTIMIZATION', 'true').lower() == 'true'
        logger.info(f"ModelRouter initialized. Cost optimization: {self.enable_cost_optimization}")
    
    def route_task(
        self, 
        task_type: TaskType = 'chat',
        complexity: Complexity = 'medium',
        user_tier: UserTier = 'free',
        estimated_tokens: int = 1000,
        force_model: Optional[str] = None
    ) -> str:
        """
        Route task to optimal model based on requirements and cost
        
        Args:
            task_type: Type of task (chat, orchestrate, content, strategy, etc.)
            complexity: Task complexity (low, medium, high)
            user_tier: User's subscription tier
            estimated_tokens: Estimated token count for the request
            force_model: Force a specific model (bypass routing)
        
        Returns:
            Model name to use
        """
        if force_model and force_model in self.MODELS:
            logger.info(f"Using forced model: {force_model}")
            return force_model
        
        if not self.enable_cost_optimization:
            return self.default_model
        
        # Priority 1: Try free tier first (Gemini Flash)
        flash_config = self.MODELS['gemini-1.5-flash']
        if self.usage_tracker.within_limits('gemini-1.5-flash', flash_config):
            if task_type in ['chat', 'orchestrate', 'content']:
                logger.debug(f"Routing {task_type} to Gemini Flash (free tier)")
                return 'gemini-1.5-flash'
            
            # Medium complexity can use Flash
            if complexity in ['low', 'medium']:
                logger.debug(f"Routing {complexity} complexity to Gemini Flash (free tier)")
                return 'gemini-1.5-flash'
        
        # Priority 2: Strategy and analysis - use Pro if needed
        if task_type in ['strategy', 'analysis', 'planning']:
            if complexity == 'high' or user_tier in ['professional', 'enterprise']:
                logger.info(f"Routing {task_type} ({complexity}) to Gemini Pro")
                return 'gemini-1.5-pro'
        
        # Priority 3: Enterprise users get Pro for better quality
        if user_tier == 'enterprise' and task_type != 'chat':
            logger.info(f"Routing enterprise {task_type} to Gemini Pro")
            return 'gemini-1.5-pro'
        
        # Priority 4: Premium tasks (explicit request)
        if task_type == 'premium':
            if user_tier in ['professional', 'enterprise']:
                logger.info("Routing premium task to GPT-4o")
                return 'gpt-4o'
            else:
                logger.info("Premium task requested but user tier too low, using Gemini Pro")
                return 'gemini-1.5-pro'
        
        # Default: Use Flash (most cost-effective)
        logger.debug(f"Defaulting to Gemini Flash for {task_type}")
        return 'gemini-1.5-flash'
    
    def get_model_config(self, model_name: str) -> Optional[ModelConfig]:
        """Get configuration for a specific model"""
        return self.MODELS.get(model_name)
    
    def estimate_cost(self, model_name: str, input_tokens: int, output_tokens: int) -> float:
        """Estimate cost for a request"""
        config = self.get_model_config(model_name)
        if not config:
            return 0.0
        
        # Check if within free tier
        if self.usage_tracker.within_limits(model_name, config):
            return 0.0
        
        # Calculate paid cost
        input_cost = (input_tokens / 1_000_000) * config.cost_per_1m_input_tokens
        output_cost = (output_tokens / 1_000_000) * config.cost_per_1m_output_tokens
        
        return input_cost + output_cost
    
    def track_usage(self, model_name: str, input_tokens: int, output_tokens: int):
        """Track usage for a model"""
        total_tokens = input_tokens + output_tokens
        self.usage_tracker.track_request(model_name, total_tokens)
        
        # Log usage
        cost = self.estimate_cost(model_name, input_tokens, output_tokens)
        logger.info(
            f"Model usage: {model_name} | "
            f"Tokens: {total_tokens} | "
            f"Cost: ${cost:.6f}"
        )
    
    def get_usage_summary(self) -> Dict:
        """Get summary of all model usage"""
        summary = {}
        for model_name in self.MODELS.keys():
            summary[model_name] = self.usage_tracker.get_usage_stats(model_name)
        return summary
    
    def recommend_model(
        self,
        task_description: str,
        user_tier: UserTier = 'free',
        max_budget: Optional[float] = None
    ) -> Dict:
        """
        Analyze task and recommend best model
        Returns model name and reasoning
        """
        # Simple heuristic for task type detection
        task_lower = task_description.lower()
        
        if any(word in task_lower for word in ['strategy', 'analyze', 'plan', 'forecast']):
            task_type = 'strategy'
            complexity = 'high' if len(task_description) > 200 else 'medium'
        elif any(word in task_lower for word in ['chat', 'question', 'answer', 'explain']):
            task_type = 'chat'
            complexity = 'low'
        elif any(word in task_lower for word in ['write', 'create', 'generate', 'content']):
            task_type = 'content'
            complexity = 'medium'
        else:
            task_type = 'orchestrate'
            complexity = 'medium'
        
        model = self.route_task(task_type, complexity, user_tier)
        config = self.get_model_config(model)
        
        return {
            'recommended_model': model,
            'task_type': task_type,
            'complexity': complexity,
            'reasoning': f"Best for {task_type} tasks with {complexity} complexity",
            'provider': config.provider if config else 'unknown',
            'estimated_cost_per_1k_tokens': (
                config.cost_per_1m_input_tokens / 1000 if config else 0
            ),
            'free_tier_available': (
                self.usage_tracker.within_limits(model, config) if config else False
            )
        }

# Global router instance
model_router = ModelRouter()

