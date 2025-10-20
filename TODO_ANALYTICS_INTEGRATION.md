# 📊 TODO: Analytics & Dashboard Integration

## Current Status: ⚠️ PARTIAL

### ✅ What Works Now (After Latest Update):
1. **Integration Status Checking**: Orchestrator now checks if platforms are connected
2. **Setup Guidance**: Offers to walk user through connection setup if missing
3. **Business Context**: Loads user's onboarding data and business intelligence
4. **CEO-Level Mentorship**: Enhanced prompts for strategic guidance
5. **Educational Responses**: Explains "why" behind recommendations

### ⚠️ What Needs Implementation:

---

## Priority 1: Analytics-Aware Content Creation

**User Question**: "Does it create content similar to what performed well before?"

**Current State**: No - doesn't access historical performance data

**What's Needed**:

### 1. Analytics Data Retrieval
```python
# File: guild/src/services/analytics_service.py (CREATE)

async def get_content_performance_history(user_id: str, platform: str, days: int = 90):
    """
    Fetch historical content performance from connected analytics platforms
    
    Returns:
        {
            "top_performing_posts": [
                {
                    "content": "...",
                    "engagement_rate": 0.15,
                    "reach": 5000,
                    "topics": ["AI", "automation"],
                    "post_type": "educational",
                    "posted_at": "2025-09-15"
                }
            ],
            "best_topics": ["AI automation", "business growth"],
            "best_post_times": ["Tuesday 10am", "Thursday 3pm"],
            "avg_engagement_rate": 0.08,
            "best_performing_formats": ["carousel", "video"]
        }
    """
    # TODO: Implement
    # 1. Check which analytics platforms are connected (Google Analytics, Meta Insights, etc.)
    # 2. Fetch historical post data
    # 3. Analyze engagement metrics
    # 4. Return insights
```

### 2. Integration with Orchestrator
```python
# File: api_server/src/routes/orchestrator_fixed.py (UPDATE)

# In the chat processing function, before calling Gemini:

# Load analytics insights if creating content
if 'create' in lower_objective and any(platform in lower_objective for platform in ['facebook', 'linkedin', 'instagram']):
    try:
        from guild.src.services.analytics_service import get_content_performance_history
        
        platform = 'facebook' if 'facebook' in lower_objective else 'linkedin' if 'linkedin' in lower_objective else 'instagram'
        
        analytics_insights = await get_content_performance_history(user_id, platform)
        
        # Add to system_context prompt:
        system_context += f"""

═══════════════════════════════════════════════════════════════
📈 HISTORICAL PERFORMANCE DATA ({platform.title()})
═══════════════════════════════════════════════════════════════
{json.dumps(analytics_insights, indent=2)}

IMPORTANT: Use this data to inform your content strategy! 
- Create content similar to top performers
- Use topics that resonated with the audience
- Post at optimal times
- Match formats that worked best
═══════════════════════════════════════════════════════════════
"""
    except Exception as e:
        logger.warning(f"Could not load analytics: {e}")
```

---

## Priority 2: Live Dashboard Data Integration

**User Question**: "Can it read KPIs and analytics from dashboards?"

**Current State**: No - only has static onboarding data

**What's Needed**:

### 1. Dashboard Data API
```python
# File: api_server/src/services/dashboard_data_service.py (CREATE)

async def get_live_business_metrics(user_id: str):
    """
    Aggregate real-time business metrics from all dashboards
    
    Returns:
        {
            "financial": {
                "current_revenue": 50000,
                "revenue_growth": 0.15,  # 15% growth
                "profit_margin": 0.35,
                "cash_flow_status": "healthy"
            },
            "customer": {
                "total_customers": 250,
                "active_customers": 180,
                "churn_rate": 0.05,
                "avg_ltv": 2500,
                "satisfaction_score": 4.2
            },
            "content": {
                "total_posts_30d": 45,
                "avg_engagement_rate": 0.08,
                "best_performing_platform": "LinkedIn",
                "content_types": {"educational": 0.60, "promotional": 0.40}
            },
            "business_health": {
                "overall_score": 82,
                "growth_trend": "positive",
                "priority_areas": ["increase social engagement", "reduce churn"],
                "opportunities": ["launch email campaign", "expand to TikTok"]
            }
        }
    """
    # TODO: Implement
    # 1. Query FinancialDashboard data
    # 2. Query CustomerDashboard data  
    # 3. Query ContentDashboard data
    # 4. Query BusinessIntelligenceDashboard data
    # 5. Synthesize into comprehensive view
```

### 2. Auto-Load Before Every Orchestrator Request
```python
# File: api_server/src/routes/orchestrator_fixed.py (UPDATE)

# Before building system_context:

# Load live business metrics
live_metrics = {}
try:
    from ..services.dashboard_data_service import get_live_business_metrics
    live_metrics = await get_live_business_metrics(user_id)
except Exception as e:
    logger.warning(f"Could not load live metrics: {e}")

# Add to system_context:
system_context = f"""You are the Chief Executive Orchestrator...

═══════════════════════════════════════════════════════════════
📊 LIVE BUSINESS METRICS (Real-Time Dashboard Data)
═══════════════════════════════════════════════════════════════
{json.dumps(live_metrics, indent=2) if live_metrics else 'Dashboard data not yet available'}

CRITICAL: Use this data to make informed recommendations!
- If revenue is declining, prioritize growth strategies
- If engagement is low, optimize content approach
- If churn is high, focus on retention
- Always reference specific metrics in your reasoning
═══════════════════════════════════════════════════════════════
"""
```

---

## Priority 3: Integration Setup Flows

**Status**: ✅ Partially implemented (orchestrator now checks and offers setup)

**What's Still Needed**:

### OAuth Flow Integration
```python
# File: api_server/src/routes/integrations.py (UPDATE)

@router.post("/setup/{integration_name}")
async def initiate_integration_setup(
    integration_name: str,
    user_id: str,
    return_to_chat: bool = False
):
    """
    Generate OAuth URL or setup instructions for integration
    
    Returns:
        {
            "setup_type": "oauth" | "api_key" | "manual",
            "oauth_url": "https://facebook.com/oauth?...",
            "instructions": "Step by step guide...",
            "estimated_time": "2 minutes"
        }
    """
```

### Chat Integration
```python
# In orchestrator response when integration missing:
if 'facebook' in lower_objective and 'facebook' not in connected_integrations:
    return {
        "message": "I notice Facebook isn't connected yet. I can help you set it up!",
        "action_required": "setup_integration",
        "integration_name": "facebook",
        "setup_link": "/api/integrations/setup/facebook?user_id={user_id}",
        "setup_instructions": [
            "Click the setup link above",
            "Log in to your Facebook account",
            "Authorize Guild AI to post on your behalf",
            "You'll be redirected back here when done"
        ]
    }
```

---

## Implementation Timeline

### Week 1: Analytics Integration (Priority 1)
- [ ] Create `analytics_service.py`
- [ ] Implement Google Analytics connector
- [ ] Implement Meta Insights connector  
- [ ] Add analytics data to orchestrator context
- [ ] Test content creation with performance data

### Week 2: Dashboard Data Integration (Priority 2)
- [ ] Create `dashboard_data_service.py`
- [ ] Connect to Financial Dashboard database
- [ ] Connect to Customer Dashboard database
- [ ] Connect to Content Dashboard database
- [ ] Connect to Business Intelligence Dashboard
- [ ] Add real-time metrics to orchestrator

### Week 3: Integration Setup Flows (Priority 3)
- [ ] Complete OAuth flow implementation
- [ ] Add setup links to chat responses
- [ ] Test full integration setup from chat
- [ ] Add success/failure notifications

---

## Testing Checklist

### Analytics-Aware Content
- [ ] User says "Create Facebook posts"
- [ ] System fetches historical performance
- [ ] Content created matches top-performing topics
- [ ] Content format matches best performers
- [ ] Posting times optimized

### Dashboard-Aware Recommendations
- [ ] User says "Help me grow my business"
- [ ] System loads live revenue, customer, content metrics
- [ ] Recommendations reference specific KPIs
- [ ] Priority areas based on actual performance gaps

### Integration Setup
- [ ] User requests content for unconnected platform
- [ ] System detects missing integration
- [ ] Offers setup with clear instructions
- [ ] OAuth flow completes successfully
- [ ] Returns to chat after connection

---

## Notes

**Why This Wasn't Implemented Yet**:
- Focus was on getting basic orchestrator working
- Analytics integration requires actual platform connections
- Needs OAuth flows to be fully functional
- Dashboard data aggregation is complex

**Current Workaround**:
- Orchestrator uses static business context from onboarding
- Creates content based on general best practices
- No performance optimization yet

**When to Implement**:
- After basic orchestrator is tested and working
- After OAuth flows are stable
- After dashboards have real data flowing
- Estimated: 2-3 weeks of development

---

*Created: October 20, 2025*  
*Status: Roadmap for future enhancement*  
*Priority: HIGH (but not blocking current deployment)*

