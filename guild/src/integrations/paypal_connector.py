"""
PayPal Integration Connector
Complete payment processing, invoicing, and transaction management.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import aiohttp
import json
from enum import Enum
import base64

logger = logging.getLogger(__name__)


class PayPalEnvironment(Enum):
    """PayPal API environments"""
    SANDBOX = "sandbox"
    PRODUCTION = "production"


class PayPalDataType(Enum):
    """Types of data available from PayPal"""
    PAYMENTS = "payments"
    INVOICES = "invoices"
    SUBSCRIPTIONS = "subscriptions"
    TRANSACTIONS = "transactions"
    PAYOUTS = "payouts"
    DISPUTES = "disputes"


@dataclass
class PayPalCredentials:
    """PayPal API credentials"""
    client_id: str
    client_secret: str
    environment: PayPalEnvironment = PayPalEnvironment.SANDBOX
    access_token: Optional[str] = None
    token_expiry: Optional[datetime] = None


@dataclass
class PayPalPayment:
    """Payment data from PayPal"""
    id: str
    status: str
    amount: float
    currency: str
    payer_email: str
    payer_name: Optional[str]
    description: Optional[str]
    created: datetime
    updated: datetime


@dataclass
class PayPalInvoice:
    """Invoice data from PayPal"""
    id: str
    status: str
    invoice_number: str
    total_amount: float
    currency: str
    recipient_email: str
    recipient_name: Optional[str]
    due_date: Optional[datetime]
    invoice_date: datetime
    items: List[Dict[str, Any]]
    invoice_url: Optional[str]


@dataclass
class PayPalTransaction:
    """Transaction data from PayPal"""
    transaction_id: str
    transaction_type: str
    transaction_status: str
    amount: float
    currency: str
    payer_email: Optional[str]
    payee_email: Optional[str]
    transaction_date: datetime


class PayPalConnector:
    """
    Comprehensive PayPal integration connector.
    Handles payments, invoicing, subscriptions, and transaction management.
    """
    
    def __init__(self, credentials: PayPalCredentials):
        self.credentials = credentials
        self.base_url = self._get_base_url()
        self.session: Optional[aiohttp.ClientSession] = None
        
    def _get_base_url(self) -> str:
        """Get base URL for PayPal API"""
        if self.credentials.environment == PayPalEnvironment.SANDBOX:
            return "https://api-m.sandbox.paypal.com"
        else:
            return "https://api-m.paypal.com"
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        await self._ensure_access_token()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def _ensure_access_token(self):
        """Ensure we have a valid access token"""
        if (self.credentials.access_token and 
            self.credentials.token_expiry and 
            datetime.now() < self.credentials.token_expiry):
            return
        
        # Get new access token
        await self._get_access_token()
    
    async def _get_access_token(self):
        """Get OAuth access token from PayPal"""
        auth_url = f"{self.base_url}/v1/oauth2/token"
        
        # Create basic auth header
        auth_string = f"{self.credentials.client_id}:{self.credentials.client_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            "Authorization": f"Basic {auth_b64}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = "grant_type=client_credentials"
        
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        async with self.session.post(auth_url, headers=headers, data=data) as response:
            if response.status == 200:
                token_data = await response.json()
                self.credentials.access_token = token_data['access_token']
                expires_in = token_data.get('expires_in', 3600)
                self.credentials.token_expiry = datetime.now() + timedelta(seconds=expires_in - 60)
                logger.info("PayPal access token obtained successfully")
            else:
                error_text = await response.text()
                raise Exception(f"Failed to get PayPal access token: {response.status} - {error_text}")
    
    async def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        await self._ensure_access_token()
        return {
            "Authorization": f"Bearer {self.credentials.access_token}",
            "Content-Type": "application/json"
        }
    
    async def validate_connection(self) -> bool:
        """Validate PayPal API connection"""
        try:
            await self._ensure_access_token()
            
            # Test with a simple API call
            url = f"{self.base_url}/v1/invoicing/invoices?page_size=1"
            headers = await self._get_headers()
            
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    logger.info("PayPal connection validated successfully")
                    return True
                else:
                    logger.error(f"PayPal validation failed: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"PayPal connection validation failed: {e}")
            return False
    
    # ============================================================================
    # PAYMENT MANAGEMENT
    # ============================================================================
    
    async def get_payments(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        status: Optional[str] = None
    ) -> List[PayPalPayment]:
        """
        Get payments from PayPal.
        
        Args:
            start_date: Filter by start date
            end_date: Filter by end date
            status: Filter by status (COMPLETED, PENDING, etc.)
        """
        try:
            url = f"{self.base_url}/v2/payments/captures"
            headers = await self._get_headers()
            
            params = {}
            if start_date:
                params['start_date'] = start_date.isoformat()
            if end_date:
                params['end_date'] = end_date.isoformat()
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    payments = []
                    
                    for item in data.get('captures', []):
                        if status and item.get('status') != status:
                            continue
                        
                        payments.append(PayPalPayment(
                            id=item['id'],
                            status=item['status'],
                            amount=float(item['amount']['value']),
                            currency=item['amount']['currency_code'],
                            payer_email=item.get('payer', {}).get('email_address'),
                            payer_name=item.get('payer', {}).get('name', {}).get('full_name'),
                            description=item.get('supplementary_data', {}).get('description'),
                            created=datetime.fromisoformat(item['create_time'].replace('Z', '+00:00')),
                            updated=datetime.fromisoformat(item['update_time'].replace('Z', '+00:00'))
                        ))
                    
                    return payments
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get payments: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting PayPal payments: {e}")
            raise
    
    async def create_payment(
        self,
        amount: float,
        currency: str = "USD",
        description: Optional[str] = None,
        return_url: Optional[str] = None,
        cancel_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a payment"""
        try:
            url = f"{self.base_url}/v2/checkout/orders"
            headers = await self._get_headers()
            
            payload = {
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": currency,
                        "value": str(amount)
                    },
                    "description": description or "Payment"
                }]
            }
            
            if return_url and cancel_url:
                payload["application_context"] = {
                    "return_url": return_url,
                    "cancel_url": cancel_url
                }
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 201:
                    data = await response.json()
                    
                    # Get approval URL
                    approval_url = None
                    for link in data.get('links', []):
                        if link['rel'] == 'approve':
                            approval_url = link['href']
                            break
                    
                    return {
                        'id': data['id'],
                        'status': data['status'],
                        'approval_url': approval_url,
                        'created': datetime.now()
                    }
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to create payment: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error creating PayPal payment: {e}")
            raise
    
    # ============================================================================
    # INVOICE MANAGEMENT
    # ============================================================================
    
    async def get_invoices(
        self,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[PayPalInvoice]:
        """
        Get invoices from PayPal.
        
        Args:
            status: Filter by status (DRAFT, SENT, PAID, etc.)
            limit: Maximum number to retrieve
        """
        try:
            url = f"{self.base_url}/v2/invoicing/invoices"
            headers = await self._get_headers()
            
            params = {'page_size': min(limit, 100)}
            if status:
                params['status'] = status
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    invoices = []
                    
                    for item in data.get('items', []):
                        # Calculate total amount
                        total = float(item.get('amount', {}).get('value', 0))
                        
                        invoices.append(PayPalInvoice(
                            id=item['id'],
                            status=item.get('status', 'UNKNOWN'),
                            invoice_number=item.get('detail', {}).get('invoice_number', ''),
                            total_amount=total,
                            currency=item.get('amount', {}).get('currency_code', 'USD'),
                            recipient_email=item.get('primary_recipients', [{}])[0].get('billing_info', {}).get('email_address'),
                            recipient_name=item.get('primary_recipients', [{}])[0].get('billing_info', {}).get('business_name'),
                            due_date=datetime.fromisoformat(item.get('detail', {}).get('payment_term', {}).get('due_date', datetime.now().isoformat()).replace('Z', '+00:00')) if item.get('detail', {}).get('payment_term', {}).get('due_date') else None,
                            invoice_date=datetime.fromisoformat(item.get('detail', {}).get('invoice_date', datetime.now().isoformat()).replace('Z', '+00:00')),
                            items=item.get('items', []),
                            invoice_url=item.get('links', [{}])[0].get('href')
                        ))
                    
                    return invoices
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get invoices: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting PayPal invoices: {e}")
            raise
    
    async def create_invoice(
        self,
        recipient_email: str,
        items: List[Dict[str, Any]],
        currency: str = "USD",
        invoice_number: Optional[str] = None,
        due_date: Optional[datetime] = None,
        note: Optional[str] = None
    ) -> PayPalInvoice:
        """
        Create a new invoice.
        
        Args:
            recipient_email: Recipient's email
            items: List of invoice items with name, quantity, unit_amount
            currency: Currency code
            invoice_number: Optional invoice number
            due_date: Optional due date
            note: Optional note to recipient
        """
        try:
            url = f"{self.base_url}/v2/invoicing/invoices"
            headers = await self._get_headers()
            
            # Build invoice payload
            payload = {
                "detail": {
                    "invoice_number": invoice_number or f"INV-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
                    "currency_code": currency,
                    "note": note or "Thank you for your business"
                },
                "invoicer": {
                    "email_address": self.credentials.client_id  # Use configured email
                },
                "primary_recipients": [{
                    "billing_info": {
                        "email_address": recipient_email
                    }
                }],
                "items": []
            }
            
            # Add items
            for item in items:
                payload["items"].append({
                    "name": item.get('name', 'Item'),
                    "description": item.get('description', ''),
                    "quantity": str(item.get('quantity', 1)),
                    "unit_amount": {
                        "currency_code": currency,
                        "value": str(item.get('unit_amount', 0))
                    }
                })
            
            # Add due date if provided
            if due_date:
                payload["detail"]["payment_term"] = {
                    "due_date": due_date.isoformat()
                }
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 201:
                    data = await response.json()
                    
                    return PayPalInvoice(
                        id=data['id'],
                        status='DRAFT',
                        invoice_number=payload['detail']['invoice_number'],
                        total_amount=sum(float(item['unit_amount']['value']) * int(item['quantity']) for item in payload['items']),
                        currency=currency,
                        recipient_email=recipient_email,
                        recipient_name=None,
                        due_date=due_date,
                        invoice_date=datetime.now(),
                        items=payload['items'],
                        invoice_url=data.get('href')
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to create invoice: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error creating PayPal invoice: {e}")
            raise
    
    async def send_invoice(self, invoice_id: str) -> Dict[str, Any]:
        """Send an invoice to recipient"""
        try:
            url = f"{self.base_url}/v2/invoicing/invoices/{invoice_id}/send"
            headers = await self._get_headers()
            
            payload = {
                "send_to_invoicer": True
            }
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 202:
                    return {
                        'success': True,
                        'invoice_id': invoice_id,
                        'status': 'SENT',
                        'sent_at': datetime.now()
                    }
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to send invoice: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error sending PayPal invoice: {e}")
            raise
    
    async def cancel_invoice(self, invoice_id: str) -> Dict[str, Any]:
        """Cancel an invoice"""
        try:
            url = f"{self.base_url}/v2/invoicing/invoices/{invoice_id}/cancel"
            headers = await self._get_headers()
            
            payload = {
                "send_to_invoicer": True,
                "send_to_recipient": True
            }
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 204:
                    return {
                        'success': True,
                        'invoice_id': invoice_id,
                        'status': 'CANCELLED',
                        'cancelled_at': datetime.now()
                    }
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to cancel invoice: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error canceling PayPal invoice: {e}")
            raise
    
    # ============================================================================
    # TRANSACTION MANAGEMENT
    # ============================================================================
    
    async def get_transactions(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        transaction_type: Optional[str] = None
    ) -> List[PayPalTransaction]:
        """
        Get transaction history.
        
        Args:
            start_date: Start date for transactions
            end_date: End date for transactions
            transaction_type: Filter by type (PAYMENT, REFUND, etc.)
        """
        try:
            if not end_date:
                end_date = datetime.now()
            
            if not start_date:
                start_date = end_date - timedelta(days=30)
            
            url = f"{self.base_url}/v1/reporting/transactions"
            headers = await self._get_headers()
            
            params = {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'fields': 'all',
                'page_size': '100'
            }
            
            if transaction_type:
                params['transaction_type'] = transaction_type
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    transactions = []
                    
                    for item in data.get('transaction_details', []):
                        transactions.append(PayPalTransaction(
                            transaction_id=item['transaction_info']['transaction_id'],
                            transaction_type=item['transaction_info'].get('transaction_event_code', 'UNKNOWN'),
                            transaction_status=item['transaction_info'].get('transaction_status', 'UNKNOWN'),
                            amount=float(item['transaction_info']['transaction_amount']['value']),
                            currency=item['transaction_info']['transaction_amount']['currency_code'],
                            payer_email=item.get('payer_info', {}).get('email_address'),
                            payee_email=item.get('shipping_info', {}).get('email_address'),
                            transaction_date=datetime.fromisoformat(item['transaction_info']['transaction_initiation_date'].replace('Z', '+00:00'))
                        ))
                    
                    return transactions
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get transactions: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting PayPal transactions: {e}")
            raise
    
    # ============================================================================
    # REVENUE ANALYTICS
    # ============================================================================
    
    async def get_revenue_data(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get revenue analytics"""
        transactions = await self.get_transactions(start_date, end_date)
        
        total_revenue = 0
        total_refunds = 0
        payment_count = 0
        refund_count = 0
        
        for transaction in transactions:
            if 'PAYMENT' in transaction.transaction_type.upper():
                total_revenue += transaction.amount
                payment_count += 1
            elif 'REFUND' in transaction.transaction_type.upper():
                total_refunds += abs(transaction.amount)
                refund_count += 1
        
        net_revenue = total_revenue - total_refunds
        
        return {
            'total_revenue': total_revenue,
            'total_refunds': total_refunds,
            'net_revenue': net_revenue,
            'payment_count': payment_count,
            'refund_count': refund_count,
            'period_start': start_date or (datetime.now() - timedelta(days=30)),
            'period_end': end_date or datetime.now()
        }
    
    # ============================================================================
    # SUBSCRIPTION MANAGEMENT
    # ============================================================================
    
    async def get_subscriptions(
        self,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get subscriptions"""
        try:
            url = f"{self.base_url}/v1/billing/subscriptions"
            headers = await self._get_headers()
            
            params = {}
            if status:
                params['status'] = status
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    subscriptions = []
                    
                    for item in data.get('subscriptions', []):
                        subscriptions.append({
                            'id': item['id'],
                            'status': item['status'],
                            'plan_id': item.get('plan_id'),
                            'subscriber_email': item.get('subscriber', {}).get('email_address'),
                            'start_time': datetime.fromisoformat(item['start_time'].replace('Z', '+00:00')),
                            'billing_info': item.get('billing_info', {})
                        })
                    
                    return subscriptions
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get subscriptions: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting PayPal subscriptions: {e}")
            raise
    
    # ============================================================================
    # UTILITY METHODS
    # ============================================================================
    
    async def get_balance(self) -> Dict[str, Any]:
        """Get account balance"""
        try:
            url = f"{self.base_url}/v1/reporting/balances"
            headers = await self._get_headers()
            
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        'balances': data.get('balances', []),
                        'as_of_time': datetime.fromisoformat(data['as_of_time'].replace('Z', '+00:00'))
                    }
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get balance: {response.status} - {error_text}")
                    return {}
                    
        except Exception as e:
            logger.error(f"Error getting PayPal balance: {e}")
            raise

