import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, BarChart3, UserCheck, Heart, Zap } from 'lucide-react';
import CustomerOverviewTab from './tabs/CustomerOverviewTab.jsx';
import CustomerFunnelTab from './tabs/CustomerFunnelTab.jsx';
import CustomerDirectoryTab from './tabs/CustomerDirectoryTab.jsx';
import CustomerSegmentsTab from './tabs/CustomerSegmentsTab.jsx';
import RetentionTab from './tabs/RetentionTab.jsx';
import CrossAgentMetaKPIsTab from './tabs/CrossAgentMetaKPIsTab.jsx';

const CustomerDashboardMain = ({ data, onCustomerAction, onSegmentAction }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'funnel', label: 'Funnel', icon: Target },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'segments', label: 'Segments', icon: UserCheck },
    { id: 'retention', label: 'Retention', icon: Heart },
    { id: 'meta', label: 'Guild Performance', icon: Zap }
  ];

  const timeframes = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' }
  ];

  const { customer_analysis, customer_profiles, customer_segments, cross_agent_meta_kpis } = data || {};

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-gray-600">Customer Success + CRM Manager oversight and insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select value={selectedTimeframe} onChange={(e) => setSelectedTimeframe(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              {timeframes.map(t => (<option key={t.id} value={t.id}>{t.label}</option>))}
            </select>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{customer_analysis?.customer_health_score || 78.5}/100</div>
              <p className="text-sm text-gray-600">Customer Health Score</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg"><p className="text-sm font-medium text-blue-600">Customer Growth</p><p className="text-2xl font-bold text-blue-800">+15.2%</p><p className="text-xs text-blue-600">+8.5% from last month</p></div>
          <div className="bg-green-50 p-4 rounded-lg"><p className="text-sm font-medium text-green-600">Retention Rate</p><p className="text-2xl font-bold text-green-800">82.5%</p><p className="text-xs text-green-600">+12% from last month</p></div>
          <div className="bg-red-50 p-4 rounded-lg"><p className="text-sm font-medium text-red-600">Churn Rate</p><p className="text-2xl font-bold text-red-800">12.8%</p><p className="text-xs text-green-600">-17.4% from last month</p></div>
          <div className="bg-purple-50 p-4 rounded-lg"><p className="text-sm font-medium text-purple-600">Customer LTV</p><p className="text-2xl font-bold text-purple-800">$2,850</p><p className="text-xs text-purple-600">+7.5% from last month</p></div>
        </div>
      </motion.div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
            <CustomerOverviewTab customerAnalysis={customer_analysis} />
          </motion.div>
        )}

        {activeTab === 'funnel' && (
          <motion.div key="funnel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
            <CustomerFunnelTab customerAnalysis={customer_analysis} />
          </motion.div>
        )}

        {activeTab === 'customers' && (
          <motion.div key="customers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
            <CustomerDirectoryTab profiles={customer_profiles} onCustomerAction={onCustomerAction} />
          </motion.div>
        )}

        {activeTab === 'segments' && (
          <motion.div key="segments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
            <CustomerSegmentsTab segments={customer_segments} onSegmentAction={onSegmentAction} />
          </motion.div>
        )}

        {activeTab === 'retention' && (
          <motion.div key="retention" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
            <RetentionTab customerAnalysis={customer_analysis} />
          </motion.div>
        )}

        {activeTab === 'meta' && (
          <motion.div key="meta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
            <CrossAgentMetaKPIsTab metaKPIs={cross_agent_meta_kpis} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerDashboardMain;


