"""
Node Types for Workflow Builder

This module defines the different types of nodes that can be used in workflows:
- Agent Nodes: Your existing AI agents
- Visual Skill Nodes: Learned visual automation skills
- Logic Nodes: Control flow and decision making
- Input/Output Nodes: Data entry and exit points
"""

import uuid
import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from abc import ABC, abstractmethod
from dataclasses import dataclass, field

# Conditional import for vision components
try:
    from guild.src.core.vision.visual_automation_tool import VisualAutomationTool
except ImportError:
    VisualAutomationTool = None
    print("Warning: VisualAutomationTool not available - computer vision features disabled")
from guild.src.core.orchestrator import Orchestrator

logger = logging.getLogger(__name__)


class BaseNode(ABC):
    """Base class for all workflow nodes."""
    
    def __init__(self, node_id: str, name: str, description: str = "", node_type: str = "base"):
        self.node_id = node_id
        self.name = name
        self.description = description
        self.node_type = node_type
        self.status = "pending"
        self.inputs: Dict[str, Any] = {}
        self.outputs: Dict[str, Any] = {}
        self.dependencies: List[str] = []
        self.estimated_duration: int = 0
        self.config: Dict[str, Any] = {}
        self.error: Optional[str] = None
        self.execution_log: List[Dict[str, Any]] = []
        self.start_time: Optional[float] = None
        self.end_time: Optional[float] = None
    
    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the node with given context."""
        pass
    
    def get_status(self) -> Dict[str, Any]:
        """Get current node status."""
        return {
            "node_id": self.node_id,
            "name": self.name,
            "status": self.status,
            "error": self.error,
            "execution_time": self.end_time - self.start_time if self.end_time and self.start_time else None,
            "inputs": self.inputs,
            "outputs": self.outputs
        }
    
    def reset(self):
        """Reset node to initial state."""
        self.status = "pending"
        self.inputs = {}
        self.outputs = {}
        self.error = None
        self.execution_log = []
        self.start_time = None
        self.end_time = None


class AgentNode(BaseNode):
    """Node that executes one of your existing AI agents."""
    
    def __init__(self, node_id: str, name: str, agent_type: str, agent_config: Dict[str, Any]):
        super().__init__(node_id, name, f"AI Agent: {agent_type}", "agent")
        self.agent_type = agent_type
        self.agent_config = agent_config
        self.agent = None
        self._initialize_agent()
    
    def _initialize_agent(self):
        """Initialize the AI agent based on type."""
        try:
            # Import and instantiate the appropriate agent
            if self.agent_type == "content_strategist":
                from guild.src.agents.content_strategist import ContentStrategist
                self.agent = ContentStrategist(self.agent_config)
            elif self.agent_type == "copywriter":
                from guild.src.agents.copywriter_agent import generate_ad_copy
                # Create a wrapper class for the copywriter function
                class CopywriterAgent:
                    def __init__(self, config):
                        self.config = config
                    
                    async def run(self, context):
                        try:
                            result = generate_ad_copy(
                                product_description=context.get("product_description", ""),
                                key_messaging=context.get("key_messaging", []),
                                target_channel=context.get("target_channel", "general")
                            )
                            return {"success": True, "result": result}
                        except Exception as e:
                            return {"success": False, "error": str(e)}
                
                self.agent = CopywriterAgent(self.agent_config)
            elif self.agent_type == "judge":
                from guild.src.agents.judge_agent import JudgeAgent
                self.agent = JudgeAgent(self.agent_config)
            elif self.agent_type == "onboarding":
                from guild.src.agents.onboarding_agent import OnboardingAgent
                self.agent = OnboardingAgent(self.agent_config)
            else:
                # Generic agent fallback - create a simple wrapper
                class GenericAgent:
                    def __init__(self, agent_type, config):
                        self.agent_type = agent_type
                        self.config = config
                    
                    async def run(self, context):
                        return {"success": True, "agent_type": self.agent_type, "message": f"Generic agent {self.agent_type} executed"}
                
                self.agent = GenericAgent(self.agent_type, self.agent_config)
                
            logger.info(f"Initialized agent node: {self.agent_type}")
        except Exception as e:
            logger.error(f"Failed to initialize agent {self.agent_type}: {e}")
            self.error = f"Agent initialization failed: {e}"
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the AI agent."""
        if not self.agent:
            self.error = "Agent not initialized"
            self.status = "failed"
            return {"success": False, "error": self.error}
        
        try:
            self.status = "running"
            self.start_time = asyncio.get_event_loop().time()
            self.inputs = context
            
            # Execute the agent
            result = await self.agent.run(context)
            
            self.end_time = asyncio.get_event_loop().time()
            self.status = "completed"
            self.outputs = result
            
            # Log execution
            self.execution_log.append({
                "timestamp": asyncio.get_event_loop().time(),
                "status": "completed",
                "result": result
            })
            
            logger.info(f"Agent node {self.name} executed successfully")
            return result
            
        except Exception as e:
            self.end_time = asyncio.get_event_loop().time()
            self.status = "failed"
            self.error = str(e)
            
            # Log error
            self.execution_log.append({
                "timestamp": asyncio.get_event_loop().time(),
                "status": "failed",
                "error": str(e)
            })
            
            logger.error(f"Agent node {self.name} execution failed: {e}")
            return {"success": False, "error": str(e)}


class VisualSkillNode(BaseNode):
    """Node that executes learned visual automation skills."""
    
    def __init__(self, node_id: str, name: str, skill_pattern: Dict[str, Any]):
        super().__init__(node_id, name, f"Visual Skill: {name}", "visual_skill")
        self.skill_pattern = skill_pattern
        self.visual_tool = VisualAutomationTool()
        self.estimated_duration = skill_pattern.get("estimated_duration", 30)
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the visual automation skill."""
        try:
            self.status = "running"
            self.start_time = asyncio.get_event_loop().time()
            self.inputs = context
            
            # Execute the visual skill pattern
            result = await self._execute_skill_pattern(context)
            
            self.end_time = asyncio.get_event_loop().time()
            self.status = "completed"
            self.outputs = result
            
            # Log execution
            self.execution_log.append({
                "timestamp": asyncio.get_event_loop().time(),
                "status": "completed",
                "result": result
            })
            
            logger.info(f"Visual skill node {self.name} executed successfully")
            return result
            
        except Exception as e:
            self.end_time = asyncio.get_event_loop().time()
            self.status = "failed"
            self.error = str(e)
            
            # Log error
            self.execution_log.append({
                "timestamp": asyncio.get_event_loop().time(),
                "status": "failed",
                "error": str(e)
            })
            
            logger.error(f"Visual skill node {self.name} execution failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def _execute_skill_pattern(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the specific visual skill pattern."""
        steps = self.skill_pattern.get("steps", [])
        results = []
        
        for step in steps:
            step_result = await self._execute_step(step, context)
            results.append(step_result)
            
            if not step_result.get("success"):
                return {"success": False, "error": f"Step failed: {step_result.get('error')}"}
        
        return {
            "success": True,
            "steps_completed": len(results),
            "results": results,
            "skill_name": self.name
        }
    
    async def _execute_step(self, step: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single step of the visual skill."""
        action_type = step.get("action_type")
        target_element = step.get("target_element")
        action_data = step.get("action_data", {})
        
        try:
            if action_type == "click":
                success = await self.visual_tool.click_element(
                    target_element, 
                    confidence_threshold=0.7
                )
                return {"success": success, "action": "click", "target": target_element}
                
            elif action_type == "type":
                text = action_data.get("text", "")
                success = await self.visual_tool.type_text(
                    target_element, 
                    text, 
                    confidence_threshold=0.7
                )
                return {"success": success, "action": "type", "target": target_element, "text": text}
                
            elif action_type == "wait":
                duration = action_data.get("duration", 1)
                await asyncio.sleep(duration)
                return {"success": True, "action": "wait", "duration": duration}
                
            elif action_type == "screenshot":
                screenshot = await self.visual_tool.take_screenshot()
                return {"success": True, "action": "screenshot", "data": screenshot}
                
            else:
                return {"success": False, "error": f"Unknown action type: {action_type}"}
                
        except Exception as e:
            return {"success": False, "error": f"Step execution failed: {e}"}


class LogicNode(BaseNode):
    """Node that provides control flow and decision making."""
    
    def __init__(self, node_id: str, name: str, logic_type: str, config: Dict[str, Any]):
        super().__init__(node_id, name, f"Logic: {logic_type}", "logic")
        self.logic_type = logic_type
        self.config = config
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the logic node."""
        try:
            self.status = "running"
            self.start_time = asyncio.get_event_loop().time()
            self.inputs = context
            
            if self.logic_type == "if_else":
                result = await self._execute_if_else(context)
            elif self.logic_type == "loop":
                result = await self._execute_loop(context)
            elif self.logic_type == "switch":
                result = await self._execute_switch(context)
            elif self.logic_type == "delay":
                result = await self._execute_delay(context)
            else:
                result = {"success": False, "error": f"Unknown logic type: {self.logic_type}"}
            
            self.end_time = asyncio.get_event_loop().time()
            self.status = "completed"
            self.outputs = result
            
            # Log execution
            self.execution_log.append({
                "timestamp": asyncio.get_event_loop().time(),
                "status": "completed",
                "result": result
            })
            
            return result
            
        except Exception as e:
            self.end_time = asyncio.get_event_loop().time()
            self.status = "failed"
            self.error = str(e)
            return {"success": False, "error": str(e)}
    
    async def _execute_if_else(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute if-else logic."""
        condition = self.config.get("condition")
        if_branch = self.config.get("if_branch")
        else_branch = self.config.get("else_branch")
        
        # Evaluate condition (simple string-based evaluation for now)
        condition_met = self._evaluate_condition(condition, context)
        
        if condition_met:
            return {"success": True, "branch": "if", "condition": condition, "result": if_branch}
        else:
            return {"success": True, "branch": "else", "condition": condition, "result": else_branch}
    
    async def _execute_loop(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute loop logic."""
        loop_type = self.config.get("loop_type", "for")
        iterations = self.config.get("iterations", 1)
        loop_body = self.config.get("loop_body", [])
        
        results = []
        
        if loop_type == "for":
            for i in range(iterations):
                iteration_result = {
                    "iteration": i + 1,
                    "timestamp": asyncio.get_event_loop().time()
                }
                results.append(iteration_result)
                
                # Execute loop body (simplified)
                if loop_body:
                    iteration_result["body_executed"] = True
                
                # Small delay between iterations
                await asyncio.sleep(0.1)
        
        return {
            "success": True,
            "loop_type": loop_type,
            "iterations": iterations,
            "results": results
        }
    
    async def _execute_switch(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute switch logic."""
        switch_value = self.config.get("switch_value")
        cases = self.config.get("cases", {})
        default_case = self.config.get("default_case")
        
        selected_case = cases.get(switch_value, default_case)
        
        return {
            "success": True,
            "switch_value": switch_value,
            "selected_case": selected_case
        }
    
    async def _execute_delay(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute delay logic."""
        delay_seconds = self.config.get("delay_seconds", 1)
        
        await asyncio.sleep(delay_seconds)
        
        return {
            "success": True,
            "delay_seconds": delay_seconds,
            "delayed_at": asyncio.get_event_loop().time()
        }
    
    def _evaluate_condition(self, condition: str, context: Dict[str, Any]) -> bool:
        """Evaluate a condition string against context."""
        try:
            # Simple condition evaluation (can be enhanced)
            if "==" in condition:
                left, right = condition.split("==")
                return context.get(left.strip()) == right.strip()
            elif "!=" in condition:
                left, right = condition.split("!=")
                return context.get(left.strip()) != right.strip()
            elif ">" in condition:
                left, right = condition.split(">")
                return float(context.get(left.strip(), 0)) > float(right.strip())
            elif "<" in condition:
                left, right = condition.split("<")
                return float(context.get(left.strip(), 0)) < float(right.strip())
            else:
                # Boolean evaluation
                return bool(context.get(condition.strip(), False))
        except:
            return False


class InputNode(BaseNode):
    """Node that provides input data to the workflow."""
    
    def __init__(self, node_id: str, name: str, input_type: str, default_value: Any = None):
        super().__init__(node_id, name, f"Input: {input_type}", "input")
        self.input_type = input_type
        self.default_value = default_value
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Provide input data."""
        try:
            self.status = "running"
            self.start_time = asyncio.get_event_loop().time()
            
            # Get input value from context or use default
            input_value = context.get(self.name, self.default_value)
            
            self.end_time = asyncio.get_event_loop().time()
            self.status = "completed"
            self.outputs = {"value": input_value}
            
            return {"success": True, "value": input_value, "input_type": self.input_type}
            
        except Exception as e:
            self.status = "failed"
            self.error = str(e)
            return {"success": False, "error": str(e)}


class OutputNode(BaseNode):
    """Node that collects output data from the workflow."""
    
    def __init__(self, node_id: str, name: str, output_type: str = "any"):
        super().__init__(node_id, name, f"Output: {output_type}", "output")
        self.output_type = output_type
    
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Collect output data."""
        try:
            self.status = "running"
            self.start_time = asyncio.get_event_loop().time()
            
            # Collect all available outputs from context
            outputs = {}
            for key, value in context.items():
                if key.startswith("output_") or key in ["result", "data", "content"]:
                    outputs[key] = value
            
            self.end_time = asyncio.get_event_loop().time()
            self.status = "completed"
            self.outputs = outputs
            
            return {"success": True, "outputs": outputs, "output_type": self.output_type}
            
        except Exception as e:
            self.status = "failed"
            self.error = str(e)
            return {"success": False, "error": str(e)}


# Factory function to create nodes
def create_node(node_type: str, **kwargs) -> BaseNode:
    """Create a node of the specified type."""
    node_id = kwargs.get("node_id", str(uuid.uuid4()))
    name = kwargs.get("name", f"{node_type}_node")
    
    if node_type == "agent":
        return AgentNode(node_id, name, kwargs.get("agent_type"), kwargs.get("agent_config", {}))
    elif node_type == "visual_skill":
        return VisualSkillNode(node_id, name, kwargs.get("skill_pattern", {}))
    elif node_type == "logic":
        return LogicNode(node_id, name, kwargs.get("logic_type"), kwargs.get("config", {}))
    elif node_type == "input":
        return InputNode(node_id, name, kwargs.get("input_type"), kwargs.get("default_value"))
    elif node_type == "output":
        return OutputNode(node_id, name, kwargs.get("output_type"))
    else:
        raise ValueError(f"Unknown node type: {node_type}")
