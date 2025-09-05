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
    <div className="space-y-8 p-4">
        {/* Top Row - Financial Flow and Business Pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80"><FinancialFlowVisualization /></div>
            <div className="h-80"><BusinessPulseMonitorWidget /></div>
        </div>
        
        {/* Middle Row - Customer Journey and Progress Momentum */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80"><CustomerJourneyConstellation /></div>
            <div className="h-80"><ProgressMomentumTracker /></div>
        </div>
        
        {/* Bottom Row - Opportunity Radar and Content Garden */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80"><OpportunityRadar /></div>
            <div className="h-80"><ContentPerformanceGarden /></div>
        </div>
        
        {/* Agent Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-40"><AgentStatusWidget /></div>
            <div className="h-40"><TasksWidget /></div>
            <div className="h-40"></div>
        </div>
    </div>
  );
};

export default CommandCenter;
