"""
Data Hygiene Agent for Guild-AI
Comprehensive deduplication, validation, enrichment, and audit logging.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class Record:
    """Represents a data record subjected to hygiene operations."""
    id: str
    fields: Dict[str, Any]


@dataclass
class HygieneIssue:
    """Represents a detected data issue with suggested fix."""
    record_id: str
    issue: str
    severity: str  # high|medium|low
    suggestion: str


@dataclass
class HygieneAction:
    """Represents an action taken to fix data."""
    record_id: str
    action: str  # dedupe|normalize|enrich|validate|drop
    details: Dict[str, Any]
    status: str  # applied|skipped|error


@inject_knowledge
async def generate_comprehensive_hygiene_strategy(
    dataset_sample: List[Dict[str, Any]],
    validation_rules: Dict[str, Any],
    dedupe_keys: List[str],
    enrichment_prefs: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive data hygiene strategy using advanced prompting.
    """
    print("Data Hygiene Agent: Generating comprehensive hygiene strategy with injected knowledge...")

    prompt = f"""
# Data Hygiene Agent - Deduplication, Validation, and Enrichment Plan

## Role Definition
You are the **Data Hygiene Agent**, an expert in cleaning and maintaining datasets. Your role is to detect duplicates, validate fields, normalize formats, enrich missing data, and produce an auditable log of changes.

## Core Expertise
- Duplicate detection (fuzzy and exact)
- Validation and normalization (emails, phones, addresses)
- Enrichment via public sources (safe and ethical)
- Audit logging and rollback planning

## Context
- Dataset Sample: {json.dumps(dataset_sample, indent=2)}
- Validation Rules: {json.dumps(validation_rules, indent=2)}
- Dedupe Keys: {json.dumps(dedupe_keys)}
- Enrichment Prefs: {json.dumps(enrichment_prefs, indent=2)}

## Tasks
1) Identify duplicates and propose merge rules.
2) Validate fields; list issues and fix suggestions.
3) Normalize fields to canonical formats.
4) Propose enrichment sources and fields.
5) Produce audit plan with rollback notes.

## Output JSON
{{
  "duplicates": [{{"ids":[""],"confidence":0.0,"merge_key":"","rules":[""]}}],
  "issues": [{{"record_id":"","issue":"","severity":"","suggestion":""}}],
  "normalization": [{{"field":"","rule":""}}],
  "enrichment": [{{"field":"","source":"","notes":""}}],
  "audit": {{"log":true,"fields":[""],"rollback_notes":""}}
}}
Return only JSON.
"""

    try:
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        response = await client.chat(prompt)
        try:
            strategy = json.loads(response)
            print("Data Hygiene Agent: Successfully generated strategy.")
            return strategy
        except json.JSONDecodeError as e:
            print(f"Data Hygiene Agent: JSON parse error: {e}")
            # Robust fallback
            return {
                "duplicates": [],
                "issues": [],
                "normalization": [
                    {"field": "email", "rule": "lowercase_trim"},
                    {"field": "phone", "rule": "+country_e164"}
                ],
                "enrichment": [
                    {"field": "company_domain", "source": "clearbit_like", "notes": "public company domain lookup"}
                ],
                "audit": {"log": True, "fields": ["id", "email", "phone"], "rollback_notes": "snapshot before changes"}
            }
    except Exception as e:
        print(f"Data Hygiene Agent: Execution error: {e}")
        return {
            "duplicates": [],
            "issues": [],
            "normalization": [],
            "enrichment": [],
            "audit": {"log": True},
            "error": str(e)
        }


class DataHygieneAgent:
    """
    Data Hygiene Agent - Cleans, validates, enriches, and audits datasets.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Data Hygiene Agent"
        self.agent_type = "Automation & Productivity Enhancement"
        self.capabilities = [
            "Deduplication",
            "Validation & normalization",
            "Enrichment",
            "Audit logging"
        ]
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Data Hygiene Agent: Starting comprehensive data hygiene...")

            dataset_sample = [
                {"id": "1", "email": "USER@Example.com ", "phone": "(555) 123-4567", "company": "Acme"},
                {"id": "2", "email": "user@example.com", "phone": "+1 555 123 4567", "company": "Acme"}
            ]
            validation_rules = {"email": "must_be_valid", "phone": "must_be_e164", "company": "non_empty"}
            dedupe_keys = ["email", "phone"]
            enrichment_prefs = {"company_domain": True}

            strategy = await generate_comprehensive_hygiene_strategy(
                dataset_sample=dataset_sample,
                validation_rules=validation_rules,
                dedupe_keys=dedupe_keys,
                enrichment_prefs=enrichment_prefs
            )

            execution = await self._execute_hygiene_workflow(strategy, dataset_sample)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_data_hygiene",
                "hygiene_strategy": strategy,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Data Hygiene Agent: Completed.")
            return result
        except Exception as e:
            print(f"Data Hygiene Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_hygiene_workflow(self, strategy: Dict[str, Any], records: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            issues = await self._detect_issues(strategy.get("issues", []))
            normalized = await self._apply_normalization(strategy.get("normalization", []), records)
            deduped = await self._deduplicate(strategy.get("duplicates", []), normalized)
            enrichment = await self._propose_enrichment(strategy.get("enrichment", []), deduped)
            audit = strategy.get("audit", {"log": True})
            return {
                "issues": issues,
                "normalized": normalized,
                "deduped": deduped,
                "enrichment": enrichment,
                "audit": audit
            }
        except Exception as e:
            print(f"Data Hygiene Agent: Workflow error: {e}")
            return {"issues": [], "normalized": records, "deduped": records, "enrichment": [], "audit": {}, "error": str(e)}

    async def _detect_issues(self, issues_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for i in issues_list:
                out.append(HygieneIssue(
                    record_id=str(i.get("record_id", "")),
                    issue=str(i.get("issue", "")),
                    severity=str(i.get("severity", "low")),
                    suggestion=str(i.get("suggestion", ""))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Data Hygiene Agent: Detect issues error: {e}")
            return []

    async def _apply_normalization(self, rules: List[Dict[str, Any]], records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            normalized = []
            for r in records:
                new_r = dict(r)
                for rule in rules:
                    field = rule.get("field")
                    if field in new_r:
                        if rule.get("rule") == "lowercase_trim" and isinstance(new_r[field], str):
                            new_r[field] = new_r[field].strip().lower()
                        if rule.get("rule") == "+country_e164" and isinstance(new_r[field], str):
                            new_r[field] = "+1" + "".join([c for c in new_r[field] if c.isdigit()])[-10:]
                normalized.append(new_r)
            return normalized
        except Exception as e:
            print(f"Data Hygiene Agent: Normalization error: {e}")
            return records

    async def _deduplicate(self, duplicates: List[Dict[str, Any]], records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            seen = set()
            deduped = []
            for r in records:
                key = (r.get("email"), r.get("phone"))
                if key in seen:
                    continue
                seen.add(key)
                deduped.append(r)
            return deduped
        except Exception as e:
            print(f"Data Hygiene Agent: Deduplicate error: {e}")
            return records

    async def _propose_enrichment(self, enrich_rules: List[Dict[str, Any]], records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            enriched = []
            for r in records:
                new_r = dict(r)
                for er in enrich_rules:
                    if er.get("field") == "company_domain" and not new_r.get("company_domain"):
                        # placeholder enrichment
                        new_r["company_domain"] = f"{new_r.get('company','').lower()}.com" if new_r.get('company') else None
                enriched.append(new_r)
            return enriched
        except Exception as e:
            print(f"Data Hygiene Agent: Enrichment error: {e}")
            return records
