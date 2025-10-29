import React, { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription.js';
import TrialEndingPrompt from './TrialEndingPrompt.jsx';
import AddPaymentModal from './AddPaymentModal.jsx';

/**
 * Manages subscription-related UI across the app
 * Shows trial ending prompts, payment modals, etc.
 */
const SubscriptionManager = ({ children }) => {
  const { subscription, isTrialing, daysRemaining } = useSubscription();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [dismissedPrompt, setDismissedPrompt] = useState(false);

  const shouldShowTrialPrompt = () => {
    if (!isTrialing || dismissedPrompt) return false;
    if (daysRemaining === null) return false;
    
    // Show when 7 days or less remaining, or trial expired
    return daysRemaining <= 7;
  };

  const handleAddPayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    window.location.href = '/settings?payment=success';
  };

  const handleDismiss = () => {
    // Only allow dismiss if more than 1 day remaining
    if (daysRemaining > 1) {
      setDismissedPrompt(true);
      // Store dismissal in localStorage with timestamp
      localStorage.setItem('trial_prompt_dismissed', Date.now().toString());
    }
  };

  return (
    <>
      {/* Show trial prompt if applicable */}
      {shouldShowTrialPrompt() && (
        <div className="mb-6">
          <TrialEndingPrompt
            subscription={subscription}
            onAddPayment={handleAddPayment}
            onDismiss={daysRemaining > 1 ? handleDismiss : null}
          />
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <AddPaymentModal
          subscription={subscription}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Render children (actual page content) */}
      {children}
    </>
  );
};

export default SubscriptionManager;

