import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  CreditCard, 
  Zap, 
  Check, 
  X, 
  AlertTriangle,
  Clock,
  TrendingUp,
  Package
} from 'lucide-react';
import authService from './authService';

// Credit packages with tiered pricing (more expensive than subscription credits)
const CREDIT_PACKAGES = [
  {
    id: 'credits_100',
    credits: 100,
    usd_price: 8,    // $0.08 per credit vs $0.039 in starter plan
    popular: false,
    bonus: 0,
    description: 'Perfect for small tasks'
  },
  {
    id: 'credits_250',
    credits: 250,
    usd_price: 18,   // $0.072 per credit (10% discount)
    popular: true,
    bonus: 25,       // Bonus credits
    description: 'Most popular top-up'
  },
  {
    id: 'credits_500',
    credits: 500,
    usd_price: 32,   // $0.064 per credit (20% discount)
    popular: false,
    bonus: 75,       // More bonus credits
    description: 'Great value for power users'
  },
  {
    id: 'credits_1000',
    credits: 1000,
    usd_price: 55,   // $0.055 per credit (31% discount)
    popular: false,
    bonus: 200,      // Maximum bonus
    description: 'Best value - almost subscription rate'
  }
];

class CreditTopupService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL;
  }

  async purchaseCredits(packageId, userEmail) {
    try {
      const token = await authService.getAuthToken();
      
      const response = await fetch(`${this.apiUrl}/credits/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          package_id: packageId,
          email: userEmail
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize credit purchase');
      }

      const data = await response.json();
      
      // Use Paystack for one-time payment
      return new Promise((resolve, reject) => {
        const handler = window.PaystackPop.setup({
          key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
          email: userEmail,
          amount: data.zar_amount * 100, // Convert to kobo
          currency: 'ZAR',
          ref: data.reference,
          
          metadata: {
            package_id: packageId,
            credits: data.credits,
            bonus_credits: data.bonus_credits,
            user_email: userEmail,
            purchase_type: 'credit_topup'
          },

          callback: async (response) => {
            try {
              const verificationResult = await this.verifyPurchase(response.reference);
              resolve({
                success: true,
                reference: response.reference,
                credits_added: verificationResult.credits_added
              });
            } catch (error) {
              reject(error);
            }
          },

          onClose: () => {
            reject(new Error('Payment cancelled by user'));
          }
        });

        handler.openIframe();
      });

    } catch (error) {
      console.error('Credit purchase error:', error);
      throw error;
    }
  }

  async verifyPurchase(reference) {
    try {
      const token = await authService.getAuthToken();
      
      const response = await fetch(`${this.apiUrl}/credits/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reference })
      });

      if (!response.ok) {
        throw new Error('Credit purchase verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Credit verification error:', error);
      throw error;
    }
  }

  async getCreditHistory() {
    try {
      const token = await authService.getAuthToken();
      
      const response = await fetch(`${this.apiUrl}/credits/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch credit history');
      }

      return await response.json();
    } catch (error) {
      console.error('Credit history error:', error);
      throw error;
    }
  }
}

// Credit top-up modal component
const CreditTopupModal = ({ isOpen, onClose, userProfile, onCreditsUpdated }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [error, setError] = useState('');

  const creditService = new CreditTopupService();

  useEffect(() => {
    if (isOpen) {
      loadPackages();
    }
  }, [isOpen]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      // Get packages with current exchange rates
      const response = await fetch(`${process.env.REACT_APP_API_URL}/credits/packages`);
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages);
      } else {
        // Fallback to static packages
        setPackages(await convertPackagesToZAR());
      }
    } catch (error) {
      console.error('Failed to load packages:', error);
      setPackages(await convertPackagesToZAR());
    } finally {
      setLoading(false);
    }
  };

  const convertPackagesToZAR = async () => {
    const rate = 18.5; // Fallback rate
    return CREDIT_PACKAGES.map(pkg => ({
      ...pkg,
      zar_price: Math.round(pkg.usd_price * rate / 10) * 10, // Round to nearest R10
      total_credits: pkg.credits + pkg.bonus,
      cost_per_credit_usd: (pkg.usd_price / (pkg.credits + pkg.bonus)).toFixed(3),
      cost_per_credit_zar: ((pkg.usd_price * rate) / (pkg.credits + pkg.bonus)).toFixed(2)
    }));
  };

  const handlePurchase = async (packageData) => {
    if (!userProfile?.email) {
      setError('Please sign in first');
      return;
    }

    setProcessing(true);
    setSelectedPackage(packageData.id);
    setError('');

    try {
      const result = await creditService.purchaseCredits(
        packageData.id,
        userProfile.email
      );

      if (result.success) {
        onCreditsUpdated?.(result.credits_added);
        onClose();
        
        // Show success notification
        alert(`Successfully purchased ${result.credits_added} credits!`);
      }
    } catch (error) {
      console.error('Credit purchase failed:', error);
      setError(error.message || 'Purchase failed. Please try again.');
    } finally {
      setProcessing(false);
      setSelectedPackage(null);
    }
  };

  const getValueBadge = (pkg) => {
    const subscriptionRate = 0.039; // $39 for 1000 credits in starter plan
    const packageRate = pkg.usd_price / (pkg.credits + pkg.bonus);
    const savings = Math.round((1 - (packageRate / subscriptionRate)) * 100);
    
    if (savings > 0) {
      return `${savings}% better than subscription rate!`;
    }
    return null;
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
        <div className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Buy Extra Credits</h2>
                <p className="text-green-100 text-sm">Top up your account instantly</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Current Balance */}
        {userProfile && (
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Current Balance</h3>
                <p className="text-sm text-gray-600">
                  {userProfile.credits_limit - userProfile.credits_used_this_month} credits remaining this month
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {userProfile.credits_limit - userProfile.credits_used_this_month}
                </div>
                <div className="text-sm text-gray-500">
                  of {userProfile.credits_limit} credits
                </div>
              </div>
            </div>
            
            {/* Usage Warning */}
            {userProfile.credits_used_this_month >= userProfile.credits_limit * 0.9 && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-orange-800 text-sm">
                  You're running low on credits. Consider upgrading your plan for better value!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Packages Grid */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg) => {
                const isPkgProcessing = selectedPackage === pkg.id && processing;
                const valueBadge = getValueBadge(pkg);
                
                return (
                  <motion.div
                    key={pkg.id}
                    className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                      pkg.popular 
                        ? 'border-green-500 bg-white shadow-lg scale-105' 
                        : 'border-gray-200 bg-white hover:border-green-200 hover:shadow-md'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {valueBadge && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Great Deal!
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {pkg.credits.toLocaleString()} Credits
                      </h3>
                      
                      {pkg.bonus > 0 && (
                        <div className="mb-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                            +{pkg.bonus} bonus credits!
                          </span>
                        </div>
                      )}
                      
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-gray-900">${pkg.usd_price}</span>
                        <div className="text-lg text-blue-600 font-semibold">R{pkg.zar_price}</div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2">{pkg.description}</p>
                      
                      <div className="text-xs text-gray-400">
                        R{pkg.cost_per_credit_zar}/credit
                      </div>
                    </div>
                    
                    <ul className="space-y-2 mb-6 text-sm">
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{(pkg.credits + pkg.bonus).toLocaleString()} total credits</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>Credits never expire</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-purple-500" />
                        <span>Added instantly</span>
                      </li>
                      {pkg.bonus > 0 && (
                        <li className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                          <span>Bonus credits included!</span>
                        </li>
                      )}
                    </ul>
                    
                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={processing}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                        pkg.popular
                          ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isPkgProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Buy for R{pkg.zar_price}</span>
                        </>
                      )}
                    </button>
                    
                    {valueBadge && (
                      <div className="mt-2 text-center text-xs text-orange-600 font-medium">
                        {valueBadge}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upgrade Suggestion */}
        <div className="px-6 py-4 bg-blue-50 border-t rounded-b-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900">Need credits regularly?</h4>
              <p className="text-sm text-blue-700">
                Upgrade your subscription plan for much better value - up to 50% cheaper per credit!
              </p>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
              View Plans
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Credit purchase button component (for the chat interface)
const QuickCreditButton = ({ creditsNeeded, userProfile, onPurchaseComplete }) => {
  const [showModal, setShowModal] = useState(false);
  const [recommendedPackage, setRecommendedPackage] = useState(null);

  useEffect(() => {
    if (creditsNeeded) {
      // Recommend the smallest package that covers the needed credits
      const suitable = CREDIT_PACKAGES.find(pkg => 
        (pkg.credits + pkg.bonus) >= creditsNeeded
      );
      setRecommendedPackage(suitable || CREDIT_PACKAGES[0]);
    }
  }, [creditsNeeded]);

  const handlePurchaseComplete = (creditsAdded) => {
    setShowModal(false);
    onPurchaseComplete?.(creditsAdded);
  };

  return (
    <>
      <motion.button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-4 h-4" />
        <span>Buy Credits</span>
        {creditsNeeded && <span>({creditsNeeded} needed)</span>}
      </motion.button>

      <CreditTopupModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userProfile={userProfile}
        onCreditsUpdated={handlePurchaseComplete}
      />
    </>
  );
};

export { CreditTopupService, CreditTopupModal, QuickCreditButton, CREDIT_PACKAGES };
