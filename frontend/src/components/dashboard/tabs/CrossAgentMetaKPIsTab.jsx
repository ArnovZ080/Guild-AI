import React from 'react';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

const CrossAgentMetaKPIsTab = ({ metaKPIs = [] }) => {
  const list = metaKPIs.length ? metaKPIs : defaultMetaKPIList;
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center"><Zap className="w-5 h-5 text-purple-500 mr-2" />Guild Performance Meta KPIs</h3>
        <p className="text-gray-600 mb-6">These unique KPIs measure how well Guild itself is performing.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((kpi) => (
            <div key={kpi.id || kpi.meta_kpi_id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{kpi.name}</h4>
                <div className="flex items-center">
                  {kpi.trend === 'up' || kpi.trend_direction === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                  <span className={`${(kpi.trend === 'up' || kpi.trend_direction === 'up') ? 'text-green-600' : 'text-red-600'} text-sm ml-1`}>{(kpi.change ?? kpi.trend_percentage) > 0 ? '+' : ''}{(kpi.change ?? kpi.trend_percentage)}%</span>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-2xl font-bold text-gray-900">{(kpi.value ?? kpi.current_value)}{kpi.unit === 'x' ? 'x' : kpi.unit === 'percent' ? '%' : kpi.unit || ''}</div>
                <div className="text-sm text-gray-600">Target: {(kpi.target ?? kpi.target_value)}{kpi.unit === 'x' ? 'x' : kpi.unit === 'percent' ? '%' : kpi.unit || ''}</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div className={`h-2 rounded-full ${(((kpi.value ?? kpi.current_value) / (kpi.target ?? kpi.target_value)) >= 1 ? 'bg-green-500' : (((kpi.value ?? kpi.current_value) / (kpi.target ?? kpi.target_value)) >= 0.8 ? 'bg-yellow-500' : 'bg-red-500'))}`} style={{ width: `${Math.min(((kpi.value ?? kpi.current_value) / (kpi.target ?? kpi.target_value)) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-gray-600">{kpi.description || kpi.calculation_method}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const defaultMetaKPIList = [
  { id: 'agent_accuracy', name: 'Agent Accuracy', value: 92.5, target: 95.0, unit: '%', description: 'Percentage of tasks judged as high quality by Judge Agent', trend: 'up', change: 3.2 },
  { id: 'agent_coverage', name: 'Agent Coverage', value: 87.3, target: 90.0, unit: '%', description: 'Percentage of business areas handled autonomously by agents', trend: 'up', change: 8.7 },
  { id: 'human_overrides', name: 'Human-in-the-Loop Overrides', value: 15.8, target: 10.0, unit: '%', description: 'How often users step in to override agent decisions', trend: 'down', change: -12.5 },
  { id: 'workflow_efficiency', name: 'Workflow Efficiency', value: 78.5, target: 85.0, unit: '%', description: 'Average task completion time vs manual baseline', trend: 'up', change: 15.2 },
  { id: 'recommendation_adoption', name: 'Recommendation Adoption Rate', value: 72.3, target: 80.0, unit: '%', description: 'How often users follow agent suggestions', trend: 'up', change: 18.7 },
  { id: 'agent_roi', name: 'Agent ROI Contribution', value: 4.2, target: 5.0, unit: 'x', description: 'Revenue/efficiency attributed to each agent category', trend: 'up', change: 22.8 },
  { id: 'error_detection', name: 'Error Detection & Correction Rate', value: 89.7, target: 95.0, unit: '%', description: 'Judge Agent + Orchestrator catching and correcting issues', trend: 'up', change: 6.3 }
];

export default CrossAgentMetaKPIsTab;


