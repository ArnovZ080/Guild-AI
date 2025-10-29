import React, { useState } from 'react';
import { CreditCard, Lock, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';

const AddPaymentModal = ({ subscription, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddPayment = async () => {
    try {
      setLoading(true);
      setError('');

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const { auth } = await import('../../config/firebase.js');
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;

      if (!token) {
        setError('Please log in to add payment details');
        return;
      }

      // Get current subscription info
      const subscriptionResponse = await fetch(`${API_URL}/subscription/info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!subscriptionResponse.ok) {
        throw new Error('Failed to get subscription info');
      }

      const subData = await subscriptionResponse.json();
      
      // Initialize Paystack payment for subscription conversion
      const response = await fetch(`${API_URL}/subscription/convert-trial`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: subData.plan_id || subscription?.plan_id,
          email: auth.currentUser.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to initialize payment');
      }

      const data = await response.json();

      // Redirect to Paystack payment page
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No payment URL received');
      }

    } catch (err) {
      console.error('Payment initialization error:', err);
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Add Payment Details</CardTitle>
              <CardDescription>
                Continue your {subscription?.plan_name || 'subscription'} after trial
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Summary */}
          <div className="bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-950 dark:to-emerald-950 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  {subscription?.plan_name || 'Growth Plan'}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {subscription?.plan_details?.included_agents || 10} agents • {subscription?.plan_details?.credits_limit || 10000} credits/month
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ${subscription?.plan_details?.price || 99}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  per month
                </div>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white">
              First payment due after trial ends
            </Badge>
          </div>

          {/* What You Get */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              What you keep with paid subscription:
            </h4>
            <ul className="text-sm space-y-1 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                All {subscription?.plan_details?.included_agents || 10} AI agents
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                {subscription?.plan_details?.credits_limit || 10000} monthly credits
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                Full workflow builder access
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                All your business data and workflows
              </li>
            </ul>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handleAddPayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white"
            size="lg"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Add Payment & Continue
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Security Note */}
          <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded p-3">
            <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1">Secure Payment via Paystack</p>
              <p>Your card details are encrypted and never stored on our servers. You can cancel anytime with one click.</p>
            </div>
          </div>

          {/* Downgrade Option */}
          <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
              Don't want to continue with {subscription?.plan_name || 'this plan'}?
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={() => window.location.href = '/settings'}
              className="text-xs text-slate-600 dark:text-slate-400"
            >
              Switch to Free Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPaymentModal;

