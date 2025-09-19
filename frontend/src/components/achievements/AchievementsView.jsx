import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy,
  Star,
  Target,
  TrendingUp,
  Calendar,
  Users,
  MessageSquare,
  Brain,
  Zap,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Award,
  Medal,
  Crown,
  Gem,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Clock,
  DollarSign,
  Heart,
  Lightbulb
} from 'lucide-react';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';
import { useCelebrations, CelebrationType } from '../psychological/EnhancedMicroCelebrations';

const AchievementsView = ({ onNavigateToChat, onNavigateToDashboard }) => {
  const { currentMode, getModeColors } = useAdaptiveMode();
  const { triggerCelebration } = useCelebrations();
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [achievementChat, setAchievementChat] = useState([]);
  const [achievementInput, setAchievementInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'recent', 'milestone', 'agent'

  const adaptiveClasses = getModeColors(currentMode);

  // Mock achievements data
  useEffect(() => {
    const mockAchievements = [
      {
        id: '1',
        title: 'Revenue Milestone: $50K Monthly',
        description: 'Achieved significant revenue growth through strategic marketing and sales optimization.',
        type: 'milestone',
        category: 'revenue',
        priority: 'high',
        date: new Date(2024, 11, 15),
        impact: {
          metric: 'Monthly Revenue',
          before: 25000,
          after: 50000,
          change: '+100%'
        },
        agents: [
          {
            id: 'enhanced_campaign_agent',
            name: 'Enhanced Campaign Agent',
            contribution: 'Launched targeted marketing campaigns that increased conversion rates by 40%',
            actions: ['Campaign Optimization', 'Audience Targeting', 'A/B Testing']
          },
          {
            id: 'sales_agent',
            name: 'Sales Agent',
            contribution: 'Optimized sales funnel and implemented new lead qualification process',
            actions: ['Lead Qualification', 'Sales Process Optimization', 'Customer Onboarding']
          }
        ],
        businessImpact: 'This achievement represents a major milestone in business growth, enabling expansion into new markets and increased operational capacity.',
        reinitiable: true,
        reinitiateActions: ['Scale to $75K', 'Expand to New Markets', 'Optimize Further']
      },
      {
        id: '2',
        title: 'Brand Authority: 10K LinkedIn Followers',
        description: 'Built significant thought leadership presence through consistent content marketing and engagement.',
        type: 'milestone',
        category: 'brand',
        priority: 'medium',
        date: new Date(2024, 11, 10),
        impact: {
          metric: 'LinkedIn Followers',
          before: 5000,
          after: 10000,
          change: '+100%'
        },
        agents: [
          {
            id: 'content_strategist',
            name: 'Content Strategist',
            contribution: 'Created high-quality, engaging content that resonated with target audience',
            actions: ['Content Planning', 'Topic Research', 'SEO Optimization']
          },
          {
            id: 'social_media_agent',
            name: 'Social Media Agent',
            contribution: 'Optimized posting schedule and engagement strategies for maximum reach',
            actions: ['Post Scheduling', 'Engagement Optimization', 'Community Building']
          }
        ],
        businessImpact: 'Increased brand visibility and thought leadership, leading to more speaking opportunities and partnership requests.',
        reinitiable: true,
        reinitiateActions: ['Reach 20K Followers', 'Expand to Other Platforms', 'Monetize Following']
      },
      {
        id: '3',
        title: 'Automation Success: 60% Task Reduction',
        description: 'Successfully automated routine business processes, freeing up time for strategic work.',
        type: 'milestone',
        category: 'automation',
        priority: 'high',
        date: new Date(2024, 11, 8),
        impact: {
          metric: 'Task Automation',
          before: 20,
          after: 60,
          change: '+200%'
        },
        agents: [
          {
            id: 'workflow_manager',
            name: 'Workflow Manager',
            contribution: 'Identified and designed automation workflows for maximum efficiency',
            actions: ['Process Analysis', 'Workflow Design', 'Implementation Planning']
          },
          {
            id: 'automation_agent',
            name: 'Automation Agent',
            contribution: 'Implemented automated solutions for routine tasks and processes',
            actions: ['Script Development', 'Integration Setup', 'Testing & Optimization']
          }
        ],
        businessImpact: 'Significantly reduced manual workload, allowing focus on high-value strategic activities and improving work-life balance.',
        reinitiable: true,
        reinitiateActions: ['Automate 80% of Tasks', 'Advanced AI Integration', 'Predictive Automation']
      },
      {
        id: '4',
        title: 'Customer Satisfaction: 95% Rating',
        description: 'Achieved exceptional customer satisfaction through improved service delivery and support.',
        type: 'milestone',
        category: 'customer',
        priority: 'high',
        date: new Date(2024, 11, 5),
        impact: {
          metric: 'Customer Satisfaction',
          before: 85,
          after: 95,
          change: '+12%'
        },
        agents: [
          {
            id: 'customer_support_agent',
            name: 'Customer Support Agent',
            contribution: 'Improved response times and solution quality for customer inquiries',
            actions: ['Response Optimization', 'Knowledge Base Updates', 'Support Training']
          },
          {
            id: 'customer_relations_agent',
            name: 'Customer Relations Agent',
            contribution: 'Enhanced customer onboarding and relationship management processes',
            actions: ['Onboarding Optimization', 'Relationship Building', 'Feedback Collection']
          }
        ],
        businessImpact: 'Higher customer satisfaction leads to increased retention, referrals, and positive brand reputation.',
        reinitiable: true,
        reinitiateActions: ['Reach 98% Rating', 'Expand Support Channels', 'Predictive Support']
      },
      {
        id: '5',
        title: 'Content Performance: 1M Total Views',
        description: 'Reached significant content milestone with engaging, valuable content across platforms.',
        type: 'milestone',
        category: 'content',
        priority: 'medium',
        date: new Date(2024, 10, 28),
        impact: {
          metric: 'Content Views',
          before: 500000,
          after: 1000000,
          change: '+100%'
        },
        agents: [
          {
            id: 'content_creator',
            name: 'Content Creator',
            contribution: 'Produced high-quality, engaging content that resonated with audiences',
            actions: ['Content Creation', 'Visual Design', 'Storytelling']
          },
          {
            id: 'seo_agent',
            name: 'SEO Agent',
            contribution: 'Optimized content for search engines and improved discoverability',
            actions: ['SEO Optimization', 'Keyword Research', 'Content Strategy']
          }
        ],
        businessImpact: 'Increased brand awareness and thought leadership, driving more qualified leads and business opportunities.',
        reinitiable: true,
        reinitiateActions: ['Reach 2M Views', 'Monetize Content', 'Expand Content Types']
      }
    ];
    setAchievements(mockAchievements);
  }, []);

  // Mock suggestions
  const [suggestions, setSuggestions] = useState([
    {
      id: '1',
      type: 'celebration',
      title: 'Celebrate Recent Win',
      description: 'Acknowledge and celebrate your latest achievement.',
      action: 'celebrate_achievement',
      priority: 'high'
    },
    {
      id: '2',
      type: 'reinitiate',
      title: 'Reinitiate Success',
      description: 'Apply successful strategies to new goals.',
      action: 'reinitiate_success',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'analysis',
      title: 'Analyze Success Patterns',
      description: 'Identify what made your achievements successful.',
      action: 'analyze_patterns',
      priority: 'medium'
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

    setAchievementChat(prev => [...prev, userMessage]);
    setAchievementInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      if (message.toLowerCase().includes('achievement') || message.toLowerCase().includes('success')) {
        response = "Looking at your achievement history, you've made incredible progress! Your revenue milestone and automation success show excellent strategic thinking. What would you like to focus on next?";
      } else if (message.toLowerCase().includes('reinitiate') || message.toLowerCase().includes('repeat')) {
        response = "I can help you reinitiate successful strategies! Your revenue growth approach could be applied to new markets, and your automation success could be scaled further. Which achievement would you like to build upon?";
      } else if (message.toLowerCase().includes('pattern') || message.toLowerCase().includes('analyze')) {
        response = "Your success patterns show strong collaboration between agents, consistent execution, and strategic thinking. The combination of marketing automation and customer focus has been particularly effective. Would you like me to suggest similar approaches for new goals?";
      } else {
        response = "I'm here to help you celebrate your achievements and build upon your success! I can assist with analyzing patterns, reinitiating successful strategies, and planning new milestones. What would you like to explore?";
      }

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        agent: 'achievements_agent',
        actions: ['Analyze Patterns', 'Reinitiate Strategy', 'Plan New Goals', 'Celebrate Success']
      };

      setAchievementChat(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      triggerCelebration(CelebrationType.MILESTONE, {
        message: "Achievements Agent responded! 🏆",
        intensity: 'subtle'
      });
    }, 1500);
  };

  const handleSuggestion = (suggestion) => {
    switch (suggestion.action) {
      case 'celebrate_achievement':
        triggerCelebration(CelebrationType.MILESTONE, {
          message: "Achievement celebrated! 🎉",
          intensity: 'elaborate'
        });
        break;
      case 'reinitiate_success':
        triggerCelebration(CelebrationType.EFFICIENCY, {
          message: "Success strategy reinitiated! ⚡",
          intensity: 'normal'
        });
        break;
      case 'analyze_patterns':
        triggerCelebration(CelebrationType.COLLABORATION, {
          message: "Pattern analysis completed! 📊",
          intensity: 'normal'
        });
        break;
    }
    
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const handleReinitiateAchievement = (achievement) => {
    triggerCelebration(CelebrationType.MILESTONE, {
      message: `Reinitiating ${achievement.title}! 🚀`,
      intensity: 'normal'
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'revenue': return <DollarSign className="w-5 h-5" />;
      case 'brand': return <Star className="w-5 h-5" />;
      case 'automation': return <Zap className="w-5 h-5" />;
      case 'customer': return <Heart className="w-5 h-5" />;
      case 'content': return <Lightbulb className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'revenue': return 'bg-green-100 text-green-800 border-green-200';
      case 'brand': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'automation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'customer': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'content': return 'bg-orange-100 text-orange-800 border-orange-200';
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

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'milestone': return <Trophy className="w-6 h-6" />;
      case 'agent': return <Brain className="w-6 h-6" />;
      case 'recent': return <Sparkles className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'recent') {
      const recent = new Date();
      recent.setDate(recent.getDate() - 30);
      return achievement.date >= recent;
    }
    if (filter === 'milestone') return achievement.type === 'milestone';
    if (filter === 'agent') return achievement.agents.length > 0;
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Achievements & Milestones
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Celebrate your wins and learn from your success patterns.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Achievements</option>
              <option value="recent">Recent (30 days)</option>
              <option value="milestone">Milestones</option>
              <option value="agent">Agent-Driven</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Achievements Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 ${getPriorityColor(achievement.priority)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedAchievement(achievement)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(achievement.category)}`}>
                      {getCategoryIcon(achievement.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {achievement.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(achievement.category)}`}>
                          {achievement.category}
                        </span>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          {getAchievementIcon(achievement.type)}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {achievement.description}
                      </p>
                      
                      {/* Impact Metrics */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {achievement.impact.metric}
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {achievement.impact.after.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Previous: {achievement.impact.before.toLocaleString()}
                            </div>
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              {achievement.impact.change}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Agent Contributions */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Agent Contributions
                        </h4>
                        <div className="space-y-2">
                          {achievement.agents.slice(0, 2).map((agent) => (
                            <div key={agent.id} className="flex items-start space-x-2">
                              <Brain className="w-4 h-4 text-blue-500 mt-1" />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {agent.name}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {agent.contribution}
                                </div>
                              </div>
                            </div>
                          ))}
                          {achievement.agents.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{achievement.agents.length - 2} more agents contributed
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Business Impact */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Business Impact
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {achievement.businessImpact}
                        </p>
                      </div>

                      {/* Date and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{achievement.date.toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        
                        {achievement.reinitiable && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReinitiateAchievement(achievement);
                            }}
                            className={`px-4 py-2 bg-gradient-to-r ${adaptiveClasses.primary} text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center space-x-2 text-sm`}
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Reinitiate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievements Agent Sidebar */}
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Agent Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Achievements Agent</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Success Analysis Assistant</p>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {achievementChat.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">What achievement would you like to explore?</p>
                </div>
              )}
              
              {achievementChat.map((message) => (
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
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                placeholder="Ask about your achievements..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(achievementInput)}
              />
              <button
                onClick={() => handleSendMessage(achievementInput)}
                disabled={!achievementInput.trim()}
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

export default AchievementsView;
