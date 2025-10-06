from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


router = APIRouter(prefix="/conversations", tags=["Conversations"])


class ConversationFilter(BaseModel):
    type: Optional[str] = None
    status: Optional[str] = None
    agent: Optional[str] = None
    priority: Optional[str] = None
    search: Optional[str] = None
    sources: Optional[List[str]] = None


def _mock_conversations() -> List[Dict[str, Any]]:
    # Minimal mock aligned to frontend expectations; dates as ISO strings
    def d(year, month, day, hour=0, minute=0):
        return datetime(year, month, day, hour, minute).isoformat()

    return [
        {
            "id": "1",
            "type": "email",
            "subject": "Product Demo Request - TechCorp Solutions",
            "participants": [
                {"name": "Sarah Johnson", "email": "sarah.johnson@techcorp.com", "role": "customer"},
                {"name": "Sales Agent", "email": "sales@guild-ai.com", "role": "agent"},
            ],
            "status": "active",
            "priority": "high",
            "lastMessage": "Looking forward to the demo next week. Please send calendar invite.",
            "lastActivity": d(2024, 1, 12, 14, 30),
            "createdAt": d(2024, 1, 8, 10, 15),
            "messageCount": 8,
            "tags": ["demo", "enterprise", "hot-lead"],
            "agentType": "sales",
            "customerId": "1",
            "summary": "Customer interested in enterprise package. Demo scheduled for next week.",
            "sentiment": "positive",
            "nextAction": "Send calendar invite and demo materials",
            "nextActionDate": d(2024, 1, 15),
            "estimatedValue": 50000,
            "actualValue": 0,
            "source": "customer_intelligence_agent",
            "agentReasoning": "Customer showed high engagement with product demo and requested enterprise pricing.",
        },
        {
            "id": "2",
            "type": "voice",
            "subject": "Support Call - Account Issues",
            "participants": [
                {"name": "Michael Chen", "email": "michael@growthmarketing.com", "role": "customer"},
                {"name": "Support Agent", "email": "support@guild-ai.com", "role": "agent"},
            ],
            "status": "resolved",
            "priority": "medium",
            "lastMessage": "Issue resolved. Customer satisfied with solution.",
            "lastActivity": d(2024, 1, 11, 16, 45),
            "createdAt": d(2024, 1, 11, 15, 20),
            "messageCount": 1,
            "tags": ["support", "resolved", "billing"],
            "agentType": "support",
            "customerId": "2",
            "summary": "Customer had billing issues. Resolved by updating payment method.",
            "sentiment": "neutral",
            "duration": 15,
            "recordingUrl": "/recordings/call_20240111_1520.mp3",
            "estimatedValue": 0,
            "actualValue": 0,
            "source": "customer_intelligence_agent",
            "agentReasoning": "Customer reported payment failure - immediate attention required to prevent service interruption.",
        },
        {
            "id": "3",
            "type": "chat",
            "subject": "Website Chat - Pricing Inquiry",
            "participants": [
                {"name": "Emily Rodriguez", "email": "emily@startupxyz.com", "role": "customer"},
                {"name": "Chat Agent", "email": "chat@guild-ai.com", "role": "agent"},
            ],
            "status": "active",
            "priority": "medium",
            "lastMessage": "Can you send me more information about the startup package?",
            "lastActivity": d(2024, 1, 12, 11, 20),
            "createdAt": d(2024, 1, 12, 11, 15),
            "messageCount": 12,
            "tags": ["pricing", "startup", "inquiry"],
            "agentType": "chat",
            "customerId": "3",
            "summary": "Startup founder inquiring about pricing. Interested in basic package.",
            "sentiment": "positive",
            "nextAction": "Send pricing information and schedule follow-up call",
            "nextActionDate": d(2024, 1, 13),
            "estimatedValue": 5000,
            "actualValue": 0,
            "source": "content_intelligence_agent",
            "agentReasoning": "Customer spent significant time on pricing pages indicating strong purchase intent.",
        },
    ]


@router.post("")
async def list_conversations(filters: ConversationFilter):
    try:
        conversations = _mock_conversations()
        # Basic filtering
        if filters.type and filters.type != "all":
            conversations = [c for c in conversations if c.get("type") == filters.type]
        if filters.status and filters.status != "all":
            conversations = [c for c in conversations if c.get("status") == filters.status]
        if filters.agent and filters.agent != "all":
            conversations = [c for c in conversations if c.get("agentType") == filters.agent]
        if filters.priority and filters.priority != "all":
            conversations = [c for c in conversations if c.get("priority") == filters.priority]
        if filters.search:
            s = filters.search.lower()
            def matches(c):
                subject = (c.get("subject") or "").lower()
                last = (c.get("lastMessage") or "").lower()
                names = " ".join([(p.get("name") or "") for p in c.get("participants", [])]).lower()
                return s in subject or s in last or s in names
            conversations = [c for c in conversations if matches(c)]

        return {"conversations": conversations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str):
    try:
        conversations = _mock_conversations()
        conv = next((c for c in conversations if c.get("id") == conversation_id), None)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"conversation": conv}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
async def get_conversation_analytics():
    try:
        conversations = _mock_conversations()
        def parse_dt(value: Any) -> datetime:
            try:
                return datetime.fromisoformat(value) if isinstance(value, str) else value
            except Exception:
                return datetime.utcnow()

        total = len(conversations)
        active = len([c for c in conversations if c.get("status") == "active"])
        resolved = len([c for c in conversations if c.get("status") == "resolved"])
        automated = len([c for c in conversations if c.get("status") == "automated"])
        high_value = len([c for c in conversations if (c.get("estimatedValue") or 0) >= 50000])
        recent = len([
            c for c in conversations
            if (datetime.utcnow() - parse_dt(c.get("lastActivity"))).days <= 7
        ])

        return {
            "analytics": {
                "total": total,
                "active": active,
                "resolved": resolved,
                "automated": automated,
                "highValue": high_value,
                "recent": recent,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/customers/{email}/messages")
async def get_messages_for_customer(email: str = Query(..., description="Customer email")):
    try:
        email_l = (email or "").lower()
        conversations = _mock_conversations()
        relevant = [
            c for c in conversations
            if any((p.get("role") == "customer") and (p.get("email") or "").lower() == email_l for p in c.get("participants", []))
        ]

        messages: List[Dict[str, Any]] = []
        for conv in relevant:
            created = conv.get("createdAt")
            last = conv.get("lastActivity") or created
            channel = "phone" if conv.get("type") == "voice" else conv.get("type")
            subject = conv.get("subject") or f"{(conv.get('type') or 'MSG').upper()} thread"
            preview = conv.get("lastMessage") or conv.get("summary") or ""
            sentiment = conv.get("sentiment") or "neutral"
            tags = conv.get("tags") or []
            source = conv.get("source") or "customer_intelligence_agent"

            messages.append({
                "id": f"m_{conv['id']}_in",
                "channel": channel,
                "direction": "in",
                "subject": subject,
                "timestamp": created,
                "preview": preview,
                "sentiment": sentiment,
                "source": source,
                "tags": tags,
            })
            messages.append({
                "id": f"m_{conv['id']}_out",
                "channel": channel,
                "direction": "out",
                "subject": subject,
                "timestamp": last,
                "preview": preview,
                "sentiment": sentiment,
                "source": source,
                "tags": tags,
            })

        messages.sort(key=lambda m: m.get("timestamp") or "", reverse=True)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


