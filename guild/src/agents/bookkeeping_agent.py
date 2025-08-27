import json
import asyncio

from models.user_input import UserInput, Audience
from models.agent import Agent, AgentCallback
from models.llm import Llm, LlmModels
from llm.llm_client import LlmClient
from utils.logging_utils import get_logger
from utils.decorators import inject_knowledge

logger = get_logger(__name__)

PROMPT_TEMPLATE = """
You are the Bookkeeping Agent, an AI-powered accountant specializing in automated transaction logging, reconciliation, and financial reporting for small businesses. Your goal is to provide accurate, real-time financial insights and reduce the manual burden of bookkeeping.

**1. Foundational Analysis (Do not include in output):**
    *   **Bank & Payment Processor Feeds:** {transaction_feeds}
    *   **Receipts & Invoices Data:** {receipts_data}
    *   **Chart of Accounts:** {chart_of_accounts}
    *   **Key Insights & Knowledge (from web search on accounting best practices):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, process the provided financial data. Categorize all transactions, perform a reconciliation, generate standard financial reports, and provide a cash flow forecast with optimization suggestions.

**3. Output Format (JSON only):**
    {{
      "financial_report": {{
        "period": "e.g., 'August 2025'",
        "summary": "A brief, plain-language summary of the business's financial health for the period.",
        "transaction_log": [
            {{
                "date": "e.g., '2025-08-26'",
                "description": "e.g., 'Stripe Payout'",
                "amount": "e.g., 1250.75",
                "type": "e.g., 'Income'",
                "category": "e.g., 'Sales Revenue'"
            }},
            {{
                "date": "e.g., '2025-08-25'",
                "description": "e.g., 'AWS Services'",
                "amount": -150.25,
                "type": "e.g., 'Expense'",
                "category": "e.g., 'Utilities: Hosting'"
            }},
            {{
                "date": "e.g., '2025-08-24'",
                "description": "e.g., 'Upwork Freelancer'",
                "amount": -500.00,
                "type": "e.g., 'Expense'",
                "category": "e.g., 'Contractors'"
            }}
        ],
        "profit_and_loss_statement": {{
            "total_revenue": "e.g., 5500.00",
            "cost_of_goods_sold": "e.g., 0",
            "gross_profit": "e.g., 5500.00",
            "operating_expenses": "e.g., 1200.50",
            "net_profit": "e.g., 4299.50"
        }},
        "cash_flow_forecast": {{
            "next_period_projection": "e.g., 'September 2025'",
            "projected_inflows": "e.g., 6000.00",
            "projected_outflows": "e.g., 1500.00",
            "projected_net_cash_flow": "e.g., 4500.00",
            "optimization_suggestions": [
                "e.g., 'Consider switching to annual billing for SaaS subscriptions to potentially get a discount.'",
                "e.g., 'Review contractor expenses to identify any non-essential services.'"
            ]
        }},
        "discrepancy_report": [
            "List any transactions that could not be automatically categorized or reconciled, requiring founder review."
        ]
      }}
    }}
"""


class BookkeepingAgent(Agent):
    def __init__(self, user_input: UserInput, transaction_feeds: str, receipts_data: str, chart_of_accounts: str, callback: AgentCallback = None):
        super().__init__(
            "Bookkeeping Agent",
            "Automates transaction logging, reconciliations, and financial reporting.",
            user_input,
            callback=callback
        )
        self.transaction_feeds = transaction_feeds
        self.receipts_data = receipts_data
        self.chart_of_accounts = chart_of_accounts
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Bookkeeping agent.")

        prompt = PROMPT_TEMPLATE.format(
            transaction_feeds=self.transaction_feeds,
            receipts_data=self.receipts_data,
            chart_of_accounts=self.chart_of_accounts,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Bookkeeping agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Process the financial transactions for August 2025 and generate the monthly report.",
        )

        transaction_feeds = "[Bank Feeds: +$2000 from Stripe, -$75 for Adobe Creative Cloud, -$50 for Google Workspace. Stripe Feeds: 50 sales at $40 each.]"
        receipts_data = "[Receipts: Matched Adobe and Google Workspace charges.]"
        chart_of_accounts = "Categories: Sales Revenue, Software Subscriptions, Marketing, Contractors, Utilities."

        agent = BookkeepingAgent(
            user_input,
            transaction_feeds=transaction_feeds,
            receipts_data=receipts_data,
            chart_of_accounts=chart_of_accounts
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
