"""
Integration Module

This module provides integration utilities for connecting existing agents with
the enhanced orchestration system including:
- Agent integration adapters
- Capability mapping
- Backward compatibility
"""

from .agent_adapter import (
    AgentIntegrationAdapter, IntegratedAgent, AgentCapabilityMapping, AGENT_CAPABILITY_MAPPINGS,
    integrate_existing_agent, create_integrated_agent, auto_integrate
)

__all__ = [
    'AgentIntegrationAdapter', 'IntegratedAgent', 'AgentCapabilityMapping', 'AGENT_CAPABILITY_MAPPINGS',
    'integrate_existing_agent', 'create_integrated_agent', 'auto_integrate'
]
