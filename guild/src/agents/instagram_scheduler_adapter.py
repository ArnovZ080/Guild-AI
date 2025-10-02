from typing import Dict, Any, List


class InstagramSchedulerAdapter:
    """
    Minimal Instagram scheduling adapter placeholder (via Graph API on FB pages).
    Replace with real IG posting when credentials are available.
    """

    def __init__(self, access_token: str = None, instagram_business_account_id: str = None):
        self.access_token = access_token
        self.instagram_business_account_id = instagram_business_account_id

    async def schedule_posts(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results: List[Dict[str, Any]] = []
        for it in items:
            results.append({
                "platform": "instagram",
                "content_id": it.get("content_id"),
                "scheduled_date": it.get("scheduled_date"),
                "publish_id": f"ig_{it.get('content_id')}",
                "status": "scheduled"
            })
        return results


