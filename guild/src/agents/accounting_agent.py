"""
Accounting Agent for Guild-AI

This agent provides automated accounting and financial reporting capabilities
using Pandas and OpenPyXL for data processing and Excel generation.
"""

import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
import tempfile
import json
from datetime import datetime, timedelta
from .enhanced_prompts import EnhancedPrompts

logger = logging.getLogger(__name__)

class AccountingAgent:
    """
    Automated accounting agent for financial data processing and reporting.
    """
    
    def __init__(self):
        self.prompt_template = EnhancedPrompts.get_accounting_agent_prompt()
        logger.info("Accounting Agent initialized")
    
    def process_financial_data(self, 
                             transactions: List[Dict[str, Any]],
                             report_type: str = "expense_report",
                             output_format: str = "excel") -> Dict[str, Any]:
        """
        Process financial data and generate reports.
        
        Args:
            transactions: List of transaction data
            report_type: Type of report to generate
            output_format: Output format (excel, csv, json)
            
        Returns:
            Dictionary with report information and file path
        """
        try:
            logger.info(f"Processing {len(transactions)} transactions for {report_type}")
            
            # Validate and clean transaction data
            validated_transactions = self._validate_transactions(transactions)
            
            # Generate the requested report
            if report_type == "expense_report":
                result = self._generate_expense_report(validated_transactions, output_format)
            elif report_type == "profit_loss":
                result = self._generate_profit_loss_statement(validated_transactions, output_format)
            elif report_type == "cash_flow":
                result = self._generate_cash_flow_statement(validated_transactions, output_format)
            elif report_type == "monthly_summary":
                result = self._generate_monthly_summary(validated_transactions, output_format)
            else:
                raise ValueError(f"Unsupported report type: {report_type}")
            
            return {
                'status': 'success',
                'report_type': report_type,
                'transactions_processed': len(validated_transactions),
                'output_format': output_format,
                'file_path': result['file_path'],
                'summary': result['summary']
            }
            
        except Exception as e:
            logger.error(f"Error processing financial data: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'report_type': report_type
            }
    
    def _validate_transactions(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate and clean transaction data."""
        validated = []
        
        for transaction in transactions:
            try:
                # Ensure required fields
                if not transaction.get('date'):
                    logger.warning("Transaction missing date, skipping")
                    continue
                
                if not transaction.get('amount'):
                    logger.warning("Transaction missing amount, skipping")
                    continue
                
                # Convert date to datetime
                if isinstance(transaction['date'], str):
                    transaction['date'] = pd.to_datetime(transaction['date'])
                
                # Convert amount to float
                transaction['amount'] = float(transaction['amount'])
                
                # Ensure category exists
                if not transaction.get('category'):
                    transaction['category'] = 'Uncategorized'
                
                # Ensure description exists
                if not transaction.get('description'):
                    transaction['description'] = 'No description'
                
                validated.append(transaction)
                
            except Exception as e:
                logger.warning(f"Error validating transaction: {e}")
                continue
        
        return validated
    
    def _generate_expense_report(self, transactions: List[Dict[str, Any]], output_format: str) -> Dict[str, Any]:
        """Generate an expense report."""
        df = pd.DataFrame(transactions)
        
        # Filter for expenses (negative amounts or expense category)
        expense_df = df[df['amount'] < 0].copy()
        expense_df['amount'] = expense_df['amount'].abs()  # Make positive for reporting
        
        # Group by category
        category_summary = expense_df.groupby('category')['amount'].agg(['sum', 'count']).reset_index()
        category_summary.columns = ['Category', 'Total Amount', 'Number of Transactions']
        category_summary = category_summary.sort_values('Total Amount', ascending=False)
        
        # Calculate totals
        total_expenses = expense_df['amount'].sum()
        total_transactions = len(expense_df)
        
        # Generate output file
        output_path = self._create_output_file(
            {
                'All Transactions': expense_df,
                'Category Summary': category_summary
            },
            'expense_report',
            output_format
        )
        
        return {
            'file_path': output_path,
            'summary': {
                'total_expenses': total_expenses,
                'total_transactions': total_transactions,
                'categories': len(category_summary),
                'top_category': category_summary.iloc[0]['Category'] if len(category_summary) > 0 else 'N/A'
            }
        }
    
    def _generate_profit_loss_statement(self, transactions: List[Dict[str, Any]], output_format: str) -> Dict[str, Any]:
        """Generate a profit and loss statement."""
        df = pd.DataFrame(transactions)
        
        # Separate revenue and expenses
        revenue_df = df[df['amount'] > 0].copy()
        expense_df = df[df['amount'] < 0].copy()
        expense_df['amount'] = expense_df['amount'].abs()  # Make positive
        
        # Calculate totals
        total_revenue = revenue_df['amount'].sum()
        total_expenses = expense_df['amount'].sum()
        net_profit = total_revenue - total_expenses
        
        # Create P&L summary
        pl_data = {
            'Item': ['Total Revenue', 'Total Expenses', 'Net Profit/Loss'],
            'Amount': [total_revenue, total_expenses, net_profit]
        }
        pl_summary = pd.DataFrame(pl_data)
        
        # Revenue breakdown by category
        revenue_by_category = revenue_df.groupby('category')['amount'].sum().reset_index()
        revenue_by_category.columns = ['Category', 'Amount']
        revenue_by_category = revenue_by_category.sort_values('Amount', ascending=False)
        
        # Expense breakdown by category
        expense_by_category = expense_df.groupby('category')['amount'].sum().reset_index()
        expense_by_category.columns = ['Category', 'Amount']
        expense_by_category = expense_by_category.sort_values('Amount', ascending=False)
        
        # Generate output file
        output_path = self._create_output_file(
            {
                'P&L Summary': pl_summary,
                'Revenue by Category': revenue_by_category,
                'Expenses by Category': expense_by_category,
                'All Revenue Transactions': revenue_df,
                'All Expense Transactions': expense_df
            },
            'profit_loss_statement',
            output_format
        )
        
        return {
            'file_path': output_path,
            'summary': {
                'total_revenue': total_revenue,
                'total_expenses': total_expenses,
                'net_profit': net_profit,
                'profit_margin': (net_profit / total_revenue * 100) if total_revenue > 0 else 0
            }
        }
    
    def _generate_cash_flow_statement(self, transactions: List[Dict[str, Any]], output_format: str) -> Dict[str, Any]:
        """Generate a cash flow statement."""
        df = pd.DataFrame(transactions)
        df['date'] = pd.to_datetime(df['date'])
        
        # Group by month
        df['month'] = df['date'].dt.to_period('M')
        monthly_cash_flow = df.groupby('month')['amount'].sum().reset_index()
        monthly_cash_flow.columns = ['Month', 'Net Cash Flow']
        monthly_cash_flow['Month'] = monthly_cash_flow['Month'].astype(str)
        
        # Calculate cumulative cash flow
        monthly_cash_flow['Cumulative Cash Flow'] = monthly_cash_flow['Net Cash Flow'].cumsum()
        
        # Separate positive and negative cash flows
        positive_flows = monthly_cash_flow[monthly_cash_flow['Net Cash Flow'] > 0].copy()
        negative_flows = monthly_cash_flow[monthly_cash_flow['Net Cash Flow'] < 0].copy()
        negative_flows['Net Cash Flow'] = negative_flows['Net Cash Flow'].abs()
        negative_flows.columns = ['Month', 'Cash Outflow', 'Cumulative Cash Flow']
        
        # Generate output file
        output_path = self._create_output_file(
            {
                'Monthly Cash Flow': monthly_cash_flow,
                'Cash Inflows': positive_flows,
                'Cash Outflows': negative_flows
            },
            'cash_flow_statement',
            output_format
        )
        
        return {
            'file_path': output_path,
            'summary': {
                'total_months': len(monthly_cash_flow),
                'average_monthly_flow': monthly_cash_flow['Net Cash Flow'].mean(),
                'final_cash_position': monthly_cash_flow['Cumulative Cash Flow'].iloc[-1] if len(monthly_cash_flow) > 0 else 0
            }
        }
    
    def _generate_monthly_summary(self, transactions: List[Dict[str, Any]], output_format: str) -> Dict[str, Any]:
        """Generate a monthly summary report."""
        df = pd.DataFrame(transactions)
        df['date'] = pd.to_datetime(df['date'])
        df['month'] = df['date'].dt.to_period('M')
        
        # Monthly summary
        monthly_summary = df.groupby('month').agg({
            'amount': ['sum', 'count', 'mean'],
            'category': lambda x: x.mode().iloc[0] if len(x.mode()) > 0 else 'N/A'
        }).reset_index()
        
        monthly_summary.columns = ['Month', 'Total Amount', 'Transaction Count', 'Average Amount', 'Top Category']
        monthly_summary['Month'] = monthly_summary['Month'].astype(str)
        
        # Category breakdown by month
        category_monthly = df.groupby(['month', 'category'])['amount'].sum().unstack(fill_value=0)
        category_monthly.index = category_monthly.index.astype(str)
        
        # Generate output file
        sheets = {
            'Monthly Summary': monthly_summary,
            'Category Breakdown': category_monthly
        }
        
        # Add individual month sheets if not too many
        if len(monthly_summary) <= 12:  # Only if 12 months or less
            for month in monthly_summary['Month']:
                month_data = df[df['month'].astype(str) == month]
                if len(month_data) > 0:
                    sheets[f'Transactions_{month}'] = month_data.drop('month', axis=1)
        
        output_path = self._create_output_file(sheets, 'monthly_summary', output_format)
        
        return {
            'file_path': output_path,
            'summary': {
                'months_covered': len(monthly_summary),
                'total_transactions': len(df),
                'average_monthly_amount': monthly_summary['Total Amount'].mean()
            }
        }
    
    def _create_output_file(self, 
                          sheets: Dict[str, pd.DataFrame], 
                          report_name: str, 
                          output_format: str) -> str:
        """Create output file with multiple sheets."""
        
        # Create temporary directory
        temp_dir = tempfile.mkdtemp(prefix="guild_accounting_")
        
        if output_format == "excel":
            output_path = Path(temp_dir) / f"{report_name}.xlsx"
            
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                for sheet_name, df in sheets.items():
                    # Clean sheet name (Excel has restrictions)
                    clean_sheet_name = sheet_name[:31]  # Excel sheet name limit
                    df.to_excel(writer, sheet_name=clean_sheet_name, index=False)
                    
                    # Get the worksheet to apply formatting
                    worksheet = writer.sheets[clean_sheet_name]
                    
                    # Apply basic formatting
                    self._format_excel_sheet(worksheet, df)
            
        elif output_format == "csv":
            # For CSV, create a zip file with multiple CSVs
            import zipfile
            output_path = Path(temp_dir) / f"{report_name}.zip"
            
            with zipfile.ZipFile(output_path, 'w') as zipf:
                for sheet_name, df in sheets.items():
                    csv_name = f"{sheet_name}.csv"
                    csv_path = Path(temp_dir) / csv_name
                    df.to_csv(csv_path, index=False)
                    zipf.write(csv_path, csv_name)
            
        elif output_format == "json":
            output_path = Path(temp_dir) / f"{report_name}.json"
            
            # Convert DataFrames to dictionaries
            json_data = {}
            for sheet_name, df in sheets.items():
                json_data[sheet_name] = df.to_dict('records')
            
            with open(output_path, 'w') as f:
                json.dump(json_data, f, indent=2, default=str)
        
        else:
            raise ValueError(f"Unsupported output format: {output_format}")
        
        logger.info(f"Created {output_format} report: {output_path}")
        return str(output_path)
    
    def _format_excel_sheet(self, worksheet, df: pd.DataFrame):
        """Apply basic formatting to Excel sheet."""
        try:
            from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
            
            # Header formatting
            header_font = Font(bold=True, color="FFFFFF")
            header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
            header_alignment = Alignment(horizontal="center", vertical="center")
            
            # Apply header formatting
            for cell in worksheet[1]:
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = header_alignment
            
            # Auto-adjust column widths
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                
                adjusted_width = min(max_length + 2, 50)  # Cap at 50 characters
                worksheet.column_dimensions[column_letter].width = adjusted_width
            
            # Add borders
            thin_border = Border(
                left=Side(style='thin'),
                right=Side(style='thin'),
                top=Side(style='thin'),
                bottom=Side(style='thin')
            )
            
            for row in worksheet.iter_rows():
                for cell in row:
                    cell.border = thin_border
            
        except Exception as e:
            logger.warning(f"Error formatting Excel sheet: {e}")
    
    def create_budget_template(self, categories: List[str], months: int = 12) -> str:
        """Create a budget template Excel file."""
        try:
            # Create budget template data
            budget_data = []
            for category in categories:
                for month in range(1, months + 1):
                    budget_data.append({
                        'Category': category,
                        'Month': f"2024-{month:02d}",
                        'Budgeted Amount': 0,
                        'Actual Amount': 0,
                        'Variance': 0,
                        'Notes': ''
                    })
            
            df = pd.DataFrame(budget_data)
            
            # Create output file
            temp_dir = tempfile.mkdtemp(prefix="guild_budget_")
            output_path = Path(temp_dir) / "budget_template.xlsx"
            
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Budget Template', index=False)
                
                # Format the sheet
                worksheet = writer.sheets['Budget Template']
                self._format_excel_sheet(worksheet, df)
            
            logger.info(f"Created budget template: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error creating budget template: {e}")
            raise
    
    def analyze_financial_health(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze financial health metrics."""
        try:
            df = pd.DataFrame(transactions)
            df['date'] = pd.to_datetime(df['date'])
            
            # Basic metrics
            total_revenue = df[df['amount'] > 0]['amount'].sum()
            total_expenses = abs(df[df['amount'] < 0]['amount'].sum())
            net_profit = total_revenue - total_expenses
            
            # Monthly trends
            df['month'] = df['date'].dt.to_period('M')
            monthly_revenue = df[df['amount'] > 0].groupby('month')['amount'].sum()
            monthly_expenses = abs(df[df['amount'] < 0].groupby('month')['amount'].sum())
            
            # Calculate growth rates
            revenue_growth = self._calculate_growth_rate(monthly_revenue)
            expense_growth = self._calculate_growth_rate(monthly_expenses)
            
            # Expense analysis
            expense_categories = df[df['amount'] < 0].groupby('category')['amount'].sum().abs()
            top_expense_category = expense_categories.idxmax() if len(expense_categories) > 0 else 'N/A'
            
            # Cash flow analysis
            monthly_cash_flow = df.groupby('month')['amount'].sum()
            positive_months = (monthly_cash_flow > 0).sum()
            total_months = len(monthly_cash_flow)
            
            return {
                'status': 'success',
                'metrics': {
                    'total_revenue': total_revenue,
                    'total_expenses': total_expenses,
                    'net_profit': net_profit,
                    'profit_margin': (net_profit / total_revenue * 100) if total_revenue > 0 else 0,
                    'revenue_growth_rate': revenue_growth,
                    'expense_growth_rate': expense_growth,
                    'top_expense_category': top_expense_category,
                    'positive_cash_flow_months': positive_months,
                    'total_months': total_months,
                    'cash_flow_consistency': (positive_months / total_months * 100) if total_months > 0 else 0
                },
                'recommendations': self._generate_financial_recommendations(
                    total_revenue, total_expenses, net_profit, revenue_growth, expense_growth
                )
            }
            
        except Exception as e:
            logger.error(f"Error analyzing financial health: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def _calculate_growth_rate(self, series: pd.Series) -> float:
        """Calculate growth rate for a time series."""
        if len(series) < 2:
            return 0.0
        
        first_value = series.iloc[0]
        last_value = series.iloc[-1]
        
        if first_value == 0:
            return 0.0
        
        return ((last_value - first_value) / first_value) * 100
    
    def _generate_financial_recommendations(self, revenue, expenses, profit, revenue_growth, expense_growth) -> List[str]:
        """Generate financial recommendations based on analysis."""
        recommendations = []
        
        if profit < 0:
            recommendations.append("Consider reducing expenses or increasing revenue to achieve profitability")
        
        if expense_growth > revenue_growth and revenue_growth > 0:
            recommendations.append("Expenses are growing faster than revenue - review cost management")
        
        if revenue_growth < 0:
            recommendations.append("Revenue is declining - focus on sales and marketing strategies")
        
        if profit > 0 and revenue_growth > 10:
            recommendations.append("Strong financial performance - consider reinvesting in growth")
        
        if not recommendations:
            recommendations.append("Financial health appears stable - continue current strategies")
        
        return recommendations

# Convenience function
def get_accounting_agent() -> AccountingAgent:
    """Get an instance of the Accounting Agent."""
    return AccountingAgent()
