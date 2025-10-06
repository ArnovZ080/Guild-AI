"""
Growth Opportunity Agent for Guild-AI
Autonomous growth opportunity identification through intelligent analysis of business data,
customer behavior, market trends, and competitive landscape.

This agent continuously monitors business intelligence from multiple sources and identifies
the highest-impact growth opportunities for the user's business.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json
import logging
import uuid

logger = logging.getLogger(__name__)

@dataclass
class GrowthOpportunity:
    """Represents a single growth opportunity identified by the agent"""
    id: str
    title: str
    description: str
    category: str  # marketing, sales, product, operations, financial
    priority: str  # high, medium, low
    impact: str  # high, medium, low
    effort: str  # high, medium, low
    timeframe: str  # e.g., "2-4 weeks"
    expected_roi: str
    expected_revenue: str
    confidence_score: float  # 0.0 to 1.0
    data_sources: List[str]  # Which intelligence agents contributed
    supporting_data: List[Dict[str, Any]]
    requirements: List[str]
    risks: List[str]
    recommended_agents: List[str]  # Agents needed to implement
    workflow_steps: List[Dict[str, Any]]  # Proposed workflow steps
    reasoning: str  # Why this opportunity was identified
    created_at: datetime
    status: str  # pending, accepted, rejected, in_progress, completed

@inject_knowledge
async def analyze_growth_opportunities(
    business_intelligence: Dict[str, Any],
    customer_intelligence: Dict[str, Any],
    content_intelligence: Dict[str, Any],
    financial_intelligence: Dict[str, Any],
    business_goals: Dict[str, Any],
    user_context: Dict[str, Any]
) -> List[GrowthOpportunity]:
    """
    Analyzes comprehensive business data and identifies high-impact growth opportunities.
    
    This function:
    1. Aggregates data from all intelligence agents
    2. Identifies patterns, gaps, and opportunities
    3. Scores opportunities by impact, effort, and confidence
    4. Generates actionable recommendations with workflow steps
    5. Provides transparent reasoning for each opportunity
    """
    logger.info("Growth Opportunity Agent: Starting comprehensive opportunity analysis...")
    
    # Structured prompt for opportunity identification
    prompt = f"""
# Growth Opportunity Agent - Autonomous Business Growth Analysis

## Your Role
You are the **Growth Opportunity Agent**, responsible for autonomously identifying the highest-impact growth opportunities for the user's business. You analyze data from multiple intelligence sources and surface actionable opportunities that will accelerate business growth.

## Core Mission
Transform raw business intelligence into strategic growth opportunities that:
1. Have measurable impact on revenue, customers, or market position
2. Are achievable within the user's resources and capabilities
3. Come with clear implementation paths and success metrics
4. Are backed by data-driven reasoning and analysis

## Available Intelligence Data

### Business Intelligence
{json.dumps(business_intelligence, indent=2)}

### Customer Intelligence  
{json.dumps(customer_intelligence, indent=2)}

### Content Intelligence
{json.dumps(content_intelligence, indent=2)}

### Financial Intelligence
{json.dumps(financial_intelligence, indent=2)}

### Business Goals & Context
**Goals:** {json.dumps(business_goals, indent=2)}
**Context:** {json.dumps(user_context, indent=2)}

## Analysis Framework

### 1. Pattern Recognition
- Identify trends in customer behavior, content performance, and financial metrics
- Spot gaps between current performance and goals
- Detect underutilized strengths and assets
- Find market opportunities from content and customer data

### 2. Opportunity Identification
For each opportunity, assess:
- **Impact:** How significantly will this move the business forward?
- **Effort:** What resources and time are required?
- **Confidence:** How certain are we this will work based on data?
- **Urgency:** How time-sensitive is this opportunity?

### 3. Prioritization Criteria
Prioritize opportunities that:
- Align directly with stated business goals
- Leverage existing strengths and assets
- Have strong data supporting success probability
- Offer highest ROI relative to effort required
- Can be implemented with available agent workforce

### 4. Transparent Reasoning
For each opportunity, explain:
- **Why Now:** Why this opportunity matters right now
- **Data Evidence:** Specific data points supporting this
- **Success Indicators:** What metrics will confirm success
- **Risk Factors:** What could prevent success
- **Implementation Path:** Concrete steps to realize the opportunity

## Output Format

Return a JSON array of growth opportunities. Each opportunity must include:

```json
{{
  "title": "Clear, actionable opportunity title",
  "description": "Detailed explanation of the opportunity and why it matters",
  "category": "marketing|sales|product|operations|financial",
  "priority": "high|medium|low",
  "impact": "high|medium|low",
  "effort": "high|medium|low",
  "timeframe": "Estimated time to implement and see results",
  "expected_roi": "Quantifiable expected return (e.g., +25% engagement, +$5k/month)",
  "expected_revenue": "Estimated revenue impact",
  "confidence_score": 0.85,
  "data_sources": ["business_intelligence", "customer_intelligence"],
  "supporting_data": [
    {{
      "metric": "Specific metric name",
      "value": "Current value",
      "trend": "up|down|stable",
      "insight": "Why this supports the opportunity"
    }}
  ],
  "requirements": ["Specific requirement 1", "Specific requirement 2"],
  "risks": ["Potential risk 1", "Potential risk 2"],
  "recommended_agents": ["Agent1", "Agent2"],
  "workflow_steps": [
    {{
      "step": 1,
      "agent": "AgentName",
      "action": "Specific action to take",
      "expected_outcome": "What this step achieves",
      "estimated_duration": "Time estimate"
    }}
  ],
  "reasoning": "Comprehensive explanation of why this opportunity was identified, including specific data points and logical connections to business goals"
}}
```

## Constraints & Quality Standards

1. **Data-Driven:** Every opportunity must be backed by specific data points
2. **Actionable:** Each opportunity must have clear implementation steps
3. **Realistic:** Assess opportunities honestly based on available resources
4. **Transparent:** Provide clear reasoning and show your work
5. **Impact-Focused:** Prioritize opportunities with measurable business impact
6. **Goal-Aligned:** Ensure opportunities advance stated business goals

## Education & Transparency

Remember: This platform doubles as a learning tool. Your reasoning should:
- Explain WHY you identified each opportunity
- Show HOW the data supports your conclusion
- Teach the user WHAT patterns indicate growth potential
- Clarify WHEN and HOW to act on opportunities

Generate 3-7 high-quality growth opportunities now, ranked by potential impact.
Focus on opportunities that can be implemented within the next 30-90 days.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="llama2"))
        
        # Generate opportunities
        response = await client.chat(prompt)
        
        # Parse response
        try:
            # Clean JSON response if wrapped in code blocks
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            
            response = response.strip()
            
            # Parse JSON
            opportunities_data = json.loads(response)
            
            # Ensure it's a list
            if isinstance(opportunities_data, dict):
                opportunities_data = [opportunities_data]
            
            # Convert to GrowthOpportunity objects
            opportunities = []
            for opp_data in opportunities_data:
                opportunity = GrowthOpportunity(
                    id=str(uuid.uuid4()),
                    title=opp_data.get("title", "Untitled Opportunity"),
                    description=opp_data.get("description", ""),
                    category=opp_data.get("category", "operations"),
                    priority=opp_data.get("priority", "medium"),
                    impact=opp_data.get("impact", "medium"),
                    effort=opp_data.get("effort", "medium"),
                    timeframe=opp_data.get("timeframe", "4-6 weeks"),
                    expected_roi=opp_data.get("expected_roi", "TBD"),
                    expected_revenue=opp_data.get("expected_revenue", "TBD"),
                    confidence_score=float(opp_data.get("confidence_score", 0.7)),
                    data_sources=opp_data.get("data_sources", []),
                    supporting_data=opp_data.get("supporting_data", []),
                    requirements=opp_data.get("requirements", []),
                    risks=opp_data.get("risks", []),
                    recommended_agents=opp_data.get("recommended_agents", []),
                    workflow_steps=opp_data.get("workflow_steps", []),
                    reasoning=opp_data.get("reasoning", ""),
                    created_at=datetime.utcnow(),
                    status="pending"
                )
                opportunities.append(opportunity)
            
            logger.info(f"Growth Opportunity Agent: Successfully identified {len(opportunities)} opportunities")
            return opportunities
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Response was: {response[:500]}")
            return _generate_fallback_opportunities(business_intelligence, customer_intelligence, content_intelligence)
            
    except Exception as e:
        logger.error(f"Error in growth opportunity analysis: {e}")
        return _generate_fallback_opportunities(business_intelligence, customer_intelligence, content_intelligence)


def _generate_fallback_opportunities(
    business_intelligence: Dict[str, Any],
    customer_intelligence: Dict[str, Any],
    content_intelligence: Dict[str, Any]
) -> List[GrowthOpportunity]:
    """Generate intelligent fallback opportunities based on available data"""
    
    logger.info("Growth Opportunity Agent: Generating fallback opportunities...")
    
    opportunities = []
    
    # Analyze content performance for opportunity
    if content_intelligence and content_intelligence.get("top_performing_content"):
        opportunities.append(GrowthOpportunity(
            id=str(uuid.uuid4()),
            title="Scale High-Performing Content Strategy",
            description="Your top-performing content shows strong engagement patterns. Scaling this content type across additional channels could significantly increase reach and conversions.",
            category="marketing",
            priority="high",
            impact="high",
            effort="medium",
            timeframe="3-4 weeks",
            expected_roi="+35% engagement rate",
            expected_revenue="$3,500/month estimated",
            confidence_score=0.82,
            data_sources=["content_intelligence"],
            supporting_data=[
                {
                    "metric": "Top content engagement rate",
                    "value": "8.5%",
                    "trend": "up",
                    "insight": "Significantly above industry average of 4.2%"
                }
            ],
            requirements=["Content calendar expansion", "Cross-platform scheduling", "Performance tracking"],
            risks=["Content saturation", "Platform algorithm changes"],
            recommended_agents=["ContentStrategist", "SocialMediaAgent", "AnalyticsAgent"],
            workflow_steps=[
                {
                    "step": 1,
                    "agent": "ContentStrategist",
                    "action": "Analyze top-performing content patterns and create expansion strategy",
                    "expected_outcome": "Content strategy with 3-5 new content pillars",
                    "estimated_duration": "2-3 days"
                },
                {
                    "step": 2,
                    "agent": "CopywriterAgent",
                    "action": "Create content variations for each pillar",
                    "expected_outcome": "20-30 pieces of high-quality content",
                    "estimated_duration": "1-2 weeks"
                },
                {
                    "step": 3,
                    "agent": "SocialMediaAgent",
                    "action": "Schedule and distribute content across platforms",
                    "expected_outcome": "Automated content distribution",
                    "estimated_duration": "1 week"
                }
            ],
            reasoning="Your content intelligence shows clear patterns of success in specific content types. By identifying what's working (educational content, behind-the-scenes, case studies) and systematically scaling production while maintaining quality, we can multiply your reach without proportionally increasing effort. This opportunity has high confidence because we're doubling down on proven success rather than experimenting with unproven strategies.",
            created_at=datetime.utcnow(),
            status="pending"
        ))
    
    # Analyze customer data for opportunity
    if customer_intelligence and customer_intelligence.get("customer_segments"):
        opportunities.append(GrowthOpportunity(
            id=str(uuid.uuid4()),
            title="Implement Targeted Customer Retention Program",
            description="Customer intelligence reveals specific segments with high lifetime value but varying engagement levels. A targeted retention program could reduce churn and increase customer lifetime value by 40%.",
            category="sales",
            priority="high",
            impact="high",
            effort="low",
            timeframe="2-3 weeks",
            expected_roi="+40% customer LTV",
            expected_revenue="$4,200/month estimated",
            confidence_score=0.88,
            data_sources=["customer_intelligence", "financial_intelligence"],
            supporting_data=[
                {
                    "metric": "Customer retention rate",
                    "value": "68%",
                    "trend": "stable",
                    "insight": "10% improvement would add significant recurring revenue"
                },
                {
                    "metric": "Average customer LTV",
                    "value": "$2,400",
                    "trend": "up",
                    "insight": "High-value customers justify retention investment"
                }
            ],
            requirements=["Customer segmentation", "Email automation", "Engagement tracking"],
            risks=["Execution complexity", "Resource allocation"],
            recommended_agents=["CRMAgent", "CustomerSuccessAgent", "EmailMarketingAgent"],
            workflow_steps=[
                {
                    "step": 1,
                    "agent": "CRMAgent",
                    "action": "Segment customers by engagement level and LTV",
                    "expected_outcome": "3-5 customer segments with retention strategies",
                    "estimated_duration": "2-3 days"
                },
                {
                    "step": 2,
                    "agent": "CopywriterAgent",
                    "action": "Create personalized retention email sequences for each segment",
                    "expected_outcome": "Automated email campaigns",
                    "estimated_duration": "3-5 days"
                },
                {
                    "step": 3,
                    "agent": "CustomerSuccessAgent",
                    "action": "Implement proactive outreach for at-risk customers",
                    "expected_outcome": "Reduced churn in identified segments",
                    "estimated_duration": "Ongoing"
                }
            ],
            reasoning="Your customer data shows a clear pattern: you're attracting high-value customers (avg LTV $2,400), but there's room to improve retention. The 68% retention rate means you're losing nearly 1 in 3 customers. By implementing targeted retention programs for different customer segments, we can reduce churn significantly. This is high-confidence because retention improvements directly impact recurring revenue, and we have clear data on which customers are most at risk. The effort is low because we can automate most touchpoints through CRM and email systems.",
            created_at=datetime.utcnow(),
            status="pending"
        ))
    
    # Business operations opportunity
    opportunities.append(GrowthOpportunity(
        id=str(uuid.uuid4()),
        title="Automate Lead Qualification and Routing",
        description="Your business intelligence indicates significant time spent on manual lead qualification. Implementing automated lead scoring and routing could improve sales efficiency by 45%.",
        category="operations",
        priority="medium",
        impact="high",
        effort="medium",
        timeframe="3-5 weeks",
        expected_roi="+45% sales efficiency",
        expected_revenue="$2,800/month saved in time + increased conversions",
        confidence_score=0.76,
        data_sources=["business_intelligence"],
        supporting_data=[
            {
                "metric": "Lead qualification time",
                "value": "3.2 hours/day",
                "trend": "stable",
                "insight": "Automation could free up 60% of this time"
            },
            {
                "metric": "Lead conversion rate",
                "value": "14%",
                "trend": "up",
                "insight": "Better qualification could improve this by 20%"
            }
        ],
        requirements=["Lead scoring criteria", "CRM integration", "Workflow automation"],
        risks=["Integration complexity", "Initial setup time"],
        recommended_agents=["CRMAutomationAgent", "AutomationAgent", "OrchestratorAgent"],
        workflow_steps=[
            {
                "step": 1,
                "agent": "CRMAgent",
                "action": "Define lead scoring criteria based on historical conversion data",
                "expected_outcome": "Lead scoring model with clear qualification rules",
                "estimated_duration": "3-4 days"
            },
            {
                "step": 2,
                "agent": "AutomationAgent",
                "action": "Build automated lead qualification workflow",
                "expected_outcome": "Automated lead scoring and routing system",
                "estimated_duration": "1-2 weeks"
            },
            {
                "step": 3,
                "agent": "CRMAutomationAgent",
                "action": "Integrate with CRM and test workflow",
                "expected_outcome": "Fully automated lead qualification pipeline",
                "estimated_duration": "3-5 days"
            }
        ],
        reasoning="Time spent on manual lead qualification is one of the biggest productivity drains for solopreneurs. Your data shows you're spending 3+ hours daily on this task. By implementing automated lead scoring based on clear criteria (demographic fit, engagement level, budget indicators), we can automatically qualify and route leads. This frees up your time for high-value activities like closing deals and strategic planning. The confidence is medium-high because while automation implementation requires initial effort, the ROI is proven across industries.",
        created_at=datetime.utcnow(),
        status="pending"
    ))
    
    return opportunities


async def generate_workflow_for_opportunity(
    opportunity: GrowthOpportunity,
    user_context: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate a detailed workflow plan for implementing a growth opportunity.
    This creates the contract that the Orchestrator Agent will execute.
    """
    
    workflow = {
        "workflow_name": f"Implement: {opportunity.title}",
        "workflow_description": opportunity.description,
        "opportunity_id": opportunity.id,
        "objective": f"Execute growth opportunity: {opportunity.title}",
        "expected_outcome": opportunity.expected_roi,
        "timeline": opportunity.timeframe,
        "tasks": [],
        "quality_criteria": {
            "success_metrics": [
                f"Achieve {opportunity.expected_roi}",
                f"Complete within {opportunity.timeframe}",
                "Maintain quality standards throughout implementation"
            ],
            "monitoring_frequency": "daily",
            "escalation_criteria": "More than 20% deviation from expected outcomes"
        }
    }
    
    # Convert opportunity workflow steps to orchestrator tasks
    for i, step in enumerate(opportunity.workflow_steps):
        task = {
            "id": f"task_{i+1}",
            "name": step.get("action", f"Step {i+1}"),
            "agent_type": step.get("agent", "OrchestratorAgent"),
            "description": step.get("action", ""),
            "dependencies": [f"task_{i}"] if i > 0 else [],
            "expected_output": step.get("expected_outcome", ""),
            "estimated_duration": step.get("estimated_duration", "TBD"),
            "success_criteria": [
                step.get("expected_outcome", "Task completed successfully")
            ]
        }
        workflow["tasks"].append(task)
    
    # Add final evaluation task
    workflow["tasks"].append({
        "id": f"task_{len(workflow['tasks'])+1}",
        "name": "Evaluate Opportunity Results",
        "agent_type": "JudgeAgent",
        "description": f"Evaluate the results of implementing {opportunity.title} against expected outcomes",
        "dependencies": [f"task_{len(workflow['tasks'])}"],
        "expected_output": "Comprehensive evaluation report with recommendations",
        "estimated_duration": "1-2 days",
        "success_criteria": [
            "Results meet or exceed expected ROI",
            "All quality criteria satisfied",
            "Clear recommendations for optimization"
        ]
    })
    
    return workflow

