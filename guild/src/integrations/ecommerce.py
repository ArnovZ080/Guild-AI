"""
E-commerce Platform Integrations

Comprehensive integration with Shopify, WooCommerce, and Amazon Seller Central APIs
for Customer Journey Constellation and Sales Agents.
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

class EcommercePlatform(Enum):
    SHOPIFY = "shopify"
    WOOCOMMERCE = "woocommerce"
    AMAZON_SELLER = "amazon_seller"

class OrderStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class ProductStatus(Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    DRAFT = "draft"

@dataclass
class EcommerceCredentials:
    """Credentials for e-commerce platforms"""
    platform: EcommercePlatform
    api_key: str
    api_secret: Optional[str] = None
    access_token: Optional[str] = None
    shop_domain: Optional[str] = None  # For Shopify
    site_url: Optional[str] = None  # For WooCommerce
    marketplace_id: Optional[str] = None  # For Amazon
    expires_at: Optional[datetime] = None

@dataclass
class Product:
    """Standardized product format"""
    id: str
    name: str
    description: str
    price: float
    compare_price: Optional[float]
    sku: str
    inventory_quantity: int
    weight: float
    status: ProductStatus
    category: str
    tags: List[str]
    images: List[str]
    variants: List[Dict[str, Any]]
    seo_title: Optional[str]
    seo_description: Optional[str]
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class Order:
    """Standardized order format"""
    id: str
    order_number: str
    status: OrderStatus
    total_price: float
    currency: str
    customer_id: str
    customer_email: str
    customer_name: str
    shipping_address: Dict[str, Any]
    billing_address: Dict[str, Any]
    line_items: List[Dict[str, Any]]
    shipping_method: str
    tracking_number: Optional[str]
    notes: str
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class Customer:
    """Standardized customer format"""
    id: str
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    total_spent: float
    orders_count: int
    created_at: datetime
    updated_at: datetime
    tags: List[str]
    addresses: List[Dict[str, Any]]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class ShopifyConnector:
    """Shopify API connector"""
    
    def __init__(self, credentials: EcommerceCredentials):
        self.credentials = credentials
        self.shop_domain = credentials.shop_domain
        if not self.shop_domain:
            raise ValueError("Shopify shop domain required")
        
        self.base_url = f"https://{self.shop_domain}.myshopify.com/admin/api/2023-10"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to Shopify API"""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {
                'X-Shopify-Access-Token': self.credentials.access_token,
                'Content-Type': 'application/json'
            }
            
            if params is None:
                params = {}
            
            async with self.session.request(method, url, json=data, params=params, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Shopify API request failed: {e}")
            raise
    
    async def get_products(self, limit: int = 250) -> List[Product]:
        """Get all products"""
        endpoint = "/products.json"
        params = {'limit': limit}
        
        response = await self._make_request(endpoint, params=params)
        
        products = []
        for product_data in response.get('products', []):
            product = Product(
                id=str(product_data['id']),
                name=product_data.get('title', ''),
                description=product_data.get('body_html', ''),
                price=float(product_data.get('variants', [{}])[0].get('price', 0)),
                compare_price=float(product_data.get('variants', [{}])[0].get('compare_at_price', 0)) if product_data.get('variants', [{}])[0].get('compare_at_price') else None,
                sku=product_data.get('variants', [{}])[0].get('sku', ''),
                inventory_quantity=product_data.get('variants', [{}])[0].get('inventory_quantity', 0),
                weight=float(product_data.get('variants', [{}])[0].get('weight', 0)),
                status=ProductStatus.ACTIVE if product_data.get('status') == 'active' else ProductStatus.DRAFT,
                category=product_data.get('product_type', ''),
                tags=product_data.get('tags', '').split(', ') if product_data.get('tags') else [],
                images=[img.get('src', '') for img in product_data.get('images', [])],
                variants=product_data.get('variants', []),
                seo_title=product_data.get('seo', {}).get('title'),
                seo_description=product_data.get('seo', {}).get('description'),
                created_at=datetime.fromisoformat(product_data['created_at'].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(product_data['updated_at'].replace('Z', '+00:00')),
                metadata={"raw_data": product_data}
            )
            products.append(product)
        
        return products
    
    async def create_product(self, 
                           name: str,
                           description: str,
                           price: float,
                           sku: str = None,
                           inventory_quantity: int = 0,
                           category: str = None,
                           tags: List[str] = None) -> Product:
        """Create a new product"""
        endpoint = "/products.json"
        
        data = {
            'product': {
                'title': name,
                'body_html': description,
                'product_type': category or '',
                'tags': ', '.join(tags) if tags else '',
                'variants': [{
                    'price': str(price),
                    'sku': sku or '',
                    'inventory_quantity': inventory_quantity
                }]
            }
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        product_data = response['product']
        
        product = Product(
            id=str(product_data['id']),
            name=name,
            description=description,
            price=price,
            compare_price=None,
            sku=sku or '',
            inventory_quantity=inventory_quantity,
            weight=0.0,
            status=ProductStatus.ACTIVE,
            category=category or '',
            tags=tags or [],
            images=[],
            variants=product_data.get('variants', []),
            seo_title=None,
            seo_description=None,
            created_at=datetime.fromisoformat(product_data['created_at'].replace('Z', '+00:00')),
            updated_at=datetime.fromisoformat(product_data['updated_at'].replace('Z', '+00:00')),
            metadata={"created_via_api": True, "raw_data": product_data}
        )
        
        return product
    
    async def get_orders(self, status: str = None, limit: int = 250) -> List[Order]:
        """Get all orders"""
        endpoint = "/orders.json"
        params = {'limit': limit}
        
        if status:
            params['status'] = status
        
        response = await self._make_request(endpoint, params=params)
        
        orders = []
        for order_data in response.get('orders', []):
            customer_data = order_data.get('customer', {})
            shipping_address = order_data.get('shipping_address', {})
            billing_address = order_data.get('billing_address', {})
            
            order = Order(
                id=str(order_data['id']),
                order_number=order_data.get('order_number', ''),
                status=OrderStatus(order_data.get('financial_status', 'pending')),
                total_price=float(order_data.get('total_price', 0)),
                currency=order_data.get('currency', 'USD'),
                customer_id=str(customer_data.get('id', '')),
                customer_email=customer_data.get('email', ''),
                customer_name=f"{customer_data.get('first_name', '')} {customer_data.get('last_name', '')}".strip(),
                shipping_address=shipping_address,
                billing_address=billing_address,
                line_items=order_data.get('line_items', []),
                shipping_method=order_data.get('shipping_lines', [{}])[0].get('title', ''),
                tracking_number=order_data.get('fulfillments', [{}])[0].get('tracking_number'),
                notes=order_data.get('note', ''),
                created_at=datetime.fromisoformat(order_data['created_at'].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(order_data['updated_at'].replace('Z', '+00:00')),
                metadata={"raw_data": order_data}
            )
            orders.append(order)
        
        return orders
    
    async def get_customers(self, limit: int = 250) -> List[Customer]:
        """Get all customers"""
        endpoint = "/customers.json"
        params = {'limit': limit}
        
        response = await self._make_request(endpoint, params=params)
        
        customers = []
        for customer_data in response.get('customers', []):
            customer = Customer(
                id=str(customer_data['id']),
                email=customer_data.get('email', ''),
                first_name=customer_data.get('first_name', ''),
                last_name=customer_data.get('last_name', ''),
                phone=customer_data.get('phone'),
                total_spent=float(customer_data.get('total_spent', 0)),
                orders_count=customer_data.get('orders_count', 0),
                created_at=datetime.fromisoformat(customer_data['created_at'].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(customer_data['updated_at'].replace('Z', '+00:00')),
                tags=customer_data.get('tags', '').split(', ') if customer_data.get('tags') else [],
                addresses=customer_data.get('addresses', []),
                metadata={"raw_data": customer_data}
            )
            customers.append(customer)
        
        return customers
    
    async def update_inventory(self, variant_id: str, quantity: int) -> bool:
        """Update inventory quantity for a variant"""
        endpoint = f"/inventory_levels/set.json"
        
        data = {
            'location_id': 1,  # Would need to get actual location ID
            'inventory_item_id': variant_id,
            'available': quantity
        }
        
        try:
            await self._make_request(endpoint, method='POST', data=data)
            return True
        except Exception as e:
            logger.error(f"Error updating inventory for variant {variant_id}: {e}")
            return False
    
    async def validate_connection(self) -> bool:
        """Validate Shopify API connection"""
        try:
            await self._make_request("/shop.json")
            return True
        except Exception as e:
            logger.error(f"Shopify connection validation failed: {e}")
            return False

class WooCommerceConnector:
    """WooCommerce API connector"""
    
    def __init__(self, credentials: EcommerceCredentials):
        self.credentials = credentials
        self.site_url = credentials.site_url
        if not self.site_url:
            raise ValueError("WooCommerce site URL required")
        
        self.base_url = f"{self.site_url}/wp-json/wc/v3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to WooCommerce API"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            # WooCommerce uses HTTP Basic Auth
            auth_string = f"{self.credentials.api_key}:{self.credentials.api_secret}"
            auth_bytes = auth_string.encode('ascii')
            auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
            
            headers = {
                'Authorization': f'Basic {auth_b64}',
                'Content-Type': 'application/json'
            }
            
            if params is None:
                params = {}
            
            async with self.session.request(method, url, json=data, params=params, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"WooCommerce API request failed: {e}")
            raise
    
    async def get_products(self, per_page: int = 100) -> List[Product]:
        """Get all products"""
        endpoint = "/products"
        params = {'per_page': per_page}
        
        response = await self._make_request(endpoint, params=params)
        
        products = []
        for product_data in response:
            product = Product(
                id=str(product_data['id']),
                name=product_data.get('name', ''),
                description=product_data.get('description', ''),
                price=float(product_data.get('price', 0)),
                compare_price=float(product_data.get('regular_price', 0)) if product_data.get('regular_price') else None,
                sku=product_data.get('sku', ''),
                inventory_quantity=product_data.get('stock_quantity', 0),
                weight=float(product_data.get('weight', 0)),
                status=ProductStatus.ACTIVE if product_data.get('status') == 'publish' else ProductStatus.DRAFT,
                category=product_data.get('categories', [{}])[0].get('name', '') if product_data.get('categories') else '',
                tags=[tag.get('name', '') for tag in product_data.get('tags', [])],
                images=[img.get('src', '') for img in product_data.get('images', [])],
                variants=product_data.get('variations', []),
                seo_title=product_data.get('meta_data', {}).get('_yoast_wpseo_title'),
                seo_description=product_data.get('meta_data', {}).get('_yoast_wpseo_metadesc'),
                created_at=datetime.fromisoformat(product_data['date_created'].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(product_data['date_modified'].replace('Z', '+00:00')),
                metadata={"raw_data": product_data}
            )
            products.append(product)
        
        return products
    
    async def get_orders(self, status: str = None, per_page: int = 100) -> List[Order]:
        """Get all orders"""
        endpoint = "/orders"
        params = {'per_page': per_page}
        
        if status:
            params['status'] = status
        
        response = await self._make_request(endpoint, params=params)
        
        orders = []
        for order_data in response:
            billing = order_data.get('billing', {})
            shipping = order_data.get('shipping', {})
            
            order = Order(
                id=str(order_data['id']),
                order_number=order_data.get('number', ''),
                status=OrderStatus(order_data.get('status', 'pending')),
                total_price=float(order_data.get('total', 0)),
                currency=order_data.get('currency', 'USD'),
                customer_id=str(order_data.get('customer_id', '')),
                customer_email=billing.get('email', ''),
                customer_name=f"{billing.get('first_name', '')} {billing.get('last_name', '')}".strip(),
                shipping_address=shipping,
                billing_address=billing,
                line_items=order_data.get('line_items', []),
                shipping_method=order_data.get('shipping_lines', [{}])[0].get('method_title', ''),
                tracking_number=None,  # Would need additional API call
                notes=order_data.get('customer_note', ''),
                created_at=datetime.fromisoformat(order_data['date_created'].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(order_data['date_modified'].replace('Z', '+00:00')),
                metadata={"raw_data": order_data}
            )
            orders.append(order)
        
        return orders
    
    async def validate_connection(self) -> bool:
        """Validate WooCommerce API connection"""
        try:
            await self._make_request("/products", {'per_page': 1})
            return True
        except Exception as e:
            logger.error(f"WooCommerce connection validation failed: {e}")
            return False

class EcommerceManager:
    """Manager for multiple e-commerce platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[EcommercePlatform, Any] = {}
    
    def add_platform(self, platform: EcommercePlatform, credentials: EcommerceCredentials):
        """Add an e-commerce platform connector"""
        if platform == EcommercePlatform.SHOPIFY:
            self.connectors[platform] = ShopifyConnector(credentials)
        elif platform == EcommercePlatform.WOOCOMMERCE:
            self.connectors[platform] = WooCommerceConnector(credentials)
        
        logger.info(f"Added {platform.value} connector")
    
    async def get_unified_products(self, platforms: List[EcommercePlatform]) -> Dict[str, List[Product]]:
        """Get products from multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == EcommercePlatform.SHOPIFY:
                            products = await connector.get_products()
                        elif platform == EcommercePlatform.WOOCOMMERCE:
                            products = await connector.get_products()
                        else:
                            products = []
                        
                        results[platform.value] = products
                        
                except Exception as e:
                    logger.error(f"Error getting products from {platform.value}: {e}")
                    results[platform.value] = []
        
        return results
    
    async def get_unified_orders(self, platforms: List[EcommercePlatform], status: str = None) -> Dict[str, List[Order]]:
        """Get orders from multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == EcommercePlatform.SHOPIFY:
                            orders = await connector.get_orders(status=status)
                        elif platform == EcommercePlatform.WOOCOMMERCE:
                            orders = await connector.get_orders(status=status)
                        else:
                            orders = []
                        
                        results[platform.value] = orders
                        
                except Exception as e:
                    logger.error(f"Error getting orders from {platform.value}: {e}")
                    results[platform.value] = []
        
        return results
    
    async def create_cross_platform_product(self, 
                                          platforms: List[EcommercePlatform],
                                          name: str,
                                          description: str,
                                          price: float,
                                          **kwargs) -> Dict[str, Product]:
        """Create product across multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == EcommercePlatform.SHOPIFY:
                            product = await connector.create_product(
                                name=name,
                                description=description,
                                price=price,
                                **kwargs
                            )
                        elif platform == EcommercePlatform.WOOCOMMERCE:
                            # WooCommerce would need different implementation
                            continue
                        else:
                            continue
                        
                        results[platform.value] = product
                        
                except Exception as e:
                    logger.error(f"Error creating product on {platform.value}: {e}")
        
        return results
    
    async def validate_all_connections(self) -> Dict[EcommercePlatform, bool]:
        """Validate connections to all e-commerce platforms"""
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

# Global e-commerce manager
ecommerce_manager = EcommerceManager()

# Convenience functions
def add_ecommerce_credentials(platform: str, 
                             api_key: str,
                             api_secret: str = None,
                             access_token: str = None,
                             shop_domain: str = None,
                             site_url: str = None):
    """Add e-commerce platform credentials"""
    credentials = EcommerceCredentials(
        platform=EcommercePlatform(platform),
        api_key=api_key,
        api_secret=api_secret,
        access_token=access_token,
        shop_domain=shop_domain,
        site_url=site_url
    )
    ecommerce_manager.add_platform(credentials.platform, credentials)

async def get_products(platforms: List[str]):
    """Get products from multiple e-commerce platforms"""
    platform_enums = [EcommercePlatform(platform) for platform in platforms]
    return await ecommerce_manager.get_unified_products(platform_enums)

async def get_orders(platforms: List[str], status: str = None):
    """Get orders from multiple e-commerce platforms"""
    platform_enums = [EcommercePlatform(platform) for platform in platforms]
    return await ecommerce_manager.get_unified_orders(platform_enums, status)

async def create_product(platforms: List[str], name: str, description: str, price: float, **kwargs):
    """Create product across multiple e-commerce platforms"""
    platform_enums = [EcommercePlatform(platform) for platform in platforms]
    return await ecommerce_manager.create_cross_platform_product(platform_enums, name, description, price, **kwargs)
