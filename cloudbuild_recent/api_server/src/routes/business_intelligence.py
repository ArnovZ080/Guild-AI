"""
Business Intelligence API Endpoints
Financial Advisor and Marketing Agency capabilities
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from .auth import get_current_user
from .. import models
from ..database import get_db

# Import ADK agents
try:
    from guild.src.agents.enhanced_financial_advisor import financial_advisor
    from guild.src.agents.enhanced_marketing_agency import marketing_agency
    AGENTS_AVAILABLE = True
except ImportError as e:
    print(f"Business intelligence agents not available: {e}")
    financial_advisor = None
    marketing_agency = None
    AGENTS_AVAILABLE = False

router = APIRouter(prefix="/intelligence", tags=["business_intelligence"])

# Request models
class FinancialAnalysisRequest(BaseModel):
    financial_data: Optional[Dict[str, Any]] = None

class BudgetPlanRequest(BaseModel):
    monthly_revenue: float
    business_goals: str

class RevenueForecastRequest(BaseModel):
    current_revenue: float
    growth_strategy: str
    timeframe_months: Optional[int] = 12

class PricingAnalysisRequest(BaseModel):
    current_pricing: Dict[str, Any]

class CreateCampaignRequest(BaseModel):
    campaign_objective: str
    campaign_type: Optional[str] = "multi_channel"  # social, email, ads, multi_channel
    budget_usd: Optional[float] = None

# Financial Advisor Endpoints

@router.post("/analyze-finances")
async def analyze_finances(
    request: FinancialAnalysisRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Comprehensive financial analysis using Google ADK Financial Advisor
    Uses Gemini Pro for strategic financial planning
    """
    if not AGENTS_AVAILABLE or not financial_advisor:
        raise HTTPException(status_code=503, detail="Financial advisor not available")
    
    try:
        # Get source of truth
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
                "financial": {
                    "pricing_status": onboarding.pricing_status,
                    "pricing_model": onboarding.pricing_model,
                    "marketing_budget": onboarding.marketing_budget,
                    "revenue_goals": onboarding.revenue_goals
                },
                "goals": {
                    "priority_3months": onboarding.priority_3months
                }
            }
        
        # Run financial analysis
        report = await financial_advisor.analyze_business_finances(
            business_context=business_context,
            financial_data=request.financial_data
        )
        
        return {
            "profit_loss_summary": report.profit_loss_summary,
            "cash_flow_projection": report.cash_flow_projection,
            "investment_recommendations": report.investment_recommendations,
            "risk_assessment": report.risk_assessment,
            "action_plan": report.action_plan,
            "key_metrics": report.key_metrics,
            "health_score": report.health_score
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Financial analysis failed: {str(e)}")

@router.post("/budget-plan")
async def create_budget_plan(
    request: BudgetPlanRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate optimized budget allocation plan"""
    if not AGENTS_AVAILABLE or not financial_advisor:
        raise HTTPException(status_code=503, detail="Financial advisor not available")
    
    try:
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        business_context = {}
        if onboarding:
            business_context = {
                "business": {
                    "type": onboarding.business_type,
                    "industry": onboarding.industry
                }
            }
        
        budget_plan = await financial_advisor.generate_budget_plan(
            monthly_revenue=request.monthly_revenue,
            business_goals=request.business_goals,
            business_context=business_context
        )
        
        return budget_plan
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Budget planning failed: {str(e)}")

@router.post("/forecast-revenue")
async def forecast_revenue(
    request: RevenueForecastRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Forecast revenue based on growth strategy"""
    if not AGENTS_AVAILABLE or not financial_advisor:
        raise HTTPException(status_code=503, detail="Financial advisor not available")
    
    try:
        forecast = await financial_advisor.forecast_revenue(
            current_revenue=request.current_revenue,
            growth_strategy=request.growth_strategy,
            timeframe_months=request.timeframe_months
        )
        
        return forecast
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Revenue forecast failed: {str(e)}")

@router.post("/analyze-pricing")
async def analyze_pricing(
    request: PricingAnalysisRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze and optimize pricing strategy"""
    if not AGENTS_AVAILABLE or not financial_advisor:
        raise HTTPException(status_code=503, detail="Financial advisor not available")
    
    try:
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
                "audience": {
                    "target": onboarding.target_audience,
                    "problems": onboarding.audience_problems
                }
            }
        
        analysis = await financial_advisor.pricing_strategy_analysis(
            current_pricing=request.current_pricing,
            business_context=business_context
        )
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pricing analysis failed: {str(e)}")

# Marketing Agency Endpoints

@router.post("/create-campaign")
async def create_marketing_campaign(
    request: CreateCampaignRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create comprehensive marketing campaign using Google ADK Marketing Agency
    Uses Gemini Pro for strategy, Gemini Flash for content
    """
    if not AGENTS_AVAILABLE or not marketing_agency:
        raise HTTPException(status_code=503, detail="Marketing agency not available")
    
    try:
        # Get source of truth
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
                    "differentiation": onboarding.brand_differentiation,
                    "values": onboarding.brand_values
                },
                "audience": {
                    "target": onboarding.target_audience,
                    "problems": onboarding.audience_problems
                },
                "financial": {
                    "marketing_budget": onboarding.marketing_budget
                }
            }
        
        # Create campaign
        campaign = await marketing_agency.create_comprehensive_campaign(
            campaign_objective=request.campaign_objective,
            business_context=business_context,
            campaign_type=request.campaign_type,
            budget_usd=request.budget_usd
        )
        
        return {
            "strategy": campaign.strategy,
            "content": campaign.content,
            "schedule": campaign.schedule,
            "targeting": campaign.targeting,
            "budget_allocation": campaign.budget_allocation,
            "kpis": campaign.kpis,
            "estimated_reach": campaign.estimated_reach,
            "estimated_conversions": campaign.estimated_conversions,
            "campaign_type": request.campaign_type
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Campaign creation failed: {str(e)}")

