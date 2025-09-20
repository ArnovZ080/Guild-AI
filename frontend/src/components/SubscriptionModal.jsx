import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, CreditCard, X } from 'lucide-react';
import paystackService from '../services/PaystackService';

const SubscriptionModal = ({ isOpen, onClose, currentUser, onSubscriptionUpdate }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPlans();
      loadSubscriptionInfo();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await paystackService.getAvailablePlans();
      setPlans(plansData.plans);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionInfo = async () => {
    if (!currentUser) return;
    
    try {
      const subscriptionInfo = await paystackService.getSubscriptionInfo();
      setUserSubscription(subscriptionInfo);
    } catch (error) {
      console.error('Failed to load subscription info:', error);
    }
  };

  const handleUpgrade = async (plan) => {
    if (!currentUser?.email) {
      alert('Please sign in first');
      return;
    }

    setProcessing(true);
    setSelectedPlan(plan.id);

    try {
      const result = await paystackService.initializeSubscription(
        plan.id,
        currentUser.email
      );

      if (result.success) {
        // Update UI with new subscription
        onSubscriptionUpdate?.(result.subscription);
        onClose();
        
        // Show success message
        alert(`Successfully subscribed to ${plan.name} plan!`);
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setProcessing(false);
      setSelectedPlan(null);
    }
  };

  const handleCancel = async () => {
    if (!userSubscription?.id) return;

    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setProcessing(true);
      await paystackService.cancelSubscription(userSubscription.id);
      
      // Reload subscription info
      await loadSubscriptionInfo();
      onSubscriptionUpdate?.(null);
      
      alert('Subscription cancelled successfully');
    } catch (error) {
      console.error('Cancellation failed:', error);
      alert('Failed to cancel subscription. Please contact support.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Current Subscription Status */}
        {userSubscription && (
          <div className="px-6 py-4 bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Current Plan: {userSubscription.tier || 'Free'}
                </h3>
                <p className="text-sm text-gray-600">
                  {userSubscription.status === 'active' ? 'Active until ' + 
                    new Date(userSubscription.current_period_end).toLocaleDateString() : 
                    'Status: ' + userSubscription.status}
                </p>
              </div>
              {userSubscription.status === 'active' && (
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = userSubscription?.tier === plan.id;
                const isPlanProcessing = selectedPlan === plan.id && processing;
                
                return (
                  <motion.div
                    key={plan.id}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                      plan.popular 
                        ? 'border-blue-500 bg-white shadow-lg scale-105' 
                        : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-md'
                    } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                    whileHover={{ y: -2 }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Current Plan
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                      
                      {/* Primary USD Price Display */}
                      <div className="mb-2">
                        <span className="text-3xl font-bold text-gray-900">{plan.usd_display}</span>
                        {plan.id !== 'free' && <span className="text-gray-600 ml-1">/month</span>}
                      </div>
                      
                      {/* ZAR Equivalent */}
                      {plan.id !== 'free' && (
                        <div className="mb-2">
                          <span className="text-lg text-blue-600 font-semibold">{plan.zar_display}</span>
                          <span className="text-sm text-gray-500 ml-1">ZAR/month</span>
                        </div>
                      )}
                      
                      {/* Credits */}
                      <p className="text-sm text-purple-600 font-medium mb-2">
                        {plan.credits} credits/month
                      </p>
                    </div>
                    
                    {/* Features List */}
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm">{feature.replace('_', ' ')}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* CTA Button */}
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={processing || isCurrentPlan || plan.id === 'free'}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                        isCurrentPlan 
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : plan.popular
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      } ${(processing || plan.id === 'free') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isPlanProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : plan.id === 'free' ? (
                        'Free Forever'
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Subscribe</span>
                        </>
                      )}
                    </button>
                    
                    {/* Billing Disclaimer */}
                    {plan.id !== 'free' && (
                      <p className="text-xs text-gray-500 text-center mt-3">
                        Billed in {plan.zar_display} ZAR
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t rounded-b-2xl">
          <div className="text-center text-gray-600 text-sm">
            <p>All plans include a 14-day free trial. Cancel anytime.</p>
            <p className="mt-1">Secure payments processed by Paystack 🔒</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionModal;
