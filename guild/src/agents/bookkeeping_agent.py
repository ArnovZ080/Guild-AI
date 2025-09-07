"""
Bookkeeping Agent - Automates transaction logging, reconciliations, and monthly reporting
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class Transaction:
    transaction_id: str
    date: datetime
    description: str
    amount: float
    category: str
    account: str
    status: str

@dataclass
class FinancialReport:
    report_id: str
    report_type: str
    period: str
    data: Dict[str, Any]
    generated_date: datetime

class BookkeepingAgent:
    """Bookkeeping Agent - Automates transaction logging, reconciliations, and monthly reporting"""
    
    def __init__(self, name: str = "Bookkeeping Agent"):
        self.name = name
        self.role = "Financial Data Processor"
        self.expertise = [
            "Transaction Processing",
            "Financial Reporting",
            "Account Reconciliation",
            "Expense Categorization",
            "Compliance Management",
            "Data Validation"
        ]
    
    def process_transactions(self, 
                           transaction_data: List[Dict[str, Any]],
                           categorization_rules: Dict[str, Any]) -> List[Transaction]:
        """Process and categorize financial transactions"""
        
        processed_transactions = []
        
        for data in transaction_data:
            # Validate transaction data
            validated_data = self._validate_transaction_data(data)
            
            if validated_data:
                # Categorize transaction
                category = self._categorize_transaction(validated_data, categorization_rules)
                
                # Create transaction object
                transaction = Transaction(
                    transaction_id=f"txn_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    date=validated_data.get("date", datetime.now()),
                    description=validated_data.get("description", ""),
                    amount=validated_data.get("amount", 0.0),
                    category=category,
                    account=validated_data.get("account", "default"),
                    status="processed"
                )
                
                processed_transactions.append(transaction)
        
        return processed_transactions
    
    def _validate_transaction_data(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Validate transaction data for completeness and accuracy"""
        
        required_fields = ["amount", "description"]
        
        for field in required_fields:
            if field not in data or data[field] is None:
                return None
        
        # Validate amount is numeric
        try:
            float(data["amount"])
        except (ValueError, TypeError):
            return None
        
        return data
    
    def _categorize_transaction(self, 
                              transaction_data: Dict[str, Any],
                              categorization_rules: Dict[str, Any]) -> str:
        """Categorize transaction based on rules and description"""
        
        description = transaction_data.get("description", "").lower()
        amount = float(transaction_data.get("amount", 0))
        
        # Apply categorization rules
        for category, rules in categorization_rules.items():
            if self._matches_categorization_rules(description, amount, rules):
                return category
        
        # Default categorization based on amount and description
        if amount < 0:  # Expense
            if any(word in description for word in ["office", "supplies", "equipment"]):
                return "Office Expenses"
            elif any(word in description for word in ["travel", "transport", "fuel"]):
                return "Travel Expenses"
            elif any(word in description for word in ["marketing", "advertising", "promotion"]):
                return "Marketing Expenses"
            else:
                return "General Expenses"
        else:  # Income
            if any(word in description for word in ["sale", "revenue", "income"]):
                return "Sales Revenue"
            elif any(word in description for word in ["refund", "rebate"]):
                return "Refunds"
            else:
                return "Other Income"
    
    def _matches_categorization_rules(self, 
                                    description: str,
                                    amount: float,
                                    rules: Dict[str, Any]) -> bool:
        """Check if transaction matches categorization rules"""
        
        # Check description keywords
        if "keywords" in rules:
            if not any(keyword.lower() in description for keyword in rules["keywords"]):
                return False
        
        # Check amount range
        if "amount_range" in rules:
            min_amount = rules["amount_range"].get("min", float('-inf'))
            max_amount = rules["amount_range"].get("max", float('inf'))
            if not (min_amount <= amount <= max_amount):
                return False
        
        return True
    
    def reconcile_accounts(self, 
                         bank_statement: List[Dict[str, Any]],
                         internal_records: List[Transaction]) -> Dict[str, Any]:
        """Reconcile bank statement with internal records"""
        
        reconciliation_result = {
            "reconciliation_date": datetime.now(),
            "total_bank_transactions": len(bank_statement),
            "total_internal_transactions": len(internal_records),
            "matched_transactions": 0,
            "unmatched_bank_transactions": [],
            "unmatched_internal_transactions": [],
            "discrepancies": []
        }
        
        # Convert internal records to comparable format
        internal_dict = {}
        for transaction in internal_records:
            key = f"{transaction.date.strftime('%Y-%m-%d')}_{transaction.amount}_{transaction.description}"
            internal_dict[key] = transaction
        
        # Match bank transactions with internal records
        for bank_transaction in bank_statement:
            bank_key = f"{bank_transaction['date']}_{bank_transaction['amount']}_{bank_transaction['description']}"
            
            if bank_key in internal_dict:
                reconciliation_result["matched_transactions"] += 1
                del internal_dict[bank_key]
            else:
                reconciliation_result["unmatched_bank_transactions"].append(bank_transaction)
        
        # Remaining internal transactions are unmatched
        reconciliation_result["unmatched_internal_transactions"] = list(internal_dict.values())
        
        # Calculate reconciliation status
        match_rate = reconciliation_result["matched_transactions"] / max(reconciliation_result["total_bank_transactions"], 1)
        reconciliation_result["match_rate"] = match_rate
        reconciliation_result["status"] = "reconciled" if match_rate >= 0.95 else "needs_review"
        
        return reconciliation_result
    
    def generate_financial_report(self, 
                                report_type: str,
                                period: str,
                                transaction_data: List[Transaction]) -> FinancialReport:
        """Generate comprehensive financial reports"""
        
        if report_type == "profit_loss":
            report_data = self._generate_profit_loss_report(transaction_data, period)
        elif report_type == "balance_sheet":
            report_data = self._generate_balance_sheet_report(transaction_data, period)
        elif report_type == "cash_flow":
            report_data = self._generate_cash_flow_report(transaction_data, period)
        elif report_type == "expense_analysis":
            report_data = self._generate_expense_analysis_report(transaction_data, period)
        else:
            report_data = self._generate_summary_report(transaction_data, period)
        
        report_id = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return FinancialReport(
            report_id=report_id,
            report_type=report_type,
            period=period,
            data=report_data,
            generated_date=datetime.now()
        )
    
    def _generate_profit_loss_report(self, 
                                   transactions: List[Transaction],
                                   period: str) -> Dict[str, Any]:
        """Generate Profit and Loss report"""
        
        # Categorize transactions
        revenue = 0.0
        expenses = 0.0
        expense_categories = {}
        
        for transaction in transactions:
            if transaction.amount > 0:  # Revenue
                revenue += transaction.amount
            else:  # Expenses
                expenses += abs(transaction.amount)
                
                # Track expense categories
                category = transaction.category
                if category not in expense_categories:
                    expense_categories[category] = 0.0
                expense_categories[category] += abs(transaction.amount)
        
        gross_profit = revenue - expenses
        profit_margin = (gross_profit / revenue * 100) if revenue > 0 else 0
        
        return {
            "period": period,
            "revenue": {
                "total_revenue": revenue,
                "revenue_breakdown": self._categorize_revenue(transactions)
            },
            "expenses": {
                "total_expenses": expenses,
                "expense_categories": expense_categories
            },
            "profit": {
                "gross_profit": gross_profit,
                "profit_margin_percentage": profit_margin
            },
            "summary": {
                "total_transactions": len(transactions),
                "average_transaction_amount": (revenue + expenses) / len(transactions) if transactions else 0
            }
        }
    
    def _categorize_revenue(self, transactions: List[Transaction]) -> Dict[str, float]:
        """Categorize revenue transactions"""
        
        revenue_categories = {}
        
        for transaction in transactions:
            if transaction.amount > 0:  # Revenue
                category = transaction.category
                if category not in revenue_categories:
                    revenue_categories[category] = 0.0
                revenue_categories[category] += transaction.amount
        
        return revenue_categories
    
    def _generate_balance_sheet_report(self, 
                                     transactions: List[Transaction],
                                     period: str) -> Dict[str, Any]:
        """Generate Balance Sheet report"""
        
        # Calculate assets, liabilities, and equity
        assets = 0.0
        liabilities = 0.0
        
        for transaction in transactions:
            if transaction.amount > 0:  # Asset increase
                assets += transaction.amount
            else:  # Liability increase
                liabilities += abs(transaction.amount)
        
        equity = assets - liabilities
        
        return {
            "period": period,
            "assets": {
                "total_assets": assets,
                "current_assets": assets * 0.7,  # Estimate
                "fixed_assets": assets * 0.3     # Estimate
            },
            "liabilities": {
                "total_liabilities": liabilities,
                "current_liabilities": liabilities * 0.8,  # Estimate
                "long_term_liabilities": liabilities * 0.2  # Estimate
            },
            "equity": {
                "total_equity": equity,
                "retained_earnings": equity * 0.8,  # Estimate
                "owner_equity": equity * 0.2        # Estimate
            }
        }
    
    def _generate_cash_flow_report(self, 
                                 transactions: List[Transaction],
                                 period: str) -> Dict[str, Any]:
        """Generate Cash Flow report"""
        
        operating_cash_flow = 0.0
        investing_cash_flow = 0.0
        financing_cash_flow = 0.0
        
        for transaction in transactions:
            amount = transaction.amount
            
            # Categorize cash flow
            if "operating" in transaction.category.lower() or "revenue" in transaction.category.lower():
                operating_cash_flow += amount
            elif "investment" in transaction.category.lower() or "equipment" in transaction.category.lower():
                investing_cash_flow += amount
            elif "loan" in transaction.category.lower() or "financing" in transaction.category.lower():
                financing_cash_flow += amount
            else:
                operating_cash_flow += amount  # Default to operating
        
        net_cash_flow = operating_cash_flow + investing_cash_flow + financing_cash_flow
        
        return {
            "period": period,
            "operating_cash_flow": operating_cash_flow,
            "investing_cash_flow": investing_cash_flow,
            "financing_cash_flow": financing_cash_flow,
            "net_cash_flow": net_cash_flow,
            "cash_flow_summary": {
                "positive_cash_flow": net_cash_flow > 0,
                "cash_flow_trend": "improving" if net_cash_flow > 0 else "declining"
            }
        }
    
    def _generate_expense_analysis_report(self, 
                                        transactions: List[Transaction],
                                        period: str) -> Dict[str, Any]:
        """Generate detailed expense analysis report"""
        
        expense_categories = {}
        monthly_expenses = {}
        
        for transaction in transactions:
            if transaction.amount < 0:  # Expense
                amount = abs(transaction.amount)
                category = transaction.category
                month = transaction.date.strftime('%Y-%m')
                
                # Track by category
                if category not in expense_categories:
                    expense_categories[category] = 0.0
                expense_categories[category] += amount
                
                # Track by month
                if month not in monthly_expenses:
                    monthly_expenses[month] = 0.0
                monthly_expenses[month] += amount
        
        total_expenses = sum(expense_categories.values())
        
        # Calculate expense ratios
        expense_ratios = {}
        for category, amount in expense_categories.items():
            expense_ratios[category] = (amount / total_expenses * 100) if total_expenses > 0 else 0
        
        return {
            "period": period,
            "total_expenses": total_expenses,
            "expense_categories": expense_categories,
            "expense_ratios": expense_ratios,
            "monthly_breakdown": monthly_expenses,
            "top_expense_categories": sorted(expense_categories.items(), key=lambda x: x[1], reverse=True)[:5],
            "expense_trends": self._calculate_expense_trends(monthly_expenses)
        }
    
    def _calculate_expense_trends(self, monthly_expenses: Dict[str, float]) -> Dict[str, Any]:
        """Calculate expense trends over time"""
        
        if len(monthly_expenses) < 2:
            return {"trend": "insufficient_data"}
        
        sorted_months = sorted(monthly_expenses.keys())
        first_month_expense = monthly_expenses[sorted_months[0]]
        last_month_expense = monthly_expenses[sorted_months[-1]]
        
        if first_month_expense > 0:
            growth_rate = ((last_month_expense - first_month_expense) / first_month_expense) * 100
        else:
            growth_rate = 0
        
        return {
            "trend": "increasing" if growth_rate > 5 else "decreasing" if growth_rate < -5 else "stable",
            "growth_rate_percentage": growth_rate,
            "average_monthly_expense": sum(monthly_expenses.values()) / len(monthly_expenses)
        }
    
    def _generate_summary_report(self, 
                               transactions: List[Transaction],
                               period: str) -> Dict[str, Any]:
        """Generate general summary report"""
        
        total_income = sum(t.amount for t in transactions if t.amount > 0)
        total_expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)
        net_income = total_income - total_expenses
        
        return {
            "period": period,
            "summary": {
                "total_income": total_income,
                "total_expenses": total_expenses,
                "net_income": net_income,
                "total_transactions": len(transactions)
            },
            "top_categories": self._get_top_categories(transactions),
            "monthly_summary": self._get_monthly_summary(transactions)
        }
    
    def _get_top_categories(self, transactions: List[Transaction]) -> Dict[str, Any]:
        """Get top spending and income categories"""
        
        income_categories = {}
        expense_categories = {}
        
        for transaction in transactions:
            if transaction.amount > 0:  # Income
                category = transaction.category
                if category not in income_categories:
                    income_categories[category] = 0.0
                income_categories[category] += transaction.amount
            else:  # Expense
                category = transaction.category
                if category not in expense_categories:
                    expense_categories[category] = 0.0
                expense_categories[category] += abs(transaction.amount)
        
        return {
            "top_income_categories": sorted(income_categories.items(), key=lambda x: x[1], reverse=True)[:3],
            "top_expense_categories": sorted(expense_categories.items(), key=lambda x: x[1], reverse=True)[:3]
        }
    
    def _get_monthly_summary(self, transactions: List[Transaction]) -> Dict[str, Any]:
        """Get monthly summary of transactions"""
        
        monthly_data = {}
        
        for transaction in transactions:
            month = transaction.date.strftime('%Y-%m')
            if month not in monthly_data:
                monthly_data[month] = {"income": 0.0, "expenses": 0.0, "count": 0}
            
            if transaction.amount > 0:
                monthly_data[month]["income"] += transaction.amount
            else:
                monthly_data[month]["expenses"] += abs(transaction.amount)
            
            monthly_data[month]["count"] += 1
        
        return monthly_data
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        
        return {
            "name": self.name,
            "role": self.role,
            "expertise": self.expertise,
            "capabilities": [
                "Transaction processing and categorization",
                "Account reconciliation and matching",
                "Financial report generation",
                "Expense analysis and tracking",
                "Compliance and audit support",
                "Data validation and error detection"
            ]
        }