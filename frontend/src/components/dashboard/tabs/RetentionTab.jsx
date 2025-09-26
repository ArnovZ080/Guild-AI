import React from 'react';
import { Heart } from 'lucide-react';

const RetentionTab = ({ customerAnalysis }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center"><Heart className="w-5 h-5 text-green-500 mr-2" />Customer Retention & Churn Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Retention Metrics</h4>
            <div className="space-y-3">
              <MetricBox label="Retention Rate" value="82.5%" tone="green" sub="+12% MoM" />
              <MetricBox label="Churn Rate" value="12.8%" tone="red" sub="-17.4% MoM" />
              <MetricBox label="Customer LTV" value="$2,850" tone="blue" sub="+7.5% MoM" />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Churn Risk Analysis</h4>
            <div className="space-y-3">
              <RiskRow label="Critical Risk" value="8 customers" tone="red" />
              <RiskRow label="High Risk" value="12 customers" tone="orange" />
              <RiskRow label="Medium Risk" value="25 customers" tone="yellow" />
              <RiskRow label="Low Risk" value="155 customers" tone="green" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricBox = ({ label, value, tone, sub }) => (
  <div className={`flex justify-between items-center p-3 rounded-lg bg-${tone}-50`}>
    <span className="text-gray-600">{label}</span>
    <div className="text-right"><span className={`font-semibold text-${tone}-800`}>{value}</span><p className={`text-xs text-${tone}-600`}>{sub}</p></div>
  </div>
);

const RiskRow = ({ label, value, tone }) => (
  <div className={`flex justify-between items-center p-3 rounded-lg bg-${tone}-50`}>
    <span className="text-gray-600">{label}</span>
    <span className={`font-semibold text-${tone}-800`}>{value}</span>
  </div>
);

export default RetentionTab;


