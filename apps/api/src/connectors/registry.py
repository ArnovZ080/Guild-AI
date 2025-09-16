# Import all connectors
from .google_drive import GoogleDriveConnector
from .dropbox import DropboxConnector
from .workspace import WorkspaceConnector
from .facebook import FacebookConnector
from .instagram import InstagramConnector
from .linkedin import LinkedInConnector
from .gmail import GmailConnector
from .whatsapp import WhatsAppConnector
from .messenger import MessengerConnector
from .automation_platforms import N8NConnector, MakeConnector, ZapierConnector
from .execution_layer import ExecutionLayer

REGISTRY = {
    # Storage connectors
    "google_drive": GoogleDriveConnector,
    "dropbox": DropboxConnector,
    "workspace": WorkspaceConnector,
    
    # Social media connectors
    "facebook": FacebookConnector,
    "instagram": InstagramConnector,
    "linkedin": LinkedInConnector,
    
    # Communication connectors
    "gmail": GmailConnector,
    "whatsapp": WhatsAppConnector,
    "messenger": MessengerConnector,
    
    # Automation platform connectors
    "n8n": N8NConnector,
    "make": MakeConnector,
    "zapier": ZapierConnector,
    
    # Execution layer
    "execution_layer": ExecutionLayer,
}

def register(name, connector):
    """Register a connector class or instance"""
    REGISTRY[name] = connector

def get_connector(name):
    """Get a connector class or instance"""
    return REGISTRY.get(name)

def get_available_connectors():
    """Get list of all available connector names"""
    return list(REGISTRY.keys())

def get_connector_categories():
    """Get connectors organized by category"""
    return {
        "storage": ["google_drive", "dropbox", "workspace"],
        "social_media": ["facebook", "instagram", "linkedin"],
        "communication": ["gmail", "whatsapp", "messenger"],
        "automation": ["n8n", "make", "zapier"],
        "orchestration": ["execution_layer"]
    }


