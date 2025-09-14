import React from 'react';
// Correctly import default and named exports
import ContentPerformanceGarden from '../visualizations/ContentPerformanceGarden.jsx';
import OpportunityRadar from '../visualizations/OpportunityRadar.jsx';
import { CustomerJourneyConstellation } from '../visualizations/CustomerJourneyConstellation.tsx';
import { ProgressMomentumTracker } from '../visualizations/ProgressMomentumTracker.tsx';

const CommandCenter = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <ContentPerformanceGarden />
      <OpportunityRadar />
      <CustomerJourneyConstellation />
      <ProgressMomentumTracker />
    </div>
  );
};

export default CommandCenter;
