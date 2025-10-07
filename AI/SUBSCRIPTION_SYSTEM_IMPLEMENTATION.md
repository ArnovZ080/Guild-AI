### Subscription System Implementation (Current)

This document reflects the current, working subscription and agent-entitlement setup across backend and frontend.

### Backend Overview

- App: `api_server`
- Main router includes:
  - `subscription` – plan listing, initialize checkout, verify payment, subscription info
  - `agents_available` – list available agents with entitlement flags and rates; hire endpoint (stub checkout)

#### Endpoints

- Subscription
  - GET `/subscription/plans` – returns plan metadata with USD/ZAR pricing
  - POST `/subscription/initialize` – creates a Paystack checkout (requires env keys)
  - POST `/subscription/verify` – verifies payment and activates subscription; persists tier and limits to user
  - GET `/subscription/info` – returns current user tier/state and credits

- Agent Catalog & Hiring
  - GET `/agents/available` – returns array of agents with:
    - `included_in_subscription: boolean`
    - `hired_until: ISO8601 | null`
    - `daily_rate_usd: number`, `monthly_rate_usd: number`
    - `can_hire_daily: boolean`, `can_hire_monthly: boolean`
  - POST `/agents/hire` – stub; returns `checkout_url` for redirect. Replace with PSP integration later

#### Environment Variables

- `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`
- `ALLOWED_ORIGINS` (CORS)
- Database envs for `api_server` models (users/subscriptions)

### Frontend Overview

- App: `frontend/src`
- Base URL: `VITE_API_BASE_URL` (fallback to origin)

#### Services

- `src/services/subscriptionService.js`
  - `getSubscriptionInfo()` – GET `/subscription/info`
  - `getPlans()` – GET `/subscription/plans`

#### Agent Workforce View

- File: `src/views/AgentsView.jsx`
  - Fetches `/agents/available` and `/subscription/info`
  - Auto-includes the Base Pack for non-Enterprise tiers (Judge, Orchestration, BI, Execution, Operations layers)
  - Derives entitlement as: `included_in_subscription === true` OR `hired_until` in the future
  - Sorting:
    - Included (active) agents first, Base Pack prioritized, then alphabetical
    - Hireable agents listed separately
  - Controls:
    - Entitled agents: Start/Pause, Details, Assign Task, Chat
    - Non-entitled agents: Details, Hire me
  - First-run picker (Professional and up):
    - Multi-select modal to choose up to the plan limit (e.g., 25) of included agents to activate initially
    - Shows live counter, enforces cap, persists a local initialized flag per tier

#### Workflow Builder

- File: `src/components/workflow/EnhancedWorkflowBuilder.tsx`
  - Agent dropdown shows entitlement/cost tags:
    - Included, Hired, or `$X/day · $Y/mo`
  - Nodes display transparent credit/cost estimates per step

### Current Status

- Subscription flows are implemented end-to-end, contingent on:
  - Valid Paystack credentials and database connectivity for initialize/verify
  - `/subscription/info` provides tier and credits used/limits
- Agent hiring:
  - `/agents/hire` returns a placeholder `checkout_url` (stub). Replace with real PSP session creation to charge daily/monthly rentals

### Notes / Next Steps

- Replace hire stub with real payment session + rental persistence
- Persist agent Start/Pause activation server-side for cross-device consistency
- Optional: expose a `/me` endpoint for consolidated profile + subscription + entitlements


