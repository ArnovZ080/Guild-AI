"""
Quality Control API Endpoints
Exposes LLM Auditor, Image Scoring, and SEO Optimizer capabilities
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from .auth import get_current_user
from .. import models
from ..database import get_db

# Import agents (with fallbacks if not available)
try:
    from guild.src.agents.llm_auditor_agent import llm_auditor
    from guild.src.agents.image_scoring_agent import image_scoring_agent
    from guild.src.agents.seo_brand_optimizer import seo_optimizer
    AGENTS_AVAILABLE = True
except ImportError as e:
    print(f"Quality control agents not available: {e}")
    llm_auditor = None
    image_scoring_agent = None
    seo_optimizer = None
    AGENTS_AVAILABLE = False

router = APIRouter(prefix="/quality", tags=["quality_control"])

# Request models
class AuditContentRequest(BaseModel):
    content: str
    content_type: str  # blog, social, email, ad, etc.

class ScoreImageRequest(BaseModel):
    image_url: str
    purpose: Optional[str] = "marketing"

class OptimizeSEORequest(BaseModel):
    content: str
    target_keywords: List[str]
    content_type: Optional[str] = "blog"

class AnalyzeCompetitorsRequest(BaseModel):
    industry: Optional[str] = None

class SuggestKeywordsRequest(BaseModel):
    topic: str

# Endpoints

@router.post("/audit-content")
async def audit_content(
    request: AuditContentRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Audit AI-generated content for quality, brand alignment, and accuracy
    Uses LLM Auditor with business context from source of truth
    """
    if not AGENTS_AVAILABLE or not llm_auditor:
        raise HTTPException(status_code=503, detail="Quality control agents not available")
    
    try:
        # Get user's source of truth
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        business_context = {}
        if onboarding:
            business_context = {
                "business": {
                    "type": onboarding.business_type,
                    "description": onboarding.business_description,
                    "industry": onboarding.industry
                },
                "brand": {
                    "voice_tone": onboarding.brand_voice_tone,
                    "values": onboarding.brand_values,
                    "differentiation": onboarding.brand_differentiation,
                    "personality": onboarding.brand_personality
                },
                "audience": {
                    "target": onboarding.target_audience
                }
            }
        
        # Run audit
        audit_result = await llm_auditor.audit_content(
            content=request.content,
            content_type=request.content_type,
            business_context=business_context
        )
        
        return {
            "overall_score": audit_result.overall_score,
            "approved": audit_result.approved,
            "scores": {
                "brand_alignment": audit_result.brand_alignment,
                "factual_accuracy": audit_result.factual_accuracy,
                "tone_consistency": audit_result.tone_consistency,
                "seo_score": audit_result.seo_score,
                "engagement_potential": audit_result.engagement_potential
            },
            "recommendations": audit_result.recommendations,
            "issues": audit_result.issues
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content audit failed: {str(e)}")

@router.post("/score-image")
async def score_image(
    request: ScoreImageRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Score image for quality and brand alignment using Gemini Vision
    Uses FREE Gemini Flash Vision model
    """
    if not AGENTS_AVAILABLE or not image_scoring_agent:
        raise HTTPException(status_code=503, detail="Image scoring not available")
    
    try:
        # Get user's source of truth
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        business_context = {}
        if onboarding:
            business_context = {
                "business": {"type": onboarding.business_type},
                "brand": {
                    "colors": onboarding.brand_colors,
                    "personality": onboarding.brand_personality
                },
                "audience": {"target": onboarding.target_audience}
            }
        
        # Score image
        score_result = await image_scoring_agent.score_image(
            image_url=request.image_url,
            business_context=business_context,
            purpose=request.purpose
        )
        
        return {
            "overall_score": score_result.overall_score,
            "approved": score_result.approved,
            "scores": {
                "visual_quality": score_result.visual_quality,
                "brand_alignment": score_result.brand_alignment,
                "audience_appeal": score_result.audience_appeal,
                "message_clarity": score_result.message_clarity,
                "professional_appearance": score_result.professional_appearance
            },
            "recommendations": score_result.recommendations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image scoring failed: {str(e)}")

@router.post("/optimize-seo")
async def optimize_seo(
    request: OptimizeSEORequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get SEO optimization recommendations with Google Search grounding
    Uses current SEO trends from the web
    """
    if not AGENTS_AVAILABLE or not seo_optimizer:
        raise HTTPException(status_code=503, detail="SEO optimizer not available")
    
    try:
        # Get user's source of truth
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        business_context = {}
        if onboarding:
            business_context = {
                "business": {
                    "type": onboarding.business_type,
                    "industry": onboarding.industry
                },
                "brand": {
                    "voice_tone": onboarding.brand_voice_tone
                },
                "audience": {
                    "target": onboarding.target_audience
                }
            }
        
        # Get SEO recommendations
        seo_result = await seo_optimizer.optimize_content(
            content=request.content,
            target_keywords=request.target_keywords,
            business_context=business_context,
            content_type=request.content_type
        )
        
        return {
            "overall_seo_score": seo_result.overall_seo_score,
            "keyword_suggestions": seo_result.keyword_suggestions,
            "meta_description": seo_result.meta_description,
            "title_tag": seo_result.title_tag,
            "heading_structure": seo_result.heading_structure,
            "internal_links": seo_result.internal_links,
            "content_improvements": seo_result.content_improvements,
            "competitor_insights": seo_result.competitor_insights
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SEO optimization failed: {str(e)}")

@router.post("/analyze-competitors")
async def analyze_competitors(
    request: AnalyzeCompetitorsRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Real-time competitor analysis with Google Search"""
    if not AGENTS_AVAILABLE or not seo_optimizer:
        raise HTTPException(status_code=503, detail="SEO optimizer not available")
    
    try:
        # Get user's source of truth
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        industry = request.industry or (onboarding.industry if onboarding else "general")
        
        business_context = {}
        if onboarding:
            business_context = {
                "business": {
                    "type": onboarding.business_type,
                    "industry": onboarding.industry
                },
                "brand": {
                    "differentiation": onboarding.brand_differentiation
                }
            }
        
        # Analyze competitors
        analysis = await seo_optimizer.analyze_competitors(industry, business_context)
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Competitor analysis failed: {str(e)}")

@router.post("/suggest-keywords")
async def suggest_keywords(
    request: SuggestKeywordsRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get keyword suggestions using Google Search trends"""
    if not AGENTS_AVAILABLE or not seo_optimizer:
        raise HTTPException(status_code=503, detail="SEO optimizer not available")
    
    try:
        # Get user's source of truth
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        business_context = {}
        if onboarding:
            business_context = {
                "business": {
                    "industry": onboarding.industry
                }
            }
        
        # Get keyword suggestions
        keywords = await seo_optimizer.suggest_keywords(
            topic=request.topic,
            business_context=business_context
        )
        
        return {
            "keywords": keywords,
            "topic": request.topic
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Keyword suggestions failed: {str(e)}")

