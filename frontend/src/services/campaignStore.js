// Global Campaign Store for cross-component campaign management
// This allows campaigns created in Opportunities Dashboard to appear in Content Dashboard

class CampaignStore {
  constructor() {
    this.campaigns = [];
    this.listeners = [];
    
    // Listen for campaign creation events
    if (typeof window !== 'undefined') {
      window.addEventListener('campaignCreated', this.handleCampaignCreated.bind(this));
    }
  }

  handleCampaignCreated(event) {
    const campaign = event.detail;
    this.addCampaign(campaign);
  }

  addCampaign(campaign) {
    // Check if campaign already exists
    const exists = this.campaigns.find(c => c.id === campaign.id);
    if (!exists) {
      this.campaigns.push(campaign);
      this.notifyListeners();
    }
  }

  getCampaigns() {
    return [...this.campaigns];
  }

  updateCampaign(campaignId, updates) {
    const index = this.campaigns.findIndex(c => c.id === campaignId);
    if (index !== -1) {
      this.campaigns[index] = { ...this.campaigns[index], ...updates };
      this.notifyListeners();
    }
  }

  removeCampaign(campaignId) {
    this.campaigns = this.campaigns.filter(c => c.id !== campaignId);
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.campaigns));
  }

  // Get campaigns by source
  getCampaignsBySource(source) {
    return this.campaigns.filter(c => c.created_from === source);
  }

  // Get campaigns by status
  getCampaignsByStatus(status) {
    return this.campaigns.filter(c => c.status === status);
  }

  // Get all campaigns for Content Dashboard
  getAllCampaigns() {
    return this.campaigns;
  }
}

// Create singleton instance
const campaignStore = new CampaignStore();

export default campaignStore;
