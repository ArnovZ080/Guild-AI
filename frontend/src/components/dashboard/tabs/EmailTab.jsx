import React from 'react';
import { Mail } from 'lucide-react';

const EmailTab = ({ emailData }) => {
  const emailMetrics = emailData?.data?.email_metrics || {};

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Mail className="w-5 h-5 text-blue-500 mr-2" />
          Email Marketing Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {emailMetrics.open_rate || 45.2}%
            </div>
            <p className="text-sm text-blue-700">Open Rate</p>
            <p className="text-xs text-green-600">
              +{emailData?.data?.trends?.open_rate_trend?.replace('+', '') || 5.6}% from last month
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {emailMetrics.click_rate || 12.8}%
            </div>
            <p className="text-sm text-green-700">Click Rate</p>
            <p className="text-xs text-green-600">
              +{emailData?.data?.trends?.click_rate_trend?.replace('+', '') || 8.2}% from last month
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {emailMetrics.conversion_rate || 3.2}%
            </div>
            <p className="text-sm text-purple-700">Conversion Rate</p>
            <p className="text-xs text-green-600">
              +{emailData?.data?.trends?.conversion_rate_trend?.replace('+', '') || 12.5}% from last month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTab;
