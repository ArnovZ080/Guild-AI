from typing import Protocol, Dict, Any
import ollama
import requests
import json
from guild.src.core.config import settings
import os
from guild.src.models.llm import Llm

class LLMProvider(Protocol):
    """A protocol for LLM providers, ensuring they have a generate_json method."""
    def generate_json(self, prompt: str, model: str) -> Dict[str, Any]:
        ...

class VertexAIProvider:
    """LLM provider for Google Cloud Vertex AI."""
    def __init__(self):
        from guild.src.core.vertex_ai_client import VertexAIClient
        
        # Get configuration from environment
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        location = os.getenv("VERTEX_AI_LOCATION", "us-central1")
        model_name = os.getenv("VERTEX_AI_MODEL", "gemini-pro")
        
        if not project_id:
            raise ValueError("GOOGLE_CLOUD_PROJECT must be set for Vertex AI provider")
        
        self.client = VertexAIClient(
            project_id=project_id,
            location=location,
            model_name=model_name
        )
        self.model_name = model_name
    
    def generate_json(self, prompt: str, model: str = None) -> Dict[str, Any]:
        """Generate JSON response using Vertex AI."""
        print(f"Using VertexAIProvider with model '{model or self.model_name}'...")
        try:
            # Note: Vertex AI client's chat method is async, but we need sync here
            # We'll use a sync wrapper or modify the client
            import asyncio
            
            # Create event loop if needed
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            # Run async chat method
            response_text = loop.run_until_complete(self.client.chat(prompt))
            
            # Try to parse as JSON
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                # If not valid JSON, wrap in a response object
                return {"response": response_text}
        
        except Exception as e:
            print(f"Error communicating with Vertex AI: {e}")
            raise

class OllamaProvider:
    """LLM provider for a local Ollama instance."""
    def __init__(self):
        host = os.getenv("OLLAMA_HOST") or settings.OLLAMA_HOST
        self.client = ollama.Client(host=host)

    def generate_json(self, prompt: str, model: str = settings.OLLAMA_MODEL) -> Dict[str, Any]:
        print(f"Using OllamaProvider with model '{model}'...")
        try:
            response = self.client.chat(
                model=model,
                messages=[{'role': 'user', 'content': prompt}],
                format='json'
            )
            response_content = response['message']['content']
            return json.loads(response_content)
        except Exception as e:
            print(f"Error communicating with Ollama: {e}")
            raise

class TogetherAIProvider:
    """LLM provider for the Together.ai API."""
    def __init__(self):
        if not settings.TOGETHER_API_KEY:
            raise ValueError("TOGETHER_API_KEY is not set in the configuration.")
        self.api_key = settings.TOGETHER_API_KEY
        self.url = "https://api.together.xyz/v1/chat/completions"

    def generate_json(self, prompt: str, model: str = "mistralai/Mixtral-8x7B-Instruct-v0.1") -> Dict[str, Any]:
        print(f"Using TogetherAIProvider with model '{model}'...")
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }
        try:
            response = requests.post(self.url, headers=headers, json=data, timeout=60)
            response.raise_for_status()
            response_content = response.json()['choices'][0]['message']['content']
            return json.loads(response_content)
        except Exception as e:
            print(f"Error communicating with Together.ai: {e}")
            raise

class LlmClient:
    """Client for interacting with LLM providers."""
    
    def __init__(self, llm_config: Llm):
        self.llm_config = llm_config
        if llm_config.provider == "together":
            if not settings.TOGETHER_API_KEY:
                raise ValueError("TOGETHER_API_KEY is not set for Together.ai provider")
            self.provider = TogetherAIProvider()
        elif llm_config.provider == "vertex_ai":
            self.provider = VertexAIProvider()
        elif llm_config.provider == "ollama":
            self.provider = OllamaProvider()
        else:
            raise ValueError(f"Unsupported LLM provider: {llm_config.provider}")
    
    async def chat(self, prompt: str) -> str:
        """Send a chat message and return the response as a string."""
        try:
            # For conversational prompts, use a simple text generation approach
            if self.llm_config.provider == "ollama":
                # Use Ollama's chat method directly for conversational responses
                host = os.getenv("OLLAMA_HOST") or settings.OLLAMA_HOST
                client = ollama.Client(host=host)
                response = client.chat(
                    model=self.llm_config.model,
                    messages=[{'role': 'user', 'content': prompt}]
                )
                return response['message']['content']
            elif self.llm_config.provider == "vertex_ai":
                # Use Vertex AI's async chat method
                response = await self.provider.client.chat(prompt)
                return response
            else:
                # Fallback to the existing method for other providers
                result = self.provider.generate_json(prompt, self.llm_config.model)
                if isinstance(result, dict):
                    return json.dumps(result)
                return str(result)
        except Exception as e:
            print(f"Error in LlmClient.chat: {e}")
            raise

def get_llm_client() -> LLMProvider:
    """
    Factory function to get the appropriate LLM client.
    Priority: LLM_PROVIDER env var > Together.ai (if key available) > Ollama (fallback)
    """
    # Check for explicit LLM_PROVIDER setting
    llm_provider = os.getenv("LLM_PROVIDER") or settings.LLM_PROVIDER
    
    if llm_provider:
        llm_provider = llm_provider.lower()
        
        if llm_provider == "vertex_ai":
            print("LLM_PROVIDER set to vertex_ai. Using VertexAIProvider.")
            return VertexAIProvider()
        
        elif llm_provider == "together":
            if not settings.TOGETHER_API_KEY:
                raise ValueError("LLM_PROVIDER set to 'together' but TOGETHER_API_KEY is not set")
            print("LLM_PROVIDER set to together. Using TogetherAIProvider.")
            return TogetherAIProvider()
        
        elif llm_provider == "ollama":
            print("LLM_PROVIDER set to ollama. Using OllamaProvider.")
            return OllamaProvider()
        
        else:
            raise ValueError(f"Unsupported LLM_PROVIDER: {llm_provider}")
    
    # Fallback logic if LLM_PROVIDER not set
    if settings.TOGETHER_API_KEY:
        print("TOGETHER_API_KEY found. Using TogetherAIProvider.")
        return TogetherAIProvider()

    print("No LLM_PROVIDER or TOGETHER_API_KEY found. Falling back to OllamaProvider.")
    return OllamaProvider()

# A single client instance to be used by agents
llm_client = get_llm_client()

def generate_json(prompt: str, model: str = None) -> Dict[str, Any]:
    """
    A simple wrapper to call the configured LLM client.
    Allows specifying a model, otherwise uses the provider's default.
    """
    # The model parameter is a bit tricky with the fallback logic.
    # This implementation will use the default model for each provider.
    # A more advanced version could map generic model names to provider-specific ones.
    if model:
        return llm_client.generate_json(prompt, model=model)
    return llm_client.generate_json(prompt)
