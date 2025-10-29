"""
Onboarding module for Guild-AI

Provides guided setup and configuration for new users and integrations.
"""

from .connector_setup import GuidedConnectorSetup, guided_setup

__all__ = ["GuidedConnectorSetup", "guided_setup"]
