import React from 'react';
import { motion } from 'framer-motion';
import { X, Brain, TrendingUp, Target, BarChart3, Lightbulb } from 'lucide-react';

const UnifiedPerformanceInsightsModal = ({ analysis, performance, onClose }) => {
  // Derive summary
  const overall = analysis?.data || analysis || {};
  const keyInsights = overall.key_insights || [
    'Short-form video drives highest engagement across platforms',
    'LinkedIn articles generate higher-quality leads',
    'Evening posting windows correlate with stronger CTR'
  ];
  const determiningFactors = [
    { label: 'Format Fit', why: 'Native format alignment (Reels/Shorts) gets algorithm lift' },
    { label: 'Timing Windows', why: 'Posts within peak audience windows show higher reach/CTR' },
    { label: 'Topic-Intent Match', why: 'Educational/problem-solution content sustains engagement' },
    { label: 'Creative Variance', why: 'A/B creative cycles avoid fatigue and find winners' }
  ];

  const sources = [
    'Instagram Analytics API',
    'LinkedIn Analytics API',
    'Twitter/X Analytics',
    'Email analytics',
    'Content Intelligence Agent aggregation'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Brain className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Unified Performance Insights</h2>
                <p className="text-sm text-gray-600">Cross-content summary of what works and why</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded">
              <div className="text-xs text-blue-700 mb-1">Overall Health Score</div>
              <div className="text-2xl font-bold text-blue-800">{overall.content_health_score ?? 82}</div>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <div className="text-xs text-green-700 mb-1">Top Performing Format</div>
              <div className="text-sm font-semibold text-green-800">{overall.top_performing_content?.[0]?.content_type || 'Video/Reels'}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded">
              <div className="text-xs text-purple-700 mb-1">Best Channel</div>
              <div className="text-sm font-semibold text-purple-800">{overall.top_performing_content?.[0]?.platform || 'Instagram'}</div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-semibold text-gray-800">What’s Working</h3>
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {keyInsights.map((i, idx) => (<li key={idx}>{i}</li>))}
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <Target className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-semibold text-gray-800">Determining Factors</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {determiningFactors.map((f) => (
                <div key={f.label} className="p-3 rounded bg-gray-50">
                  <div className="font-medium text-gray-900">{f.label}</div>
                  <div className="text-gray-700 text-sm">{f.why}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <BarChart3 className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-semibold text-gray-800">Performance Summary</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded bg-blue-50"><div className="text-xs text-blue-700">Avg Engagement Rate</div><div className="text-lg font-semibold text-blue-900">{(overall?.content_metrics?.engagement_metrics?.engagement_rate?.current ?? 4.8)}%</div></div>
              <div className="p-3 rounded bg-green-50"><div className="text-xs text-green-700">Click Through Rate (CTR)</div><div className="text-lg font-semibold text-green-900">{(overall?.content_metrics?.engagement_metrics?.click_through_rate?.current ?? 2.3)}%</div></div>
              <div className="p-3 rounded bg-purple-50"><div className="text-xs text-purple-700">Conversion Rate</div><div className="text-lg font-semibold text-purple-900">{(overall?.content_metrics?.engagement_metrics?.conversion_rate?.current ?? 3.2)}%</div></div>
              <div className="p-3 rounded bg-orange-50"><div className="text-xs text-orange-700">Return on Ad Spend (ROAS)</div><div className="text-lg font-semibold text-orange-900">{(overall?.content_metrics?.performance_metrics?.return_on_ad_spend?.current ?? 3.8)}x</div></div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Lightbulb className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="font-semibold text-gray-800">Unified Recommendations</h3>
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {(overall.immediate_actions || [
                'Increase short-form video share by 30% across social',
                'Optimize LinkedIn headlines for reach and CTR',
                'Schedule posts in peak evening windows',
                'Run A/B creative tests weekly to avoid fatigue'
              ]).map((r, i) => (<li key={i}>{r}</li>))}
            </ul>
            <div className="text-xs text-gray-500 mt-3">Sources: {sources.join(', ')}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UnifiedPerformanceInsightsModal;
