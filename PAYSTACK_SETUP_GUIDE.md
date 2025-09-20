# Paystack Setup Guide for Guild AI

This guide will help you set up Paystack for handling subscriptions and credit purchases in Guild AI.

## 1. Create Paystack Account

1. Go to [paystack.com](https://paystack.com) and sign up
2. Complete your business verification:
   - Business name and details
   - Bank account information
   - Business registration documents
   - Identity verification

## 2. Get Your API Keys

### 2.1 Test Keys (Development)
1. In your Paystack dashboard, go to **Settings > API Keys & Webhooks**
2. Copy your **Test Secret Key** (starts with `sk_test_`)
3. Copy your **Test Public Key** (starts with `pk_test_`)

### 2.2 Live Keys (Production)
1. After completing verification, you'll get live keys
2. Copy your **Live Secret Key** (starts with `sk_live_`)
3. Copy your **Live Public Key** (starts with `pk_live_`)

## 3. Create Subscription Plans

### 3.1 Create Plans in Paystack Dashboard

1. Go to **Plans** in your Paystack dashboard
2. Create plans for each subscription tier:

#### Starter Plan
- **Plan Name**: "Guild AI Starter"
- **Plan Code**: `PLN_starter` (must match backend)
- **Amount**: `72000` (R720 in kobo - will be calculated dynamically)
- **Currency**: `ZAR`
- **Interval**: `monthly`
- **Description**: "Perfect for individuals and small teams"

#### Professional Plan
- **Plan Name**: "Guild AI Professional"
- **Plan Code**: `PLN_professional`
- **Amount**: `183000` (R1,830 in kobo)
- **Currency**: `ZAR`
- **Interval**: `monthly`
- **Description**: "Advanced features for growing businesses"

#### Enterprise Plan
- **Plan Name**: "Guild AI Enterprise"
- **Plan Code**: `PLN_enterprise`
- **Amount**: `368000` (R3,680 in kobo)
- **Currency**: `ZAR`
- **Interval**: `monthly`
- **Description**: "Full-featured solution for large organizations"

### 3.2 Update Backend Configuration

Update your `SUBSCRIPTION_PLANS` in `/api_server/src/routes/subscription.py`:

```python
SUBSCRIPTION_PLANS = {
    "starter": {
        "name": "Starter",
        "credits": 1000,
        "api_calls": 5000,
        "usd_price": 39,
        "zar_price": 720,  # This will be calculated dynamically
        "features": ["unlimited_chat", "basic_workflows", "content_creation"],
        "paystack_plan_code": "PLN_starter"  # Must match Paystack plan code
    },
    # ... other plans
}
```

## 4. Configure Webhooks

### 4.1 Set Up Webhook Endpoint

1. In your Paystack dashboard, go to **Settings > API Keys & Webhooks**
2. Click **Add Webhook**
3. Set webhook URL: `https://yourdomain.com/subscription/webhook`
4. Select events to listen for:
   - `subscription.create`
   - `subscription.disable`
   - `invoice.create`
   - `invoice.payment_failed`
   - `subscription.not_renewing`

### 4.2 Webhook Security

Your backend already includes webhook signature verification:

```python
# Verify webhook signature
expected_signature = hmac.new(
    PAYSTACK_SECRET_KEY.encode(),
    body,
    hashlib.sha512
).hexdigest()

if signature != expected_signature:
    raise HTTPException(status_code=400, detail="Invalid signature")
```

## 5. Test Payment Flow

### 5.1 Test Cards

Use these test card numbers:

- **Success**: `4084084084084081`
- **Declined**: `4084084084084085`
- **Insufficient Funds**: `4084084084084085`

Use any future expiry date and any 3-digit CVV.

### 5.2 Test the Flow

1. Start your backend server
2. Start your frontend development server
3. Try to subscribe to a plan
4. Use a test card number
5. Check your Paystack dashboard for the transaction
6. Verify the webhook was received by your backend

## 6. Environment Variables

Add these to your environment files:

### Development (.env)
```bash
# Paystack Test Keys
PAYSTACK_SECRET_KEY=sk_test_your_test_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_test_public_key
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_test_public_key
```

### Production (.env)
```bash
# Paystack Live Keys
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
```

## 7. Currency and Pricing

### 7.1 Dynamic Pricing

The system automatically converts USD prices to ZAR:

```python
async def calculate_zar_price(usd_price: float) -> int:
    """Convert USD price to ZAR and round appropriately"""
    if usd_price == 0:
        return 0
    
    exchange_rate = await get_current_exchange_rate()
    zar_amount = usd_price * exchange_rate
    
    # Round to nearest 10 for cleaner pricing
    return int(round(zar_amount / 10) * 10)
```

### 7.2 Exchange Rate Sources

The system tries multiple exchange rate sources:
1. `api.exchangerate-api.com` (free tier)
2. `fixer.io` (requires API key)
3. `exchangerate-api.com` v6 (requires API key)

Fallback rate: 18.5 ZAR per USD

## 8. Production Checklist

### 8.1 Before Going Live

- [ ] Complete business verification on Paystack
- [ ] Switch to live API keys
- [ ] Test with real (small) amounts
- [ ] Set up proper webhook URLs
- [ ] Configure email notifications
- [ ] Set up monitoring and logging
- [ ] Test subscription cancellations
- [ ] Verify refund process

### 8.2 Monitoring

Set up monitoring for:
- Failed payments
- Webhook delivery failures
- Subscription cancellations
- Chargeback notifications

## 9. Advanced Configuration

### 9.1 Custom Payment Pages

You can customize the Paystack payment page by adding metadata:

```javascript
const handler = window.PaystackPop.setup({
  key: this.publicKey,
  email: userEmail,
  amount: amount,
  currency: 'ZAR',
  ref: reference,
  metadata: {
    custom_fields: [
      {
        display_name: "Plan Name",
        variable_name: "plan_name",
        value: planName
      }
    ]
  }
});
```

### 9.2 Subscription Management

Your backend handles:
- Subscription creation
- Payment verification
- Plan upgrades/downgrades
- Cancellation handling
- Usage tracking

### 9.3 Credit System

The credit top-up system uses one-time payments:
- No recurring billing
- Instant credit addition
- Bonus credits for larger packages
- Never-expiring credits

## 10. Troubleshooting

### Common Issues:

1. **"Invalid key" errors**
   - Check that you're using the correct keys for your environment
   - Ensure keys are properly set in environment variables

2. **Webhook not received**
   - Check webhook URL is accessible from internet
   - Verify webhook events are selected
   - Check server logs for webhook processing errors

3. **Currency conversion issues**
   - Check exchange rate API availability
   - Verify fallback rates are reasonable
   - Monitor for rate limit issues

4. **Subscription not activating**
   - Check webhook processing
   - Verify plan codes match between Paystack and backend
   - Check database for subscription records

### Getting Help:
- Check Paystack documentation: [paystack.com/docs](https://paystack.com/docs)
- Contact Paystack support
- Check your Paystack dashboard for transaction logs

## 11. Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Verify webhook signatures** to prevent fraud
3. **Use HTTPS** for all webhook endpoints
4. **Monitor for suspicious activity**
5. **Keep API keys secure** and rotate them periodically
6. **Use environment variables** for all sensitive data

Your Paystack integration is now ready for Guild AI! 🚀

## 12. Next Steps

1. Complete the Supabase setup (see SUPABASE_SETUP_GUIDE.md)
2. Test the complete payment flow
3. Set up production monitoring
4. Configure email notifications
5. Deploy to production

The subscription and credit system is now fully integrated and ready to use!
