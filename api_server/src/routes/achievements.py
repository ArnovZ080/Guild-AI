"""
Achievements API Routes

Handles achievement tracking, storage, and management.
Ready for Vertex AI integration for intelligent achievement detection.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/achievements", tags=["achievements"])


# ===== MODELS =====

class AgentFlowStep(BaseModel):
    agent: str
    action: str
    description: str
    timestamp: Optional[str] = None


class AchievementCreate(BaseModel):
    category: str
    metric: str
    currentValue: float
    thresholdValue: float
    title: Optional[str] = None
    description: Optional[str] = None
    type: str = "milestone"
    impact: str = "medium"
    agentFlow: List[AgentFlowStep] = []
    details: dict = {}
    metadata: dict = {}


class Achievement(BaseModel):
    id: str
    category: str
    metric: str
    currentValue: float
    thresholdValue: float
    title: str
    description: str
    achievedAt: str
    status: str = "completed"
    impact: str
    celebration: str
    icon: str
    type: str
    agentFlow: List[AgentFlowStep]
    details: dict
    metadata: dict


class AchievementStats(BaseModel):
    total: int
    byCategory: dict
    byImpact: dict
    thisMonth: int
    thisYear: int
    recent: List[Achievement]


class MetricUpdate(BaseModel):
    category: str
    metric: str
    value: float
    agentName: Optional[str] = None
    action: Optional[str] = None
    metadata: dict = {}


# ===== MOCK DATABASE (Replace with Firestore/PostgreSQL) =====

# In production, this would be replaced with Firestore or PostgreSQL
achievements_db = []
thresholds_db = {
    "social": {
        "instagram_followers": [100, 500, 1000, 5000, 10000, 50000, 100000],
        "twitter_followers": [100, 500, 1000, 5000, 10000, 50000, 100000],
        "linkedin_connections": [100, 500, 1000, 2500, 5000, 10000],
        "facebook_likes": [100, 500, 1000, 5000, 10000, 50000],
        "tiktok_followers": [100, 500, 1000, 10000, 50000, 100000],
        "youtube_subscribers": [100, 500, 1000, 10000, 50000, 100000],
        "post_engagement_rate": [5, 10, 15, 20, 25],
        "reel_views": [1000, 5000, 10000, 50000, 100000, 500000, 1000000],
        "video_views": [1000, 5000, 10000, 50000, 100000, 500000, 1000000]
    },
    "financial": {
        "monthly_revenue": [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000],
        "annual_revenue": [10000, 50000, 100000, 250000, 500000, 1000000],
        "profit_margin": [10, 15, 20, 25, 30, 35, 40],
        "cost_reduction": [5, 10, 15, 20, 25, 30],
        "mrr_growth": [10, 25, 50, 100],
        "customer_ltv": [100, 500, 1000, 2500, 5000, 10000]
    },
    "marketing": {
        "email_open_rate": [15, 20, 25, 30, 35, 40],
        "email_click_rate": [2, 5, 8, 10, 15, 20],
        "campaign_roi": [200, 300, 400, 500, 1000],
        "conversion_rate": [1, 2, 3, 5, 7, 10],
        "lead_generation": [100, 500, 1000, 5000, 10000],
        "campaign_impressions": [10000, 50000, 100000, 500000, 1000000]
    },
    "growth": {
        "total_customers": [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
        "active_users": [50, 100, 500, 1000, 5000, 10000, 50000],
        "customer_retention": [70, 75, 80, 85, 90, 95],
        "churn_rate_reduction": [5, 10, 15, 20, 25],
        "nps_score": [30, 40, 50, 60, 70, 80, 90]
    },
    "productivity": {
        "automation_percentage": [10, 25, 50, 75, 90],
        "tasks_automated": [10, 25, 50, 100, 250, 500],
        "time_saved_hours": [10, 50, 100, 250, 500, 1000],
        "process_efficiency": [10, 20, 30, 40, 50]
    },
    "team": {
        "team_size": [5, 10, 25, 50, 100],
        "employee_satisfaction": [70, 75, 80, 85, 90, 95],
        "training_completion": [50, 75, 90, 100]
    },
    "content": {
        "content_pieces_published": [10, 50, 100, 250, 500, 1000],
        "blog_traffic": [1000, 5000, 10000, 50000, 100000],
        "content_engagement": [5, 10, 15, 20, 25]
    }
}


# ===== HELPER FUNCTIONS =====

def generate_achievement_id() -> str:
    """Generate unique achievement ID"""
    import uuid
    return f"achievement-{uuid.uuid4()}"


def generate_achievement_title(category: str, metric: str, value: float) -> str:
    """Generate human-readable achievement title"""
    titles = {
        "social": {
            "instagram_followers": f"{int(value):,} Instagram Followers!",
            "twitter_followers": f"{int(value):,} Twitter Followers!",
            "linkedin_connections": f"{int(value):,} LinkedIn Connections!",
            "reel_views": f"{int(value):,} Reel Views!",
            "post_engagement_rate": f"{value}% Engagement Rate!"
        },
        "financial": {
            "monthly_revenue": f"${int(value):,} Monthly Revenue!",
            "profit_margin": f"{value}% Profit Margin!",
            "cost_reduction": f"{value}% Cost Reduction!"
        },
        "marketing": {
            "email_open_rate": f"{value}% Email Open Rate!",
            "campaign_roi": f"{value}% Campaign ROI!",
            "conversion_rate": f"{value}% Conversion Rate!"
        },
        "growth": {
            "total_customers": f"{int(value):,} Total Customers!",
            "customer_retention": f"{value}% Customer Retention!"
        }
    }
    
    return titles.get(category, {}).get(metric, f"{metric} milestone: {value}")


def generate_description(category: str, metric: str, threshold: float, current: float) -> str:
    """Generate achievement description"""
    metric_name = metric.replace('_', ' ').title()
    return f"Successfully reached {threshold:,.0f} in {metric_name}. Current value: {current:,.0f}"


def generate_celebration(category: str) -> str:
    """Generate celebration message"""
    celebrations = {
        "social": "🎉 Social media milestone reached!",
        "financial": "💰 Financial goal achieved!",
        "marketing": "📈 Marketing success!",
        "growth": "🚀 Growth milestone!",
        "productivity": "⚡ Productivity boost!",
        "team": "👥 Team milestone!",
        "content": "✍️ Content achievement!"
    }
    return celebrations.get(category, "🎊 Milestone achieved!")


def calculate_impact(category: str, metric: str, value: float) -> str:
    """Calculate achievement impact level"""
    high_impact_metrics = ['monthly_revenue', 'total_customers', 'profit_margin']
    medium_impact_metrics = ['email_open_rate', 'customer_retention', 'automation_percentage']
    
    if metric in high_impact_metrics or value >= 10000:
        return 'high'
    if metric in medium_impact_metrics or value >= 1000:
        return 'medium'
    return 'low'


def get_icon_name(category: str) -> str:
    """Get icon name for category"""
    icons = {
        "social": "Globe",
        "financial": "DollarSign",
        "marketing": "TrendingUp",
        "growth": "Users",
        "productivity": "Zap",
        "team": "Users",
        "content": "FileText"
    }
    return icons.get(category, "Award")


def check_threshold_crossed(category: str, metric: str, value: float) -> Optional[float]:
    """Check if value crosses any achievement threshold"""
    thresholds = thresholds_db.get(category, {}).get(metric, [])
    
    # Get already achieved thresholds
    achieved = [
        a["thresholdValue"] 
        for a in achievements_db 
        if a["category"] == category and a["metric"] == metric
    ]
    
    # Find highest threshold crossed but not yet achieved
    crossed = None
    for threshold in thresholds:
        if value >= threshold and threshold not in achieved:
            crossed = threshold
    
    return crossed


# ===== API ENDPOINTS =====

@router.post("", response_model=Achievement)
async def create_achievement(achievement_data: AchievementCreate):
    """
    Create a new achievement
    
    This endpoint is called when an achievement is detected.
    In production, this would:
    1. Store in Firestore/PostgreSQL
    2. Trigger Vertex AI for intelligent celebration messaging
    3. Send notifications via Pub/Sub
    """
    try:
        achievement_id = generate_achievement_id()
        
        achievement = {
            "id": achievement_id,
            "category": achievement_data.category,
            "metric": achievement_data.metric,
            "currentValue": achievement_data.currentValue,
            "thresholdValue": achievement_data.thresholdValue,
            "title": achievement_data.title or generate_achievement_title(
                achievement_data.category,
                achievement_data.metric,
                achievement_data.thresholdValue
            ),
            "description": achievement_data.description or generate_description(
                achievement_data.category,
                achievement_data.metric,
                achievement_data.thresholdValue,
                achievement_data.currentValue
            ),
            "achievedAt": datetime.utcnow().isoformat(),
            "status": "completed",
            "impact": achievement_data.impact or calculate_impact(
                achievement_data.category,
                achievement_data.metric,
                achievement_data.thresholdValue
            ),
            "celebration": generate_celebration(achievement_data.category),
            "icon": get_icon_name(achievement_data.category),
            "type": achievement_data.type,
            "agentFlow": [step.dict() for step in achievement_data.agentFlow],
            "details": achievement_data.details,
            "metadata": {
                **achievement_data.metadata,
                "source": achievement_data.metadata.get("source", "automatic")
            }
        }
        
        achievements_db.append(achievement)
        
        logger.info(f"Achievement created: {achievement['title']}")
        
        # TODO: In production, add:
        # - Firestore/PostgreSQL storage
        # - Vertex AI for enhanced celebration messages
        # - Pub/Sub notification to frontend
        # - Analytics event tracking
        
        return achievement
        
    except Exception as e:
        logger.error(f"Error creating achievement: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[Achievement])
async def get_achievements(
    category: Optional[str] = Query(None),
    metric: Optional[str] = Query(None),
    limit: Optional[int] = Query(100),
    offset: Optional[int] = Query(0)
):
    """
    Get all achievements with optional filters
    """
    try:
        filtered = achievements_db
        
        if category:
            filtered = [a for a in filtered if a["category"] == category]
        
        if metric:
            filtered = [a for a in filtered if a["metric"] == metric]
        
        # Sort by date (newest first)
        filtered = sorted(
            filtered,
            key=lambda x: x["achievedAt"],
            reverse=True
        )
        
        return filtered[offset:offset + limit]
        
    except Exception as e:
        logger.error(f"Error fetching achievements: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=AchievementStats)
async def get_achievement_stats():
    """
    Get achievement statistics
    """
    try:
        now = datetime.utcnow()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        by_category = {}
        by_impact = {"high": 0, "medium": 0, "low": 0}
        this_month = 0
        this_year = 0
        
        for achievement in achievements_db:
            # By category
            cat = achievement["category"]
            by_category[cat] = by_category.get(cat, 0) + 1
            
            # By impact
            impact = achievement["impact"]
            by_impact[impact] = by_impact.get(impact, 0) + 1
            
            # Time-based counts
            achieved_at = datetime.fromisoformat(achievement["achievedAt"].replace('Z', '+00:00'))
            if achieved_at >= month_start:
                this_month += 1
            if achieved_at >= year_start:
                this_year += 1
        
        recent = sorted(
            achievements_db,
            key=lambda x: x["achievedAt"],
            reverse=True
        )[:5]
        
        return {
            "total": len(achievements_db),
            "byCategory": by_category,
            "byImpact": by_impact,
            "thisMonth": this_month,
            "thisYear": this_year,
            "recent": recent
        }
        
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{achievement_id}", response_model=Achievement)
async def get_achievement(achievement_id: str):
    """
    Get a specific achievement by ID
    """
    achievement = next((a for a in achievements_db if a["id"] == achievement_id), None)
    
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    return achievement


@router.post("/track-metric")
async def track_metric(metric_update: MetricUpdate):
    """
    Track a metric update and check for achievement threshold crossing
    
    This endpoint is called by agents when they update metrics.
    It automatically detects and creates achievements when thresholds are crossed.
    """
    try:
        threshold_crossed = check_threshold_crossed(
            metric_update.category,
            metric_update.metric,
            metric_update.value
        )
        
        if threshold_crossed:
            # Create achievement
            achievement_data = AchievementCreate(
                category=metric_update.category,
                metric=metric_update.metric,
                currentValue=metric_update.value,
                thresholdValue=threshold_crossed,
                agentFlow=[
                    AgentFlowStep(
                        agent=metric_update.agentName or "System",
                        action=metric_update.action or "Metric Update",
                        description=f"Updated {metric_update.metric} to {metric_update.value}",
                        timestamp=datetime.utcnow().isoformat()
                    )
                ] if metric_update.agentName else [],
                metadata=metric_update.metadata
            )
            
            achievement = await create_achievement(achievement_data)
            
            return {
                "achievementCreated": True,
                "achievement": achievement,
                "message": f"Congratulations! Achievement unlocked: {achievement['title']}"
            }
        
        return {
            "achievementCreated": False,
            "message": "Metric tracked successfully"
        }
        
    except Exception as e:
        logger.error(f"Error tracking metric: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/thresholds/{category}")
async def get_category_thresholds(category: str):
    """
    Get achievement thresholds for a category
    """
    if category not in thresholds_db:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return thresholds_db[category]


@router.put("/thresholds/{category}/{metric}")
async def update_thresholds(category: str, metric: str, thresholds: List[float]):
    """
    Update achievement thresholds for a specific metric
    
    This allows users to customize their achievement milestones
    """
    if category not in thresholds_db:
        thresholds_db[category] = {}
    
    thresholds_db[category][metric] = sorted(thresholds)
    
    return {
        "message": "Thresholds updated successfully",
        "category": category,
        "metric": metric,
        "thresholds": thresholds_db[category][metric]
    }


@router.delete("/{achievement_id}")
async def delete_achievement(achievement_id: str):
    """
    Delete an achievement
    """
    global achievements_db
    
    achievement = next((a for a in achievements_db if a["id"] == achievement_id), None)
    
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    achievements_db = [a for a in achievements_db if a["id"] != achievement_id]
    
    return {"message": "Achievement deleted successfully"}


# ===== VERTEX AI INTEGRATION (TODO) =====

async def enhance_with_vertex_ai(achievement: dict) -> dict:
    """
    Use Vertex AI to generate enhanced celebration messages
    
    This would use Vertex AI's Gemini model to:
    1. Generate personalized celebration messages
    2. Suggest next milestones
    3. Analyze achievement patterns
    4. Provide insights
    """
    # TODO: Implement Vertex AI integration
    # from google.cloud import aiplatform
    # from vertexai.preview.generative_models import GenerativeModel
    
    # model = GenerativeModel("gemini-pro")
    # prompt = f"Generate a personalized celebration message for: {achievement['title']}"
    # response = model.generate_content(prompt)
    
    # achievement['aiEnhancedCelebration'] = response.text
    
    return achievement

