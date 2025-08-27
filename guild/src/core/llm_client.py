from typing import Protocol, Dict, Any
import ollama
import requests
import json
from guild.src.core.config import settings

class LLMProvider(Protocol):
    """A protocol for LLM providers, ensuring they have a generate_json method."""
    def generate_json(self, prompt: str, model: str) -> Dict[str, Any]:
        ...

class OllamaProvider:
    """LLM provider for a local Ollama instance."""
    def __init__(self):
        self.client = ollama.Client(host=settings.OLLAMA_HOST)

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

def get_llm_client() -> LLMProvider:
    """
    Factory function to get the appropriate LLM client.
    It prioritizes Together.ai if a key is available, otherwise falls back to Ollama.
    """
    if settings.TOGETHER_API_KEY:
        print("TOGETHER_API_KEY found. Using TogetherAIProvider.")
        return TogetherAIProvider()

    print("No TOGETHER_API_KEY found. Falling back to OllamaProvider.")
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
