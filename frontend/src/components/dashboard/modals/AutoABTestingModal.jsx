import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  TestTube, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Brain,
  Clock,
  ArrowRight,
  Lightbulb,
  Activity,
  Target,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import ConfidenceScore from '../shared/ConfidenceScore';

const AutoABTestingModal = ({ content, onClose, onApplyABTests, hiredAgents = [] }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testingData, setTestingData] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (content) {
      analyzeABTestingOpportunities();
    }
  }, [content]);

  const analyzeABTestingOpportunities = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis for A/B testing opportunities
    await new Promise(resolve => setTimeout(resolve, 3500));

    const mockTestingData = {
      analysis_summary: `AI has analyzed your content performance patterns and identified optimal A/B testing opportunities to maximize engagement and conversion rates.`,
      
      current_performance: {
        average_engagement_rate: 6.8,
        average_click_through_rate: 2.3,
        average_reach: 3400,
        content_completion_rate: 72,
        best_performing_hook: 'Question-based',
        best_performing_time: '2:00 PM UTC',
        conversion_rate: 4.2
      },

      testing_opportunities: [
        {
          test_type: 'headline_hooks',
          description: 'Test different headline approaches for maximum engagement',
          current_performance: 6.8,
          potential_improvement: '+15-25%',
          confidence: 0.91,
          difficulty: 'Low',
          expected_duration: '7-14 days',
          test_variants: [
            {
              variant: 'A',
              type: 'Question Hook',
              example: 'What if I told you there\'s a better way to...',
              expected_performance: 8.2,
              confidence: 0.87
            },
            {
              variant: 'B', 
              type: 'Benefit Hook',
              example: 'Transform your results with this simple strategy...',
              expected_performance: 7.9,
              confidence: 0.84
            },
            {
              variant: 'C',
              type: 'Curiosity Hook',
              example: 'The secret most people don\'t know about...',
              expected_performance: 7.6,
              confidence: 0.82
            }
          ]
        },
        {
          test_type: 'visual_elements',
          description: 'Test different visual styles and layouts for better engagement',
          current_performance: 72,
          potential_improvement: '+12-20%',
          confidence: 0.88,
          difficulty: 'Medium',
          expected_duration: '10-14 days',
          test_variants: [
            {
              variant: 'A',
              type: 'Clean Minimal',
              example: 'Simple design with lots of white space',
              expected_performance: 78,
              confidence: 0.85
            },
            {
              variant: 'B',
              type: 'Bold Graphics',
              example: 'Vibrant colors with bold typography',
              expected_performance: 81,
              confidence: 0.89
            },
            {
              variant: 'C',
              type: 'Story Format',
              example: 'Visual storytelling with multiple images',
              expected_performance: 76,
              confidence: 0.83
            }
          ]
        },
        {
          test_type: 'timing_optimization',
          description: 'Test optimal posting times based on audience behavior',
          current_performance: 3400,
          potential_improvement: '+18-30%',
          confidence: 0.93,
          difficulty: 'Low',
          expected_duration: '14-21 days',
          test_variants: [
            {
              variant: 'A',
              type: 'Peak Hours',
              example: '2:00 PM UTC (Current best time)',
              expected_performance: 3800,
              confidence: 0.90
            },
            {
              variant: 'B',
              type: 'Off-Peak Hours',
              example: '10:00 AM UTC (Less competition)',
              expected_performance: 4200,
              confidence: 0.87
            },
            {
              variant: 'C',
              type: 'Evening Hours',
              example: '7:00 PM UTC (After work engagement)',
              expected_performance: 3900,
              confidence: 0.85
            }
          ]
        },
        {
          test_type: 'call_to_action',
          description: 'Test different CTA styles and placements for higher conversion',
          current_performance: 4.2,
          potential_improvement: '+20-35%',
          confidence: 0.89,
          difficulty: 'Low',
          expected_duration: '7-10 days',
          test_variants: [
            {
              variant: 'A',
              type: 'Direct CTA',
              example: 'Click here to get started now',
              expected_performance: 5.1,
              confidence: 0.86
            },
            {
              variant: 'B',
              type: 'Question CTA',
              example: 'Ready to transform your results?',
              expected_performance: 5.6,
              confidence: 0.91
            },
            {
              variant: 'C',
              type: 'Benefit CTA',
              example: 'Get your free guide and start today',
              expected_performance: 5.3,
              confidence: 0.88
            }
          ]
        }
      ],

      automated_testing_strategy: {
        testing_framework: 'Multi-armed Bandit',
        optimization_algorithm: 'Thompson Sampling',
        confidence_threshold: 0.85,
        minimum_sample_size: 1000,
        testing_duration: '14 days average',
        auto_optimization: true,
        fallback_strategy: 'Return to best performing variant'
      },

      test_variants: [
        {
          id: 'headline_test',
          name: 'Headline Hook Optimization',
          description: 'Automatically test 3 different headline approaches',
          test_type: 'headline_hooks',
          variants: [
            {
              id: 'variant_a',
              name: 'Question Hook',
              content: 'What if I told you there\'s a better way to achieve your goals?',
              expected_engagement: 8.2,
              confidence: 0.87
            },
            {
              id: 'variant_b',
              name: 'Benefit Hook', 
              content: 'Transform your results with this simple strategy that works',
              expected_engagement: 7.9,
              confidence: 0.84
            },
            {
              id: 'variant_c',
              name: 'Curiosity Hook',
              content: 'The secret most people don\'t know about achieving success',
              expected_engagement: 7.6,
              confidence: 0.82
            }
          ],
          success_metrics: ['engagement_rate', 'click_through_rate', 'time_on_content'],
          confidence: 0.91,
          difficulty: 'Low',
          expected_duration: '7-14 days',
          status: 'pending'
        },
        {
          id: 'visual_test',
          name: 'Visual Style Optimization',
          description: 'Test different visual approaches for maximum impact',
          test_type: 'visual_elements',
          variants: [
            {
              id: 'variant_a',
              name: 'Clean Minimal',
              description: 'Simple design with lots of white space',
              expected_engagement: 78,
              confidence: 0.85
            },
            {
              id: 'variant_b',
              name: 'Bold Graphics',
              description: 'Vibrant colors with bold typography',
              expected_engagement: 81,
              confidence: 0.89
            },
            {
              id: 'variant_c',
              name: 'Story Format',
              description: 'Visual storytelling with multiple images',
              expected_engagement: 76,
              confidence: 0.83
            }
          ],
          success_metrics: ['engagement_rate', 'completion_rate', 'shares'],
          confidence: 0.88,
          difficulty: 'Medium',
          expected_duration: '10-14 days',
          status: 'pending'
        },
        {
          id: 'timing_test',
          name: 'Posting Time Optimization',
          description: 'Test optimal posting times for maximum reach',
          test_type: 'timing_optimization',
          variants: [
            {
              id: 'variant_a',
              name: 'Peak Hours',
              time: '2:00 PM UTC',
              expected_reach: 3800,
              confidence: 0.90
            },
            {
              id: 'variant_b',
              name: 'Off-Peak Hours',
              time: '10:00 AM UTC',
              expected_reach: 4200,
              confidence: 0.87
            },
            {
              id: 'variant_c',
              name: 'Evening Hours',
              time: '7:00 PM UTC',
              expected_reach: 3900,
              confidence: 0.85
            }
          ],
          success_metrics: ['reach', 'impressions', 'engagement_rate'],
          confidence: 0.93,
          difficulty: 'Low',
          expected_duration: '14-21 days',
          status: 'pending'
        },
        {
          id: 'cta_test',
          name: 'Call-to-Action Optimization',
          description: 'Test different CTA styles for higher conversion',
          test_type: 'call_to_action',
          variants: [
            {
              id: 'variant_a',
              name: 'Direct CTA',
              cta: 'Click here to get started now',
              expected_conversion: 5.1,
              confidence: 0.86
            },
            {
              id: 'variant_b',
              name: 'Question CTA',
              cta: 'Ready to transform your results?',
              expected_conversion: 5.6,
              confidence: 0.91
            },
            {
              id: 'variant_c',
              name: 'Benefit CTA',
              cta: 'Get your free guide and start today',
              expected_conversion: 5.3,
              confidence: 0.88
            }
          ],
          success_metrics: ['click_through_rate', 'conversion_rate', 'engagement_rate'],
          confidence: 0.89,
          difficulty: 'Low',
          expected_duration: '7-10 days',
          status: 'pending'
        }
      ],

      testing_insights: {
        algorithm_accuracy: 0.92,
        historical_success_rate: 0.78,
        average_improvement: '+22%',
        testing_frequency: 'Continuous',
        optimization_speed: 'Real-time',
        confidence_threshold: 0.85
      },

      agent_contributions: {
        testing_agent: {
          confidence: 0.91,
          insight: 'Identified optimal testing framework using multi-armed bandit approach',
          contribution: 'Designed automated A/B testing strategy with real-time optimization'
        },
        analytics_agent: {
          confidence: 0.88,
          insight: 'Historical performance data shows significant improvement potential',
          contribution: 'Analyzed performance patterns to identify highest-impact testing opportunities'
        },
        content_strategist: {
          confidence: 0.87,
          insight: 'Content variations should focus on hooks, visuals, and CTAs for maximum impact',
          contribution: 'Developed content variants with high conversion potential'
        }
      },

      overall_confidence: 0.90,
      testing_phase: 'Advanced - Comprehensive testing strategy ready for deployment',
      next_optimization: 'Real-time performance monitoring and automatic variant selection'
    };

    setTestingData(mockTestingData);
    setIsAnalyzing(false);
  };

  const handleToggleTest = (testId) => {
    setSelectedTests(prev =>
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleApplyABTests = async () => {
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const applied = testingData.test_variants.filter(test => 
      selectedTests.includes(test.id)
    );

    // Create A/B test content items
    const testContentItems = [];
    
    applied.forEach(test => {
      test.variants.forEach((variant, index) => {
        const testDate = new Date();
        testDate.setDate(testDate.getDate() + index + 1);
        
        testContentItems.push({
          id: `ab_test_${test.id}_${variant.id}_${Date.now()}`,
          title: `${content.title} - ${variant.name} (Test ${variant.id.toUpperCase()})`,
          content_preview: variant.content || variant.description || variant.cta || content.content_preview,
          platform: content.platform,
          content_type: content.content_type,
          scheduled_date: testDate.toISOString(),
          status: 'scheduled',
          assignee: 'Auto A/B Testing System',
          created_by: 'AI Testing Agent',
          ab_test: true,
          test_id: test.id,
          variant_id: variant.id,
          variant_name: variant.name,
          expected_performance: variant.expected_engagement || variant.expected_reach || variant.expected_conversion,
          confidence: variant.confidence
        });
      });
    });

    onApplyABTests(testContentItems, applied);
    setIsApplying(false);
    onClose();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestTypeIcon = (testType) => {
    switch (testType) {
      case 'headline_hooks': return <MessageSquare className="w-4 h-4" />;
      case 'visual_elements': return <Eye className="w-4 h-4" />;
      case 'timing_optimization': return <Clock className="w-4 h-4" />;
      case 'call_to_action': return <Target className="w-4 h-4" />;
      default: return <TestTube className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center justify-between p-6 border-b -mx-6 -mt-6 mb-6">
          <div className="flex items-center space-x-3">
            <TestTube className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Auto A/B Testing</h2>
              <p className="text-sm text-gray-600">
                AI-powered automated testing for maximum content performance
              </p>
            </div>
          </div>
          {testingData && (
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <ConfidenceScore score={testingData.overall_confidence} size="medium" />
            </div>
          )}
        </div>

        {isAnalyzing ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Testing Opportunities...</h3>
            <p className="text-gray-600 mb-6">
              AI agents are identifying optimal A/B testing strategies to maximize your content performance.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analyzing current content performance patterns</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <TestTube className="w-4 h-4" />
                <span>Identifying high-impact testing opportunities</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Designing optimal test variants and frameworks</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Configuring automated testing and optimization</span>
              </div>
            </div>
          </div>
        ) : testingData ? (
          <div className="space-y-6">
            {/* Current Performance */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Current Performance Baseline
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-gray-900">{testingData.current_performance.average_engagement_rate}%</div>
                  <div className="text-sm text-gray-600">Engagement Rate</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">{testingData.current_performance.average_click_through_rate}%</div>
                  <div className="text-sm text-gray-600">Click-Through Rate</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">{testingData.current_performance.average_reach.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Average Reach</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">{testingData.current_performance.conversion_rate}%</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
            </div>

            {/* Testing Framework */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                Automated Testing Framework
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Algorithm:</span>
                    <span className="font-medium">{testingData.automated_testing_strategy.testing_framework}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Optimization:</span>
                    <span className="font-medium">{testingData.automated_testing_strategy.optimization_algorithm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence Threshold:</span>
                    <span className="font-medium">{Math.round(testingData.automated_testing_strategy.confidence_threshold * 100)}%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sample Size:</span>
                    <span className="font-medium">{testingData.automated_testing_strategy.minimum_sample_size.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{testingData.automated_testing_strategy.testing_duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auto-Optimization:</span>
                    <span className="font-medium text-green-600">Enabled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* A/B Test Variants */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TestTube className="w-5 h-5 mr-2 text-blue-600" />
                A/B Test Opportunities
              </h3>
              <div className="space-y-4">
                {testingData.test_variants.map((test) => (
                  <label key={test.id} className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedTests.includes(test.id) 
                      ? 'bg-blue-50 border-blue-400 shadow-md' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={() => handleToggleTest(test.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getTestTypeIcon(test.test_type)}
                          <span className="font-medium text-gray-900">{test.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                            {test.difficulty}
                          </span>
                          <ConfidenceScore score={test.confidence} size="small" showDetails={false} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        {test.variants.map((variant) => (
                          <div key={variant.id} className="bg-white p-3 rounded border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">Variant {variant.id.toUpperCase()}</span>
                              <ConfidenceScore score={variant.confidence} size="small" showDetails={false} />
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {variant.content || variant.description || variant.cta || variant.time}
                            </div>
                            <div className="text-xs text-blue-600 font-medium">
                              Expected: {variant.expected_engagement || variant.expected_reach || variant.expected_conversion}
                              {variant.expected_engagement && '% engagement'}
                              {variant.expected_reach && ' reach'}
                              {variant.expected_conversion && '% conversion'}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Success Metrics: {test.success_metrics.join(', ')}</span>
                        <span className="text-gray-500">Duration: {test.expected_duration}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Testing Insights */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Testing Performance Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Algorithm Accuracy:</span>
                    <span className="font-medium text-green-600">{Math.round(testingData.testing_insights.algorithm_accuracy * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-medium text-blue-600">{Math.round(testingData.testing_insights.historical_success_rate * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Improvement:</span>
                    <span className="font-medium text-purple-600">{testingData.testing_insights.average_improvement}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Testing Frequency:</span>
                    <span className="font-medium">{testingData.testing_insights.testing_frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Optimization Speed:</span>
                    <span className="font-medium text-green-600">{testingData.testing_insights.optimization_speed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence Threshold:</span>
                    <span className="font-medium">{Math.round(testingData.testing_insights.confidence_threshold * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Contributions */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-600" />
                Agent Contributions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(testingData.agent_contributions).map(([agentId, contribution]) => (
                  <div key={agentId} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 capitalize">
                        {agentId.replace(/_/g, ' ')} Agent
                      </span>
                      <ConfidenceScore score={contribution.confidence} size="small" showDetails={false} />
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{contribution.insight}</p>
                    <p className="text-xs text-indigo-600">{contribution.contribution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="border-t p-6 -mx-6 -mb-6 mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyABTests}
            disabled={selectedTests.length === 0 || isApplying}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Setting Up Tests...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Launch {selectedTests.length} A/B Test(s)
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AutoABTestingModal;
