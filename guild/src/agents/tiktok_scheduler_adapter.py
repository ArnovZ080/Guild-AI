from typing import Dict, Any, List


class TikTokSchedulerAdapter:
    """
    Minimal TikTok scheduling adapter placeholder.
    Replace with real TikTok API integration when credentials are available.
    """

    def __init__(self, access_token: str = None, advertiser_id: str = None):
        self.access_token = access_token
        self.advertiser_id = advertiser_id

    async def schedule_posts(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results: List[Dict[str, Any]] = []
        for it in items:
            results.append({
                "platform": "tiktok",
                "content_id": it.get("content_id"),
                "scheduled_date": it.get("scheduled_date"),
                "publish_id": f"tt_{it.get('content_id')}",
                "status": "scheduled"
            })
        return results


