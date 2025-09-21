import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
import { 
  MessageSquare, 
  Bot, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  X, 
  Brain,
  Zap,
  User,
  Loader2
} from 'lucide-react';
import { useAgentCommunication } from '../../contexts/AgentCommunicationContext.simple';
import { useAdaptiveMode } from '../../contexts/AdaptiveModeContext';

const AgentMessageHandler = ({ onMessageReceived, className = "" }) => {
  const { 
    agentMessages, 
    pendingResponses, 
    sendResponseToAgent, 
    hasPendingResponses,
    getPendingResponse 
  } = useAgentCommunication();
  
  const { currentMode, getModeColors } = useAdaptiveMode();
  const adaptiveClasses = getModeColors(currentMode);
  
  const [responseInput, setResponseInput] = useState({});
  const [isResponding, setIsResponding] = useState({});

  // Get agent icon based on agent ID - Updated for all 104+ agents
  const getAgentIcon = (agentId) => {
    const iconMap = {
      // Marketing Agents
      'marketing_agent': '🎯',
      'enhanced_marketing': '🚀',
      'brand_strategist': '🎨',
      'paid_ads': '📢',
      'seo': '🔍',
      'social_media': '📱',
      'content_marketing': '✍️',
      'event_marketing': '🎪',
      
      // Research Agents
      'research_agent': '🔬',
      'supplier_research': '🔍',
      'competitive_intelligence': '🎯',
      'market_trends': '📈',
      'trend_spotter': '🔮',
      'research_scraper': '🕷️',
      'scraper': '🕸️',
      
      // Sales Agents
      'sales_agent': '💰',
      'outbound_sales': '📞',
      'sales_funnel': '🔄',
      'lead_personalization': '🎯',
      'upsell_cross_sell': '⬆️',
      'churn_predictor': '⚠️',
      
      // Content Agents
      'content_agent': '✍️',
      'content_strategist': '📝',
      'copywriter': '✏️',
      'content_repurposer': '🔄',
      'video_editor': '🎬',
      'image_generation': '🖼️',
      
      // Finance Agents
      'bookkeeping_agent': '📊',
      'accounting': '🧮',
      'tax_advisor': '📋',
      'pricing': '💲',
      'pricing_intelligence': '📈',
      'expense_optimizer': '💡',
      'investor_relations': '🤝',
      'grant_funding': '💸',
      
      // Operations Agents
      'operations_agent': '⚙️',
      'automation': '🤖',
      'unified_automation': '🔧',
      'crm_automation': '📋',
      'desktop_automation': '🖥️',
      'automation_bridge': '🌉',
      'process_optimization': '⚡',
      
      // Technology Agents
      'technology_agent': '💻',
      'system_integration': '🔌',
      'api_development': '🔗',
      'software_optimization': '⚡',
      'technical_analysis': '🔧',
      
      // Strategy Agents
      'strategy_agent': '🧠',
      'business_strategist': '💼',
      'chief_of_staff': '👑',
      'scenario_planner': '🗺️',
      'risk_management': '🛡️',
      
      // Support Agents
      'support_agent': '🤝',
      'customer_support': '🎧',
      'customer_success': '✅',
      'multi_channel_inbox': '📥',
      'feedback_collector': '📝',
      
      // Analytics Agents
      'analytics_agent': '📊',
      'performance_analytics': '📈',
      'data_analysis': '🔍',
      'reporting': '📋',
      'kpi_tracking': '🎯',
      
      // HR & People Agents
      'hr_agent': '👥',
      'hiring_hr': '🎯',
      'wellness': '💚',
      'wellbeing': '🌱',
      'well_being': '💪',
      'motivation_coach': '🔥',
      'accountability_coach': '📋',
      'skill_development': '📚',
      'training': '🎓',
      'learning': '🧠',
      
      // Community & Partnerships
      'community_connector': '🌐',
      'community_manager': '👥',
      'partnerships': '🤝',
      'affiliate_partnerships': '🔗',
      'influencer_outreach': '🌟',
      'pr_outreach': '📢',
      
      // Specialized Agents
      'voice_agent': '🎤',
      'voice_persona': '🗣️',
      'telephony_voice': '📞',
      'calendar_harmony': '📅',
      'meeting_notes': '📝',
      'onboarding': '🚀',
      'localization': '🌍',
      'compliance': '📜',
      'storage': '💾',
      'connector': '🔌',
      'visual': '👁️',
      'data_hygiene': '🧹',
      'design_qa': '✅',
      'ux_ui_tester': '🎨',
      'vendor_management': '🏢',
      'project_manager': '📋',
      'knowledge_management': '📚',
      'knowledge_updater': '🔄',
      'sop': '📖',
      'outsourcing': '🌐',
      'orchestrator': '🎭',
      'orchestration_tuner': '🎛️',
      'scalability': '📈',
      'security': '🔒',
      'storage': '💾',
      'vision_enhanced_training': '👁️🎓',
      'enhanced_prompts': '✨',
      'enhanced_campaign': '🚀',
      'wellbeing_workload': '⚖️',
      'celebration_narrator': '🎉',
      'ad_performance_optimizer': '📊⚡',
      'board_advisor': '👑',
      'icp_evolution': '🔄',
      'investor_update': '📊',
      'okr_goal_tracking': '🎯',
      'proposal_writer': '📝',
      'contract_analyzer': '📋',
      'product_manager': '📦',
      
      // Default fallback
      'default': '🤖'
    };
    return iconMap[agentId] || iconMap.default;
  };

  // Get agent name - Updated for all 104+ agents
  const getAgentName = (agentId) => {
    const nameMap = {
      // Marketing Agents
      'marketing_agent': 'Marketing Agent',
      'enhanced_marketing': 'Enhanced Marketing Agent',
      'brand_strategist': 'Brand Strategist',
      'paid_ads': 'Paid Ads Agent',
      'seo': 'SEO Agent',
      'social_media': 'Social Media Agent',
      'content_marketing': 'Content Marketing Agent',
      'event_marketing': 'Event Marketing Agent',
      
      // Research Agents
      'research_agent': 'Research Agent',
      'supplier_research': 'Supplier Research Agent',
      'competitive_intelligence': 'Competitive Intelligence Agent',
      'market_trends': 'Market Trends Agent',
      'trend_spotter': 'Trend Spotter Agent',
      'research_scraper': 'Research Scraper Agent',
      'scraper': 'Scraper Agent',
      
      // Sales Agents
      'sales_agent': 'Sales Agent',
      'outbound_sales': 'Outbound Sales Agent',
      'sales_funnel': 'Sales Funnel Agent',
      'lead_personalization': 'Lead Personalization Agent',
      'upsell_cross_sell': 'Upsell Cross-Sell Agent',
      'churn_predictor': 'Churn Predictor Agent',
      
      // Content Agents
      'content_agent': 'Content Agent',
      'content_strategist': 'Content Strategist',
      'copywriter': 'Copywriter Agent',
      'content_repurposer': 'Content Repurposer Agent',
      'video_editor': 'Video Editor Agent',
      'image_generation': 'Image Generation Agent',
      
      // Finance Agents
      'bookkeeping_agent': 'Bookkeeping Agent',
      'accounting': 'Accounting Agent',
      'tax_advisor': 'Tax Advisor Agent',
      'pricing': 'Pricing Agent',
      'pricing_intelligence': 'Pricing Intelligence Agent',
      'expense_optimizer': 'Expense Optimizer Agent',
      'investor_relations': 'Investor Relations Agent',
      'grant_funding': 'Grant Funding Agent',
      
      // Operations Agents
      'operations_agent': 'Operations Agent',
      'automation': 'Automation Agent',
      'unified_automation': 'Unified Automation Agent',
      'crm_automation': 'CRM Automation Agent',
      'desktop_automation': 'Desktop Automation Agent',
      'automation_bridge': 'Automation Bridge Agent',
      'process_optimization': 'Process Optimization Agent',
      
      // Technology Agents
      'technology_agent': 'Technology Agent',
      'system_integration': 'System Integration Agent',
      'api_development': 'API Development Agent',
      'software_optimization': 'Software Optimization Agent',
      'technical_analysis': 'Technical Analysis Agent',
      
      // Strategy Agents
      'strategy_agent': 'Strategy Agent',
      'business_strategist': 'Business Strategist',
      'chief_of_staff': 'Chief of Staff Agent',
      'scenario_planner': 'Scenario Planner Agent',
      'risk_management': 'Risk Management Agent',
      
      // Support Agents
      'support_agent': 'Support Agent',
      'customer_support': 'Customer Support Agent',
      'customer_success': 'Customer Success Agent',
      'multi_channel_inbox': 'Multi-Channel Inbox Agent',
      'feedback_collector': 'Feedback Collector Agent',
      
      // Analytics Agents
      'analytics_agent': 'Analytics Agent',
      'performance_analytics': 'Performance Analytics Agent',
      'data_analysis': 'Data Analysis Agent',
      'reporting': 'Reporting Agent',
      'kpi_tracking': 'KPI Tracking Agent',
      
      // HR & People Agents
      'hr_agent': 'HR Agent',
      'hiring_hr': 'Hiring HR Agent',
      'wellness': 'Wellness Agent',
      'wellbeing': 'Wellbeing Agent',
      'well_being': 'Well-being Agent',
      'motivation_coach': 'Motivation Coach Agent',
      'accountability_coach': 'Accountability Coach Agent',
      'skill_development': 'Skill Development Agent',
      'training': 'Training Agent',
      'learning': 'Learning Agent',
      
      // Community & Partnerships
      'community_connector': 'Community Connector Agent',
      'community_manager': 'Community Manager Agent',
      'partnerships': 'Partnerships Agent',
      'affiliate_partnerships': 'Affiliate Partnerships Agent',
      'influencer_outreach': 'Influencer Outreach Agent',
      'pr_outreach': 'PR Outreach Agent',
      
      // Specialized Agents
      'voice_agent': 'Voice Agent',
      'voice_persona': 'Voice Persona Agent',
      'telephony_voice': 'Telephony Voice Agent',
      'calendar_harmony': 'Calendar Harmony Agent',
      'meeting_notes': 'Meeting Notes Agent',
      'onboarding': 'Onboarding Agent',
      'localization': 'Localization Agent',
      'compliance': 'Compliance Agent',
      'storage': 'Storage Agent',
      'connector': 'Connector Agent',
      'visual': 'Visual Agent',
      'data_hygiene': 'Data Hygiene Agent',
      'design_qa': 'Design QA Agent',
      'ux_ui_tester': 'UX/UI Tester Agent',
      'vendor_management': 'Vendor Management Agent',
      'project_manager': 'Project Manager Agent',
      'knowledge_management': 'Knowledge Management Agent',
      'knowledge_updater': 'Knowledge Updater Agent',
      'sop': 'SOP Agent',
      'outsourcing': 'Outsourcing Agent',
      'orchestrator': 'Orchestrator Agent',
      'orchestration_tuner': 'Orchestration Tuner Agent',
      'scalability': 'Scalability Agent',
      'security': 'Security Agent',
      'vision_enhanced_training': 'Vision Enhanced Training Agent',
      'enhanced_prompts': 'Enhanced Prompts Agent',
      'enhanced_campaign': 'Enhanced Campaign Agent',
      'wellbeing_workload': 'Wellbeing Workload Agent',
      'celebration_narrator': 'Celebration Narrator Agent',
      'ad_performance_optimizer': 'Ad Performance Optimizer Agent',
      'board_advisor': 'Board Advisor Agent',
      'icp_evolution': 'ICP Evolution Agent',
      'investor_update': 'Investor Update Agent',
      'okr_goal_tracking': 'OKR Goal Tracking Agent',
      'proposal_writer': 'Proposal Writer Agent',
      'contract_analyzer': 'Contract Analyzer Agent',
      'product_manager': 'Product Manager Agent',
      
      // Default fallback
      'default': 'AI Agent'
    };
    return nameMap[agentId] || agentId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleSendResponse = async (messageId, response) => {
    if (!response.trim()) return;
    
    setIsResponding(prev => ({ ...prev, [messageId]: true }));
    
    try {
      await sendResponseToAgent(messageId, response);
      setResponseInput(prev => ({ ...prev, [messageId]: '' }));
      
      // Notify parent component
      if (onMessageReceived) {
        onMessageReceived({
          type: 'user_response',
          messageId,
          response,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error sending response:', error);
    } finally {
      setIsResponding(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const getMessageIcon = (messageType) => {
    switch (messageType) {
      case 'clarification_request':
        return <MessageSquare className="w-4 h-4" />;
      case 'status':
        return <Clock className="w-4 h-4" />;
      case 'response':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getMessageColor = (messageType) => {
    switch (messageType) {
      case 'clarification_request':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'status':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'response':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Pending Clarification Requests */}
      <AnimatePresence>
        {hasPendingResponses && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Agent Clarifications
            </h3>
            
            {Object.entries(pendingResponses || {}).map(([messageId, request]) => (
              <motion.div
                key={messageId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-xl border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg">
                      {getAgentIcon(request.agentId)}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                        {getAgentName(request.agentId)}
                      </h4>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {request.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-blue-800 dark:text-blue-200 mb-3">
                      {request.question}
                    </p>
                    
                    {/* Response Input */}
                    <div className="space-y-2">
                      <textarea
                        value={responseInput[messageId] || ''}
                        onChange={(e) => setResponseInput(prev => ({ 
                          ...prev, 
                          [messageId]: e.target.value 
                        }))}
                        placeholder="Type your response here..."
                        className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                        rows={3}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleSendResponse(messageId, responseInput[messageId] || '')}
                          disabled={!responseInput[messageId]?.trim() || isResponding[messageId]}
                          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
                        >
                          {isResponding[messageId] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span>Send Response</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Messages History */}
      {agentMessages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Bot className="w-5 h-5 mr-2 text-gray-600" />
            Agent Messages
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(agentMessages || []).map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border ${getMessageColor(message.type)}`}
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    {getMessageIcon(message.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {getAgentName(message.agentId)}
                      </span>
                      <span className="text-xs opacity-75">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm break-words">
                      {message.content}
                    </p>
                    
                    {message.metadata && (
                      <div className="mt-2 text-xs opacity-75">
                        {message.metadata.status && (
                          <span className="inline-block bg-white/50 px-2 py-1 rounded mr-2">
                            Status: {message.metadata.status}
                          </span>
                        )}
                        {message.metadata.progress !== undefined && (
                          <span className="inline-block bg-white/50 px-2 py-1 rounded">
                            Progress: {message.metadata.progress}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Messages State */}
      {!hasPendingResponses && agentMessages.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No agent messages yet. Start a task to see agent communications!</p>
        </div>
      )}
    </div>
  );
};

export default AgentMessageHandler;
