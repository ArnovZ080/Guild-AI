import { useState, useEffect } from 'react';

/**
 * Hook to manage subscription state and trial status
 */
export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const { auth } = await import('../config/firebase.js');
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;

      if (!token) {
        setSubscription(null);
        return;
      }

      const response = await fetch(`${API_URL}/subscription/info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const refresh = () => {
    fetchSubscription();
  };

  return {
    subscription,
    loading,
    error,
    refresh,
    isTrialing: subscription?.status === 'trialing',
    isActive: subscription?.status === 'active',
    trialEnd: subscription?.trial_end ? new Date(subscription.trial_end) : null,
    daysRemaining: subscription?.trial_end 
      ? Math.ceil((new Date(subscription.trial_end) - new Date()) / (1000 * 60 * 60 * 24))
      : null
  };
};

