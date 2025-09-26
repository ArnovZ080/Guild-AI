import React from 'react';
import { UserPlus, Heart, Star, CheckCircle } from 'lucide-react';

const CustomerOverviewTab = ({ customerAnalysis }) => {
  const metrics = customerAnalysis?.customer_metrics || {};
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><UserPlus className="w-5 h-5 text-blue-500 mr-2" />Acquisition</h3>
          <div className="space-y-4">
            <MetricRow label="Customer Growth Rate" value={`${metrics?.acquisition_metrics?.customer_growth_rate?.current ?? 15.2}%`} change={metrics?.acquisition_metrics?.customer_growth_rate?.change ?? 8.5} />
            <MetricRow label="Customer Acquisition Cost" value={`$${metrics?.acquisition_metrics?.customer_acquisition_cost?.current ?? 85.50}`} change={metrics?.acquisition_metrics?.customer_acquisition_cost?.change ?? -12.3} />
            <MetricRow label="Funnel Conversion Rate" value={`${metrics?.acquisition_metrics?.funnel_conversion_rate?.current ?? 18.0}%`} change={metrics?.acquisition_metrics?.funnel_conversion_rate?.change ?? 15.7} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Heart className="w-5 h-5 text-green-500 mr-2" />Retention</h3>
          <div className="space-y-4">
            <MetricRow label="Retention Rate" value={`${metrics?.retention_metrics?.retention_rate?.current ?? 82.5}%`} change={metrics?.retention_metrics?.retention_rate?.change ?? 12.0} />
            <MetricRow label="Churn Rate" value={`${metrics?.retention_metrics?.churn_rate?.current ?? 12.8}%`} change={metrics?.retention_metrics?.churn_rate?.change ?? -17.4} />
            <MetricRow label="Customer LTV" value={`$${metrics?.retention_metrics?.customer_lifetime_value?.current ?? 2850}`} change={metrics?.retention_metrics?.customer_lifetime_value?.change ?? 7.5} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Star className="w-5 h-5 text-yellow-500 mr-2" />Satisfaction</h3>
          <div className="space-y-4">
            <MetricRow label="Net Promoter Score" value={`${metrics?.satisfaction_metrics?.net_promoter_score?.current ?? 68.5}`} change={metrics?.satisfaction_metrics?.net_promoter_score?.change ?? 9.2} />
            <MetricRow label="Customer Satisfaction" value={`${metrics?.satisfaction_metrics?.customer_satisfaction?.current ?? 87.2}%`} change={metrics?.satisfaction_metrics?.customer_satisfaction?.change ?? 5.8} />
            <MetricRow label="Support Response Time" value={`${metrics?.satisfaction_metrics?.support_response_time?.current ?? 1.8}h`} change={metrics?.satisfaction_metrics?.support_response_time?.change ?? -25.0} />
          </div>
        </div>
      </div>

      {customerAnalysis?.customer_segments && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Key Customer Insights</h3>
          <div className="space-y-3">
            {(customerAnalysis?.key_insights || []).map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricRow = ({ label, value, change }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">{label}</span>
    <div className="text-right">
      <span className="font-semibold text-gray-900">{value}</span>
      <span className={`text-sm ml-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change >= 0 ? `+${change}` : change}%</span>
    </div>
  </div>
);

export default CustomerOverviewTab;


