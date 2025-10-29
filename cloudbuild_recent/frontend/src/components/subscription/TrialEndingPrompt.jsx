import React, { useState, useEffect } from 'react';
import { AlertCircle, CreditCard, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';

const TrialEndingPrompt = ({ subscription, onAddPayment, onDismiss }) => {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!subscription || subscription.status !== 'trialing' || !subscription.trial_end) {
      return;
    }

    const calculateDaysRemaining = () => {
      const trialEnd = new Date(subscription.trial_end);
      const now = new Date();
      const diffTime = trialEnd.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysRemaining(diffDays);
      
      // Show prompt when:
      // - 7 days or less remaining
      // - Trial has ended (0 or negative days)
      setShowPrompt(diffDays <= 7);
    };

    calculateDaysRemaining();
    const interval = setInterval(calculateDaysRemaining, 1000 * 60 * 60); // Update hourly

    return () => clearInterval(interval);
  }, [subscription]);

  if (!showPrompt) {
    return null;
  }

  const isExpired = daysRemaining <= 0;
  const isUrgent = daysRemaining <= 3;

  return (
    <Card className={`border-2 ${isExpired ? 'border-red-500 bg-red-50 dark:bg-red-950' : isUrgent ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : 'border-amber-500 bg-amber-50 dark:bg-amber-950'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-6 h-6 mt-1 ${isExpired ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-amber-600'}`} />
            <div>
              <CardTitle className={`text-xl ${isExpired ? 'text-red-900 dark:text-red-100' : 'text-slate-900 dark:text-slate-100'}`}>
                {isExpired ? 'Your Trial Has Ended' : `Your Trial Ends in ${daysRemaining} Day${daysRemaining === 1 ? '' : 's'}`}
              </CardTitle>
              <CardDescription className={isExpired ? 'text-red-700 dark:text-red-300' : 'text-slate-600 dark:text-slate-400'}>
                {isExpired 
                  ? 'Add payment details to continue using your plan' 
                  : 'Add payment details now to avoid interruption'
                }
              </CardDescription>
            </div>
          </div>
          {!isExpired && onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Plan Benefits */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
              You're on the {subscription?.plan_name || 'Growth'} Plan
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span>
              <span className="text-slate-700 dark:text-slate-300">
                {subscription?.plan_details?.included_agents || 10} included agents
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span>
              <span className="text-slate-700 dark:text-slate-300">
                {subscription?.plan_details?.credits_limit || 10000} credits/month
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span>
              <span className="text-slate-700 dark:text-slate-300">
                Full workflow builder
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span>
              <span className="text-slate-700 dark:text-slate-300">
                Priority support
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-5 h-5 text-slate-500" />
          <div>
            <span className="text-slate-600 dark:text-slate-400">Trial started:</span>
            <span className="ml-2 font-medium text-slate-900 dark:text-slate-100">
              {subscription?.trial_start ? new Date(subscription.trial_start).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="text-slate-400">→</div>
          <div>
            <span className="text-slate-600 dark:text-slate-400">Trial ends:</span>
            <span className={`ml-2 font-medium ${isExpired ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-amber-600'}`}>
              {subscription?.trial_end ? new Date(subscription.trial_end).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-sky-50 to-emerald-50 dark:from-sky-950 dark:to-emerald-950 rounded-lg p-4">
          <div className="text-center">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              After trial, only
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              ${subscription?.plan_details?.price || 99}
              <span className="text-lg font-normal text-slate-600 dark:text-slate-400">/month</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Cancel anytime • No long-term commitment
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={onAddPayment}
            className="flex-1 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white"
            size="lg"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isExpired ? 'Add Payment to Continue' : 'Add Payment Details'}
          </Button>
          {!isExpired && (
            <Button 
              onClick={() => window.location.href = '/settings'}
              variant="outline"
              size="lg"
            >
              View Plans
            </Button>
          )}
        </div>

        {/* Security Notice */}
        <Alert>
          <AlertDescription className="text-xs text-slate-600 dark:text-slate-400">
            🔒 Secure payment via Paystack. We never store your card details. You can cancel anytime.
          </AlertDescription>
        </Alert>

        {/* What Happens If No Payment */}
        {isExpired && (
          <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-4 text-sm">
            <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
              Without payment, you'll be downgraded to the Free plan:
            </p>
            <ul className="space-y-1 text-red-700 dark:text-red-300">
              <li>• Basic chat only (no agents)</li>
              <li>• Limited credits (100/month)</li>
              <li>• No workflow builder</li>
              <li>• Community support only</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrialEndingPrompt;

