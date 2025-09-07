"""
UX/UI Tester Agent for Guild-AI
Analyzes product usability and suggests design improvements.
"""

from typing import Dict, List, Any
from datetime import datetime


class UXUITesterAgent:
    """UX/UI Tester Agent for usability analysis and design improvements."""
    
    def __init__(self):
        self.agent_name = "UX/UI Tester Agent"
        self.agent_type = "Product"
        self.capabilities = [
            "Usability testing",
            "Design analysis",
            "User experience evaluation",
            "Accessibility assessment"
        ]
        self.test_results = {}
        self.design_guidelines = {}
        
    def get_agent_info(self) -> Dict[str, Any]:
        """Return agent information."""
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "status": "active"
        }
    
    def conduct_usability_test(self, test_data: Dict[str, Any]) -> Dict[str, Any]:
        """Conduct usability test analysis."""
        try:
            test_id = f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Analyze test metrics
            completion_rate = test_data.get("completed_tasks", 0) / test_data.get("total_tasks", 1)
            error_rate = test_data.get("errors", 0) / test_data.get("total_actions", 1)
            time_efficiency = test_data.get("expected_time", 1) / test_data.get("actual_time", 1)
            
            # Calculate usability score
            usability_score = (completion_rate * 0.4 + 
                             (1 - error_rate) * 0.3 + 
                             min(time_efficiency, 1) * 0.3) * 100
            
            test_result = {
                "test_id": test_id,
                "completion_rate": round(completion_rate * 100, 1),
                "error_rate": round(error_rate * 100, 1),
                "time_efficiency": round(time_efficiency * 100, 1),
                "usability_score": round(usability_score, 1),
                "recommendations": [],
                "test_date": datetime.now().isoformat()
            }
            
            # Generate recommendations
            if completion_rate < 0.8:
                test_result["recommendations"].append("Improve task completion flow")
            if error_rate > 0.1:
                test_result["recommendations"].append("Reduce user errors through better design")
            if time_efficiency < 0.8:
                test_result["recommendations"].append("Optimize for faster task completion")
            
            self.test_results[test_id] = test_result
            return test_result
            
        except Exception as e:
            return {"error": f"Usability test failed: {str(e)}"}
    
    def analyze_design_consistency(self, design_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze design consistency across interface."""
        try:
            analysis = {
                "color_consistency": 0,
                "typography_consistency": 0,
                "spacing_consistency": 0,
                "component_consistency": 0,
                "overall_score": 0,
                "issues": [],
                "recommendations": []
            }
            
            # Analyze color consistency
            colors = design_data.get("colors", [])
            if len(set(colors)) <= 5:
                analysis["color_consistency"] = 90
            else:
                analysis["color_consistency"] = 60
                analysis["issues"].append("Too many colors used")
            
            # Analyze typography
            fonts = design_data.get("fonts", [])
            if len(set(fonts)) <= 3:
                analysis["typography_consistency"] = 90
            else:
                analysis["typography_consistency"] = 60
                analysis["issues"].append("Too many font types")
            
            # Calculate overall score
            analysis["overall_score"] = round(
                (analysis["color_consistency"] + analysis["typography_consistency"]) / 2, 1
            )
            
            # Generate recommendations
            if analysis["overall_score"] < 80:
                analysis["recommendations"].append("Establish design system guidelines")
                analysis["recommendations"].append("Standardize color palette and typography")
            
            return analysis
            
        except Exception as e:
            return {"error": f"Design analysis failed: {str(e)}"}
    
    def assess_accessibility(self, accessibility_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess accessibility compliance."""
        try:
            assessment = {
                "wcag_compliance": "AA",
                "color_contrast_score": 0,
                "keyboard_navigation": True,
                "screen_reader_compatibility": True,
                "accessibility_score": 0,
                "issues": [],
                "recommendations": []
            }
            
            # Check color contrast
            contrast_ratio = accessibility_data.get("contrast_ratio", 4.5)
            if contrast_ratio >= 4.5:
                assessment["color_contrast_score"] = 100
            elif contrast_ratio >= 3.0:
                assessment["color_contrast_score"] = 70
                assessment["issues"].append("Color contrast below WCAG AA standard")
            else:
                assessment["color_contrast_score"] = 30
                assessment["issues"].append("Poor color contrast")
            
            # Check keyboard navigation
            if not accessibility_data.get("keyboard_navigation", True):
                assessment["keyboard_navigation"] = False
                assessment["issues"].append("Keyboard navigation not fully supported")
            
            # Calculate overall accessibility score
            assessment["accessibility_score"] = round(
                (assessment["color_contrast_score"] + 
                 (100 if assessment["keyboard_navigation"] else 0) +
                 (100 if assessment["screen_reader_compatibility"] else 0)) / 3, 1
            )
            
            # Generate recommendations
            if assessment["accessibility_score"] < 80:
                assessment["recommendations"].append("Improve color contrast ratios")
                assessment["recommendations"].append("Ensure full keyboard navigation support")
                assessment["recommendations"].append("Add ARIA labels for screen readers")
            
            return assessment
            
        except Exception as e:
            return {"error": f"Accessibility assessment failed: {str(e)}"}
    
    def get_agent_capabilities(self) -> List[str]:
        """Return agent capabilities."""
        return [
            "Usability testing and analysis",
            "Design consistency evaluation",
            "Accessibility compliance assessment",
            "User experience optimization",
            "Design system recommendations"
        ]