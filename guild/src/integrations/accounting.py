"""
Accounting & Finance Integrations

This module provides integrations with major accounting and finance platforms:
- QuickBooks Online API
- Xero API  
- Sage API

For use with Bookkeeping, Tax, and Expense agents to sync live financial data.
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date
from dataclasses import dataclass, asdict
from enum import Enum
import base64
from guild.src.core.config import settings
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class AccountingProvider(Enum):
    QUICKBOOKS = "quickbooks"
    XERO = "xero"
    SAGE = "sage"

@dataclass
class AccountingCredentials:
    """Credentials for accounting platforms"""
    provider: AccountingProvider
    client_id: str
    client_secret: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    company_id: Optional[str] = None
    expires_at: Optional[datetime] = None

@dataclass
class Transaction:
    """Standardized transaction format"""
    id: str
    date: date
    amount: float
    description: str
    account: str
    category: Optional[str] = None
    reference: Optional[str] = None
    type: str = "expense"  # income, expense, transfer
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class Account:
    """Standardized account format"""
    id: str
    name: str
    type: str  # asset, liability, equity, income, expense
    balance: float
    currency: str = "USD"
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class Customer:
    """Standardized customer format"""
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[Dict[str, str]] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class QuickBooksConnector:
    """QuickBooks Online API connector"""
    
    def __init__(self, credentials: AccountingCredentials):
        self.credentials = credentials
        self.base_url = "https://sandbox-quickbooks.api.intuit.com" if settings.FASTAPI_APP_ENV == "local" else "https://quickbooks.api.intuit.com"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers"""
        if not self.credentials.access_token:
            await self._refresh_token()
        
        return {
            "Authorization": f"Bearer {self.credentials.access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    
    async def _refresh_token(self):
        """Refresh access token"""
        if not self.credentials.refresh_token:
            raise ValueError("No refresh token available")
        
        auth_string = base64.b64encode(
            f"{self.credentials.client_id}:{self.credentials.client_secret}".encode()
        ).decode()
        
        headers = {
            "Authorization": f"Basic {auth_string}",
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "refresh_token",
            "refresh_token": self.credentials.refresh_token
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
                headers=headers,
                data=data
            ) as response:
                if response.status == 200:
                    token_data = await response.json()
                    self.credentials.access_token = token_data["access_token"]
                    self.credentials.refresh_token = token_data.get("refresh_token", self.credentials.refresh_token)
                    self.credentials.expires_at = datetime.now().timestamp() + token_data["expires_in"]
                else:
                    raise Exception(f"Token refresh failed: {await response.text()}")
    
    async def get_transactions(self, start_date: date, end_date: date) -> List[Transaction]:
        """Get transactions from QuickBooks"""
        headers = await self._get_auth_headers()
        
        # QuickBooks uses Purchase and Sales entities for transactions
        transactions = []
        
        # Get Purchase transactions (expenses)
        purchase_url = f"{self.base_url}/v3/company/{self.credentials.company_id}/purchases"
        params = {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
        
        async with self.session.get(purchase_url, headers=headers, params=params) as response:
            if response.status == 200:
                data = await response.json()
                for purchase in data.get("QueryResponse", {}).get("Purchase", []):
                    transaction = Transaction(
                        id=purchase["Id"],
                        date=datetime.strptime(purchase["TxnDate"], "%Y-%m-%d").date(),
                        amount=float(purchase["TotalAmt"]),
                        description=purchase.get("PrivateNote", ""),
                        account="Purchases",
                        type="expense",
                        metadata={"quickbooks_type": "purchase", "raw_data": purchase}
                    )
                    transactions.append(transaction)
        
        # Get Sales transactions (income)
        sales_url = f"{self.base_url}/v3/company/{self.credentials.company_id}/salesreceipts"
        async with self.session.get(sales_url, headers=headers, params=params) as response:
            if response.status == 200:
                data = await response.json()
                for sale in data.get("QueryResponse", {}).get("SalesReceipt", []):
                    transaction = Transaction(
                        id=sale["Id"],
                        date=datetime.strptime(sale["TxnDate"], "%Y-%m-%d").date(),
                        amount=float(sale["TotalAmt"]),
                        description=sale.get("PrivateNote", ""),
                        account="Sales",
                        type="income",
                        metadata={"quickbooks_type": "sales", "raw_data": sale}
                    )
                    transactions.append(transaction)
        
        return transactions
    
    async def get_accounts(self) -> List[Account]:
        """Get chart of accounts from QuickBooks"""
        headers = await self._get_auth_headers()
        url = f"{self.base_url}/v3/company/{self.credentials.company_id}/accounts"
        
        async with self.session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                accounts = []
                for account in data.get("QueryResponse", {}).get("Account", []):
                    account_obj = Account(
                        id=account["Id"],
                        name=account["Name"],
                        type=account.get("AccountType", "unknown"),
                        balance=float(account.get("CurrentBalance", 0)),
                        currency="USD",
                        metadata={"quickbooks_data": account}
                    )
                    accounts.append(account_obj)
                return accounts
        
        return []
    
    async def get_customers(self) -> List[Customer]:
        """Get customers from QuickBooks"""
        headers = await self._get_auth_headers()
        url = f"{self.base_url}/v3/company/{self.credentials.company_id}/customers"
        
        async with self.session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                customers = []
                for customer in data.get("QueryResponse", {}).get("Customer", []):
                    customer_obj = Customer(
                        id=customer["Id"],
                        name=customer["Name"],
                        email=customer.get("PrimaryEmailAddr", {}).get("Address"),
                        phone=customer.get("PrimaryPhone", {}).get("FreeFormNumber"),
                        metadata={"quickbooks_data": customer}
                    )
                    customers.append(customer_obj)
                return customers
        
        return []

class XeroConnector:
    """Xero API connector"""
    
    def __init__(self, credentials: AccountingCredentials):
        self.credentials = credentials
        self.base_url = "https://api.xero.com"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers"""
        return {
            "Authorization": f"Bearer {self.credentials.access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    
    async def get_transactions(self, start_date: date, end_date: date) -> List[Transaction]:
        """Get transactions from Xero"""
        headers = await self._get_auth_headers()
        
        # Xero uses BankTransactions for most financial data
        url = f"{self.base_url}/api.xro/2.0/BankTransactions"
        params = {
            "where": f"Date >= DateTime({start_date.year}, {start_date.month}, {start_date.day}) AND Date <= DateTime({end_date.year}, {end_date.month}, {end_date.day})"
        }
        
        async with self.session.get(url, headers=headers, params=params) as response:
            if response.status == 200:
                data = await response.json()
                transactions = []
                for txn in data.get("BankTransactions", []):
                    transaction = Transaction(
                        id=txn["BankTransactionID"],
                        date=datetime.strptime(txn["Date"], "%Y-%m-%d").date(),
                        amount=float(txn["Total"]),
                        description=txn.get("Reference", ""),
                        account=txn.get("BankAccount", {}).get("Name", ""),
                        type="expense" if float(txn["Total"]) < 0 else "income",
                        metadata={"xero_data": txn}
                    )
                    transactions.append(transaction)
                return transactions
        
        return []
    
    async def get_accounts(self) -> List[Account]:
        """Get chart of accounts from Xero"""
        headers = await self._get_auth_headers()
        url = f"{self.base_url}/api.xro/2.0/Accounts"
        
        async with self.session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                accounts = []
                for account in data.get("Accounts", []):
                    account_obj = Account(
                        id=account["AccountID"],
                        name=account["Name"],
                        type=account.get("Type", "unknown"),
                        balance=float(account.get("Balance", 0)),
                        currency=account.get("CurrencyCode", "USD"),
                        metadata={"xero_data": account}
                    )
                    accounts.append(account_obj)
                return accounts
        
        return []
    
    async def get_customers(self) -> List[Customer]:
        """Get customers from Xero"""
        headers = await self._get_auth_headers()
        url = f"{self.base_url}/api.xro/2.0/Contacts"
        
        async with self.session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                customers = []
                for contact in data.get("Contacts", []):
                    customer_obj = Customer(
                        id=contact["ContactID"],
                        name=contact["Name"],
                        email=contact.get("EmailAddress"),
                        phone=contact.get("Phones", [{}])[0].get("PhoneNumber") if contact.get("Phones") else None,
                        metadata={"xero_data": contact}
                    )
                    customers.append(customer_obj)
                return customers
        
        return []

class SageConnector:
    """Sage API connector"""
    
    def __init__(self, credentials: AccountingCredentials):
        self.credentials = credentials
        self.base_url = "https://api.columbus.sage.com"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers"""
        return {
            "Authorization": f"Bearer {self.credentials.access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    
    async def get_transactions(self, start_date: date, end_date: date) -> List[Transaction]:
        """Get transactions from Sage"""
        headers = await self._get_auth_headers()
        url = f"{self.base_url}/api/v1/transactions"
        
        params = {
            "from": start_date.isoformat(),
            "to": end_date.isoformat()
        }
        
        async with self.session.get(url, headers=headers, params=params) as response:
            if response.status == 200:
                data = await response.json()
                transactions = []
                for txn in data.get("transactions", []):
                    transaction = Transaction(
                        id=txn["id"],
                        date=datetime.strptime(txn["date"], "%Y-%m-%d").date(),
                        amount=float(txn["amount"]),
                        description=txn.get("description", ""),
                        account=txn.get("account", ""),
                        type=txn.get("type", "expense"),
                        metadata={"sage_data": txn}
                    )
                    transactions.append(transaction)
                return transactions
        
        return []
    
    async def get_accounts(self) -> List[Account]:
        """Get chart of accounts from Sage"""
        headers = await self._get_auth_headers()
        url = f"{self.base_url}/api/v1/accounts"
        
        async with self.session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                accounts = []
                for account in data.get("accounts", []):
                    account_obj = Account(
                        id=account["id"],
                        name=account["name"],
                        type=account.get("type", "unknown"),
                        balance=float(account.get("balance", 0)),
                        currency=account.get("currency", "USD"),
                        metadata={"sage_data": account}
                    )
                    accounts.append(account_obj)
                return accounts
        
        return []
    
    async def get_customers(self) -> List[Customer]:
        """Get customers from Sage"""
        headers = await self._get_auth_headers()
        url = f"{self.base_url}/api/v1/customers"
        
        async with self.session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                customers = []
                for customer in data.get("customers", []):
                    customer_obj = Customer(
                        id=customer["id"],
                        name=customer["name"],
                        email=customer.get("email"),
                        phone=customer.get("phone"),
                        metadata={"sage_data": customer}
                    )
                    customers.append(customer_obj)
                return customers
        
        return []

class AccountingIntegrationManager:
    """Manages multiple accounting platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[AccountingProvider, Union[QuickBooksConnector, XeroConnector, SageConnector]] = {}
        self.credentials: Dict[AccountingProvider, AccountingCredentials] = {}
    
    def add_credentials(self, provider: AccountingProvider, credentials: AccountingCredentials):
        """Add credentials for an accounting provider"""
        self.credentials[provider] = credentials
        
        # Initialize connector
        if provider == AccountingProvider.QUICKBOOKS:
            self.connectors[provider] = QuickBooksConnector(credentials)
        elif provider == AccountingProvider.XERO:
            self.connectors[provider] = XeroConnector(credentials)
        elif provider == AccountingProvider.SAGE:
            self.connectors[provider] = SageConnector(credentials)
    
    async def get_all_transactions(self, start_date: date, end_date: date) -> Dict[AccountingProvider, List[Transaction]]:
        """Get transactions from all connected accounting platforms"""
        results = {}
        
        for provider, connector in self.connectors.items():
            try:
                async with connector:
                    transactions = await connector.get_transactions(start_date, end_date)
                    results[provider] = transactions
                    logger.info(f"Retrieved {len(transactions)} transactions from {provider.value}")
            except Exception as e:
                logger.error(f"Error retrieving transactions from {provider.value}: {e}")
                results[provider] = []
        
        return results
    
    async def get_all_accounts(self) -> Dict[AccountingProvider, List[Account]]:
        """Get accounts from all connected accounting platforms"""
        results = {}
        
        for provider, connector in self.connectors.items():
            try:
                async with connector:
                    accounts = await connector.get_accounts()
                    results[provider] = accounts
                    logger.info(f"Retrieved {len(accounts)} accounts from {provider.value}")
            except Exception as e:
                logger.error(f"Error retrieving accounts from {provider.value}: {e}")
                results[provider] = []
        
        return results
    
    async def get_all_customers(self) -> Dict[AccountingProvider, List[Customer]]:
        """Get customers from all connected accounting platforms"""
        results = {}
        
        for provider, connector in self.connectors.items():
            try:
                async with connector:
                    customers = await connector.get_customers()
                    results[provider] = customers
                    logger.info(f"Retrieved {len(customers)} customers from {provider.value}")
            except Exception as e:
                logger.error(f"Error retrieving customers from {provider.value}: {e}")
                results[provider] = []
        
        return results
    
    def get_connected_providers(self) -> List[AccountingProvider]:
        """Get list of connected accounting providers"""
        return list(self.connectors.keys())

# Global accounting integration manager
accounting_manager = AccountingIntegrationManager()

# Convenience functions
async def sync_accounting_data(start_date: date, end_date: date) -> Dict[str, Any]:
    """Sync data from all connected accounting platforms"""
    transactions = await accounting_manager.get_all_transactions(start_date, end_date)
    accounts = await accounting_manager.get_all_accounts()
    customers = await accounting_manager.get_all_customers()
    
    return {
        "transactions": {provider.value: [asdict(txn) for txn in txns] for provider, txns in transactions.items()},
        "accounts": {provider.value: [asdict(acc) for acc in accts] for provider, accts in accounts.items()},
        "customers": {provider.value: [asdict(cust) for cust in custs] for provider, custs in customers.items()},
        "connected_providers": [provider.value for provider in accounting_manager.get_connected_providers()]
    }

def add_quickbooks_credentials(client_id: str, client_secret: str, access_token: str = None, refresh_token: str = None, company_id: str = None):
    """Add QuickBooks credentials"""
    credentials = AccountingCredentials(
        provider=AccountingProvider.QUICKBOOKS,
        client_id=client_id,
        client_secret=client_secret,
        access_token=access_token,
        refresh_token=refresh_token,
        company_id=company_id
    )
    accounting_manager.add_credentials(AccountingProvider.QUICKBOOKS, credentials)

def add_xero_credentials(client_id: str, client_secret: str, access_token: str, company_id: str = None):
    """Add Xero credentials"""
    credentials = AccountingCredentials(
        provider=AccountingProvider.XERO,
        client_id=client_id,
        client_secret=client_secret,
        access_token=access_token,
        company_id=company_id
    )
    accounting_manager.add_credentials(AccountingProvider.XERO, credentials)

def add_sage_credentials(client_id: str, client_secret: str, access_token: str, company_id: str = None):
    """Add Sage credentials"""
    credentials = AccountingCredentials(
        provider=AccountingProvider.SAGE,
        client_id=client_id,
        client_secret=client_secret,
        access_token=access_token,
        company_id=company_id
    )
    accounting_manager.add_credentials(AccountingProvider.SAGE, credentials)
