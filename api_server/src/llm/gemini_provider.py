"""
Gemini Provider for Guild AI
Wraps Vertex AI Gemini models with usage tracking and fallbacks
"""

import os
import logging
from typing import Optional, Dict, Any, List
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig, SafetySetting, HarmCategory, HarmBlockThreshold

from .model_router import model_router

logger = logging.getLogger(__name__)

class GeminiProvider:
    """Provider for Gemini models via Vertex AI"""
    
    def __init__(self):
        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'guild-ai-080')
        self.location = os.getenv('VERTEX_AI_LOCATION', 'us-central1')
        self.initialized = False
        
        # Initialize Vertex AI
        try:
            vertexai.init(project=self.project_id, location=self.location)
            self.initialized = True
            logger.info(f"✅ Vertex AI initialized successfully: {self.project_id} in {self.location}")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Vertex AI: {e}")
            logger.error(f"Make sure GOOGLE_CLOUD_PROJECT is set and credentials are configured")
            logger.error(f"Current project_id: {self.project_id}, location: {self.location}")
            # Don't raise - allow graceful degradation
        
        # Default safety settings (permissive for business use)
        self.safety_settings = [
            SafetySetting(
                category=HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold=HarmBlockThreshold.BLOCK_ONLY_HIGH
            ),
            SafetySetting(
                category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold=HarmBlockThreshold.BLOCK_ONLY_HIGH
            ),
            SafetySetting(
                category=HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold=HarmBlockThreshold.BLOCK_ONLY_HIGH
            ),
            SafetySetting(
                category=HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold=HarmBlockThreshold.BLOCK_ONLY_HIGH
            ),
        ]
    
    async def generate(
        self,
        prompt: str,
        model_name: str = 'gemini-1.5-flash',
        temperature: float = 0.7,
        max_output_tokens: int = 8192,
        system_instruction: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate content using Gemini models
        
        Args:
            prompt: User prompt
            model_name: Model to use (will be routed if not specified)
            temperature: Randomness (0-1)
            max_output_tokens: Max response length
            system_instruction: System-level instructions for the model
            **kwargs: Additional parameters
        
        Returns:
            Dictionary with text, usage, and metadata
        """
        # Check if Vertex AI is initialized
        if not self.initialized:
            error_msg = f"Vertex AI not initialized. Project: {self.project_id}, Location: {self.location}"
            logger.error(error_msg)
            return {
                'text': '',
                'error': error_msg,
                'model': model_name,
                'finish_reason': 'initialization_error'
            }
        
        try:
            # Create generation config
            generation_config = GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_output_tokens,
                **kwargs
            )
            
            # Initialize model
            model_kwargs = {
                'model_name': model_name,
                'generation_config': generation_config,
                'safety_settings': self.safety_settings
            }
            
            if system_instruction:
                model_kwargs['system_instruction'] = system_instruction
            
            model = GenerativeModel(**model_kwargs)
            
            # Generate content
            logger.debug(f"Generating with {model_name}, temp={temperature}")
            response = model.generate_content(prompt)
            
            # Extract usage metadata
            usage_metadata = response.usage_metadata if hasattr(response, 'usage_metadata') else None
            input_tokens = usage_metadata.prompt_token_count if usage_metadata else len(prompt.split()) * 1.3
            output_tokens = usage_metadata.candidates_token_count if usage_metadata else len(response.text.split()) * 1.3
            
            # Track usage for cost monitoring
            model_router.track_usage(model_name, int(input_tokens), int(output_tokens))
            
            return {
                'text': response.text,
                'model': model_name,
                'usage': {
                    'input_tokens': int(input_tokens),
                    'output_tokens': int(output_tokens),
                    'total_tokens': int(input_tokens + output_tokens)
                },
                'finish_reason': 'completed',
                'safety_ratings': response.candidates[0].safety_ratings if response.candidates else []
            }
            
        except Exception as e:
            logger.error(f"Gemini generation failed: {e}")
            return {
                'text': '',
                'error': str(e),
                'model': model_name,
                'finish_reason': 'error'
            }
    
    async def generate_with_context(
        self,
        prompt: str,
        business_context: Dict[str, Any],
        task_type: str = 'chat',
        complexity: str = 'medium',
        user_tier: str = 'free'
    ) -> Dict[str, Any]:
        """
        Generate content with business context from source of truth
        
        Args:
            prompt: User prompt
            business_context: User's business data from onboarding
            task_type: Type of task for routing
            complexity: Task complexity
            user_tier: User's subscription tier
        
        Returns:
            Generated content with metadata
        """
        # Route to best model
        model_name = model_router.route_task(
            task_type=task_type,
            complexity=complexity,
            user_tier=user_tier
        )
        
        # Build system instruction from business context
        system_instruction = self._build_system_instruction(business_context)
        
        # Generate with higher temperature for more dynamic responses
        return await self.generate(
            prompt=prompt,
            model_name=model_name,
            system_instruction=system_instruction,
            temperature=0.8  # Higher temperature for more creative, dynamic responses
        )
    
    def _build_system_instruction(self, context: Dict[str, Any]) -> str:
        """Build system instruction from business context"""
        parts = [
            "You are the Guild AI Orchestrator - an intelligent, warm, and conversational AI business partner.",
            "You're like ChatGPT or Google Gemini - you provide dynamic, thoughtful responses based on the conversation context.",
            "Be natural, engaging, and genuinely helpful. Use their first name when you know it.",
            "Never give pre-programmed or template responses. Always generate fresh, contextual answers.",
            "You have access to their business context and can coordinate 115+ specialized agents when needed.",
            "For greetings like 'how is it going?' or 'hello', respond naturally and ask about their business or what they need help with.",
            "For vague requests like 'create content' or 'help with marketing', ask intelligent clarifying questions to understand their specific needs.",
            "Always be conversational, not robotic. Think and respond like a smart human business advisor would."
        ]
        
        if context.get('business_description'):
            parts.append(f"\nTheir Business: {context['business_description']}")
        
        if context.get('business_type'):
            parts.append(f"\nBusiness Type: {context['business_type']}")
        
        if context.get('brand_voice_tone'):
            parts.append(f"\nTheir Brand Voice: {context['brand_voice_tone']} - match this tone in your responses")
        
        if context.get('target_audience'):
            parts.append(f"\nTheir Target Audience: {context['target_audience']}")
        
        if context.get('audience_problems'):
            parts.append(f"\nKey Problems They Solve: {context['audience_problems']}")
        
        if context.get('priority_3months'):
            parts.append(f"\nTheir 3-Month Priority: {context['priority_3months']}")
        
        if context.get('revenue_goals'):
            parts.append(f"\nRevenue Goals: {context['revenue_goals']}")
        
        if context.get('brand_values'):
            parts.append(f"\nBrand Values: {context['brand_values']}")
        
        parts.extend([
            "\nRespond as their trusted business partner who genuinely cares about their success.",
            "Offer specific, actionable advice. When appropriate, mention how you can coordinate agents to help.",
            "Be warm, personal, and direct. No corporate speak or unnecessary formality."
        ])
        
        return ' '.join(parts)
    
    async def chat(
        self,
        messages: List[Dict[str, str]],
        model_name: str = 'gemini-1.5-flash',
        temperature: float = 0.7,
        system_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Chat interface with conversation history
        
        Args:
            messages: List of {role: 'user'|'assistant', content: str}
            model_name: Model to use
            temperature: Randomness
            system_instruction: System instruction
        
        Returns:
            Response dictionary
        """
        # Check if Vertex AI is initialized
        if not self.initialized:
            error_msg = f"Vertex AI not initialized. Project: {self.project_id}, Location: {self.location}"
            logger.error(error_msg)
            return {
                'text': '',
                'error': error_msg,
                'model': model_name,
                'finish_reason': 'initialization_error'
            }
        
        try:
            # Convert messages to Gemini format
            model_kwargs = {
                'model_name': model_name,
                'generation_config': GenerationConfig(temperature=temperature),
                'safety_settings': self.safety_settings
            }
            
            if system_instruction:
                model_kwargs['system_instruction'] = system_instruction
            
            model = GenerativeModel(**model_kwargs)
            
            # Start chat
            chat = model.start_chat()
            
            # Send messages
            for msg in messages[:-1]:  # All but last
                if msg['role'] == 'user':
                    chat.send_message(msg['content'])
            
            # Send final message and get response
            response = chat.send_message(messages[-1]['content'])
            
            # Track usage
            usage_metadata = response.usage_metadata if hasattr(response, 'usage_metadata') else None
            if usage_metadata:
                model_router.track_usage(
                    model_name,
                    usage_metadata.prompt_token_count,
                    usage_metadata.candidates_token_count
                )
            
            return {
                'text': response.text,
                'model': model_name,
                'finish_reason': 'completed'
            }
            
        except Exception as e:
            logger.error(f"Gemini chat failed: {e}")
            return {
                'text': '',
                'error': str(e),
                'finish_reason': 'error'
            }

# Global provider instance
gemini_provider = GeminiProvider()

