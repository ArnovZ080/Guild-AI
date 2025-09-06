"""
Strategy Agent - Long-term planning and market analysis
"""

from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class StrategicRecommendation:
    recommendation: str
    reasoning: str
    implementation_roadmap: List[str]
    risk_assessment: str
    success_metrics: List[str]

class StrategyAgent:
    """Strategy Agent - Long-term planning and market analysis specialist"""
    
    def __init__(self, name: str = "Strategy Agent"):
        self.name = name
        self.role = "Strategic Advisor"
        self.expertise = [
            "Business Strategy",
            "Market Analysis",
            "Competitive Intelligence",
            "Trend Forecasting",
            "SWOT Analysis",
            "Strategic Decision-making"
        ]
    
    def develop_strategic_plan(self, 
                             strategic_question: str,
                             market_data: Dict[str, Any],
                             internal_performance_data: Dict[str, Any],
                             vision_and_goals: List[str]) -> StrategicRecommendation:
        """Develop comprehensive strategic plan based on analysis"""
        
        # Analyze strategic question
        question_analysis = self._analyze_strategic_question(strategic_question)
        
        # Conduct market and competitive analysis
        market_analysis = self._conduct_market_analysis(market_data)
        
        # Analyze internal performance
        internal_analysis = self._analyze_internal_performance(internal_performance_data)
        
        # Develop strategic options
        strategic_options = self._develop_strategic_options(question_analysis, market_analysis, internal_analysis)
        
        # Evaluate options and select recommendation
        recommendation = self._evaluate_and_select_option(strategic_options, vision_and_goals)
        
        # Create implementation roadmap
        implementation_roadmap = self._create_implementation_roadmap(recommendation)
        
        # Assess risks
        risk_assessment = self._assess_risks(recommendation, market_analysis)
        
        # Define success metrics
        success_metrics = self._define_success_metrics(recommendation, vision_and_goals)
        
        return StrategicRecommendation(
            recommendation=recommendation["strategy"],
            reasoning=recommendation["reasoning"],
            implementation_roadmap=implementation_roadmap,
            risk_assessment=risk_assessment,
            success_metrics=success_metrics
        )
    
    def _analyze_strategic_question(self, strategic_question: str) -> Dict[str, Any]:
        """Analyze the strategic question to understand core components"""
        
        question_lower = strategic_question.lower()
        
        if "expand" in question_lower or "growth" in question_lower:
            question_type = "expansion"
        elif "pricing" in question_lower:
            question_type = "pricing"
        elif "market" in question_lower:
            question_type = "market_entry"
        elif "product" in question_lower:
            question_type = "product_development"
        else:
            question_type = "general_strategy"
        
        return {
            "question_type": question_type,
            "key_components": self._extract_key_components(strategic_question),
            "decision_factors": self._identify_decision_factors(strategic_question)
        }
    
    def _extract_key_components(self, question: str) -> List[str]:
        """Extract key components from the strategic question"""
        
        components = []
        
        if "new market" in question.lower():
            components.append("market_analysis")
        if "competition" in question.lower():
            components.append("competitive_analysis")
        if "resources" in question.lower():
            components.append("resource_assessment")
        if "timeline" in question.lower():
            components.append("timeline_planning")
        
        return components
    
    def _identify_decision_factors(self, question: str) -> List[str]:
        """Identify key decision factors from the question"""
        
        factors = []
        
        if "cost" in question.lower() or "budget" in question.lower():
            factors.append("financial_impact")
        if "risk" in question.lower():
            factors.append("risk_tolerance")
        if "timeline" in question.lower():
            factors.append("time_constraints")
        if "market" in question.lower():
            factors.append("market_conditions")
        
        return factors
    
    def _conduct_market_analysis(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Conduct comprehensive market analysis"""
        
        return {
            "market_size": market_data.get("market_size", "Unknown"),
            "growth_rate": market_data.get("growth_rate", "Unknown"),
            "key_trends": market_data.get("trends", []),
            "customer_segments": market_data.get("segments", []),
            "market_maturity": self._assess_market_maturity(market_data),
            "opportunities": self._identify_market_opportunities(market_data),
            "threats": self._identify_market_threats(market_data)
        }
    
    def _assess_market_maturity(self, market_data: Dict[str, Any]) -> str:
        """Assess the maturity level of the market"""
        
        growth_rate = market_data.get("growth_rate", 0)
        
        if growth_rate > 20:
            return "emerging"
        elif growth_rate > 10:
            return "growing"
        elif growth_rate > 0:
            return "mature"
        else:
            return "declining"
    
    def _identify_market_opportunities(self, market_data: Dict[str, Any]) -> List[str]:
        """Identify market opportunities"""
        
        opportunities = []
        
        if market_data.get("growth_rate", 0) > 15:
            opportunities.append("High growth market with expansion potential")
        
        if len(market_data.get("segments", [])) > 3:
            opportunities.append("Multiple customer segments to target")
        
        if market_data.get("competition_level", "high") == "low":
            opportunities.append("Low competition environment")
        
        return opportunities
    
    def _identify_market_threats(self, market_data: Dict[str, Any]) -> List[str]:
        """Identify market threats"""
        
        threats = []
        
        if market_data.get("competition_level", "low") == "high":
            threats.append("High competitive pressure")
        
        if market_data.get("growth_rate", 0) < 5:
            threats.append("Slow market growth")
        
        if market_data.get("barriers_to_entry", "low") == "high":
            threats.append("High barriers to market entry")
        
        return threats
    
    def _analyze_internal_performance(self, performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze internal performance and capabilities"""
        
        return {
            "financial_performance": performance_data.get("financial_metrics", {}),
            "operational_metrics": performance_data.get("operational_metrics", {}),
            "strengths": self._identify_strengths(performance_data),
            "weaknesses": self._identify_weaknesses(performance_data),
            "capabilities": performance_data.get("capabilities", []),
            "resource_availability": performance_data.get("resources", {})
        }
    
    def _identify_strengths(self, performance_data: Dict[str, Any]) -> List[str]:
        """Identify internal strengths"""
        
        strengths = []
        
        if performance_data.get("revenue_growth", 0) > 20:
            strengths.append("Strong revenue growth")
        
        if performance_data.get("customer_satisfaction", 0) > 4.0:
            strengths.append("High customer satisfaction")
        
        if performance_data.get("market_share", 0) > 10:
            strengths.append("Significant market share")
        
        return strengths
    
    def _identify_weaknesses(self, performance_data: Dict[str, Any]) -> List[str]:
        """Identify internal weaknesses"""
        
        weaknesses = []
        
        if performance_data.get("profit_margin", 0) < 10:
            weaknesses.append("Low profit margins")
        
        if performance_data.get("customer_acquisition_cost", 0) > 100:
            weaknesses.append("High customer acquisition costs")
        
        if performance_data.get("employee_turnover", 0) > 20:
            weaknesses.append("High employee turnover")
        
        return weaknesses
    
    def _develop_strategic_options(self, 
                                 question_analysis: Dict[str, Any],
                                 market_analysis: Dict[str, Any],
                                 internal_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Develop multiple strategic options"""
        
        options = []
        
        question_type = question_analysis["question_type"]
        
        if question_type == "expansion":
            options.extend([
                {
                    "strategy": "Market Penetration",
                    "description": "Increase market share in existing markets",
                    "pros": ["Lower risk", "Leverage existing capabilities"],
                    "cons": ["Limited growth potential", "Increased competition"]
                },
                {
                    "strategy": "Market Development",
                    "description": "Enter new geographic or demographic markets",
                    "pros": ["Higher growth potential", "Diversification"],
                    "cons": ["Higher risk", "Resource requirements"]
                }
            ])
        elif question_type == "pricing":
            options.extend([
                {
                    "strategy": "Premium Pricing",
                    "description": "Position as high-value, premium offering",
                    "pros": ["Higher margins", "Brand positioning"],
                    "cons": ["Limited market size", "Price sensitivity"]
                },
                {
                    "strategy": "Competitive Pricing",
                    "description": "Price competitively to gain market share",
                    "pros": ["Broader market appeal", "Volume growth"],
                    "cons": ["Lower margins", "Price wars"]
                }
            ])
        else:
            options.append({
                "strategy": "Strategic Optimization",
                "description": "Optimize current operations and processes",
                "pros": ["Immediate impact", "Lower risk"],
                "cons": ["Limited growth", "Incremental improvement"]
            })
        
        return options
    
    def _evaluate_and_select_option(self, 
                                  options: List[Dict[str, Any]],
                                  vision_and_goals: List[str]) -> Dict[str, Any]:
        """Evaluate options and select the best strategic recommendation"""
        
        # Simple scoring based on alignment with goals
        best_option = options[0]  # Default to first option
        
        for option in options:
            alignment_score = self._calculate_alignment_score(option, vision_and_goals)
            option["alignment_score"] = alignment_score
            
            if alignment_score > best_option.get("alignment_score", 0):
                best_option = option
        
        return {
            "strategy": best_option["strategy"],
            "description": best_option["description"],
            "reasoning": f"Selected based on alignment with strategic goals and market conditions. Score: {best_option.get('alignment_score', 0)}",
            "pros": best_option["pros"],
            "cons": best_option["cons"]
        }
    
    def _calculate_alignment_score(self, option: Dict[str, Any], vision_and_goals: List[str]) -> float:
        """Calculate alignment score between option and vision/goals"""
        
        score = 0.5  # Base score
        
        # Check alignment with common goal keywords
        strategy_lower = option["strategy"].lower()
        description_lower = option["description"].lower()
        
        for goal in vision_and_goals:
            goal_lower = goal.lower()
            
            if "growth" in goal_lower and ("expansion" in strategy_lower or "development" in strategy_lower):
                score += 0.2
            if "profit" in goal_lower and "premium" in strategy_lower:
                score += 0.2
            if "market" in goal_lower and "market" in strategy_lower:
                score += 0.1
        
        return min(1.0, score)
    
    def _create_implementation_roadmap(self, recommendation: Dict[str, Any]) -> List[str]:
        """Create high-level implementation roadmap"""
        
        strategy = recommendation["strategy"]
        
        if "Market Penetration" in strategy:
            return [
                "Conduct detailed market research",
                "Develop competitive positioning strategy",
                "Launch targeted marketing campaigns",
                "Monitor market response and adjust"
            ]
        elif "Market Development" in strategy:
            return [
                "Identify target markets",
                "Develop market entry strategy",
                "Establish local presence",
                "Scale operations in new markets"
            ]
        elif "Premium Pricing" in strategy:
            return [
                "Enhance product/service value proposition",
                "Develop premium brand positioning",
                "Implement pricing strategy",
                "Monitor customer response and retention"
            ]
        else:
            return [
                "Assess current operations",
                "Identify optimization opportunities",
                "Implement improvements",
                "Measure and refine processes"
            ]
    
    def _assess_risks(self, recommendation: Dict[str, Any], market_analysis: Dict[str, Any]) -> str:
        """Assess potential risks of the recommendation"""
        
        risks = []
        
        if "Market Development" in recommendation["strategy"]:
            risks.append("Market entry risks and competition")
        
        if "Premium Pricing" in recommendation["strategy"]:
            risks.append("Price sensitivity and market acceptance")
        
        if market_analysis["market_maturity"] == "declining":
            risks.append("Market decline and reduced demand")
        
        if not risks:
            risks.append("Standard business execution risks")
        
        return "; ".join(risks)
    
    def _define_success_metrics(self, recommendation: Dict[str, Any], vision_and_goals: List[str]) -> List[str]:
        """Define success metrics for the recommendation"""
        
        metrics = []
        
        strategy = recommendation["strategy"]
        
        if "Market" in strategy:
            metrics.extend([
                "Market share increase by 15% within 12 months",
                "Revenue growth of 25% year-over-year",
                "Customer acquisition cost reduction by 20%"
            ])
        elif "Pricing" in strategy:
            metrics.extend([
                "Profit margin improvement by 10%",
                "Customer lifetime value increase by 30%",
                "Market positioning score improvement"
            ])
        else:
            metrics.extend([
                "Operational efficiency improvement by 20%",
                "Cost reduction by 15%",
                "Customer satisfaction score > 4.5/5"
            ])
        
        return metrics
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        
        return {
            "name": self.name,
            "role": self.role,
            "expertise": self.expertise,
            "capabilities": [
                "Strategic question analysis",
                "Market and competitive analysis",
                "Internal performance assessment",
                "Strategic option development",
                "Risk assessment and mitigation",
                "Implementation roadmap creation",
                "Success metrics definition"
            ]
        }