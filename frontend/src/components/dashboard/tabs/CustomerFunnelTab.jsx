import React, { useState } from 'react';
import SalesFunnelVisualizer from '../../visualizations/SalesFunnelVisualizer.jsx';
import { motion } from 'framer-motion';
import { 
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Users,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  Eye,
  Edit,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Heart,
  Star,
  Brain,
  Sparkles,
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bell,
  UserPlus,
  UserMinus,
  Mail,
  Phone,
  MapPin,
  Tag,
  Building,
  Globe,
  Smartphone,
  Monitor,
  Laptop,
  X
} from 'lucide-react';

const CustomerFunnelTab = ({ funnel, profiles = [], onJourneyView, onProfileView }) => {
  const [selectedStage, setSelectedStage] = useState(null);
  const [stageModalTab, setStageModalTab] = useState('analytics'); // analytics | customers
  const [timeframe, setTimeframe] = useState('30d');
  const [viewMode, setViewMode] = useState('funnel'); // funnel, journey, analytics

  if (!funnel) {
    return <CustomerFunnelSkeleton />;
  }

  const { funnel_analysis } = funnel;
  const stages = Object.entries(funnel_analysis.funnel_stages || {});

  const normalizeStage = (value) => String(value || '').toLowerCase();
  const customersInStage = (stageName) => {
    const s = normalizeStage(stageName);
    return (profiles || []).filter(p => normalizeStage(p.lifecycle_stage || p.stage) === s);
  };

  const getStageColor = (stageName) => {
    switch (stageName.toLowerCase()) {
      case 'lead': return 'bg-blue-500';
      case 'prospect': return 'bg-purple-500';
      case 'trial': return 'bg-yellow-500';
      case 'customer': return 'bg-green-500';
      case 'evangelist': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getStageIcon = (stageName) => {
    switch (stageName.toLowerCase()) {
      case 'lead': return Users;
      case 'prospect': return Target;
      case 'trial': return Clock;
      case 'customer': return CheckCircle;
      case 'evangelist': return Star;
      default: return Activity;
    }
  };

  const calculateConversionRate = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current / previous) * 100).toFixed(1);
  };

  const getOptimizationPriority = (conversionRate) => {
    if (conversionRate < 30) return { level: 'critical', color: 'text-red-600 bg-red-100' };
    if (conversionRate < 50) return { level: 'high', color: 'text-orange-600 bg-orange-100' };
    if (conversionRate < 70) return { level: 'medium', color: 'text-yellow-600 bg-yellow-100' };
    return { level: 'good', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Target className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Customer Journey & Funnel Analytics</h3>
              <p className="text-sm text-gray-600">Track customer progression through your sales funnel</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="funnel">Funnel View</option>
              <option value="journey">Journey View</option>
              <option value="analytics">Analytics View</option>
            </select>
          </div>
        </div>

        {/* Funnel Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{funnel_analysis.total_leads}</div>
            <div className="text-blue-600">Total Leads</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stages.length > 0 ? stages[stages.length - 1][1].count : 0}
            </div>
            <div className="text-green-600">Converted Customers</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stages.length > 0 ? 
                calculateConversionRate(stages[stages.length - 1][1].count, funnel_analysis.total_leads) : 0}%
            </div>
            <div className="text-purple-600">Overall Conversion</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {stages.length > 0 ? 
                (funnel_analysis.total_leads - stages[stages.length - 1][1].count) : 0}
            </div>
            <div className="text-orange-600">Lost Opportunities</div>
          </div>
        </div>
      </div>

      {/* Funnel Visualization */}
      {viewMode === 'funnel' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Sales Funnel</h4>
          <div className="mb-8">
            <SalesFunnelVisualizer data={{
              stages: stages.map(([name, data]) => ({ name, value: data.count }))
            }} />
          </div>
          <div className="space-y-4">
            {stages.map(([stageName, stageData], index) => {
              const Icon = getStageIcon(stageName);
              const width = (stageData.count / funnel_analysis.total_leads) * 100;
              const conversionRate = stageData.conversion_rate;
              const optimization = getOptimizationPriority(conversionRate);
              
              return (
                <motion.div
                  key={stageName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative cursor-pointer"
                  onClick={() => setSelectedStage(stageName)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full ${getStageColor(stageName)} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 capitalize">{stageName}</h5>
                        <p className="text-sm text-gray-600">{stageData.average_time_in_stage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{stageData.count}</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{conversionRate}% conversion</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${optimization.color}`}>
                          {optimization.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
                    <div 
                      className={`h-6 rounded-full ${getStageColor(stageName)} flex items-center justify-center`}
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-white text-sm font-medium">
                        {stageData.count}
                      </span>
                    </div>
                  </div>
                  
                  {/* Drop-off Analysis */}
                  {index > 0 && (
                    <div className="mt-2 p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-800">
                          {stageData.drop_off_rate}% drop-off rate
                        </span>
                        <span className="text-sm text-red-600">
                          {stages[index - 1][1].count - stageData.count} lost customers
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Optimization Opportunities */}
                  {stageData.optimization_opportunities && stageData.optimization_opportunities.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <h6 className="text-sm font-medium text-yellow-800 mb-2">Optimization Opportunities</h6>
                      <ul className="space-y-1">
                        {stageData.optimization_opportunities.map((opportunity, idx) => (
                          <li key={idx} className="text-sm text-yellow-700 flex items-center">
                            <ArrowRight className="w-3 h-3 mr-2" />
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {index < stages.length - 1 && (
                    <div className="flex justify-center mt-4">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-300"></div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Journey View */}
      {viewMode === 'journey' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Customer Journey Map</h4>
          <div className="space-y-6">
            {stages.map(([stageName, stageData], index) => {
              const Icon = getStageIcon(stageName);
              const nextStage = stages[index + 1];
              const conversionRate = stageData.conversion_rate;
              
              return (
                <motion.div
                  key={stageName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-6"
                >
                  {/* Stage Card */}
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full ${getStageColor(stageName)} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 capitalize">{stageName}</h5>
                          <p className="text-sm text-gray-600">{stageData.average_time_in_stage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{stageData.count}</div>
                        <div className="text-sm text-gray-600">{conversionRate}% conversion</div>
                      </div>
                    </div>
                    
                    {/* Stage Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Conversion Rate:</span>
                        <span className="ml-2 font-medium">{conversionRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Drop-off Rate:</span>
                        <span className="ml-2 font-medium">{stageData.drop_off_rate}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow to Next Stage */}
                  {nextStage && (
                    <div className="flex flex-col items-center">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">
                        {calculateConversionRate(nextStage[1].count, stageData.count)}%
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Conversion Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Conversion Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stages.map(([stageName, stageData], index) => {
                const conversionRate = stageData.conversion_rate;
                const optimization = getOptimizationPriority(conversionRate);
                
                return (
                  <div key={stageName} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 capitalize">{stageName}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${optimization.color}`}>
                        {optimization.level}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversion Rate</span>
                        <span className="text-sm font-medium">{conversionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Drop-off Rate</span>
                        <span className="text-sm font-medium">{stageData.drop_off_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Time</span>
                        <span className="text-sm font-medium">{stageData.average_time_in_stage}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optimization Recommendations */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Optimization Recommendations</h4>
            <div className="space-y-4">
              {stages.map(([stageName, stageData], index) => {
                const conversionRate = stageData.conversion_rate;
                const optimization = getOptimizationPriority(conversionRate);
                
                if (optimization.level === 'good') return null;
                
                return (
                  <div key={stageName} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-yellow-800 capitalize">{stageName} Stage</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${optimization.color}`}>
                        {optimization.level} priority
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Conversion rate of {conversionRate}% is {optimization.level} and needs attention.
                    </p>
                    {stageData.optimization_opportunities && (
                      <div>
                        <h6 className="text-sm font-medium text-yellow-800 mb-2">Recommended Actions:</h6>
                        <ul className="space-y-1">
                          {stageData.optimization_opportunities.map((opportunity, idx) => (
                            <li key={idx} className="text-sm text-yellow-700 flex items-center">
                              <ArrowRight className="w-3 h-3 mr-2" />
                              {opportunity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stage Details Modal */}
      {selectedStage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedStage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 capitalize">{selectedStage}</h3>
                <button
                  onClick={() => setSelectedStage(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
                {[
                  { id: 'analytics', label: 'Funnel Step Analytics' },
                  { id: 'customers', label: 'Customers in Step' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStageModalTab(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${stageModalTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {stageModalTab === 'analytics' && (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Stage Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer Count</span>
                        <span className="font-medium">{funnel_analysis.funnel_stages[selectedStage].count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conversion Rate</span>
                        <span className="font-medium">{funnel_analysis.funnel_stages[selectedStage].conversion_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Drop-off Rate</span>
                        <span className="font-medium">{funnel_analysis.funnel_stages[selectedStage].drop_off_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Time in Stage</span>
                        <span className="font-medium">{funnel_analysis.funnel_stages[selectedStage].average_time_in_stage}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Optimization Opportunities</h4>
                    <div className="space-y-2">
                      {funnel_analysis.funnel_stages[selectedStage].optimization_opportunities.map((opportunity, index) => (
                        <div key={index} className="text-sm text-gray-700 flex items-center">
                          <ArrowRight className="w-3 h-3 mr-2" />
                          {opportunity}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* AI Insights */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">AI Insights</h4>
                  <ul className="space-y-1 text-sm text-purple-800">
                    <li className="flex items-start"><ArrowRight className="w-3 h-3 mr-2 mt-0.5" /> Top drop-off drivers inferred: friction in onboarding emails, long trial-to-value delay.</li>
                    <li className="flex items-start"><ArrowRight className="w-3 h-3 mr-2 mt-0.5" /> Positive drivers: webinar attendance, success call within 7 days, how-to content engagement.</li>
                    <li className="flex items-start"><ArrowRight className="w-3 h-3 mr-2 mt-0.5" /> Recommended actions: shorten time-to-value, send stage-specific playbooks, add CTA nudges on high-exit pages.</li>
                  </ul>
                </div>
                </>
                )}

                {stageModalTab === 'customers' && (
                <div className="p-4 bg-white border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Customers in this stage</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {customersInStage(selectedStage).map((p) => (
                      <div key={p.customer_id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-gray-900">{p.name}</div>
                          <div className="text-gray-600 text-xs">{p.email}</div>
                        </div>
                        <button
                          onClick={() => onProfileView && onProfileView(p)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          View Full Profile
                        </button>
                      </div>
                    ))}
                    {customersInStage(selectedStage).length === 0 && (
                      <div className="text-sm text-gray-600">No customers found for this stage.</div>
                    )}
                  </div>
                </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// Skeleton loading component
const CustomerFunnelSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default CustomerFunnelTab;
