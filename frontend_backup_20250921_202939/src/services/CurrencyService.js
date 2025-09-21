class CurrencyService {
  constructor() {
    this.exchangeRate = null;
    this.lastUpdated = null;
    this.fallbackRate = 18.5; // Conservative fallback USD to ZAR rate
    this.cacheExpiry = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  }

  // Primary pricing in USD (what users see)
  getPrimaryPricing() {
    return {
      free: {
        usd: 0,
        display: "Free"
      },
      starter: {
        usd: 39,
        display: "$39"
      },
      professional: {
        usd: 99,
        display: "$99"
      },
      enterprise: {
        usd: 199,
        display: "$199"
      }
    };
  }

  // Fetch live exchange rate
  async fetchExchangeRate() {
    try {
      // Try multiple sources for reliability
      const sources = [
        'https://api.exchangerate-api.com/v4/latest/USD',
        'https://api.fixer.io/latest?base=USD&access_key=YOUR_FIXER_KEY',
        'https://v6.exchangerate-api.com/v6/YOUR_KEY/latest/USD'
      ];

      for (const source of sources) {
        try {
          const response = await fetch(source);
          if (response.ok) {
            const data = await response.json();
            if (data.rates && data.rates.ZAR) {
              this.exchangeRate = data.rates.ZAR;
              this.lastUpdated = Date.now();
              localStorage.setItem('exchange_rate', JSON.stringify({
                rate: this.exchangeRate,
                timestamp: this.lastUpdated
              }));
              console.log(`Exchange rate updated: 1 USD = ${this.exchangeRate} ZAR`);
              return this.exchangeRate;
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${source}:`, error);
          continue;
        }
      }
      
      throw new Error('All exchange rate sources failed');
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      return this.getStoredRate();
    }
  }

  // Get stored rate from localStorage or use fallback
  getStoredRate() {
    try {
      const stored = localStorage.getItem('exchange_rate');
      if (stored) {
        const { rate, timestamp } = JSON.parse(stored);
        // Check if cached rate is still valid (within 24 hours for fallback)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          this.exchangeRate = rate;
          this.lastUpdated = timestamp;
          return rate;
        }
      }
    } catch (error) {
      console.warn('Failed to get stored exchange rate:', error);
    }
    
    // Use fallback rate
    this.exchangeRate = this.fallbackRate;
    this.lastUpdated = Date.now();
    return this.fallbackRate;
  }

  // Get current exchange rate (cached or fresh)
  async getCurrentRate() {
    // Return cached rate if it's fresh (within cache expiry)
    if (this.exchangeRate && this.lastUpdated && 
        Date.now() - this.lastUpdated < this.cacheExpiry) {
      return this.exchangeRate;
    }

    // Fetch fresh rate
    return await this.fetchExchangeRate();
  }

  // Convert USD to ZAR
  async convertToZAR(usdAmount) {
    if (usdAmount === 0) return 0;
    
    const rate = await this.getCurrentRate();
    const zarAmount = usdAmount * rate;
    
    // Round to nearest rand
    return Math.round(zarAmount);
  }

  // Get all pricing with conversions
  async getAllPricingWithConversions() {
    const usdPricing = this.getPrimaryPricing();
    const rate = await this.getCurrentRate();
    
    const pricingWithConversions = {};
    
    for (const [tier, pricing] of Object.entries(usdPricing)) {
      const zarAmount = await this.convertToZAR(pricing.usd);
      
      pricingWithConversions[tier] = {
        ...pricing,
        zar: zarAmount,
        zarDisplay: zarAmount > 0 ? `R${zarAmount.toLocaleString()}` : "Free",
        exchangeRate: rate,
        disclaimer: zarAmount > 0 ? `Approx. ${pricing.display} USD at current exchange rate` : null
      };
    }
    
    return {
      pricing: pricingWithConversions,
      exchangeRate: rate,
      lastUpdated: new Date(this.lastUpdated).toLocaleString(),
      isLive: Date.now() - this.lastUpdated < this.cacheExpiry
    };
  }

  // Format price display for UI
  formatPriceDisplay(tier, pricing) {
    if (tier === 'free') {
      return {
        primary: "Free",
        secondary: "Forever",
        disclaimer: null
      };
    }

    return {
      primary: pricing.display, // USD price (main display)
      secondary: pricing.zarDisplay, // ZAR equivalent
      disclaimer: `Billed in ${pricing.zarDisplay} ZAR`,
      exchangeRate: `1 USD = R${pricing.exchangeRate.toFixed(2)}`
    };
  }

  // Get exchange rate disclaimer text
  getExchangeDisclaimer() {
    const isLive = this.lastUpdated && Date.now() - this.lastUpdated < this.cacheExpiry;
    const lastUpdated = this.lastUpdated ? new Date(this.lastUpdated).toLocaleString() : 'Unknown';
    
    return {
      text: isLive 
        ? "Prices shown in USD for reference. You'll be charged in ZAR at current exchange rates."
        : `Prices shown in USD for reference. ZAR amounts are estimated. Last updated: ${lastUpdated}`,
      isLive,
      rate: this.exchangeRate,
      lastUpdated
    };
  }
}

export { CurrencyService };
