import React from 'react';
import ProgressMomentumTracker from '@/components/psychology/ProgressMomentumTracker';
import FinancialFlowVisualization from '@/components/visualizations/FinancialFlowVisualization';
import CustomerJourneyConstellation from '@/components/visualizations/CustomerJourneyConstellation';
import AgentStatusWidget from '@/components/dashboard/AgentStatusWidget';
import BusinessPulseMonitorWidget from '@/components/dashboard/BusinessPulseMonitorWidget';
import TasksWidget from '@/components/dashboard/TasksWidget';
const CommandCenter = () => {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><FinancialFlowVisualization /></div>
            <div className="space-y-6"><AgentStatusWidget /><BusinessPulseMonitorWidget /><TasksWidget /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomerJourneyConstellation />
            <ProgressMomentumTracker />
        </div>
    </div>
  );
};
export default CommandCenter;
