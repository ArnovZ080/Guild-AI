"""
Automation Platform Connectors
Handles integration with n8n, Make (Integromat), and Zapier for workflow automation
"""

import requests
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from ..core.schemas import DataRoom, DocumentMeta
from ..core.storage import Connector

logger = logging.getLogger(__name__)

class N8NConnector(Connector):
    provider: str = "n8n"
    
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'X-N8N-API-KEY': api_key,
            'Content-Type': 'application/json'
        })
    
    def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to n8n API"""
        try:
            url = f"{self.base_url}/api/v1/{endpoint}"
            response = self.session.request(method, url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"n8n API request failed: {e}")
            raise
    
    def get_workflows(self) -> List[Dict]:
        """Get all workflows"""
        try:
            response = self._make_request("workflows")
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch n8n workflows: {e}")
            return []
    
    def get_workflow(self, workflow_id: str) -> Dict:
        """Get a specific workflow"""
        try:
            response = self._make_request(f"workflows/{workflow_id}")
            return response
        except Exception as e:
            logger.error(f"Failed to fetch n8n workflow {workflow_id}: {e}")
            return {}
    
    def create_workflow(self, name: str, nodes: List[Dict], connections: Dict) -> Dict:
        """Create a new workflow"""
        try:
            data = {
                "name": name,
                "nodes": nodes,
                "connections": connections,
                "active": False,
                "settings": {}
            }
            response = self._make_request("workflows", method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to create n8n workflow: {e}")
            return {}
    
    def update_workflow(self, workflow_id: str, name: str = None, 
                       nodes: List[Dict] = None, connections: Dict = None,
                       active: bool = None) -> Dict:
        """Update an existing workflow"""
        try:
            data = {}
            if name:
                data['name'] = name
            if nodes:
                data['nodes'] = nodes
            if connections:
                data['connections'] = connections
            if active is not None:
                data['active'] = active
            
            response = self._make_request(f"workflows/{workflow_id}", method='PUT', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to update n8n workflow {workflow_id}: {e}")
            return {}
    
    def activate_workflow(self, workflow_id: str) -> Dict:
        """Activate a workflow"""
        try:
            response = self._make_request(f"workflows/{workflow_id}/activate", method='POST')
            return response
        except Exception as e:
            logger.error(f"Failed to activate n8n workflow {workflow_id}: {e}")
            return {}
    
    def deactivate_workflow(self, workflow_id: str) -> Dict:
        """Deactivate a workflow"""
        try:
            response = self._make_request(f"workflows/{workflow_id}/deactivate", method='POST')
            return response
        except Exception as e:
            logger.error(f"Failed to deactivate n8n workflow {workflow_id}: {e}")
            return {}
    
    def execute_workflow(self, workflow_id: str, input_data: Dict = None) -> Dict:
        """Execute a workflow manually"""
        try:
            data = {"input": input_data} if input_data else {}
            response = self._make_request(f"workflows/{workflow_id}/execute", method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to execute n8n workflow {workflow_id}: {e}")
            return {}
    
    def get_executions(self, workflow_id: str = None, limit: int = 50) -> List[Dict]:
        """Get workflow executions"""
        try:
            endpoint = "executions"
            params = {'limit': limit}
            if workflow_id:
                params['workflowId'] = workflow_id
            
            response = self._make_request(endpoint, params=params)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch n8n executions: {e}")
            return []
    
    def get_credentials(self) -> List[Dict]:
        """Get all credentials"""
        try:
            response = self._make_request("credentials")
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch n8n credentials: {e}")
            return []
    
    def create_credential(self, name: str, type: str, data: Dict) -> Dict:
        """Create a new credential"""
        try:
            credential_data = {
                "name": name,
                "type": type,
                "data": data
            }
            response = self._make_request("credentials", method='POST', data=credential_data)
            return response
        except Exception as e:
            logger.error(f"Failed to create n8n credential: {e}")
            return {}
    
    def get_webhooks(self) -> List[Dict]:
        """Get all webhooks"""
        try:
            response = self._make_request("webhooks")
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch n8n webhooks: {e}")
            return []
    
    def create_webhook(self, workflow_id: str, http_method: str = 'POST', 
                      path: str = None) -> Dict:
        """Create a webhook for a workflow"""
        try:
            data = {
                "workflowId": workflow_id,
                "httpMethod": http_method
            }
            if path:
                data['path'] = path
            
            response = self._make_request("webhooks", method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to create n8n webhook: {e}")
            return {}
    
    def list_documents(self, data_room: DataRoom) -> List[DocumentMeta]:
        """List n8n-related documents (workflows, executions, credentials)"""
        documents = []
        
        try:
            # Get workflows
            workflows = self.get_workflows()
            for workflow in workflows:
                documents.append(DocumentMeta(
                    id=f"n8n_workflow_{workflow.get('id')}",
                    title=f"n8n Workflow: {workflow.get('name')}",
                    source=f"n8n://workflow/{workflow.get('id')}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'workflow',
                        'workflow_id': workflow.get('id'),
                        'name': workflow.get('name'),
                        'active': workflow.get('active'),
                        'created_at': workflow.get('createdAt'),
                        'updated_at': workflow.get('updatedAt')
                    }
                ))
            
            # Get credentials
            credentials = self.get_credentials()
            for credential in credentials:
                documents.append(DocumentMeta(
                    id=f"n8n_credential_{credential.get('id')}",
                    title=f"n8n Credential: {credential.get('name')}",
                    source=f"n8n://credential/{credential.get('id')}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'credential',
                        'credential_id': credential.get('id'),
                        'name': credential.get('name'),
                        'type': credential.get('type')
                    }
                ))
                
        except Exception as e:
            logger.error(f"Failed to list n8n documents: {e}")
        
        return documents
    
    def fetch_content(self, doc: DocumentMeta) -> str:
        """Fetch content for a specific n8n document"""
        try:
            doc_type = doc.metadata.get('type')
            
            if doc_type == 'workflow':
                workflow_id = doc.metadata['workflow_id']
                workflow = self.get_workflow(workflow_id)
                executions = self.get_executions(workflow_id, limit=5)
                return f"n8n Workflow:\n{workflow}\n\nRecent Executions:\n{executions}"
            
            elif doc_type == 'credential':
                credential_id = doc.metadata['credential_id']
                credentials = self.get_credentials()
                credential = next((c for c in credentials if c.get('id') == credential_id), {})
                return f"n8n Credential:\n{credential}"
            
            return ""
            
        except Exception as e:
            logger.error(f"Failed to fetch n8n content: {e}")
            return ""
    
    def validate_connection(self) -> bool:
        """Validate the n8n API connection"""
        try:
            response = self._make_request("workflows")
            return 'data' in response
        except Exception as e:
            logger.error(f"n8n connection validation failed: {e}")
            return False


class MakeConnector(Connector):
    provider: str = "make"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.make.com/api/v2"
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Token {api_key}',
            'Content-Type': 'application/json'
        })
    
    def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Make API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = self.session.request(method, url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Make API request failed: {e}")
            raise
    
    def get_scenarios(self) -> List[Dict]:
        """Get all scenarios"""
        try:
            response = self._make_request("scenarios")
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch Make scenarios: {e}")
            return []
    
    def get_scenario(self, scenario_id: str) -> Dict:
        """Get a specific scenario"""
        try:
            response = self._make_request(f"scenarios/{scenario_id}")
            return response
        except Exception as e:
            logger.error(f"Failed to fetch Make scenario {scenario_id}: {e}")
            return {}
    
    def create_scenario(self, name: str, blueprint: Dict) -> Dict:
        """Create a new scenario"""
        try:
            data = {
                "name": name,
                "blueprint": blueprint
            }
            response = self._make_request("scenarios", method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to create Make scenario: {e}")
            return {}
    
    def run_scenario(self, scenario_id: str, input_data: Dict = None) -> Dict:
        """Run a scenario"""
        try:
            data = {"input": input_data} if input_data else {}
            response = self._make_request(f"scenarios/{scenario_id}/runs", method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to run Make scenario {scenario_id}: {e}")
            return {}
    
    def get_runs(self, scenario_id: str = None, limit: int = 50) -> List[Dict]:
        """Get scenario runs"""
        try:
            endpoint = "runs"
            params = {'limit': limit}
            if scenario_id:
                params['scenario'] = scenario_id
            
            response = self._make_request(endpoint, params=params)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch Make runs: {e}")
            return []
    
    def get_connections(self) -> List[Dict]:
        """Get all connections"""
        try:
            response = self._make_request("connections")
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch Make connections: {e}")
            return []
    
    def create_connection(self, service: str, name: str, data: Dict) -> Dict:
        """Create a new connection"""
        try:
            connection_data = {
                "service": service,
                "name": name,
                "data": data
            }
            response = self._make_request("connections", method='POST', data=connection_data)
            return response
        except Exception as e:
            logger.error(f"Failed to create Make connection: {e}")
            return {}
    
    def list_documents(self, data_room: DataRoom) -> List[DocumentMeta]:
        """List Make-related documents (scenarios, runs, connections)"""
        documents = []
        
        try:
            # Get scenarios
            scenarios = self.get_scenarios()
            for scenario in scenarios:
                documents.append(DocumentMeta(
                    id=f"make_scenario_{scenario.get('id')}",
                    title=f"Make Scenario: {scenario.get('name')}",
                    source=f"make://scenario/{scenario.get('id')}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'scenario',
                        'scenario_id': scenario.get('id'),
                        'name': scenario.get('name'),
                        'status': scenario.get('status')
                    }
                ))
            
            # Get connections
            connections = self.get_connections()
            for connection in connections:
                documents.append(DocumentMeta(
                    id=f"make_connection_{connection.get('id')}",
                    title=f"Make Connection: {connection.get('name')}",
                    source=f"make://connection/{connection.get('id')}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'connection',
                        'connection_id': connection.get('id'),
                        'name': connection.get('name'),
                        'service': connection.get('service')
                    }
                ))
                
        except Exception as e:
            logger.error(f"Failed to list Make documents: {e}")
        
        return documents
    
    def fetch_content(self, doc: DocumentMeta) -> str:
        """Fetch content for a specific Make document"""
        try:
            doc_type = doc.metadata.get('type')
            
            if doc_type == 'scenario':
                scenario_id = doc.metadata['scenario_id']
                scenario = self.get_scenario(scenario_id)
                runs = self.get_runs(scenario_id, limit=5)
                return f"Make Scenario:\n{scenario}\n\nRecent Runs:\n{runs}"
            
            elif doc_type == 'connection':
                connection_id = doc.metadata['connection_id']
                connections = self.get_connections()
                connection = next((c for c in connections if c.get('id') == connection_id), {})
                return f"Make Connection:\n{connection}"
            
            return ""
            
        except Exception as e:
            logger.error(f"Failed to fetch Make content: {e}")
            return ""
    
    def validate_connection(self) -> bool:
        """Validate the Make API connection"""
        try:
            response = self._make_request("scenarios")
            return 'data' in response
        except Exception as e:
            logger.error(f"Make connection validation failed: {e}")
            return False


class ZapierConnector(Connector):
    provider: str = "zapier"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.zapier.com/v1"
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
    
    def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Zapier API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = self.session.request(method, url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Zapier API request failed: {e}")
            raise
    
    def get_zaps(self) -> List[Dict]:
        """Get all Zaps"""
        try:
            response = self._make_request("zaps")
            return response.get('objects', [])
        except Exception as e:
            logger.error(f"Failed to fetch Zapier Zaps: {e}")
            return []
    
    def get_zap(self, zap_id: str) -> Dict:
        """Get a specific Zap"""
        try:
            response = self._make_request(f"zaps/{zap_id}")
            return response
        except Exception as e:
            logger.error(f"Failed to fetch Zapier Zap {zap_id}: {e}")
            return {}
    
    def create_zap(self, title: str, trigger: Dict, action: Dict) -> Dict:
        """Create a new Zap"""
        try:
            data = {
                "title": title,
                "trigger": trigger,
                "action": action
            }
            response = self._make_request("zaps", method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to create Zapier Zap: {e}")
            return {}
    
    def turn_on_zap(self, zap_id: str) -> Dict:
        """Turn on a Zap"""
        try:
            response = self._make_request(f"zaps/{zap_id}/turn-on", method='POST')
            return response
        except Exception as e:
            logger.error(f"Failed to turn on Zapier Zap {zap_id}: {e}")
            return {}
    
    def turn_off_zap(self, zap_id: str) -> Dict:
        """Turn off a Zap"""
        try:
            response = self._make_request(f"zaps/{zap_id}/turn-off", method='POST')
            return response
        except Exception as e:
            logger.error(f"Failed to turn off Zapier Zap {zap_id}: {e}")
            return {}
    
    def get_zap_runs(self, zap_id: str, limit: int = 50) -> List[Dict]:
        """Get Zap runs"""
        try:
            response = self._make_request(f"zaps/{zap_id}/runs", params={'limit': limit})
            return response.get('objects', [])
        except Exception as e:
            logger.error(f"Failed to fetch Zapier Zap runs: {e}")
            return []
    
    def get_apps(self) -> List[Dict]:
        """Get available apps"""
        try:
            response = self._make_request("apps")
            return response.get('objects', [])
        except Exception as e:
            logger.error(f"Failed to fetch Zapier apps: {e}")
            return []
    
    def get_app_triggers(self, app_id: str) -> List[Dict]:
        """Get triggers for an app"""
        try:
            response = self._make_request(f"apps/{app_id}/triggers")
            return response.get('objects', [])
        except Exception as e:
            logger.error(f"Failed to fetch Zapier app triggers: {e}")
            return []
    
    def get_app_actions(self, app_id: str) -> List[Dict]:
        """Get actions for an app"""
        try:
            response = self._make_request(f"apps/{app_id}/actions")
            return response.get('objects', [])
        except Exception as e:
            logger.error(f"Failed to fetch Zapier app actions: {e}")
            return []
    
    def list_documents(self, data_room: DataRoom) -> List[DocumentMeta]:
        """List Zapier-related documents (Zaps, apps)"""
        documents = []
        
        try:
            # Get Zaps
            zaps = self.get_zaps()
            for zap in zaps:
                documents.append(DocumentMeta(
                    id=f"zapier_zap_{zap.get('id')}",
                    title=f"Zapier Zap: {zap.get('title')}",
                    source=f"zapier://zap/{zap.get('id')}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'zap',
                        'zap_id': zap.get('id'),
                        'title': zap.get('title'),
                        'status': zap.get('status')
                    }
                ))
            
            # Get apps
            apps = self.get_apps()
            for app in apps:
                documents.append(DocumentMeta(
                    id=f"zapier_app_{app.get('id')}",
                    title=f"Zapier App: {app.get('title')}",
                    source=f"zapier://app/{app.get('id')}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'app',
                        'app_id': app.get('id'),
                        'title': app.get('title'),
                        'description': app.get('description')
                    }
                ))
                
        except Exception as e:
            logger.error(f"Failed to list Zapier documents: {e}")
        
        return documents
    
    def fetch_content(self, doc: DocumentMeta) -> str:
        """Fetch content for a specific Zapier document"""
        try:
            doc_type = doc.metadata.get('type')
            
            if doc_type == 'zap':
                zap_id = doc.metadata['zap_id']
                zap = self.get_zap(zap_id)
                runs = self.get_zap_runs(zap_id, limit=5)
                return f"Zapier Zap:\n{zap}\n\nRecent Runs:\n{runs}"
            
            elif doc_type == 'app':
                app_id = doc.metadata['app_id']
                app = next((a for a in self.get_apps() if a.get('id') == app_id), {})
                triggers = self.get_app_triggers(app_id)
                actions = self.get_app_actions(app_id)
                return f"Zapier App:\n{app}\n\nTriggers:\n{triggers}\n\nActions:\n{actions}"
            
            return ""
            
        except Exception as e:
            logger.error(f"Failed to fetch Zapier content: {e}")
            return ""
    
    def validate_connection(self) -> bool:
        """Validate the Zapier API connection"""
        try:
            response = self._make_request("zaps")
            return 'objects' in response
        except Exception as e:
            logger.error(f"Zapier connection validation failed: {e}")
            return False
