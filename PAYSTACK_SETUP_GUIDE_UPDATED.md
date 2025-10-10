# Paystack Setup Guide for Guild AI (Updated for Google Cloud)

This guide will help you set up Paystack for subscriptions, per-agent hiring, and credit purchases with your Google Cloud deployment.

## 1. Prerequisites

✅ **You Already Have:**
- Google Cloud project with Cloud SQL database
- Paystack account created
- Environment variables configured
- Backend deployed or running locally

## 2. Get Your API Keys

### 2.1 Test Keys (Development)
1. In your Paystack dashboard, go to **Settings > API Keys & Webhooks**
2. Copy your **Test Secret Key** (starts with `sk_test_`)
3. Copy your **Test Public Key** (starts with `pk_test_`)

These should already be in your environment variables:
```bash
# Backend
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# Frontend (Netlify)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
```

### 2.2 Live Keys (Production)
After completing business verification:
1. Copy your **Live Secret Key** (starts with `sk_live_`)
2. Copy your **Live Public Key** (starts with `pk_live_`)

---

## 3. Create Subscription Plans in Paystack

### 3.1 Plan Configuration

Create these recurring subscription plans in your Paystack dashboard (**Plans** section):

#### Free Plan
- **Plan Name**: "Guild AI Free"
- **Plan Code**: `PLN_free`
- **Amount**: `0` (ZAR)
- **Currency**: `ZAR`
- **Interval**: `monthly`
- **Description**: "Free tier - 100 credits/month, standard agents"

**Note:** Free plan doesn't require payment initialization

#### Starter Plan
- **Plan Name**: "Guild AI Starter"
- **Plan Code**: `PLN_starter`
- **Amount**: `91000` (R910 in kobo, ~$49 USD)
- **Currency**: `ZAR`
- **Interval**: `monthly`
- **Description**: "5 AI Agents • 500 credits/month • Core integrations"

#### Growth Plan (Most Popular)
- **Plan Name**: "Guild AI Growth"
- **Plan Code**: `PLN_growth`
- **Amount**: `183000` (R1,830 in kobo, ~$99 USD)
- **Currency**: `ZAR`
- **Interval**: `monthly`
- **Description**: "10 AI Agents • 1,000 credits/month • All integrations"

#### Professional Plan
- **Plan Name**: "Guild AI Professional"
- **Plan Code**: `PLN_professional`
- **Amount**: `368000` (R3,680 in kobo, ~$199 USD)
- **Currency**: `ZAR`
- **Interval**: `monthly`
- **Description**: "25 AI Agents • 2,500 credits/month • Advanced features"

#### Enterprise Plan
- **Plan Name**: "Guild AI Enterprise"
- **Plan Code**: `PLN_enterprise`
- **Amount**: `923000` (R9,230 in kobo, ~$499 USD)
- **Currency**: `ZAR`
- **Interval**: `monthly`
- **Description**: "All 114 Agents • 10,000 credits/month • White-label + API"

**Important:** Amounts are in kobo (ZAR cents). Multiply ZAR amount by 100.

### 3.2 Dynamic Pricing

Your backend automatically converts USD to ZAR using current exchange rates:

```python
# From subscription.py
SUBSCRIPTION_PLANS = {
    "starter": {
        "usd_price": 49,
        "zar_price": 910,  # Dynamic, calculated from exchange rate
        "paystack_plan_code": "PLN_starter"
    },
    # ... other plans
}
```

The system:
1. Fetches current USD→ZAR exchange rate
2. Calculates ZAR amount dynamically
3. Rounds to nearest R10 for clean pricing
4. Shows USD for reference, bills in ZAR

---

## 4. Per-Agent Hiring System

### 4.1 Agent Rental Pricing

Your system supports hiring additional agents beyond plan limits:

| Tier | Monthly Rate | Daily Rate |
|------|-------------|------------|
| Starter | $12/agent | $1.50/agent |
| Growth | $11/agent | $1.25/agent |
| Professional | $10/agent | $1.00/agent |
| Enterprise | $8/agent | $0.50/agent |

### 4.2 Paystack Configuration for Agent Hiring

**Method:** One-time transactions (not recurring subscriptions)

**Implementation:**
```python
# Backend: /api_server/src/routes/subscription_agents.py
@router.post("/hire")
async def hire_agent(request: HireAgentRequest):
    # Calculate ZAR price for agent rental
    base_usd = plan_config["extra_agent_monthly_usd" or "extra_agent_daily_usd"]
    zar_amount = await calculate_zar_price(base_usd)
    
    # Create one-time Paystack transaction
    paystack_data = {
        "email": user.email,
        "amount": zar_amount * 100,  # Convert to kobo
        "currency": "ZAR",
        "reference": f"agent_hire_{agent_id}_{term}_{uuid}",
        "metadata": {
            "agent_id": agent_id,
            "rental_term": term,  # "day" or "month"
            "user_id": user.id
        }
    }
```

**Paystack Dashboard:**
- No plan creation needed for agent hiring
- Use regular one-time transactions
- Track via metadata in webhook events

### 4.3 Rental Duration Tracking

After successful payment:
```python
# Store in database (extend User or create AgentRental table)
hired_until = datetime.utcnow() + timedelta(days=1 if term == "day" else 30)

# Return in /agents/available endpoint
{
    "agent_id": "content_strategist",
    "hired_until": "2025-11-10T14:30:00Z",  # ISO8601
    "can_hire_daily": True,
    "can_hire_monthly": True,
    "daily_rate_usd": 1.25,
    "monthly_rate_usd": 11
}
```

---

## 5. Credit Purchase System

### 5.1 Credit Packages

Define credit packages for users who need extra credits:

| Package | Credits | Base Price (USD) | Bonus Credits | Total Credits | Price per Credit |
|---------|---------|------------------|---------------|---------------|-----------------|
| Small | 100 | $10 | 0 | 100 | $0.10 |
| Medium | 500 | $45 | 50 | 550 | $0.09 |
| Large | 1,000 | $80 | 150 | 1,150 | $0.08 |
| XL | 2,500 | $180 | 500 | 3,000 | $0.07 |
| XXL | 5,000 | $320 | 1,200 | 6,200 | $0.06 |

**Backend Implementation:**
```python
# /api_server/src/routes/credits.py
CREDIT_PACKAGES = {
    "small": {
        "credits": 100,
        "usd_price": 10,
        "bonus_credits": 0
    },
    "medium": {
        "credits": 500,
        "usd_price": 45,
        "bonus_credits": 50
    },
    "large": {
        "credits": 1000,
        "usd_price": 80,
        "bonus_credits": 150
    },
    "xl": {
        "credits": 2500,
        "usd_price": 180,
        "bonus_credits": 500
    },
    "xxl": {
        "credits": 5000,
        "usd_price": 320,
        "bonus_credits": 1200
    }
}

@router.post("/credits/purchase")
async def purchase_credits(package_id: str):
    package = CREDIT_PACKAGES[package_id]
    zar_amount = await calculate_zar_price(package["usd_price"])
    
    # Create one-time Paystack transaction
    paystack_data = {
        "email": user.email,
        "amount": zar_amount * 100,
        "currency": "ZAR",
        "reference": f"credits_{package_id}_{uuid}",
        "metadata": {
            "package_id": package_id,
            "credits": package["credits"],
            "bonus_credits": package["bonus_credits"],
            "user_id": user.id
        }
    }
```

### 5.2 Paystack Configuration for Credits

**Method:** One-time transactions (not subscriptions)

**After Payment Verification:**
1. User's `bonus_credits` field incremented
2. Credits never expire
3. Used alongside monthly credits

**Frontend Display:**
```javascript
// Show available credits
{
  monthly_remaining: 450,    // From subscription
  bonus_credits: 1200,       // Purchased credits
  total_available: 1650      // Sum of both
}
```

---

## 6. Configure Webhooks

### 6.1 Set Up Webhook Endpoint

1. In Paystack dashboard: **Settings > API Keys & Webhooks**
2. Click **Add Webhook**
3. Set webhook URL: `https://your-backend.run.app/subscription/webhook`

For Google Cloud Run:
```
https://your-service-name-[hash]-uc.a.run.app/subscription/webhook
```

### 6.2 Select Webhook Events

Enable these events:

**Subscription Events:**
- `subscription.create`
- `subscription.disable`
- `subscription.not_renewing`
- `invoice.create`
- `invoice.payment_failed`
- `invoice.update`

**Transaction Events (for agent hiring & credits):**
- `charge.success`
- `charge.failed`

### 6.3 Webhook Signature Verification

Your backend already verifies webhooks:

```python
# /api_server/src/routes/subscription.py
@router.post("/webhook")
async def paystack_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.body()
    signature = request.headers.get("x-paystack-signature")
    
    # Verify signature
    expected_signature = hmac.new(
        PAYSTACK_SECRET_KEY.encode(),
        body,
        hashlib.sha512
    ).hexdigest()
    
    if signature != expected_signature:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Process events
    event_data = await request.json()
    event_type = event_data.get("event")
    
    if event_type == "subscription.create":
        await handle_subscription_created(data, db)
    elif event_type == "charge.success":
        await handle_one_time_payment(data, db)  # Agent hire or credit purchase
```

---

## 7. Google Cloud SQL Integration

### 7.1 Database Tables

Your Cloud SQL database should have these tables:

**users table:**
```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    supabase_id VARCHAR UNIQUE NOT NULL,  -- Now stores Firebase UID
    email VARCHAR UNIQUE NOT NULL,
    subscription_status VARCHAR DEFAULT 'free',
    subscription_tier VARCHAR DEFAULT 'free',
    paystack_customer_id VARCHAR,
    credits_used_this_month INTEGER DEFAULT 0,
    credits_limit INTEGER DEFAULT 100,
    bonus_credits INTEGER DEFAULT 0,  -- Purchased credits
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

**subscriptions table:**
```sql
CREATE TABLE subscriptions (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    paystack_subscription_code VARCHAR UNIQUE,
    paystack_plan_code VARCHAR NOT NULL,
    status VARCHAR NOT NULL,  -- active, cancelled, past_due
    tier VARCHAR NOT NULL,
    amount DECIMAL(10,2) NOT NULL,  -- ZAR amount
    currency VARCHAR DEFAULT 'ZAR',
    monthly_credits INTEGER NOT NULL,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP
);
```

**credit_transactions table:**
```sql
CREATE TABLE credit_transactions (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    package_id VARCHAR NOT NULL,
    credits_purchased INTEGER NOT NULL,
    bonus_credits INTEGER DEFAULT 0,
    total_credits INTEGER NOT NULL,
    usd_amount DECIMAL(10,2) NOT NULL,
    zar_amount DECIMAL(10,2) NOT NULL,
    exchange_rate DECIMAL(10,4) NOT NULL,
    paystack_reference VARCHAR UNIQUE NOT NULL,
    status VARCHAR DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

**agent_rentals table (new):**
```sql
CREATE TABLE agent_rentals (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    agent_id VARCHAR NOT NULL,
    rental_term VARCHAR NOT NULL,  -- 'day' or 'month'
    usd_amount DECIMAL(10,2) NOT NULL,
    zar_amount DECIMAL(10,2) NOT NULL,
    exchange_rate DECIMAL(10,4) NOT NULL,
    paystack_reference VARCHAR UNIQUE NOT NULL,
    hired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    status VARCHAR DEFAULT 'active',  -- active, expired, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7.2 Connection String

Your backend connects via Cloud SQL Proxy:

```python
# From database.py
if cloudsql_connection_name:
    # Cloud SQL via Unix socket
    DATABASE_URL = f"postgresql://{user}:{password}@/{database}?host=/cloudsql/{cloudsql_connection_name}"
else:
    # Local development
    DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{database}"
```

**Environment Variables:**
```bash
# Production (Cloud Run)
CLOUDSQL_CONNECTION_NAME=project-id:region:instance-name
POSTGRES_DB=guild_db
POSTGRES_USER=postgres
DB_SECRET_NAME=db-password  # In Secret Manager

# Development
DATABASE_URL=postgresql://postgres:password@localhost:5432/guild_db
```

---

## 8. Pricing Structure Implementation

### 8.1 Subscription Plans

Your backend is configured with these plans in `/api_server/src/routes/subscription.py`:

```python
SUBSCRIPTION_PLANS = {
    "free": {
        "name": "Free",
        "credits": 100,
        "api_calls": 500,
        "usd_price": 0,
        "zar_price": 0,
        "paystack_plan_code": None,
        "included_agents_limit": 0,
        "extra_agent_monthly_usd": 15,
        "extra_agent_daily_usd": 2,
        "trial_days": 0
    },
    "starter": {
        "name": "Starter",
        "credits": 500,
        "api_calls": 5000,
        "usd_price": 49,
        "zar_price": 910,  # Dynamic
        "paystack_plan_code": "PLN_starter",
        "included_agents_limit": 5,
        "extra_agent_monthly_usd": 12,
        "extra_agent_daily_usd": 1.50,
        "trial_days": 21
    },
    "growth": {
        "name": "Growth",
        "credits": 1000,
        "api_calls": 10000,
        "usd_price": 99,
        "zar_price": 1830,  # Dynamic
        "paystack_plan_code": "PLN_growth",
        "included_agents_limit": 10,
        "extra_agent_monthly_usd": 11,
        "extra_agent_daily_usd": 1.25,
        "trial_days": 21
    },
    "professional": {
        "name": "Professional",
        "credits": 2500,
        "api_calls": 25000,
        "usd_price": 199,
        "zar_price": 3680,  # Dynamic
        "paystack_plan_code": "PLN_professional",
        "included_agents_limit": 25,
        "extra_agent_monthly_usd": 10,
        "extra_agent_daily_usd": 1.00,
        "trial_days": 21
    },
    "enterprise": {
        "name": "Enterprise",
        "credits": 10000,
        "api_calls": 100000,
        "usd_price": 499,
        "zar_price": 9230,  # Dynamic
        "paystack_plan_code": "PLN_enterprise",
        "included_agents_limit": 114,  # All agents
        "extra_agent_monthly_usd": 8,
        "extra_agent_daily_usd": 0.50,
        "trial_days": 21
    }
}
```

### 8.2 Exchange Rate Calculation

Your system uses multiple exchange rate sources with fallback:

```python
async def get_current_exchange_rate():
    """Get current USD to ZAR exchange rate"""
    sources = [
        "https://api.exchangerate-api.com/v4/latest/USD",
        f"https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD",
        "https://api.fixer.io/latest?base=USD&symbols=ZAR"
    ]
    # Fallback: 18.5 ZAR per USD
```

**Current typical range:** R18.50 - R19.50 per USD

---

## 9. Payment Flow Implementation

### 9.1 Subscription Payment Flow

**Step 1: User selects plan on frontend**
```javascript
// /signup?plan=growth
→ User creates Firebase account
→ Redirected to /subscription?plan=growth
```

**Step 2: Initialize payment**
```javascript
// Frontend: SubscriptionPage.jsx
const response = await fetch(`${API_URL}/subscription/initialize`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${firebaseToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        plan_id: 'growth',
        email: user.email
    })
});

const { authorization_url, reference, zar_amount } = await response.json();
```

**Step 3: Backend creates Paystack transaction**
```python
# Backend calculates current ZAR price
current_zar_price = await calculate_zar_price(99)  # e.g., R1,830

# Initialize with Paystack
paystack_data = {
    "email": email,
    "amount": current_zar_price * 100,  # R1,830 → 183000 kobo
    "currency": "ZAR",
    "plan": "PLN_growth",
    "metadata": {
        "plan_id": "growth",
        "user_id": user_id,
        "exchange_rate": 18.5
    }
}
```

**Step 4: Paystack popup**
```javascript
// Frontend opens Paystack payment popup
const handler = window.PaystackPop.setup({
    key: VITE_PAYSTACK_PUBLIC_KEY,
    email: user.email,
    amount: 183000,  // Kobo
    currency: 'ZAR',
    ref: reference,
    callback: (response) => {
        // Verify payment
        verifyPayment(response.reference);
    }
});
handler.openIframe();
```

**Step 5: Verify and activate**
```python
# Backend verifies with Paystack
verification = await paystack_api.verify(reference)

if verification["status"] == "success":
    # Create subscription record
    subscription = Subscription(
        user_id=user.id,
        tier="growth",
        status="active",
        monthly_credits=1000,
        current_period_end=datetime.utcnow() + timedelta(days=30)
    )
    
    # Update user
    user.subscription_tier = "growth"
    user.credits_limit = 1000
    user.credits_used_this_month = 0
```

### 9.2 Agent Hiring Payment Flow

**Similar to subscriptions but one-time:**

```javascript
// Frontend: POST /agents/hire
{
    "agent_id": "content_strategist",
    "term": "month"  // or "day"
}

// Backend response
{
    "authorization_url": "https://checkout.paystack.com/...",
    "reference": "agent_hire_content_strategist_month_abc123",
    "zar_amount": 203,  // $11 × 18.5 = R203.50 → R200
    "usd_equivalent": 11,
    "term": "month",
    "expires_at": "2025-11-10T12:00:00Z"
}
```

**After verification:**
```python
# Store agent rental
rental = AgentRental(
    user_id=user.id,
    agent_id="content_strategist",
    rental_term="month",
    hired_at=datetime.utcnow(),
    expires_at=datetime.utcnow() + timedelta(days=30),
    status="active"
)
```

### 9.3 Credit Purchase Payment Flow

**Similar pattern:**

```javascript
// Frontend: POST /credits/purchase
{
    "package_id": "large"
}

// Backend: Initialize Paystack
{
    "amount": 148000,  // $80 × 18.5 = R1,480 → 148000 kobo
    "metadata": {
        "package_id": "large",
        "credits": 1000,
        "bonus_credits": 150
    }
}
```

**After verification:**
```python
# Add credits to user
user.bonus_credits += (credits + bonus_credits)

# Create transaction record
transaction = CreditTransaction(
    user_id=user.id,
    package_id="large",
    credits_purchased=1000,
    bonus_credits=150,
    total_credits=1150,
    status="completed"
)
```

---

## 10. Testing

### 10.1 Test Card Numbers

Use these Paystack test cards:

**Successful Payment:**
- Card: `4084084084084081`
- Expiry: Any future date
- CVV: Any 3 digits

**Declined Payment:**
- Card: `4084084084084085`
- Expiry: Any future date
- CVV: Any 3 digits

**Insufficient Funds:**
- Card: `4084084084084085`

### 10.2 Test Subscription Flow

1. Navigate to landing page
2. Click "Get Started" for Growth plan
3. Sign up with test email
4. Complete payment with test card
5. Verify subscription in Paystack dashboard
6. Check webhook delivery
7. Verify user record in Cloud SQL

### 10.3 Test Agent Hiring

1. Log into dashboard
2. Go to Agents view
3. Click "Hire" on an agent not in your plan
4. Select monthly or daily rental
5. Complete payment
6. Verify agent shows "Hired until [date]"

### 10.4 Test Credit Purchase

1. Go to Settings → Credits
2. Select a credit package
3. Complete payment
4. Verify bonus credits added to account
5. Check total available credits

---

## 11. Production Deployment

### 11.1 Environment Variables (Google Cloud)

**Cloud Run Service:**
```bash
# Set in Cloud Run configuration
gcloud run services update guild-api \
  --update-env-vars PAYSTACK_SECRET_KEY=sk_live_... \
  --update-env-vars PAYSTACK_PUBLIC_KEY=pk_live_... \
  --update-env-vars CLOUDSQL_CONNECTION_NAME=project:region:instance
```

**Or use Secret Manager:**
```bash
# Create secrets
gcloud secrets create paystack-secret-key --data-file=-
gcloud secrets create paystack-public-key --data-file=-

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding paystack-secret-key \
  --member="serviceAccount:SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**Frontend (Netlify):**
```bash
# In Netlify dashboard: Site settings → Environment variables
VITE_PAYSTACK_PUBLIC_KEY=pk_live_...
VITE_API_URL=https://your-backend.run.app
```

### 11.2 Switch to Live Keys

When ready for production:

1. Complete Paystack business verification
2. Get live API keys
3. Update environment variables in:
   - Cloud Run (backend)
   - Netlify (frontend)
   - Secret Manager (recommended)
4. Update webhook URL to production backend
5. Test with small real transaction

---

## 12. Pricing Summary

### 12.1 Monthly Subscriptions (ZAR)

At current exchange rate (~R18.50/USD):

| Tier | USD Price | ZAR Price (kobo) | Trial Period |
|------|-----------|------------------|--------------|
| Free | $0 | 0 | N/A |
| Starter | $49 | 91,000 (R910) | 21 days |
| Growth | $99 | 183,000 (R1,830) | 21 days |
| Professional | $199 | 368,000 (R3,680) | 21 days |
| Enterprise | $499 | 923,000 (R9,230) | 21 days |

### 12.2 Per-Agent Hiring (ZAR)

| Tier | Monthly (USD) | Monthly (ZAR) | Daily (USD) | Daily (ZAR) |
|------|---------------|---------------|-------------|-------------|
| Starter | $12 | ~R220 | $1.50 | ~R28 |
| Growth | $11 | ~R200 | $1.25 | ~R23 |
| Professional | $10 | ~R185 | $1.00 | ~R19 |
| Enterprise | $8 | ~R148 | $0.50 | ~R9 |

### 12.3 Credit Packages (ZAR)

| Package | USD Price | ZAR Price | Credits | Bonus | Total |
|---------|-----------|-----------|---------|-------|-------|
| Small | $10 | ~R185 | 100 | 0 | 100 |
| Medium | $45 | ~R833 | 500 | 50 | 550 |
| Large | $80 | ~R1,480 | 1,000 | 150 | 1,150 |
| XL | $180 | ~R3,330 | 2,500 | 500 | 3,000 |
| XXL | $320 | ~R5,920 | 5,000 | 1,200 | 6,200 |

---

## 13. Webhook Event Handling

### 13.1 Subscription Events

**subscription.create:**
```python
async def handle_subscription_created(data: dict, db: Session):
    # Update user to active
    user.subscription_status = "active"
    subscription.status = "active"
```

**subscription.disable:**
```python
async def handle_subscription_cancelled(data: dict, db: Session):
    # Downgrade to free at period end
    subscription.status = "cancelled"
    user.subscription_tier = "free"
    user.credits_limit = 100
```

**invoice.payment_failed:**
```python
async def handle_payment_failed(data: dict, db: Session):
    # Mark as past_due
    subscription.status = "past_due"
    # Send notification to user
    # Allow grace period before downgrade
```

### 13.2 One-Time Payment Events

**charge.success (Agent Hire or Credit Purchase):**
```python
async def handle_one_time_payment(data: dict, db: Session):
    metadata = data.get("metadata", {})
    
    if "agent_id" in metadata:
        # Agent hire
        await activate_agent_rental(metadata, db)
    elif "package_id" in metadata:
        # Credit purchase
        await add_purchased_credits(metadata, db)
```

---

## 14. Frontend Integration

### 14.1 Paystack Script

Add to `/frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
    
    <!-- Paystack Inline Script -->
    <script src="https://js.paystack.co/v1/inline.js"></script>
  </body>
</html>
```

### 14.2 Subscription Component

Already implemented in `/frontend/src/pages/SubscriptionPage.jsx`:

```javascript
const handler = window.PaystackPop.setup({
    key: VITE_PAYSTACK_PUBLIC_KEY,
    email: currentUser.email,
    amount: data.amount,  // Kobo (ZAR cents)
    currency: 'ZAR',
    ref: data.reference,
    metadata: { plan_name, user_id },
    callback: async (response) => {
        await verifyPayment(response.reference);
    }
});
```

---

## 15. Monitoring & Troubleshooting

### 15.1 Check Payment Status

**Paystack Dashboard:**
- Transactions → View all payments
- Customers → View customer details
- Plans → See subscription stats

**Cloud SQL Database:**
```sql
-- Check user subscriptions
SELECT u.email, u.subscription_tier, s.status, s.amount, s.current_period_end
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE s.status = 'active';

-- Check credit transactions
SELECT u.email, ct.package_id, ct.total_credits, ct.zar_amount, ct.status
FROM credit_transactions ct
JOIN users u ON ct.user_id = u.id
ORDER BY ct.created_at DESC;

-- Check agent rentals
SELECT u.email, ar.agent_id, ar.rental_term, ar.expires_at, ar.status
FROM agent_rentals ar
JOIN users u ON ar.user_id = u.id
WHERE ar.status = 'active';
```

### 15.2 Common Issues

**"Invalid signature" on webhook:**
- Verify `PAYSTACK_SECRET_KEY` is correct
- Check webhook is configured with correct URL
- Ensure HTTPS is enabled

**"Payment verification failed":**
- Check Paystack transaction logs
- Verify reference matches
- Check network connectivity to Paystack

**"Credits not added after purchase":**
- Check webhook was received
- Verify charge.success event handler
- Check database transaction record

**Exchange rate issues:**
- Monitor exchange rate API availability
- Verify fallback rate is reasonable
- Check logs for rate fetching errors

---

## 16. Monthly Billing Cycle

### 16.1 Credit Reset

Your system resets monthly usage:

```python
# Run as cron job or Cloud Scheduler
@router.post("/reset-monthly-usage")
async def reset_monthly_usage(db: Session):
    users = db.query(User).all()
    for user in users:
        user.credits_used_this_month = 0
        user.api_calls_this_month = 0
    db.commit()
```

**Google Cloud Scheduler Setup:**
```bash
gcloud scheduler jobs create http monthly-credit-reset \
  --schedule="0 0 1 * *" \
  --uri="https://your-backend.run.app/subscription/reset-monthly-usage" \
  --http-method=POST \
  --oidc-service-account-email=SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com
```

### 16.2 Agent Rental Expiry

Check and deactivate expired rentals:

```python
# Cron job or background task
async def check_expired_rentals(db: Session):
    expired_rentals = db.query(AgentRental).filter(
        AgentRental.expires_at < datetime.utcnow(),
        AgentRental.status == "active"
    ).all()
    
    for rental in expired_rentals:
        rental.status = "expired"
    
    db.commit()
```

---

## 17. Security Best Practices

### 17.1 API Keys
- ✅ Never expose `PAYSTACK_SECRET_KEY` in frontend
- ✅ Use environment variables for all keys
- ✅ Store in Google Cloud Secret Manager for production
- ✅ Rotate keys periodically
- ✅ Different keys for test/live environments

### 17.2 Webhook Security
- ✅ Always verify webhook signatures
- ✅ Use HTTPS for webhook endpoints
- ✅ Log all webhook events
- ✅ Implement idempotency (handle duplicate events)

### 17.3 Database Security
- ✅ Use Cloud SQL IAM authentication when possible
- ✅ Store passwords in Secret Manager
- ✅ Enable Cloud SQL SSL connections
- ✅ Regular automated backups
- ✅ Restrict database access to Cloud Run service account

---

## 18. Production Checklist

### Before Going Live:

- [ ] **Paystack Account**
  - [ ] Business verification complete
  - [ ] Live API keys obtained
  - [ ] Bank account verified for payouts

- [ ] **Plans Created**
  - [ ] All 5 plans created in Paystack dashboard
  - [ ] Plan codes match backend configuration
  - [ ] Amounts match expected ZAR pricing

- [ ] **Webhooks Configured**
  - [ ] Production webhook URL set
  - [ ] All event types selected
  - [ ] Webhook signature verification tested

- [ ] **Environment Variables**
  - [ ] Live Paystack keys in Cloud Run
  - [ ] Live Paystack public key in Netlify
  - [ ] Cloud SQL connection configured
  - [ ] All secrets in Secret Manager

- [ ] **Database**
  - [ ] All tables created
  - [ ] Migrations run
  - [ ] Backups configured
  - [ ] Test data cleared

- [ ] **Testing**
  - [ ] Small real payment tested ($1-5)
  - [ ] Subscription activation verified
  - [ ] Webhook delivery confirmed
  - [ ] Agent hire flow tested
  - [ ] Credit purchase tested
  - [ ] Cancellation flow tested

- [ ] **Monitoring**
  - [ ] Cloud Logging enabled
  - [ ] Alerts configured for failed payments
  - [ ] Webhook delivery monitoring
  - [ ] Database performance monitoring

---

## 19. API Endpoints Reference

### Subscription Endpoints

```
GET  /subscription/plans           - List all plans with current pricing
POST /subscription/initialize      - Create Paystack checkout
POST /subscription/verify          - Verify payment and activate
GET  /subscription/info            - Current user subscription
POST /subscription/cancel          - Cancel subscription
GET  /subscription/exchange-rate   - Current USD→ZAR rate
POST /subscription/webhook         - Paystack webhook handler
```

### Agent Endpoints

```
GET  /agents/available             - List agents with entitlement status
POST /agents/hire                  - Hire additional agent
GET  /subscription-agents/hired    - List user's hired agents
```

### Credit Endpoints

```
GET  /credits/packages             - Available credit packages
POST /credits/purchase             - Purchase credit package
POST /credits/verify               - Verify credit purchase payment
GET  /credits/transactions         - User's credit purchase history
```

---

## 20. Support & Help

### Paystack Resources:
- Documentation: [paystack.com/docs](https://paystack.com/docs)
- API Reference: [paystack.com/docs/api](https://paystack.com/docs/api)
- Support: support@paystack.com

### Google Cloud Resources:
- Cloud SQL: [cloud.google.com/sql/docs](https://cloud.google.com/sql/docs)
- Cloud Run: [cloud.google.com/run/docs](https://cloud.google.com/run/docs)
- Secret Manager: [cloud.google.com/secret-manager/docs](https://cloud.google.com/secret-manager/docs)

---

## 21. Quick Start Summary

### For Development:

1. **Set test API keys** in `.env` files
2. **Run migrations** to create tables
3. **Start backend** with Cloud SQL connection
4. **Start frontend** with Vite
5. **Test with test cards**

### For Production:

1. **Switch to live keys** in Cloud Run + Netlify
2. **Create Paystack plans** with ZAR amounts
3. **Configure webhooks** with production URL
4. **Set up Cloud Scheduler** for monthly resets
5. **Test with real small transaction**
6. **Monitor** Cloud Logging for any issues

---

Your Paystack integration is ready for Guild AI with subscriptions, per-agent hiring, and credit purchases! 🚀

## Next Steps

1. Create the 5 subscription plans in Paystack dashboard
2. Test the complete flow with test cards
3. When ready, switch to live keys
4. Launch to users!

**Your subscription system is production-ready with Google Cloud!** ✅

