import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Eye, Heart, Share2, MousePointer, BarChart3, Info } from 'lucide-react';
import { ContentIntelligenceAPIService } from '../../services/contentIntelligenceApi';
import AgentActionsConfirmModal from '../dashboard/modals/AgentActionsConfirmModal';

const ContentPerformanceGarden = ({ performanceData, onPlantClick }) => {
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [season, setSeason] = useState('spring');
  const [isLoading, setIsLoading] = useState(true);

  // Transform performance data into garden plants
  useEffect(() => {
    if (performanceData && performanceData.content_performance) {
      const items = performanceData.content_performance;
      const maxReach = Math.max(1, ...items.map(c => c.reach || 0));
      const maxEng = Math.max(1, ...items.map(c => c.engagement_rate || 0));
      const maxImpr = Math.max(1, ...items.map(c => c.impressions || 0));

      const transformedPlants = items.map((content, index) => {
        // Use performance_score if available, otherwise scale engagement_rate (0-10%) to 0-100
        const perf = (typeof content.performance_score === 'number' && !isNaN(content.performance_score))
          ? content.performance_score
          : (typeof content.engagement_rate === 'number' ? content.engagement_rate * 10 : 0);
        const reach = content.reach || 0;
        const conversion = content.conversion_rate || 0;
        const engagement = content.engagement_rate || 0;

        let growthStage = 'seedling';
        if (perf >= 90) growthStage = 'flourishing';
        else if (perf >= 70) growthStage = 'mature';
        else if (perf >= 50) growthStage = 'growing';

        const x = 5 + Math.min(95, (reach / maxReach) * 90);
        const y = 90 - Math.min(85, (engagement / maxEng) * 85);

        const rawSize = Math.sqrt((reach + (content.impressions || 0)) / (maxReach + maxImpr)) * 36;
        const size = Math.min(40, Math.max(12, rawSize));

        return {
          id: content.content_id || `content_${index}`,
          title: content.title || `Content ${index + 1}`,
          type: content.content_type || 'post',
          platform: content.platform || 'unknown',
          performance: perf,
          engagement: engagement,
          reach: reach,
          conversion: conversion,
          publishDate: new Date(content.publish_date || new Date()),
          category: content.category || 'General',
          x,
          y,
          size,
          growthStage,
          seasonal: content.seasonal || false,
          performanceScore: perf,
          impressions: content.impressions || 0,
          clicks: content.clicks || 0,
          cost: content.cost || 0,
          roi: content.roi || 0
        };
      });

      setPlants(transformedPlants);
      setIsLoading(false);
    }
  }, [performanceData]);

  // Simulate seasonal changes for demo
  useEffect(() => {
    const interval = setInterval(() => {
      const seasons = ['spring', 'summer', 'autumn', 'winter'];
      setSeason(prev => {
        const currentIndex = seasons.indexOf(prev);
        return seasons[(currentIndex + 1) % seasons.length];
      });
    }, 30000); // Change season every 30 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const getPlantIcon = (type) => {
    const icons = {
      blog: '📝',
      social: '📱',
      video: '🎥',
      podcast: '🎙️',
      email: '📧',
      post: '📱',
      article: '📝',
      reel: '🎬',
      story: '📖',
      carousel: '🎠'
    };
    return icons[type] || '🌱';
  };

  const getPlantVisual = (plant) => {
    const performance = plant.performance;
    const isSeasonal = plant.seasonal;
    
    if (performance >= 90) {
      return isSeasonal ? '🌸' : '🌳';
    } else if (performance >= 70) {
      return isSeasonal ? '🌺' : '🌿';
    } else if (performance >= 50) {
      return isSeasonal ? '🌼' : '🌱';
    } else {
      return '🌱';
    }
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 80) return '#10B981'; // Green
    if (performance >= 60) return '#F59E0B'; // Amber
    return '#EF4444'; // Red for <60%
  };

  const getSeasonalEffect = (plant) => {
    if (!plant.seasonal) return null;
    
    const seasonalEffects = {
      spring: { color: '#10B981', effect: '🌸' },
      summer: { color: '#F59E0B', effect: '☀️' },
      autumn: { color: '#EF4444', effect: '🍂' },
      winter: { color: '#3B82F6', effect: '❄️' }
    };
    
    return seasonalEffects[season];
  };

  const getGrowthAnimation = (growthStage) => {
    const animations = {
      seedling: { scale: [0.8, 1, 0.8], duration: 3 },
      growing: { scale: [1, 1.1, 1], duration: 2.5 },
      mature: { scale: [1, 1.05, 1], duration: 4 },
      flourishing: { scale: [1, 1.2, 1], duration: 2 }
    };
    return animations[growthStage] || animations.seedling;
  };

  const handlePlantClick = (plant) => {
    setSelectedPlant(plant);
    if (onPlantClick) {
      onPlantClick(plant);
    }
  };

  if (isLoading) {
  return (
      <div className="relative w-full h-96 bg-gradient-to-br from-green-100 via-blue-50 to-yellow-50 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Growing your content garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-green-100 via-blue-50 to-yellow-50 rounded-lg overflow-visible">
      {/* Garden Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-green-200 to-green-300 opacity-30" />
        
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: season === 'spring' ? 'radial-gradient(circle, #10B981, transparent)' :
                       season === 'summer' ? 'radial-gradient(circle, #F59E0B, transparent)' :
                       season === 'autumn' ? 'radial-gradient(circle, #EF4444, transparent)' :
                       'radial-gradient(circle, #3B82F6, transparent)'
          }}
          key={season}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1 }}
        />

        {/* Decorative elements */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -5, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Content Plants */}
      {plants.map((plant) => {
        const animation = getGrowthAnimation(plant.growthStage);
        const seasonalEffect = getSeasonalEffect(plant);
        
        return (
          <motion.div
            key={plant.id}
            className="absolute cursor-pointer group"
            style={{
              left: `${plant.x}%`,
              top: `${plant.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            whileHover={{ scale: 1.2 }}
            onClick={() => handlePlantClick(plant)}
            animate={animation}
            transition={{ duration: animation.duration, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative">
              {/* Plant Visual */}
              <div
                className="text-3xl filter drop-shadow-lg relative"
                style={{
                  fontSize: `${plant.size}px`
                }}
              >
                {/* Colored circular badge behind the plant (centered) */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: `${plant.size + 16}px`,
                    height: `${plant.size + 16}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: getPerformanceColor(plant.performance) + '33'
                  }}
                />
                {getPlantVisual(plant)}
              </div>

              {/* Performance Indicator */}
              <div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: getPerformanceColor(plant.performance) }}
              />

              {/* Seasonal Effect */}
              {seasonalEffect && (
                <motion.div
                  className="absolute -top-2 -left-2 text-xs"
                  animate={{
                    rotate: [0, 360],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity
                  }}
                >
                  {seasonalEffect.effect}
                </motion.div>
              )}

              {/* Growth Stage Indicator */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                <div className={`w-2 h-2 rounded-full ${
                  plant.growthStage === 'flourishing' ? 'bg-green-500' :
                  plant.growthStage === 'mature' ? 'bg-blue-500' :
                  plant.growthStage === 'growing' ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`} />
              </div>

              {/* Engagement Particles */}
              {false && plant.engagement > 80 && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0, 0.6, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                >
                  <div className="w-full h-full border-2 border-yellow-300 rounded-full" />
                </motion.div>
              )}

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  <div className="font-medium">{plant.title}</div>
                  <div className="text-gray-300">{plant.platform} • {plant.performance}% performance</div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Plant Detail Modal */}
      <AnimatePresence>
        {selectedPlant && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-md mx-4 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedPlant(null)}
              >
                ×
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">{getPlantIcon(selectedPlant.type)}</div>
              <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedPlant.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {selectedPlant.platform}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {selectedPlant.growthStage}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-green-600 font-medium flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Performance
                  </div>
                  <div className="text-lg font-bold text-green-700">{selectedPlant.performance}%</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-medium flex items-center">
                    <Heart className="w-3 h-3 mr-1" />
                    Engagement
                  </div>
                  <div className="text-lg font-bold text-blue-700">{selectedPlant.engagement}%</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-xs text-purple-600 font-medium flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    Reach
                  </div>
                  <div className="text-lg font-bold text-purple-700">{selectedPlant.reach.toLocaleString()}</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-xs text-orange-600 font-medium flex items-center">
                    <MousePointer className="w-3 h-3 mr-1" />
                    Conversion
                  </div>
                  <div className="text-lg font-bold text-orange-700">{selectedPlant.conversion}%</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <strong>Category:</strong> {selectedPlant.category}<br />
                <strong>Published:</strong> {selectedPlant.publishDate.toLocaleDateString()}<br />
                <strong>Impressions:</strong> {selectedPlant.impressions.toLocaleString()}<br />
                <strong>Cost:</strong> ${selectedPlant.cost.toFixed(2)}<br />
                <strong>ROI:</strong> {selectedPlant.roi.toFixed(2)}x
              </div>

              <div className="flex space-x-3">
                <AgentActionButtons selectedPlant={selectedPlant} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Garden Legend */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-lg p-3">
        <div className="text-xs space-y-1">
          <div className="font-medium text-gray-800 mb-2 flex items-center">
            Garden Legend
            <span className="ml-2 text-gray-400" title="Colors reflect performance: green=high, yellow=medium, red=low. Seasons visualize seasonal effects for content marked as seasonal; the background cycles to illustrate seasonality context.">ℹ️</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>High Performance (80%+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Medium Performance (60-79%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Low Performance (&lt;60%)</span>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            Season: {season} {getSeasonalEffect({ seasonal: true })?.effect}
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentActionButtons = ({ selectedPlant }) => {
  const [showConfirm, setShowConfirm] = useState(null);
  const api = new ContentIntelligenceAPIService();

  const optimizeActions = [
    'Adjust targeting parameters',
    'Optimize creative elements',
    'Improve call-to-action',
    'Test different posting times'
  ];
  const analyzeActions = [
    'Deep-dive content diagnostics',
    'Benchmark vs industry',
    'Generate prioritized recommendations'
  ];

  return (
    <>
      <button
        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
        onClick={() => setShowConfirm({ type: 'optimize', actions: optimizeActions })}
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        Optimize
      </button>
      <button
        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
        onClick={() => setShowConfirm({ type: 'analyze', actions: analyzeActions })}
      >
        <Info className="w-4 h-4 mr-2" />
        Analyze
      </button>

      {showConfirm && (
        <AgentActionsConfirmModal
          title={showConfirm.type === 'optimize' ? 'Initiate Optimization' : 'Run Analysis'}
          description={showConfirm.type === 'optimize'
            ? `Would you like the AI Agents to initiate the following to optimize your content "${selectedPlant.title}"?`
            : `Run analysis for "${selectedPlant.title}" and generate recommendations?`}
          actions={showConfirm.actions}
          onCancel={() => setShowConfirm(null)}
          onProceed={async (selectedActions) => {
            try {
              if (showConfirm.type === 'optimize') {
                await api.executeWorkflow({
                  workflow: 'optimize_content_performance',
                  content: {
                    id: selectedPlant.id,
                    platform: selectedPlant.platform,
                    type: selectedPlant.type,
                    title: selectedPlant.title
                  },
                  actions: selectedActions,
                  agents: ['orchestrator_agent', 'strategy_agent', 'content_intelligence_agent', 'automation_agent']
                });
              } else {
                await api.getInsightAnalysis({
                  insight_text: `Analyze content performance for ${selectedPlant.title} on ${selectedPlant.platform}`,
                  context: {
                    id: selectedPlant.id,
                    platform: selectedPlant.platform,
                    metrics: {
                      engagement: selectedPlant.engagement,
                      reach: selectedPlant.reach,
                      conversions: selectedPlant.conversion
                    }
                  },
                  actions: selectedActions
                });
              }
            } finally {
              setShowConfirm(null);
            }
          }}
        />
      )}
    </>
  );
};

export default ContentPerformanceGarden;