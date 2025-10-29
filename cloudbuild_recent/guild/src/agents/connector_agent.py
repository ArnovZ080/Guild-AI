"""
Connector Agent - Manages integrations with external services and APIs
"""

import json
import os
import requests
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import base64
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class ConnectorConfig:
    """Configuration for a connector"""
    name: str
    category: str
    api_base_url: str
    auth_type: str  # 'api_key', 'oauth', 'bearer', 'basic'
    required_scopes: List[str]
    capabilities: List[str]
    status: str  # 'active', 'beta', 'planned'
    documentation_url: str

class ConnectorAgent:
    """
    Connector Agent for managing integrations with external services
    
    Handles authentication, API calls, and data synchronization
    across multiple business platforms and services.
    """
    
    def __init__(self, config_path: str = "guild/configs/connectors.json"):
        """
        Initialize the Connector Agent
        
        Args:
            config_path: Path to connector configuration file
        """
        self.config_path = config_path
        self.connectors = {}
        self.active_connections = {}
        self.load_connector_configs()
        
        logger.info(f"Connector Agent initialized with {len(self.connectors)} connectors")
    
    def load_connector_configs(self):
        """Load connector configurations from file"""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r') as f:
                    configs = json.load(f)
                    for name, config in configs.items():
                        self.connectors[name] = ConnectorConfig(**config)
            else:
                # Create default connector configurations
                self.create_default_configs()
        except Exception as e:
            logger.error(f"Failed to load connector configs: {e}")
            self.create_default_configs()
    
    def create_default_configs(self):
        """Create default connector configurations"""
        default_configs = {
            "asana": {
                "name": "Asana",
                "category": "project_management",
                "api_base_url": "https://app.asana.com/api/1.0",
                "auth_type": "bearer",
                "required_scopes": ["default"],
                "capabilities": ["tasks", "projects", "teams", "users"],
                "status": "active",
                "documentation_url": "https://developers.asana.com/docs"
            },
            "linear": {
                "name": "Linear",
                "category": "project_management",
                "api_base_url": "https://api.linear.app/graphql",
                "auth_type": "bearer",
                "required_scopes": ["read", "write"],
                "capabilities": ["issues", "projects", "teams", "users"],
                "status": "active",
                "documentation_url": "https://developers.linear.app/docs"
            },
            "monday": {
                "name": "Monday.com",
                "category": "project_management",
                "api_base_url": "https://api.monday.com/v2",
                "auth_type": "bearer",
                "required_scopes": ["me:read", "boards:read", "boards:write"],
                "capabilities": ["boards", "items", "columns", "users"],
                "status": "active",
                "documentation_url": "https://developer.monday.com/api-reference"
            },
            "notion": {
                "name": "Notion",
                "category": "productivity",
                "api_base_url": "https://api.notion.com/v1",
                "auth_type": "bearer",
                "required_scopes": ["read", "write"],
                "capabilities": ["pages", "databases", "blocks", "users"],
                "status": "active",
                "documentation_url": "https://developers.notion.com/docs"
            },
            "stripe": {
                "name": "Stripe",
                "category": "payments",
                "api_base_url": "https://api.stripe.com/v1",
                "auth_type": "bearer",
                "required_scopes": ["read", "write"],
                "capabilities": ["payments", "customers", "subscriptions", "invoices"],
                "status": "active",
                "documentation_url": "https://stripe.com/docs/api"
            },
            "square": {
                "name": "Square",
                "category": "payments",
                "api_base_url": "https://connect.squareup.com/v2",
                "auth_type": "bearer",
                "required_scopes": ["payments", "orders", "customers"],
                "capabilities": ["payments", "orders", "customers", "inventory"],
                "status": "active",
                "documentation_url": "https://developer.squareup.com/docs"
            },
            "paypal": {
                "name": "PayPal",
                "category": "payments",
                "api_base_url": "https://api-m.paypal.com/v1",
                "auth_type": "bearer",
                "required_scopes": ["https://uri.paypal.com/services/subscriptions"],
                "capabilities": ["payments", "orders", "subscriptions"],
                "status": "active",
                "documentation_url": "https://developer.paypal.com/docs/api"
            },
            "intercom": {
                "name": "Intercom",
                "category": "support",
                "api_base_url": "https://api.intercom.io",
                "auth_type": "bearer",
                "required_scopes": ["read", "write"],
                "capabilities": ["conversations", "contacts", "companies", "tags"],
                "status": "active",
                "documentation_url": "https://developers.intercom.com/docs"
            },
            "fireflies": {
                "name": "Fireflies",
                "category": "communication",
                "api_base_url": "https://api.fireflies.ai",
                "auth_type": "bearer",
                "required_scopes": ["read", "write"],
                "capabilities": ["transcripts", "meetings", "insights"],
                "status": "active",
                "documentation_url": "https://docs.fireflies.ai/api"
            },
            "canva": {
                "name": "Canva",
                "category": "design",
                "api_base_url": "https://api.canva.com/rest/v1",
                "auth_type": "bearer",
                "required_scopes": ["design:read", "design:write"],
                "capabilities": ["designs", "templates", "brands"],
                "status": "active",
                "documentation_url": "https://www.canva.com/developers/"
            },
            "cloudinary": {
                "name": "Cloudinary",
                "category": "media",
                "api_base_url": "https://api.cloudinary.com/v1_1",
                "auth_type": "api_key",
                "required_scopes": ["upload", "admin"],
                "capabilities": ["images", "videos", "transformations"],
                "status": "active",
                "documentation_url": "https://cloudinary.com/documentation"
            },
            "vercel": {
                "name": "Vercel",
                "category": "development",
                "api_base_url": "https://api.vercel.com",
                "auth_type": "bearer",
                "required_scopes": ["read", "write"],
                "capabilities": ["deployments", "projects", "domains"],
                "status": "active",
                "documentation_url": "https://vercel.com/docs/api"
            },
            "netlify": {
                "name": "Netlify",
                "category": "development",
                "api_base_url": "https://api.netlify.com/api/v1",
                "auth_type": "bearer",
                "required_scopes": ["read", "write"],
                "capabilities": ["sites", "deploys", "forms"],
                "status": "active",
                "documentation_url": "https://docs.netlify.com/api"
            },
            "sentry": {
                "name": "Sentry",
                "category": "development",
                "api_base_url": "https://sentry.io/api/0",
                "auth_type": "bearer",
                "required_scopes": ["read", "write"],
                "capabilities": ["issues", "projects", "teams"],
                "status": "active",
                "documentation_url": "https://docs.sentry.io/api"
            },
            "zapier": {
                "name": "Zapier",
                "category": "automation",
                "api_base_url": "https://hooks.zapier.com/hooks/catch",
                "auth_type": "webhook",
                "required_scopes": ["trigger", "action"],
                "capabilities": ["webhooks", "triggers", "actions"],
                "status": "active",
                "documentation_url": "https://zapier.com/developer"
            },
            "workato": {
                "name": "Workato",
                "category": "automation",
                "api_base_url": "https://www.workato.com/api",
                "auth_type": "bearer",
                "required_scopes": ["read", "write"],
                "capabilities": ["recipes", "connections", "jobs"],
                "status": "active",
                "documentation_url": "https://docs.workato.com/developing-connectors"
            }
        }
        
        # Save default configs
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        with open(self.config_path, 'w') as f:
            json.dump(default_configs, f, indent=2)
        
        # Load the saved configs
        for name, config in default_configs.items():
            self.connectors[name] = ConnectorConfig(**config)
    
    def get_available_connectors(self) -> List[Dict[str, Any]]:
        """Get list of available connectors"""
        return [
            {
                "id": name,
                "name": config.name,
                "category": config.category,
                "status": config.status,
                "capabilities": config.capabilities,
                "documentation_url": config.documentation_url
            }
            for name, config in self.connectors.items()
        ]
    
    def connect_service(self, service_name: str, credentials: Dict[str, str]) -> Dict[str, Any]:
        """
        Connect to an external service
        
        Args:
            service_name: Name of the service to connect to
            credentials: Authentication credentials
            
        Returns:
            Dictionary with connection results
        """
        try:
            if service_name not in self.connectors:
                return {
                    "success": False,
                    "error": f"Service '{service_name}' not found",
                    "message": "Service not available"
                }
            
            config = self.connectors[service_name]
            
            # Test the connection
            test_result = self.test_connection(service_name, credentials)
            
            if test_result["success"]:
                # Store the connection
                self.active_connections[service_name] = {
                    "config": config,
                    "credentials": credentials,
                    "connected_at": datetime.now().isoformat(),
                    "status": "active"
                }
                
                logger.info(f"Successfully connected to {service_name}")
                
                return {
                    "success": True,
                    "service": service_name,
                    "message": f"Successfully connected to {config.name}",
                    "capabilities": config.capabilities
                }
            else:
                return test_result
                
        except Exception as e:
            logger.error(f"Failed to connect to {service_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to connect to {service_name}"
            }
    
    def test_connection(self, service_name: str, credentials: Dict[str, str]) -> Dict[str, Any]:
        """
        Test connection to a service
        
        Args:
            service_name: Name of the service
            credentials: Authentication credentials
            
        Returns:
            Dictionary with test results
        """
        try:
            config = self.connectors[service_name]
            
            # Prepare headers based on auth type
            headers = self._prepare_headers(config, credentials)
            
            # Make a test API call
            test_url = self._get_test_url(config)
            
            response = requests.get(test_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": f"Connection to {config.name} successful"
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "message": f"Failed to connect to {config.name}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": f"Connection test failed for {service_name}"
            }
    
    def _prepare_headers(self, config: ConnectorConfig, credentials: Dict[str, str]) -> Dict[str, str]:
        """Prepare headers for API requests"""
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Guild-AI-Connector/1.0"
        }
        
        if config.auth_type == "bearer":
            headers["Authorization"] = f"Bearer {credentials.get('token')}"
        elif config.auth_type == "api_key":
            headers["Authorization"] = f"Bearer {credentials.get('api_key')}"
        elif config.auth_type == "basic":
            auth_string = f"{credentials.get('username')}:{credentials.get('password')}"
            encoded_auth = base64.b64encode(auth_string.encode()).decode()
            headers["Authorization"] = f"Basic {encoded_auth}"
        
        return headers
    
    def _get_test_url(self, config: ConnectorConfig) -> str:
        """Get test URL for connection testing"""
        if config.name == "Asana":
            return f"{config.api_base_url}/users/me"
        elif config.name == "Linear":
            return f"{config.api_base_url}"
        elif config.name == "Monday.com":
            return f"{config.api_base_url}"
        elif config.name == "Notion":
            return f"{config.api_base_url}/users/me"
        elif config.name == "Stripe":
            return f"{config.api_base_url}/account"
        elif config.name == "Square":
            return f"{config.api_base_url}/locations"
        elif config.name == "PayPal":
            return f"{config.api_base_url}/identity/oauth2/userinfo"
        elif config.name == "Intercom":
            return f"{config.api_base_url}/me"
        elif config.name == "Fireflies":
            return f"{config.api_base_url}/users/me"
        elif config.name == "Canva":
            return f"{config.api_base_url}/users/me"
        elif config.name == "Cloudinary":
            return f"{config.api_base_url}/resources"
        elif config.name == "Vercel":
            return f"{config.api_base_url}/user"
        elif config.name == "Netlify":
            return f"{config.api_base_url}/user"
        elif config.name == "Sentry":
            return f"{config.api_base_url}/organizations"
        else:
            return f"{config.api_base_url}/"
    
    def make_api_call(self, service_name: str, endpoint: str, method: str = "GET", 
                     data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Make an API call to a connected service
        
        Args:
            service_name: Name of the connected service
            endpoint: API endpoint to call
            method: HTTP method (GET, POST, PUT, DELETE)
            data: Request data for POST/PUT requests
            
        Returns:
            Dictionary with API response
        """
        try:
            if service_name not in self.active_connections:
                return {
                    "success": False,
                    "error": f"Service '{service_name}' not connected",
                    "message": "Service not connected"
                }
            
            connection = self.active_connections[service_name]
            config = connection["config"]
            credentials = connection["credentials"]
            
            # Prepare headers
            headers = self._prepare_headers(config, credentials)
            
            # Make the API call
            url = f"{config.api_base_url}/{endpoint.lstrip('/')}"
            
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return {
                    "success": False,
                    "error": f"Unsupported HTTP method: {method}",
                    "message": "Invalid HTTP method"
                }
            
            if response.status_code in [200, 201, 202]:
                return {
                    "success": True,
                    "data": response.json() if response.content else {},
                    "status_code": response.status_code,
                    "message": "API call successful"
                }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "status_code": response.status_code,
                    "message": "API call failed"
                }
                
        except Exception as e:
            logger.error(f"API call failed for {service_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": f"API call failed for {service_name}"
            }
    
    def get_connection_status(self) -> Dict[str, Any]:
        """Get status of all connections"""
        return {
            "total_connectors": len(self.connectors),
            "active_connections": len(self.active_connections),
            "connections": [
                {
                    "service": name,
                    "name": connection["config"].name,
                    "category": connection["config"].category,
                    "connected_at": connection["connected_at"],
                    "status": connection["status"]
                }
                for name, connection in self.active_connections.items()
            ]
        }
    
    def disconnect_service(self, service_name: str) -> Dict[str, Any]:
        """
        Disconnect from a service
        
        Args:
            service_name: Name of the service to disconnect
            
        Returns:
            Dictionary with disconnection results
        """
        try:
            if service_name in self.active_connections:
                del self.active_connections[service_name]
                logger.info(f"Disconnected from {service_name}")
                return {
                    "success": True,
                    "message": f"Disconnected from {service_name}"
                }
            else:
                return {
                    "success": False,
                    "error": f"Service '{service_name}' not connected",
                    "message": "Service not connected"
                }
        except Exception as e:
            logger.error(f"Failed to disconnect from {service_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to disconnect from {service_name}"
            }

# Example usage and testing
if __name__ == "__main__":
    # Initialize connector agent
    agent = ConnectorAgent()
    
    # Get available connectors
    connectors = agent.get_available_connectors()
    print(f"Available connectors: {len(connectors)}")
    
    # Test connection to a service (example with mock credentials)
    test_credentials = {
        "token": "test_token_here"
    }
    
    # This would be called with real credentials in production
    # result = agent.connect_service("asana", test_credentials)
    # print(f"Connection result: {result}")
    
    # Get connection status
    status = agent.get_connection_status()
    print(f"Connection status: {status}")
