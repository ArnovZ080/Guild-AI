import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
import { 
  TrendingUp,
  Lightbulb,
  Target,
  DollarSign,
  Users,
  MessageSquare,
  Brain,
  Zap,
  Search,
  Filter,
  CheckCircle,
  X,
  ArrowRight,
  Clock,
  Star,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Globe,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations.fixed';
import { useAgentCommunication } from '../../contexts/AgentCommunicationContext.simple';
import AgentWorkflowVisualizer from '../agents/AgentWorkflowVisualizer';

const GrowthOpportunitiesView = ({ onNavigateToChat, onNavigateToDashboard }) => {
  const { currentMode, getModeColors } = useAdaptiveMode();
  const { triggerCelebration } = useCelebrations();
  const { sendTaskToAgent, agentMessages, pendingResponses } = useAgentCommunication();
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [growthChat, setGrowthChat] = useState([]);
  const [growthInput, setGrowthInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'high_impact', 'quick_wins', 'strategic'
  const [agentWorkflow, setAgentWorkflow] = useState([]);
  const [showWorkflow, setShowWorkflow] = useState(false);

  const adaptiveClasses = getModeColors(currentMode);

  // Real agent integration for growth opportunities
  const handleOpportunityAnalysis = async (opportunity) => {
    try {
      setShowWorkflow(true);
      
      // Step 1: Research Agent analyzes the opportunity
      await sendTaskToAgent('research_agent', {
        type: 'opportunity_research',
        opportunity: opportunity,
        user_id: 'current_user'
      });

      setAgentWorkflow(prev => [...prev, {
        id: Date.now(),
        step: 'opportunity_research',
        agent: 'Research Agent',
        status: 'processing',
        timestamp: new Date(),
        data: opportunity
      }]);

      // Step 2: Strategy Agent develops implementation plan
      await sendTaskToAgent('strategy_agent', {
        type: 'opportunity_strategy',
        opportunity: opportunity,
        previous_agent: 'research_agent',
        user_id: 'current_user'
      });

      setAgentWorkflow(prev => [...prev, {
        id: Date.now() + 1,
        step: 'opportunity_strategy',
        agent: 'Strategy Agent',
        status: 'processing',
        timestamp: new Date(),
        depends_on: 'opportunity_research'
      }]);

      // Step 3: Market Trends Agent validates market conditions
      await sendTaskToAgent('market_trends_agent', {
        type: 'market_validation',
        opportunity: opportunity,
        previous_agents: ['research_agent', 'strategy_agent'],
        user_id: 'current_user'
      });

      setAgentWorkflow(prev => [...prev, {
        id: Date.now() + 2,
        step: 'market_validation',
        agent: 'Market Trends Agent',
        status: 'processing',
        timestamp: new Date(),
        depends_on: 'opportunity_strategy'
      }]);

      // Step 4: Orchestrator creates implementation plan
      await sendTaskToAgent('orchestrator', {
        type: 'opportunity_implementation',
        opportunity: opportunity,
        previous_agents: ['research_agent', 'strategy_agent', 'market_trends_agent'],
        user_id: 'current_user'
      });

      setAgentWorkflow(prev => [...prev, {
        id: Date.now() + 3,
        step: 'opportunity_implementation',
        agent: 'Orchestrator Agent',
        status: 'processing',
        timestamp: new Date(),
        depends_on: 'market_validation'
      }]);

    } catch (error) {
      console.error('Error in opportunity workflow:', error);
    }
  };

  const handleAcceptOpportunity = async (opportunity) => {
    try {
      setShowWorkflow(true);
      
      // Accept opportunity and start implementation
      await sendTaskToAgent('orchestrator', {
        type: 'accept_opportunity',
        opportunity: opportunity,
        action: 'accept',
        user_id: 'current_user'
      });

      setAgentWorkflow(prev => [...prev, {
        id: Date.now(),
        step: 'accept_opportunity',
        agent: 'Orchestrator Agent',
        status: 'processing',
        timestamp: new Date(),
        data: { opportunity, action: 'accept' }
      }]);

    } catch (error) {
      console.error('Error accepting opportunity:', error);
    }
  };

  const handleDeclineOpportunity = async (opportunity) => {
    try {
      // Decline opportunity and provide feedback
      await sendTaskToAgent('strategy_agent', {
        type: 'decline_opportunity',
        opportunity: opportunity,
        action: 'decline',
        user_id: 'current_user'
      });

    } catch (error) {
      console.error('Error declining opportunity:', error);
    }
  };

  // Mock opportunities data
  useEffect(() => {
    const mockOpportunities = [
      {
        id: '1',
        title: 'Expand to European Markets',
        description: 'Research indicates strong demand for your services in European markets, particularly Germany and France.',
        category: 'expansion',
        priority: 'high',
        impact: 'high',
        effort: 'medium',
        timeframe: '3-6 months',
        potentialRevenue: 150000,
        confidence: 85,
        agents: [
          {
            id: 'market_research_agent',
            name: 'Market Research Agent',
            role: 'Market Analysis',
            status: 'researching',
            findings: 'Identified 3 key European markets with low competition and high demand'
          },
          {
            id: 'strategy_agent',
            name: 'Strategy Agent',
            role: 'Strategic Planning',
            status: 'planning',
            findings: 'Developed entry strategy focusing on local partnerships'
          }
        ],
        research: {
          marketSize: '€2.5B European market opportunity',
          competition: 'Low competition in target segments',
          barriers: 'Regulatory compliance and localization requirements',
          timeline: '3-6 months for market entry',
          resources: 'Requires 2-3 additional team members'
        },
        strategy: {
          approach: 'Partnership-first entry strategy',
          phases: [
            'Market validation (Month 1)',
            'Partnership development (Months 2-3)',
            'Localized launch (Months 4-6)'
          ],
          risks: ['Regulatory compliance', 'Cultural adaptation', 'Competition response'],
          mitigations: ['Legal consultation', 'Local market research', 'Competitive monitoring']
        },
        status: 'researching',
        dateIdentified: new Date(2024, 11, 20),
        lastUpdated: new Date(2024, 11, 22)
      },
      {
        id: '2',
        title: 'AI-Powered Customer Service Automation',
        description: 'Implement advanced AI chatbots to handle 80% of customer inquiries automatically.',
        category: 'automation',
        priority: 'high',
        impact: 'high',
        effort: 'low',
        timeframe: '1-2 months',
        potentialRevenue: 75000,
        confidence: 95,
        agents: [
          {
            id: 'automation_agent',
            name: 'Automation Agent',
            role: 'Process Automation',
            status: 'analyzing',
            findings: 'Identified 12 common inquiry types suitable for automation'
          },
          {
            id: 'ai_agent',
            name: 'AI Agent',
            role: 'AI Implementation',
            status: 'ready',
            findings: 'Existing AI models can handle 80% of customer inquiries'
          }
        ],
        research: {
          marketSize: 'Current customer service costs: $15K/month',
          competition: 'Industry standard: 60-70% automation',
          barriers: 'Training data quality and customer acceptance',
          timeline: '1-2 months for implementation',
          resources: 'AI development team + customer service training'
        },
        strategy: {
          approach: 'Phased automation rollout',
          phases: [
            'Common inquiries automation (Week 1-4)',
            'Complex inquiry handling (Week 5-8)',
            'Full automation with human fallback (Week 9-12)'
          ],
          risks: ['Customer satisfaction', 'Technical complexity', 'Training requirements'],
          mitigations: ['Gradual rollout', 'Quality monitoring', 'Staff training program']
        },
        status: 'ready_to_implement',
        dateIdentified: new Date(2024, 11, 18),
        lastUpdated: new Date(2024, 11, 21)
      },
      {
        id: '3',
        title: 'Strategic Partnership with Tech Giant',
        description: 'Form strategic partnership with major tech company for integrated solution offering.',
        category: 'partnership',
        priority: 'medium',
        impact: 'high',
        effort: 'high',
        timeframe: '6-12 months',
        potentialRevenue: 500000,
        confidence: 70,
        agents: [
          {
            id: 'business_dev_agent',
            name: 'Business Development Agent',
            role: 'Partnership Development',
            status: 'researching',
            findings: 'Identified 3 potential strategic partners with complementary offerings'
          },
          {
            id: 'legal_agent',
            name: 'Legal Agent',
            role: 'Legal Analysis',
            status: 'analyzing',
            findings: 'Partnership agreements require careful legal structuring'
          }
        ],
        research: {
          marketSize: 'Partnership market: $500M+ annually',
          competition: 'Limited partnerships in this space',
          barriers: 'Complex negotiations and legal requirements',
          timeline: '6-12 months for full partnership',
          resources: 'Dedicated business development team'
        },
        strategy: {
          approach: 'Relationship-first partnership development',
          phases: [
            'Initial relationship building (Months 1-3)',
            'Pilot project development (Months 4-6)',
            'Full partnership agreement (Months 7-12)'
          ],
          risks: ['Competitive response', 'Market changes', 'Resource requirements'],
          mitigations: ['Exclusive agreements', 'Market monitoring', 'Phased resource allocation']
        },
        status: 'researching',
        dateIdentified: new Date(2024, 11, 15),
        lastUpdated: new Date(2024, 11, 20)
      },
      {
        id: '4',
        title: 'Mobile App Development',
        description: 'Develop mobile application to reach new customer segments and increase engagement.',
        category: 'product',
        priority: 'medium',
        impact: 'medium',
        effort: 'high',
        timeframe: '4-6 months',
        potentialRevenue: 100000,
        confidence: 80,
        agents: [
          {
            id: 'product_agent',
            name: 'Product Agent',
            role: 'Product Development',
            status: 'planning',
            findings: 'Mobile app could reach 40% more customers'
          },
          {
            id: 'ux_agent',
            name: 'UX Agent',
            role: 'User Experience',
            status: 'researching',
            findings: 'Customer research shows strong mobile app demand'
          }
        ],
        research: {
          marketSize: 'Mobile app market: $365B globally',
          competition: 'Moderate competition with room for differentiation',
          barriers: 'Development costs and app store approval',
          timeline: '4-6 months for development and launch',
          resources: 'Mobile development team + marketing budget'
        },
        strategy: {
          approach: 'MVP-first mobile development',
          phases: [
            'MVP development (Months 1-3)',
            'Beta testing (Month 4)',
            'Full launch (Months 5-6)'
          ],
          risks: ['Development costs', 'Market competition', 'User adoption'],
          mitigations: ['Phased development', 'Competitive analysis', 'User feedback integration']
        },
        status: 'planning',
        dateIdentified: new Date(2024, 11, 12),
        lastUpdated: new Date(2024, 11, 19)
      }
    ];
    setOpportunities(mockOpportunities);
  }, []);

  // Mock suggestions
  const [suggestions, setSuggestions] = useState([
    {
      id: '1',
      type: 'opportunity',
      title: 'New Market Research',
      description: 'Agents are researching new market opportunities.',
      action: 'review_research',
      priority: 'high'
    },
    {
      id: '2',
      type: 'strategy',
      title: 'Strategy Recommendations',
      description: 'Review AI-generated strategic recommendations.',
      action: 'review_strategies',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'implementation',
      title: 'Ready to Implement',
      description: 'Several opportunities are ready for implementation.',
      action: 'review_implementation',
      priority: 'high'
    }
  ]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setGrowthChat(prev => [...prev, userMessage]);
    setGrowthInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      if (message.toLowerCase().includes('opportunity') || message.toLowerCase().includes('growth')) {
        response = "I've identified several high-impact growth opportunities for your business. The European market expansion and AI automation are particularly promising. Would you like me to dive deeper into any specific opportunity?";
      } else if (message.toLowerCase().includes('research') || message.toLowerCase().includes('market')) {
        response = "Our agents are continuously researching market trends and opportunities. The European expansion shows 85% confidence with €2.5B market potential. Should I prioritize this opportunity for your review?";
      } else if (message.toLowerCase().includes('implement') || message.toLowerCase().includes('execute')) {
        response = "The AI customer service automation is ready for implementation with 95% confidence. It could save $15K/month and requires only 1-2 months to deploy. Would you like me to create an implementation plan?";
      } else if (message.toLowerCase().includes('strategy') || message.toLowerCase().includes('approach')) {
        response = "I can help you develop strategic approaches for any opportunity. Each opportunity has a detailed strategy with phases, risks, and mitigations. Which opportunity would you like to strategize about?";
      } else {
        response = "I'm here to help you identify and capitalize on growth opportunities! I can assist with market research, strategic planning, implementation guidance, and opportunity prioritization. What would you like to explore?";
      }

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        agent: 'growth_agent',
        actions: ['Review Opportunities', 'Create Strategy', 'Implementation Plan', 'Market Research']
      };

      setGrowthChat(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      triggerCelebration(CelebrationType.COLLABORATION, {
        message: "Growth Agent responded! 🚀",
        intensity: 'subtle'
      });
    }, 1500);
  };

  const handleSuggestion = (suggestion) => {
    switch (suggestion.action) {
      case 'review_research':
        triggerCelebration(CelebrationType.PROGRESS, {
          message: "Research review completed! 📊",
          intensity: 'normal'
        });
        break;
      case 'review_strategies':
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: "Strategy review completed! 📋",
          intensity: 'normal'
        });
        break;
      case 'review_implementation':
        triggerCelebration(CelebrationType.MILESTONE, {
          message: "Implementation review completed! ⚡",
          intensity: 'normal'
        });
        break;
    }
    
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const handleOpportunityAction = async (opportunity, action) => {
    switch (action) {
      case 'accept':
        await handleAcceptOpportunity(opportunity);
        triggerCelebration(CelebrationType.MILESTONE, {
          message: `Opportunity accepted: ${opportunity.title}! 🎯`,
          intensity: 'normal'
        });
        break;
      case 'decline':
        await handleDeclineOpportunity(opportunity);
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: `Opportunity declined: ${opportunity.title}`,
          intensity: 'subtle'
        });
        break;
      case 'research':
        await handleOpportunityAnalysis(opportunity);
        triggerCelebration(CelebrationType.COLLABORATION, {
          message: `Research initiated for: ${opportunity.title}! 🔍`,
          intensity: 'normal'
        });
        break;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'expansion': return <Globe className="w-5 h-5" />;
      case 'automation': return <Zap className="w-5 h-5" />;
      case 'partnership': return <Users className="w-5 h-5" />;
      case 'product': return <Lightbulb className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'expansion': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'automation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'partnership': return 'bg-green-100 text-green-800 border-green-200';
      case 'product': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'researching': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'ready_to_implement': return 'bg-green-100 text-green-800';
      case 'implementing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    if (filter === 'all') return true;
    if (filter === 'high_impact') return opportunity.impact === 'high';
    if (filter === 'quick_wins') return opportunity.effort === 'low' && opportunity.impact === 'high';
    if (filter === 'strategic') return opportunity.priority === 'high';
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Growth Opportunities
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI agents constantly research and strategize for new business opportunities.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Opportunities</option>
              <option value="high_impact">High Impact</option>
              <option value="quick_wins">Quick Wins</option>
              <option value="strategic">Strategic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agent Workflow Visualization */}
      {showWorkflow && (
        <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
          <AgentWorkflowVisualizer 
            workflowType="growth_opportunity"
            showRealTimeUpdates={true}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Opportunities List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {filteredOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 ${getPriorityColor(opportunity.priority)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedOpportunity(opportunity)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(opportunity.category)}`}>
                      {getCategoryIcon(opportunity.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {opportunity.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(opportunity.category)}`}>
                          {opportunity.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(opportunity.status)}`}>
                          {opportunity.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {opportunity.description}
                      </p>
                      
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            ${opportunity.potentialRevenue.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Potential Revenue
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {opportunity.confidence}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Confidence
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {opportunity.timeframe}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Timeframe
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(opportunity.impact)}`}>
                              {opportunity.impact} impact
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(opportunity.effort)}`}>
                              {opportunity.effort} effort
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Agent Activity */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Agent Research Status
                        </h4>
                        <div className="space-y-2">
                          {opportunity.agents.slice(0, 2).map((agent) => (
                            <div key={agent.id} className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                agent.status === 'researching' ? 'bg-blue-100 text-blue-600' :
                                agent.status === 'analyzing' ? 'bg-yellow-100 text-yellow-600' :
                                agent.status === 'ready' ? 'bg-green-100 text-green-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                <Brain className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {agent.name}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {agent.findings}
                                </div>
                              </div>
                            </div>
                          ))}
                          {opportunity.agents.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{opportunity.agents.length - 2} more agents working on this
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpportunityAction(opportunity, 'accept');
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpportunityAction(opportunity, 'research');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                        >
                          <Search className="w-4 h-4" />
                          <span>Research More</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpportunityAction(opportunity, 'decline');
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Growth Agent Sidebar */}
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Agent Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Growth Agent</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Opportunity Research Assistant</p>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {growthChat.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">What growth opportunity interests you?</p>
                </div>
              )}
              
              {growthChat.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? `bg-gradient-to-r ${adaptiveClasses.primary} text-white`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.actions && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.actions.map((action, idx) => (
                          <button
                            key={idx}
                            className="px-2 py-1 bg-white/20 text-xs rounded hover:bg-white/30 transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={growthInput}
                onChange={(e) => setGrowthInput(e.target.value)}
                placeholder="Ask about growth opportunities..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(growthInput)}
              />
              <button
                onClick={() => handleSendMessage(growthInput)}
                disabled={!growthInput.trim()}
                className={`px-4 py-2 bg-gradient-to-r ${adaptiveClasses.primary} text-white rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Send
              </button>
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Suggestions</h4>
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showSuggestions ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {suggestions.map((suggestion) => (
                        <motion.div
                          key={suggestion.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleSuggestion(suggestion)}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              {suggestion.title}
                            </h5>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                              suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {suggestion.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {suggestion.description}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrowthOpportunitiesView;

