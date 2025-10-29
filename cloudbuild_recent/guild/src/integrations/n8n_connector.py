import requests
from guild.src.core.config import settings
from typing import Dict, Any

def push_to_n8n(data: Dict[str, Any]):
    """
    Pushes data to a configured n8n webhook URL.

    Args:
        data: A JSON-serializable dictionary to send as the payload.
    """
    webhook_url = settings.N8N_WEBHOOK_URL

    if not webhook_url:
        print("N8N_WEBHOOK_URL is not configured. Skipping push to n8n.")
        return

    print(f"Pushing data to n8n webhook: {webhook_url}")

    try:
        response = requests.post(webhook_url, json=data, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes
        print("Successfully pushed data to n8n.")
    except requests.exceptions.RequestException as e:
        print(f"Failed to push data to n8n. Error: {e}")
        # In a real application, you might want to add this to a retry queue.
        raise
