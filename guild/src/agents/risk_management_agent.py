"""
Risk Management Agent for Guild-AI
Comprehensive risk identification and mitigation using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json

@inject_knowledge
async def generate_comprehensive_risk_management_strategy(
    business_context: str,
    legal_environment: Dict[str, Any],
    operational_structure: Dict[str, Any],
    financial_exposure: Dict[str, Any],
    industry_risks: Dict[str, Any],
    risk_tolerance: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive risk management strategy using advanced prompting strategies.
    Identifies legal, operational, financial risks and proposes mitigation strategies.
    """
    print("Risk Management Agent: Generating comprehensive risk management strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Risk Management Agent - Comprehensive Risk Identification & Mitigation

## Role Definition
You are the **Risk Management Agent**, an expert in identifying, assessing, and mitigating various business risks. Your role is to conduct thorough risk analyses across legal, operational, financial, and strategic dimensions, quantify potential impacts, and develop practical mitigation strategies to protect the business.

## Core Expertise
- Legal & Regulatory Compliance Risk
- Operational & Process Risk
- Financial & Market Risk
- Strategic & Business Model Risk
- Cybersecurity & Data Protection Risk
- Reputational & Brand Risk
- Supply Chain & Vendor Risk
- Human Capital & Talent Risk

## Context & Background Information
**Business Context:** {business_context}
**Legal Environment:** {json.dumps(legal_environment, indent=2)}
**Operational Structure:** {json.dumps(operational_structure, indent=2)}
**Financial Exposure:** {json.dumps(financial_exposure, indent=2)}
**Industry Risks:** {json.dumps(industry_risks, indent=2)}
**Risk Tolerance:** {json.dumps(risk_tolerance, indent=2)}

## Task Breakdown & Steps
1. **Risk Identification:** Comprehensively identify risks across all business dimensions
2. **Risk Assessment:** Evaluate likelihood, impact, and vulnerability for each risk
3. **Risk Prioritization:** Rank risks based on severity, urgency, and organizational impact
4. **Mitigation Strategy Development:** Create practical strategies to address priority risks
5. **Control Implementation:** Define specific controls and safeguards for each risk area
6. **Monitoring Framework:** Establish ongoing monitoring mechanisms and early warning indicators
7. **Contingency Planning:** Develop response plans for high-impact risk scenarios
8. **Risk Governance:** Define roles, responsibilities, and reporting for risk management

## Constraints & Rules
- Risk assessments must be data-driven and evidence-based
- Legal risks must consider relevant jurisdictions and regulatory requirements
- Financial risk analysis must include both direct and indirect impacts
- Operational risks must consider process dependencies and bottlenecks
- Mitigation strategies must be practical, cost-effective, and proportionate to the risk
- All recommendations must align with the organization's risk tolerance
- Confidentiality and data protection must be maintained throughout
- Risk monitoring must be ongoing and adaptive to changing conditions

## Output Format
Return a comprehensive JSON object with risk assessments, prioritization, mitigation strategies, and monitoring frameworks.

Generate the comprehensive risk management strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            risk_strategy = json.loads(response)
            print("Risk Management Agent: Successfully generated comprehensive risk management strategy.")
            return risk_strategy
        except json.JSONDecodeError as e:
            print(f"Risk Management Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    risk_strategy = json.loads(json_match.group(1))
                    print("Risk Management Agent: Successfully extracted and parsed JSON from response.")
                    return risk_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Risk Management Agent: Execution error: {e}")
        return {"error": str(e)}

@dataclass
class Risk:
    risk_id: str
    category: str  # legal, operational, financial, strategic, etc.
    title: str
    description: str
    likelihood: float  # 0.0 to 1.0
    impact: float  # 0.0 to 1.0
    risk_score: float  # likelihood * impact
    priority: str  # high, medium, low
    status: str  # identified, assessed, mitigated, accepted, monitored
    owner: str
    created_date: datetime
    tags: List[str]

@dataclass
class MitigationStrategy:
    strategy_id: str
    risk_id: str
    title: str
    description: str
    approach: str  # avoid, reduce, transfer, accept
    actions: List[Dict[str, Any]]
    effectiveness: float  # 0.0 to 1.0
    cost: Dict[str, Any]
    timeframe: str
    implementation_status: str  # not started, in progress, implemented, verified
    residual_risk: float  # 0.0 to 1.0

class RiskManagementAgent:
    """
    Risk Management Agent - Expert in identifying, assessing, and mitigating various business risks
    
    Identifies legal, operational, financial risks and proposes mitigation strategies to protect
    the business and ensure continuity of operations.
    """
    
    def __init__(self, user_input: str = None):
        self.user_input = user_input
        self.agent_name = "Risk Management Agent"
        self.agent_type = "Strategy & Executive"
        self.capabilities = [
            "Legal and regulatory compliance risk assessment",
            "Operational and process risk identification",
            "Financial and market risk analysis",
            "Strategic and business model risk evaluation",
            "Cybersecurity and data protection risk management",
            "Reputational and brand risk monitoring",
            "Supply chain and vendor risk assessment",
            "Human capital and talent risk mitigation"
        ]
        self.risk_library = {}
        self.mitigation_strategies = {}
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the Risk Management Agent.
        Implements comprehensive risk management using advanced prompting strategies.
        """
        try:
            print(f"Risk Management Agent: Starting comprehensive risk assessment...")
            
            # Extract inputs from user_input or use defaults
            if user_input:
                business_context = user_input
            else:
                business_context = "Identify and mitigate risks for a growing AI workforce platform"
            
            # Define comprehensive risk management parameters
            legal_environment = {
                "jurisdictions": ["united_states", "european_union", "united_kingdom"],
                "regulatory_frameworks": [
                    "data_privacy_laws",
                    "ai_regulations",
                    "consumer_protection",
                    "intellectual_property"
                ],
                "compliance_requirements": {
                    "gdpr": {
                        "applicable": True,
                        "compliance_level": "partial",
                        "key_requirements": ["data_processing_agreements", "user_consent", "data_portability"]
                    },
                    "ccpa": {
                        "applicable": True,
                        "compliance_level": "partial",
                        "key_requirements": ["disclosure_requirements", "opt_out_rights"]
                    },
                    "ai_act": {
                        "applicable": True,
                        "compliance_level": "monitoring",
                        "key_requirements": ["transparency", "human_oversight", "technical_robustness"]
                    }
                },
                "legal_structure": "delaware_c_corporation",
                "intellectual_property": {
                    "patents": 0,
                    "trademarks": 2,
                    "trade_secrets": "multiple",
                    "protection_status": "moderate"
                }
            }
            
            operational_structure = {
                "team_size": 15,
                "operational_model": "remote_first",
                "key_processes": [
                    "product_development",
                    "customer_onboarding",
                    "support_and_maintenance",
                    "marketing_and_sales"
                ],
                "critical_dependencies": {
                    "cloud_infrastructure": {
                        "provider": "aws",
                        "redundancy": "partial",
                        "disaster_recovery": "basic"
                    },
                    "ai_models": {
                        "providers": ["openai", "anthropic", "ollama"],
                        "redundancy": "limited",
                        "fallback_mechanisms": "basic"
                    },
                    "third_party_services": [
                        "payment_processor",
                        "email_service",
                        "analytics_platform"
                    ]
                },
                "operational_maturity": {
                    "documentation": "developing",
                    "process_standardization": "early_stage",
                    "quality_control": "manual",
                    "scalability": "limited"
                }
            }
            
            financial_exposure = {
                "runway": "6_months",
                "revenue_model": "subscription",
                "pricing_structure": "tiered",
                "customer_concentration": {
                    "top_customer_percentage": 0.15,
                    "top_five_percentage": 0.45
                },
                "cost_structure": {
                    "fixed_costs": {
                        "personnel": 0.65,
                        "infrastructure": 0.15,
                        "services": 0.10
                    },
                    "variable_costs": {
                        "ai_api_usage": 0.07,
                        "marketing": 0.03
                    }
                },
                "funding_status": {
                    "last_round": "seed",
                    "cash_position": "moderate",
                    "burn_rate": "moderate",
                    "fundraising_plans": "series_a_in_6_months"
                }
            }
            
            industry_risks = {
                "market_volatility": "high",
                "competitive_landscape": {
                    "direct_competitors": 3,
                    "indirect_competitors": 12,
                    "market_leaders": 2,
                    "competitive_pressure": "increasing"
                },
                "technology_risks": {
                    "rapid_ai_advancement": "high_impact",
                    "api_dependency_risks": "significant",
                    "technical_debt": "moderate"
                },
                "regulatory_trends": {
                    "ai_regulation": "increasing",
                    "data_privacy": "strict_enforcement",
                    "consumer_protection": "growing_focus"
                },
                "industry_specific_risks": [
                    "ai_model_reliability",
                    "data_security_concerns",
                    "ethical_ai_usage",
                    "market_education_needs"
                ]
            }
            
            risk_tolerance = {
                "overall_risk_appetite": "moderate",
                "category_specific_tolerance": {
                    "legal_compliance": "low_tolerance",
                    "financial": "moderate_tolerance",
                    "operational": "moderate_tolerance",
                    "strategic": "high_tolerance",
                    "reputational": "low_tolerance"
                },
                "risk_management_maturity": "developing",
                "decision_making_approach": "data_informed"
            }
            
            # Generate comprehensive risk management strategy
            risk_strategy = await generate_comprehensive_risk_management_strategy(
                business_context=business_context,
                legal_environment=legal_environment,
                operational_structure=operational_structure,
                financial_exposure=financial_exposure,
                industry_risks=industry_risks,
                risk_tolerance=risk_tolerance
            )
            
            # Execute the risk management based on the strategy
            result = await self._execute_risk_management(
                business_context, 
                risk_strategy
            )
            
            # Combine strategy and execution results
            final_result = {
                "agent": "Risk Management Agent",
                "strategy_type": "comprehensive_risk_management",
                "risk_strategy": risk_strategy,
                "execution_result": result,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"Risk Management Agent: Comprehensive risk assessment completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"Risk Management Agent: Error in comprehensive risk assessment: {e}")
            return {
                "agent": "Risk Management Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_risk_management(
        self, 
        business_context: str, 
        strategy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute risk management based on comprehensive strategy."""
        try:
            # Extract strategy components
            risk_assessment = strategy.get("risk_assessment", {})
            prioritized_risks = strategy.get("prioritized_risks", {})
            mitigation_strategies = strategy.get("mitigation_strategies", {})
            monitoring_framework = strategy.get("monitoring_framework", {})
            
            # Create risk objects for each identified risk
            risk_objects = {}
            for risk_id, risk_data in risk_assessment.items():
                if isinstance(risk_data, dict):
                    # Calculate risk score
                    likelihood = risk_data.get("likelihood_score", 0.5)
                    impact = risk_data.get("impact_score", 0.5)
                    risk_score = likelihood * impact
                    
                    # Determine priority
                    priority = "high" if risk_score >= 0.6 else "medium" if risk_score >= 0.3 else "low"
                    
                    # Create risk object
                    risk = Risk(
                        risk_id=risk_id,
                        category=risk_data.get("category", "general"),
                        title=risk_data.get("title", ""),
                        description=risk_data.get("description", ""),
                        likelihood=likelihood,
                        impact=impact,
                        risk_score=risk_score,
                        priority=priority,
                        status="identified",
                        owner=risk_data.get("owner", "unassigned"),
                        created_date=datetime.now(),
                        tags=risk_data.get("tags", [])
                    )
                    
                    risk_objects[risk_id] = risk
                    self.risk_library[risk_id] = risk
            
            # Create mitigation strategy objects
            strategy_objects = {}
            for risk_id, strategies in mitigation_strategies.items():
                if isinstance(strategies, list):
                    for i, strategy_data in enumerate(strategies):
                        strategy_id = f"{risk_id}_strategy_{i+1}"
                        
                        # Create mitigation strategy object
                        mitigation = MitigationStrategy(
                            strategy_id=strategy_id,
                            risk_id=risk_id,
                            title=strategy_data.get("title", ""),
                            description=strategy_data.get("description", ""),
                            approach=strategy_data.get("approach", "reduce"),
                            actions=strategy_data.get("actions", []),
                            effectiveness=strategy_data.get("effectiveness_score", 0.7),
                            cost=strategy_data.get("cost", {"level": "medium"}),
                            timeframe=strategy_data.get("timeframe", "medium-term"),
                            implementation_status="not started",
                            residual_risk=risk_objects.get(risk_id, Risk(risk_id=risk_id, category="unknown", title="", description="", likelihood=0, impact=0, risk_score=0, priority="low", status="identified", owner="", created_date=datetime.now(), tags=[])).risk_score * (1 - strategy_data.get("effectiveness_score", 0.7))
                        )
                        
                        strategy_objects[strategy_id] = mitigation
                        self.mitigation_strategies[strategy_id] = mitigation
            
            # Generate risk register
            risk_register = self._generate_risk_register(risk_objects)
            
            # Generate mitigation plan
            mitigation_plan = self._generate_mitigation_plan(risk_objects, strategy_objects)
            
            # Generate risk monitoring dashboard
            monitoring_dashboard = self._generate_monitoring_dashboard(risk_objects, strategy_objects, monitoring_framework)
            
            return {
                "status": "success",
                "message": "Risk management strategy executed successfully",
                "risk_assessment_summary": {
                    "total_risks_identified": len(risk_objects),
                    "high_priority_risks": sum(1 for risk in risk_objects.values() if risk.priority == "high"),
                    "medium_priority_risks": sum(1 for risk in risk_objects.values() if risk.priority == "medium"),
                    "low_priority_risks": sum(1 for risk in risk_objects.values() if risk.priority == "low"),
                    "risk_categories": list(set(risk.category for risk in risk_objects.values())),
                    "overall_risk_profile": "moderate" if sum(1 for risk in risk_objects.values() if risk.priority == "high") <= 3 else "high"
                },
                "risk_register": risk_register,
                "mitigation_plan": mitigation_plan,
                "monitoring_dashboard": monitoring_dashboard,
                "execution_metrics": {
                    "risks_identified": len(risk_objects),
                    "mitigation_strategies_developed": len(strategy_objects),
                    "risk_coverage": sum(1 for risk in risk_objects.values() if risk.risk_id in [s.risk_id for s in strategy_objects.values()]) / max(1, len(risk_objects)),
                    "assessment_quality": "comprehensive"
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Risk management strategy execution failed: {str(e)}"
            }
    
    def _generate_risk_register(self, risk_objects: Dict[str, Risk]) -> Dict[str, Any]:
        """Generate risk register from risk objects."""
        # Sort risks by priority and score
        sorted_risks = sorted(
            risk_objects.values(),
            key=lambda r: ({"high": 0, "medium": 1, "low": 2}.get(r.priority, 3), -r.risk_score)
        )
        
        # Generate risk register entries
        risk_register_entries = []
        for risk in sorted_risks:
            risk_register_entries.append({
                "id": risk.risk_id,
                "category": risk.category,
                "title": risk.title,
                "description": risk.description,
                "likelihood": risk.likelihood,
                "impact": risk.impact,
                "risk_score": risk.risk_score,
                "priority": risk.priority,
                "status": risk.status,
                "owner": risk.owner,
                "created_date": risk.created_date.isoformat(),
                "tags": risk.tags
            })
        
        # Group risks by category
        risks_by_category = {}
        for risk in sorted_risks:
            if risk.category not in risks_by_category:
                risks_by_category[risk.category] = []
            
            risks_by_category[risk.category].append({
                "id": risk.risk_id,
                "title": risk.title,
                "priority": risk.priority,
                "risk_score": risk.risk_score
            })
        
        return {
            "last_updated": datetime.now().isoformat(),
            "risk_count": len(risk_objects),
            "risk_entries": risk_register_entries,
            "risks_by_category": risks_by_category,
            "risk_matrix": self._generate_risk_matrix(sorted_risks),
            "top_risks": [{"id": risk.risk_id, "title": risk.title, "score": risk.risk_score} 
                          for risk in sorted_risks[:5]]
        }
    
    def _generate_risk_matrix(self, risks: List[Risk]) -> Dict[str, Any]:
        """Generate risk matrix visualization data."""
        # Define matrix cells (5x5 grid)
        matrix = {
            "high_impact_high_likelihood": [],
            "high_impact_medium_likelihood": [],
            "high_impact_low_likelihood": [],
            "medium_impact_high_likelihood": [],
            "medium_impact_medium_likelihood": [],
            "medium_impact_low_likelihood": [],
            "low_impact_high_likelihood": [],
            "low_impact_medium_likelihood": [],
            "low_impact_low_likelihood": []
        }
        
        # Place risks in appropriate cells
        for risk in risks:
            impact_level = "high" if risk.impact >= 0.7 else "medium" if risk.impact >= 0.3 else "low"
            likelihood_level = "high" if risk.likelihood >= 0.7 else "medium" if risk.likelihood >= 0.3 else "low"
            
            cell_key = f"{impact_level}_impact_{likelihood_level}_likelihood"
            if cell_key in matrix:
                matrix[cell_key].append({
                    "id": risk.risk_id,
                    "title": risk.title
                })
        
        return {
            "matrix_cells": matrix,
            "risk_count_by_cell": {cell: len(risks) for cell, risks in matrix.items()},
            "highest_concentration": max(matrix.items(), key=lambda x: len(x[1]))[0] if matrix else None
        }
    
    def _generate_mitigation_plan(
        self, 
        risk_objects: Dict[str, Risk],
        strategy_objects: Dict[str, MitigationStrategy]
    ) -> Dict[str, Any]:
        """Generate mitigation plan from risk and strategy objects."""
        # Group strategies by risk
        strategies_by_risk = {}
        for strategy_id, strategy in strategy_objects.items():
            if strategy.risk_id not in strategies_by_risk:
                strategies_by_risk[strategy.risk_id] = []
            
            strategies_by_risk[strategy.risk_id].append({
                "id": strategy.strategy_id,
                "title": strategy.title,
                "approach": strategy.approach,
                "effectiveness": strategy.effectiveness,
                "cost": strategy.cost,
                "timeframe": strategy.timeframe,
                "status": strategy.implementation_status,
                "residual_risk": strategy.residual_risk
            })
        
        # Generate mitigation plan entries for high and medium priority risks
        mitigation_plan_entries = []
        for risk_id, risk in risk_objects.items():
            if risk.priority in ["high", "medium"]:
                strategies = strategies_by_risk.get(risk_id, [])
                
                mitigation_plan_entries.append({
                    "risk_id": risk_id,
                    "risk_title": risk.title,
                    "risk_priority": risk.priority,
                    "risk_score": risk.risk_score,
                    "mitigation_strategies": strategies,
                    "has_adequate_mitigation": len(strategies) > 0,
                    "expected_residual_risk": min([s.get("residual_risk", risk.risk_score) for s in strategies]) if strategies else risk.risk_score
                })
        
        # Sort entries by risk priority and score
        mitigation_plan_entries.sort(
            key=lambda e: ({"high": 0, "medium": 1, "low": 2}.get(e["risk_priority"], 3), -e["risk_score"])
        )
        
        # Group entries by timeframe
        entries_by_timeframe = {
            "immediate": [],
            "short_term": [],
            "medium_term": [],
            "long_term": []
        }
        
        for entry in mitigation_plan_entries:
            # Find the earliest timeframe among strategies
            timeframes = [s.get("timeframe", "medium_term") for s in entry.get("mitigation_strategies", [])]
            earliest = "long_term"
            for t in timeframes:
                if "immediate" in t.lower():
                    earliest = "immediate"
                    break
                elif "short" in t.lower() and earliest not in ["immediate"]:
                    earliest = "short_term"
                elif "medium" in t.lower() and earliest not in ["immediate", "short_term"]:
                    earliest = "medium_term"
            
            # Map to the appropriate timeframe group
            if earliest == "immediate":
                entries_by_timeframe["immediate"].append(entry)
            elif earliest == "short_term":
                entries_by_timeframe["short_term"].append(entry)
            elif earliest == "medium_term":
                entries_by_timeframe["medium_term"].append(entry)
            else:
                entries_by_timeframe["long_term"].append(entry)
        
        return {
            "last_updated": datetime.now().isoformat(),
            "total_risks_with_mitigation": len(strategies_by_risk),
            "mitigation_plan_entries": mitigation_plan_entries,
            "entries_by_timeframe": entries_by_timeframe,
            "resource_requirements": self._calculate_resource_requirements(strategy_objects),
            "implementation_timeline": self._generate_implementation_timeline(strategy_objects)
        }
    
    def _calculate_resource_requirements(self, strategy_objects: Dict[str, MitigationStrategy]) -> Dict[str, Any]:
        """Calculate resource requirements for all mitigation strategies."""
        # Initialize resource counters
        resources = {
            "financial": {"low": 0, "medium": 0, "high": 0, "total": 0},
            "personnel": {"low": 0, "medium": 0, "high": 0, "total": 0},
            "technology": {"low": 0, "medium": 0, "high": 0, "total": 0},
            "time": {"low": 0, "medium": 0, "high": 0, "total": 0}
        }
        
        # Count strategies by resource requirement
        for strategy in strategy_objects.values():
            cost = strategy.cost
            
            # Financial resources
            financial_level = cost.get("level", "medium").lower() if isinstance(cost, dict) else "medium"
            if financial_level in resources["financial"]:
                resources["financial"][financial_level] += 1
                resources["financial"]["total"] += 1
            
            # Personnel resources (if specified)
            personnel_level = cost.get("personnel", "medium").lower() if isinstance(cost, dict) else "medium"
            if personnel_level in resources["personnel"]:
                resources["personnel"][personnel_level] += 1
                resources["personnel"]["total"] += 1
            
            # Technology resources (if specified)
            tech_level = cost.get("technology", "medium").lower() if isinstance(cost, dict) else "medium"
            if tech_level in resources["technology"]:
                resources["technology"][tech_level] += 1
                resources["technology"]["total"] += 1
            
            # Time resources based on timeframe
            time_level = "high" if "long" in strategy.timeframe.lower() else "medium" if "medium" in strategy.timeframe.lower() else "low"
            resources["time"][time_level] += 1
            resources["time"]["total"] += 1
        
        return resources
    
    def _generate_implementation_timeline(self, strategy_objects: Dict[str, MitigationStrategy]) -> Dict[str, Any]:
        """Generate implementation timeline for mitigation strategies."""
        # Sort strategies by timeframe
        sorted_strategies = sorted(
            strategy_objects.values(),
            key=lambda s: {
                "immediate": 0, 
                "short-term": 1, "short_term": 1,
                "medium-term": 2, "medium_term": 2,
                "long-term": 3, "long_term": 3
            }.get(s.timeframe.lower(), 4)
        )
        
        # Generate timeline entries
        timeline = {
            "30_days": [],
            "90_days": [],
            "6_months": [],
            "12_months": []
        }
        
        for strategy in sorted_strategies:
            timeframe = strategy.timeframe.lower()
            entry = {
                "id": strategy.strategy_id,
                "title": strategy.title,
                "risk_id": strategy.risk_id,
                "approach": strategy.approach
            }
            
            if "immediate" in timeframe:
                timeline["30_days"].append(entry)
            elif "short" in timeframe:
                timeline["90_days"].append(entry)
            elif "medium" in timeframe:
                timeline["6_months"].append(entry)
            else:  # long-term
                timeline["12_months"].append(entry)
        
        return timeline
    
    def _generate_monitoring_dashboard(
        self, 
        risk_objects: Dict[str, Risk],
        strategy_objects: Dict[str, MitigationStrategy],
        monitoring_framework: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate risk monitoring dashboard."""
        # Extract key metrics from monitoring framework
        key_metrics = monitoring_framework.get("key_metrics", {})
        early_warning_indicators = monitoring_framework.get("early_warning_indicators", {})
        
        # Generate risk metrics
        risk_metrics = {
            "total_risks": len(risk_objects),
            "high_priority_risks": sum(1 for risk in risk_objects.values() if risk.priority == "high"),
            "medium_priority_risks": sum(1 for risk in risk_objects.values() if risk.priority == "medium"),
            "low_priority_risks": sum(1 for risk in risk_objects.values() if risk.priority == "low"),
            "risks_by_category": {},
            "average_risk_score": sum(risk.risk_score for risk in risk_objects.values()) / max(1, len(risk_objects)),
            "mitigated_risks": sum(1 for risk in risk_objects.values() if risk.risk_id in [s.risk_id for s in strategy_objects.values()]),
            "unmitigated_high_risks": sum(1 for risk in risk_objects.values() if risk.priority == "high" and risk.risk_id not in [s.risk_id for s in strategy_objects.values()])
        }
        
        # Count risks by category
        for risk in risk_objects.values():
            if risk.category not in risk_metrics["risks_by_category"]:
                risk_metrics["risks_by_category"][risk.category] = 0
            risk_metrics["risks_by_category"][risk.category] += 1
        
        # Format monitoring dashboard
        return {
            "last_updated": datetime.now().isoformat(),
            "risk_metrics": risk_metrics,
            "key_risk_indicators": key_metrics,
            "early_warning_indicators": early_warning_indicators,
            "monitoring_schedule": {
                "daily_monitoring": [kri for kri, details in key_metrics.items() if details.get("frequency") == "daily"],
                "weekly_monitoring": [kri for kri, details in key_metrics.items() if details.get("frequency") == "weekly"],
                "monthly_monitoring": [kri for kri, details in key_metrics.items() if details.get("frequency") == "monthly"],
                "quarterly_monitoring": [kri for kri, details in key_metrics.items() if details.get("frequency") == "quarterly"]
            },
            "risk_owners": {risk.risk_id: risk.owner for risk in risk_objects.values()},
            "review_schedule": {
                "next_review_date": (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d"),
                "review_frequency": "quarterly",
                "special_reviews": "As triggered by early warning indicators"
            }
        }
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "risk_categories": ["Legal", "Operational", "Financial", "Strategic", "Cybersecurity", "Reputational", "Supply Chain", "Human Capital"],
            "assessment_methodologies": ["Quantitative", "Qualitative", "Scenario-Based", "Compliance-Focused"]
        }
