import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import guildLogo from '../assets/guild-logo.png';

function SubscriptionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, userProfile, getIdToken } = useAuth();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');
  const [exchangeRate, setExchangeRate] = useState(null);
  
  const selectedPlanParam = searchParams.get('plan');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  useEffect(() => {
    if (!currentUser) {
      navigate('/signup');
      return;
    }
    
    fetchPlans();
  }, [currentUser, navigate]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/subscription/plans`);
      const data = await response.json();
      
      setPlans(data.plans || []);
      setExchangeRate(data.exchange_rate);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load subscription plans');
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free') {
      // Free plan - just navigate to dashboard
      navigate('/dashboard');
      return;
    }

    if (!PAYSTACK_PUBLIC_KEY) {
      setError('Payment system not configured. Please contact support.');
      return;
    }

    try {
      setProcessingPayment(true);
      setError('');
      
      // Get auth token
      const token = await getIdToken();
      
      // Initialize payment with backend
      const response = await fetch(`${API_URL}/subscription/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: plan.id,
          email: currentUser.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const data = await response.json();
      
      // Initialize Paystack popup
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: currentUser.email,
        amount: data.amount, // Amount in kobo (ZAR cents)
        currency: 'ZAR',
        ref: data.reference,
        metadata: {
          custom_fields: [
            {
              display_name: "Plan",
              variable_name: "plan_name",
              value: plan.name
            },
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: currentUser.uid
            }
          ]
        },
        onClose: function() {
          setProcessingPayment(false);
          setError('Payment cancelled');
        },
        callback: async function(response) {
          // Verify payment with backend
          await verifyPayment(response.reference);
        }
      });

      handler.openIframe();
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment');
      setProcessingPayment(false);
    }
  };

  const verifyPayment = async (reference) => {
    try {
      const token = await getIdToken();
      
      const response = await fetch(`${API_URL}/subscription/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reference })
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();
      
      if (data.success) {
        // Payment successful - navigate to dashboard
        navigate('/dashboard?subscription_success=true');
      } else {
        setError('Payment verification failed');
      }
      
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify payment. Please contact support.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center space-x-3">
            <img 
              src={guildLogo}
              alt="Guild AI Logo" 
              className="w-10 h-10 rounded-lg"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
              Guild AI
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">
            Select the plan that best fits your needs. All paid plans include a 21-day free trial.
          </p>
          {exchangeRate && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Exchange rate: $1 USD = R{exchangeRate.toFixed(2)} ZAR • Prices shown in USD for reference, billed in ZAR
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Plan */}
        {userProfile && userProfile.subscription_tier !== 'free' && (
          <Alert className="mb-8 max-w-2xl mx-auto bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
            <AlertDescription className="text-emerald-700 dark:text-emerald-300">
              Current plan: <strong>{userProfile.subscription_tier}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${
                plan.popular ? 'border-sky-500 border-2 shadow-xl scale-105' : 
                plan.id === 'free' ? 'border-emerald-500 border-2' : 
                'border-slate-200 dark:border-slate-800'
              } ${selectedPlanParam === plan.id ? 'ring-2 ring-sky-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white">
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.id === 'free' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                    Start Free
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                    {plan.usd_display}
                  </span>
                  {plan.usd_price > 0 && (
                    <>
                      <span className="text-slate-600 dark:text-slate-400">/month</span>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {plan.zar_display} ZAR
                      </p>
                    </>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                    {plan.credits} credits/month
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {plan.api_calls} API calls
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Button 
                  className={`w-full mb-6 ${
                    plan.popular ? 'bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700' : 
                    plan.id === 'free' ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700' : ''
                  }`}
                  variant={plan.popular || plan.id === 'free' ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan)}
                  disabled={processingPayment || (userProfile?.subscription_tier === plan.id)}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : userProfile?.subscription_tier === plan.id ? (
                    'Current Plan'
                  ) : plan.id === 'free' ? (
                    'Get Started'
                  ) : (
                    `Subscribe ${plan.trial_days > 0 ? `(${plan.trial_days} days free)` : ''}`
                  )}
                </Button>
                
                <ul className="space-y-3">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            All plans include: Judge Layer QA • Educational Transparency • 24/7 Operation
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Need help choosing? <a href="/contact" className="text-sky-600 hover:text-sky-700 dark:text-sky-400">Contact our team</a>
          </p>
        </div>
      </div>

      {/* Load Paystack Script */}
      {!window.PaystackPop && PAYSTACK_PUBLIC_KEY && (
        <script src="https://js.paystack.co/v1/inline.js"></script>
      )}
    </div>
  );
}

export default SubscriptionPage;

