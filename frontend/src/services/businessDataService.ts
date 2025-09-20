/**
 * Business Data Service
 * Fetches real business metrics from the backend API
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface FinancialHealth {
  revenue: number;
  expenses: number;
  profit: number;
  profit_margin: number;
  cash_flow: number;
  growth_rate: number;
  health_status: 'excellent' | 'good' | 'warning' | 'critical';
  last_updated: string;
}

export interface AgentActivity {
  active_agents: number;
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  efficiency: number;
  uptime: number;
  agent_performance: Record<string, {
    total_tasks: number;
    completed_tasks: number;
    failed_tasks: number;
    efficiency: number;
  }>;
  active_workflows: number;
  last_updated: string;
}

export interface CustomerInsights {
  total_customers: number;
  new_customers_this_month: number;
  customers_needing_attention: number;
  satisfaction_score: number;
  churn_risk: number;
  recent_interactions: any[];
  last_updated: string;
}

export interface ContentPerformance {
  total_content_pieces: number;
  top_performing_content: number;
  average_engagement: number;
  conversion_rate: number;
  content_by_type: Record<string, number>;
  last_updated: string;
}

export interface UrgentAction {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  type: 'agent' | 'workflow' | 'customer' | 'financial';
  description: string;
  due_date: string;
  created_at?: string;
}

export interface UrgentActions {
  urgent_actions: UrgentAction[];
  total_count: number;
  high_priority_count: number;
  last_updated: string;
}

export interface DashboardOverview {
  financial_health: FinancialHealth;
  agent_activity: AgentActivity;
  customer_insights: CustomerInsights;
  content_performance: ContentPerformance;
  urgent_actions: UrgentActions;
  last_updated: string;
}

class BusinessDataService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  private async fetchWithCache<T>(endpoint: string): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(endpoint);
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/business-metrics${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.set(endpoint, { data, timestamp: now });
      return data;
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      // Return cached data if available, even if stale
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  async getFinancialHealth(): Promise<FinancialHealth> {
    return this.fetchWithCache<FinancialHealth>('/financial-health');
  }

  async getAgentActivity(): Promise<AgentActivity> {
    return this.fetchWithCache<AgentActivity>('/agent-activity');
  }

  async getCustomerInsights(): Promise<CustomerInsights> {
    return this.fetchWithCache<CustomerInsights>('/customer-insights');
  }

  async getContentPerformance(): Promise<ContentPerformance> {
    return this.fetchWithCache<ContentPerformance>('/content-performance');
  }

  async getUrgentActions(): Promise<UrgentActions> {
    return this.fetchWithCache<UrgentActions>('/urgent-actions');
  }

  async getDashboardOverview(): Promise<DashboardOverview> {
    return this.fetchWithCache<DashboardOverview>('/dashboard-overview');
  }

  // Real-time data fetching (bypasses cache)
  async getRealTimeData(): Promise<DashboardOverview> {
    try {
      const response = await fetch(`${API_BASE_URL}/business-metrics/dashboard-overview`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache status
  getCacheStatus(): Record<string, { age: number; isStale: boolean }> {
    const now = Date.now();
    const status: Record<string, { age: number; isStale: boolean }> = {};
    
    for (const [key, value] of this.cache.entries()) {
      const age = now - value.timestamp;
      status[key] = {
        age,
        isStale: age > this.CACHE_DURATION
      };
    }
    
    return status;
  }
}

export const businessDataService = new BusinessDataService();
export default businessDataService;
