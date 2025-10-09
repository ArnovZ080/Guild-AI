# Guild AI Subscription System – Per-Agent Model

This document describes the current subscription + per‑agent hiring implementation (no legacy credit top‑ups). It reflects the active codepaths in the backend and frontend.

## Plans and Entitlements

- Tiers: Free, Starter, Growth, Professional, Enterprise
- Each tier defines an included agent pack and an activation limit (Starter 5, Growth 10, Professional 25, Enterprise all agents).
- Additional agents can be hired per‑agent on a daily or monthly basis.

### Pricing, Credits, Limits, and Hire Rates

| Tier | Price (USD/mo) | Included Agents Limit | Credits/month | Extra Agent (USD/mo) | Daily Rental (USD/day) |
|---|---:|---:|---:|---:|---:|
| Starter | $49 | 5 | 500 | $12 | $1.50 |
| Growth | $99 | 10 | 1,000 | $11 | $1.25 |
| Professional | $199 | 25 | 2,500 | $10 | $1.00 |
| Enterprise | $499 | All 100+ | 10,000 | $8 | $0.50 |

Base Agents included across paid tiers: Orchestrator, Judge, Fact Checker, Brand Checker (plus core orchestration/BI/execution ops surfaced in UI as Base Pack).

## Backend

Routers are included in `api_server/src/main.py`.

### Subscription (Paystack)
- GET `/subscription/plans` – plan metadata with USD display and dynamic ZAR pricing
- POST `/subscription/initialize` – create Paystack checkout for a plan
- POST `/subscription/verify` – verify payment; persist tier and period
- GET `/subscription/info` – current user subscription state: `{ tier, status, credits: { used, limit, bonus, remaining }, plan_details }`

Env vars: `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `ALLOWED_ORIGINS`, database URL.

### Agents (Catalog + Hire)
- GET `/agents/available` – returns an array of agents with:
  - `included_in_subscription: boolean`
  - `hired_until: ISO8601 | null`
  - `daily_rate_usd`, `monthly_rate_usd`
  - `can_hire_daily`, `can_hire_monthly`
- POST `/agents/hire` – returns `{ checkout_url }` (stub). Replace with real PSP session + rental persistence.

Entitlement is computed as `included_in_subscription === true` OR `hired_until` > now.

## Frontend

Base URL: `VITE_API_BASE_URL` (fallback to window origin).

### Services
- `src/services/subscriptionService.js`
  - `getSubscriptionInfo()` – GET `/subscription/info`
  - `getPlans()` – GET `/subscription/plans`

### Agent Workforce (`src/views/AgentsView.jsx`)
- Fetches `/agents/available` and `/subscription/info`.
- Auto‑includes a Base Pack for non‑Enterprise (Judge, Orchestration, BI, Execution, Operations layers) so users always see core agents as included.
- First‑run picker (Professional/Growth): multi‑select up to plan limit (e.g., 25) to activate in one shot; shows a live counter; enforces cap; persists an initialized flag per tier.
- Ongoing controls:
  - Included/Hired (entitled): Start/Pause, Details, Assign Task, Chat
  - Unhired: Details, Hire me (rates shown on cards and during hire)
- Sorting: Included section first (Base Pack prioritized), then Hireable.
- Plan limits and per‑agent rates implemented in UI:
  - Limits: Starter 5, Growth 10, Professional 25, Enterprise unlimited
  - Rates: Starter $12/mo $1.50/day; Growth $11/$1.25; Professional $10/$1.00; Enterprise $8/$0.50

### Workflow Builder (`src/components/workflow/EnhancedWorkflowBuilder.tsx`)
- Agent dropdown shows entitlement and rates: Included, Hired, or `$X/day · $Y/mo`.
- Nodes show transparent credit/cost estimates for step execution (display‑only; billing is per‑plan + per‑agent hire).

## Notes & Next Steps

- Hiring endpoint is a stub returning `checkout_url`; integrate real PSP session creation and persist rentals.
- Persist Start/Pause server‑side for cross‑device activation state.
- Optional: add `/me` profile endpoint aggregating `subscription/info` + entitlements.

## Quick Reference

- Read tier: GET `/subscription/info` → `tier`
- List agents + rates: GET `/agents/available`
- Hire agent: POST `/agents/hire` `{ agent_id, term: 'day' | 'month' }` → `{ checkout_url }`
