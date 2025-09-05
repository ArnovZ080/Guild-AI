import React from 'react';
import ProgressMomentumTracker from '../psychology/ProgressMomentumTracker.jsx';
import FinancialFlowVisualization from '../visualizations/FinancialFlowVisualization.jsx';
import CustomerJourneyConstellation from '../visualizations/CustomerJourneyConstellation.jsx';
import OpportunityRadar from '../visualizations/OpportunityRadar.jsx';
import ContentPerformanceGarden from '../visualizations/ContentPerformanceGarden.jsx';
import AgentStatusWidget from './AgentStatusWidget.jsx';
import BusinessPulseMonitorWidget from './BusinessPulseMonitorWidget.jsx';
import TasksWidget from './TasksWidget.jsx';

const CommandCenter = () => {
  return (
    <div className="space-y-6">
        {/* Top Row - Financial Flow and Business Pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><FinancialFlowVisualization /></div>
            <div className="space-y-6"><AgentStatusWidget /><BusinessPulseMonitorWidget /><TasksWidget /></div>
        </div>
        
        {/* Middle Row - Customer Journey and Progress Momentum */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomerJourneyConstellation />
            <ProgressMomentumTracker />
        </div>
        
        {/* Bottom Row - Opportunity Radar and Content Garden */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OpportunityRadar />
            <ContentPerformanceGarden />
        </div>
    </div>
  );
};

export default CommandCenter;
