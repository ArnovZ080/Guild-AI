import React from 'react';
// Correctly import default and named exports
import ContentPerformanceGarden from '../visualizations/ContentPerformanceGarden.jsx';
import OpportunityRadar from '../visualizations/OpportunityRadar.jsx';
import { CustomerJourneyConstellation } from '../visualizations/CustomerJourneyConstellation.tsx';
import { ProgressMomentumTracker } from '../visualizations/ProgressMomentumTracker.tsx';

const CommandCenter = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-2"><ContentPerformanceGarden /></div>
      <OpportunityRadar />
      <div className="lg:col-span-2"><CustomerJourneyConstellation /></div>
      <ProgressMomentumTracker />
    </div>
  );
};

export default CommandCenter;
