import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, RefreshCw, Award } from 'lucide-react';

/**
 * Threshold Configuration Panel
 * 
 * Allows users to customize achievement thresholds for their business.
 * Fully functional UI ready for backend integration.
 */
export default function ThresholdConfigPanel() {
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('social');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [editingThresholds, setEditingThresholds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Category metadata
  const categoryInfo = {
    social: {
      name: 'Social Media',
      icon: '📱',
      description: 'Instagram, Twitter, LinkedIn, TikTok metrics'
    },
    financial: {
      name: 'Financial',
      icon: '💰',
      description: 'Revenue, profit, cost reduction'
    },
    marketing: {
      name: 'Marketing',
      icon: '📈',
      description: 'Email, campaigns, conversion rates'
    },
    growth: {
      name: 'Growth',
      icon: '🚀',
      description: 'Customers, retention, NPS'
    },
    productivity: {
      name: 'Productivity',
      icon: '⚡',
      description: 'Automation, efficiency, time saved'
    },
    content: {
      name: 'Content',
      icon: '✍️',
      description: 'Blog traffic, engagement, publications'
    },
    team: {
      name: 'Team',
      icon: '👥',
      description: 'Team size, satisfaction, training'
    }
  };

  // Load thresholds from backend
  useEffect(() => {
    loadThresholds();
  }, []);

  const loadThresholds = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/achievements/thresholds');
      // const data = await response.json();
      
      // Mock data for now
      const mockThresholds = {
        social: {
          instagram_followers: [100, 500, 1000, 5000, 10000, 50000, 100000],
          twitter_followers: [100, 500, 1000, 5000, 10000, 50000],
          linkedin_connections: [100, 500, 1000, 2500, 5000],
          reel_views: [1000, 5000, 10000, 50000, 100000, 500000]
        },
        financial: {
          monthly_revenue: [1000, 5000, 10000, 25000, 50000, 100000, 250000],
          profit_margin: [10, 15, 20, 25, 30, 35, 40],
          cost_reduction: [5, 10, 15, 20, 25]
        },
        marketing: {
          email_open_rate: [15, 20, 25, 30, 35, 40],
          campaign_roi: [200, 300, 400, 500, 1000],
          conversion_rate: [1, 2, 3, 5, 7, 10]
        },
        growth: {
          total_customers: [10, 50, 100, 250, 500, 1000, 2500],
          customer_retention: [70, 75, 80, 85, 90, 95]
        },
        productivity: {
          automation_percentage: [10, 25, 50, 75, 90],
          tasks_automated: [10, 25, 50, 100, 250, 500]
        },
        content: {
          blog_traffic: [1000, 5000, 10000, 50000, 100000],
          content_pieces_published: [10, 50, 100, 250, 500]
        },
        team: {
          team_size: [5, 10, 25, 50, 100],
          employee_satisfaction: [70, 75, 80, 85, 90, 95]
        }
      };
      
      setCategories(mockThresholds);
    } catch (error) {
      console.error('Error loading thresholds:', error);
    }
  };

  const handleMetricSelect = (metric) => {
    setSelectedMetric(metric);
    const thresholds = categories[selectedCategory][metric] || [];
    setEditingThresholds([...thresholds]);
  };

  const handleAddThreshold = () => {
    setEditingThresholds([...editingThresholds, 0]);
  };

  const handleRemoveThreshold = (index) => {
    setEditingThresholds(editingThresholds.filter((_, i) => i !== index));
  };

  const handleThresholdChange = (index, value) => {
    const newThresholds = [...editingThresholds];
    newThresholds[index] = parseFloat(value) || 0;
    setEditingThresholds(newThresholds);
  };

  const handleSave = async () => {
    if (!selectedMetric) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      // Sort thresholds in ascending order
      const sortedThresholds = [...editingThresholds].sort((a, b) => a - b);

      // TODO: Replace with actual API call
      // await fetch(`/api/achievements/thresholds/${selectedCategory}/${selectedMetric}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(sortedThresholds)
      // });

      // Update local state
      setCategories({
        ...categories,
        [selectedCategory]: {
          ...categories[selectedCategory],
          [selectedMetric]: sortedThresholds
        }
      });

      setSaveMessage('✅ Thresholds saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving thresholds:', error);
      setSaveMessage('❌ Error saving thresholds');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (selectedMetric) {
      const originalThresholds = categories[selectedCategory][selectedMetric] || [];
      setEditingThresholds([...originalThresholds]);
    }
  };

  const formatMetricName = (metric) => {
    return metric
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Award className="text-yellow-500" size={28} />
          Achievement Thresholds
        </h2>
        <p className="text-gray-600">
          Customize milestone values for your business achievements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Selection */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Categories
          </h3>
          <div className="space-y-2">
            {Object.entries(categoryInfo).map(([key, info]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedCategory(key);
                  setSelectedMetric(null);
                  setEditingThresholds([]);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  selectedCategory === key
                    ? 'bg-blue-50 border-2 border-blue-500 text-blue-900'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <div className="font-semibold">{info.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {Object.keys(categories[key] || {}).length} metrics
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selection */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Metrics
          </h3>
          {categories[selectedCategory] ? (
            <div className="space-y-2">
              {Object.keys(categories[selectedCategory]).map((metric) => (
                <button
                  key={metric}
                  onClick={() => handleMetricSelect(metric)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedMetric === metric
                      ? 'bg-green-50 border-2 border-green-500 text-green-900'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{formatMetricName(metric)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {categories[selectedCategory][metric].length} milestones
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Select a category
            </div>
          )}
        </div>

        {/* Threshold Editor */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Threshold Values
          </h3>
          {selectedMetric ? (
            <div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-3">
                  <strong>{formatMetricName(selectedMetric)}</strong>
                  <p className="text-xs mt-1">
                    Define milestone values that trigger achievements
                  </p>
                </div>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {editingThresholds.map((threshold, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="number"
                        value={threshold}
                        onChange={(e) => handleThresholdChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter value"
                      />
                      <button
                        onClick={() => handleRemoveThreshold(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddThreshold}
                  className="w-full mt-3 px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Threshold
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Reset
                </button>
              </div>

              {saveMessage && (
                <div className={`mt-3 p-3 rounded-lg text-center ${
                  saveMessage.includes('✅')
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {saveMessage}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Select a metric to configure
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">How it works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Set milestone values that trigger achievements for each metric</li>
          <li>• Agents automatically track progress and detect when thresholds are reached</li>
          <li>• Achievements are celebrated with confetti and added to your timeline</li>
          <li>• Use "Repeat Strategy" on achievements to create new goals with higher targets</li>
        </ul>
      </div>
    </div>
  );
}

