import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import CommandCenter from './CommandCenter.jsx';
import { AgentActivityTheater } from '../theater/AgentActivityTheater.tsx';
import OpportunityRadar from '../visualizations/OpportunityRadar.jsx';
import { useCelebrations } from '../psychological/MicroCelebrations.jsx';
import { AchievementCelebration } from '../psychological/AchievementCelebration.tsx';
import { StressReductionInterface } from '../psychological/StressReductionInterface.tsx';

export const MainDashboard: React.FC = () => {
  const { triggerCelebration } = useCelebrations();

  useEffect(() => {
    // Trigger a celebration when the dashboard loads
    if (triggerCelebration) {
      setTimeout(() => {
        triggerCelebration('MILESTONE', {
          message: "Dashboard loaded! Ready to grow your business! 🚀"
        });
      }, 1000);
    }
  }, [triggerCelebration]);

  return (
    <>
      <DashboardLayout
        commandCenter={<CommandCenter />}
        actionTheater={<AgentActivityTheater />}
        opportunityHorizon={<OpportunityRadar />}
      />
      {/* Floating Psychological Elements */}
      <div className="fixed bottom-4 right-4 z-50">
        <AchievementCelebration />
      </div>
      <div className="fixed top-20 right-4 z-40">
        <StressReductionInterface />
      </div>
    </>
  );
};
