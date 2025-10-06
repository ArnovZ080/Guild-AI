"""
Vertex AI Client for Guild-AI
Provides seamless integration with Google Cloud Vertex AI for production LLM capabilities.
"""

import os
import json
from typing import Dict, Any, Optional, List
import logging
from google.cloud import aiplatform
from vertexai.language_models import TextGenerationModel, ChatModel
from vertexai.preview.generative_models import GenerativeModel

logger = logging.getLogger(__name__)


class VertexAIClient:
    """
    Vertex AI client that provides the same interface as LlmClient
    but uses Google Cloud Vertex AI models.
    """
    
    def __init__(
        self,
        project_id: Optional[str] = None,
        location: str = "us-central1",
        model_name: str = "gemini-pro"
    ):
        """
        Initialize Vertex AI client.
        
        Args:
            project_id: Google Cloud project ID (uses GOOGLE_CLOUD_PROJECT env var if not provided)
            location: GCP region for Vertex AI (default: us-central1)
            model_name: Model to use (gemini-pro, gemini-pro-vision, text-bison, etc.)
        """
        self.project_id = project_id or os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = location
        self.model_name = model_name
        
        if not self.project_id:
            raise ValueError(
                "Google Cloud project ID must be provided or set via GOOGLE_CLOUD_PROJECT env var"
            )
        
        # Initialize Vertex AI
        aiplatform.init(project=self.project_id, location=self.location)
        logger.info(f"Initialized Vertex AI client: project={self.project_id}, location={self.location}, model={self.model_name}")
        
        # Initialize the model
        self._init_model()
    
    def _init_model(self):
        """Initialize the appropriate Vertex AI model based on model_name."""
        try:
            if self.model_name.startswith("gemini"):
                # Use Gemini models (latest, most capable)
                self.model = GenerativeModel(self.model_name)
                self.model_type = "gemini"
                logger.info(f"Using Gemini model: {self.model_name}")
            
            elif self.model_name.startswith("text-bison") or self.model_name.startswith("text-"):
                # Use PaLM 2 text models
                self.model = TextGenerationModel.from_pretrained(self.model_name)
                self.model_type = "palm_text"
                logger.info(f"Using PaLM 2 text model: {self.model_name}")
            
            elif self.model_name.startswith("chat-bison") or self.model_name.startswith("chat-"):
                # Use PaLM 2 chat models
                self.model = ChatModel.from_pretrained(self.model_name)
                self.model_type = "palm_chat"
                logger.info(f"Using PaLM 2 chat model: {self.model_name}")
            
            else:
                # Default to Gemini Pro
                logger.warning(f"Unknown model {self.model_name}, defaulting to gemini-pro")
                self.model = GenerativeModel("gemini-pro")
                self.model_type = "gemini"
                self.model_name = "gemini-pro"
        
        except Exception as e:
            logger.error(f"Error initializing Vertex AI model: {e}")
            raise
    
    async def chat(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 8192,
        top_p: float = 0.95,
        top_k: int = 40,
        **kwargs
    ) -> str:
        """
        Send a chat message to Vertex AI and get response.
        Compatible with the existing LlmClient interface.
        
        Args:
            prompt: The prompt/message to send
            temperature: Sampling temperature (0.0-1.0)
            max_tokens: Maximum tokens in response
            top_p: Nucleus sampling parameter
            top_k: Top-k sampling parameter
            
        Returns:
            The model's response as a string
        """
        try:
            if self.model_type == "gemini":
                response = await self._chat_gemini(
                    prompt=prompt,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    top_p=top_p,
                    top_k=top_k
                )
            
            elif self.model_type == "palm_text":
                response = await self._chat_palm_text(
                    prompt=prompt,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    top_p=top_p,
                    top_k=top_k
                )
            
            elif self.model_type == "palm_chat":
                response = await self._chat_palm_chat(
                    prompt=prompt,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    top_p=top_p,
                    top_k=top_k
                )
            
            else:
                raise ValueError(f"Unknown model type: {self.model_type}")
            
            logger.info(f"Successfully generated response from {self.model_name}")
            return response
        
        except Exception as e:
            logger.error(f"Error in Vertex AI chat: {e}")
            raise
    
    async def _chat_gemini(
        self,
        prompt: str,
        temperature: float,
        max_tokens: int,
        top_p: float,
        top_k: int
    ) -> str:
        """Chat using Gemini models."""
        generation_config = {
            "temperature": temperature,
            "top_p": top_p,
            "top_k": top_k,
            "max_output_tokens": max_tokens,
        }
        
        # Gemini uses generate_content
        response = self.model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        return response.text
    
    async def _chat_palm_text(
        self,
        prompt: str,
        temperature: float,
        max_tokens: int,
        top_p: float,
        top_k: int
    ) -> str:
        """Chat using PaLM 2 text models."""
        response = self.model.predict(
            prompt,
            temperature=temperature,
            max_output_tokens=max_tokens,
            top_p=top_p,
            top_k=top_k
        )
        
        return response.text
    
    async def _chat_palm_chat(
        self,
        prompt: str,
        temperature: float,
        max_tokens: int,
        top_p: float,
        top_k: int
    ) -> str:
        """Chat using PaLM 2 chat models."""
        chat = self.model.start_chat()
        
        response = chat.send_message(
            prompt,
            temperature=temperature,
            max_output_tokens=max_tokens,
            top_p=top_p,
            top_k=top_k
        )
        
        return response.text
    
    def stream_chat(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 8192,
        top_p: float = 0.95,
        top_k: int = 40
    ):
        """
        Stream chat responses from Vertex AI.
        Useful for real-time UI updates.
        
        Yields:
            Response chunks as they arrive
        """
        try:
            generation_config = {
                "temperature": temperature,
                "top_p": top_p,
                "top_k": top_k,
                "max_output_tokens": max_tokens,
            }
            
            if self.model_type == "gemini":
                responses = self.model.generate_content(
                    prompt,
                    generation_config=generation_config,
                    stream=True
                )
                
                for response in responses:
                    if response.text:
                        yield response.text
            
            elif self.model_type == "palm_text":
                # PaLM text models don't support streaming well
                # Return full response
                response = self.model.predict(
                    prompt,
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                    top_p=top_p,
                    top_k=top_k
                )
                yield response.text
            
            else:
                raise ValueError(f"Streaming not supported for {self.model_type}")
        
        except Exception as e:
            logger.error(f"Error in stream_chat: {e}")
            raise


class VertexAIClientFactory:
    """
    Factory for creating Vertex AI clients with different configurations.
    Useful for different agents or use cases.
    """
    
    @staticmethod
    def create_client(
        model_name: Optional[str] = None,
        project_id: Optional[str] = None,
        location: Optional[str] = None
    ) -> VertexAIClient:
        """
        Create a Vertex AI client with optional overrides.
        Falls back to environment variables if not provided.
        """
        return VertexAIClient(
            project_id=project_id or os.getenv("GOOGLE_CLOUD_PROJECT"),
            location=location or os.getenv("VERTEX_AI_LOCATION", "us-central1"),
            model_name=model_name or os.getenv("VERTEX_AI_MODEL", "gemini-pro")
        )
    
    @staticmethod
    def create_growth_agent_client() -> VertexAIClient:
        """
        Create a client optimized for the Growth Opportunity Agent.
        Uses Gemini Pro for best reasoning and analysis.
        """
        return VertexAIClient(
            model_name="gemini-pro",
            location=os.getenv("VERTEX_AI_LOCATION", "us-central1")
        )
    
    @staticmethod
    def create_content_agent_client() -> VertexAIClient:
        """
        Create a client optimized for content generation.
        Uses appropriate model for creative writing.
        """
        return VertexAIClient(
            model_name=os.getenv("CONTENT_MODEL", "gemini-pro"),
            location=os.getenv("VERTEX_AI_LOCATION", "us-central1")
        )
    
    @staticmethod
    def create_analysis_agent_client() -> VertexAIClient:
        """
        Create a client optimized for data analysis.
        Uses model best suited for analytical tasks.
        """
        return VertexAIClient(
            model_name=os.getenv("ANALYSIS_MODEL", "gemini-pro"),
            location=os.getenv("VERTEX_AI_LOCATION", "us-central1")
        )


# Convenience function for backward compatibility
def create_vertex_client(
    model_name: str = "gemini-pro",
    project_id: Optional[str] = None
) -> VertexAIClient:
    """
    Simple function to create a Vertex AI client.
    
    Usage:
        client = create_vertex_client(model_name="gemini-pro")
        response = await client.chat("Your prompt here")
    """
    return VertexAIClient(project_id=project_id, model_name=model_name)

