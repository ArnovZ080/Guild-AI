import React from 'react';
import ProgressMomentumTracker from '../psychology/ProgressMomentumTracker';
import FinancialFlowVisualization from '../visualizations/FinancialFlowVisualization';
import CustomerJourneyConstellation from '../visualizations/CustomerJourneyConstellation';

const CommandCenter = () => {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FinancialFlowVisualization />
            <CustomerJourneyConstellation />
        </div>
        <div>
            <ProgressMomentumTracker />
        </div>
    </div>
  );
};

export default CommandCenter;
