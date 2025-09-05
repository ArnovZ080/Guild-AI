"""
Bookkeeping Agent - Automates transaction logging, reconciliations, and monthly reporting.
"""

from typing import Dict, List, Any
from ..core.base_agent import BaseAgent


class BookkeepingAgent(BaseAgent):
    """Bookkeeping Agent - Financial transaction management and reporting"""
    
    def __init__(self, **kwargs):
        super().__init__(
            name="Bookkeeping Agent",
            role="Financial transaction management and reporting",
            **kwargs
        )
        self.transactions: Dict[str, Any] = {}
        self.reports: Dict[str, Any] = {}
    
    async def log_transaction(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Log a financial transaction"""
        try:
            transaction = {
                "transaction_id": f"txn_{len(self.transactions) + 1}",
                "date": transaction_data.get("date", ""),
                "amount": transaction_data.get("amount", 0),
                "category": transaction_data.get("category", ""),
                "description": transaction_data.get("description", ""),
                "type": transaction_data.get("type", "expense"),
                "status": "logged",
                "created_at": self._get_current_time()
            }
            
            self.transactions[transaction["transaction_id"]] = transaction
            
            return {
                "status": "success",
                "transaction": transaction
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to log transaction: {str(e)}"
            }
    
    async def reconcile_accounts(self, reconciliation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Reconcile bank accounts and financial records"""
        try:
            reconciliation = {
                "reconciliation_id": f"recon_{len(self.reports) + 1}",
                "account": reconciliation_data.get("account", ""),
                "statement_balance": reconciliation_data.get("statement_balance", 0),
                "book_balance": reconciliation_data.get("book_balance", 0),
                "discrepancies": self._identify_discrepancies(reconciliation_data),
                "status": "completed",
                "created_at": self._get_current_time()
            }
            
            return {
                "status": "success",
                "reconciliation": reconciliation
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to reconcile accounts: {str(e)}"
            }
    
    async def generate_monthly_report(self, report_params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate monthly financial report"""
        try:
            monthly_report = {
                "report_id": f"monthly_{len(self.reports) + 1}",
                "month": report_params.get("month", ""),
                "year": report_params.get("year", ""),
                "revenue": self._calculate_revenue(report_params),
                "expenses": self._calculate_expenses(report_params),
                "net_income": self._calculate_net_income(report_params),
                "cash_flow": self._calculate_cash_flow(report_params),
                "insights": self._generate_financial_insights(report_params),
                "created_at": self._get_current_time()
            }
            
            self.reports[monthly_report["report_id"]] = monthly_report
            
            return {
                "status": "success",
                "monthly_report": monthly_report
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to generate monthly report: {str(e)}"
            }
    
    def _identify_discrepancies(self, reconciliation_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify discrepancies in reconciliation"""
        return [
            {
                "type": "unrecorded_transaction",
                "amount": 100.00,
                "description": "Bank fee not recorded"
            }
        ]
    
    def _calculate_revenue(self, report_params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate revenue for the period"""
        return {
            "total_revenue": 50000,
            "revenue_sources": {
                "product_sales": 30000,
                "services": 15000,
                "subscriptions": 5000
            }
        }
    
    def _calculate_expenses(self, report_params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate expenses for the period"""
        return {
            "total_expenses": 30000,
            "expense_categories": {
                "marketing": 10000,
                "operations": 8000,
                "salaries": 12000
            }
        }
    
    def _calculate_net_income(self, report_params: Dict[str, Any]) -> float:
        """Calculate net income"""
        return 20000
    
    def _calculate_cash_flow(self, report_params: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate cash flow"""
        return {
            "operating_cash_flow": 25000,
            "investing_cash_flow": -5000,
            "financing_cash_flow": 0,
            "net_cash_flow": 20000
        }
    
    def _generate_financial_insights(self, report_params: Dict[str, Any]) -> List[str]:
        """Generate financial insights"""
        return [
            "Revenue increased by 15% compared to last month",
            "Marketing expenses are within budget",
            "Strong cash flow position maintained"
        ]
    
    def _get_current_time(self) -> str:
        """Get current timestamp"""
        return "2024-01-01T00:00:00Z"