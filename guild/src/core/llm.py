import ollama
import json
from guild.src.core.config import settings

def get_ollama_client():
    """Initializes and returns the Ollama client."""
    return ollama.Client(host=settings.OLLAMA_HOST)

def generate_json(prompt: str, model: str = settings.OLLAMA_MODEL) -> dict:
    """
    Generates a JSON object from a prompt using a specified Ollama model.

    Args:
        prompt: The prompt to send to the LLM.
        model: The name of the Ollama model to use.

    Returns:
        A dictionary parsed from the LLM's JSON response.

    Raises:
        ValueError: If the response from the LLM is not valid JSON.
    """
    client = get_ollama_client()

    print(f"Sending prompt to Ollama model '{model}':\n---PROMPT---\n{prompt}\n------------")

    try:
        response = client.chat(
            model=model,
            messages=[{'role': 'user', 'content': prompt}],
            format='json' # Ollama's JSON mode is used to enforce JSON output
        )

        response_content = response['message']['content']

        # The content should be a JSON string, so we parse it.
        json_response = json.loads(response_content)

        print("Received and parsed valid JSON response from Ollama.")
        return json_response

    except json.JSONDecodeError as e:
        print(f"Ollama response was not valid JSON: {e}")
        print(f"Raw response content:\n{response_content}")
        raise ValueError("Failed to get a valid JSON response from the language model.")
    except Exception as e:
        print(f"An unexpected error occurred while communicating with Ollama: {e}")
        raise
