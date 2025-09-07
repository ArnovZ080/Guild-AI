import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BusinessPulseMonitor } from './BusinessPulseMonitor';
import AgentActivityTheaterView from './theater/AgentActivityTheaterView';
import FinancialFlowVisualization from './visualizations/FinancialFlowVisualization';
import CustomerJourneyConstellation from './visualizations/CustomerJourneyConstellation';
import ProgressMomentumTracker from './psychology/ProgressMomentumTracker';
import AchievementCelebration from './psychology/AchievementCelebration';
import StressReductionInterface from './psychology/StressReductionInterface';
import DataRoomManager from './DataRoomManager';
import MarketingCampaignCreator from './MarketingCampaignCreator';
import OAuthConnections from './OAuthConnections';
import ProjectPlanDisplay from './ProjectPlanDisplay';
import SalesFunnelVisualizer from './SalesFunnelVisualizer';
import WorkflowStatusPage from './WorkflowStatusPage';

const MainDashboard = () => {
  const [widgets] = useState([
    { id: '1', component: 'BusinessPulseMonitor', title: 'Business Pulse', size: 'medium', position: { x: 0, y: 0 } },
    { id: '2', component: 'AgentActivityTheater', title: 'Agent Activity', size: 'large', position: { x: 1, y: 0 } },
    { id: '3', component: 'FinancialFlowVisualization', title: 'Financial Flow', size: 'large', position: { x: 0, y: 1 } },
    { id: '4', component: 'ProgressMomentumTracker', title: 'Momentum', size: 'medium', position: { x: 2, y: 0 } },
    { id: '5', component: 'CustomerJourneyConstellation', title: 'Customer Journey', size: 'large', position: { x: 0, y: 2 } },
    { id: '6', component: 'SalesFunnelVisualizer', title: 'Sales Funnel', size: 'medium', position: { x: 1, y: 2 } },
  ]);

  const [selectedZone, setSelectedZone] = useState('overview');

  const renderWidget = (widget) => {
    const components = {
      BusinessPulseMonitor: <BusinessPulseMonitor />,
      AgentActivityTheater: <AgentActivityTheaterView />,
      FinancialFlowVisualization: <FinancialFlowVisualization />,
      CustomerJourneyConstellation: <CustomerJourneyConstellation />,
      ProgressMomentumTracker: <ProgressMomentumTracker />,
      AchievementCelebration: <AchievementCelebration />,
      StressReductionInterface: <StressReductionInterface />,
      SalesFunnelVisualizer: <SalesFunnelVisualizer />,
    };

    return components[widget.component] || <div>Widget not found</div>;
  };

  const getWidgetSize = (size) => {
    const sizes = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-2 row-span-1',
      large: 'col-span-3 row-span-2'
    };
    return sizes[size] || 'col-span-1 row-span-1';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guild AI Dashboard</h1>
            <p className="text-gray-600">Your AI workforce at a glance</p>
          </div>
          
          {/* Zone Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'detail', label: 'Analytics' },
              { id: 'action', label: 'Actions' },
              { id: 'workflows', label: 'Workflows' },
              { id: 'projects', label: 'Projects' },
              { id: 'integrations', label: 'Integrations' }
            ].map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedZone === zone.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {zone.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {selectedZone === 'overview' && (
          <motion.div
            className="grid grid-cols-6 gap-6 auto-rows-fr"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {widgets.map((widget) => (
              <motion.div
                key={widget.id}
                className={`bg-white rounded-lg shadow-lg p-6 ${getWidgetSize(widget.size)}`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{widget.title}</h3>
                {renderWidget(widget)}
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedZone === 'detail' && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Detailed Analytics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FinancialFlowVisualization />
                <CustomerJourneyConstellation />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Performance Tracking</h3>
              <ProgressMomentumTracker />
            </div>
          </motion.div>
        )}

        {selectedZone === 'action' && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  🚀 Launch Campaign
                </button>
                <button className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  📊 Generate Report
                </button>
                <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                  🎯 Set Goals
                </button>
                <button className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  🔍 Research Market
                </button>
                <button className="p-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
                  ✍️ Create Content
                </button>
                <button className="p-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                  📈 Analyze Performance
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Agent Management</h3>
              <AgentActivityTheaterView />
            </div>
          </motion.div>
        )}

        {selectedZone === 'workflows' && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WorkflowStatusPage />
          </motion.div>
        )}

        {selectedZone === 'projects' && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProjectPlanDisplay />
          </motion.div>
        )}

        {selectedZone === 'integrations' && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Data Rooms</h3>
                <DataRoomManager />
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">OAuth Connections</h3>
                <OAuthConnections />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Marketing Campaigns</h3>
              <MarketingCampaignCreator />
            </div>
          </motion.div>
        )}
      </main>

      {/* Floating Achievement System */}
      <div className="fixed bottom-4 right-4 z-50">
        <AchievementCelebration />
      </div>

      {/* Stress Monitor (appears when needed) */}
      <div className="fixed top-20 right-4 z-40">
        <StressReductionInterface />
      </div>
    </div>
  );
};

export { MainDashboard };
