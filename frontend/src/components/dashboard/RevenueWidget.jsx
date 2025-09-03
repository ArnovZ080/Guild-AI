import React from 'react';

const RevenueWidget = () => {
  return (
    <div className="bg-gray-700 p-4 rounded-lg h-full">
      <h3 className="font-semibold mb-2">Revenue</h3>
      <div className="text-center">
        <p className="text-3xl font-bold">$1,234.56</p>
        <p className="text-sm text-green-400">+5.2% vs last period</p>
        {/* Placeholder for real data */}
      </div>
    </div>
  );
};

export default RevenueWidget;
