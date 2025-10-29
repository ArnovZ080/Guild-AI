"""
Knowledge Library API Routes
Manages the private knowledge base for AI agents
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
import json
import uuid
from datetime import datetime
import logging
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from .auth_firebase import get_current_user

logger = logging.getLogger(__name__)

# Router with no prefix - main.py will add /api/knowledge
router = APIRouter(tags=["knowledge"])

@router.get("/health/ping")
async def knowledge_health_ping():
    return {"status": "ok"}

# Knowledge item model (simplified for now)
class KnowledgeItem:
    def __init__(self, id: str, title: str, content: str, category: str, 
                 subcategory: str = None, tags: List[str] = None, 
                 source: str = "admin", confidence_score: float = 1.0,
                 usage_count: int = 0, effectiveness_score: float = 0.0,
                 created_at: datetime = None, updated_at: datetime = None):
        self.id = id
        self.title = title
        self.content = content
        self.category = category
        self.subcategory = subcategory
        self.tags = tags or []
        self.source = source
        self.confidence_score = confidence_score
        self.usage_count = usage_count
        self.effectiveness_score = effectiveness_score
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

# In-memory storage for now (replace with database later)
knowledge_store = {}

@router.get("/items")
async def get_knowledge_items(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user)
):
    """Get all knowledge items with optional filtering"""
    try:
        items = list(knowledge_store.values())
        
        # Apply filters
        if category and category != "all":
            items = [item for item in items if item.category == category]
        
        if search:
            search_lower = search.lower()
            items = [item for item in items 
                    if search_lower in item.title.lower() or 
                       search_lower in item.content.lower()]
        
        # Sort by created_at desc
        items.sort(key=lambda x: x.created_at, reverse=True)
        
        # Apply limit
        items = items[:limit]
        
        return {
            "success": True,
            "items": [
                {
                    "id": item.id,
                    "title": item.title,
                    "content": item.content,
                    "category": item.category,
                    "subcategory": item.subcategory,
                    "tags": item.tags,
                    "source": item.source,
                    "confidence_score": item.confidence_score,
                    "usage_count": item.usage_count,
                    "effectiveness_score": item.effectiveness_score,
                    "created_at": item.created_at.isoformat(),
                    "updated_at": item.updated_at.isoformat()
                }
                for item in items
            ],
            "total": len(items)
        }
        
    except Exception as e:
        logger.error(f"Error getting knowledge items: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve knowledge items")

@router.post("/upload")
async def upload_knowledge_item(
    title: str,
    content: str,
    category: str,
    subcategory: Optional[str] = None,
    tags: Optional[str] = None,
    source: str = "admin",
    current_user: models.User = Depends(get_current_user)
):
    """Upload a new knowledge item"""
    try:
        # Validate category
        valid_categories = ["business", "marketing", "psychology", "creative", "technical", "general"]
        if category not in valid_categories:
            raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {valid_categories}")
        
        # Create knowledge item
        item_id = str(uuid.uuid4())
        tags_list = [tag.strip() for tag in tags.split(",")] if tags else []
        
        knowledge_item = KnowledgeItem(
            id=item_id,
            title=title,
            content=content,
            category=category,
            subcategory=subcategory,
            tags=tags_list,
            source=source
        )
        
        # Store the item
        knowledge_store[item_id] = knowledge_item
        
        logger.info(f"Knowledge item uploaded: {title}")
        
        return {
            "success": True,
            "message": "Knowledge item uploaded successfully",
            "item_id": item_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading knowledge item: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload knowledge item")

@router.get("/items/{item_id}")
async def get_knowledge_item(
    item_id: str,
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific knowledge item"""
    try:
        if item_id not in knowledge_store:
            raise HTTPException(status_code=404, detail="Knowledge item not found")
        
        item = knowledge_store[item_id]
        
        return {
            "success": True,
            "item": {
                "id": item.id,
                "title": item.title,
                "content": item.content,
                "category": item.category,
                "subcategory": item.subcategory,
                "tags": item.tags,
                "source": item.source,
                "confidence_score": item.confidence_score,
                "usage_count": item.usage_count,
                "effectiveness_score": item.effectiveness_score,
                "created_at": item.created_at.isoformat(),
                "updated_at": item.updated_at.isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting knowledge item: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve knowledge item")

@router.delete("/items/{item_id}")
async def delete_knowledge_item(
    item_id: str,
    current_user: models.User = Depends(get_current_user)
):
    """Delete a knowledge item"""
    try:
        if item_id not in knowledge_store:
            raise HTTPException(status_code=404, detail="Knowledge item not found")
        
        del knowledge_store[item_id]
        
        logger.info(f"Knowledge item deleted: {item_id}")
        
        return {
            "success": True,
            "message": "Knowledge item deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting knowledge item: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete knowledge item")

@router.get("/search")
async def search_knowledge(
    query: str,
    category: Optional[str] = None,
    limit: int = 20
):
    """Search knowledge items (for agents to use)"""
    try:
        items = list(knowledge_store.values())
        
        # Apply category filter if provided
        if category and category != "all":
            items = [item for item in items if item.category == category]
        
        # Simple text search
        query_lower = query.lower()
        matching_items = []
        
        for item in items:
            if (query_lower in item.title.lower() or 
                query_lower in item.content.lower() or
                any(query_lower in tag.lower() for tag in item.tags)):
                matching_items.append(item)
        
        # Sort by relevance (simple scoring)
        matching_items.sort(key=lambda x: (
            x.effectiveness_score,
            x.usage_count,
            x.confidence_score
        ), reverse=True)
        
        # Apply limit
        matching_items = matching_items[:limit]
        
        return {
            "success": True,
            "items": [
                {
                    "id": item.id,
                    "title": item.title,
                    "content": item.content,
                    "category": item.category,
                    "subcategory": item.subcategory,
                    "tags": item.tags,
                    "confidence_score": item.confidence_score,
                    "effectiveness_score": item.effectiveness_score
                }
                for item in matching_items
            ],
            "total": len(matching_items)
        }
        
    except Exception as e:
        logger.error(f"Error searching knowledge: {e}")
        raise HTTPException(status_code=500, detail="Failed to search knowledge")

@router.get("/categories")
async def get_categories():
    """Get available knowledge categories"""
    return {
        "success": True,
        "categories": [
            {"value": "business", "label": "Business & Strategy", "description": "Frameworks, case studies, scaling strategies"},
            {"value": "marketing", "label": "Marketing & Sales", "description": "Campaigns, copywriting, conversion psychology"},
            {"value": "psychology", "label": "Psychology & NLP", "description": "NLP techniques, persuasion, behavioral insights"},
            {"value": "creative", "label": "Creative & Content", "description": "Image prompts, video hooks, storytelling"},
            {"value": "technical", "label": "Technical & SEO", "description": "SEO strategies, technical guides, optimization"},
            {"value": "general", "label": "General Knowledge", "description": "Universal principles, cross-domain insights, experimental knowledge"}
        ]
    }

@router.post("/items/{item_id}/usage")
async def track_usage(
    item_id: str,
    agent_type: str,
    effectiveness_rating: Optional[float] = None
):
    """Track usage of a knowledge item by an agent"""
    try:
        if item_id not in knowledge_store:
            raise HTTPException(status_code=404, detail="Knowledge item not found")
        
        item = knowledge_store[item_id]
        item.usage_count += 1
        
        # Update effectiveness score if provided
        if effectiveness_rating is not None:
            # Simple moving average
            if item.effectiveness_score == 0:
                item.effectiveness_score = effectiveness_rating
            else:
                item.effectiveness_score = (item.effectiveness_score + effectiveness_rating) / 2
        
        item.updated_at = datetime.utcnow()
        
        logger.info(f"Knowledge item usage tracked: {item_id} by {agent_type}")
        
        return {
            "success": True,
            "message": "Usage tracked successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking usage: {e}")
        raise HTTPException(status_code=500, detail="Failed to track usage")