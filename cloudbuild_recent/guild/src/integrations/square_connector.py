"""
Square Integration Connector
Complete payment processing, POS integration, and transaction management.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import aiohttp
import json
from enum import Enum
import uuid

logger = logging.getLogger(__name__)


class SquareEnvironment(Enum):
    """Square API environments"""
    SANDBOX = "sandbox"
    PRODUCTION = "production"


class SquareDataType(Enum):
    """Types of data available from Square"""
    PAYMENTS = "payments"
    ORDERS = "orders"
    CUSTOMERS = "customers"
    INVENTORY = "inventory"
    TRANSACTIONS = "transactions"
    LOCATIONS = "locations"
    CATALOG = "catalog"


@dataclass
class SquareCredentials:
    """Square API credentials"""
    access_token: str
    environment: SquareEnvironment = SquareEnvironment.SANDBOX
    location_id: Optional[str] = None  # Primary location ID


@dataclass
class SquarePayment:
    """Payment data from Square"""
    id: str
    status: str
    amount: float
    currency: str
    source_type: str  # CARD, CASH, etc.
    customer_id: Optional[str]
    location_id: str
    receipt_url: Optional[str]
    created_at: datetime
    updated_at: datetime


@dataclass
class SquareOrder:
    """Order data from Square"""
    id: str
    location_id: str
    status: str
    total_money: float
    total_tax: float
    total_discount: float
    currency: str
    customer_id: Optional[str]
    line_items: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


@dataclass
class SquareCustomer:
    """Customer data from Square"""
    id: str
    given_name: Optional[str]
    family_name: Optional[str]
    email_address: Optional[str]
    phone_number: Optional[str]
    created_at: datetime
    updated_at: datetime
    lifetime_value: float
    total_orders: int


class SquareConnector:
    """
    Comprehensive Square integration connector.
    Handles payments, POS, orders, customers, and inventory management.
    """
    
    def __init__(self, credentials: SquareCredentials):
        self.credentials = credentials
        self.base_url = self._get_base_url()
        self.session: Optional[aiohttp.ClientSession] = None
        
    def _get_base_url(self) -> str:
        """Get base URL for Square API"""
        if self.credentials.environment == SquareEnvironment.SANDBOX:
            return "https://connect.squareupsandbox.com"
        else:
            return "https://connect.squareup.com"
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        return {
            "Authorization": f"Bearer {self.credentials.access_token}",
            "Content-Type": "application/json",
            "Square-Version": "2024-10-17"  # Latest API version
        }
    
    async def validate_connection(self) -> bool:
        """Validate Square API connection"""
        try:
            url = f"{self.base_url}/v2/locations"
            headers = await self._get_headers()
            
            if not self.session:
                self.session = aiohttp.ClientSession()
            
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    locations = data.get('locations', [])
                    
                    if locations and not self.credentials.location_id:
                        # Set default location
                        self.credentials.location_id = locations[0]['id']
                    
                    logger.info(f"Square connection validated. Found {len(locations)} locations")
                    return True
                else:
                    logger.error(f"Square validation failed: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"Square connection validation failed: {e}")
            return False
    
    # ============================================================================
    # PAYMENT MANAGEMENT
    # ============================================================================
    
    async def get_payments(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        location_id: Optional[str] = None,
        limit: int = 100
    ) -> List[SquarePayment]:
        """
        Get payments from Square.
        
        Args:
            start_date: Filter by start date
            end_date: Filter by end date
            location_id: Filter by location
            limit: Maximum number to retrieve
        """
        try:
            url = f"{self.base_url}/v2/payments"
            headers = await self._get_headers()
            
            payload = {
                "limit": limit
            }
            
            if start_date:
                payload["begin_time"] = start_date.isoformat()
            if end_date:
                payload["end_time"] = end_date.isoformat()
            if location_id:
                payload["location_id"] = location_id
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    payments = []
                    
                    for item in data.get('payments', []):
                        payments.append(SquarePayment(
                            id=item['id'],
                            status=item['status'],
                            amount=float(item['amount_money']['amount']) / 100.0,  # Convert from cents
                            currency=item['amount_money']['currency'],
                            source_type=item.get('source_type', 'UNKNOWN'),
                            customer_id=item.get('customer_id'),
                            location_id=item['location_id'],
                            receipt_url=item.get('receipt_url'),
                            created_at=datetime.fromisoformat(item['created_at'].replace('Z', '+00:00')),
                            updated_at=datetime.fromisoformat(item['updated_at'].replace('Z', '+00:00'))
                        ))
                    
                    return payments
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get payments: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting Square payments: {e}")
            raise
    
    async def create_payment(
        self,
        amount: float,
        currency: str = "USD",
        source_id: str = "CASH",  # or card nonce
        customer_id: Optional[str] = None,
        location_id: Optional[str] = None,
        note: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a payment"""
        try:
            url = f"{self.base_url}/v2/payments"
            headers = await self._get_headers()
            
            payload = {
                "idempotency_key": str(uuid.uuid4()),
                "amount_money": {
                    "amount": int(amount * 100),  # Convert to cents
                    "currency": currency
                },
                "source_id": source_id
            }
            
            if customer_id:
                payload["customer_id"] = customer_id
            
            if location_id:
                payload["location_id"] = location_id
            elif self.credentials.location_id:
                payload["location_id"] = self.credentials.location_id
            
            if note:
                payload["note"] = note
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    payment = data['payment']
                    
                    return {
                        'id': payment['id'],
                        'status': payment['status'],
                        'amount': float(payment['amount_money']['amount']) / 100.0,
                        'currency': payment['amount_money']['currency'],
                        'receipt_url': payment.get('receipt_url'),
                        'created_at': datetime.fromisoformat(payment['created_at'].replace('Z', '+00:00'))
                    }
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to create payment: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error creating Square payment: {e}")
            raise
    
    # ============================================================================
    # ORDER MANAGEMENT
    # ============================================================================
    
    async def get_orders(
        self,
        location_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[SquareOrder]:
        """Get orders from Square"""
        try:
            url = f"{self.base_url}/v2/orders/search"
            headers = await self._get_headers()
            
            query = {}
            
            if location_id:
                query["location_ids"] = [location_id]
            elif self.credentials.location_id:
                query["location_ids"] = [self.credentials.location_id]
            
            if start_date or end_date:
                query["filter"] = {
                    "date_time_filter": {}
                }
                if start_date:
                    query["filter"]["date_time_filter"]["created_at"] = {
                        "start_at": start_date.isoformat()
                    }
                if end_date:
                    query["filter"]["date_time_filter"]["created_at"] = {
                        "end_at": end_date.isoformat()
                    }
            
            payload = {
                "query": query,
                "limit": limit
            }
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    orders = []
                    
                    for item in data.get('orders', []):
                        total_money = float(item.get('total_money', {}).get('amount', 0)) / 100.0
                        total_tax = float(item.get('total_tax_money', {}).get('amount', 0)) / 100.0
                        total_discount = float(item.get('total_discount_money', {}).get('amount', 0)) / 100.0
                        
                        orders.append(SquareOrder(
                            id=item['id'],
                            location_id=item['location_id'],
                            status=item.get('state', 'UNKNOWN'),
                            total_money=total_money,
                            total_tax=total_tax,
                            total_discount=total_discount,
                            currency=item.get('total_money', {}).get('currency', 'USD'),
                            customer_id=item.get('customer_id'),
                            line_items=item.get('line_items', []),
                            created_at=datetime.fromisoformat(item['created_at'].replace('Z', '+00:00')),
                            updated_at=datetime.fromisoformat(item['updated_at'].replace('Z', '+00:00'))
                        ))
                    
                    return orders
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get orders: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting Square orders: {e}")
            raise
    
    async def create_order(
        self,
        line_items: List[Dict[str, Any]],
        location_id: Optional[str] = None,
        customer_id: Optional[str] = None
    ) -> SquareOrder:
        """
        Create a new order.
        
        Args:
            line_items: List of items with name, quantity, base_price_money
            location_id: Location for the order
            customer_id: Optional customer ID
        """
        try:
            url = f"{self.base_url}/v2/orders"
            headers = await self._get_headers()
            
            loc_id = location_id or self.credentials.location_id
            if not loc_id:
                raise ValueError("Location ID required for order creation")
            
            payload = {
                "idempotency_key": str(uuid.uuid4()),
                "order": {
                    "location_id": loc_id,
                    "line_items": line_items
                }
            }
            
            if customer_id:
                payload["order"]["customer_id"] = customer_id
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    order = data['order']
                    
                    return SquareOrder(
                        id=order['id'],
                        location_id=order['location_id'],
                        status=order.get('state', 'OPEN'),
                        total_money=float(order.get('total_money', {}).get('amount', 0)) / 100.0,
                        total_tax=float(order.get('total_tax_money', {}).get('amount', 0)) / 100.0,
                        total_discount=float(order.get('total_discount_money', {}).get('amount', 0)) / 100.0,
                        currency=order.get('total_money', {}).get('currency', 'USD'),
                        customer_id=order.get('customer_id'),
                        line_items=order.get('line_items', []),
                        created_at=datetime.fromisoformat(order['created_at'].replace('Z', '+00:00')),
                        updated_at=datetime.fromisoformat(order['updated_at'].replace('Z', '+00:00'))
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to create order: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error creating Square order: {e}")
            raise
    
    # ============================================================================
    # CUSTOMER MANAGEMENT
    # ============================================================================
    
    async def get_customers(
        self,
        email: Optional[str] = None,
        limit: int = 100
    ) -> List[SquareCustomer]:
        """Get customers from Square"""
        try:
            url = f"{self.base_url}/v2/customers/search"
            headers = await self._get_headers()
            
            query = {}
            
            if email:
                query["filter"] = {
                    "email_address": {"exact": email}
                }
            
            payload = {
                "limit": limit
            }
            
            if query:
                payload["query"] = query
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    customers = []
                    
                    for item in data.get('customers', []):
                        # Get customer orders to calculate lifetime value
                        customer_orders = await self.get_orders()  # Would filter by customer_id in real implementation
                        lifetime_value = sum(order.total_money for order in customer_orders if order.customer_id == item['id'])
                        
                        customers.append(SquareCustomer(
                            id=item['id'],
                            given_name=item.get('given_name'),
                            family_name=item.get('family_name'),
                            email_address=item.get('email_address'),
                            phone_number=item.get('phone_number'),
                            created_at=datetime.fromisoformat(item['created_at'].replace('Z', '+00:00')),
                            updated_at=datetime.fromisoformat(item['updated_at'].replace('Z', '+00:00')),
                            lifetime_value=lifetime_value,
                            total_orders=len([o for o in customer_orders if o.customer_id == item['id']])
                        ))
                    
                    return customers
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get customers: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting Square customers: {e}")
            raise
    
    async def create_customer(
        self,
        given_name: Optional[str] = None,
        family_name: Optional[str] = None,
        email_address: Optional[str] = None,
        phone_number: Optional[str] = None,
        note: Optional[str] = None
    ) -> SquareCustomer:
        """Create a new customer"""
        try:
            url = f"{self.base_url}/v2/customers"
            headers = await self._get_headers()
            
            payload = {
                "idempotency_key": str(uuid.uuid4())
            }
            
            if given_name:
                payload["given_name"] = given_name
            if family_name:
                payload["family_name"] = family_name
            if email_address:
                payload["email_address"] = email_address
            if phone_number:
                payload["phone_number"] = phone_number
            if note:
                payload["note"] = note
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    customer = data['customer']
                    
                    return SquareCustomer(
                        id=customer['id'],
                        given_name=customer.get('given_name'),
                        family_name=customer.get('family_name'),
                        email_address=customer.get('email_address'),
                        phone_number=customer.get('phone_number'),
                        created_at=datetime.fromisoformat(customer['created_at'].replace('Z', '+00:00')),
                        updated_at=datetime.fromisoformat(customer['updated_at'].replace('Z', '+00:00')),
                        lifetime_value=0.0,
                        total_orders=0
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to create customer: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error creating Square customer: {e}")
            raise
    
    # ============================================================================
    # INVENTORY MANAGEMENT
    # ============================================================================
    
    async def get_inventory(
        self,
        location_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get inventory counts"""
        try:
            url = f"{self.base_url}/v2/inventory/counts/batch-retrieve"
            headers = await self._get_headers()
            
            loc_id = location_id or self.credentials.location_id
            
            payload = {}
            if loc_id:
                payload["location_ids"] = [loc_id]
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('counts', [])
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get inventory: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting Square inventory: {e}")
            raise
    
    # ============================================================================
    # REVENUE ANALYTICS
    # ============================================================================
    
    async def get_revenue_data(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        location_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get revenue analytics"""
        payments = await self.get_payments(start_date, end_date, location_id)
        
        total_revenue = 0
        successful_payments = 0
        failed_payments = 0
        
        for payment in payments:
            if payment.status == "COMPLETED":
                total_revenue += payment.amount
                successful_payments += 1
            elif payment.status == "FAILED":
                failed_payments += 1
        
        return {
            'total_revenue': total_revenue,
            'successful_payments': successful_payments,
            'failed_payments': failed_payments,
            'average_transaction': total_revenue / successful_payments if successful_payments > 0 else 0,
            'period_start': start_date or (datetime.now() - timedelta(days=30)),
            'period_end': end_date or datetime.now()
        }
    
    # ============================================================================
    # LOCATION MANAGEMENT
    # ============================================================================
    
    async def get_locations(self) -> List[Dict[str, Any]]:
        """Get business locations"""
        try:
            url = f"{self.base_url}/v2/locations"
            headers = await self._get_headers()
            
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('locations', [])
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get locations: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting Square locations: {e}")
            raise
    
    # ============================================================================
    # CATALOG MANAGEMENT
    # ============================================================================
    
    async def get_catalog_items(
        self,
        types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get catalog items (products, categories, etc.)
        
        Args:
            types: Filter by types (ITEM, CATEGORY, TAX, DISCOUNT, etc.)
        """
        try:
            url = f"{self.base_url}/v2/catalog/list"
            headers = await self._get_headers()
            
            params = {}
            if types:
                params["types"] = ",".join(types)
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('objects', [])
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get catalog: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting Square catalog: {e}")
            raise

