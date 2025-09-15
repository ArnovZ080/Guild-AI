"""
Automation Agent - Manages N8N, Zapier, and Make.com integrations
Provides autonomous workflow execution capabilities for Guild agents
"""

import json
import os
import requests
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class AutomationBlueprint:
    """Represents an automation blueprint"""
    name: str
    description: str
    trigger: str
    n8n_workflow_id: str
    inputs: List[str]
    outputs: List[str]
    category: str

@dataclass
class AutomationResult:
    """Result of an automation execution"""
    success: bool
    workflow_id: str
    execution_id: str
    outputs: Dict[str, Any]
    error: Optional[str] = None
    execution_time: Optional[float] = None

class AutomationAgent:
    """
    Automation Agent for managing N8N, Zapier, and Make.com integrations
    
    This agent provides autonomous workflow execution capabilities,
    allowing other Guild agents to trigger complex automations
    without manual intervention.
    """
    
    def __init__(self, 
                 n8n_base_url: str = None,
                 n8n_api_key: str = None,
                 registry_path: str = None):
        """
        Initialize the Automation Agent
        
        Args:
            n8n_base_url: Base URL for N8N instance
            n8n_api_key: API key for N8N authentication
            registry_path: Path to automation registry JSON file
        """
        self.n8n_base_url = n8n_base_url or os.getenv('N8N_BASE_URL')
        self.n8n_api_key = n8n_api_key or os.getenv('N8N_API_KEY')
        
        # Load automation registry
        if registry_path is None:
            registry_path = os.path.join(
                os.path.dirname(__file__), 
                '..', '..', 'blueprints', 'automations', 'registry.json'
            )
        
        self.blueprints = self._load_blueprints(registry_path)
        self.active_workflows = {}
        
        logger.info(f"Automation Agent initialized with {len(self.blueprints)} blueprints")
    
    def _load_blueprints(self, registry_path: str) -> Dict[str, AutomationBlueprint]:
        """Load automation blueprints from registry"""
        try:
            with open(registry_path, 'r') as f:
                registry_data = json.load(f)
            
            blueprints = {}
            for blueprint_data in registry_data:
                blueprint = AutomationBlueprint(
                    name=blueprint_data['name'],
                    description=blueprint_data['description'],
                    trigger=blueprint_data['trigger'],
                    n8n_workflow_id=blueprint_data['n8n_workflow_id'],
                    inputs=blueprint_data['inputs'],
                    outputs=blueprint_data['outputs'],
                    category=blueprint_data['category']
                )
                blueprints[blueprint.name] = blueprint
            
            return blueprints
        except Exception as e:
            logger.error(f"Failed to load blueprints from {registry_path}: {e}")
            return {}
    
    def list_blueprints(self, category: str = None) -> List[AutomationBlueprint]:
        """
        List available automation blueprints
        
        Args:
            category: Filter by category (sales, marketing, customer, etc.)
            
        Returns:
            List of available blueprints
        """
        blueprints = list(self.blueprints.values())
        
        if category:
            blueprints = [bp for bp in blueprints if bp.category == category]
        
        return blueprints
    
    def get_blueprint(self, name: str) -> Optional[AutomationBlueprint]:
        """
        Get a specific blueprint by name
        
        Args:
            name: Blueprint name
            
        Returns:
            Blueprint object or None if not found
        """
        return self.blueprints.get(name)
    
    def run_blueprint(self, name: str, inputs: Dict[str, Any]) -> AutomationResult:
        """
        Execute an automation blueprint
        
        Args:
            name: Blueprint name
            inputs: Input data for the automation
            
        Returns:
            AutomationResult with execution details
        """
        blueprint = self.get_blueprint(name)
        if not blueprint:
            return AutomationResult(
                success=False,
                workflow_id="",
                execution_id="",
                outputs={},
                error=f"Blueprint '{name}' not found"
            )
        
        # Validate inputs
        missing_inputs = set(blueprint.inputs) - set(inputs.keys())
        if missing_inputs:
            return AutomationResult(
                success=False,
                workflow_id=blueprint.n8n_workflow_id,
                execution_id="",
                outputs={},
                error=f"Missing required inputs: {missing_inputs}"
            )
        
        # Execute via N8N webhook
        return self._execute_n8n_workflow(blueprint, inputs)
    
    def _execute_n8n_workflow(self, blueprint: AutomationBlueprint, inputs: Dict[str, Any]) -> AutomationResult:
        """
        Execute workflow via N8N webhook
        
        Args:
            blueprint: Blueprint to execute
            inputs: Input data
            
        Returns:
            AutomationResult
        """
        start_time = datetime.now()
        
        try:
            # Prepare webhook URL
            webhook_url = f"{self.n8n_base_url}/webhook/{blueprint.n8n_workflow_id}"
            
            # Prepare headers
            headers = {
                'Content-Type': 'application/json'
            }
            
            if self.n8n_api_key:
                headers['Authorization'] = f'Bearer {self.n8n_api_key}'
            
            # Execute webhook
            response = requests.post(
                webhook_url,
                json=inputs,
                headers=headers,
                timeout=30
            )
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            if response.status_code == 200:
                result_data = response.json()
                return AutomationResult(
                    success=True,
                    workflow_id=blueprint.n8n_workflow_id,
                    execution_id=result_data.get('execution_id', ''),
                    outputs=result_data.get('outputs', {}),
                    execution_time=execution_time
                )
            else:
                return AutomationResult(
                    success=False,
                    workflow_id=blueprint.n8n_workflow_id,
                    execution_id="",
                    outputs={},
                    error=f"N8N webhook failed with status {response.status_code}: {response.text}",
                    execution_time=execution_time
                )
                
        except requests.exceptions.RequestException as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            return AutomationResult(
                success=False,
                workflow_id=blueprint.n8n_workflow_id,
                execution_id="",
                outputs={},
                error=f"Request failed: {str(e)}",
                execution_time=execution_time
            )
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            return AutomationResult(
                success=False,
                workflow_id=blueprint.n8n_workflow_id,
                execution_id="",
                outputs={},
                error=f"Unexpected error: {str(e)}",
                execution_time=execution_time
            )
    
    def deploy_blueprint(self, name: str, user_n8n_url: str, api_key: str) -> Dict[str, Any]:
        """
        Deploy a blueprint to user's N8N instance
        
        Args:
            name: Blueprint name
            user_n8n_url: User's N8N instance URL
            api_key: User's N8N API key
            
        Returns:
            Deployment result
        """
        blueprint = self.get_blueprint(name)
        if not blueprint:
            return {
                'success': False,
                'error': f"Blueprint '{name}' not found"
            }
        
        try:
            # Load blueprint JSON from starter pack
            starter_pack_path = os.path.join(
                os.path.dirname(__file__), 
                '..', '..', 'blueprints', 'n8n_starter_pack.json'
            )
            
            with open(starter_pack_path, 'r') as f:
                starter_pack = json.load(f)
            
            # Find blueprint in starter pack
            blueprint_key = None
            for key, value in starter_pack.items():
                if value['name'] == name:
                    blueprint_key = key
                    break
            
            if not blueprint_key:
                return {
                    'success': False,
                    'error': f"Blueprint '{name}' not found in starter pack"
                }
            
            # Deploy to user's N8N instance
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{user_n8n_url}/rest/workflows",
                headers=headers,
                json=starter_pack[blueprint_key]['blueprint']
            )
            
            if response.status_code == 201:
                return {
                    'success': True,
                    'workflow_id': response.json().get('id'),
                    'message': f"Blueprint '{name}' deployed successfully"
                }
            else:
                return {
                    'success': False,
                    'error': f"Deployment failed: {response.text}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Deployment error: {str(e)}"
            }
    
    def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """
        Get status of a workflow execution
        
        Args:
            workflow_id: N8N workflow ID
            
        Returns:
            Workflow status information
        """
        try:
            headers = {
                'Authorization': f'Bearer {self.n8n_api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                f"{self.n8n_base_url}/rest/workflows/{workflow_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    'success': False,
                    'error': f"Failed to get workflow status: {response.text}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Error getting workflow status: {str(e)}"
            }
    
    def list_active_workflows(self) -> List[Dict[str, Any]]:
        """
        List all active workflows in N8N instance
        
        Returns:
            List of active workflows
        """
        try:
            headers = {
                'Authorization': f'Bearer {self.n8n_api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                f"{self.n8n_base_url}/rest/workflows",
                headers=headers
            )
            
            if response.status_code == 200:
                workflows = response.json()
                return [wf for wf in workflows if wf.get('active', False)]
            else:
                logger.error(f"Failed to list workflows: {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"Error listing workflows: {str(e)}")
            return []
    
    def trigger_workflow(self, workflow_id: str, inputs: Dict[str, Any]) -> AutomationResult:
        """
        Trigger a specific workflow by ID
        
        Args:
            workflow_id: N8N workflow ID
            inputs: Input data
            
        Returns:
            AutomationResult
        """
        start_time = datetime.now()
        
        try:
            headers = {
                'Authorization': f'Bearer {self.n8n_api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{self.n8n_base_url}/rest/workflows/{workflow_id}/execute",
                headers=headers,
                json=inputs
            )
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            if response.status_code == 200:
                result_data = response.json()
                return AutomationResult(
                    success=True,
                    workflow_id=workflow_id,
                    execution_id=result_data.get('execution_id', ''),
                    outputs=result_data.get('outputs', {}),
                    execution_time=execution_time
                )
            else:
                return AutomationResult(
                    success=False,
                    workflow_id=workflow_id,
                    execution_id="",
                    outputs={},
                    error=f"Workflow execution failed: {response.text}",
                    execution_time=execution_time
                )
                
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            return AutomationResult(
                success=False,
                workflow_id=workflow_id,
                execution_id="",
                outputs={},
                error=f"Workflow execution error: {str(e)}",
                execution_time=execution_time
            )
    
    def get_automation_stats(self) -> Dict[str, Any]:
        """
        Get automation statistics
        
        Returns:
            Statistics about automation usage
        """
        active_workflows = self.list_active_workflows()
        
        return {
            'total_blueprints': len(self.blueprints),
            'active_workflows': len(active_workflows),
            'categories': list(set(bp.category for bp in self.blueprints.values())),
            'n8n_connected': bool(self.n8n_base_url and self.n8n_api_key),
            'last_updated': datetime.now().isoformat()
        }

# Example usage and testing
if __name__ == "__main__":
    # Initialize automation agent
    agent = AutomationAgent()
    
    # List available blueprints
    print("Available Blueprints:")
    for blueprint in agent.list_blueprints():
        print(f"- {blueprint.name}: {blueprint.description}")
    
    # Get automation stats
    stats = agent.get_automation_stats()
    print(f"\nAutomation Stats: {stats}")
    
    # Example: Run lead enrichment
    if "Lead Enrichment Pipeline" in agent.blueprints:
        result = agent.run_blueprint("Lead Enrichment Pipeline", {
            "email": "test@example.com",
            "company_name": "Example Corp",
            "linkedin_url": "https://linkedin.com/company/example"
        })
        print(f"\nLead Enrichment Result: {result}")
