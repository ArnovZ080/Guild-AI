import requests
from typing import Dict, Any

def push_to_zapier(webhook_url: str, data: Dict[str, Any]):
    """
    Pushes data to a configured Zapier webhook URL.

    Args:
        webhook_url: The specific URL for the Zapier webhook.
        data: A JSON-serializable dictionary to send as the payload.
    """
    if not webhook_url:
        print("Zapier webhook URL not provided. Skipping push.")
        return

    print(f"Pushing data to Zapier webhook: {webhook_url}")

    try:
        response = requests.post(webhook_url, json=data, timeout=30)
        response.raise_for_status()
        print("Successfully pushed data to Zapier.")
    except requests.exceptions.RequestException as e:
        print(f"Failed to push data to Zapier. Error: {e}")
        raise
