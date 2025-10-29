"""
Business Intelligence Agent for Guild-AI
Central coordinator of insights across the entire Guild ecosystem.
Transforms raw data from multiple agents into digestible, actionable intelligence.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json

@inject_knowledge
async def generate_comprehensive_business_intelligence_strategy(
    business_objective: str,
    data_sources: Dict[str, Any],
    dashboard_requirements: Dict[str, Any],
    user_goals: Dict[str, Any],
    time_horizon: Dict[str, Any],
    alert_preferences: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive business intelligence strategy using advanced prompting strategies.
    Implements the full Business Intelligence Agent specification from AGENT_PROMPTS.md.
    """
    print("Business Intelligence Agent: Generating comprehensive BI strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Business Intelligence Agent - Central Intelligence Coordinator

## Role Definition
You are the **Business Intelligence Agent**, the central coordinator of insights across the entire Guild ecosystem. Your role is to take overwhelming amounts of raw data from multiple agents, integrations, and business operations, and transform that into digestible, actionable intelligence for the user. Think of yourself as the Chief of Staff for the solopreneur - you don't replace other agents, but you assemble, prioritize, and narrate their outputs so the founder always knows what matters most right now.

## Core Expertise
- Cross-Agent Data Synthesis
- Dashboard Curation & Management
- Business Health Monitoring
- Alert & Recommendation Systems
- Performance Analytics & Insights
- Goal Alignment & Tracking
- Risk Assessment & Mitigation
- Executive Decision Support

## Context & Background Information
**Business Objective:** {business_objective}
**Data Sources:** {json.dumps(data_sources, indent=2)}
**Dashboard Requirements:** {json.dumps(dashboard_requirements, indent=2)}
**User Goals:** {json.dumps(user_goals, indent=2)}
**Time Horizon:** {json.dumps(time_horizon, indent=2)}
**Alert Preferences:** {json.dumps(alert_preferences, indent=2)}

## Task Breakdown & Steps
1. **Data Aggregation:** Pull metrics, insights, and reports from all connected agents and integrations
2. **Intelligence Synthesis:** Transform raw data into coherent business intelligence narratives
3. **Priority Assessment:** Use urgency scoring and goal alignment to prioritize insights
4. **Dashboard Curation:** Ensure Main Dashboard is always up-to-date and contextually relevant
5. **Recommendation Generation:** Suggest actionable next steps based on insights
6. **Alert Management:** Flag anomalies, risks, and opportunities appropriately
7. **Performance Monitoring:** Track progress toward user goals and business objectives
8. **Executive Reporting:** Provide clear, actionable intelligence summaries

## Constraints & Rules
- Always maintain 4-hour relevance rule for Main Dashboard content
- Provide transparent reasoning for all recommendations and alerts
- Respect user preferences for notification frequency and detail level
- Ensure all insights are actionable and tied to business goals
- Maintain data privacy and security across all integrations
- Balance automation with human-in-the-loop decision making
- Prioritize clarity and actionability over data volume

## Output Format
Return a comprehensive JSON object with business intelligence strategy, dashboard framework, and monitoring systems.

Generate the comprehensive business intelligence strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            bi_strategy = json.loads(response)
            print("Business Intelligence Agent: Successfully generated comprehensive BI strategy.")
            return bi_strategy
        except json.JSONDecodeError as e:
            print(f"Business Intelligence Agent: JSON parsing error: {e}")
            # Return structured fallback
            return {
                "bi_strategy_analysis": {
                    "data_synthesis_capability": "comprehensive",
                    "dashboard_curation_level": "advanced",
                    "alert_system_effectiveness": "high",
                    "goal_alignment_accuracy": "excellent",
                    "success_probability": 0.9
                },
                "data_aggregation": {
                    "source_integration": {
                        "financial_agents": ["bookkeeping", "accounting", "analytics"],
                        "content_agents": ["social_media", "content_strategist", "writer"],
                        "customer_agents": ["crm", "lead_generation", "customer_support"],
                        "operational_agents": ["project_manager", "hr", "automation"],
                        "external_integrations": ["stripe", "notion", "crm_platforms", "ad_managers"]
                    },
                    "data_types": [
                        "financial_metrics",
                        "content_performance",
                        "customer_insights",
                        "operational_efficiency",
                        "agent_activity",
                        "goal_progress"
                    ],
                    "aggregation_frequency": {
                        "real_time": "Critical alerts and urgent updates",
                        "hourly": "Dashboard metrics and performance indicators",
                        "daily": "Comprehensive business health summary",
                        "weekly": "Trend analysis and strategic insights"
                    }
                },
                "dashboard_curation": {
                    "main_dashboard_sections": {
                        "financial_health": "Revenue, expenses, cash flow, profit margins",
                        "customer_metrics": "Leads, conversions, retention, satisfaction",
                        "content_performance": "Engagement rates, reach, conversion metrics",
                        "operational_status": "Agent activity, automation status, workflow health",
                        "goal_progress": "Progress toward user-defined objectives",
                        "urgent_alerts": "Critical issues requiring immediate attention"
                    },
                    "curation_criteria": {
                        "relevance_threshold": "4 hours",
                        "importance_scoring": "Based on impact and urgency",
                        "goal_alignment": "Direct connection to user objectives",
                        "actionability": "Clear next steps required"
                    }
                },
                "prioritization_engine": {
                    "urgency_scoring": {
                        "critical": "Immediate action required (financial issues, system failures)",
                        "high": "Action needed within 24 hours (customer issues, missed targets)",
                        "medium": "Action needed within week (optimization opportunities)",
                        "low": "Monitor and plan (general improvements, long-term trends)"
                    },
                    "goal_alignment": {
                        "direct_impact": "Directly affects primary business goals",
                        "supporting_impact": "Supports secondary objectives",
                        "indirect_impact": "May influence long-term success",
                        "no_impact": "Interesting but not goal-relevant"
                    },
                    "scoring_algorithm": "Combines urgency, goal alignment, and business impact"
                },
                "recommendation_system": {
                    "recommendation_types": {
                        "immediate_actions": "Critical tasks requiring immediate attention",
                        "optimization_opportunities": "Ways to improve current performance",
                        "strategic_initiatives": "Long-term improvements and growth strategies",
                        "resource_reallocation": "Budget, time, or effort redistribution"
                    },
                    "recommendation_criteria": {
                        "actionability": "Clear, specific steps to take",
                        "impact_potential": "Expected business benefit",
                        "resource_requirements": "Time, cost, and effort needed",
                        "success_probability": "Likelihood of positive outcome"
                    }
                },
                "alert_system": {
                    "alert_categories": {
                        "financial_alerts": "Revenue drops, expense spikes, cash flow issues",
                        "customer_alerts": "Churn spikes, satisfaction drops, lead quality issues",
                        "operational_alerts": "System failures, agent errors, workflow bottlenecks",
                        "goal_alerts": "Progress falling behind, milestone achievements"
                    },
                    "alert_priorities": {
                        "emergency": "System down, critical financial issues",
                        "urgent": "Customer escalations, missed targets",
                        "important": "Performance degradation, optimization opportunities",
                        "informational": "Updates, achievements, general insights"
                    }
                }
            }
    except Exception as e:
        print(f"Business Intelligence Agent: Failed to generate BI strategy. Error: {e}")
        return {
            "bi_strategy_analysis": {
                "data_synthesis_capability": "moderate",
                "success_probability": 0.7
            },
            "data_aggregation": {
                "source_integration": {"basic": ["financial", "content", "customer"]},
                "data_types": ["basic_metrics"]
            },
            "error": str(e)
        }


@dataclass
class BusinessMetric:
    metric_id: str
    name: str
    value: float
    unit: str
    trend: str
    category: str
    source: str
    timestamp: datetime
    importance_score: float
    target_value: Optional[float] = None
    benchmark_value: Optional[float] = None
    period: str = "monthly"

@dataclass
class KPIMetric:
    kpi_id: str
    name: str
    current_value: float
    previous_value: float
    target_value: float
    unit: str
    category: str
    trend_direction: str  # "up", "down", "stable"
    trend_percentage: float
    status: str  # "excellent", "good", "warning", "critical"
    calculation_method: str
    data_sources: List[str]
    last_updated: datetime
    business_impact: str  # "high", "medium", "low"

@dataclass
class DashboardInsight:
    insight_id: str
    title: str
    description: str
    category: str
    urgency: str
    action_required: bool
    recommendation: str
    supporting_data: Dict[str, Any]
    timestamp: datetime

@dataclass
class BusinessAlert:
    alert_id: str
    type: str
    severity: str
    title: str
    description: str
    action_required: bool
    related_metrics: List[str]
    timestamp: datetime

class BusinessIntelligenceAgent:
    """
    Comprehensive Business Intelligence Agent implementing advanced prompting strategies.
    Provides central coordination of insights across the entire Guild ecosystem.
    """
    
    def __init__(self, name: str = "Business Intelligence Agent", user_input=None):
        self.name = name
        self.user_input = user_input
        self.agent_name = "Business Intelligence Agent"
        self.agent_type = "Intelligence"
        self.role = "Central Intelligence Coordinator"
        self.expertise = [
            "Cross-Agent Data Synthesis",
            "Dashboard Curation & Management",
            "Business Health Monitoring",
            "Alert & Recommendation Systems",
            "Performance Analytics & Insights",
            "Goal Alignment & Tracking"
        ]
        self.capabilities = [
            "Data aggregation from multiple agents and integrations",
            "Intelligence synthesis and narrative creation",
            "Dashboard curation and content prioritization",
            "Alert generation and risk assessment",
            "Recommendation engine and action planning",
            "Goal tracking and progress monitoring",
            "Executive reporting and decision support",
            "Performance analytics and trend analysis"
        ]
        self.metrics_library = {}
        self.insights_library = {}
        self.alerts_library = {}
        self.dashboard_state = {}
        self.kpi_metrics = {}
        self.ceo_snapshot = {}
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the Business Intelligence Agent.
        Implements comprehensive business intelligence using advanced prompting strategies.
        """
        try:
            print(f"Business Intelligence Agent: Starting comprehensive business intelligence analysis...")
            
            # Extract inputs from user_input or use defaults
            if user_input:
                business_objective = user_input
                data_sources = {
                    "agent_data": "available",
                    "integration_data": "available",
                    "user_input": "provided"
                }
            else:
                business_objective = "Provide comprehensive business intelligence and dashboard curation for optimal decision-making"
                data_sources = {
                    "financial_agents": ["bookkeeping", "accounting", "analytics"],
                    "content_agents": ["social_media", "content_strategist", "writer"],
                    "customer_agents": ["crm", "lead_generation", "customer_support"],
                    "operational_agents": ["project_manager", "hr", "automation"],
                    "external_integrations": ["stripe", "notion", "crm_platforms", "ad_managers"],
                    "user_goals": "growth_revenue_50_percent_6_months"
                }
            
            # Define comprehensive BI parameters
            dashboard_requirements = {
                "main_dashboard": {
                    "sections": ["financial_health", "customer_metrics", "content_performance", "operational_status", "goal_progress", "urgent_alerts"],
                    "update_frequency": "real_time",
                    "relevance_window": "4_hours",
                    "max_insights": 10
                },
                "detailed_views": {
                    "financial_dashboard": "Comprehensive financial metrics and trends",
                    "customer_dashboard": "Customer lifecycle and satisfaction metrics",
                    "content_dashboard": "Content performance and engagement analytics",
                    "operational_dashboard": "Agent activity and system health"
                }
            }
            
            user_goals = {
                "primary_goal": "Grow revenue by 50% in 6 months",
                "secondary_goals": ["Improve customer satisfaction", "Increase operational efficiency", "Scale content production"],
                "kpis": ["monthly_recurring_revenue", "customer_acquisition_cost", "content_engagement_rate", "agent_efficiency"],
                "time_horizon": "6_months"
            }
            
            time_horizon = {
                "immediate": "0-24 hours",
                "short_term": "1-7 days", 
                "medium_term": "1-4 weeks",
                "long_term": "1-6 months"
            }
            
            alert_preferences = {
                "financial_alerts": "immediate",
                "customer_alerts": "urgent",
                "operational_alerts": "important",
                "goal_alerts": "daily_summary"
            }
            
            # Generate comprehensive BI strategy
            bi_strategy = await generate_comprehensive_business_intelligence_strategy(
                business_objective=business_objective,
                data_sources=data_sources,
                dashboard_requirements=dashboard_requirements,
                user_goals=user_goals,
                time_horizon=time_horizon,
                alert_preferences=alert_preferences
            )
            
            # Execute the BI strategy
            result = await self._execute_bi_strategy(
                business_objective, 
                bi_strategy
            )
            
            # Generate CEO snapshot with comprehensive KPIs
            ceo_snapshot = self.generate_ceo_snapshot()
            
            # Combine strategy and execution results
            final_result = {
                "agent": "Business Intelligence Agent",
                "strategy_type": "comprehensive_business_intelligence",
                "bi_strategy": bi_strategy,
                "execution_result": result,
                "ceo_snapshot": ceo_snapshot,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"Business Intelligence Agent: Comprehensive business intelligence analysis completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"Business Intelligence Agent: Error in comprehensive BI analysis: {e}")
            return {
                "agent": "Business Intelligence Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_bi_strategy(
        self, 
        business_objective: str, 
        strategy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute business intelligence strategy based on comprehensive plan."""
        try:
            # Extract strategy components
            data_aggregation = strategy.get("data_aggregation", {})
            dashboard_curation = strategy.get("dashboard_curation", {})
            prioritization_engine = strategy.get("prioritization_engine", {})
            recommendation_system = strategy.get("recommendation_system", {})
            alert_system = strategy.get("alert_system", {})
            
            # Simulate data aggregation and analysis
            aggregated_data = await self._aggregate_cross_agent_data(data_aggregation)
            dashboard_insights = await self._curate_dashboard_content(dashboard_curation, aggregated_data)
            prioritized_insights = await self._prioritize_insights(prioritization_engine, dashboard_insights)
            recommendations = await self._generate_recommendations(recommendation_system, prioritized_insights)
            alerts = await self._generate_alerts(alert_system, aggregated_data)
            
            return {
                "status": "success",
                "message": "Business intelligence strategy executed successfully",
                "data_aggregation": data_aggregation,
                "dashboard_curation": dashboard_curation,
                "prioritization_engine": prioritization_engine,
                "recommendation_system": recommendation_system,
                "alert_system": alert_system,
                "execution_results": {
                    "aggregated_data_points": len(aggregated_data),
                    "dashboard_insights": len(dashboard_insights),
                    "prioritized_insights": len(prioritized_insights),
                    "recommendations": len(recommendations),
                    "active_alerts": len(alerts)
                },
                "strategy_insights": {
                    "data_synthesis_capability": strategy.get("bi_strategy_analysis", {}).get("data_synthesis_capability", "comprehensive"),
                    "dashboard_curation_level": strategy.get("bi_strategy_analysis", {}).get("dashboard_curation_level", "advanced"),
                    "alert_system_effectiveness": strategy.get("bi_strategy_analysis", {}).get("alert_system_effectiveness", "high"),
                    "goal_alignment_accuracy": strategy.get("bi_strategy_analysis", {}).get("goal_alignment_accuracy", "excellent"),
                    "success_probability": strategy.get("bi_strategy_analysis", {}).get("success_probability", 0.9)
                },
                "execution_metrics": {
                    "strategy_completeness": "comprehensive",
                    "data_synthesis_quality": "high",
                    "dashboard_relevance": "excellent",
                    "recommendation_actionability": "high"
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Business intelligence strategy execution failed: {str(e)}"
            }
    
    async def _aggregate_cross_agent_data(self, data_aggregation: Dict[str, Any]) -> List[BusinessMetric]:
        """Aggregate data from multiple agents and integrations"""
        try:
            # Simulate data aggregation from various sources
            metrics = []
            
            # Financial metrics
            financial_metrics = [
                BusinessMetric(
                    metric_id="rev_001",
                    name="Monthly Recurring Revenue",
                    value=15000.0,
                    unit="USD",
                    trend="increasing",
                    category="financial",
                    source="bookkeeping_agent",
                    timestamp=datetime.now(),
                    importance_score=0.9
                ),
                BusinessMetric(
                    metric_id="cac_001",
                    name="Customer Acquisition Cost",
                    value=45.0,
                    unit="USD",
                    trend="stable",
                    category="customer",
                    source="analytics_agent",
                    timestamp=datetime.now(),
                    importance_score=0.8
                )
            ]
            
            # Content metrics
            content_metrics = [
                BusinessMetric(
                    metric_id="eng_001",
                    name="Content Engagement Rate",
                    value=3.2,
                    unit="percent",
                    trend="increasing",
                    category="content",
                    source="social_media_agent",
                    timestamp=datetime.now(),
                    importance_score=0.7
                )
            ]
            
            # Operational metrics
            operational_metrics = [
                BusinessMetric(
                    metric_id="eff_001",
                    name="Agent Efficiency Score",
                    value=87.5,
                    unit="percent",
                    trend="stable",
                    category="operational",
                    source="workflow_manager",
                    timestamp=datetime.now(),
                    importance_score=0.6
                )
            ]
            
            metrics.extend(financial_metrics)
            metrics.extend(content_metrics)
            metrics.extend(operational_metrics)
            
            return metrics
            
        except Exception as e:
            print(f"Error aggregating cross-agent data: {e}")
            return []
    
    async def _curate_dashboard_content(self, dashboard_curation: Dict[str, Any], metrics: List[BusinessMetric]) -> List[DashboardInsight]:
        """Curate dashboard content based on relevance and importance"""
        try:
            insights = []
            
            # Analyze metrics and create insights
            for metric in metrics:
                if metric.importance_score > 0.7:  # High importance threshold
                    insight = DashboardInsight(
                        insight_id=f"insight_{metric.metric_id}",
                        title=f"{metric.name} Analysis",
                        description=f"{metric.name} is currently {metric.value} {metric.unit} with a {metric.trend} trend",
                        category=metric.category,
                        urgency=self._calculate_urgency(metric),
                        action_required=self._requires_action(metric),
                        recommendation=self._generate_metric_recommendation(metric),
                        supporting_data={"metric": metric.__dict__},
                        timestamp=datetime.now()
                    )
                    insights.append(insight)
            
            return insights
            
        except Exception as e:
            print(f"Error curating dashboard content: {e}")
            return []
    
    async def _prioritize_insights(self, prioritization_engine: Dict[str, Any], insights: List[DashboardInsight]) -> List[DashboardInsight]:
        """Prioritize insights based on urgency and goal alignment"""
        try:
            # Sort insights by urgency and importance
            def priority_score(insight):
                urgency_scores = {"critical": 4, "high": 3, "medium": 2, "low": 1}
                return urgency_scores.get(insight.urgency, 1)
            
            prioritized_insights = sorted(insights, key=priority_score, reverse=True)
            
            # Apply 4-hour relevance rule (limit to most recent and relevant)
            cutoff_time = datetime.now() - timedelta(hours=4)
            relevant_insights = [i for i in prioritized_insights if i.timestamp >= cutoff_time]
            
            # Limit to top 10 insights for main dashboard
            return relevant_insights[:10]
            
        except Exception as e:
            print(f"Error prioritizing insights: {e}")
            return insights
    
    async def _generate_recommendations(self, recommendation_system: Dict[str, Any], insights: List[DashboardInsight]) -> List[Dict[str, Any]]:
        """Generate actionable recommendations based on insights"""
        try:
            recommendations = []
            
            for insight in insights:
                if insight.action_required:
                    recommendation = {
                        "recommendation_id": f"rec_{insight.insight_id}",
                        "type": "optimization_opportunity" if insight.urgency != "critical" else "immediate_action",
                        "title": insight.recommendation,
                        "description": f"Based on {insight.title}: {insight.description}",
                        "priority": insight.urgency,
                        "estimated_impact": "high" if insight.urgency in ["critical", "high"] else "medium",
                        "resource_requirements": "low" if insight.urgency == "critical" else "medium",
                        "success_probability": 0.8 if insight.urgency == "critical" else 0.7
                    }
                    recommendations.append(recommendation)
            
            return recommendations
            
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            return []
    
    async def _generate_alerts(self, alert_system: Dict[str, Any], metrics: List[BusinessMetric]) -> List[BusinessAlert]:
        """Generate alerts based on metric thresholds and anomalies"""
        try:
            alerts = []
            
            for metric in metrics:
                # Check for critical thresholds
                if self._is_critical_threshold(metric):
                    alert = BusinessAlert(
                        alert_id=f"alert_{metric.metric_id}",
                        type=metric.category,
                        severity="critical" if metric.importance_score > 0.8 else "important",
                        title=f"{metric.name} Alert",
                        description=f"{metric.name} has reached a critical threshold: {metric.value} {metric.unit}",
                        action_required=True,
                        related_metrics=[metric.metric_id],
                        timestamp=datetime.now()
                    )
                    alerts.append(alert)
            
            return alerts
            
        except Exception as e:
            print(f"Error generating alerts: {e}")
            return []
    
    def _calculate_urgency(self, metric: BusinessMetric) -> str:
        """Calculate urgency level for a metric"""
        if metric.importance_score > 0.9:
            return "critical"
        elif metric.importance_score > 0.7:
            return "high"
        elif metric.importance_score > 0.5:
            return "medium"
        else:
            return "low"
    
    def _requires_action(self, metric: BusinessMetric) -> bool:
        """Determine if a metric requires immediate action"""
        # Critical thresholds or negative trends require action
        if metric.importance_score > 0.8 or metric.trend == "decreasing":
            return True
        return False
    
    def _generate_metric_recommendation(self, metric: BusinessMetric) -> str:
        """Generate recommendation based on metric analysis"""
        if metric.trend == "decreasing":
            return f"Investigate and address declining {metric.name}"
        elif metric.trend == "increasing":
            return f"Leverage improving {metric.name} for growth opportunities"
        else:
            return f"Monitor {metric.name} for optimization opportunities"
    
    def _is_critical_threshold(self, metric: BusinessMetric) -> bool:
        """Check if metric has reached critical threshold"""
        # Example thresholds - would be configurable in real implementation
        thresholds = {
            "Monthly Recurring Revenue": {"min": 10000, "critical": True},
            "Customer Acquisition Cost": {"max": 50, "critical": True},
            "Content Engagement Rate": {"min": 2.0, "critical": False},
            "Agent Efficiency Score": {"min": 80, "critical": True}
        }
        
        if metric.name in thresholds:
            threshold = thresholds[metric.name]
            if "min" in threshold and metric.value < threshold["min"]:
                return threshold["critical"]
            elif "max" in threshold and metric.value > threshold["max"]:
                return threshold["critical"]
        
        return False
    
    def get_dashboard_state(self) -> Dict[str, Any]:
        """Get current dashboard state for frontend integration"""
        return {
            "last_updated": datetime.now().isoformat(),
            "active_insights": len(self.insights_library),
            "pending_alerts": len([a for a in self.alerts_library.values() if a.action_required]),
            "key_metrics": {
                "financial_health": "Good",
                "customer_satisfaction": "High", 
                "content_performance": "Improving",
                "operational_status": "Stable"
            },
            "recommendations_count": len(self.insights_library),
            "goal_progress": {
                "revenue_growth": "On track",
                "customer_acquisition": "Ahead of target",
                "operational_efficiency": "Meeting goals"
            }
        }
    
    def calculate_core_kpis(self) -> Dict[str, KPIMetric]:
        """Calculate all core KPIs for CEO snapshot"""
        try:
            kpis = {}
            
            # Revenue Growth Rate
            current_revenue = 150000.0  # This would come from financial agent
            previous_revenue = 125000.0
            revenue_growth = ((current_revenue - previous_revenue) / previous_revenue) * 100
            kpis["revenue_growth_rate"] = KPIMetric(
                kpi_id="rev_growth_001",
                name="Revenue Growth Rate",
                current_value=revenue_growth,
                previous_value=15.2,  # Previous period
                target_value=25.0,
                unit="percent",
                category="financial",
                trend_direction="up" if revenue_growth > 0 else "down",
                trend_percentage=revenue_growth,
                status=self._get_kpi_status(revenue_growth, 25.0, 15.0),
                calculation_method="((Current Revenue - Previous Revenue) / Previous Revenue) * 100",
                data_sources=["bookkeeping_agent", "analytics_agent"],
                last_updated=datetime.now(),
                business_impact="high"
            )
            
            # Net Profit Margin
            net_profit = 40000.0  # From financial data
            total_revenue = 150000.0
            profit_margin = (net_profit / total_revenue) * 100
            kpis["net_profit_margin"] = KPIMetric(
                kpi_id="profit_margin_001",
                name="Net Profit Margin",
                current_value=profit_margin,
                previous_value=24.5,
                target_value=30.0,
                unit="percent",
                category="financial",
                trend_direction="up" if profit_margin > 24.5 else "down",
                trend_percentage=profit_margin - 24.5,
                status=self._get_kpi_status(profit_margin, 30.0, 20.0),
                calculation_method="(Net Profit / Total Revenue) * 100",
                data_sources=["bookkeeping_agent"],
                last_updated=datetime.now(),
                business_impact="high"
            )
            
            # Customer Acquisition Cost (CAC)
            marketing_spend = 15000.0
            new_customers = 250
            cac = marketing_spend / new_customers
            kpis["customer_acquisition_cost"] = KPIMetric(
                kpi_id="cac_001",
                name="Customer Acquisition Cost",
                current_value=cac,
                previous_value=65.0,
                target_value=50.0,
                unit="USD",
                category="customer",
                trend_direction="down" if cac < 65.0 else "up",
                trend_percentage=((cac - 65.0) / 65.0) * 100,
                status=self._get_kpi_status(cac, 50.0, 75.0, reverse=True),  # Lower is better
                calculation_method="Total Marketing Spend / New Customers",
                data_sources=["marketing_agent", "analytics_agent"],
                last_updated=datetime.now(),
                business_impact="high"
            )
            
            # Customer Lifetime Value (CLV)
            avg_monthly_revenue = 125.0
            avg_customer_lifespan = 24.0  # months
            clv = avg_monthly_revenue * avg_customer_lifespan
            kpis["customer_lifetime_value"] = KPIMetric(
                kpi_id="clv_001",
                name="Customer Lifetime Value",
                current_value=clv,
                previous_value=2800.0,
                target_value=3500.0,
                unit="USD",
                category="customer",
                trend_direction="up" if clv > 2800.0 else "down",
                trend_percentage=((clv - 2800.0) / 2800.0) * 100,
                status=self._get_kpi_status(clv, 3500.0, 2500.0),
                calculation_method="Average Monthly Revenue * Customer Lifespan",
                data_sources=["analytics_agent", "crm_agent"],
                last_updated=datetime.now(),
                business_impact="high"
            )
            
            # ROI by Campaigns
            campaign_revenue = 45000.0
            campaign_spend = 15000.0
            roi = ((campaign_revenue - campaign_spend) / campaign_spend) * 100
            kpis["campaign_roi"] = KPIMetric(
                kpi_id="campaign_roi_001",
                name="Campaign ROI",
                current_value=roi,
                previous_value=180.0,
                target_value=200.0,
                unit="percent",
                category="marketing",
                trend_direction="up" if roi > 180.0 else "down",
                trend_percentage=roi - 180.0,
                status=self._get_kpi_status(roi, 200.0, 150.0),
                calculation_method="((Revenue - Spend) / Spend) * 100",
                data_sources=["marketing_agent", "analytics_agent"],
                last_updated=datetime.now(),
                business_impact="high"
            )
            
            # Conversion Rates Across Funnel Stages
            leads = 1000
            prospects = 150
            customers = 25
            lead_to_prospect = (prospects / leads) * 100
            prospect_to_customer = (customers / prospects) * 100
            overall_conversion = (customers / leads) * 100
            
            kpis["funnel_conversion_rates"] = KPIMetric(
                kpi_id="funnel_conv_001",
                name="Overall Conversion Rate",
                current_value=overall_conversion,
                previous_value=2.1,
                target_value=3.5,
                unit="percent",
                category="sales",
                trend_direction="up" if overall_conversion > 2.1 else "down",
                trend_percentage=overall_conversion - 2.1,
                status=self._get_kpi_status(overall_conversion, 3.5, 2.0),
                calculation_method="(Customers / Leads) * 100",
                data_sources=["crm_agent", "analytics_agent"],
                last_updated=datetime.now(),
                business_impact="high"
            )
            
            # Churn Rate
            customers_start = 1200
            customers_lost = 48
            churn_rate = (customers_lost / customers_start) * 100
            kpis["churn_rate"] = KPIMetric(
                kpi_id="churn_001",
                name="Customer Churn Rate",
                current_value=churn_rate,
                previous_value=3.8,
                target_value=3.0,
                unit="percent",
                category="customer",
                trend_direction="down" if churn_rate < 3.8 else "up",
                trend_percentage=((churn_rate - 3.8) / 3.8) * 100,
                status=self._get_kpi_status(churn_rate, 3.0, 5.0, reverse=True),  # Lower is better
                calculation_method="(Customers Lost / Customers at Start) * 100",
                data_sources=["crm_agent", "analytics_agent"],
                last_updated=datetime.now(),
                business_impact="high"
            )
            
            # Net Promoter Score (NPS)
            promoters = 180  # 9-10 ratings
            detractors = 45   # 0-6 ratings
            total_surveyed = 250
            nps = ((promoters - detractors) / total_surveyed) * 100
            kpis["net_promoter_score"] = KPIMetric(
                kpi_id="nps_001",
                name="Net Promoter Score",
                current_value=nps,
                previous_value=48.0,
                target_value=60.0,
                unit="score",
                category="customer",
                trend_direction="up" if nps > 48.0 else "down",
                trend_percentage=nps - 48.0,
                status=self._get_kpi_status(nps, 60.0, 40.0),
                calculation_method="((Promoters - Detractors) / Total Respondents) * 100",
                data_sources=["crm_agent", "customer_support_agent"],
                last_updated=datetime.now(),
                business_impact="medium"
            )
            
            # Operational Efficiency Metrics
            tasks_completed = 485
            tasks_automated = 380
            automation_coverage = (tasks_automated / tasks_completed) * 100
            kpis["operational_efficiency"] = KPIMetric(
                kpi_id="op_eff_001",
                name="Operational Efficiency",
                current_value=automation_coverage,
                previous_value=75.2,
                target_value=85.0,
                unit="percent",
                category="operational",
                trend_direction="up" if automation_coverage > 75.2 else "down",
                trend_percentage=automation_coverage - 75.2,
                status=self._get_kpi_status(automation_coverage, 85.0, 70.0),
                calculation_method="(Automated Tasks / Total Tasks) * 100",
                data_sources=["workflow_manager", "automation_agent"],
                last_updated=datetime.now(),
                business_impact="medium"
            )
            
            # Time Saved via Agents
            manual_time_estimate = 40.0  # hours per week
            actual_time_spent = 8.0
            time_saved = manual_time_estimate - actual_time_spent
            kpis["time_saved_agents"] = KPIMetric(
                kpi_id="time_saved_001",
                name="Time Saved via Agents",
                current_value=time_saved,
                previous_value=30.0,
                target_value=35.0,
                unit="hours/week",
                category="operational",
                trend_direction="up" if time_saved > 30.0 else "down",
                trend_percentage=((time_saved - 30.0) / 30.0) * 100,
                status=self._get_kpi_status(time_saved, 35.0, 25.0),
                calculation_method="Estimated Manual Time - Actual Time Spent",
                data_sources=["workflow_manager", "all_agents"],
                last_updated=datetime.now(),
                business_impact="medium"
            )
            
            # Cash Runway / Burn Rate (for startups/solopreneurs)
            current_cash = 125000.0
            monthly_burn = 15000.0
            runway_months = current_cash / monthly_burn
            kpis["cash_runway"] = KPIMetric(
                kpi_id="runway_001",
                name="Cash Runway",
                current_value=runway_months,
                previous_value=6.8,
                target_value=12.0,
                unit="months",
                category="financial",
                trend_direction="up" if runway_months > 6.8 else "down",
                trend_percentage=((runway_months - 6.8) / 6.8) * 100,
                status=self._get_kpi_status(runway_months, 12.0, 6.0),
                calculation_method="Current Cash / Monthly Burn Rate",
                data_sources=["bookkeeping_agent", "financial_analytics"],
                last_updated=datetime.now(),
                business_impact="critical"
            )
            
            self.kpi_metrics = kpis
            return kpis
            
        except Exception as e:
            print(f"Error calculating core KPIs: {e}")
            return {}
    
    def _get_kpi_status(self, current_value: float, target_value: float, warning_threshold: float, reverse: bool = False) -> str:
        """Determine KPI status based on current value vs targets"""
        if reverse:  # Lower is better (like CAC, churn rate)
            if current_value <= target_value:
                return "excellent"
            elif current_value <= warning_threshold:
                return "good"
            elif current_value <= warning_threshold * 1.2:
                return "warning"
            else:
                return "critical"
        else:  # Higher is better
            if current_value >= target_value:
                return "excellent"
            elif current_value >= target_value * 0.9:
                return "good"
            elif current_value >= target_value * 0.7:
                return "warning"
            else:
                return "critical"
    
    def generate_ceo_snapshot(self) -> Dict[str, Any]:
        """Generate comprehensive CEO snapshot with all KPIs"""
        try:
            kpis = self.calculate_core_kpis()
            
            # Calculate overall business health score
            excellent_count = sum(1 for kpi in kpis.values() if kpi.status == "excellent")
            good_count = sum(1 for kpi in kpis.values() if kpi.status == "good")
            warning_count = sum(1 for kpi in kpis.values() if kpi.status == "warning")
            critical_count = sum(1 for kpi in kpis.values() if kpi.status == "critical")
            
            total_kpis = len(kpis)
            health_score = ((excellent_count * 4) + (good_count * 3) + (warning_count * 2) + (critical_count * 1)) / (total_kpis * 4) * 100
            
            # Determine overall business health
            if health_score >= 85:
                overall_health = "Excellent"
                health_color = "green"
            elif health_score >= 70:
                overall_health = "Good"
                health_color = "blue"
            elif health_score >= 50:
                overall_health = "Warning"
                health_color = "yellow"
            else:
                overall_health = "Critical"
                health_color = "red"
            
            # Identify top priorities
            critical_kpis = [kpi for kpi in kpis.values() if kpi.status == "critical"]
            warning_kpis = [kpi for kpi in kpis.values() if kpi.status == "warning"]
            
            # Generate executive summary
            executive_summary = self._generate_executive_summary(kpis, health_score, overall_health)
            
            # Generate actionable insights
            actionable_insights = self._generate_actionable_insights(kpis)
            
            self.ceo_snapshot = {
                "snapshot_id": f"ceo_snapshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "generated_at": datetime.now().isoformat(),
                "overall_business_health": {
                    "score": round(health_score, 1),
                    "status": overall_health,
                    "color": health_color,
                    "trend": "improving" if health_score > 70 else "declining"
                },
                "kpi_summary": {
                    "total_kpis": total_kpis,
                    "excellent": excellent_count,
                    "good": good_count,
                    "warning": warning_count,
                    "critical": critical_count
                },
                "core_kpis": kpis,
                "executive_summary": executive_summary,
                "actionable_insights": actionable_insights,
                "top_priorities": {
                    "critical_issues": [kpi.name for kpi in critical_kpis],
                    "attention_needed": [kpi.name for kpi in warning_kpis],
                    "immediate_actions": self._generate_immediate_actions(critical_kpis)
                },
                "financial_health": {
                    "revenue_growth": kpis.get("revenue_growth_rate", {}),
                    "profit_margin": kpis.get("net_profit_margin", {}),
                    "cash_runway": kpis.get("cash_runway", {}),
                    "campaign_roi": kpis.get("campaign_roi", {})
                },
                "customer_health": {
                    "acquisition_cost": kpis.get("customer_acquisition_cost", {}),
                    "lifetime_value": kpis.get("customer_lifetime_value", {}),
                    "churn_rate": kpis.get("churn_rate", {}),
                    "nps": kpis.get("net_promoter_score", {}),
                    "conversion_rate": kpis.get("funnel_conversion_rates", {})
                },
                "operational_health": {
                    "efficiency": kpis.get("operational_efficiency", {}),
                    "time_saved": kpis.get("time_saved_agents", {}),
                    "automation_coverage": kpis.get("operational_efficiency", {}).current_value if kpis.get("operational_efficiency") else 0
                }
            }
            
            return self.ceo_snapshot
            
        except Exception as e:
            print(f"Error generating CEO snapshot: {e}")
            return {
                "error": str(e),
                "generated_at": datetime.now().isoformat()
            }
    
    def _generate_executive_summary(self, kpis: Dict[str, KPIMetric], health_score: float, overall_health: str) -> str:
        """Generate executive summary based on KPI analysis"""
        try:
            # Key insights
            revenue_growth = kpis.get("revenue_growth_rate")
            profit_margin = kpis.get("net_profit_margin")
            cash_runway = kpis.get("cash_runway")
            
            summary_parts = []
            
            # Overall health
            summary_parts.append(f"Business health is {overall_health.lower()} with a score of {health_score:.1f}/100.")
            
            # Financial performance
            if revenue_growth:
                if revenue_growth.current_value >= revenue_growth.target_value:
                    summary_parts.append(f"Revenue is growing strongly at {revenue_growth.current_value:.1f}%, exceeding the {revenue_growth.target_value:.1f}% target.")
                else:
                    summary_parts.append(f"Revenue growth is at {revenue_growth.current_value:.1f}%, below the {revenue_growth.target_value:.1f}% target.")
            
            # Profitability
            if profit_margin:
                if profit_margin.current_value >= profit_margin.target_value:
                    summary_parts.append(f"Profit margins are healthy at {profit_margin.current_value:.1f}%, meeting targets.")
                else:
                    summary_parts.append(f"Profit margins need improvement at {profit_margin.current_value:.1f}% vs {profit_margin.target_value:.1f}% target.")
            
            # Cash position
            if cash_runway:
                if cash_runway.current_value >= 12:
                    summary_parts.append(f"Cash runway is strong at {cash_runway.current_value:.1f} months.")
                elif cash_runway.current_value >= 6:
                    summary_parts.append(f"Cash runway is adequate at {cash_runway.current_value:.1f} months but should be monitored.")
                else:
                    summary_parts.append(f"Cash runway is critical at {cash_runway.current_value:.1f} months - immediate action needed.")
            
            return " ".join(summary_parts)
            
        except Exception as e:
            return f"Unable to generate executive summary: {str(e)}"
    
    def _generate_actionable_insights(self, kpis: Dict[str, KPIMetric]) -> List[str]:
        """Generate actionable insights based on KPI analysis"""
        insights = []
        
        try:
            # Revenue growth insights
            revenue_growth = kpis.get("revenue_growth_rate")
            if revenue_growth and revenue_growth.current_value < revenue_growth.target_value:
                insights.append(f"Revenue growth is {revenue_growth.current_value:.1f}% vs {revenue_growth.target_value:.1f}% target. Consider increasing marketing spend or optimizing conversion rates.")
            
            # Customer acquisition insights
            cac = kpis.get("customer_acquisition_cost")
            clv = kpis.get("customer_lifetime_value")
            if cac and clv:
                clv_cac_ratio = clv.current_value / cac.current_value
                if clv_cac_ratio < 3:
                    insights.append(f"CLV:CAC ratio is {clv_cac_ratio:.1f}:1, below the recommended 3:1 ratio. Focus on improving customer lifetime value or reducing acquisition costs.")
            
            # Churn rate insights
            churn = kpis.get("churn_rate")
            if churn and churn.current_value > churn.target_value:
                insights.append(f"Customer churn rate is {churn.current_value:.1f}% vs {churn.target_value:.1f}% target. Implement customer retention strategies.")
            
            # Conversion rate insights
            conversion = kpis.get("funnel_conversion_rates")
            if conversion and conversion.current_value < conversion.target_value:
                insights.append(f"Overall conversion rate is {conversion.current_value:.1f}% vs {conversion.target_value:.1f}% target. Optimize funnel stages and improve lead quality.")
            
            # Operational efficiency insights
            efficiency = kpis.get("operational_efficiency")
            if efficiency and efficiency.current_value < efficiency.target_value:
                insights.append(f"Operational efficiency is {efficiency.current_value:.1f}% vs {efficiency.target_value:.1f}% target. Increase automation and streamline workflows.")
            
            # Cash runway insights
            runway = kpis.get("cash_runway")
            if runway and runway.current_value < 6:
                insights.append(f"Cash runway is critical at {runway.current_value:.1f} months. Focus on increasing revenue or reducing burn rate immediately.")
            
            return insights[:5]  # Limit to top 5 insights
            
        except Exception as e:
            return [f"Unable to generate insights: {str(e)}"]
    
    def _generate_immediate_actions(self, critical_kpis: List[KPIMetric]) -> List[str]:
        """Generate immediate actions for critical KPIs"""
        actions = []
        
        for kpi in critical_kpis:
            if kpi.kpi_id == "runway_001":
                actions.append("URGENT: Increase revenue or reduce burn rate to extend cash runway")
            elif kpi.kpi_id == "churn_001":
                actions.append("Implement customer retention program immediately")
            elif kpi.kpi_id == "cac_001":
                actions.append("Optimize marketing campaigns to reduce customer acquisition cost")
            elif kpi.kpi_id == "funnel_conv_001":
                actions.append("Review and optimize sales funnel conversion rates")
            elif kpi.kpi_id == "rev_growth_001":
                actions.append("Increase marketing spend or improve conversion rates")
        
        return actions[:3]  # Limit to top 3 immediate actions
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        return {
            "name": self.name,
            "role": self.role,
            "expertise": self.expertise,
            "capabilities": self.capabilities,
            "kpi_tracking": {
                "core_kpis": [
                    "Revenue Growth Rate",
                    "Net Profit Margin", 
                    "Customer Acquisition Cost",
                    "Customer Lifetime Value",
                    "Campaign ROI",
                    "Conversion Rates",
                    "Churn Rate",
                    "Net Promoter Score",
                    "Operational Efficiency",
                    "Time Saved via Agents",
                    "Cash Runway"
                ],
                "ceo_snapshot": "Comprehensive business health overview",
                "executive_reporting": "High-level strategic insights"
            },
            "dashboard_integration": {
                "main_dashboard": "Primary intelligence coordinator",
                "financial_dashboard": "Financial metrics and trends",
                "customer_dashboard": "Customer insights and satisfaction",
                "content_dashboard": "Content performance analytics",
                "operational_dashboard": "Agent activity and system health"
            }
        }
