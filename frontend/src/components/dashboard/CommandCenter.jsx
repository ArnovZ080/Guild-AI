import React from 'react';
import BusinessPulseMonitorWidget from './BusinessPulseMonitorWidget';
import AgentStatusWidget from './AgentStatusWidget';
import RevenueWidget from './RevenueWidget';
import TasksWidget from './TasksWidget';

const CommandCenter = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Command Center</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BusinessPulseMonitorWidget />
        <AgentStatusWidget />
        <RevenueWidget />
        <TasksWidget />
      </div>
    </div>
  );
};

export default CommandCenter;
