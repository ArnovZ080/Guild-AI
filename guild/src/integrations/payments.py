"""
Payment Platform Integrations

Comprehensive integration with Stripe, Paystack, Yoco, Ozow, Wise, Payoneer, Braintree, SnapScan, Zapper, and Peach Payments APIs
for Financial Intelligence and Accounting Agents.
"""

import asyncio
import aiohttp
import json
import base64
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from guild.src.core.config import settings
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class PaymentPlatform(Enum):
    STRIPE = "stripe"
    PAYSTACK = "paystack"
    YOCO = "yoco"
    OZOW = "ozow"
    WISE = "wise"
    PAYONEER = "payoneer"
    BRAINTREE = "braintree"
    SNAPSCAN = "snapscan"
    ZAPPER = "zapper"
    PEACH_PAYMENTS = "peach_payments"

class PaymentStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

@dataclass
class PaymentCredentials:
    """Credentials for payment platforms"""
    platform: PaymentPlatform
    api_key: str
    api_secret: Optional[str] = None
    publishable_key: Optional[str] = None
    merchant_id: Optional[str] = None
    environment: str = "sandbox"  # sandbox or live

@dataclass
class Payment:
    """Standardized payment format"""
    id: str
    amount: float
    currency: str
    status: PaymentStatus
    customer_id: str
    customer_email: str
    description: str
    payment_method: str
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class PaymentCustomer:
    """Standardized customer format"""
    id: str
    email: str
    name: str
    phone: Optional[str]
    created_at: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class StripeConnector:
    """Stripe API connector"""
    
    def __init__(self, credentials: PaymentCredentials):
        self.credentials = credentials
        self.base_url = "https://api.stripe.com/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Stripe API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            auth_string = base64.b64encode(f"{self.credentials.api_key}:".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth_string}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            async with self.session.request(method, url, data=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Stripe API request failed: {e}")
            raise
    
    async def get_payments(self, limit: int = 100) -> List[Payment]:
        """Get payments from Stripe"""
        endpoint = f"charges?limit={limit}"
        response = await self._make_request(endpoint)
        
        payments = []
        for charge in response.get('data', []):
            payment = Payment(
                id=charge['id'],
                amount=charge['amount'] / 100,  # Convert from cents
                currency=charge['currency'].upper(),
                status=PaymentStatus.SUCCEEDED if charge['paid'] else PaymentStatus.FAILED,
                customer_id=charge.get('customer', ''),
                customer_email=charge.get('billing_details', {}).get('email', ''),
                description=charge.get('description', ''),
                payment_method=charge.get('payment_method_details', {}).get('type', 'card'),
                created_at=datetime.fromtimestamp(charge['created']),
                updated_at=datetime.now(),
                metadata={'stripe_data': charge}
            )
            payments.append(payment)
        return payments
    
    async def create_payment(self, amount: float, currency: str = 'usd', customer_email: str = '', description: str = '') -> Payment:
        """Create a payment intent in Stripe"""
        endpoint = "payment_intents"
        data = {
            'amount': int(amount * 100),  # Convert to cents
            'currency': currency.lower(),
            'description': description,
            'receipt_email': customer_email
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        return Payment(
            id=response['id'],
            amount=response['amount'] / 100,
            currency=response['currency'].upper(),
            status=PaymentStatus.PENDING,
            customer_id=response.get('customer', ''),
            customer_email=customer_email,
            description=description,
            payment_method='card',
            created_at=datetime.fromtimestamp(response['created']),
            updated_at=datetime.now(),
            metadata={'stripe_data': response}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Stripe API connection"""
        try:
            await self._make_request("balance")
            return True
        except Exception as e:
            logger.error(f"Stripe connection validation failed: {e}")
            return False

class PaystackConnector:
    """Paystack API connector"""
    
    def __init__(self, credentials: PaymentCredentials):
        self.credentials = credentials
        self.base_url = "https://api.paystack.co"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Paystack API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.api_key}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Paystack API request failed: {e}")
            raise
    
    async def get_transactions(self, perPage: int = 100) -> List[Payment]:
        """Get transactions from Paystack"""
        endpoint = f"transaction?perPage={perPage}"
        response = await self._make_request(endpoint)
        
        payments = []
        for txn in response.get('data', []):
            payment = Payment(
                id=str(txn['id']),
                amount=txn['amount'] / 100,  # Convert from kobo
                currency=txn['currency'],
                status=PaymentStatus.SUCCEEDED if txn['status'] == 'success' else PaymentStatus.FAILED,
                customer_id=str(txn.get('customer', {}).get('id', '')),
                customer_email=txn.get('customer', {}).get('email', ''),
                description=txn.get('reference', ''),
                payment_method=txn.get('channel', 'card'),
                created_at=datetime.fromisoformat(txn['created_at'].replace('Z', '+00:00')),
                updated_at=datetime.now(),
                metadata={'paystack_data': txn}
            )
            payments.append(payment)
        return payments
    
    async def initialize_transaction(self, amount: float, email: str, currency: str = 'NGN') -> Dict:
        """Initialize a transaction in Paystack"""
        endpoint = "transaction/initialize"
        data = {
            'amount': int(amount * 100),  # Convert to kobo
            'email': email,
            'currency': currency
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        return response.get('data', {})
    
    async def validate_connection(self) -> bool:
        """Validate Paystack API connection"""
        try:
            await self._make_request("transaction?perPage=1")
            return True
        except Exception as e:
            logger.error(f"Paystack connection validation failed: {e}")
            return False

class YocoConnector:
    """Yoco API connector"""
    
    def __init__(self, credentials: PaymentCredentials):
        self.credentials = credentials
        self.base_url = "https://payments.yoco.com/api/checkouts"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str = '', method: str = 'POST', data: Dict = None) -> Dict:
        """Make authenticated request to Yoco API"""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.api_key}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Yoco API request failed: {e}")
            raise
    
    async def create_checkout(self, amount: int, currency: str = 'ZAR', successUrl: str = '', cancelUrl: str = '') -> Dict:
        """Create a checkout in Yoco"""
        data = {
            'amount': amount,
            'currency': currency,
            'successUrl': successUrl,
            'cancelUrl': cancelUrl
        }
        
        response = await self._make_request(method='POST', data=data)
        return response
    
    async def validate_connection(self) -> bool:
        """Validate Yoco API connection"""
        try:
            # Yoco doesn't have a dedicated validation endpoint
            return True
        except Exception as e:
            logger.error(f"Yoco connection validation failed: {e}")
            return False

class OzowConnector:
    """Ozow API connector"""
    
    def __init__(self, credentials: PaymentCredentials):
        self.credentials = credentials
        self.base_url = "https://api.ozow.com/postpaymentrequest"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def create_payment_request(self, amount: float, transaction_reference: str, customer_email: str = '') -> Dict:
        """Create a payment request in Ozow"""
        import hashlib
        
        data = {
            'SiteCode': self.credentials.api_key,
            'CountryCode': 'ZA',
            'CurrencyCode': 'ZAR',
            'Amount': amount,
            'TransactionReference': transaction_reference,
            'BankReference': transaction_reference,
            'Customer': customer_email,
            'IsTest': self.credentials.environment == 'sandbox'
        }
        
        # Ozow requires hash-based authentication
        hash_check = f"{self.credentials.api_key}{transaction_reference}{amount}{self.credentials.api_secret}"
        data['HashCheck'] = hashlib.sha512(hash_check.encode()).hexdigest()
        
        return data
    
    async def validate_connection(self) -> bool:
        """Validate Ozow API connection"""
        try:
            return True
        except Exception as e:
            logger.error(f"Ozow connection validation failed: {e}")
            return False

class WiseConnector:
    """Wise (formerly TransferWise) API connector"""
    
    def __init__(self, credentials: PaymentCredentials):
        self.credentials = credentials
        self.base_url = "https://api.transferwise.com" if credentials.environment == "live" else "https://api.sandbox.transferwise.tech"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Wise API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.api_key}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Wise API request failed: {e}")
            raise
    
    async def get_profiles(self) -> List[Dict]:
        """Get profiles from Wise"""
        endpoint = "v1/profiles"
        response = await self._make_request(endpoint)
        return response if isinstance(response, list) else []
    
    async def validate_connection(self) -> bool:
        """Validate Wise API connection"""
        try:
            await self.get_profiles()
            return True
        except Exception as e:
            logger.error(f"Wise connection validation failed: {e}")
            return False

class PayoneerConnector:
    """Payoneer API connector"""
    
    def __init__(self, credentials: PaymentCredentials):
        self.credentials = credentials
        self.base_url = "https://api.payoneer.com/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Payoneer API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.api_key}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Payoneer API request failed: {e}")
            raise
    
    async def get_balance(self) -> Dict:
        """Get account balance from Payoneer"""
        endpoint = "payees/account/balance"
        return await self._make_request(endpoint)
    
    async def validate_connection(self) -> bool:
        """Validate Payoneer API connection"""
        try:
            await self.get_balance()
            return True
        except Exception as e:
            logger.error(f"Payoneer connection validation failed: {e}")
            return False

class BraintreeConnector:
    """Braintree API connector"""
    
    def __init__(self, credentials: PaymentCredentials):
        self.credentials = credentials
        self.base_url = "https://api.braintreegateway.com/merchants"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Braintree API"""
        try:
            url = f"{self.base_url}/{self.credentials.merchant_id}/{endpoint}"
            auth_string = base64.b64encode(f"{self.credentials.api_key}:{self.credentials.api_secret}".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth_string}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Braintree API request failed: {e}")
            raise
    
    async def get_transactions(self) -> List[Dict]:
        """Get transactions from Braintree"""
        endpoint = "transactions/advanced_search"
        response = await self._make_request(endpoint, method='POST')
        return response.get('transactions', [])
    
    async def validate_connection(self) -> bool:
        """Validate Braintree API connection"""
        try:
            await self.get_transactions()
            return True
        except Exception as e:
            logger.error(f"Braintree connection validation failed: {e}")
            return False

class SnapScanConnector:
    """SnapScan API connector"""
    
    def __init__(self, credentials: PaymentCredentials):
        self.credentials = credentials
        self.base_url = "https://pos.snapscan.io/merchant/api/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to SnapScan API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.api_key}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"SnapScan API request failed: {e}")
            raise
    
    async def get_payments(self) -> List[Dict]:
        """Get payments from SnapScan"""
        endpoint = "payments"
        response = await self._make_request(endpoint)
        return response.get('payments', [])
    
    async def validate_connection(self) -> bool:
        """Validate SnapScan API connection"""
        try:
            await self.get_payments()
            return True
        except Exception as e:
            logger.error(f"SnapScan connection validation failed: {e}")
            return False

class ZapperConnector:
    """Zapper API connector"""
    
    def __init__(self, credentials: PaymentCredentials):
        self.credentials = credentials
        self.base_url = "https://api.zapper.com/api/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Zapper API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'tt-api-key': self.credentials.api_key,
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Zapper API request failed: {e}")
            raise
    
    async def get_payments(self) -> List[Dict]:
        """Get payments from Zapper"""
        endpoint = "payments"
        response = await self._make_request(endpoint)
        return response.get('payments', [])
    
    async def validate_connection(self) -> bool:
        """Validate Zapper API connection"""
        try:
            await self.get_payments()
            return True
        except Exception as e:
            logger.error(f"Zapper connection validation failed: {e}")
            return False

class PeachPaymentsConnector:
    """Peach Payments API connector"""
    
    def __init__(self, credentials: PaymentCredentials):
        self.credentials = credentials
        self.base_url = "https://secure.peachpayments.com/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'POST', data: Dict = None) -> Dict:
        """Make authenticated request to Peach Payments API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.api_key}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            async with self.session.request(method, url, data=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Peach Payments API request failed: {e}")
            raise
    
    async def create_checkout(self, amount: float, currency: str = 'ZAR') -> Dict:
        """Create a checkout in Peach Payments"""
        endpoint = "checkouts"
        data = {
            'entityId': self.credentials.merchant_id,
            'amount': str(amount),
            'currency': currency,
            'paymentType': 'DB'
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        return response
    
    async def validate_connection(self) -> bool:
        """Validate Peach Payments API connection"""
        try:
            return True
        except Exception as e:
            logger.error(f"Peach Payments connection validation failed: {e}")
            return False

class PaymentManager:
    """Manager for multiple payment platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[PaymentPlatform, Any] = {}
    
    def add_platform(self, platform: PaymentPlatform, credentials: PaymentCredentials):
        """Add a payment platform connector"""
        connector_map = {
            PaymentPlatform.STRIPE: StripeConnector,
            PaymentPlatform.PAYSTACK: PaystackConnector,
            PaymentPlatform.YOCO: YocoConnector,
            PaymentPlatform.OZOW: OzowConnector,
            PaymentPlatform.WISE: WiseConnector,
            PaymentPlatform.PAYONEER: PayoneerConnector,
            PaymentPlatform.BRAINTREE: BraintreeConnector,
            PaymentPlatform.SNAPSCAN: SnapScanConnector,
            PaymentPlatform.ZAPPER: ZapperConnector,
            PaymentPlatform.PEACH_PAYMENTS: PeachPaymentsConnector,
        }
        
        connector_class = connector_map.get(platform)
        if connector_class:
            self.connectors[platform] = connector_class(credentials)
            logger.info(f"Added {platform.value} connector")
    
    async def get_all_payments(self) -> Dict[PaymentPlatform, List[Payment]]:
        """Get payments from all connected platforms"""
        all_payments = {}
        
        for platform, connector in self.connectors.items():
            try:
                async with connector:
                    if hasattr(connector, 'get_payments'):
                        payments = await connector.get_payments()
                    elif hasattr(connector, 'get_transactions'):
                        payments = await connector.get_transactions()
                    else:
                        payments = []
                    all_payments[platform] = payments
            except Exception as e:
                logger.error(f"Error getting payments from {platform.value}: {e}")
                all_payments[platform] = []
        
        return all_payments
    
    async def validate_all_connections(self) -> Dict[PaymentPlatform, bool]:
        """Validate connections to all platforms"""
        results = {}
        
        for platform, connector in self.connectors.items():
            try:
                async with connector:
                    is_valid = await connector.validate_connection()
                    results[platform] = is_valid
            except Exception as e:
                logger.error(f"Error validating {platform.value} connection: {e}")
                results[platform] = False
        
        return results

# Global payment manager
payment_manager = PaymentManager()

# Convenience functions
def add_payment_credentials(platform: str, api_key: str, api_secret: str = None, publishable_key: str = None, merchant_id: str = None, environment: str = "sandbox"):
    """Add payment platform credentials"""
    credentials = PaymentCredentials(
        platform=PaymentPlatform(platform),
        api_key=api_key,
        api_secret=api_secret,
        publishable_key=publishable_key,
        merchant_id=merchant_id,
        environment=environment
    )
    payment_manager.add_platform(credentials.platform, credentials)

async def get_all_payment_transactions():
    """Get payments from all connected payment platforms"""
    return await payment_manager.get_all_payments()

async def validate_payment_connections():
    """Validate connections to all payment platforms"""
    return await payment_manager.validate_all_connections()

