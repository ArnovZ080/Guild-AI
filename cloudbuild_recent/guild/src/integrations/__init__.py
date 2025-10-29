"""
Guild-AI Integration System

This module provides a unified integration layer for all external platforms.
Connectors are registered and made available through a central registry.
"""

from .registry import register, get_connector, REGISTRY
from .workspace import WorkspaceConnector

# Import all connector modules
try:
    from . import accounting
    from . import social_platforms
    from . import ad_platforms
    from . import email_marketing
    from . import analytics
    from . import seo_tools
    from . import meetings
    from . import communications
    from . import productivity
    from . import ecommerce
    from . import intelligence
    from . import recruitment
    from . import meta_business_suite
    from . import zapier
    from . import n8n_connector
    from . import project_management
    from . import crm
    from . import payments
    from . import marketing_automation
    from . import comprehensive_connectors
    from . import extended_connectors
except ImportError as e:
    import logging
    logging.warning(f"Some integration modules failed to import: {e}")

# Register core connector
register("workspace", WorkspaceConnector())

# Export commonly used items
__all__ = [
    'register',
    'get_connector',
    'REGISTRY',
    'WorkspaceConnector',
    'accounting',
    'social_platforms',
    'ad_platforms',
    'email_marketing',
    'analytics',
    'seo_tools',
    'meetings',
    'communications',
    'productivity',
    'ecommerce',
    'intelligence',
    'recruitment',
    'meta_business_suite',
    'zapier',
    'n8n_connector',
    'project_management',
    'crm',
    'payments',
    'marketing_automation',
    'comprehensive_connectors',
    'extended_connectors',
]
