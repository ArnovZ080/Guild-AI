"""
Connector Data Integration System for Guild-AI
Provides real-time data synchronization between connectors and Customer Dashboard.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

# Import connector system
try:
    from apps.api.src.connectors.registry import REGISTRY
    from apps.api.src.core.schemas import ConnectorCredential
    CONNECTOR_SYSTEM_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Connector system not available: {e}")
    CONNECTOR_SYSTEM_AVAILABLE = False

class DataSourceType(Enum):
    """Types of data sources from connectors"""
    CRM_CONTACTS = "crm_contacts"
    CRM_COMPANIES = "crm_companies"
    CRM_DEALS = "crm_deals"
    CRM_TICKETS = "crm_tickets"
    SOCIAL_POSTS = "social_posts"
    SOCIAL_INSIGHTS = "social_insights"
    EMAIL_CONVERSATIONS = "email_conversations"
    MESSAGING_CONVERSATIONS = "messaging_conversations"
    PAYMENT_TRANSACTIONS = "payment_transactions"
    CUSTOMER_SUBSCRIPTIONS = "customer_subscriptions"
    SUPPORT_TICKETS = "support_tickets"
    MARKETING_CAMPAIGNS = "marketing_campaigns"

class SyncStatus(Enum):
    """Data synchronization status"""
    PENDING = "pending"
    SYNCING = "syncing"
    COMPLETED = "completed"
    FAILED = "failed"
    RATE_LIMITED = "rate_limited"

@dataclass
class ConnectorDataSource:
    """Data source configuration for a connector"""
    connector_id: str
    data_source_type: DataSourceType
    sync_interval: int  # seconds
    last_sync: Optional[datetime] = None
    sync_status: SyncStatus = SyncStatus.PENDING
    credentials: Optional[Dict[str, Any]] = None
    mapping_config: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None

@dataclass
class CustomerDataPoint:
    """Standardized customer data point from connectors"""
    source_connector: str
    source_type: DataSourceType
    customer_id: str
    data_type: str
    raw_data: Dict[str, Any]
    processed_data: Dict[str, Any]
    timestamp: datetime
    sync_id: str

class ConnectorDataIntegrator:
    """
    Integrates connector data with Customer Dashboard and autonomous workflows.
    """
    
    def __init__(self):
        self.data_sources: Dict[str, ConnectorDataSource] = {}
        self.customer_data_cache: Dict[str, List[CustomerDataPoint]] = {}
        self.sync_tasks: Dict[str, asyncio.Task] = {}
        self.sync_history: List[Dict[str, Any]] = []
        
        # Data mapping configurations for different connectors
        self.connector_mappings = self._initialize_connector_mappings()
        
        # Initialize data sources
        self._initialize_data_sources()
    
    def _initialize_connector_mappings(self) -> Dict[str, Dict[str, Any]]:
        """Initialize data field mappings for different connectors"""
        return {
            "hubspot": {
                "contacts": {
                    "customer_id": "id",
                    "name": "properties.firstname + ' ' + properties.lastname",
                    "email": "properties.email",
                    "company": "properties.company",
                    "phone": "properties.phone",
                    "created_date": "properties.createdate",
                    "last_contacted": "properties.lastcontacted",
                    "lifecycle_stage": "properties.lifecyclestage",
                    "lead_status": "properties.hs_lead_status",
                    "tags": "properties.hs_tag"
                },
                "companies": {
                    "company_id": "id",
                    "name": "properties.name",
                    "domain": "properties.domain",
                    "industry": "properties.industry",
                    "size": "properties.numberofemployees",
                    "created_date": "properties.createdate"
                },
                "deals": {
                    "deal_id": "id",
                    "deal_name": "properties.dealname",
                    "amount": "properties.amount",
                    "stage": "properties.dealstage",
                    "close_date": "properties.closedate",
                    "pipeline": "properties.pipeline"
                },
                "tickets": {
                    "ticket_id": "id",
                    "subject": "properties.subject",
                    "content": "properties.content",
                    "status": "properties.hs_ticket_priority",
                    "created_date": "properties.createdate",
                    "last_modified": "properties.lastmodifieddate"
                }
            },
            "salesforce": {
                "contacts": {
                    "customer_id": "Id",
                    "name": "Name",
                    "email": "Email",
                    "phone": "Phone",
                    "account": "Account.Name",
                    "created_date": "CreatedDate",
                    "last_modified": "LastModifiedDate"
                },
                "leads": {
                    "lead_id": "Id",
                    "name": "Name",
                    "email": "Email",
                    "company": "Company",
                    "status": "Status",
                    "source": "LeadSource",
                    "created_date": "CreatedDate"
                },
                "opportunities": {
                    "opportunity_id": "Id",
                    "name": "Name",
                    "amount": "Amount",
                    "stage": "StageName",
                    "close_date": "CloseDate",
                    "account": "Account.Name"
                }
            },
            "intercom": {
                "contacts": {
                    "customer_id": "id",
                    "name": "name",
                    "email": "email",
                    "phone": "phone",
                    "created_at": "created_at",
                    "last_seen": "last_seen_at",
                    "tags": "tags"
                },
                "conversations": {
                    "conversation_id": "id",
                    "subject": "conversation_message.subject",
                    "content": "conversation_message.body",
                    "status": "state",
                    "created_at": "created_at",
                    "updated_at": "updated_at"
                }
            },
            "facebook": {
                "pages": {
                    "page_id": "id",
                    "name": "name",
                    "followers": "followers_count",
                    "posts_count": "posts_count"
                },
                "posts": {
                    "post_id": "id",
                    "message": "message",
                    "created_time": "created_time",
                    "likes": "likes.summary.total_count",
                    "comments": "comments.summary.total_count",
                    "shares": "shares.count"
                }
            },
            "instagram": {
                "posts": {
                    "post_id": "id",
                    "caption": "caption",
                    "media_type": "media_type",
                    "timestamp": "timestamp",
                    "likes": "like_count",
                    "comments": "comments_count"
                }
            },
            "linkedin": {
                "posts": {
                    "post_id": "id",
                    "text": "text",
                    "created_time": "created_time",
                    "likes": "numLikes",
                    "comments": "numComments",
                    "shares": "numShares"
                }
            },
            "gmail": {
                "emails": {
                    "email_id": "id",
                    "subject": "subject",
                    "sender": "sender",
                    "recipient": "recipient",
                    "body": "body",
                    "date": "date",
                    "labels": "labels"
                }
            },
            "stripe": {
                "customers": {
                    "customer_id": "id",
                    "email": "email",
                    "name": "name",
                    "created": "created",
                    "subscriptions": "subscriptions.data"
                },
                "subscriptions": {
                    "subscription_id": "id",
                    "customer": "customer",
                    "status": "status",
                    "current_period_start": "current_period_start",
                    "current_period_end": "current_period_end",
                    "plan": "items.data[0].plan.nickname"
                }
            }
        }
    
    def _initialize_data_sources(self):
        """Initialize data sources for connected connectors"""
        # This would be populated from the actual connected services
        # For now, we'll create example configurations
        
        if CONNECTOR_SYSTEM_AVAILABLE:
            # Get connected services from the connector registry
            for connector_id, connector_class in REGISTRY.items():
                if connector_id in self.connector_mappings:
                    self._add_connector_data_sources(connector_id)
    
    def _add_connector_data_sources(self, connector_id: str):
        """Add data sources for a specific connector"""
        mappings = self.connector_mappings.get(connector_id, {})
        
        for data_type, mapping in mappings.items():
            data_source_type = self._map_connector_data_type(connector_id, data_type)
            if data_source_type:
                source_id = f"{connector_id}_{data_type}"
                self.data_sources[source_id] = ConnectorDataSource(
                    connector_id=connector_id,
                    data_source_type=data_source_type,
                    sync_interval=300,  # 5 minutes default
                    mapping_config=mapping
                )
    
    def _map_connector_data_type(self, connector_id: str, data_type: str) -> Optional[DataSourceType]:
        """Map connector-specific data types to standardized data source types"""
        mapping = {
            "hubspot": {
                "contacts": DataSourceType.CRM_CONTACTS,
                "companies": DataSourceType.CRM_COMPANIES,
                "deals": DataSourceType.CRM_DEALS,
                "tickets": DataSourceType.CRM_TICKETS
            },
            "salesforce": {
                "contacts": DataSourceType.CRM_CONTACTS,
                "leads": DataSourceType.CRM_CONTACTS,
                "opportunities": DataSourceType.CRM_DEALS
            },
            "intercom": {
                "contacts": DataSourceType.CRM_CONTACTS,
                "conversations": DataSourceType.SUPPORT_TICKETS
            },
            "facebook": {
                "pages": DataSourceType.SOCIAL_INSIGHTS,
                "posts": DataSourceType.SOCIAL_POSTS
            },
            "instagram": {
                "posts": DataSourceType.SOCIAL_POSTS
            },
            "linkedin": {
                "posts": DataSourceType.SOCIAL_POSTS
            },
            "gmail": {
                "emails": DataSourceType.EMAIL_CONVERSATIONS
            },
            "stripe": {
                "customers": DataSourceType.CRM_CONTACTS,
                "subscriptions": DataSourceType.CUSTOMER_SUBSCRIPTIONS
            }
        }
        
        return mapping.get(connector_id, {}).get(data_type)
    
    async def start_data_sync(self, source_id: Optional[str] = None):
        """Start data synchronization for specified source or all sources"""
        if source_id:
            sources_to_sync = [source_id] if source_id in self.data_sources else []
        else:
            sources_to_sync = list(self.data_sources.keys())
        
        for source_id in sources_to_sync:
            if source_id not in self.sync_tasks or self.sync_tasks[source_id].done():
                self.sync_tasks[source_id] = asyncio.create_task(
                    self._sync_data_source(source_id)
                )
    
    async def _sync_data_source(self, source_id: str):
        """Sync data from a specific connector data source"""
        try:
            data_source = self.data_sources[source_id]
            data_source.sync_status = SyncStatus.SYNCING
            
            # Get connector instance
            if CONNECTOR_SYSTEM_AVAILABLE and data_source.connector_id in REGISTRY:
                connector_class = REGISTRY[data_source.connector_id]
                # This would be instantiated with proper credentials
                # connector = connector_class(credentials=data_source.credentials)
                
                # Simulate data fetching (in real implementation, this would call the connector)
                raw_data = await self._fetch_connector_data(data_source)
                
                # Process and standardize data
                processed_data = await self._process_connector_data(raw_data, data_source)
                
                # Store in cache
                await self._store_customer_data(processed_data, data_source)
                
                data_source.last_sync = datetime.now()
                data_source.sync_status = SyncStatus.COMPLETED
                
                # Log sync success
                self.sync_history.append({
                    "source_id": source_id,
                    "status": "success",
                    "timestamp": datetime.now(),
                    "records_synced": len(processed_data)
                })
                
            else:
                raise Exception(f"Connector {data_source.connector_id} not available")
                
        except Exception as e:
            logging.error(f"Failed to sync data source {source_id}: {e}")
            self.data_sources[source_id].sync_status = SyncStatus.FAILED
            
            self.sync_history.append({
                "source_id": source_id,
                "status": "failed",
                "timestamp": datetime.now(),
                "error": str(e)
            })
    
    async def _fetch_connector_data(self, data_source: ConnectorDataSource) -> List[Dict[str, Any]]:
        """Fetch raw data from connector (simulated for now)"""
        # In real implementation, this would call the actual connector API
        # For now, we'll return mock data based on the connector type
        
        mock_data = {
            "hubspot": {
                "contacts": [
                    {
                        "id": "contact_001",
                        "properties": {
                            "firstname": "John",
                            "lastname": "Doe",
                            "email": "john.doe@example.com",
                            "company": "Acme Corp",
                            "phone": "+1-555-0123",
                            "createdate": "2024-01-15T10:30:00Z",
                            "lifecyclestage": "customer"
                        }
                    },
                    {
                        "id": "contact_002", 
                        "properties": {
                            "firstname": "Jane",
                            "lastname": "Smith",
                            "email": "jane.smith@techstart.com",
                            "company": "TechStart Inc",
                            "phone": "+1-555-0124",
                            "createdate": "2024-01-10T14:20:00Z",
                            "lifecyclestage": "lead"
                        }
                    }
                ]
            },
            "salesforce": {
                "contacts": [
                    {
                        "Id": "sf_contact_001",
                        "Name": "Bob Johnson",
                        "Email": "bob.johnson@enterprise.com",
                        "Phone": "+1-555-0125",
                        "Account": {"Name": "Enterprise Solutions"},
                        "CreatedDate": "2024-01-12T09:15:00Z"
                    }
                ]
            },
            "stripe": {
                "customers": [
                    {
                        "id": "cus_stripe_001",
                        "email": "customer@stripe.com",
                        "name": "Stripe Customer",
                        "created": 1705329600,
                        "subscriptions": {
                            "data": [
                                {
                                    "id": "sub_001",
                                    "status": "active",
                                    "current_period_start": 1705329600,
                                    "current_period_end": 1708008000
                                }
                            ]
                        }
                    }
                ]
            }
        }
        
        connector_data = mock_data.get(data_source.connector_id, {}).get(
            data_source.mapping_config.get("data_type", "contacts"), []
        )
        
        return connector_data
    
    async def _process_connector_data(self, raw_data: List[Dict[str, Any]], data_source: ConnectorDataSource) -> List[CustomerDataPoint]:
        """Process and standardize connector data"""
        processed_data = []
        mapping_config = data_source.mapping_config
        
        for record in raw_data:
            # Apply field mapping
            processed_record = {}
            for target_field, source_field in mapping_config.items():
                if target_field != "data_type":
                    processed_record[target_field] = self._extract_field_value(record, source_field)
            
            # Create standardized data point
            customer_id = processed_record.get("customer_id", f"unknown_{uuid.uuid4().hex[:8]}")
            
            data_point = CustomerDataPoint(
                source_connector=data_source.connector_id,
                source_type=data_source.data_source_type,
                customer_id=customer_id,
                data_type=data_source.data_source_type.value,
                raw_data=record,
                processed_data=processed_record,
                timestamp=datetime.now(),
                sync_id=str(uuid.uuid4())
            )
            
            processed_data.append(data_point)
        
        return processed_data
    
    def _extract_field_value(self, record: Dict[str, Any], field_path: str) -> Any:
        """Extract value from nested record using dot notation"""
        try:
            parts = field_path.split('.')
            value = record
            
            for part in parts:
                if isinstance(value, dict):
                    value = value.get(part)
                elif isinstance(value, list) and part.isdigit():
                    value = value[int(part)]
                else:
                    return None
            
            return value
        except (KeyError, IndexError, TypeError):
            return None
    
    async def _store_customer_data(self, data_points: List[CustomerDataPoint], data_source: ConnectorDataSource):
        """Store processed customer data in cache"""
        for data_point in data_points:
            if data_point.customer_id not in self.customer_data_cache:
                self.customer_data_cache[data_point.customer_id] = []
            
            self.customer_data_cache[data_point.customer_id].append(data_point)
    
    async def get_customer_data(self, customer_id: str, data_types: Optional[List[DataSourceType]] = None) -> Dict[str, List[CustomerDataPoint]]:
        """Get customer data from all connected sources"""
        customer_data = self.customer_data_cache.get(customer_id, [])
        
        if data_types:
            filtered_data = {}
            for data_point in customer_data:
                if data_point.source_type in data_types:
                    if data_point.source_type.value not in filtered_data:
                        filtered_data[data_point.source_type.value] = []
                    filtered_data[data_point.source_type.value].append(data_point)
            return filtered_data
        
        # Group by data type
        grouped_data = {}
        for data_point in customer_data:
            if data_point.source_type.value not in grouped_data:
                grouped_data[data_point.source_type.value] = []
            grouped_data[data_point.source_type.value].append(data_point)
        
        return grouped_data
    
    async def get_customer_profile(self, customer_id: str) -> Dict[str, Any]:
        """Get comprehensive customer profile from all connected sources"""
        all_data = await self.get_customer_data(customer_id)
        
        profile = {
            "customer_id": customer_id,
            "basic_info": {},
            "crm_data": {},
            "social_data": {},
            "communication_data": {},
            "financial_data": {},
            "support_data": {},
            "last_updated": datetime.now().isoformat()
        }
        
        # Aggregate data by type
        for data_type, data_points in all_data.items():
            if data_type == DataSourceType.CRM_CONTACTS.value:
                profile["basic_info"].update(self._merge_crm_contacts(data_points))
                profile["crm_data"] = self._extract_crm_data(data_points)
            elif data_type == DataSourceType.SOCIAL_POSTS.value:
                profile["social_data"]["posts"] = [dp.processed_data for dp in data_points]
            elif data_type == DataSourceType.EMAIL_CONVERSATIONS.value:
                profile["communication_data"]["emails"] = [dp.processed_data for dp in data_points]
            elif data_type == DataSourceType.PAYMENT_TRANSACTIONS.value:
                profile["financial_data"]["transactions"] = [dp.processed_data for dp in data_points]
            elif data_type == DataSourceType.CUSTOMER_SUBSCRIPTIONS.value:
                profile["financial_data"]["subscriptions"] = [dp.processed_data for dp in data_points]
            elif data_type == DataSourceType.SUPPORT_TICKETS.value:
                profile["support_data"]["tickets"] = [dp.processed_data for dp in data_points]
        
        return profile
    
    def _merge_crm_contacts(self, data_points: List[CustomerDataPoint]) -> Dict[str, Any]:
        """Merge CRM contact data from multiple sources"""
        merged = {}
        
        for dp in data_points:
            processed = dp.processed_data
            # Merge non-empty fields, prioritizing more recent data
            for key, value in processed.items():
                if value and (key not in merged or dp.timestamp > merged.get(f"{key}_timestamp", datetime.min)):
                    merged[key] = value
                    merged[f"{key}_timestamp"] = dp.timestamp
                    merged[f"{key}_source"] = dp.source_connector
        
        # Clean up timestamp and source fields
        return {k: v for k, v in merged.items() if not k.endswith("_timestamp") and not k.endswith("_source")}
    
    def _extract_crm_data(self, data_points: List[CustomerDataPoint]) -> Dict[str, Any]:
        """Extract CRM-specific data"""
        crm_data = {
            "lifecycle_stage": None,
            "lead_score": None,
            "company": None,
            "tags": [],
            "last_contacted": None,
            "created_date": None
        }
        
        for dp in data_points:
            processed = dp.processed_data
            if processed.get("lifecycle_stage"):
                crm_data["lifecycle_stage"] = processed["lifecycle_stage"]
            if processed.get("lead_score"):
                crm_data["lead_score"] = processed["lead_score"]
            if processed.get("company"):
                crm_data["company"] = processed["company"]
            if processed.get("tags"):
                if isinstance(processed["tags"], list):
                    crm_data["tags"].extend(processed["tags"])
                else:
                    crm_data["tags"].append(processed["tags"])
            if processed.get("last_contacted"):
                crm_data["last_contacted"] = processed["last_contacted"]
            if processed.get("created_date"):
                crm_data["created_date"] = processed["created_date"]
        
        return crm_data
    
    def get_sync_status(self) -> Dict[str, Any]:
        """Get synchronization status for all data sources"""
        return {
            "data_sources": {
                source_id: {
                    "connector_id": source.connector_id,
                    "data_source_type": source.data_source_type.value,
                    "sync_status": source.sync_status.value,
                    "last_sync": source.last_sync.isoformat() if source.last_sync else None,
                    "sync_interval": source.sync_interval
                }
                for source_id, source in self.data_sources.items()
            },
            "sync_history": self.sync_history[-10:],  # Last 10 syncs
            "total_customers": len(self.customer_data_cache),
            "total_data_points": sum(len(data_points) for data_points in self.customer_data_cache.values())
        }
    
    async def stop_all_sync(self):
        """Stop all data synchronization tasks"""
        for task in self.sync_tasks.values():
            if not task.done():
                task.cancel()
        
        await asyncio.gather(*self.sync_tasks.values(), return_exceptions=True)
        self.sync_tasks.clear()

# Global integrator instance
connector_integrator = ConnectorDataIntegrator()

# Convenience functions
async def start_connector_sync(source_id: Optional[str] = None):
    """Start connector data synchronization"""
    await connector_integrator.start_data_sync(source_id)

async def get_customer_data_from_connectors(customer_id: str, data_types: Optional[List[DataSourceType]] = None) -> Dict[str, List[CustomerDataPoint]]:
    """Get customer data from all connected connectors"""
    return await connector_integrator.get_customer_data(customer_id, data_types)

async def get_customer_profile_from_connectors(customer_id: str) -> Dict[str, Any]:
    """Get comprehensive customer profile from all connectors"""
    return await connector_integrator.get_customer_profile(customer_id)

def get_connector_sync_status() -> Dict[str, Any]:
    """Get connector synchronization status"""
    return connector_integrator.get_sync_status()
