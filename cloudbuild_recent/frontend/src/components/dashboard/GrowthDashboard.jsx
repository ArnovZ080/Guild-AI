// Growth Dashboard Component
// Autonomous growth opportunity identification and implementation tracking

import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Target, DollarSign, Users, Calendar, 
  CheckCircle, XCircle, Clock, Star, Lightbulb, Brain, Zap,
  ArrowUpRight, ArrowDownRight, AlertCircle, Info, ThumbsUp, ThumbsDown,
  Filter, Search, RefreshCw, Download, Eye, Settings, Activity,
  Loader
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../psychological/MicroCelebrations.jsx';

// Import modals
import GrowthOpportunityModal from './modals/GrowthOpportunityModal.jsx';
import WorkflowConfirmationModal from './modals/WorkflowConfirmationModal.jsx';
import AcceptedOpportunityModal from './modals/AcceptedOpportunityModal.jsx';

// Mock data for demo/testing purposes
const MOCK_OPPORTUNITIES = [
  {
    id: 'mock-1',
    title: 'Scale High-Performing Content to YouTube Shorts',
    description: 'Your Instagram Reels are achieving 12.5% engagement rate, significantly above the 4.2% industry average. By repurposing this content for YouTube Shorts, you can tap into a platform with 2B monthly users and monetization opportunities. Your content style (educational + entertaining) perfectly matches what performs on Shorts.',
    category: 'marketing',
    priority: 'high',
    impact: 'high',
    effort: 'medium',
    timeframe: '3-4 weeks',
    expected_roi: '+45% content reach',
    expected_revenue: '$3,200/month from YouTube Partner Program',
    confidence_score: 0.87,
    data_sources: ['content_intelligence', 'business_intelligence'],
    supporting_data: [
      {
        metric: 'Instagram Reels engagement rate',
        value: '12.5%',
        trend: 'up',
        insight: '198% above industry average of 4.2% - indicates strong content-market fit'
      },
      {
        metric: 'Average view completion',
        value: '78%',
        trend: 'up',
        insight: 'Viewers watch most of your content, suggesting high quality and relevance'
      },
      {
        metric: 'Content production cost',
        value: '$45/video',
        trend: 'down',
        insight: 'Low cost makes scaling economically viable'
      },
      {
        metric: 'YouTube Shorts CPM',
        value: '$2.50-4.00',
        trend: 'stable',
        insight: 'Monetization potential with existing content'
      }
    ],
    requirements: [
      'YouTube channel setup and optimization',
      'Content reformatting for 9:16 aspect ratio',
      'YouTube-specific metadata and hashtags',
      'Cross-platform scheduling automation',
      'Performance analytics dashboard'
    ],
    risks: [
      'Platform algorithm changes (mitigated by multi-platform strategy)',
      'Monetization threshold requires 1K subscribers (achievable in 2-3 months)',
      'Content saturation in niche (your unique angle provides differentiation)'
    ],
    recommended_agents: [
      'ContentStrategist',
      'SocialMediaAgent', 
      'VideoEditorAgent',
      'AnalyticsAgent'
    ],
    workflow_steps: [
      {
        step: 1,
        agent: 'ContentStrategist',
        action: 'Analyze top-performing Reels and create YouTube Shorts content strategy',
        expected_outcome: 'Content calendar with 30 video ideas optimized for Shorts',
        estimated_duration: '3-4 days'
      },
      {
        step: 2,
        agent: 'VideoEditorAgent',
        action: 'Batch process existing Reels for YouTube Shorts format with optimized captions',
        expected_outcome: '15-20 YouTube-ready videos',
        estimated_duration: '5-7 days'
      },
      {
        step: 3,
        agent: 'SocialMediaAgent',
        action: 'Schedule and publish content with YouTube-optimized metadata',
        expected_outcome: 'Automated posting schedule across platforms',
        estimated_duration: '2-3 days'
      },
      {
        step: 4,
        agent: 'AnalyticsAgent',
        action: 'Set up cross-platform analytics and performance tracking',
        expected_outcome: 'Real-time dashboard showing reach, engagement, and revenue',
        estimated_duration: '2-3 days'
      }
    ],
    reasoning: 'Your Instagram Reels data reveals a powerful insight: you\'ve cracked the code on short-form video content. The 12.5% engagement rate isn\'t luck—it\'s nearly 3x the industry average, indicating strong content-market fit. YouTube Shorts presents a massive opportunity because: (1) You already create the content format, (2) The platform has 2B users vs Instagram\'s 500M daily Shorts viewers, (3) YouTube offers monetization from day one through the Partner Program, and (4) Your production cost of $45/video means each piece of content can be repurposed across 3+ platforms for maximum ROI. The risk is minimal since you\'re leveraging proven content, and the 87% confidence comes from hard data showing your content consistently outperforms benchmarks. This is a high-impact, medium-effort opportunity that multiplies your content reach without proportionally increasing workload.',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-2',
    title: 'Implement AI-Powered Customer Retention Program',
    description: 'Analysis reveals 23% of your customers show early churn signals (declining engagement, reduced purchase frequency) but 89% have high satisfaction scores. This paradox suggests retention issues are behavioral, not experience-based. An AI-powered retention system can identify at-risk customers and re-engage them before they leave.',
    category: 'sales',
    priority: 'high',
    impact: 'high',
    effort: 'low',
    timeframe: '2-3 weeks',
    expected_roi: '+35% customer retention',
    expected_revenue: '$5,400/month from saved customers',
    confidence_score: 0.92,
    data_sources: ['customer_intelligence', 'financial_intelligence'],
    supporting_data: [
      {
        metric: 'Customer churn rate',
        value: '23%',
        trend: 'stable',
        insight: 'Industry average is 20-25%, but we can reduce this significantly'
      },
      {
        metric: 'Customer satisfaction score',
        value: '4.7/5',
        trend: 'up',
        insight: 'High satisfaction but still losing customers - indicates engagement issue'
      },
      {
        metric: 'Average customer LTV',
        value: '$2,850',
        trend: 'up',
        insight: 'Each saved customer represents significant recurring revenue'
      },
      {
        metric: 'Re-engagement success rate',
        value: '67%',
        trend: 'up',
        insight: 'When contacted, most at-risk customers can be retained'
      }
    ],
    requirements: [
      'CRM integration for customer data',
      'Behavioral analysis and churn prediction model',
      'Automated email sequences for re-engagement',
      'Personalized offer generation system',
      'Success tracking dashboard'
    ],
    risks: [
      'Privacy concerns with behavioral tracking (addressed with transparent opt-in)',
      'Email fatigue from too many touchpoints (mitigated by smart frequency capping)',
      'Cost of retention incentives (ROI-positive when LTV is considered)'
    ],
    recommended_agents: [
      'CRMAgent',
      'CustomerSuccessAgent',
      'EmailMarketingAgent',
      'AnalyticsAgent'
    ],
    workflow_steps: [
      {
        step: 1,
        agent: 'CRMAgent',
        action: 'Build churn prediction model based on behavioral signals and engagement patterns',
        expected_outcome: 'AI model that identifies at-risk customers 30 days before churn',
        estimated_duration: '5-7 days'
      },
      {
        step: 2,
        agent: 'CustomerSuccessAgent',
        action: 'Design personalized re-engagement playbooks for different customer segments',
        expected_outcome: '5 retention strategies tailored to customer behaviors',
        estimated_duration: '3-4 days'
      },
      {
        step: 3,
        agent: 'EmailMarketingAgent',
        action: 'Create automated email campaigns with dynamic personalization',
        expected_outcome: 'Smart email sequences that adapt based on customer response',
        estimated_duration: '4-5 days'
      },
      {
        step: 4,
        agent: 'AnalyticsAgent',
        action: 'Set up retention dashboard with real-time churn risk scoring',
        expected_outcome: 'Live dashboard showing retention metrics and intervention success',
        estimated_duration: '2-3 days'
      }
    ],
    reasoning: 'This is a classic "hidden goldmine" scenario. Your 4.7/5 satisfaction score tells us customers LOVE your product when they use it. But 23% still churn—why? The data shows it\'s not dissatisfaction, it\'s disengagement. Customers drift away not because they\'re unhappy, but because life happens and they forget to re-engage. The 67% re-engagement success rate proves this: when you reach out, most come back. The opportunity is crystal clear: build a system that automatically identifies the 23% showing churn signals (declining login frequency, reduced feature usage, etc.) and proactively re-engages them with personalized touchpoints. At $2,850 LTV per customer, every 1% improvement in retention equals $5,400/month in saved revenue. The 92% confidence comes from your existing high satisfaction scores and proven re-engagement success—we just need to systematize what already works. This is high-impact, low-effort because the infrastructure (CRM, email) already exists; we\'re just adding intelligence and automation.',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-3',
    title: 'Launch "Done-For-You" Premium Service Tier',
    description: 'Your customer data reveals 34% of users consistently purchase your advanced features and spend 3.2x more time in the platform than average users. These power users represent premium customer potential. A "Done-For-You" service tier could increase ARPU by 65% while improving customer outcomes.',
    category: 'product',
    priority: 'medium',
    impact: 'high',
    effort: 'high',
    timeframe: '6-8 weeks',
    expected_roi: '+65% ARPU from premium segment',
    expected_revenue: '$8,900/month',
    confidence_score: 0.79,
    data_sources: ['customer_intelligence', 'business_intelligence', 'financial_intelligence'],
    supporting_data: [
      {
        metric: 'Power user segment size',
        value: '34%',
        trend: 'up',
        insight: 'One-third of customers show premium behavior patterns'
      },
      {
        metric: 'Advanced feature adoption',
        value: '89%',
        trend: 'up',
        insight: 'Power users heavily utilize complex features'
      },
      {
        metric: 'Support ticket rate',
        value: '2.3x average',
        trend: 'stable',
        insight: 'Power users need more help—opportunity for premium service'
      },
      {
        metric: 'Willingness to pay (survey)',
        value: '67% interested',
        trend: 'up',
        insight: 'Strong market validation for premium tier'
      }
    ],
    requirements: [
      'Service tier definition and pricing strategy',
      'Dedicated support infrastructure',
      'Premium feature development roadmap',
      'Customer segmentation and targeting',
      'Premium onboarding process'
    ],
    risks: [
      'Development timeline may extend to 8-10 weeks (mitigated by phased rollout)',
      'Premium positioning could alienate budget users (addressed by maintaining free tier)',
      'Support cost overhead (offset by 3.2x higher pricing)'
    ],
    recommended_agents: [
      'ProductManagerAgent',
      'PricingAgent',
      'CustomerSuccessAgent',
      'BusinessStrategistAgent'
    ],
    workflow_steps: [
      {
        step: 1,
        agent: 'BusinessStrategistAgent',
        action: 'Conduct competitive analysis and define premium tier value proposition',
        expected_outcome: 'Premium service positioning and competitive differentiation strategy',
        estimated_duration: '7-10 days'
      },
      {
        step: 2,
        agent: 'PricingAgent',
        action: 'Develop pricing strategy based on customer willingness-to-pay and value delivered',
        expected_outcome: 'Tiered pricing model with clear value justification',
        estimated_duration: '5-7 days'
      },
      {
        step: 3,
        agent: 'ProductManagerAgent',
        action: 'Design premium features and done-for-you service offerings',
        expected_outcome: 'Premium feature roadmap with clear customer benefits',
        estimated_duration: '14-21 days'
      },
      {
        step: 4,
        agent: 'CustomerSuccessAgent',
        action: 'Create premium onboarding and white-glove support processes',
        expected_outcome: 'VIP customer journey with dedicated support channels',
        estimated_duration: '7-10 days'
      }
    ],
    reasoning: 'Your power users are sending clear signals: they love your product, use it heavily, and need MORE from you. The 34% segment spending 3.2x more time in the platform represents your ideal premium customers. The 2.3x support ticket rate isn\'t a problem—it\'s an opportunity. These users are trying to do advanced things and need expert help. That\'s exactly what a "Done-For-You" service provides: you handle the complexity for them. The 67% interest from surveys validates the market exists. The economics are compelling: at $8,900/month additional revenue from a segment that\'s already engaged, you\'re not acquiring new customers—you\'re deepening relationships with existing fans. The 79% confidence (not 90%+) reflects the execution risk: building a premium tier requires product development, pricing strategy, and operational changes. But the market signal is strong, and premium tiers have proven successful in similar SaaS businesses. The key is positioning this as "we\'re making your life easier" rather than "pay more for features," which your power users will gladly embrace.',
    status: 'pending',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-4',
    title: 'Automate Lead Qualification with AI Scoring',
    description: 'Your sales team spends an average of 3.8 hours daily qualifying leads, but conversion data shows only 14% of leads are actually qualified buyers. An AI-powered lead scoring system can automatically qualify leads based on behavioral signals, freeing up 2.7 hours per day for high-value sales activities.',
    category: 'operations',
    priority: 'medium',
    impact: 'high',
    effort: 'medium',
    timeframe: '4-5 weeks',
    expected_roi: '+52% sales efficiency',
    expected_revenue: '$4,100/month in time saved + increased conversions',
    confidence_score: 0.83,
    data_sources: ['business_intelligence', 'customer_intelligence'],
    supporting_data: [
      {
        metric: 'Lead qualification time',
        value: '3.8 hours/day',
        trend: 'stable',
        insight: 'Significant time spent on manual qualification'
      },
      {
        metric: 'Qualified lead rate',
        value: '14%',
        trend: 'stable',
        insight: '86% of time spent on unqualified leads'
      },
      {
        metric: 'Conversion rate (qualified)',
        value: '34%',
        trend: 'up',
        insight: 'Strong conversion when leads are properly qualified'
      },
      {
        metric: 'Average deal size',
        value: '$3,200',
        trend: 'up',
        insight: 'High value per qualified lead justifies automation investment'
      }
    ],
    requirements: [
      'Historical lead data analysis',
      'AI scoring model development',
      'CRM integration and automation',
      'Sales team training on new process',
      'Performance monitoring dashboard'
    ],
    risks: [
      'Model accuracy requires tuning period (2-3 weeks of learning)',
      'Sales team adoption resistance (mitigated by showing time savings)',
      'False negatives could miss opportunities (addressed by human override option)'
    ],
    recommended_agents: [
      'CRMAgent',
      'AutomationAgent',
      'AnalyticsAgent',
      'BusinessIntelligenceAgent'
    ],
    workflow_steps: [
      {
        step: 1,
        agent: 'BusinessIntelligenceAgent',
        action: 'Analyze historical lead data to identify qualification patterns and signals',
        expected_outcome: 'Data model showing characteristics of qualified vs unqualified leads',
        estimated_duration: '7-10 days'
      },
      {
        step: 2,
        agent: 'CRMAgent',
        action: 'Build AI lead scoring model based on behavioral and demographic signals',
        expected_outcome: 'Predictive model that scores leads 0-100 on qualification likelihood',
        estimated_duration: '10-14 days'
      },
      {
        step: 3,
        agent: 'AutomationAgent',
        action: 'Integrate scoring model with CRM and create automated routing workflows',
        expected_outcome: 'Automated system that routes high-score leads to sales, nurtures low-score',
        estimated_duration: '7-10 days'
      },
      {
        step: 4,
        agent: 'AnalyticsAgent',
        action: 'Build performance dashboard and set up continuous model improvement',
        expected_outcome: 'Real-time dashboard showing scoring accuracy and sales efficiency gains',
        estimated_duration: '3-5 days'
      }
    ],
    reasoning: 'The math here is brutal: 3.8 hours per day spent qualifying leads, but 86% of those leads aren\'t qualified. That\'s 3.3 hours daily spent on leads that will never convert. At $4,100/month in lost productivity alone, this is a high-ROI automation opportunity. But here\'s the kicker: the 34% conversion rate on properly qualified leads shows your sales team is excellent when focused on the right prospects. The AI scoring model will analyze historical data to identify patterns—company size, industry, engagement behavior, demo requests, content downloads—that predict qualification. Then it automatically scores incoming leads and routes high-scores to sales, while nurturing low-scores until they\'re ready. The 83% confidence reflects proven AI scoring effectiveness in B2B sales (this isn\'t experimental), combined with your strong conversion rate on qualified leads. The risk is mainly adoption: sales teams sometimes resist automation. But when they see 2.7 hours daily freed up for actual selling instead of sorting through unqualified leads, adoption follows quickly. This is the kind of operational efficiency improvement that compounds—every hour saved is an hour spent on revenue-generating activities.',
    status: 'pending',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  }
];

const MOCK_ACCEPTED_OPPORTUNITIES = [
  {
    id: 'mock-accepted-1',
    title: 'Implement Customer Referral Program',
    description: 'Leverage high customer satisfaction (4.8/5) to generate qualified leads through referrals',
    category: 'sales',
    priority: 'high',
    impact: 'high',
    effort: 'low',
    timeframe: '2-3 weeks',
    expected_roi: '+40% qualified leads',
    expected_revenue: '$6,200/month',
    confidence_score: 0.91,
    status: 'in_progress',
    workflow_id: 'workflow-mock-1',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    accepted_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-accepted-2',
    title: 'Launch Podcast Content Strategy',
    description: 'Your long-form content performs exceptionally well. A podcast can deepen audience engagement and open new monetization channels',
    category: 'marketing',
    priority: 'medium',
    impact: 'high',
    effort: 'medium',
    timeframe: '5-6 weeks',
    expected_roi: '+30% audience engagement',
    expected_revenue: '$2,800/month',
    confidence_score: 0.76,
    status: 'in_progress',
    workflow_id: 'workflow-mock-2',
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    accepted_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  }
];

const GrowthDashboard = () => {
  // State management
  const [opportunities, setOpportunities] = useState([]);
  const [acceptedOpportunities, setAcceptedOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [demoMode, setDemoMode] = useState(false); // Toggle for demo/testing
  
  // Modal state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);
  const [workflowData, setWorkflowData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { triggerCelebration } = useCelebrations();
  const { settings } = useSettings();

  // Fetch opportunities on mount
  useEffect(() => {
    fetchOpportunities();
  }, [demoMode]);

  const fetchOpportunities = async (forceRefresh = false) => {
    setLoading(true);
    
    // Demo mode: use mock data
    if (demoMode) {
      setTimeout(() => {
        setOpportunities(MOCK_OPPORTUNITIES);
        setAcceptedOpportunities(MOCK_ACCEPTED_OPPORTUNITIES);
        setLoading(false);
        
        if (forceRefresh) {
          triggerCelebration(CelebrationType.MILESTONE_REACHED, {
            message: `✨ Generated ${MOCK_OPPORTUNITIES.length} demo opportunities!`,
            intensity: 'high'
          });
        }
      }, 1000); // Simulate API delay
      return;
    }
    
    // Production mode: try API, fall back to mock data
    try {
      const url = forceRefresh 
        ? '/api/growth-opportunities/generate?force_refresh=true'
        : '/api/growth-opportunities/list';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      
      const data = await response.json();
      
      // Separate accepted and pending opportunities
      const pending = data.filter(opp => opp.status === 'pending' || opp.status === 'rejected');
      const accepted = data.filter(opp => 
        opp.status === 'accepted' || 
        opp.status === 'in_progress' || 
        opp.status === 'completed'
      );
      
      setOpportunities(pending);
      setAcceptedOpportunities(accepted);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      console.log('Falling back to mock data for demo purposes');
      
      // Fallback to mock data
      setOpportunities(MOCK_OPPORTUNITIES);
      setAcceptedOpportunities(MOCK_ACCEPTED_OPPORTUNITIES);
    } finally {
      setLoading(false);
    }
  };

  const generateNewOpportunities = async () => {
    await fetchOpportunities(true);
  };

  const handleViewOpportunity = (opportunity) => {
    setSelectedOpportunity(opportunity);
    if (opportunity.status === 'pending' || opportunity.status === 'rejected') {
      setShowDetailModal(true);
    } else {
      setShowAcceptedModal(true);
    }
  };

  const handleAcceptOpportunity = async (opportunityId) => {
    setIsProcessing(true);
    
    // Demo mode: use mock workflow
    if (demoMode) {
      setTimeout(() => {
        const opportunity = opportunities.find(opp => opp.id === opportunityId);
        if (!opportunity) return;
        
        // Create mock workflow from opportunity workflow_steps
        const mockWorkflow = {
          workflow_id: `workflow-${opportunityId}`,
          workflow_name: `Implement: ${opportunity.title}`,
          workflow_description: opportunity.description,
          tasks: opportunity.workflow_steps.map((step, index) => ({
            id: `task_${index + 1}`,
            name: step.action,
            agent_type: step.agent,
            description: step.action,
            dependencies: index > 0 ? [`task_${index}`] : [],
            expected_output: step.expected_outcome,
            estimated_duration: step.estimated_duration,
            success_criteria: [step.expected_outcome]
          })),
          quality_criteria: {
            success_metrics: [
              `Achieve ${opportunity.expected_roi}`,
              `Complete within ${opportunity.timeframe}`,
              'Maintain quality standards throughout implementation'
            ],
            monitoring_frequency: 'daily',
            escalation_criteria: 'More than 20% deviation from expected outcomes'
          }
        };
        
        setWorkflowData(mockWorkflow);
        setShowDetailModal(false);
        setShowWorkflowModal(true);
        setIsProcessing(false);
      }, 800);
      return;
    }
    
    // Production mode: call API
    try {
      const response = await fetch(`/api/growth-opportunities/${opportunityId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: opportunityId })
      });
      
      if (!response.ok) throw new Error('Failed to accept opportunity');
      
      const data = await response.json();
      
      // Show workflow confirmation modal
      setWorkflowData(data.workflow_definition);
      setShowDetailModal(false);
      setShowWorkflowModal(true);
      
    } catch (error) {
      console.error('Error accepting opportunity:', error);
      alert('Failed to accept opportunity. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmWorkflow = async () => {
    setIsProcessing(true);
    
    // Demo mode: simulate workflow start
    if (demoMode) {
      setTimeout(() => {
        // Move opportunity to accepted
        const acceptedOpp = {
          ...selectedOpportunity,
          status: 'in_progress',
          workflow_id: workflowData.workflow_id,
          accepted_at: new Date()
        };
        
        setAcceptedOpportunities(prev => [...prev, acceptedOpp]);
        setOpportunities(prev => prev.filter(opp => opp.id !== selectedOpportunity.id));
        
        setShowWorkflowModal(false);
        setWorkflowData(null);
        setSelectedOpportunity(null);
        setIsProcessing(false);
        
        triggerCelebration(CelebrationType.TASK_COMPLETE, {
          message: "🎉 Demo workflow initiated!",
          intensity: 'high'
        });
      }, 800);
      return;
    }
    
    // Production mode: call API
    try {
      const response = await fetch(`/api/workflows/${workflowData.workflow_id}/approve`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to approve workflow');
      
      // Close modal and refresh
      setShowWorkflowModal(false);
      setWorkflowData(null);
      await fetchOpportunities();
      
      triggerCelebration(CelebrationType.TASK_COMPLETE, {
        message: "🎉 Growth opportunity workflow initiated!",
        intensity: 'high'
      });
      
    } catch (error) {
      console.error('Error confirming workflow:', error);
      alert('Failed to start workflow. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectOpportunity = async (opportunityId) => {
    // Demo mode: simulate rejection
    if (demoMode) {
      setTimeout(() => {
        setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
        setShowDetailModal(false);
        setSelectedOpportunity(null);
        
        triggerCelebration(CelebrationType.TASK_COMPLETE, {
          message: "Opportunity reviewed ✅",
          intensity: 'normal'
        });
      }, 500);
      return;
    }
    
    // Production mode: call API
    try {
      const response = await fetch(`/api/growth-opportunities/${opportunityId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: 'User declined opportunity' 
        })
      });
      
      if (!response.ok) throw new Error('Failed to reject opportunity');
      
      // Close modal and refresh
      setShowDetailModal(false);
      await fetchOpportunities();
      
      triggerCelebration(CelebrationType.TASK_COMPLETE, {
        message: "Opportunity reviewed ✅",
        intensity: 'normal'
      });
      
    } catch (error) {
      console.error('Error rejecting opportunity:', error);
    }
  };

  const parseWeeks = (timeframe) => {
    if (!timeframe || typeof timeframe !== 'string') return null;
    const match = timeframe.match(/(\d+)(?:\s*-\s*(\d+))?\s*weeks?/i);
    if (!match) return null;
    const minW = parseInt(match[1], 10);
    const maxW = match[2] ? parseInt(match[2], 10) : minW;
    return { min: minW, max: maxW };
  };

  const parseCurrencyNumber = (text) => {
    if (!text || typeof text !== 'string') return null;
    const digits = text.replace(/[^0-9.]/g, '');
    const num = parseFloat(digits || '');
    return Number.isFinite(num) ? num : null;
  };

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesStatus = filterStatus === 'all' || opp.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || opp.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || opp.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Respect Settings: confidence tolerance
    const tolerance = settings?.agents?.confidenceTolerance ?? 0.0;
    const meetsConfidence = typeof opp.confidence_score === 'number' ? (opp.confidence_score >= tolerance) : true;

    // Respect Settings: growth horizon preference via timeframe
    const horizon = settings?.customization?.growthHorizon || 'short_term';
    const weeks = parseWeeks(opp.timeframe);
    let meetsHorizon = true;
    if (weeks) {
      if (horizon === 'short_term') {
        meetsHorizon = weeks.min <= 4; // 4 weeks or less
      } else if (horizon === 'long_term') {
        meetsHorizon = weeks.max > 4; // more than 4 weeks
      }
    }

    // Respect Settings: minimum expected revenue threshold if parsable
    const threshold = settings?.agents?.revenueThresholdMin ?? 0;
    const expectedRevenueNum = parseCurrencyNumber(opp.expected_revenue);
    const meetsRevenue = expectedRevenueNum != null ? (expectedRevenueNum >= threshold) : true;

    return matchesStatus && matchesCategory && matchesPriority && matchesSearch && meetsConfidence && meetsHorizon && meetsRevenue;
  });

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      marketing: TrendingUp,
      sales: Target,
      product: Lightbulb,
      operations: Settings,
      financial: DollarSign
    };
    return icons[category] || Brain;
  };

  const getImpactColor = (impact) => {
    const colors = {
      high: 'text-green-600',
      medium: 'text-yellow-600',
      low: 'text-gray-600'
    };
    return colors[impact] || 'text-gray-600';
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">Growth Opportunities</h1>
              {demoMode && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full border border-purple-300">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-2">
              AI-powered growth recommendations based on your business intelligence, customer data, and market trends
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setDemoMode(!demoMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                demoMode 
                  ? 'bg-purple-500 text-white hover:bg-purple-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title="Toggle between demo data and live API"
            >
              <Eye className="w-4 h-4" />
              <span>{demoMode ? 'Exit Demo' : 'Demo Mode'}</span>
            </button>
            <button 
              onClick={() => generateNewOpportunities()}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Analysis</span>
                </>
              )}
            </button>
            <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
            <option value="product">Product</option>
            <option value="operations">Operations</option>
            <option value="financial">Financial</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading growth opportunities...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Pending Opportunities Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">New Opportunities</h2>
            {filteredOpportunities.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No new opportunities at the moment</p>
                <p className="text-sm text-gray-500">Click "Refresh Analysis" to generate new opportunities</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredOpportunities.map((opportunity, index) => {
                    const CategoryIcon = getCategoryIcon(opportunity.category);
                    
                    return (
                      <motion.div
                        key={opportunity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                        onClick={() => handleViewOpportunity(opportunity)}
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <CategoryIcon className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                                  {opportunity.title}
                                </h3>
                                <p className="text-xs text-gray-500 capitalize">
                                  {opportunity.category} • {opportunity.timeframe}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                                {opportunity.status}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(opportunity.priority)}`}>
                                {opportunity.priority}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {opportunity.description}
                          </p>

                          {/* Metrics */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Expected ROI:</span>
                              <span className="font-medium text-green-600">{opportunity.expected_roi}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Expected Revenue:</span>
                              <span className="font-medium text-green-600">{opportunity.expected_revenue}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Impact:</span>
                              <span className={`font-medium ${getImpactColor(opportunity.impact)}`}>
                                {opportunity.impact}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Confidence:</span>
                              <span className="font-medium text-blue-600">
                                {(opportunity.confidence_score * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>

                          {/* View Details Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOpportunity(opportunity);
                            }}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Accepted Opportunities Section */}
          {acceptedOpportunities.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-green-600" />
                Active Growth Initiatives
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {acceptedOpportunities.map((opportunity, index) => {
                  const CategoryIcon = getCategoryIcon(opportunity.category);
                  
                  return (
                    <motion.div
                      key={opportunity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-green-200"
                      onClick={() => handleViewOpportunity(opportunity)}
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <CategoryIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                                {opportunity.title}
                              </h3>
                              <p className="text-xs text-gray-500 capitalize">
                                {opportunity.category}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                            {opportunity.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-blue-600">In Progress</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '65%' }} />
                          </div>
                        </div>

                        {/* Expected Outcome */}
                        <div className="p-3 bg-white rounded-lg border border-green-200 mb-4">
                          <p className="text-xs text-gray-600 mb-1">Target Outcome:</p>
                          <p className="text-sm font-semibold text-green-600">{opportunity.expected_roi}</p>
                        </div>

                        {/* View Progress Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOpportunity(opportunity);
                          }}
                          className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Activity className="w-4 h-4" />
                          <span>View Progress & Analytics</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showDetailModal && selectedOpportunity && (
          <GrowthOpportunityModal
            opportunity={selectedOpportunity}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedOpportunity(null);
            }}
            onAccept={handleAcceptOpportunity}
            onReject={handleRejectOpportunity}
            isLoading={isProcessing}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWorkflowModal && workflowData && selectedOpportunity && (
          <WorkflowConfirmationModal
            workflow={workflowData}
            opportunity={selectedOpportunity}
            onConfirm={handleConfirmWorkflow}
            onCancel={() => {
              setShowWorkflowModal(false);
              setWorkflowData(null);
            }}
            isLoading={isProcessing}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAcceptedModal && selectedOpportunity && (
          <AcceptedOpportunityModal
            opportunity={selectedOpportunity}
            onClose={() => {
              setShowAcceptedModal(false);
              setSelectedOpportunity(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GrowthDashboard;

