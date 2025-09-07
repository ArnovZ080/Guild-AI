"""
Strategic Sounding Board Agent for Guild-AI
Acts as a high-level strategic partner, offering objective feedback and alternative viewpoints.
"""

from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class StrategicAdvice:
    recommendation: str
    reasoning: str
    risk_assessment: str
    implementation_steps: List[str]
    confidence_score: float
    alternative_options: List[str]
    decision_framework: str


class StrategicSoundingBoardAgent:
    """
    Strategic Sounding Board Agent - Expert strategic advisor and decision support.
    
    You are the Strategic Sounding Board Agent, a high-level strategic partner offering 
    objective feedback, challenging assumptions, and providing alternative viewpoints on 
    critical business decisions. You simulate brainstorming sessions and provide 
    data-driven insights to help solopreneurs make informed strategic choices.
    
    Core Directives:
    1. Objective Analysis: Provide unbiased, data-driven strategic analysis without 
       emotional attachment to specific outcomes.
    2. Assumption Challenging: Actively question underlying assumptions and present 
       alternative perspectives that may not be immediately obvious.
    3. Decision Framework Application: Apply proven strategic frameworks (SWOT, Porter's 
       Five Forces, Blue Ocean Strategy, etc.) to structure analysis.
    4. Risk-Benefit Assessment: Thoroughly evaluate both opportunities and risks, 
       including worst-case scenarios and mitigation strategies.
    5. Implementation Feasibility: Consider practical implementation challenges, 
       resource requirements, and timeline constraints.
    
    Constraints and Guardrails:
    - Maintain objectivity and avoid confirmation bias
    - Present multiple viable options, not just one recommendation
    - Consider both short-term and long-term implications
    - Factor in market conditions, competitive landscape, and industry trends
    - Provide actionable insights with clear reasoning
    """
    
    def __init__(self):
        self.agent_name = "Strategic Sounding Board Agent"
        self.agent_type = "Executive"
        self.capabilities = [
            "Strategic decision analysis",
            "Assumption challenging",
            "Alternative perspective generation",
            "Risk-benefit assessment",
            "Implementation feasibility analysis"
        ]
        self.strategic_frameworks = {}
        self.decision_history = {}
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Return comprehensive agent information."""
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "status": "active",
            "last_updated": datetime.now().isoformat()
        }
    
    def provide_strategic_advice(self, 
                               business_context: Dict[str, Any],
                               decision_point: str,
                               objectives: List[str]) -> StrategicAdvice:
        """Provide comprehensive strategic advice for critical business decisions."""
        
        analysis = self._analyze_context(business_context, decision_point, objectives)
        recommendation = self._generate_recommendation(analysis)
        risk_assessment = self._assess_risks(analysis)
        implementation_steps = self._create_roadmap(recommendation)
        confidence_score = self._calculate_confidence(analysis)
        alternative_options = self._generate_alternatives(analysis)
        decision_framework = self._select_framework(decision_point)
        
        return StrategicAdvice(
            recommendation=recommendation,
            reasoning=analysis["reasoning"],
            risk_assessment=risk_assessment,
            implementation_steps=implementation_steps,
            confidence_score=confidence_score,
            alternative_options=alternative_options,
            decision_framework=decision_framework
        )
    
    def _analyze_context(self, context: Dict, decision: str, objectives: List[str]) -> Dict:
        """Analyze business context and decision requirements with strategic depth."""
        complexity_indicators = ["expansion", "acquisition", "pivot", "merger", "diversification", "international"]
        complexity = "high" if any(word in decision.lower() for word in complexity_indicators) else "medium"
        
        return {
            "complexity": complexity,
            "alignment": "strong" if len(objectives) > 2 else "moderate",
            "market_conditions": context.get("market_conditions", "stable"),
            "competitive_landscape": context.get("competitive_landscape", "moderate"),
            "resource_availability": context.get("resource_availability", "adequate"),
            "timeline_constraints": context.get("timeline_constraints", "flexible"),
            "reasoning": f"Strategic analysis of {decision} considering {len(objectives)} objectives, {complexity} complexity, and current market conditions"
        }
    
    def _generate_recommendation(self, analysis: Dict) -> str:
        """Generate strategic recommendation with detailed rationale."""
        if analysis["complexity"] == "high":
            return "Proceed with phased implementation, comprehensive risk mitigation, and continuous monitoring. Consider pilot programs before full-scale deployment."
        elif analysis["market_conditions"] == "volatile":
            return "Implement with enhanced flexibility and contingency planning. Focus on core value proposition and maintain optionality."
        else:
            return "Implement with standard risk management protocols and regular milestone reviews."
    
    def _assess_risks(self, analysis: Dict) -> str:
        """Assess potential risks and opportunities with detailed analysis."""
        risk_factors = []
        opportunity_factors = []
        
        if analysis["complexity"] == "high":
            risk_factors.append("High implementation complexity")
            opportunity_factors.append("Significant competitive advantage potential")
        
        if analysis["market_conditions"] == "volatile":
            risk_factors.append("Market volatility and uncertainty")
            opportunity_factors.append("Market disruption opportunities")
        
        risk_summary = f"Key risks: {', '.join(risk_factors)}. Opportunities: {', '.join(opportunity_factors)}. Overall: Moderate to high risk with substantial upside potential."
        return risk_summary
    
    def _create_roadmap(self, recommendation: str) -> List[str]:
        """Create detailed implementation roadmap."""
        return [
            "Conduct comprehensive feasibility study and market validation",
            "Develop detailed implementation plan with milestones and KPIs",
            "Establish risk mitigation strategies and contingency plans",
            "Execute pilot program or proof of concept",
            "Scale implementation with continuous monitoring and optimization",
            "Conduct post-implementation analysis and lessons learned"
        ]
    
    def _generate_alternatives(self, analysis: Dict) -> List[str]:
        """Generate alternative strategic options."""
        alternatives = []
        
        if analysis["complexity"] == "high":
            alternatives.extend([
                "Phased approach with smaller initial investment",
                "Partnership or joint venture strategy",
                "Acquisition of existing capabilities"
            ])
        else:
            alternatives.extend([
                "Direct implementation with full resources",
                "Outsourced implementation with internal oversight",
                "Hybrid approach combining internal and external resources"
            ])
        
        return alternatives
    
    def _select_framework(self, decision_point: str) -> str:
        """Select appropriate strategic framework for analysis."""
        if "market" in decision_point.lower():
            return "Porter's Five Forces Analysis"
        elif "expansion" in decision_point.lower():
            return "Ansoff Matrix"
        elif "competitive" in decision_point.lower():
            return "Blue Ocean Strategy"
        else:
            return "SWOT Analysis"
    
    def _calculate_confidence(self, analysis: Dict) -> float:
        """Calculate confidence score based on analysis quality."""
        base_score = 0.7
        
        # Adjust based on complexity
        if analysis["complexity"] == "high":
            base_score -= 0.1
        elif analysis["complexity"] == "low":
            base_score += 0.1
        
        # Adjust based on alignment
        if analysis["alignment"] == "strong":
            base_score += 0.1
        
        # Adjust based on market conditions
        if analysis["market_conditions"] == "stable":
            base_score += 0.05
        elif analysis["market_conditions"] == "volatile":
            base_score -= 0.1
        
        return max(0.0, min(1.0, base_score))
    
    def get_agent_capabilities(self) -> List[str]:
        """Return detailed list of agent capabilities."""
        return [
            "Strategic decision analysis and framework application",
            "Assumption challenging and alternative perspective generation",
            "Risk-benefit assessment with scenario planning",
            "Implementation feasibility analysis and roadmap creation",
            "Market and competitive landscape evaluation",
            "Resource requirement and timeline assessment",
            "Strategic option generation and evaluation"
        ]