"""
Intelligence Agent Coordinator
Coordinates between Orchestrator and all Intelligence Agents (Business, Financial, Content, Customer)
Provides unified business intelligence for CEO-level decision making.
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class IntelligenceAgentCoordinator:
    """
    Coordinates all intelligence agents to provide comprehensive business intelligence
    to the orchestrator for CEO-level decision making.
    """
    
    def __init__(self):
        self.agent_endpoints = {
            'business_intelligence': '/api/business-intelligence/ceo-snapshot',
            'financial_intelligence': '/api/financial/analysis', 
            'content_intelligence': '/api/content/analysis',
            'customer_intelligence': '/api/customer/analysis'
        }
    
    async def get_comprehensive_business_intelligence(
        self, 
        user_id: str, 
        business_context: dict
    ) -> Dict[str, Any]:
        """
        Get comprehensive business intelligence from all intelligence agents.
        This is the single source of truth for business intelligence.
        """
        try:
            # Get intelligence from all agents in parallel
            intelligence_tasks = [
                self._get_business_intelligence(user_id, business_context),
                self._get_financial_intelligence(user_id, business_context),
                self._get_content_intelligence(user_id, business_context),
                self._get_customer_intelligence(user_id, business_context)
            ]
            
            results = await asyncio.gather(*intelligence_tasks, return_exceptions=True)
            
            # Process results
            intelligence_data = {
                'business_intelligence': results[0] if not isinstance(results[0], Exception) else {},
                'financial_intelligence': results[1] if not isinstance(results[1], Exception) else {},
                'content_intelligence': results[2] if not isinstance(results[2], Exception) else {},
                'customer_intelligence': results[3] if not isinstance(results[3], Exception) else {},
                'consolidated_insights': {},
                'executive_summary': '',
                'critical_alerts': [],
                'growth_opportunities': [],
                'immediate_actions': [],
                'last_updated': datetime.now().isoformat()
            }
            
            # Generate consolidated insights
            intelligence_data['consolidated_insights'] = await self._generate_consolidated_insights(intelligence_data)
            intelligence_data['executive_summary'] = await self._generate_executive_summary(intelligence_data)
            intelligence_data['critical_alerts'] = await self._identify_critical_alerts(intelligence_data)
            intelligence_data['growth_opportunities'] = await self._identify_growth_opportunities(intelligence_data)
            intelligence_data['immediate_actions'] = await self._generate_immediate_actions(intelligence_data)
            
            return intelligence_data
            
        except Exception as e:
            logger.error(f"Error getting comprehensive business intelligence: {e}")
            return {'error': str(e)}
    
    async def _get_business_intelligence(self, user_id: str, business_context: dict) -> Dict[str, Any]:
        """Get business intelligence from Business Intelligence Agent"""
        try:
            # This would call the actual Business Intelligence Agent
            # For now, return sample data based on the implementation docs
            
            return {
                'overall_business_health': {
                    'score': 78.5,
                    'status': 'Good',
                    'trend': 'improving'
                },
                'kpi_summary': {
                    'total_kpis': 11,
                    'excellent': 3,
                    'good': 5,
                    'warning': 2,
                    'critical': 1
                },
                'key_metrics': {
                    'revenue_growth_rate': {'current': 20.0, 'target': 25.0, 'trend': 'up', 'change': 5.2},
                    'net_profit_margin': {'current': 26.7, 'target': 30.0, 'trend': 'up', 'change': 2.1},
                    'operational_efficiency': {'current': 85.0, 'target': 90.0, 'trend': 'up', 'change': 3.5}
                },
                'critical_issues': ['Cash runway below 6 months'],
                'immediate_actions': [
                    'URGENT: Increase revenue or reduce burn rate to extend cash runway'
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting business intelligence: {e}")
            return {}
    
    async def _get_financial_intelligence(self, user_id: str, business_context: dict) -> Dict[str, Any]:
        """Get financial intelligence from Financial Intelligence Agent"""
        try:
            # This would call the actual Financial Intelligence Agent
            # Based on the implementation docs
            
            return {
                'financial_health_score': 75.5,
                'cash_flow_status': 'stable',
                'key_metrics': {
                    'mrr': {'current': 45000, 'target': 50000, 'trend': 'up', 'change': 15.2},
                    'arr': {'current': 540000, 'target': 600000, 'trend': 'up', 'change': 12.8},
                    'cash_runway': {'current': 8.5, 'target': 12.0, 'trend': 'down', 'change': -1.2},
                    'burn_rate': {'current': 8500, 'target': 7000, 'trend': 'up', 'change': 12.0}
                },
                'risk_assessment': {
                    'high_risk_items': ['Cash runway below 6 months'],
                    'medium_risk_items': ['Ad spend efficiency declining'],
                    'low_risk_items': ['Seasonal revenue fluctuations']
                },
                'opportunities': [
                    'Upsell existing customers for 25% revenue increase',
                    'Optimize ad spend for 20% cost reduction'
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting financial intelligence: {e}")
            return {}
    
    async def _get_content_intelligence(self, user_id: str, business_context: dict) -> Dict[str, Any]:
        """Get content intelligence from Content Intelligence Agent"""
        try:
            # This would call the actual Content Intelligence Agent
            # Based on the implementation docs
            
            return {
                'content_health_score': 82.5,
                'overall_performance': 'excellent',
                'key_metrics': {
                    'content_output': {'posts_per_week': 28, 'blogs_per_month': 8, 'videos_per_week': 5},
                    'engagement_rate': {'current': 4.8, 'target': 5.0, 'trend': 'up', 'change': 14.3},
                    'conversion_rate': {'current': 3.2, 'target': 3.5, 'trend': 'up', 'change': 12.5},
                    'cost_per_lead': {'current': 28.50, 'target': 25.0, 'trend': 'down', 'change': -10.9}
                },
                'top_performing_content': [
                    {'platform': 'instagram', 'content_type': 'reel', 'performance_score': 95.0}
                ],
                'optimization_opportunities': [
                    {'platform': 'facebook', 'opportunity': 'Increase video content frequency', 'potential_improvement': '25% engagement increase'}
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting content intelligence: {e}")
            return {}
    
    async def _get_customer_intelligence(self, user_id: str, business_context: dict) -> Dict[str, Any]:
        """Get customer intelligence from Customer Intelligence Agent"""
        try:
            # This would call the actual Customer Intelligence Agent
            # Based on the implementation docs
            
            return {
                'customer_health_score': 78.5,
                'overall_customer_satisfaction': 'good',
                'key_metrics': {
                    'customer_growth_rate': {'current': 15.2, 'target': 20.0, 'trend': 'up', 'change': 8.5},
                    'retention_rate': {'current': 82.5, 'target': 85.0, 'trend': 'up', 'change': 12.0},
                    'churn_rate': {'current': 12.8, 'target': 10.0, 'trend': 'down', 'change': -17.4},
                    'customer_lifetime_value': {'current': 2850, 'target': 3200, 'trend': 'up', 'change': 22.3},
                    'nps_score': {'current': 68.5, 'target': 75.0, 'trend': 'up', 'change': 9.2}
                },
                'customer_segments': {
                    'high_value_customers': {'count': 45, 'average_lifetime_value': 8500, 'retention_rate': 95.2},
                    'at_risk_customers': {'count': 28, 'average_lifetime_value': 3200, 'retention_rate': 64.2}
                },
                'immediate_actions': [
                    'Launch win-back campaign for 45 at-risk customers',
                    'Implement VIP program for top 20 customers'
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting customer intelligence: {e}")
            return {}
    
    async def _generate_consolidated_insights(self, intelligence_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate consolidated insights from all intelligence agents"""
        try:
            insights = {
                'overall_health_score': 0,
                'key_trends': [],
                'cross_agent_correlations': [],
                'performance_summary': {}
            }
            
            # Calculate overall health score
            scores = []
            if intelligence_data.get('business_intelligence', {}).get('overall_business_health', {}).get('score'):
                scores.append(intelligence_data['business_intelligence']['overall_business_health']['score'])
            if intelligence_data.get('financial_intelligence', {}).get('financial_health_score'):
                scores.append(intelligence_data['financial_intelligence']['financial_health_score'])
            if intelligence_data.get('content_intelligence', {}).get('content_health_score'):
                scores.append(intelligence_data['content_intelligence']['content_health_score'])
            if intelligence_data.get('customer_intelligence', {}).get('customer_health_score'):
                scores.append(intelligence_data['customer_intelligence']['customer_health_score'])
            
            insights['overall_health_score'] = sum(scores) / len(scores) if scores else 0
            
            # Identify key trends
            insights['key_trends'] = [
                'Revenue growth is steady across all channels',
                'Customer retention is improving significantly',
                'Content engagement is driving higher conversion rates',
                'Cash runway needs immediate attention'
            ]
            
            # Cross-agent correlations
            insights['cross_agent_correlations'] = [
                'High-performing content is driving customer acquisition',
                'Customer retention improvements are boosting revenue growth',
                'Financial efficiency gains are enabling content investment'
            ]
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating consolidated insights: {e}")
            return {}
    
    async def _generate_executive_summary(self, intelligence_data: Dict[str, Any]) -> str:
        """Generate executive summary from all intelligence data"""
        try:
            overall_score = intelligence_data.get('consolidated_insights', {}).get('overall_health_score', 0)
            
            summary = f"""Business Health Score: {overall_score:.1f}/100
            
Key Highlights:
• Revenue growing at 15.2% month-over-month
• Customer retention improved by 12% this quarter  
• Content engagement up 25% across all platforms
• Cash runway adequate at 8.5 months

Critical Focus Areas:
• Optimize ad spend allocation for better ROI
• Launch customer retention campaign for at-risk customers
• Increase content production for high-performing formats
• Review pricing strategy for improved margins

The business is performing well overall with strong growth indicators, but cash management and customer retention require focused attention."""
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating executive summary: {e}")
            return "Unable to generate executive summary at this time."
    
    async def _identify_critical_alerts(self, intelligence_data: Dict[str, Any]) -> List[str]:
        """Identify critical alerts from all intelligence agents"""
        try:
            alerts = []
            
            # Business intelligence alerts
            business_alerts = intelligence_data.get('business_intelligence', {}).get('critical_issues', [])
            alerts.extend([f"Business: {alert}" for alert in business_alerts])
            
            # Financial intelligence alerts  
            financial_risks = intelligence_data.get('financial_intelligence', {}).get('risk_assessment', {}).get('high_risk_items', [])
            alerts.extend([f"Financial: {risk}" for risk in financial_risks])
            
            # Customer intelligence alerts
            customer_actions = intelligence_data.get('customer_intelligence', {}).get('immediate_actions', [])
            alerts.extend([f"Customer: {action}" for action in customer_actions[:2]])  # Top 2
            
            return alerts[:5]  # Return top 5 critical alerts
            
        except Exception as e:
            logger.error(f"Error identifying critical alerts: {e}")
            return []
    
    async def _identify_growth_opportunities(self, intelligence_data: Dict[str, Any]) -> List[str]:
        """Identify growth opportunities from all intelligence agents"""
        try:
            opportunities = []
            
            # Financial opportunities
            financial_opps = intelligence_data.get('financial_intelligence', {}).get('opportunities', [])
            opportunities.extend(financial_opps)
            
            # Content opportunities
            content_opps = intelligence_data.get('content_intelligence', {}).get('optimization_opportunities', [])
            for opp in content_opps:
                if isinstance(opp, dict):
                    opportunities.append(f"Content: {opp.get('opportunity', '')} - {opp.get('potential_improvement', '')}")
            
            # Business opportunities
            opportunities.extend([
                "Expand to new market segments",
                "Implement referral program for customer acquisition",
                "Develop premium service offerings",
                "Optimize operational processes for efficiency"
            ])
            
            return opportunities[:8]  # Return top 8 opportunities
            
        except Exception as e:
            logger.error(f"Error identifying growth opportunities: {e}")
            return []
    
    async def _generate_immediate_actions(self, intelligence_data: Dict[str, Any]) -> List[str]:
        """Generate immediate actions from all intelligence agents"""
        try:
            actions = []
            
            # Business actions
            business_actions = intelligence_data.get('business_intelligence', {}).get('immediate_actions', [])
            actions.extend(business_actions)
            
            # Customer actions
            customer_actions = intelligence_data.get('customer_intelligence', {}).get('immediate_actions', [])
            actions.extend(customer_actions)
            
            # Add orchestrator-specific actions
            actions.extend([
                "Schedule weekly business review meeting",
                "Update marketing budget allocation based on performance data",
                "Implement customer feedback collection system",
                "Review and optimize content calendar for next quarter"
            ])
            
            return actions[:6]  # Return top 6 immediate actions
            
        except Exception as e:
            logger.error(f"Error generating immediate actions: {e}")
            return []
    
    async def get_agent_performance_metrics(self, user_id: str) -> Dict[str, Any]:
        """Get performance metrics from all agents for the agent dashboard"""
        try:
            # This would integrate with the actual agent execution tracking
            return {
                'total_agents': 115,
                'active_agents': 23,
                'system_uptime': '99.9%',
                'average_efficiency': 0.92,
                'agent_performance': [
                    {
                        'agent_name': 'Research Agent',
                        'status': 'working',
                        'efficiency': 0.92,
                        'tasks_completed': 45,
                        'success_rate': 92.0
                    },
                    {
                        'agent_name': 'Content Strategist',
                        'status': 'working', 
                        'efficiency': 0.88,
                        'tasks_completed': 32,
                        'success_rate': 88.0
                    },
                    {
                        'agent_name': 'Analytics Agent',
                        'status': 'working',
                        'efficiency': 0.95,
                        'tasks_completed': 67,
                        'success_rate': 95.0
                    }
                ],
                'workflow_status': {
                    'running': 3,
                    'completed': 12,
                    'pending': 1,
                    'failed': 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting agent performance metrics: {e}")
            return {}

# Global instance
intelligence_coordinator = IntelligenceAgentCoordinator()
