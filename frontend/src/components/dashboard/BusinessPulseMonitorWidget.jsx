import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
const BusinessPulseMonitorWidget = () => {
  const [pulseData] = useState({ intensity: 0.7 });
  const pulseVariants = { animate: { scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6], transition: { duration: 2 / pulseData.intensity, repeat: Infinity } } };
  return (
    <div className="bg-gray-800 p-4 rounded-lg h-full text-white flex flex-col items-center justify-center">
      <h3 className="font-semibold mb-2">Business Pulse</h3>
      <div className="relative w-24 h-24">
        <motion.div className="absolute inset-0 rounded-full" variants={pulseVariants} animate="animate" style={{ background: `radial-gradient(circle, rgba(59, 130, 246, ${pulseData.intensity}) 0%, rgba(16, 185, 129, ${pulseData.intensity * 0.5}) 100%)` }} />
        <div className="absolute inset-0 flex items-center justify-center"><div className="text-xl font-bold">{Math.round(pulseData.intensity * 100)}%</div></div>
      </div>
    </div>
  );
};
export default BusinessPulseMonitorWidget;
