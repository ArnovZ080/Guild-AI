from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from datetime import datetime, timedelta

router = APIRouter(prefix="/customer", tags=["customer-intelligence"])

@router.get("/analysis")
async def get_customer_analysis():
    """Get comprehensive customer analysis data"""
    try:
        # Mock customer analysis data - in production this would come from actual customer data
        return {
            "success": True,
            "analysis": {
                "total_customers": 1247,
                "active_customers": 892,
                "new_customers_this_month": 156,
                "churned_customers_this_month": 23,
                "net_growth": 133,
                "churn_rate": 2.6,
                "retention_rate": 97.4,
                "average_lifetime_value": 2850.50,
                "customer_satisfaction_score": 4.6,
                "support_tickets": 89,
                "resolved_tickets": 76,
                "average_resolution_time": "2.3 hours"
            },
            "segments": {
                "enterprise": {
                    "count": 45,
                    "revenue": 125000,
                    "churn_rate": 1.2,
                    "satisfaction": 4.8
                },
                "smb": {
                    "count": 623,
                    "revenue": 185000,
                    "churn_rate": 2.8,
                    "satisfaction": 4.5
                },
                "startup": {
                    "count": 579,
                    "revenue": 95000,
                    "churn_rate": 3.1,
                    "satisfaction": 4.4
                }
            },
            "trends": {
                "last_30_days": {
                    "signups": 156,
                    "activations": 142,
                    "churns": 23,
                    "upgrades": 34,
                    "downgrades": 12
                },
                "growth_rate": 15.2,
                "revenue_growth": 22.8
            },
            "insights": [
                "Customer satisfaction is above industry average",
                "Enterprise segment shows highest retention",
                "Support response time has improved by 15% this month",
                "New feature adoption rate is 67%"
            ],
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customer analysis: {str(e)}")

@router.get("/health")
async def get_customer_health():
    """Get customer health metrics"""
    try:
        return {
            "success": True,
            "health_score": 87,
            "metrics": {
                "at_risk": 45,
                "healthy": 623,
                "champions": 224,
                "at_risk_percentage": 5.0,
                "healthy_percentage": 69.8,
                "champions_percentage": 25.2
            },
            "alerts": [
                {
                    "type": "warning",
                    "message": "5 customers at risk of churning",
                    "severity": "medium"
                },
                {
                    "type": "info", 
                    "message": "22 new champions this week",
                    "severity": "low"
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customer health: {str(e)}")
