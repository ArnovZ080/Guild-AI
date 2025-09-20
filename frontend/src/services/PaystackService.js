import authService from './authService';

class PaystackService {
  constructor() {
    this.publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
    this.apiUrl = process.env.REACT_APP_API_URL;
    this.paystackLoaded = false;
  }

  // Load Paystack script
  async loadPaystackScript() {
    if (this.paystackLoaded) return true;

    return new Promise((resolve, reject) => {
      if (document.getElementById('paystack-js')) {
        this.paystackLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'paystack-js';
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      
      script.onload = () => {
        this.paystackLoaded = true;
        resolve(true);
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Paystack script'));
      };

      document.body.appendChild(script);
    });
  }

  // Initialize subscription payment
  async initializeSubscription(planId, userEmail) {
    try {
      await this.loadPaystackScript();
      
      const token = await authService.getAuthToken();
      
      // Get subscription details from backend
      const response = await fetch(`${this.apiUrl}/subscription/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: planId,
          email: userEmail
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize subscription');
      }

      const { authorization_url, reference, amount, plan_name } = await response.json();

      return new Promise((resolve, reject) => {
        const handler = window.PaystackPop.setup({
          key: this.publicKey,
          email: userEmail,
          amount: amount, // Amount in kobo (ZAR cents)
          currency: 'ZAR',
          ref: reference,
          plan: planId,
          
          metadata: {
            plan_name: plan_name,
            user_email: userEmail
          },

          callback: async (response) => {
            try {
              // Verify payment with backend
              const verificationResult = await this.verifyPayment(response.reference);
              resolve({
                success: true,
                reference: response.reference,
                subscription: verificationResult
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
      console.error('Subscription initialization error:', error);
      throw error;
    }
  }

  // Verify payment with backend
  async verifyPayment(reference) {
    try {
      const token = await authService.getAuthToken();
      
      const response = await fetch(`${this.apiUrl}/subscription/verify`, {
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

      return await response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const token = await authService.getAuthToken();
      
      const response = await fetch(`${this.apiUrl}/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscription_id: subscriptionId })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, newPlanId) {
    try {
      const token = await authService.getAuthToken();
      
      const response = await fetch(`${this.apiUrl}/subscription/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          new_plan_id: newPlanId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Subscription update error:', error);
      throw error;
    }
  }

  // Get user's subscription info
  async getSubscriptionInfo() {
    try {
      const token = await authService.getAuthToken();
      
      const response = await fetch(`${this.apiUrl}/subscription/info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription info');
      }

      return await response.json();
    } catch (error) {
      console.error('Subscription info error:', error);
      throw error;
    }
  }

  // Get available plans
  async getAvailablePlans() {
    try {
      const response = await fetch(`${this.apiUrl}/subscription/plans`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      return await response.json();
    } catch (error) {
      console.error('Plans fetch error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const paystackService = new PaystackService();
export default paystackService;
