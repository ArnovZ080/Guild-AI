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
        
        # Initialize Vertex AI
        try:
            vertexai.init(project=self.project_id, location=self.location)
            logger.info(f"Vertex AI initialized: {self.project_id} in {self.location}")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {e}")
        
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
        
        # Generate
        return await self.generate(
            prompt=prompt,
            model_name=model_name,
            system_instruction=system_instruction
        )
    
    def _build_system_instruction(self, context: Dict[str, Any]) -> str:
        """Build system instruction from business context"""
        parts = ["You are an AI business assistant for this company:"]
        
        if context.get('business_description'):
            parts.append(f"\nBusiness: {context['business_description']}")
        
        if context.get('brand_voice_tone'):
            parts.append(f"\nBrand Voice: {context['brand_voice_tone']}")
        
        if context.get('target_audience'):
            parts.append(f"\nTarget Audience: {context['target_audience']}")
        
        if context.get('brand_values'):
            parts.append(f"\nBrand Values: {context['brand_values']}")
        
        parts.append("\nAlways maintain brand consistency and speak to the target audience.")
        
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

