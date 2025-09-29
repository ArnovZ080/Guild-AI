import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, X } from 'lucide-react';

const PerformanceAnalyticsModal = ({ calendar, onClose, campaign }) => {
  const analytics = {
    totalContent: calendar.length,
    publishedContent: calendar.filter(item => item.status === 'published').length,
    scheduledContent: calendar.filter(item => item.status === 'scheduled').length,
    draftContent: calendar.filter(item => item.status === 'draft').length,
    aiGenerated: calendar.filter(item => item.ai_generated).length,
    platformDistribution: calculatePlatformDistribution(calendar),
    themeDistribution: calculateThemeDistribution(calendar),
    weeklyDistribution: calculateWeeklyDistribution(calendar),
    engagementEstimates: calculateEngagementEstimates(calendar)
  };

  function calculatePlatformDistribution(calendar) {
    const distribution = {};
    calendar.forEach(item => {
      distribution[item.platform] = (distribution[item.platform] || 0) + 1;
    });
    return distribution;
  }

  function calculateThemeDistribution(calendar) {
    const distribution = {};
    calendar.forEach(item => {
      if (item.theme) distribution[item.theme] = (distribution[item.theme] || 0) + 1;
    });
    return distribution;
  }

  function calculateWeeklyDistribution(calendar) {
    const distribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    calendar.forEach(item => {
      const dayOfWeek = new Date(item.scheduled_date).getDay();
      distribution[dayOfWeek]++;
    });
    return distribution;
  }

  function calculateEngagementEstimates(calendar) {
    const estimates = calendar.filter(item => item.engagement_estimate).map(item => item.engagement_estimate);
    if (estimates.length === 0) return { average: 0, total: 0, max: 0, min: 0 };
    return {
      average: Math.round(estimates.reduce((sum, est) => sum + est, 0) / estimates.length),
      total: estimates.reduce((sum, est) => sum + est, 0),
      max: Math.max(...estimates),
      min: Math.min(...estimates)
    };
  }

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 text-blue-500 mr-3" />
              Content Performance Analytics
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg"><div className="text-2xl font-bold text-blue-600">{analytics.totalContent}</div><div className="text-sm text-blue-700">Total Content</div></div>
              <div className="bg-green-50 p-4 rounded-lg"><div className="text-2xl font-bold text-green-600">{analytics.publishedContent}</div><div className="text-sm text-green-700">Published</div></div>
              <div className="bg-yellow-50 p-4 rounded-lg"><div className="text-2xl font-bold text-yellow-600">{analytics.scheduledContent}</div><div className="text-sm text-yellow-700">Scheduled</div></div>
              <div className="bg-purple-50 p-4 rounded-lg"><div className="text-2xl font-bold text-purple-600">{analytics.aiGenerated}</div><div className="text-sm text-purple-700">AI Generated</div></div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Platform Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.platformDistribution).map(([platform, count]) => (
                  <div key={platform} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{platform}</div>
                    <div className="text-xs text-gray-500">{Math.round((count / analytics.totalContent) * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>

            {campaign && campaign?.ab_test?.enabled && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">A/B test results</h3>
                <div className="text-sm text-gray-500 mb-3">Results are placeholders until variant telemetry is wired.</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['A','B'].map(v => (
                    <div key={v} className="p-3 rounded border">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-gray-900">Variant {v}</div>
                        <div className="text-xs text-gray-500">{campaign?.ab_test?.variants?.[v]?.note || '—'}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <div className="text-gray-900">{(campaign?.ab_results?.[v]?.impressions ?? 5000).toLocaleString()}</div>
                          <div className="text-gray-500 text-xs">Impr.</div>
                        </div>
                        <div>
                          <div className="text-gray-900">{campaign?.ab_results?.[v]?.ctr ?? 2.5}%</div>
                          <div className="text-gray-500 text-xs">CTR</div>
                        </div>
                        <div>
                          <div className="text-gray-900">{campaign?.ab_results?.[v]?.cvr ?? 4.1}%</div>
                          <div className="text-gray-500 text-xs">CVR</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-700">Winner: <span className="font-medium">{campaign?.ab_winner ?? '—'}</span></div>
              </div>
            )}

            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Content Theme Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(analytics.themeDistribution).map(([theme, count]) => (
                  <div key={theme} className="text-center">
                    <div className="text-xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{theme.replace('_', ' ')}</div>
                    <div className="text-xs text-gray-500">{Math.round((count / analytics.totalContent) * 100)}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Weekly Content Distribution</h3>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-lg font-bold text-gray-900">{analytics.weeklyDistribution[index]}</div>
                    <div className="text-xs text-gray-600">{day.slice(0, 3)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Engagement Estimates</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center"><div className="text-2xl font-bold text-green-600">{analytics.engagementEstimates.average}</div><div className="text-sm text-gray-600">Average</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-blue-600">{analytics.engagementEstimates.total}</div><div className="text-sm text-gray-600">Total</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-purple-600">{analytics.engagementEstimates.max}</div><div className="text-sm text-gray-600">Max</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-orange-600">{analytics.engagementEstimates.min}</div><div className="text-sm text-gray-600">Min</div></div>
              </div>
            </div>

          {campaign && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Attribution Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="p-3 rounded border">
                  <div className="text-xs text-gray-500">First-touch (total)</div>
                  <div className="text-lg font-semibold text-gray-900">{campaign.attributed_first || 0}</div>
                </div>
                <div className="p-3 rounded border">
                  <div className="text-xs text-gray-500">Last-touch (total)</div>
                  <div className="text-lg font-semibold text-gray-900">{campaign.attributed_last || 0}</div>
                </div>
                <div className="p-3 rounded border col-span-2">
                  <div className="text-xs text-gray-500">Multi-touch (placeholder)</div>
                  <div className="text-sm text-gray-700">Coming soon: contribution across multiple interactions.</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {['facebook','instagram','google','tiktok','linkedin','twitter','email'].map(ch => (
                  <div key={ch} className="p-3 rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="capitalize text-gray-800">{ch}</span>
                      <span className="text-xs text-gray-500">by channel</span>
                    </div>
                    <div className="text-xs text-gray-600">First-touch: {campaign?.attribution?.[ch]?.first || 0}</div>
                    <div className="text-xs text-gray-600">Last-touch: {campaign?.attribution?.[ch]?.last || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Creatives */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Top creatives</h3>
            <div className="text-sm text-gray-500 mb-3">CTR, conversions, and fatigue are placeholders until asset telemetry is wired.</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-4">Asset</th>
                    <th className="py-2 pr-4">Impressions</th>
                    <th className="py-2 pr-4">CTR</th>
                    <th className="py-2 pr-4">Conversions</th>
                    <th className="py-2 pr-4">Fatigue</th>
                  </tr>
                </thead>
                <tbody>
                  {(campaign?.creative_performance || [
                    { name: 'Primary Video', impressions: 12000, ctr: 2.8, conversions: 35, fatigue: 'Low' },
                    { name: 'Carousel A', impressions: 8500, ctr: 3.4, conversions: 28, fatigue: 'Medium' },
                    { name: 'Headline Variant B', impressions: 6200, ctr: 2.1, conversions: 12, fatigue: 'Low' },
                  ]).map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 pr-4 text-gray-900">{row.name}</td>
                      <td className="py-2 pr-4">{(row.impressions||0).toLocaleString()}</td>
                      <td className="py-2 pr-4">{row.ctr != null ? `${row.ctr}%` : '—'}</td>
                      <td className="py-2 pr-4">{row.conversions != null ? row.conversions : '—'}</td>
                      <td className="py-2 pr-4">{row.fatigue || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceAnalyticsModal;
