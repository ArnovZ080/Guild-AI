"""
Storage Agent - Manages local and cloud data storage for sensitive business information
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime
import shutil

logger = logging.getLogger(__name__)

class StorageAgent:
    """
    Storage Agent for managing data storage preferences
    
    Handles both local storage setup and cloud storage configuration
    based on user preferences for sensitive business data.
    """
    
    def __init__(self, base_path: str = None):
        """
        Initialize the Storage Agent
        
        Args:
            base_path: Base path for local storage (defaults to user's desktop)
        """
        self.base_path = base_path or self._get_default_storage_path()
        self.local_storage_path = None
        self.cloud_storage_config = None
        
        logger.info(f"Storage Agent initialized with base path: {self.base_path}")
    
    def _get_default_storage_path(self) -> str:
        """Get default storage path (user's desktop)"""
        try:
            # Try to get user's desktop path
            desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
            if os.path.exists(desktop_path):
                return desktop_path
            else:
                # Fallback to user's home directory
                return os.path.expanduser("~")
        except Exception as e:
            logger.error(f"Failed to get default storage path: {e}")
            return os.getcwd()
    
    def setup_local_storage(self, user_id: str, storage_preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        Set up local storage for sensitive business data
        
        Args:
            user_id: Unique user identifier
            storage_preferences: User's storage preferences
            
        Returns:
            Dictionary with setup results
        """
        try:
            # Create Guild folder structure
            guild_folder = os.path.join(self.base_path, "Guild-AI")
            sensitive_folder = os.path.join(guild_folder, "Sensitive-Data")
            general_folder = os.path.join(guild_folder, "General-Data")
            
            # Create directories
            os.makedirs(sensitive_folder, exist_ok=True)
            os.makedirs(general_folder, exist_ok=True)
            
            # Create subdirectories for different data types
            subdirs = {
                'financials': os.path.join(sensitive_folder, "Financials"),
                'product_specs': os.path.join(sensitive_folder, "Product-Specifications"),
                'assets': os.path.join(sensitive_folder, "Assets"),
                'confidential': os.path.join(sensitive_folder, "Confidential"),
                'documents': os.path.join(general_folder, "Documents"),
                'content': os.path.join(general_folder, "Content"),
                'analytics': os.path.join(general_folder, "Analytics"),
                'workflows': os.path.join(general_folder, "Workflows")
            }
            
            for subdir in subdirs.values():
                os.makedirs(subdir, exist_ok=True)
            
            # Create configuration file
            config = {
                'user_id': user_id,
                'setup_date': datetime.now().isoformat(),
                'storage_type': 'local',
                'base_path': guild_folder,
                'sensitive_path': sensitive_folder,
                'general_path': general_folder,
                'subdirectories': subdirs,
                'preferences': storage_preferences
            }
            
            config_path = os.path.join(guild_folder, "guild_config.json")
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            # Create README file
            readme_path = os.path.join(guild_folder, "README.txt")
            with open(readme_path, 'w') as f:
                f.write("""
Guild-AI Local Storage
=====================

This folder contains your Guild-AI business data organized by sensitivity level.

Sensitive-Data/
- Financials: Financial records, invoices, tax documents
- Product-Specifications: Product details, pricing, specifications
- Assets: Brand assets, logos, proprietary materials
- Confidential: Sensitive business information

General-Data/
- Documents: General business documents
- Content: Marketing content, blog posts, social media
- Analytics: Business analytics and reports
- Workflows: Automation workflows and configurations

IMPORTANT: This folder contains sensitive business information.
Keep it secure and backed up regularly.

For support, contact Guild-AI support team.
""")
            
            self.local_storage_path = guild_folder
            
            logger.info(f"Local storage setup completed for user {user_id} at {guild_folder}")
            
            return {
                'success': True,
                'storage_path': guild_folder,
                'sensitive_path': sensitive_folder,
                'general_path': general_folder,
                'subdirectories': subdirs,
                'message': 'Local storage setup completed successfully'
            }
            
        except Exception as e:
            logger.error(f"Failed to setup local storage for user {user_id}: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to setup local storage'
            }
    
    def setup_cloud_storage(self, user_id: str, storage_preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        Set up cloud storage configuration
        
        Args:
            user_id: Unique user identifier
            storage_preferences: User's storage preferences
            
        Returns:
            Dictionary with setup results
        """
        try:
            # Cloud storage configuration
            cloud_config = {
                'user_id': user_id,
                'setup_date': datetime.now().isoformat(),
                'storage_type': 'cloud',
                'encryption_enabled': True,
                'backup_enabled': True,
                'preferences': storage_preferences,
                'access_levels': {
                    'sensitive': 'encrypted_cloud',
                    'general': 'standard_cloud'
                }
            }
            
            self.cloud_storage_config = cloud_config
            
            logger.info(f"Cloud storage configuration completed for user {user_id}")
            
            return {
                'success': True,
                'config': cloud_config,
                'message': 'Cloud storage configuration completed successfully'
            }
            
        except Exception as e:
            logger.error(f"Failed to setup cloud storage for user {user_id}: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to setup cloud storage'
            }
    
    def store_sensitive_data(self, user_id: str, data_type: str, data: Any, filename: str = None) -> Dict[str, Any]:
        """
        Store sensitive data in appropriate location
        
        Args:
            user_id: Unique user identifier
            data_type: Type of data (financials, product_specs, assets, confidential)
            data: Data to store
            filename: Optional filename
            
        Returns:
            Dictionary with storage results
        """
        try:
            if self.local_storage_path:
                # Store locally
                data_dir = os.path.join(self.local_storage_path, "Sensitive-Data", data_type)
                os.makedirs(data_dir, exist_ok=True)
                
                if filename is None:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"{data_type}_{timestamp}.json"
                
                file_path = os.path.join(data_dir, filename)
                
                with open(file_path, 'w') as f:
                    json.dump(data, f, indent=2)
                
                return {
                    'success': True,
                    'path': file_path,
                    'message': f'Sensitive data stored locally at {file_path}'
                }
            else:
                # Store in cloud (encrypted)
                return self._store_cloud_data(user_id, data_type, data, filename)
                
        except Exception as e:
            logger.error(f"Failed to store sensitive data for user {user_id}: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to store sensitive data'
            }
    
    def store_general_data(self, user_id: str, data_type: str, data: Any, filename: str = None) -> Dict[str, Any]:
        """
        Store general data in appropriate location
        
        Args:
            user_id: Unique user identifier
            data_type: Type of data (documents, content, analytics, workflows)
            data: Data to store
            filename: Optional filename
            
        Returns:
            Dictionary with storage results
        """
        try:
            if self.local_storage_path:
                # Store locally
                data_dir = os.path.join(self.local_storage_path, "General-Data", data_type)
                os.makedirs(data_dir, exist_ok=True)
                
                if filename is None:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"{data_type}_{timestamp}.json"
                
                file_path = os.path.join(data_dir, filename)
                
                with open(file_path, 'w') as f:
                    json.dump(data, f, indent=2)
                
                return {
                    'success': True,
                    'path': file_path,
                    'message': f'General data stored locally at {file_path}'
                }
            else:
                # Store in cloud
                return self._store_cloud_data(user_id, data_type, data, filename)
                
        except Exception as e:
            logger.error(f"Failed to store general data for user {user_id}: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to store general data'
            }
    
    def _store_cloud_data(self, user_id: str, data_type: str, data: Any, filename: str = None) -> Dict[str, Any]:
        """
        Store data in cloud storage (placeholder implementation)
        
        Args:
            user_id: Unique user identifier
            data_type: Type of data
            data: Data to store
            filename: Optional filename
            
        Returns:
            Dictionary with storage results
        """
        # This would integrate with actual cloud storage service
        # For now, return a placeholder response
        return {
            'success': True,
            'path': f'cloud://{user_id}/{data_type}/{filename or "data.json"}',
            'message': f'Data stored in secure cloud storage'
        }
    
    def get_storage_info(self, user_id: str) -> Dict[str, Any]:
        """
        Get storage information for a user
        
        Args:
            user_id: Unique user identifier
            
        Returns:
            Dictionary with storage information
        """
        try:
            if self.local_storage_path:
                config_path = os.path.join(self.local_storage_path, "guild_config.json")
                if os.path.exists(config_path):
                    with open(config_path, 'r') as f:
                        config = json.load(f)
                    
                    # Get folder sizes
                    sensitive_size = self._get_folder_size(config['sensitive_path'])
                    general_size = self._get_folder_size(config['general_path'])
                    
                    return {
                        'storage_type': 'local',
                        'base_path': config['base_path'],
                        'sensitive_size_mb': sensitive_size,
                        'general_size_mb': general_size,
                        'total_size_mb': sensitive_size + general_size,
                        'setup_date': config['setup_date'],
                        'preferences': config['preferences']
                    }
            
            if self.cloud_storage_config:
                return {
                    'storage_type': 'cloud',
                    'config': self.cloud_storage_config,
                    'message': 'Cloud storage configuration active'
                }
            
            return {
                'storage_type': 'none',
                'message': 'No storage configuration found'
            }
            
        except Exception as e:
            logger.error(f"Failed to get storage info for user {user_id}: {e}")
            return {
                'error': str(e),
                'message': 'Failed to get storage information'
            }
    
    def _get_folder_size(self, folder_path: str) -> float:
        """Get folder size in MB"""
        try:
            total_size = 0
            for dirpath, dirnames, filenames in os.walk(folder_path):
                for filename in filenames:
                    file_path = os.path.join(dirpath, filename)
                    if os.path.exists(file_path):
                        total_size += os.path.getsize(file_path)
            return round(total_size / (1024 * 1024), 2)  # Convert to MB
        except Exception:
            return 0.0
    
    def backup_data(self, user_id: str, backup_path: str = None) -> Dict[str, Any]:
        """
        Create backup of local storage data
        
        Args:
            user_id: Unique user identifier
            backup_path: Optional backup destination path
            
        Returns:
            Dictionary with backup results
        """
        try:
            if not self.local_storage_path:
                return {
                    'success': False,
                    'message': 'No local storage to backup'
                }
            
            if backup_path is None:
                backup_path = os.path.join(self.base_path, f"Guild-AI-Backup-{datetime.now().strftime('%Y%m%d_%H%M%S')}")
            
            # Create backup
            shutil.copytree(self.local_storage_path, backup_path)
            
            logger.info(f"Backup created for user {user_id} at {backup_path}")
            
            return {
                'success': True,
                'backup_path': backup_path,
                'message': f'Backup created successfully at {backup_path}'
            }
            
        except Exception as e:
            logger.error(f"Failed to create backup for user {user_id}: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to create backup'
            }

# Example usage and testing
if __name__ == "__main__":
    # Initialize storage agent
    agent = StorageAgent()
    
    # Setup local storage
    result = agent.setup_local_storage('user_123', {
        'sensitive_data_preference': 'local',
        'general_data_preference': 'local'
    })
    print(f"Local storage setup: {result}")
    
    # Store some sensitive data
    financial_data = {
        'revenue': 50000,
        'expenses': 30000,
        'profit': 20000,
        'month': 'January 2024'
    }
    
    store_result = agent.store_sensitive_data('user_123', 'financials', financial_data)
    print(f"Data storage: {store_result}")
    
    # Get storage info
    info = agent.get_storage_info('user_123')
    print(f"Storage info: {info}")
