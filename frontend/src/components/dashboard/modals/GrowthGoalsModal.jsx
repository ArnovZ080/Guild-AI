import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Target, 
  TrendingUp, 
  Calendar, 
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
  Calculator,
  PieChart,
  LineChart
} from 'lucide-react';
import ConfidenceScore from '../shared/ConfidenceScore';

const GrowthGoalsModal = ({ content, onClose, onApplyGrowthStrategy, hiredAgents = [] }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [strategyData, setStrategyData] = useState(null);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (content) {
      analyzeGrowthStrategy();
    }
  }, [content]);

  const analyzeGrowthStrategy = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis for growth strategy back-solving
    await new Promise(resolve => setTimeout(resolve, 4000));

    const mockStrategyData = {
      analysis_summary: `AI has analyzed your current audience metrics and content performance to back-solve optimal posting strategies for achieving ambitious growth goals.`,
      
      current_metrics: {
        current_audience: 12450,
        current_engagement_rate: 6.8,
        current_posting_frequency: '5 posts/week',
        current_reach_per_post: 3400,
        current_click_through_rate: 2.3,
        growth_trend: '+12% over 90 days'
      },

      growth_opportunities: [
        {
          goal_type: 'audience_growth',
          description: 'Increase audience by 25% in 90 days',
          current_value: 12450,
          target_value: 15563,
          growth_needed: 3113,
          confidence: 0.89,
          strategy: 'Increase posting frequency and optimize for viral content',
          expected_impact: 'High',
          difficulty: 'Medium'
        },
        {
          goal_type: 'engagement_rate',
          description: 'Boost engagement rate from 6.8% to 9.5%',
          current_value: 6.8,
          target_value: 9.5,
          growth_needed: 2.7,
          confidence: 0.85,
          strategy: 'Focus on interactive content and optimal timing',
          expected_impact: 'High',
          difficulty: 'Medium'
        },
        {
          goal_type: 'content_reach',
          description: 'Increase average reach per post by 40%',
          current_value: 3400,
          target_value: 4760,
          growth_needed: 1360,
          confidence: 0.92,
          strategy: 'Optimize hashtags and cross-platform promotion',
          expected_impact: 'Medium',
          difficulty: 'Low'
        },
        {
          goal_type: 'click_through',
          description: 'Improve CTR from 2.3% to 4.1%',
          current_value: 2.3,
          target_value: 4.1,
          growth_needed: 1.8,
          confidence: 0.87,
          strategy: 'A/B test compelling headlines and CTAs',
          expected_impact: 'High',
          difficulty: 'Medium'
        }
      ],

      back_solved_strategies: [
        {
          id: 'strategy_1',
          goal_id: 'audience_growth',
          name: 'Audience Growth Acceleration',
          description: 'Increase posting frequency to 7 posts/week with viral-optimized content',
          timeline: '90 days',
          posting_schedule: {
            frequency: '7 posts/week',
            optimal_days: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
            optimal_times: ['2:00 PM', '6:00 PM', '8:00 PM'],
            content_mix: {
              educational: '40%',
              entertaining: '35%',
              promotional: '15%',
              interactive: '10%'
            }
          },
          expected_outcomes: {
            new_followers: 3113,
            engagement_lift: '+28%',
            reach_increase: '+35%',
            viral_potential: 'High'
          },
          required_resources: {
            content_creation_time: '+15 hours/week',
            budget_increase: '+$200/month',
            tools_needed: ['Hashtag research', 'Trend monitoring', 'Engagement tools']
          },
          confidence: 0.89,
          risk_level: 'Medium',
          status: 'pending'
        },
        {
          id: 'strategy_2',
          goal_id: 'engagement_rate',
          name: 'Engagement Optimization Strategy',
          description: 'Focus on interactive content with optimal timing and audience targeting',
          timeline: '60 days',
          posting_schedule: {
            frequency: '6 posts/week',
            optimal_days: ['Tuesday', 'Thursday', 'Saturday'],
            optimal_times: ['2:30 PM', '7:00 PM'],
            content_mix: {
              interactive: '45%',
              educational: '30%',
              behind_scenes: '15%',
              user_generated: '10%'
            }
          },
          expected_outcomes: {
            engagement_rate: '9.5%',
            comments_increase: '+45%',
            shares_increase: '+38%',
            time_on_content: '+22%'
          },
          required_resources: {
            content_creation_time: '+12 hours/week',
            budget_increase: '+$150/month',
            tools_needed: ['Polls creation', 'Story templates', 'Engagement tracking']
          },
          confidence: 0.85,
          risk_level: 'Low',
          status: 'pending'
        },
        {
          id: 'strategy_3',
          goal_id: 'content_reach',
          name: 'Reach Maximization Strategy',
          description: 'Optimize hashtag strategy and cross-platform promotion for maximum reach',
          timeline: '45 days',
          posting_schedule: {
            frequency: '8 posts/week',
            optimal_days: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
            optimal_times: ['1:00 PM', '4:00 PM', '8:30 PM'],
            content_mix: {
              trending_topics: '30%',
              evergreen: '25%',
              seasonal: '25%',
              trending_hashtags: '20%'
            }
          },
          expected_outcomes: {
            average_reach: 4760,
            hashtag_performance: '+60%',
            cross_platform_lift: '+25%',
            discoverability: '+40%'
          },
          required_resources: {
            content_creation_time: '+18 hours/week',
            budget_increase: '+$300/month',
            tools_needed: ['Hashtag research', 'Trend analysis', 'Cross-platform scheduler']
          },
          confidence: 0.92,
          risk_level: 'Low',
          status: 'pending'
        }
      ],

      calendar_back_solving: {
        total_posts_needed: 126,
        posts_per_week: 7,
        content_themes: [
          'Educational tutorials (40 posts)',
          'Behind-the-scenes content (30 posts)',
          'User-generated content (25 posts)',
          'Trending topic responses (20 posts)',
          'Interactive polls/questions (11 posts)'
        ],
        posting_pattern: {
          monday: 'Educational content + Trending hashtags',
          tuesday: 'Interactive content + Behind-the-scenes',
          wednesday: 'Educational tutorials + User stories',
          thursday: 'Interactive polls + Trending topics',
          friday: 'Behind-the-scenes + Educational tips',
          saturday: 'User-generated content + Fun facts',
          sunday: 'Weekly recap + Educational deep-dive'
        },
        milestone_checkpoints: [
          { week: 4, target: '+8% audience growth', metric: 'followers' },
          { week: 8, target: '+15% engagement rate', metric: 'engagement' },
          { week: 12, target: '+25% audience growth', metric: 'followers' }
        ]
      },

      agent_contributions: {
        strategy_agent: {
          confidence: 0.91,
          insight: 'Identified optimal posting frequency and content mix for maximum growth',
          contribution: 'Developed comprehensive 90-day growth strategy with back-solved posting schedule'
        },
        analytics_agent: {
          confidence: 0.88,
          insight: 'Current performance metrics show strong foundation for ambitious growth goals',
          contribution: 'Analyzed historical data to predict achievable growth targets and timelines'
        },
        content_strategist: {
          confidence: 0.87,
          insight: 'Content mix optimization will drive both reach and engagement improvements',
          contribution: 'Designed content themes and posting patterns for sustained growth'
        }
      },

      risk_assessment: {
        high_risk_factors: [
          'Increased posting frequency may lead to content quality concerns',
          'Ambitious goals require consistent execution over 90 days'
        ],
        mitigation_strategies: [
          'Implement quality control checkpoints every 2 weeks',
          'Prepare content bank with 2 weeks of posts ready'
        ],
        success_probability: 0.84
      },

      overall_confidence: 0.88,
      strategy_phase: 'Advanced - Comprehensive back-solving analysis complete',
      next_review: 'Weekly progress reviews with strategy adjustments'
    };

    setStrategyData(mockStrategyData);
    setIsAnalyzing(false);
  };

  const handleToggleGoal = (goalId) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleApplyGrowthStrategy = async () => {
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const applied = strategyData.back_solved_strategies.filter(strategy => 
      selectedGoals.includes(strategy.id)
    );

    // Create new content items based on the back-solved strategy
    const newContentItems = [];
    const strategy = applied[0]; // Use first selected strategy
    
    if (strategy) {
      // Generate content for the next 2 weeks based on the strategy
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const contentThemes = [
        'Educational tutorial on industry trends',
        'Behind-the-scenes look at our process',
        'Interactive poll about user preferences',
        'User-generated content showcase',
        'Trending topic response with expert insights',
        'Weekly recap and lessons learned',
        'Educational deep-dive into best practices'
      ];

      for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        
        newContentItems.push({
          id: `growth_strategy_${Date.now()}_${i}`,
          title: `Growth Strategy Post ${i + 1}`,
          content_preview: contentThemes[i % contentThemes.length],
          platform: content.platform,
          content_type: 'post',
          scheduled_date: date.toISOString(),
          status: 'scheduled',
          assignee: 'Growth Strategy Agent',
          created_by: 'Growth Goals Back-Solving System',
          growth_strategy_applied: true,
          strategy_id: strategy.id,
          expected_impact: strategy.expected_outcomes
        });
      }
    }

    onApplyGrowthStrategy(newContentItems, applied);
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

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-7xl relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center justify-between p-6 border-b -mx-6 -mt-6 mb-6">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Growth Goals Back-Solving</h2>
              <p className="text-sm text-gray-600">
                AI-powered strategy development for ambitious growth targets
              </p>
            </div>
          </div>
          {strategyData && (
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-blue-500" />
              <ConfidenceScore score={strategyData.overall_confidence} size="medium" />
            </div>
          )}
        </div>

        {isAnalyzing ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Back-Solving Growth Strategy...</h3>
            <p className="text-gray-600 mb-6">
              AI agents are analyzing current metrics to develop optimal posting strategies for your growth goals.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analyzing current audience metrics and growth trends</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Setting ambitious but achievable growth targets</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Back-solving optimal posting schedule and content mix</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Developing comprehensive 90-day growth strategy</span>
              </div>
            </div>
          </div>
        ) : strategyData ? (
          <div className="space-y-6">
            {/* Current Metrics */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Current Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-gray-900">{strategyData.current_metrics.current_audience.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Current Audience</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">{strategyData.current_metrics.current_engagement_rate}%</div>
                  <div className="text-sm text-gray-600">Engagement Rate</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">{strategyData.current_metrics.current_posting_frequency}</div>
                  <div className="text-sm text-gray-600">Posting Frequency</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">{strategyData.current_metrics.current_reach_per_post.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Avg Reach/Post</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-teal-600">{strategyData.current_metrics.current_click_through_rate}%</div>
                  <div className="text-sm text-gray-600">Click-Through Rate</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">{strategyData.current_metrics.growth_trend}</div>
                  <div className="text-sm text-gray-600">Growth Trend</div>
                </div>
              </div>
            </div>

            {/* Growth Opportunities */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Identified Growth Opportunities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategyData.growth_opportunities.map((opportunity, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-900">{opportunity.description}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(opportunity.difficulty)}`}>
                          {opportunity.difficulty}
                        </span>
                        <ConfidenceScore score={opportunity.confidence} size="small" showDetails={false} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Current: {opportunity.current_value.toLocaleString()}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-green-600">Target: {opportunity.target_value.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">{opportunity.strategy}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Expected Impact</span>
                      <span className="text-xs font-medium text-green-600">{opportunity.expected_impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Back-Solved Strategies */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-purple-600" />
                Back-Solved Posting Strategies
              </h3>
              <div className="space-y-4">
                {strategyData.back_solved_strategies.map((strategy) => (
                  <label key={strategy.id} className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedGoals.includes(strategy.id) 
                      ? 'bg-purple-50 border-purple-400 shadow-md' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedGoals.includes(strategy.id)}
                      onChange={() => handleToggleGoal(strategy.id)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{strategy.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(strategy.risk_level)}`}>
                            {strategy.risk_level} Risk
                          </span>
                          <ConfidenceScore score={strategy.confidence} size="small" showDetails={false} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-gray-900 mb-2">Posting Schedule</h4>
                          <div className="text-sm space-y-1">
                            <div><span className="font-medium">Frequency:</span> {strategy.posting_schedule.frequency}</div>
                            <div><span className="font-medium">Days:</span> {strategy.posting_schedule.optimal_days.join(', ')}</div>
                            <div><span className="font-medium">Times:</span> {strategy.posting_schedule.optimal_times.join(', ')}</div>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-gray-900 mb-2">Expected Outcomes</h4>
                          <div className="text-sm space-y-1">
                            {Object.entries(strategy.expected_outcomes).map(([key, value]) => (
                              <div key={key}><span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {value}</div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-gray-900 mb-2">Content Mix</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          {Object.entries(strategy.posting_schedule.content_mix).map(([type, percentage]) => (
                            <div key={type} className="flex justify-between">
                              <span className="capitalize">{type.replace('_', ' ')}</span>
                              <span className="font-medium text-blue-600">{percentage}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Calendar Back-Solving */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                Calendar Back-Solving Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Posting Requirements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Posts Needed:</span>
                      <span className="font-medium">{strategyData.calendar_back_solving.total_posts_needed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Posts Per Week:</span>
                      <span className="font-medium">{strategyData.calendar_back_solving.posts_per_week}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timeline:</span>
                      <span className="font-medium">90 days</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Content Themes</h4>
                  <div className="space-y-1 text-sm">
                    {strategyData.calendar_back_solving.content_themes.map((theme, idx) => (
                      <div key={idx} className="text-gray-600">{theme}</div>
                    ))}
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
                {Object.entries(strategyData.agent_contributions).map(([agentId, contribution]) => (
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
            onClick={handleApplyGrowthStrategy}
            disabled={selectedGoals.length === 0 || isApplying}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Applying Strategy...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Apply {selectedGoals.length} Growth Strategy
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GrowthGoalsModal;
