import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Target, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Brain,
  Clock,
  ArrowRight,
  Lightbulb,
  Activity,
  Play,
  Pause,
  RotateCcw,
  LineChart,
  PieChart,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  Settings,
  GitBranch
} from 'lucide-react';
import ConfidenceScore from '../shared/ConfidenceScore';

const ScenarioSimulationModal = ({ content, onClose, onApplyScenario, hiredAgents = [] }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

  useEffect(() => {
    if (content) {
      generateScenarios();
    }
  }, [content]);

  const generateScenarios = async () => {
    setIsSimulating(true);
    
    // Simulate AI scenario generation and modeling
    await new Promise(resolve => setTimeout(resolve, 4000));

    const mockSimulationData = {
      analysis_summary: `AI has generated comprehensive "what-if" scenarios to model different content strategies and their potential outcomes across multiple dimensions.`,
      
      current_baseline: {
        posting_frequency: '5 posts/week',
        platform_distribution: {
          linkedin: 40,
          instagram: 30,
          twitter: 20,
          facebook: 10
        },
        content_mix: {
          educational: 40,
          promotional: 25,
          entertaining: 20,
          behind_scenes: 15
        },
        current_engagement: 6.8,
        current_reach: 3400,
        current_conversion: 3.8,
        monthly_revenue: 12400
      },

      scenario_models: [
        {
          id: 'scenario_1',
          name: 'Aggressive Growth Strategy',
          description: 'Double Instagram posting and halve LinkedIn to capture younger audience',
          changes: {
            posting_frequency: '8 posts/week',
            platform_distribution: {
              linkedin: 20,
              instagram: 60,
              twitter: 15,
              facebook: 5
            },
            content_mix: {
              entertaining: 45,
              educational: 25,
              behind_scenes: 20,
              promotional: 10
            }
          },
          predicted_outcomes: {
            engagement_rate: 8.2,
            reach: 4200,
            conversion_rate: 2.9,
            monthly_revenue: 15200,
            audience_growth: '+35%',
            brand_awareness: '+28%'
          },
          risks: [
            'Potential loss of professional audience',
            'Increased content creation costs',
            'Platform algorithm dependency'
          ],
          opportunities: [
            'Access to younger demographic',
            'Higher viral potential',
            'Better brand storytelling'
          ],
          confidence: 0.87,
          timeline: '90 days',
          difficulty: 'Medium',
          status: 'pending'
        },
        {
          id: 'scenario_2',
          name: 'Professional Focus Strategy',
          description: 'Triple LinkedIn content and reduce social media to focus on B2B growth',
          changes: {
            posting_frequency: '6 posts/week',
            platform_distribution: {
              linkedin: 80,
              instagram: 10,
              twitter: 8,
              facebook: 2
            },
            content_mix: {
              educational: 60,
              promotional: 25,
              behind_scenes: 10,
              entertaining: 5
            }
          },
          predicted_outcomes: {
            engagement_rate: 7.4,
            reach: 2800,
            conversion_rate: 5.8,
            monthly_revenue: 18700,
            audience_growth: '+22%',
            brand_awareness: '+15%'
          },
          risks: [
            'Reduced brand reach',
            'Limited audience diversity',
            'Platform concentration risk'
          ],
          opportunities: [
            'Higher quality leads',
            'Better conversion rates',
            'Professional credibility'
          ],
          confidence: 0.91,
          timeline: '60 days',
          difficulty: 'Low',
          status: 'pending'
        },
        {
          id: 'scenario_3',
          name: 'Content Diversification Strategy',
          description: 'Equal distribution across all platforms with varied content types',
          changes: {
            posting_frequency: '10 posts/week',
            platform_distribution: {
              linkedin: 25,
              instagram: 25,
              twitter: 25,
              facebook: 25
            },
            content_mix: {
              educational: 30,
              entertaining: 30,
              promotional: 20,
              behind_scenes: 20
            }
          },
          predicted_outcomes: {
            engagement_rate: 7.8,
            reach: 5100,
            conversion_rate: 4.1,
            monthly_revenue: 16800,
            audience_growth: '+28%',
            brand_awareness: '+35%'
          },
          risks: [
            'Resource intensive',
            'Quality control challenges',
            'Platform management complexity'
          ],
          opportunities: [
            'Maximum reach potential',
            'Audience diversification',
            'Risk distribution'
          ],
          confidence: 0.84,
          timeline: '120 days',
          difficulty: 'High',
          status: 'pending'
        },
        {
          id: 'scenario_4',
          name: 'Video-First Strategy',
          description: 'Focus on video content across all platforms for maximum engagement',
          changes: {
            posting_frequency: '7 posts/week',
            platform_distribution: {
              linkedin: 30,
              instagram: 35,
              twitter: 20,
              facebook: 15
            },
            content_mix: {
              video_content: 70,
              educational: 15,
              behind_scenes: 10,
              promotional: 5
            }
          },
          predicted_outcomes: {
            engagement_rate: 9.1,
            reach: 4800,
            conversion_rate: 4.6,
            monthly_revenue: 19300,
            audience_growth: '+42%',
            brand_awareness: '+38%'
          },
          risks: [
            'High production costs',
            'Technical requirements',
            'Content creation time'
          ],
          opportunities: [
            'Maximum engagement',
            'Viral potential',
            'Modern content format'
          ],
          confidence: 0.89,
          timeline: '75 days',
          difficulty: 'High',
          status: 'pending'
        }
      ],

      simulation_insights: {
        best_performing_scenario: 'Video-First Strategy',
        highest_revenue_potential: 19300,
        lowest_risk_scenario: 'Professional Focus Strategy',
        fastest_implementation: 'Professional Focus Strategy (60 days)',
        highest_growth_potential: '+42% (Video-First)',
        most_balanced_approach: 'Content Diversification Strategy'
      },

      comparative_analysis: {
        revenue_comparison: {
          current: 12400,
          aggressive_growth: 15200,
          professional_focus: 18700,
          content_diversification: 16800,
          video_first: 19300
        },
        engagement_comparison: {
          current: 6.8,
          aggressive_growth: 8.2,
          professional_focus: 7.4,
          content_diversification: 7.8,
          video_first: 9.1
        },
        risk_assessment: {
          aggressive_growth: 0.65,
          professional_focus: 0.85,
          content_diversification: 0.70,
          video_first: 0.75
        }
      },

      implementation_roadmaps: {
        aggressive_growth: [
          { week: 1, task: 'Increase Instagram content production', priority: 'High' },
          { week: 2, task: 'Develop entertaining content templates', priority: 'High' },
          { week: 3, task: 'Reduce LinkedIn posting frequency', priority: 'Medium' },
          { week: 4, task: 'Monitor engagement metrics and adjust', priority: 'High' }
        ],
        professional_focus: [
          { week: 1, task: 'Create educational content bank', priority: 'High' },
          { week: 2, task: 'Increase LinkedIn posting to daily', priority: 'High' },
          { week: 3, task: 'Develop B2B content calendar', priority: 'Medium' },
          { week: 4, task: 'Optimize for professional audience', priority: 'High' }
        ],
        content_diversification: [
          { week: 1, task: 'Audit all platform content strategies', priority: 'High' },
          { week: 2, task: 'Create platform-specific content plans', priority: 'High' },
          { week: 3, task: 'Implement content management system', priority: 'Medium' },
          { week: 4, task: 'Launch diversified posting schedule', priority: 'High' }
        ],
        video_first: [
          { week: 1, task: 'Set up video production workflow', priority: 'High' },
          { week: 2, task: 'Create video content templates', priority: 'High' },
          { week: 3, task: 'Launch video content across platforms', priority: 'High' },
          { week: 4, task: 'Optimize video performance metrics', priority: 'High' }
        ]
      },

      agent_contributions: {
        strategy_agent: {
          confidence: 0.92,
          insight: 'Identified optimal scenario combinations for maximum growth potential',
          contribution: 'Developed comprehensive scenario modeling with risk-reward analysis'
        },
        analytics_agent: {
          confidence: 0.89,
          insight: 'Historical data shows video content has 3.2x higher engagement rates',
          contribution: 'Provided data-driven insights for scenario outcome predictions'
        },
        content_strategist: {
          confidence: 0.87,
          insight: 'Content diversification reduces risk while maintaining growth potential',
          contribution: 'Designed implementation roadmaps for each scenario strategy'
        }
      },

      overall_confidence: 0.89,
      simulation_phase: 'Advanced - Comprehensive scenario modeling complete',
      next_recommendation: 'Implement highest-potential scenario with monitoring'
    };

    setSimulationData(mockSimulationData);
    setIsSimulating(false);
  };

  const handleToggleScenario = (scenarioId) => {
    setSelectedScenarios(prev =>
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  const handleApplyScenario = async () => {
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const applied = simulationData.scenario_models.filter(scenario => 
      selectedScenarios.includes(scenario.id)
    );

    // Create optimized content based on selected scenario
    const optimizedContent = {
      ...content,
      scenario_optimized: true,
      applied_scenarios: applied.map(s => s.name),
      predicted_outcomes: applied[0]?.predicted_outcomes,
      implementation_timeline: applied[0]?.timeline,
      scenario_confidence: simulationData.overall_confidence,
      version_history: [...(content.version_history || []), {
        id: `scenario_simulation_${Date.now()}`,
        version: `${parseFloat(content?.version || '1.0') + 0.1}`,
        timestamp: new Date().toISOString(),
        author: 'AI Scenario Simulation System',
        changes: [`Applied scenario optimization: ${applied.map(s => s.name).join(', ')}`],
        status: 'scenario_optimized',
        content_snapshot: { ...content, scenario_optimized: true }
      }]
    };

    onApplyScenario(optimizedContent, applied);
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

  const getScenarioIcon = (scenarioId) => {
    switch (scenarioId) {
      case 'scenario_1': return <TrendingUp className="w-4 h-4" />;
      case 'scenario_2': return <Target className="w-4 h-4" />;
      case 'scenario_3': return <GitBranch className="w-4 h-4" />;
      case 'scenario_4': return <Play className="w-4 h-4" />;
      default: return <Calculator className="w-4 h-4" />;
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
            <Calculator className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Scenario Simulation</h2>
              <p className="text-sm text-gray-600">
                AI-powered "what-if" modeling for strategic content decisions
              </p>
            </div>
          </div>
          {simulationData && (
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <ConfidenceScore score={simulationData.overall_confidence} size="medium" />
            </div>
          )}
        </div>

        {isSimulating ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Running Scenario Simulations...</h3>
            <p className="text-gray-600 mb-6">
              AI agents are modeling different content strategies and predicting their outcomes.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analyzing current performance baseline</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Generating "what-if" scenario models</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Predicting outcomes and trade-offs</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Optimizing implementation roadmaps</span>
              </div>
            </div>
          </div>
        ) : simulationData ? (
          <div className="space-y-6">
            {/* Current Baseline */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                Current Performance Baseline
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-gray-900">{simulationData.current_baseline.posting_frequency}</div>
                  <div className="text-sm text-gray-600">Posting Frequency</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">{simulationData.current_baseline.current_engagement}%</div>
                  <div className="text-sm text-gray-600">Engagement Rate</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">{simulationData.current_baseline.current_reach.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Average Reach</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">${simulationData.current_baseline.monthly_revenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Monthly Revenue</div>
                </div>
              </div>
            </div>

            {/* Scenario Models */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                "What-If" Scenario Models
              </h3>
              <div className="space-y-4">
                {simulationData.scenario_models.map((scenario) => (
                  <label key={scenario.id} className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedScenarios.includes(scenario.id) 
                      ? 'bg-purple-50 border-purple-400 shadow-md' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedScenarios.includes(scenario.id)}
                      onChange={() => handleToggleScenario(scenario.id)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getScenarioIcon(scenario.id)}
                          <span className="font-medium text-gray-900">{scenario.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                            {scenario.difficulty}
                          </span>
                          <ConfidenceScore score={scenario.confidence} size="small" showDetails={false} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-gray-900 mb-2">Predicted Outcomes</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Engagement:</span>
                              <span className="font-medium text-blue-600">{scenario.predicted_outcomes.engagement_rate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Reach:</span>
                              <span className="font-medium text-green-600">{scenario.predicted_outcomes.reach.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Revenue:</span>
                              <span className="font-medium text-purple-600">${scenario.predicted_outcomes.monthly_revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Growth:</span>
                              <span className="font-medium text-orange-600">{scenario.predicted_outcomes.audience_growth}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <h4 className="font-medium text-gray-900 mb-2">Strategy Changes</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Frequency:</span>
                              <span className="font-medium">{scenario.changes.posting_frequency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Timeline:</span>
                              <span className="font-medium">{scenario.timeline}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className="font-medium text-gray-600">{scenario.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-red-50 p-3 rounded border border-red-200">
                          <h4 className="font-medium text-red-800 mb-2">Risks</h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            {scenario.risks.map((risk, idx) => (
                              <li key={idx} className="flex items-start">
                                <AlertTriangle className="w-3 h-3 mt-0.5 mr-1 flex-shrink-0" />
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-green-50 p-3 rounded border border-green-200">
                          <h4 className="font-medium text-green-800 mb-2">Opportunities</h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            {scenario.opportunities.map((opportunity, idx) => (
                              <li key={idx} className="flex items-start">
                                <Lightbulb className="w-3 h-3 mt-0.5 mr-1 flex-shrink-0" />
                                {opportunity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Comparative Analysis */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <LineChart className="w-5 h-5 mr-2 text-green-600" />
                Comparative Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Revenue Comparison</h4>
                  <div className="space-y-2">
                    {Object.entries(simulationData.comparative_analysis.revenue_comparison).map(([scenario, revenue]) => (
                      <div key={scenario} className="flex items-center justify-between">
                        <span className="text-gray-600 capitalize">{scenario.replace('_', ' ')}:</span>
                        <span className={`font-medium ${
                          scenario === 'current' ? 'text-gray-600' : 
                          revenue > simulationData.comparative_analysis.revenue_comparison.current ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${revenue.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Engagement Comparison</h4>
                  <div className="space-y-2">
                    {Object.entries(simulationData.comparative_analysis.engagement_comparison).map(([scenario, engagement]) => (
                      <div key={scenario} className="flex items-center justify-between">
                        <span className="text-gray-600 capitalize">{scenario.replace('_', ' ')}:</span>
                        <span className={`font-medium ${
                          scenario === 'current' ? 'text-gray-600' : 
                          engagement > simulationData.comparative_analysis.engagement_comparison.current ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {engagement}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation Insights */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                AI Simulation Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-800 mb-1">Best Performing</div>
                  <div className="text-sm text-blue-700">{simulationData.simulation_insights.best_performing_scenario}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="font-medium text-green-800 mb-1">Highest Revenue</div>
                  <div className="text-sm text-green-700">${simulationData.simulation_insights.highest_revenue_potential.toLocaleString()}</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="font-medium text-yellow-800 mb-1">Lowest Risk</div>
                  <div className="text-sm text-yellow-700">{simulationData.simulation_insights.lowest_risk_scenario}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="font-medium text-purple-800 mb-1">Fastest Implementation</div>
                  <div className="text-sm text-purple-700">{simulationData.simulation_insights.fastest_implementation}</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="font-medium text-orange-800 mb-1">Highest Growth</div>
                  <div className="text-sm text-orange-700">{simulationData.simulation_insights.highest_growth_potential}</div>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                  <div className="font-medium text-teal-800 mb-1">Most Balanced</div>
                  <div className="text-sm text-teal-700">{simulationData.simulation_insights.most_balanced_approach}</div>
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
                {Object.entries(simulationData.agent_contributions).map(([agentId, contribution]) => (
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
            onClick={handleApplyScenario}
            disabled={selectedScenarios.length === 0 || isApplying}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Applying Scenario...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Apply {selectedScenarios.length} Scenario
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ScenarioSimulationModal;
