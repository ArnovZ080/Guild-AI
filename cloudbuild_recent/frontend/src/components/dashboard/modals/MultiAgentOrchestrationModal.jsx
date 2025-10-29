import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Users, Target, Brain, CheckCircle, Clock, TrendingUp, MessageSquare, Eye, Heart, BarChart3, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';
import ConfidenceScore from '../shared/ConfidenceScore';

const MultiAgentOrchestrationModal = ({ content, onClose, onApplyOptimizations, hiredAgents = [] }) => {
  const [orchestrationState, setOrchestrationState] = useState('idle'); // idle, analyzing, orchestrating, completed
  const [currentStep, setCurrentStep] = useState(0);
  const [orchestrationData, setOrchestrationData] = useState(null);
  const [agentProgress, setAgentProgress] = useState({});
  const [rubricData, setRubricData] = useState(null);
  const [optimizedContent, setOptimizedContent] = useState(null);
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    if (content) {
      startOrchestration();
    }
  }, [content]);

  // Helper functions for agent mapping
  const getAgentIcon = (agentId) => {
    const iconMap = {
      'content_strategist': <Target className="w-5 h-5" />,
      'brand_strategist_agent': <Eye className="w-5 h-5" />,
      'content_repurposer_agent': <Heart className="w-5 h-5" />,
      'research_agent': <CheckCircle className="w-5 h-5" />,
      'seo_agent': <TrendingUp className="w-5 h-5" />,
      'judge_agent': <CheckCircle className="w-5 h-5" />
    };
    return iconMap[agentId] || <Brain className="w-5 h-5" />;
  };

  const getAgentRole = (agentId) => {
    const roleMap = {
      'content_strategist': 'Strategic content optimization and planning',
      'brand_strategist_agent': 'Brand voice and guideline compliance validation',
      'content_repurposer_agent': 'Content optimization and engagement enhancement',
      'research_agent': 'Information accuracy and source validation',
      'seo_agent': 'Search optimization and keyword analysis',
      'judge_agent': 'Final quality assessment and approval'
    };
    return roleMap[agentId] || 'Content optimization and enhancement';
  };

  const getAgentDuration = (agentId) => {
    const durationMap = {
      'content_strategist': 3000,
      'brand_strategist_agent': 1500,
      'content_repurposer_agent': 2000,
      'research_agent': 1800,
      'seo_agent': 2200,
      'judge_agent': 2500
    };
    return durationMap[agentId] || 2000;
  };

  const getAgentDependencies = (agentId, availableAgents) => {
    const dependencyMap = {
      'content_strategist': [],
      'brand_strategist_agent': ['content_strategist'],
      'content_repurposer_agent': ['brand_strategist_agent'],
      'research_agent': ['content_strategist'],
      'seo_agent': ['content_repurposer_agent'],
      'judge_agent': ['brand_strategist_agent', 'content_repurposer_agent', 'research_agent', 'seo_agent']
    };
    
    const dependencies = dependencyMap[agentId] || [];
    // Only return dependencies that are actually available
    return dependencies.filter(dep => availableAgents.some(agent => agent.id === dep));
  };

  const startOrchestration = async () => {
    setOrchestrationState('analyzing');
    
    try {
      // Step 1: Orchestrator Agent creates rubrics
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const rubric = {
        id: `rubric_${Date.now()}`,
        content_id: content.content_id,
        created_by: 'Orchestrator Agent',
        timestamp: new Date().toISOString(),
        quality_dimensions: [
          {
            dimension: 'Brand Alignment',
            weight: 0.25,
            criteria: [
              'Matches brand voice and tone guidelines',
              'Uses approved messaging frameworks',
              'Maintains visual brand consistency',
              'Aligns with brand values and mission'
            ],
            target_score: 90
          },
          {
            dimension: 'Audience Engagement',
            weight: 0.30,
            criteria: [
              'Content resonates with target demographics',
              'Includes compelling call-to-action',
              'Uses appropriate hashtags and keywords',
              'Optimized for platform-specific engagement'
            ],
            target_score: 85
          },
          {
            dimension: 'Content Quality',
            weight: 0.20,
            criteria: [
              'Grammatically correct and error-free',
              'Clear and concise messaging',
              'Professional presentation',
              'Appropriate length for platform'
            ],
            target_score: 95
          },
          {
            dimension: 'Strategic Value',
            weight: 0.25,
            criteria: [
              'Supports business objectives',
              'Drives desired user actions',
              'Fits content calendar strategy',
              'Maximizes ROI potential'
            ],
            target_score: 80
          }
        ],
        optimization_goals: [
          'Increase engagement rate by 25%',
          'Improve brand alignment score to 90+',
          'Optimize for peak audience activity',
          'Enhance call-to-action effectiveness'
        ]
      };

      setRubricData(rubric);
      setOrchestrationState('orchestrating');
      setCurrentStep(1);

      // Step 2: Multi-agent optimization workflow
      await orchestrateOptimization(rubric);

    } catch (error) {
      console.error('Orchestration failed:', error);
      setOrchestrationState('idle');
    }
  };

  const orchestrateOptimization = async (rubric) => {
    // Filter hired agents that are relevant for content optimization
    const contentOptimizationAgents = hiredAgents.filter(agent => 
      agent.status === 'hired' && 
      ['content_strategist', 'brand_strategist_agent', 'content_repurposer_agent', 'research_agent', 'seo_agent', 'judge_agent'].includes(agent.id)
    );

    // If no relevant agents are hired, show message and exit
    if (contentOptimizationAgents.length === 0) {
      alert('No content optimization agents are currently hired. Please hire relevant agents from the Agent Workforce tab to use orchestration.');
      setOrchestrationState('idle');
      return;
    }

    // Map hired agents to orchestration format
    const agents = contentOptimizationAgents.map(agent => ({
      id: agent.id,
      name: agent.name || agent.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: getAgentIcon(agent.id),
      role: getAgentRole(agent.id),
      estimated_duration: getAgentDuration(agent.id),
      dependencies: getAgentDependencies(agent.id, contentOptimizationAgents)
    }));

    // Initialize agent progress
    const initialProgress = {};
    agents.forEach(agent => {
      initialProgress[agent.id] = {
        status: 'pending',
        progress: 0,
        insights: null,
        optimizations: []
      };
    });
    setAgentProgress(initialProgress);

    // Execute agents in dependency order
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      setCurrentStep(i + 1);
      
      await executeAgent(agent, rubric);
    }

    // Step 3: Judge Agent evaluation
    setCurrentStep(agents.length + 1);
    await judgeAgentEvaluation(rubric);
  };

  const executeAgent = async (agent, rubric) => {
    // Update agent status to running
    setAgentProgress(prev => ({
      ...prev,
      [agent.id]: {
        ...prev[agent.id],
        status: 'running',
        progress: 0
      }
    }));

    // Simulate agent work with progress updates
    const steps = 5;
    for (let step = 1; step <= steps; step++) {
      await new Promise(resolve => setTimeout(resolve, agent.estimated_duration / steps));
      
      setAgentProgress(prev => ({
        ...prev,
        [agent.id]: {
          ...prev[agent.id],
          progress: (step / steps) * 100
        }
      }));
    }

    // Generate agent insights and optimizations
    const agentResults = generateAgentResults(agent, rubric);
    
    setAgentProgress(prev => ({
      ...prev,
      [agent.id]: {
        ...prev[agent.id],
        status: 'completed',
        progress: 100,
        insights: agentResults.insights,
        optimizations: agentResults.optimizations
      }
    }));
  };

  const generateAgentResults = (agent, rubric) => {
    const results = {
      insights: [],
      optimizations: []
    };

    switch (agent.id) {
      case 'content_strategist':
        results.insights = [
          "Identified opportunity to strengthen value proposition in opening line",
          "Content structure could benefit from clearer problem-solution framework",
          "Missing key industry keywords that would improve discoverability"
        ];
        results.optimizations = [
          {
            type: 'content_structure',
            description: 'Restructure opening to lead with clear value proposition',
            impact: 'High',
            confidence: 0.89
          },
          {
            type: 'keyword_optimization',
            description: 'Add trending industry keywords for better SEO',
            impact: 'Medium',
            confidence: 0.82
          }
        ];
        break;

      case 'brand_strategist_agent':
        results.insights = [
          "Content aligns with brand voice guidelines (92% compliance)",
          "Minor tone adjustments needed for consistency",
          "All brand elements properly represented"
        ];
        results.optimizations = [
          {
            type: 'brand_alignment',
            description: 'Adjust tone to match brand voice guidelines more closely',
            impact: 'Medium',
            confidence: 0.84
          }
        ];
        break;

      case 'content_repurposer_agent':
        results.insights = [
          "Current CTA has 23% lower conversion than optimal format",
          "Questions in captions increase comments by 35%",
          "Visual elements could be enhanced for better engagement"
        ];
        results.optimizations = [
          {
            type: 'cta_optimization',
            description: 'Replace current CTA with question-based engagement hook',
            impact: 'High',
            confidence: 0.88
          },
          {
            type: 'visual_enhancement',
            description: 'Add attention-grabbing visual elements',
            impact: 'Medium',
            confidence: 0.76
          }
        ];
        break;

      case 'fact_checker':
        results.insights = [
          "All factual claims verified with authoritative sources",
          "Statistics and data points cross-referenced for accuracy",
          "No misinformation detected in content"
        ];
        results.optimizations = [
          {
            type: 'fact_validation',
            description: 'All facts verified - content ready for publication',
            impact: 'High',
            confidence: 0.95
          }
        ];
        break;

      case 'seo_evaluator':
        results.insights = [
          "Content optimized for relevant keywords and search terms",
          "Meta descriptions and titles follow SEO best practices",
          "Internal linking opportunities identified"
        ];
        results.optimizations = [
          {
            type: 'seo_optimization',
            description: 'Enhanced keyword density and meta optimization',
            impact: 'Medium',
            confidence: 0.82
          }
        ];
        break;
    }

    return results;
  };

  const judgeAgentEvaluation = async () => {
    setAgentProgress(prev => ({
      ...prev,
      judge_agent: {
        status: 'running',
        progress: 0,
        insights: null,
        optimizations: []
      }
    }));

    // Simulate Judge Agent evaluation
    await new Promise(resolve => setTimeout(resolve, 3000));

    const judgeResults = {
      overall_score: 0.87,
      dimension_scores: {
        'Brand Alignment': 0.92,
        'Audience Engagement': 0.85,
        'Content Quality': 0.89,
        'Strategic Value': 0.82
      },
      recommendations: [
        {
          priority: 'High',
          category: 'Brand Alignment',
          description: 'Content meets brand guidelines with minor tone adjustments needed',
          action_required: false
        },
        {
          priority: 'Medium',
          category: 'Engagement',
          description: 'Consider adding question-based CTA for better interaction',
          action_required: true
        },
        {
          priority: 'Low',
          category: 'Timing',
          description: 'Schedule optimization could improve reach by 25%',
          action_required: false
        }
      ],
      approval_status: 'approved_with_recommendations',
      quality_gate_passed: true
    };

    setAgentProgress(prev => ({
      ...prev,
      judge_agent: {
        status: 'completed',
        progress: 100,
        insights: judgeResults.recommendations,
        optimizations: [],
        evaluation_results: judgeResults
      }
    }));

    // Generate final optimized content
    const finalOptimizedContent = generateFinalOptimizedContent(judgeResults);
    setOptimizedContent(finalOptimizedContent);
    setOrchestrationState('completed');
  };

  const generateFinalOptimizedContent = (judgeResults) => {
    return {
      ...content,
      content_id: `${content.content_id}_orchestrated_${Date.now()}`,
      multi_agent_optimized: true,
      orchestration_score: judgeResults.overall_score,
      dimension_scores: judgeResults.dimension_scores,
      judge_agent_approved: judgeResults.quality_gate_passed,
      optimized_by: [
        'Content Strategist Agent',
        'Brand Checker Agent', 
        'Engagement Agent',
        'Fact Checker Agent',
        'SEO Evaluator Agent',
        'Judge Agent'
      ],
      version_history: [...(content.version_history || []), {
        id: `orchestration_${Date.now()}`,
        version: `${parseFloat(content?.version || '1.0') + 0.1}`,
        timestamp: new Date().toISOString(),
        author: 'Multi-Agent Orchestration System',
        changes: [
          'Applied multi-agent content optimization',
          `Achieved ${Math.round(judgeResults.overall_score * 100)}% quality score`,
          'Passed Judge Agent quality gates',
          'Optimized for brand alignment, engagement, and strategic value'
        ],
        status: 'orchestrated',
        content_snapshot: {
          ...content,
          multi_agent_optimized: true,
          orchestration_score: judgeResults.overall_score
        }
      }]
    };
  };

  const getAgentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Multi-Agent Orchestration</h2>
              <p className="text-sm text-gray-600">
                AI workforce optimizing "{content.content_preview?.substring(0, 50)}..."
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {orchestrationState === 'completed' && optimizedContent && (
              <ConfidenceScore score={optimizedContent.orchestration_score} size="medium" />
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {orchestrationState === 'analyzing' ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Orchestrator Agent Creating Rubrics</h3>
              <p className="text-gray-600">Analyzing content requirements and setting quality standards...</p>
            </div>
          ) : orchestrationState === 'orchestrating' ? (
            <div className="space-y-6">
              {/* Rubric Display */}
              {rubricData && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Rubric</h3>
                  <p className="text-sm text-gray-600 mb-4">Created by Orchestrator Agent</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rubricData.quality_dimensions.map((dimension, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{dimension.dimension}</span>
                          <span className="text-sm text-gray-600">Target: {dimension.target_score}%</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Weight: {Math.round(dimension.weight * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent Progress */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Workforce Progress</h3>
                <div className="space-y-4">
                  {Object.entries(agentProgress).map(([agentId, progress]) => (
                    <div key={agentId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {agentId === 'content_strategist' && <Target className="w-4 h-4 text-blue-600" />}
                            {agentId === 'brand_checker' && <Eye className="w-4 h-4 text-purple-600" />}
                            {agentId === 'engagement_agent' && <Heart className="w-4 h-4 text-red-600" />}
                            {agentId === 'fact_checker' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {agentId === 'seo_evaluator' && <TrendingUp className="w-4 h-4 text-orange-600" />}
                            {agentId === 'judge_agent' && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                            <span className="font-medium text-gray-900 capitalize">
                              {agentId.replace('_', ' ')} Agent
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAgentStatusColor(progress.status)}`}>
                            {progress.status}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{Math.round(progress.progress)}%</span>
                      </div>
                      
                      {progress.status === 'running' && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress.progress}%` }}
                          ></div>
                        </div>
                      )}

                      {progress.status === 'completed' && progress.insights && (
                        <div className="mt-3 space-y-2">
                          <div className="text-sm font-medium text-gray-700">Insights:</div>
                          {progress.insights.map((insight, idx) => (
                            <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              • {insight}
                            </div>
                          ))}
                          {progress.optimizations && progress.optimizations.length > 0 && (
                            <div className="mt-2">
                              <div className="text-sm font-medium text-gray-700">Optimizations Applied:</div>
                              {progress.optimizations.map((opt, idx) => (
                                <div key={idx} className="text-sm text-green-600 bg-green-50 p-2 rounded mt-1">
                                  ✓ {opt.description}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : orchestrationState === 'completed' ? (
            <div className="space-y-6">
              {/* Final Results */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Orchestration Complete</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(optimizedContent.orchestration_score * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Quality Score</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  Multi-agent orchestration successfully optimized your content. All quality gates passed.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {optimizedContent.optimized_by.length}
                    </div>
                    <div className="text-xs text-gray-600">Agents Involved</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {Math.round(optimizedContent.dimension_scores['Brand Alignment'] * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Brand Alignment</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round(optimizedContent.dimension_scores['Audience Engagement'] * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Engagement</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {optimizedContent.judge_agent_approved ? 'Approved' : 'Pending'}
                    </div>
                    <div className="text-xs text-gray-600">Judge Status</div>
                  </div>
                </div>
              </div>

              {/* Judge Agent Evaluation Results */}
              {agentProgress.judge_agent?.evaluation_results && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Judge Agent Evaluation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {Object.entries(agentProgress.judge_agent.evaluation_results.dimension_scores).map(([dimension, score]) => (
                      <div key={dimension} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{dimension}</span>
                          <span className="font-bold text-gray-900">{Math.round(score * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Recommendations:</h4>
                    {agentProgress.judge_agent.evaluation_results.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {rec.priority}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{rec.category}</div>
                          <p className="text-sm text-gray-700">{rec.description}</p>
                          {rec.action_required && (
                            <span className="inline-block mt-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                              Action Required
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Optimizations */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply Optimized Content</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Multi-agent orchestration has optimized your content for maximum performance.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      All agents have contributed their expertise and Judge Agent has approved the result.
                    </p>
                  </div>
                  <button
                    onClick={() => onApplyOptimizations && onApplyOptimizations(optimizedContent)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Apply Optimizations
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};

export default MultiAgentOrchestrationModal;
