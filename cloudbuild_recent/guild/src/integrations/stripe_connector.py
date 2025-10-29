"""
Stripe Integration Connector
Complete payment processing, subscription management, and revenue tracking.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import stripe
from enum import Enum

logger = logging.getLogger(__name__)


class StripeDataType(Enum):
    """Types of data available from Stripe"""
    REVENUE = "revenue"
    SUBSCRIPTIONS = "subscriptions"
    CUSTOMERS = "customers"
    INVOICES = "invoices"
    PAYMENTS = "payments"
    CHARGES = "charges"
    REFUNDS = "refunds"
    DISPUTES = "disputes"
    BALANCE = "balance"
    PAYOUTS = "payouts"


@dataclass
class StripeCredentials:
    """Stripe API credentials"""
    api_key: str
    webhook_secret: Optional[str] = None


@dataclass
class StripeRevenue:
    """Revenue data from Stripe"""
    total_revenue: float
    currency: str
    period_start: datetime
    period_end: datetime
    successful_charges: int
    failed_charges: int
    refunds_total: float
    net_revenue: float
    mrr: float  # Monthly Recurring Revenue
    arr: float  # Annual Recurring Revenue


@dataclass
class StripeSubscription:
    """Subscription data"""
    id: str
    customer_id: str
    status: str
    plan_name: str
    plan_amount: float
    currency: str
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool
    created: datetime


@dataclass
class StripeCustomer:
    """Customer data"""
    id: str
    email: str
    name: Optional[str]
    description: Optional[str]
    created: datetime
    lifetime_value: float
    subscription_status: Optional[str]
    payment_method: Optional[str]
    metadata: Dict[str, Any]


class StripeConnector:
    """
    Comprehensive Stripe integration connector.
    Handles payments, subscriptions, customers, invoices, and revenue tracking.
    """
    
    def __init__(self, credentials: StripeCredentials):
        self.credentials = credentials
        stripe.api_key = credentials.api_key
        self.webhook_secret = credentials.webhook_secret
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes
        
    async def validate_connection(self) -> bool:
        """Validate Stripe API connection"""
        try:
            # Test API connection by retrieving account
            account = stripe.Account.retrieve()
            logger.info(f"Stripe connection validated for account: {account.id}")
            return True
        except stripe.error.AuthenticationError as e:
            logger.error(f"Stripe authentication failed: {e}")
            return False
        except Exception as e:
            logger.error(f"Stripe connection validation failed: {e}")
            return False
    
    # ============================================================================
    # REVENUE TRACKING
    # ============================================================================
    
    async def get_revenue_data(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        period_days: int = 30
    ) -> StripeRevenue:
        """
        Get comprehensive revenue data from Stripe.
        
        Args:
            start_date: Start of period (default: period_days ago)
            end_date: End of period (default: now)
            period_days: Number of days if dates not provided
            
        Returns:
            StripeRevenue object with comprehensive revenue metrics
        """
        if not end_date:
            end_date = datetime.now()
        
        if not start_date:
            start_date = end_date - timedelta(days=period_days)
        
        # Convert to Unix timestamps for Stripe
        start_timestamp = int(start_date.timestamp())
        end_timestamp = int(end_date.timestamp())
        
        try:
            # Get charges (includes one-time payments)
            charges = stripe.Charge.list(
                created={
                    'gte': start_timestamp,
                    'lte': end_timestamp
                },
                limit=100
            )
            
            # Calculate revenue metrics
            total_revenue = 0
            successful_charges = 0
            failed_charges = 0
            currency = "usd"
            
            for charge in charges.auto_paging_iter():
                if charge.status == "succeeded":
                    total_revenue += charge.amount / 100.0  # Convert from cents
                    successful_charges += 1
                    currency = charge.currency
                else:
                    failed_charges += 1
            
            # Get refunds
            refunds = stripe.Refund.list(
                created={
                    'gte': start_timestamp,
                    'lte': end_timestamp
                },
                limit=100
            )
            
            refunds_total = sum(r.amount / 100.0 for r in refunds.auto_paging_iter())
            net_revenue = total_revenue - refunds_total
            
            # Get subscription data for MRR/ARR
            subscriptions = await self.get_subscriptions(status='active')
            
            mrr = sum(
                (sub.plan_amount if sub.plan_amount else 0)
                for sub in subscriptions
            )
            arr = mrr * 12
            
            return StripeRevenue(
                total_revenue=total_revenue,
                currency=currency,
                period_start=start_date,
                period_end=end_date,
                successful_charges=successful_charges,
                failed_charges=failed_charges,
                refunds_total=refunds_total,
                net_revenue=net_revenue,
                mrr=mrr,
                arr=arr
            )
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error getting revenue: {e}")
            raise
    
    # ============================================================================
    # SUBSCRIPTION MANAGEMENT
    # ============================================================================
    
    async def get_subscriptions(
        self,
        status: Optional[str] = None,
        customer_id: Optional[str] = None,
        limit: int = 100
    ) -> List[StripeSubscription]:
        """
        Get subscriptions from Stripe.
        
        Args:
            status: Filter by status (active, canceled, past_due, etc.)
            customer_id: Filter by customer ID
            limit: Maximum number to retrieve
            
        Returns:
            List of StripeSubscription objects
        """
        try:
            params = {'limit': limit}
            
            if status:
                params['status'] = status
            
            if customer_id:
                params['customer'] = customer_id
            
            subscriptions = stripe.Subscription.list(**params)
            
            result = []
            for sub in subscriptions.auto_paging_iter():
                # Get plan details
                plan_name = sub.items.data[0].price.nickname if sub.items.data else "Unknown"
                plan_amount = (sub.items.data[0].price.unit_amount / 100.0) if sub.items.data else 0
                currency = sub.items.data[0].price.currency if sub.items.data else "usd"
                
                result.append(StripeSubscription(
                    id=sub.id,
                    customer_id=sub.customer,
                    status=sub.status,
                    plan_name=plan_name,
                    plan_amount=plan_amount,
                    currency=currency,
                    current_period_start=datetime.fromtimestamp(sub.current_period_start),
                    current_period_end=datetime.fromtimestamp(sub.current_period_end),
                    cancel_at_period_end=sub.cancel_at_period_end,
                    created=datetime.fromtimestamp(sub.created)
                ))
            
            return result
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error getting subscriptions: {e}")
            raise
    
    async def create_subscription(
        self,
        customer_id: str,
        price_id: str,
        trial_days: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> StripeSubscription:
        """Create a new subscription"""
        try:
            params = {
                'customer': customer_id,
                'items': [{'price': price_id}]
            }
            
            if trial_days:
                params['trial_period_days'] = trial_days
            
            if metadata:
                params['metadata'] = metadata
            
            subscription = stripe.Subscription.create(**params)
            
            plan_name = subscription.items.data[0].price.nickname
            plan_amount = subscription.items.data[0].price.unit_amount / 100.0
            currency = subscription.items.data[0].price.currency
            
            return StripeSubscription(
                id=subscription.id,
                customer_id=subscription.customer,
                status=subscription.status,
                plan_name=plan_name,
                plan_amount=plan_amount,
                currency=currency,
                current_period_start=datetime.fromtimestamp(subscription.current_period_start),
                current_period_end=datetime.fromtimestamp(subscription.current_period_end),
                cancel_at_period_end=subscription.cancel_at_period_end,
                created=datetime.fromtimestamp(subscription.created)
            )
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error creating subscription: {e}")
            raise
    
    async def cancel_subscription(
        self,
        subscription_id: str,
        at_period_end: bool = True
    ) -> Dict[str, Any]:
        """
        Cancel a subscription.
        
        Args:
            subscription_id: Subscription to cancel
            at_period_end: If True, cancel at end of current period. If False, cancel immediately.
        """
        try:
            if at_period_end:
                subscription = stripe.Subscription.modify(
                    subscription_id,
                    cancel_at_period_end=True
                )
                return {
                    "success": True,
                    "subscription_id": subscription_id,
                    "cancel_at": datetime.fromtimestamp(subscription.current_period_end),
                    "status": "scheduled_for_cancellation"
                }
            else:
                subscription = stripe.Subscription.delete(subscription_id)
                return {
                    "success": True,
                    "subscription_id": subscription_id,
                    "canceled_at": datetime.now(),
                    "status": "canceled"
                }
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error canceling subscription: {e}")
            raise
    
    # ============================================================================
    # CUSTOMER MANAGEMENT
    # ============================================================================
    
    async def get_customers(
        self,
        email: Optional[str] = None,
        limit: int = 100
    ) -> List[StripeCustomer]:
        """Get customers from Stripe"""
        try:
            params = {'limit': limit}
            
            if email:
                params['email'] = email
            
            customers = stripe.Customer.list(**params)
            
            result = []
            for customer in customers.auto_paging_iter():
                # Get customer's lifetime value
                charges = stripe.Charge.list(customer=customer.id, limit=100)
                lifetime_value = sum(c.amount / 100.0 for c in charges.data if c.status == "succeeded")
                
                # Get subscription status
                subscriptions = stripe.Subscription.list(customer=customer.id, status='active', limit=1)
                subscription_status = subscriptions.data[0].status if subscriptions.data else None
                
                # Get payment method
                payment_methods = stripe.PaymentMethod.list(customer=customer.id, type='card', limit=1)
                payment_method = payment_methods.data[0].card.brand if payment_methods.data else None
                
                result.append(StripeCustomer(
                    id=customer.id,
                    email=customer.email,
                    name=customer.name,
                    description=customer.description,
                    created=datetime.fromtimestamp(customer.created),
                    lifetime_value=lifetime_value,
                    subscription_status=subscription_status,
                    payment_method=payment_method,
                    metadata=customer.metadata
                ))
            
            return result
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error getting customers: {e}")
            raise
    
    async def create_customer(
        self,
        email: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> StripeCustomer:
        """Create a new customer"""
        try:
            params = {'email': email}
            
            if name:
                params['name'] = name
            if description:
                params['description'] = description
            if metadata:
                params['metadata'] = metadata
            
            customer = stripe.Customer.create(**params)
            
            return StripeCustomer(
                id=customer.id,
                email=customer.email,
                name=customer.name,
                description=customer.description,
                created=datetime.fromtimestamp(customer.created),
                lifetime_value=0.0,
                subscription_status=None,
                payment_method=None,
                metadata=customer.metadata
            )
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error creating customer: {e}")
            raise
    
    # ============================================================================
    # INVOICE MANAGEMENT
    # ============================================================================
    
    async def get_invoices(
        self,
        status: Optional[str] = None,
        customer_id: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get invoices from Stripe"""
        try:
            params = {'limit': limit}
            
            if status:
                params['status'] = status
            if customer_id:
                params['customer'] = customer_id
            
            invoices = stripe.Invoice.list(**params)
            
            result = []
            for invoice in invoices.auto_paging_iter():
                result.append({
                    'id': invoice.id,
                    'customer_id': invoice.customer,
                    'status': invoice.status,
                    'amount_due': invoice.amount_due / 100.0,
                    'amount_paid': invoice.amount_paid / 100.0,
                    'currency': invoice.currency,
                    'due_date': datetime.fromtimestamp(invoice.due_date) if invoice.due_date else None,
                    'paid': invoice.paid,
                    'created': datetime.fromtimestamp(invoice.created),
                    'invoice_pdf': invoice.invoice_pdf,
                    'hosted_invoice_url': invoice.hosted_invoice_url
                })
            
            return result
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error getting invoices: {e}")
            raise
    
    async def create_invoice(
        self,
        customer_id: str,
        description: Optional[str] = None,
        auto_finalize: bool = True
    ) -> Dict[str, Any]:
        """Create a new invoice"""
        try:
            params = {'customer': customer_id}
            
            if description:
                params['description'] = description
            
            invoice = stripe.Invoice.create(**params)
            
            if auto_finalize:
                invoice = stripe.Invoice.finalize_invoice(invoice.id)
            
            return {
                'id': invoice.id,
                'customer_id': invoice.customer,
                'status': invoice.status,
                'amount_due': invoice.amount_due / 100.0,
                'hosted_invoice_url': invoice.hosted_invoice_url,
                'invoice_pdf': invoice.invoice_pdf
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error creating invoice: {e}")
            raise
    
    # ============================================================================
    # PAYMENT PROCESSING
    # ============================================================================
    
    async def create_payment_intent(
        self,
        amount: float,
        currency: str = "usd",
        customer_id: Optional[str] = None,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a payment intent"""
        try:
            params = {
                'amount': int(amount * 100),  # Convert to cents
                'currency': currency
            }
            
            if customer_id:
                params['customer'] = customer_id
            if description:
                params['description'] = description
            if metadata:
                params['metadata'] = metadata
            
            intent = stripe.PaymentIntent.create(**params)
            
            return {
                'id': intent.id,
                'client_secret': intent.client_secret,
                'status': intent.status,
                'amount': amount,
                'currency': currency
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error creating payment intent: {e}")
            raise
    
    # ============================================================================
    # WEBHOOKS
    # ============================================================================
    
    async def process_webhook(
        self,
        payload: str,
        signature: str
    ) -> Dict[str, Any]:
        """
        Process Stripe webhook event.
        
        Args:
            payload: Raw webhook payload
            signature: Stripe signature header
            
        Returns:
            Processed event data
        """
        if not self.webhook_secret:
            raise ValueError("Webhook secret not configured")
        
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            
            event_type = event['type']
            event_data = event['data']['object']
            
            # Handle different event types
            handlers = {
                'payment_intent.succeeded': self._handle_payment_succeeded,
                'payment_intent.failed': self._handle_payment_failed,
                'customer.subscription.created': self._handle_subscription_created,
                'customer.subscription.updated': self._handle_subscription_updated,
                'customer.subscription.deleted': self._handle_subscription_deleted,
                'invoice.paid': self._handle_invoice_paid,
                'invoice.payment_failed': self._handle_invoice_failed,
            }
            
            handler = handlers.get(event_type)
            
            if handler:
                return await handler(event_data)
            else:
                logger.info(f"Unhandled webhook event type: {event_type}")
                return {"handled": False, "event_type": event_type}
                
        except ValueError as e:
            logger.error(f"Invalid webhook payload: {e}")
            raise
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid webhook signature: {e}")
            raise
    
    async def _handle_payment_succeeded(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle successful payment"""
        logger.info(f"Payment succeeded: {data['id']}")
        return {"handled": True, "event": "payment_succeeded", "payment_id": data['id']}
    
    async def _handle_payment_failed(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle failed payment"""
        logger.warning(f"Payment failed: {data['id']}")
        return {"handled": True, "event": "payment_failed", "payment_id": data['id']}
    
    async def _handle_subscription_created(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle subscription created"""
        logger.info(f"Subscription created: {data['id']}")
        return {"handled": True, "event": "subscription_created", "subscription_id": data['id']}
    
    async def _handle_subscription_updated(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle subscription updated"""
        logger.info(f"Subscription updated: {data['id']}")
        return {"handled": True, "event": "subscription_updated", "subscription_id": data['id']}
    
    async def _handle_subscription_deleted(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle subscription deleted"""
        logger.info(f"Subscription deleted: {data['id']}")
        return {"handled": True, "event": "subscription_deleted", "subscription_id": data['id']}
    
    async def _handle_invoice_paid(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle invoice paid"""
        logger.info(f"Invoice paid: {data['id']}")
        return {"handled": True, "event": "invoice_paid", "invoice_id": data['id']}
    
    async def _handle_invoice_failed(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle invoice payment failed"""
        logger.warning(f"Invoice payment failed: {data['id']}")
        return {"handled": True, "event": "invoice_failed", "invoice_id": data['id']}
    
    # ============================================================================
    # UTILITY METHODS
    # ============================================================================
    
    async def get_account_balance(self) -> Dict[str, Any]:
        """Get Stripe account balance"""
        try:
            balance = stripe.Balance.retrieve()
            
            return {
                'available': [
                    {'amount': item.amount / 100.0, 'currency': item.currency}
                    for item in balance.available
                ],
                'pending': [
                    {'amount': item.amount / 100.0, 'currency': item.currency}
                    for item in balance.pending
                ]
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error getting balance: {e}")
            raise
    
    async def get_payout_schedule(self) -> List[Dict[str, Any]]:
        """Get upcoming payouts"""
        try:
            payouts = stripe.Payout.list(status='paid', limit=10)
            
            return [
                {
                    'id': payout.id,
                    'amount': payout.amount / 100.0,
                    'currency': payout.currency,
                    'arrival_date': datetime.fromtimestamp(payout.arrival_date),
                    'status': payout.status,
                    'method': payout.method
                }
                for payout in payouts.data
            ]
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error getting payouts: {e}")
            raise

