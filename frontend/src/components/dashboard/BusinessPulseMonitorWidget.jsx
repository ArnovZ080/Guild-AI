import React, { useState } from 'react';

const BusinessPulseMonitorWidget = () => {
  const [pulseData] = useState({ intensity: 0.7 });
  // Animation variants are removed as motion is not used
  return (
    <div className="bg-gray-800 p-4 rounded-lg h-full text-white flex flex-col items-center justify-center">
      <h3 className="font-semibold mb-2">Business Pulse</h3>
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, rgba(59, 130, 246, ${pulseData.intensity}) 0%, rgba(16, 185, 129, ${pulseData.intensity * 0.5}) 100%)` }} />
        <div className="absolute inset-0 flex items-center justify-center"><div className="text-xl font-bold">{Math.round(pulseData.intensity * 100)}%</div></div>
      </div>
    </div>
  );
};
export default BusinessPulseMonitorWidget;
