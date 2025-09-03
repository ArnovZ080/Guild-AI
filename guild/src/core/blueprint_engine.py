"""
Blueprint Engine for Super-Agents

This module parses and executes functional blueprints, transforming
specialized agents into comprehensive "cloud employees."
"""

import yaml
import json
import logging
from typing import Dict, List, Any, Optional, Union
from pathlib import Path
from datetime import datetime
import re
from dataclasses import dataclass

from guild.src.core.orchestrator import Orchestrator

logger = logging.getLogger(__name__)

@dataclass
class BlueprintStep:
    name: str
    agent: str
    input: Union[str, Dict[str, Any]]
    output: str
    loop: Optional[str] = None
    condition: Optional[str] = None
    timeout: Optional[int] = None

@dataclass
class Blueprint:
    id: str
    name: str
    description: str
    trigger: Dict[str, Any]
    steps: List[BlueprintStep]
    config: Dict[str, Any] = None

class BlueprintEngine:
    """
    Engine for parsing and executing functional blueprints
    """
    
    def __init__(self, orchestrator: Orchestrator, blueprints_dir: str = "guild/src/blueprints"):
        self.orchestrator = orchestrator
        self.blueprints_dir = Path(blueprints_dir)
        self.blueprints: Dict[str, Blueprint] = {}
        self.execution_context: Dict[str, Any] = {}
        
        # Load all blueprints on initialization
        self.load_all_blueprints()
    
    def load_all_blueprints(self):
        """Load all blueprint files from the blueprints directory"""
        if not self.blueprints_dir.exists():
            logger.warning(f"Blueprints directory not found: {self.blueprints_dir}")
            return
        
        for blueprint_file in self.blueprints_dir.glob("*.yml"):
            try:
                blueprint = self.load_blueprint(blueprint_file)
                if blueprint:
                    self.blueprints[blueprint.id] = blueprint
                    logger.info(f"Loaded blueprint: {blueprint.name}")
            except Exception as e:
                logger.error(f"Failed to load blueprint {blueprint_file}: {e}")
    
    def load_blueprint(self, file_path: Path) -> Optional[Blueprint]:
        """Load a single blueprint from a YAML file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
            
            # Parse steps
            steps = []
            for step_data in data.get('steps', []):
                step = BlueprintStep(
                    name=step_data['name'],
                    agent=step_data['agent'],
                    input=step_data['input'],
                    output=step_data['output'],
                    loop=step_data.get('loop'),
                    condition=step_data.get('condition'),
                    timeout=step_data.get('timeout')
                )
                steps.append(step)
            
            # Create blueprint
            blueprint = Blueprint(
                id=data['id'],
                name=data['name'],
                description=data['description'],
                trigger=data.get('trigger', {}),
                steps=steps,
                config=data.get('config', {})
            )
            
            return blueprint
            
        except Exception as e:
            logger.error(f"Error loading blueprint {file_path}: {e}")
            return None
    
    def execute_blueprint(self, blueprint_id: str, trigger_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute a blueprint with the given trigger data
        """
        if blueprint_id not in self.blueprints:
            raise ValueError(f"Blueprint not found: {blueprint_id}")
        
        blueprint = self.blueprints[blueprint_id]
        logger.info(f"Executing blueprint: {blueprint.name}")
        
        # Initialize execution context
        self.execution_context = {
            'blueprint_id': blueprint_id,
            'start_time': datetime.now().isoformat(),
            'trigger_data': trigger_data or {},
            'steps': {},
            'config': blueprint.config or {},
            'date': datetime.now().strftime('%Y-%m-%d')
        }
        
        try:
            # Execute steps sequentially
            for step in blueprint.steps:
                step_result = self._execute_step(step)
                
                if step_result is None:
                    logger.warning(f"Step {step.name} returned no result")
                    continue
                
                # Store step result
                self.execution_context['steps'][step.name] = {
                    'output': step_result,
                    'status': 'completed',
                    'timestamp': datetime.now().isoformat()
                }
                
                # Check condition if specified
                if step.condition:
                    if not self._evaluate_condition(step.condition, step_result):
                        logger.info(f"Step {step.name} condition not met, stopping execution")
                        break
            
            # Generate execution summary
            execution_summary = {
                'blueprint_id': blueprint_id,
                'blueprint_name': blueprint.name,
                'status': 'completed',
                'execution_time': datetime.now().isoformat(),
                'steps_executed': len(self.execution_context['steps']),
                'total_steps': len(blueprint.steps),
                'results': self.execution_context['steps']
            }
            
            logger.info(f"Blueprint {blueprint.name} executed successfully")
            return execution_summary
            
        except Exception as e:
            logger.error(f"Blueprint execution failed: {e}")
            execution_summary = {
                'blueprint_id': blueprint_id,
                'blueprint_name': blueprint.name,
                'status': 'failed',
                'error': str(e),
                'execution_time': datetime.now().isoformat(),
                'steps_executed': len(self.execution_context['steps']),
                'total_steps': len(blueprint.steps),
                'results': self.execution_context['steps']
            }
            return execution_summary
    
    def _execute_step(self, step: BlueprintStep) -> Any:
        """Execute a single blueprint step"""
        logger.info(f"Executing step: {step.name} with agent: {step.agent}")
        
        try:
            # Resolve input variables
            resolved_input = self._resolve_variables(step.input)
            
            # Handle loops
            if step.loop:
                return self._execute_loop_step(step, resolved_input)
            
            # Execute single step
            if step.agent == 'human_in_the_loop':
                return self._execute_human_step(step, resolved_input)
            else:
                return self._execute_agent_step(step, resolved_input)
                
        except Exception as e:
            logger.error(f"Step {step.name} execution failed: {e}")
            raise
    
    def _execute_loop_step(self, step: BlueprintStep, resolved_input: Any) -> List[Any]:
        """Execute a step that loops over items"""
        loop_data = self._resolve_variables(step.loop)
        
        if not isinstance(loop_data, list):
            logger.warning(f"Loop data is not a list: {type(loop_data)}")
            return []
        
        results = []
        for i, item in enumerate(loop_data):
            logger.info(f"Loop iteration {i+1}/{len(loop_data)} for step {step.name}")
            
            # Create loop context
            loop_context = {
                'loop': {
                    'item': item,
                    'index': i,
                    'total': len(loop_data)
                }
            }
            
            # Temporarily add loop context to execution context
            original_context = self.execution_context.copy()
            self.execution_context.update(loop_context)
            
            try:
                # Execute step with loop item
                if step.agent == 'human_in_the_loop':
                    result = self._execute_human_step(step, resolved_input)
                else:
                    result = self._execute_agent_step(step, resolved_input)
                
                results.append(result)
                
            finally:
                # Restore original context
                self.execution_context = original_context
        
        return results
    
    def _execute_agent_step(self, step: BlueprintStep, resolved_input: Any) -> Any:
        """Execute a step with an AI agent"""
        # This would integrate with the orchestrator to call the appropriate agent
        # For now, we'll simulate the execution
        
        if step.agent == 'visual_agent':
            # Handle visual skills
            if isinstance(resolved_input, dict) and 'skill' in resolved_input:
                skill_id = resolved_input['skill']
                skill_data = resolved_input.get('data', {})
                return self._execute_visual_skill(skill_id, skill_data)
        
        # Simulate agent execution
        logger.info(f"Simulating execution of {step.agent} with input: {resolved_input}")
        
        # Return mock output based on step name
        mock_outputs = {
            'research_agent': f"Research results for: {resolved_input}",
            'content_strategist': f"Content ideas based on: {resolved_input}",
            'copywriter_agent': f"Generated content for: {resolved_input}",
            'scraper_agent': f"Scraped data: {resolved_input}",
            'evaluation_agent': f"Evaluation results: {resolved_input}",
            'marketing_agent': f"Marketing strategy: {resolved_input}",
            'email_agent': f"Email sent: {resolved_input}",
            'bookkeeping_agent': f"Bookkeeping completed: {resolved_input}"
        }
        
        return mock_outputs.get(step.agent, f"Output from {step.agent}: {resolved_input}")
    
    def _execute_visual_skill(self, skill_id: str, skill_data: Dict[str, Any]) -> Any:
        """Execute a visual skill using the workflow builder"""
        try:
            # This would integrate with the visual workflow builder
            # For now, return a mock result
            return f"Visual skill {skill_id} executed with data: {skill_data}"
        except Exception as e:
            logger.error(f"Visual skill execution failed: {e}")
            return None
    
    def _execute_human_step(self, step: BlueprintStep, resolved_input: Any) -> Dict[str, Any]:
        """Execute a step that requires human intervention"""
        logger.info(f"Human intervention required for step: {step.name}")
        
        # In a real implementation, this would:
        # 1. Send notification to user
        # 2. Wait for response
        # 3. Return the response
        
        # For now, return a mock approval
        return {
            'approved': True,
            'approved_items': resolved_input,
            'approved_by': 'user',
            'approved_at': datetime.now().isoformat()
        }
    
    def _resolve_variables(self, template: Any) -> Any:
        """Resolve template variables in the input"""
        if isinstance(template, str):
            return self._resolve_string_variables(template)
        elif isinstance(template, dict):
            return {k: self._resolve_variables(v) for k, v in template.items()}
        elif isinstance(template, list):
            return [self._resolve_variables(item) for item in template]
        else:
            return template
    
    def _resolve_string_variables(self, template: str) -> str:
        """Resolve variables in a string template"""
        # Replace {{ steps.step_name.output }} with actual values
        def replace_variable(match):
            var_path = match.group(1).strip()
            try:
                # Navigate the execution context
                parts = var_path.split('.')
                value = self.execution_context
                for part in parts:
                    value = value[part]
                return str(value)
            except (KeyError, TypeError):
                logger.warning(f"Variable not found: {var_path}")
                return f"{{{{ {var_path} }}}}"
        
        return re.sub(r'\{\{\s*([^}]+)\s*\}\}', replace_variable, template)
    
    def _evaluate_condition(self, condition: str, step_result: Any) -> bool:
        """Evaluate a condition string"""
        try:
            # Simple condition evaluation
            # In production, use a proper expression evaluator
            if 'approved == true' in condition:
                if isinstance(step_result, dict):
                    return step_result.get('approved', False)
                return bool(step_result)
            return True
        except Exception as e:
            logger.error(f"Condition evaluation failed: {e}")
            return False
    
    def get_blueprint(self, blueprint_id: str) -> Optional[Blueprint]:
        """Get a blueprint by ID"""
        return self.blueprints.get(blueprint_id)
    
    def list_blueprints(self) -> List[Dict[str, Any]]:
        """List all available blueprints"""
        return [
            {
                'id': bp.id,
                'name': bp.name,
                'description': bp.description,
                'trigger': bp.trigger,
                'step_count': len(bp.steps)
            }
            for bp in self.blueprints.values()
        ]
