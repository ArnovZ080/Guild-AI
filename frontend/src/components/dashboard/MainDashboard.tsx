import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import CommandCenter from './CommandCenter.jsx';
import { AgentActivityTheater } from '../theater/AgentActivityTheater.tsx';
import OpportunityRadar from '../visualizations/OpportunityRadar.jsx';
import { useCelebrations } from '../psychological/MicroCelebrations.jsx';

export const MainDashboard: React.FC = () => {
  const { triggerCelebration } = useCelebrations();

  useEffect(() => {
    if (triggerCelebration) {
      triggerCelebration('MILESTONE', {
        message: "Dashboard loaded! Ready to grow your business! 🚀"
      });
    }
  }, [triggerCelebration]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <DashboardLayout
          commandCenter={<CommandCenter />}
          actionTheater={<AgentActivityTheater />}
          opportunityHorizon={<OpportunityRadar />}
        />

      </div>
    </div>
  );
};
