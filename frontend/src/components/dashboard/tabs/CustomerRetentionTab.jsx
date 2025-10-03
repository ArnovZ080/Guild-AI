import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  Activity,
  Clock,
  DollarSign,
  Star,
  Shield,
  Brain,
  Zap,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Trash2,
  Send,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Tag,
  Building,
  Globe,
  Smartphone,
  Monitor,
  Laptop,
  Bell,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UserPlus,
  UserMinus,
  User,
  Plus,
  Minus,
  Play,
  Pause,
  Settings,
  X
} from 'lucide-react';

const CustomerRetentionTab = ({ profiles, onCustomerAction }) => {
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedHealth, setSelectedHealth] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [showPlaybookModal, setShowPlaybookModal] = useState(false);
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [showAICampaignModal, setShowAICampaignModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showRetentionOutreachModal, setShowRetentionOutreachModal] = useState(false);
  const [retentionOutreachData, setRetentionOutreachData] = useState(null);
  
  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    targetSegment: '',
    campaignType: '', // 'email' or 'phone'
    retentionStrategy: ''
  });
  
  // Approval workflow state
  const [approvalData, setApprovalData] = useState(null);
  
  // Playbook state management
  const [playbooks, setPlaybooks] = useState([]);
  const [editingPlaybook, setEditingPlaybook] = useState(null);
  const [existingPlaybooksStatus, setExistingPlaybooksStatus] = useState({});
  const [playbookForm, setPlaybookForm] = useState({
    name: '',
    description: '',
    trigger: '',
    actions: [],
    targetSegment: '',
    successRate: 0,
    avgResponseTime: '',
    status: 'active'
  });

  // Retention strategies based on segment
  const getRetentionStrategies = (segment) => {
    const strategies = {
      'All at-risk customers': [
        'Send personalized re-engagement email sequence',
        'Offer exclusive discount or special promotion',
        'Schedule proactive check-in calls',
        'Provide value-added content and resources',
        'Implement win-back campaign with loyalty incentives'
      ],
      'High-value customers only': [
        'Assign dedicated customer success manager',
        'Provide VIP support and priority handling',
        'Offer exclusive early access to new features',
        'Schedule executive-level relationship calls',
        'Create personalized retention offers'
      ],
      'Inactive customers (30+ days)': [
        'Send re-engagement email series with compelling content',
        'Offer reactivation incentives and discounts',
        'Survey for feedback on why they became inactive',
        'Provide personalized onboarding refresh',
        'Implement gamification and engagement triggers'
      ],
      'Support ticket escalations': [
        'Proactive outreach to resolve outstanding issues',
        'Assign senior support specialist for quick resolution',
        'Offer compensation or goodwill gestures',
        'Implement escalation prevention measures',
        'Follow up with satisfaction surveys and improvements'
      ]
    };
    return strategies[segment] || strategies['All at-risk customers'];
  };

  // Generate retention objective text
  const generateRetentionObjective = (segment, campaignType) => {
    const objectives = {
      'All at-risk customers': `Create a comprehensive retention campaign targeting all at-risk customers to prevent churn and increase engagement through personalized outreach and value-added services.`,
      'High-value customers only': `Develop a premium retention strategy for high-value customers to strengthen relationships, increase loyalty, and maximize lifetime value through exclusive benefits and personalized attention.`,
      'Inactive customers (30+ days)': `Launch a re-engagement campaign to reactivate inactive customers who haven't interacted with the product/service in 30+ days through compelling content and attractive incentives.`,
      'Support ticket escalations': `Implement a proactive retention campaign for customers with escalated support issues to resolve concerns quickly and rebuild trust through exceptional service recovery.`
    };
    
    const baseObjective = objectives[segment] || objectives['All at-risk customers'];
    const channelSpecific = campaignType === 'email' 
      ? 'Focus on automated email sequences with personalized content and compelling calls-to-action.'
      : 'Focus on personal phone outreach with direct relationship building and immediate problem resolution.';
    
    return `${baseObjective} ${channelSpecific}`;
  };

  // Handle campaign launch
  const handleLaunchCampaign = () => {
    if (!campaignForm.name || !campaignForm.targetSegment || !campaignForm.campaignType) {
      alert('Please fill in all required fields');
      return;
    }

    const retentionStrategies = getRetentionStrategies(campaignForm.targetSegment);
    const retentionObjective = generateRetentionObjective(campaignForm.targetSegment, campaignForm.campaignType);
    
    // Set up approval data
    setApprovalData({
      title: 'Launch Retention Campaign',
      message: `Launch "${campaignForm.name}" ${campaignForm.campaignType} campaign targeting ${campaignForm.targetSegment}?`,
      action: 'launch_retention_campaign',
      data: {
        campaignName: campaignForm.name,
        targetSegment: campaignForm.targetSegment,
        campaignType: campaignForm.campaignType,
        retentionStrategies: retentionStrategies,
        retentionObjective: retentionObjective
      }
    });
    
    setShowApprovalModal(true);
    setShowRetentionModal(false);
  };

  // Handle approval
  const handleApproval = (approved) => {
    if (approved && approvalData) {
      if (approvalData.action === 'launch_retention_campaign') {
        // Open AI Campaign Modal with pre-populated data
        setShowAICampaignModal(true);
      } else if (approvalData.action === 'execute_playbook') {
        // Execute playbook with intelligent strategy
        executePlaybookWithStrategy(approvalData.data);
      } else if (approvalData.action === 'retention_outreach') {
        // Execute retention outreach
        executeRetentionOutreach(approvalData.data);
      }
    }
    setShowApprovalModal(false);
  };

  // Execute playbook with intelligent strategy
  const executePlaybookWithStrategy = (data) => {
    const { playbook, strategy, executionPlan } = data;
    
    console.log('Executing playbook with strategy:', {
      playbook: playbook.name,
      strategy: strategy.approach,
      priority: strategy.priority,
      channels: strategy.channels,
      timeline: strategy.timeline,
      executionPlan: executionPlan
    });

    // Set up success modal data
    setSuccessData({
      title: 'Playbook Executed Successfully!',
      playbook: playbook,
      strategy: strategy,
      executionPlan: executionPlan
    });
    setShowSuccessModal(true);
  };

  // Execute retention outreach
  const executeRetentionOutreach = (data) => {
    const { customer, recommendation } = data;
    
    console.log('Executing retention outreach:', {
      customer: customer.name,
      action: recommendation.action,
      priority: recommendation.priority,
      strategy: recommendation.strategy,
      timeline: recommendation.timeline
    });

    // Set up success modal data
    setSuccessData({
      title: 'Retention Outreach Executed Successfully!',
      customer: customer,
      recommendation: recommendation
    });
    setShowSuccessModal(true);
  };

  // Enhanced trigger options for retention playbooks
  const triggerOptions = [
    'No activity for 30+ days',
    'Health score below 60',
    'LTV above $10,000',
    'Support ticket unresolved for 48+ hours',
    'Login frequency decreased by 50%',
    'Payment failed or subscription expired',
    'Negative sentiment detected in feedback',
    'Feature usage dropped below threshold',
    'Customer support escalation',
    'Competitor mention detected',
    'Price sensitivity indicators',
    'Onboarding incomplete after 7 days',
    'Email engagement below 20%',
    'Social media complaint or negative review',
    'Contract renewal date approaching (30 days)',
    'High-value customer inactive for 14+ days',
    'Multiple failed login attempts',
    'Feature adoption rate below 30%',
    'Customer success score declining',
    'Churn risk score above 80%'
  ];

  // Smart playbook suggestions based on customer data
  const getSmartPlaybookSuggestions = () => {
    const suggestions = [];
    
    // Analyze current customer data to generate suggestions
    const atRiskCustomers = profiles.filter(p => p.churn_risk === 'high' || p.churn_risk === 'critical');
    const inactiveCustomers = profiles.filter(p => {
      const daysSinceActivity = Math.floor((Date.now() - new Date(p.last_activity).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceActivity > 30;
    });
    const highValueCustomers = profiles.filter(p => p.lifetime_value > 10000);
    const lowEngagementCustomers = profiles.filter(p => p.engagement_score < 50);

    if (atRiskCustomers.length > 5) {
      suggestions.push({
        name: 'High-Risk Customer Intervention',
        description: 'Automated intervention for customers with high churn risk',
        trigger: 'Churn risk score above 80%',
        actions: [
          'Send personalized retention email',
          'Schedule follow-up call',
          'Offer retention discount',
          'Assign dedicated success manager',
          'Provide priority support'
        ],
        targetSegment: 'High-risk customers',
        successRate: 75,
        avgResponseTime: '1.2 days'
      });
    }

    if (inactiveCustomers.length > 3) {
      suggestions.push({
        name: 'Inactive Customer Re-engagement',
        description: 'Win-back campaign for customers with no recent activity',
        trigger: 'No activity for 30+ days',
        actions: [
          'Send personalized retention email',
          'Offer retention discount',
          'Send survey for feedback',
          'Provide value-added content',
          'Schedule follow-up call'
        ],
        targetSegment: 'Inactive customers',
        successRate: 68,
        avgResponseTime: '2.5 days'
      });
    }

    if (highValueCustomers.length > 2) {
      suggestions.push({
        name: 'VIP Customer Retention',
        description: 'Premium retention strategy for high-value customers',
        trigger: 'LTV above $10,000',
        actions: [
          'Assign dedicated success manager',
          'Offer exclusive benefits',
          'Schedule follow-up call',
          'Provide priority support',
          'Send personalized retention email'
        ],
        targetSegment: 'High-value customers',
        successRate: 92,
        avgResponseTime: '0.8 days'
      });
    }

    if (lowEngagementCustomers.length > 8) {
      suggestions.push({
        name: 'Engagement Recovery',
        description: 'Boost engagement for low-activity customers',
        trigger: 'Login frequency decreased by 50%',
        actions: [
          'Send personalized retention email',
          'Provide value-added content',
          'Offer exclusive benefits',
          'Schedule product demo',
          'Schedule follow-up call'
        ],
        targetSegment: 'Low engagement customers',
        successRate: 72,
        avgResponseTime: '3.1 days'
      });
    }

    return suggestions;
  };

  // Handle playbook creation/update
  const handlePlaybookSubmit = () => {
    if (!playbookForm.name || !playbookForm.description || !playbookForm.trigger) {
      alert('Please fill in all required fields');
      return;
    }

    const newPlaybook = {
      id: editingPlaybook ? editingPlaybook.id : `playbook_${Date.now()}`,
      ...playbookForm,
      actions: playbookForm.actions.length > 0 ? playbookForm.actions : [
        'Send personalized retention email',
        'Schedule follow-up call',
        'Offer retention discount',
        'Monitor engagement closely'
      ]
    };

    if (editingPlaybook) {
      // Update existing playbook
      setPlaybooks(prev => prev.map(p => p.id === editingPlaybook.id ? newPlaybook : p));
      setEditingPlaybook(null);
    } else {
      // Add new playbook
      setPlaybooks(prev => [...prev, newPlaybook]);
    }

    // Reset form and close modal
    setPlaybookForm({
      name: '',
      description: '',
      trigger: '',
      actions: [],
      targetSegment: '',
      successRate: 0,
      avgResponseTime: '',
      status: 'active'
    });
    setShowPlaybookModal(false);
  };

  // Handle playbook edit
  const handleEditPlaybook = (playbook) => {
    setEditingPlaybook(playbook);
    setPlaybookForm({
      name: playbook.name,
      description: playbook.description,
      trigger: playbook.trigger,
      actions: playbook.actions || [],
      targetSegment: playbook.targetSegment || '',
      successRate: playbook.successRate || 0,
      avgResponseTime: playbook.avgResponseTime || '',
      status: playbook.status || 'active'
    });
    setShowPlaybookModal(true);
  };

  // Handle playbook execution
  const handleExecutePlaybook = (playbook) => {
    // Generate intelligent strategy based on trigger
    const strategy = generateExecutionStrategy(playbook);
    
    // Set up approval for execution
    setApprovalData({
      title: 'Execute Retention Playbook',
      message: `Execute "${playbook.name}" playbook with optimized strategy?`,
      action: 'execute_playbook',
      data: {
        playbook: playbook,
        strategy: strategy,
        executionPlan: generateExecutionPlan(playbook, strategy)
      }
    });
    
    setShowApprovalModal(true);
  };

  // Generate execution strategy based on playbook trigger
  const generateExecutionStrategy = (playbook) => {
    const triggerStrategies = {
      'No activity for 30+ days': {
        approach: 'Re-engagement Focus',
        priority: 'High',
        channels: ['Email', 'Phone'],
        timeline: 'Immediate',
        tactics: [
          'Send personalized re-engagement email',
          'Offer exclusive reactivation discount',
          'Schedule personal check-in call',
          'Provide value-added content'
        ]
      },
      'Health score below 60': {
        approach: 'Proactive Intervention',
        priority: 'Critical',
        channels: ['Phone', 'Email', 'In-app'],
        timeline: 'Within 2 hours',
        tactics: [
          'Immediate phone outreach',
          'Escalate to senior success manager',
          'Offer retention incentives',
          'Provide priority support'
        ]
      },
      'LTV above $10,000': {
        approach: 'VIP Treatment',
        priority: 'Premium',
        channels: ['Phone', 'Email', 'Executive'],
        timeline: 'Within 1 hour',
        tactics: [
          'Executive-level outreach',
          'Dedicated success manager assignment',
          'Exclusive benefits offer',
          'Personal relationship building'
        ]
      }
    };

    return triggerStrategies[playbook.trigger] || {
      approach: 'Standard Retention',
      priority: 'Medium',
      channels: ['Email'],
      timeline: 'Within 24 hours',
      tactics: playbook.actions || ['Send retention email', 'Schedule follow-up']
    };
  };

  // Generate detailed execution plan
  const generateExecutionPlan = (playbook, strategy) => {
    return {
      phase1: {
        name: 'Immediate Response',
        duration: '0-2 hours',
        actions: strategy.tactics.slice(0, 2),
        expectedOutcome: 'Initial customer contact established'
      },
      phase2: {
        name: 'Follow-up Engagement',
        duration: '2-24 hours',
        actions: strategy.tactics.slice(2, 4),
        expectedOutcome: 'Customer engagement increased'
      },
      phase3: {
        name: 'Retention Monitoring',
        duration: '1-7 days',
        actions: ['Monitor engagement metrics', 'Track retention indicators', 'Adjust strategy if needed'],
        expectedOutcome: 'Retention goal achieved'
      }
    };
  };

  // Handle play/pause toggle
  const handlePlayPauseToggle = (playbook) => {
    const currentStatus = existingPlaybooksStatus[playbook.id] || playbook.status;
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    // Check if it's a user-created playbook
    const isUserPlaybook = playbooks.some(p => p.id === playbook.id);
    
    if (isUserPlaybook) {
      setPlaybooks(prev => prev.map(p => 
        p.id === playbook.id ? { ...p, status: newStatus } : p
      ));
    } else {
      // Update existing playbook status
      setExistingPlaybooksStatus(prev => ({
        ...prev,
        [playbook.id]: newStatus
      }));
    }
  };

  // AI-powered playbook creation
  const generateAIPlaybook = (trigger) => {
    const aiPlaybookTemplates = {
      'No activity for 30+ days': {
        name: 'AI-Generated Re-engagement Campaign',
        description: 'Automated win-back strategy for inactive customers using personalized outreach and value-added incentives.',
        actions: [
          'Send personalized retention email',
          'Schedule follow-up call',
          'Offer retention discount',
          'Provide value-added content',
          'Send survey for feedback',
          'Offer exclusive benefits'
        ],
        targetSegment: 'Inactive customers',
        successRate: 72,
        avgResponseTime: '2.5 days'
      },
      'Health score below 60': {
        name: 'AI-Generated Health Recovery Plan',
        description: 'Proactive intervention strategy for at-risk customers with declining health scores.',
        actions: [
          'Schedule follow-up call',
          'Escalate to senior team',
          'Offer retention discount',
          'Provide priority support',
          'Assign dedicated success manager',
          'Send survey for feedback'
        ],
        targetSegment: 'At-risk customers',
        successRate: 78,
        avgResponseTime: '1.8 days'
      },
      'LTV above $10,000': {
        name: 'AI-Generated VIP Retention Program',
        description: 'Premium retention strategy for high-value customers with executive-level attention.',
        actions: [
          'Assign dedicated success manager',
          'Schedule follow-up call',
          'Offer exclusive benefits',
          'Provide priority support',
          'Send personalized retention email',
          'Schedule product demo'
        ],
        targetSegment: 'High-value customers',
        successRate: 92,
        avgResponseTime: '0.8 days'
      },
      'Support ticket unresolved for 48+ hours': {
        name: 'AI-Generated Support Recovery Campaign',
        description: 'Proactive outreach strategy for customers with unresolved support issues.',
        actions: [
          'Escalate to senior team',
          'Provide priority support',
          'Schedule follow-up call',
          'Send survey for feedback',
          'Assign dedicated success manager',
          'Send personalized retention email'
        ],
        targetSegment: 'Support escalation customers',
        successRate: 85,
        avgResponseTime: '1.2 days'
      },
      'Churn risk score above 80%': {
        name: 'AI-Generated Churn Prevention Protocol',
        description: 'Critical intervention strategy for customers at highest risk of churning.',
        actions: [
          'Schedule follow-up call',
          'Offer retention discount',
          'Assign dedicated success manager',
          'Provide priority support',
          'Send personalized retention email',
          'Offer exclusive benefits'
        ],
        targetSegment: 'Critical churn risk customers',
        successRate: 68,
        avgResponseTime: '0.5 days'
      }
    };

    // Get AI template or generate default
    const template = aiPlaybookTemplates[trigger] || {
      name: `AI-Generated ${trigger.replace(/for|above|below/g, '').trim()} Response`,
      description: `Intelligent automation strategy for ${trigger.toLowerCase()} using data-driven retention tactics.`,
      actions: [
        'Send personalized retention email',
        'Schedule follow-up call',
        'Offer retention discount',
        'Provide value-added content',
        'Send survey for feedback',
        'Offer exclusive benefits'
      ],
      targetSegment: 'Targeted customers',
      successRate: 75,
      avgResponseTime: '2.0 days'
    };

    return template;
  };

  // Handle AI playbook creation
  const handleAICreatePlaybook = () => {
    if (!playbookForm.trigger) {
      alert('Please select a trigger condition first');
      return;
    }

    const aiPlaybook = generateAIPlaybook(playbookForm.trigger);
    
    setPlaybookForm(prev => ({
      ...prev,
      name: aiPlaybook.name,
      description: aiPlaybook.description,
      actions: aiPlaybook.actions,
      targetSegment: aiPlaybook.targetSegment,
      successRate: aiPlaybook.successRate,
      avgResponseTime: aiPlaybook.avgResponseTime
    }));
  };

  // Generate smart retention recommendation based on customer data
  const generateSmartRetentionRecommendation = (customer) => {
    const recommendations = [];
    
    // Analyze customer data to generate smart recommendations
    if (customer.churn_risk === 'critical' || customer.churn_risk === 'high') {
      recommendations.push({
        action: 'Send urgent retention email',
        priority: 'Critical',
        reason: 'High churn risk detected',
        strategy: 'Immediate intervention with personalized retention offer',
        expectedOutcome: 'Prevent customer churn with 85% success rate',
        timeline: 'Within 2 hours',
        channels: ['Email', 'Phone'],
        tactics: [
          'Send personalized retention email with exclusive discount',
          'Schedule urgent follow-up call',
          'Offer priority support access',
          'Provide personalized success manager assignment'
        ]
      });
    }
    
    if (customer.engagement_score < 50) {
      recommendations.push({
        action: 'Send re-engagement email sequence',
        priority: 'High',
        reason: 'Low engagement score detected',
        strategy: 'Re-engagement campaign with value-added content',
        expectedOutcome: 'Increase engagement by 40% within 2 weeks',
        timeline: 'Within 24 hours',
        channels: ['Email'],
        tactics: [
          'Send personalized re-engagement email',
          'Provide valuable content and resources',
          'Offer gamification incentives',
          'Schedule product demo'
        ]
      });
    }
    
    if (customer.lifetime_value > 10000) {
      recommendations.push({
        action: 'VIP retention outreach',
        priority: 'Premium',
        reason: 'High-value customer requiring special attention',
        strategy: 'Executive-level retention with premium benefits',
        expectedOutcome: 'Maintain customer satisfaction with 95% success rate',
        timeline: 'Within 1 hour',
        channels: ['Phone', 'Email'],
        tactics: [
          'Executive-level personal call',
          'Offer exclusive benefits and early access',
          'Assign dedicated VIP success manager',
          'Provide premium support tier'
        ]
      });
    }
    
    if (customer.health_score < 60) {
      recommendations.push({
        action: 'Health recovery intervention',
        priority: 'High',
        reason: 'Declining health score requires attention',
        strategy: 'Proactive health recovery with personalized support',
        expectedOutcome: 'Improve health score by 25 points within 1 month',
        timeline: 'Within 4 hours',
        channels: ['Phone', 'Email', 'In-app'],
        tactics: [
          'Schedule health assessment call',
          'Provide onboarding refresh and training',
          'Offer personalized success coaching',
          'Implement proactive monitoring'
        ]
      });
    }
    
    // Default recommendation if no specific triggers
    if (recommendations.length === 0) {
      recommendations.push({
        action: 'Send personalized retention email',
        priority: 'Medium',
        reason: 'Proactive retention outreach',
        strategy: 'Standard retention with personalized messaging',
        expectedOutcome: 'Maintain customer satisfaction and prevent churn',
        timeline: 'Within 48 hours',
        channels: ['Email'],
        tactics: [
          'Send personalized retention email',
          'Schedule follow-up call',
          'Provide value-added content',
          'Monitor engagement metrics'
        ]
      });
    }
    
    // Return the highest priority recommendation
    return recommendations.sort((a, b) => {
      const priorityOrder = { 'Critical': 4, 'Premium': 3, 'High': 2, 'Medium': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })[0];
  };

  // Handle retention outreach
  const handleRetentionOutreach = (customer) => {
    const recommendation = generateSmartRetentionRecommendation(customer);
    
    setRetentionOutreachData({
      customer: customer,
      recommendation: recommendation
    });
    
    setShowRetentionOutreachModal(true);
  };

  // Determine priority level for customer cards
  const getCustomerPriority = (customer) => {
    if (customer.churn_risk === 'critical' || customer.churn_risk === 'high') {
      return { level: 'Critical', color: 'bg-red-100 text-red-800', icon: '🔴' };
    }
    if (customer.lifetime_value > 10000) {
      return { level: 'Premium', color: 'bg-purple-100 text-purple-800', icon: '💎' };
    }
    if (customer.health_score < 60) {
      return { level: 'High', color: 'bg-orange-100 text-orange-800', icon: '⚠️' };
    }
    if (customer.engagement_score < 50) {
      return { level: 'High', color: 'bg-orange-100 text-orange-800', icon: '📉' };
    }
    return { level: 'Medium', color: 'bg-blue-100 text-blue-800', icon: 'ℹ️' };
  };

  // Mock retention data
  const retentionData = {
    overallRetention: 85.2,
    churnRate: 14.8,
    healthScoreDistribution: {
      excellent: 45,
      good: 35,
      warning: 15,
      critical: 5
    },
    churnRiskCustomers: profiles.filter((_, index) => index < 8).map((profile, index) => ({
      ...profile,
      churnRisk: ['low', 'medium', 'high', 'critical'][index % 4],
      healthScore: 85 - (index * 10),
      lastActivity: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
      riskFactors: [
        'No activity in 30 days',
        'Support ticket unresolved',
        'Price sensitivity detected',
        'Competitor mention'
      ][index % 4],
      recommendedActions: [
        'Send re-engagement email',
        'Schedule check-in call',
        'Offer discount',
        'Escalate to retention team'
      ][index % 4]
    }))
  };

  const retentionPlaybooks = [
    {
      id: 'playbook_001',
      name: 'Win-Back Campaign',
      description: 'Re-engage inactive customers with personalized offers',
      trigger: 'No activity for 30+ days',
      successRate: 78,
      avgResponseTime: '2.3 days',
      actions: [
        'Send personalized email sequence',
        'Offer exclusive discount',
        'Schedule follow-up call',
        'Provide value-added content'
      ],
      status: 'active'
    },
    {
      id: 'playbook_002',
      name: 'Churn Prevention',
      description: 'Proactive outreach to at-risk customers',
      trigger: 'Health score below 60',
      successRate: 85,
      avgResponseTime: '1.5 days',
      actions: [
        'Identify risk factors',
        'Personalized retention offer',
        'Assign dedicated CSM',
        'Monitor engagement closely'
      ],
      status: 'active'
    },
    {
      id: 'playbook_003',
      name: 'VIP Retention',
      description: 'Special treatment for high-value customers',
      trigger: 'LTV above $10,000',
      successRate: 92,
      avgResponseTime: '0.8 days',
      actions: [
        'Priority support access',
        'Exclusive feature previews',
        'Personal account manager',
        'Custom success metrics'
      ],
      status: 'active'
    }
  ];

  const riskLevels = [
    { id: 'all', label: 'All Risk Levels', count: retentionData.churnRiskCustomers.length },
    { id: 'low', label: 'Low Risk', count: retentionData.churnRiskCustomers.filter(c => c.churnRisk === 'low').length },
    { id: 'medium', label: 'Medium Risk', count: retentionData.churnRiskCustomers.filter(c => c.churnRisk === 'medium').length },
    { id: 'high', label: 'High Risk', count: retentionData.churnRiskCustomers.filter(c => c.churnRisk === 'high').length },
    { id: 'critical', label: 'Critical Risk', count: retentionData.churnRiskCustomers.filter(c => c.churnRisk === 'critical').length }
  ];

  const healthLevels = [
    { id: 'all', label: 'All Health Scores', count: retentionData.churnRiskCustomers.length },
    { id: 'excellent', label: 'Excellent (80+)', count: retentionData.churnRiskCustomers.filter(c => c.healthScore >= 80).length },
    { id: 'good', label: 'Good (60-79)', count: retentionData.churnRiskCustomers.filter(c => c.healthScore >= 60 && c.healthScore < 80).length },
    { id: 'warning', label: 'Warning (40-59)', count: retentionData.churnRiskCustomers.filter(c => c.healthScore >= 40 && c.healthScore < 60).length },
    { id: 'critical', label: 'Critical (<40)', count: retentionData.churnRiskCustomers.filter(c => c.healthScore < 40).length }
  ];

  // Filter customers
  const filteredCustomers = retentionData.churnRiskCustomers.filter(customer => {
    const matchesRisk = selectedRisk === 'all' || customer.churnRisk === selectedRisk;
    const matchesHealth = selectedHealth === 'all' || 
      (selectedHealth === 'excellent' && customer.healthScore >= 80) ||
      (selectedHealth === 'good' && customer.healthScore >= 60 && customer.healthScore < 80) ||
      (selectedHealth === 'warning' && customer.healthScore >= 40 && customer.healthScore < 60) ||
      (selectedHealth === 'critical' && customer.healthScore < 40);
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRisk && matchesHealth && matchesSearch;
  });

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Heart className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Customer Retention</h3>
              <p className="text-sm text-gray-600">Monitor churn risk and execute retention strategies</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRetentionModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Heart className="w-4 h-4 mr-2" />
              Launch Retention Campaign
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{retentionData.overallRetention}%</div>
            <div className="text-green-600 font-medium">Retention Rate</div>
            <div className="text-sm text-gray-600">Last 30 days</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{retentionData.churnRate}%</div>
            <div className="text-red-600 font-medium">Churn Rate</div>
            <div className="text-sm text-gray-600">Last 30 days</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{retentionData.churnRiskCustomers.length}</div>
            <div className="text-blue-600 font-medium">At Risk</div>
            <div className="text-sm text-gray-600">Customers</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{playbooks.length + retentionPlaybooks.length}</div>
            <div className="text-purple-600 font-medium">Active Playbooks</div>
            <div className="text-sm text-gray-600">Automation</div>
          </div>
        </div>

        {/* Health Score Distribution */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Health Score Distribution</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(retentionData.healthScoreDistribution).map(([level, count]) => (
              <div key={level} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count}%</div>
                <div className="text-gray-600 capitalize">{level}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Retention Playbooks */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Retention Playbooks</h4>
          <button
            onClick={() => setShowPlaybookModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Playbook
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Existing playbooks */}
          {retentionPlaybooks.map((playbook, index) => (
            <motion.div
              key={playbook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-900">{playbook.name}</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  (existingPlaybooksStatus[playbook.id] || playbook.status) === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                }`}>
                  {existingPlaybooksStatus[playbook.id] || playbook.status}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{playbook.description}</p>
              
              <div className="space-y-2 mb-4 flex-grow">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium text-green-600">{playbook.successRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg Response:</span>
                  <span className="font-medium text-blue-600">{playbook.avgResponseTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Trigger:</span>
                  <span className="font-medium text-purple-600">{playbook.trigger}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-auto">
                <button
                  onClick={() => handleExecutePlaybook(playbook)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Execute
                </button>
                <button
                  onClick={() => handleEditPlaybook(playbook)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePlayPauseToggle(playbook)}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    (existingPlaybooksStatus[playbook.id] || playbook.status) === 'active' 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {(existingPlaybooksStatus[playbook.id] || playbook.status) === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          ))}
          
          {/* New user-created playbooks */}
          {playbooks.map((playbook, index) => (
            <motion.div
              key={playbook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (retentionPlaybooks.length + index) * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-900">{playbook.name}</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  playbook.status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                }`}>
                  {playbook.status}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{playbook.description}</p>
              
              <div className="space-y-2 mb-4 flex-grow">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium text-green-600">{playbook.successRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg Response:</span>
                  <span className="font-medium text-blue-600">{playbook.avgResponseTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Trigger:</span>
                  <span className="font-medium text-purple-600">{playbook.trigger}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-auto">
                <button
                  onClick={() => handleExecutePlaybook(playbook)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Execute
                </button>
                <button
                  onClick={() => handleEditPlaybook(playbook)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePlayPauseToggle(playbook)}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    (existingPlaybooksStatus[playbook.id] || playbook.status) === 'active' 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {(existingPlaybooksStatus[playbook.id] || playbook.status) === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* At-Risk Customers */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">At-Risk Customers</h4>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {riskLevels.map(risk => (
                <option key={risk.id} value={risk.id}>
                  {risk.label} ({risk.count})
                </option>
              ))}
            </select>

            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {healthLevels.map(health => (
                <option key={health.id} value={health.id}>
                  {health.label} ({health.count})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.customer_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h5 className="text-lg font-semibold text-gray-900">{customer.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(customer.churnRisk)}`}>
                        {customer.churnRisk} risk
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(customer.healthScore)}`}>
                        Health: {customer.healthScore}
                      </span>
                      {(() => {
                        const priority = getCustomerPriority(customer);
                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${priority.color}`}>
                            <span>{priority.icon}</span>
                            <span>{priority.level}</span>
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Last activity: {formatTimestamp(customer.lastActivity)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-600">Risk Factors</div>
                      <div className="text-sm font-medium text-gray-900">{customer.riskFactors}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Recommended Action</div>
                      <div className="text-sm font-medium text-blue-600">{customer.recommendedActions}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Lifetime Value</div>
                      <div className="text-sm font-medium text-green-600">${customer.lifetime_value.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRetentionOutreach(customer)}
                      className={`px-3 py-2 text-white rounded-md transition-colors text-sm flex items-center ${
                        (() => {
                          const priority = getCustomerPriority(customer);
                          switch (priority.level) {
                            case 'Critical': return 'bg-red-600 hover:bg-red-700';
                            case 'Premium': return 'bg-purple-600 hover:bg-purple-700';
                            case 'High': return 'bg-orange-600 hover:bg-orange-700';
                            default: return 'bg-blue-600 hover:bg-blue-700';
                          }
                        })()
                      }`}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Retention Outreach
                      {(() => {
                        const priority = getCustomerPriority(customer);
                        return priority.level !== 'Medium' ? (
                          <span className="ml-1 text-xs opacity-90">({priority.level})</span>
                        ) : null;
                      })()}
                    </button>
                    <button
                      onClick={() => onCustomerAction('schedule_call', customer)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Schedule Call
                    </button>
                    <button
                      onClick={() => onCustomerAction('send_email', customer)}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Send Email
                    </button>
                    <button
                      onClick={() => onCustomerAction('view_profile', customer)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No at-risk customers found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRisk('all');
                  setSelectedHealth('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Playbook Modal */}
      {showPlaybookModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPlaybookModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Create Retention Playbook</h3>
                <button
                  onClick={() => setShowPlaybookModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Condition *</label>
                  <select 
                    value={playbookForm.trigger}
                    onChange={(e) => setPlaybookForm(prev => ({ ...prev, trigger: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select trigger condition</option>
                    {triggerOptions.map((trigger, index) => (
                      <option key={index} value={trigger}>{trigger}</option>
                    ))}
                  </select>
                </div>

                {/* AI Create Playbook Button */}
                {playbookForm.trigger && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Brain className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">AI-Powered Playbook Generation</h4>
                          <p className="text-sm text-gray-600">Let the Customer Intelligence Agent create an optimized playbook for this trigger</p>
                        </div>
                      </div>
                      <button
                        onClick={handleAICreatePlaybook}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Let AI Create Playbook
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Playbook Name *</label>
                  <input
                    type="text"
                    value={playbookForm.name}
                    onChange={(e) => setPlaybookForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Win-Back Campaign"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={playbookForm.description}
                    onChange={(e) => setPlaybookForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the playbook's purpose and goals"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {[
                      'Send personalized retention email',
                      'Schedule follow-up call',
                      'Offer retention discount',
                      'Provide value-added content',
                      'Assign dedicated success manager',
                      'Escalate to senior team',
                      'Send survey for feedback',
                      'Offer exclusive benefits',
                      'Schedule product demo',
                      'Provide priority support'
                    ].map((action, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={playbookForm.actions.includes(action)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPlaybookForm(prev => ({ ...prev, actions: [...prev.actions, action] }));
                            } else {
                              setPlaybookForm(prev => ({ ...prev, actions: prev.actions.filter(a => a !== action) }));
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPlaybookModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                    onClick={handlePlaybookSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                    {editingPlaybook ? 'Update Playbook' : 'Create Playbook'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Retention Campaign Modal */}
      {showRetentionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRetentionModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Launch Retention Campaign</h3>
                <button
                  onClick={() => setShowRetentionModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Q4 Retention Drive"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Segment</label>
                  <select 
                    value={campaignForm.targetSegment}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, targetSegment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select target segment</option>
                    <option value="All at-risk customers">All at-risk customers</option>
                    <option value="High-value customers only">High-value customers only</option>
                    <option value="Inactive customers (30+ days)">Inactive customers (30+ days)</option>
                    <option value="Support ticket escalations">Support ticket escalations</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setCampaignForm(prev => ({ ...prev, campaignType: 'email' }))}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        campaignForm.campaignType === 'email' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Email Sequence</span>
                      </div>
                      <p className="text-sm text-gray-600">Automated email campaigns</p>
                      {campaignForm.campaignType === 'email' && (
                        <div className="mt-2">
                          <CheckCircle className="w-4 h-4 text-blue-600 inline mr-1" />
                          <span className="text-xs text-blue-600 font-medium">Selected</span>
                    </div>
                      )}
                    </div>
                    <div 
                      onClick={() => setCampaignForm(prev => ({ ...prev, campaignType: 'phone' }))}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        campaignForm.campaignType === 'phone' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Phone Outreach</span>
                      </div>
                      <p className="text-sm text-gray-600">Personal calls and follow-ups</p>
                      {campaignForm.campaignType === 'phone' && (
                        <div className="mt-2">
                          <CheckCircle className="w-4 h-4 text-green-600 inline mr-1" />
                          <span className="text-xs text-green-600 font-medium">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Impact</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">15-25%</div>
                      <div className="text-blue-600 text-sm">Retention Improvement</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">$50K+</div>
                      <div className="text-green-600 text-sm">Revenue Impact</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">3-5 days</div>
                      <div className="text-purple-600 text-sm">Campaign Duration</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowRetentionModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLaunchCampaign}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Launch Campaign
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && approvalData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowApprovalModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{approvalData.title}</h3>
                  <p className="text-sm text-gray-600">Please review before proceeding</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">{approvalData.message}</p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  {approvalData.action === 'execute_playbook' ? (
                    <>
                      <h4 className="font-medium text-gray-900 mb-2">Playbook Execution Details:</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Playbook:</span> {approvalData.data.playbook.name}</div>
                        <div><span className="font-medium">Strategy:</span> {approvalData.data.strategy.approach}</div>
                        <div><span className="font-medium">Priority:</span> {approvalData.data.strategy.priority}</div>
                        <div><span className="font-medium">Timeline:</span> {approvalData.data.strategy.timeline}</div>
                        <div><span className="font-medium">Channels:</span> {approvalData.data.strategy.channels.join(', ')}</div>
                        <div><span className="font-medium">Actions:</span> {approvalData.data.strategy.tactics.length} tactics</div>
                      </div>
                    </>
                  ) : approvalData.action === 'retention_outreach' ? (
                    <>
                      <h4 className="font-medium text-gray-900 mb-2">Retention Outreach Details:</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Customer:</span> {approvalData.data.customer.name}</div>
                        <div><span className="font-medium">Action:</span> {approvalData.data.recommendation.action}</div>
                        <div><span className="font-medium">Priority:</span> {approvalData.data.recommendation.priority}</div>
                        <div><span className="font-medium">Timeline:</span> {approvalData.data.recommendation.timeline}</div>
                        <div><span className="font-medium">Channels:</span> {approvalData.data.recommendation.channels.join(', ')}</div>
                        <div><span className="font-medium">Strategy:</span> {approvalData.data.recommendation.strategy}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="font-medium text-gray-900 mb-2">Campaign Details:</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {approvalData.data.campaignName}</div>
                        <div><span className="font-medium">Target:</span> {approvalData.data.targetSegment}</div>
                        <div><span className="font-medium">Type:</span> {approvalData.data.campaignType}</div>
                        <div><span className="font-medium">Strategy:</span> {approvalData.data.retentionStrategies.length} retention tactics</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => handleApproval(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproval(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Continue
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* AI Campaign Modal */}
      {showAICampaignModal && approvalData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAICampaignModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">AI Campaign Creation</h3>
                    <p className="text-sm text-gray-600">Pre-configured for retention strategy</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAICampaignModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {/* Pre-populated Campaign Information */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Pre-configured Campaign Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Campaign Name:</span>
                      <p className="text-gray-600">{approvalData.data.campaignName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Target Segment:</span>
                      <p className="text-gray-600">{approvalData.data.targetSegment}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Campaign Type:</span>
                      <p className="text-gray-600 capitalize">{approvalData.data.campaignType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Retention Strategies:</span>
                      <p className="text-gray-600">{approvalData.data.retentionStrategies.length} tactics</p>
                    </div>
                  </div>
                </div>

                {/* What do you want to achieve? - Pre-populated */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What do you want to achieve? *</label>
                  <textarea
                    value={approvalData.data.retentionObjective}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-gray-700"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">Pre-configured based on your retention strategy</p>
                </div>

                {/* Audience - Pre-populated */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
                  <textarea
                    value={`Target Segment: ${approvalData.data.targetSegment}\n\nCampaign Focus: ${approvalData.data.campaignType === 'email' ? 'Email-based retention sequence' : 'Phone-based retention outreach'}\n\nRetention Strategies:\n${approvalData.data.retentionStrategies.map(strategy => `• ${strategy}`).join('\n')}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-green-50 text-gray-700"
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Automatically configured for your selected segment</p>
                </div>

                {/* Segment or Tag - Pre-populated */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Segment or Tag (optional)</label>
                  <input
                    type="text"
                    value={approvalData.data.targetSegment}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-purple-50 text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pre-configured with your selected target segment</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">Ready to Launch</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    This campaign has been pre-configured with retention-specific strategies. 
                    Click "Create Campaign" to launch with the Customer Intelligence Agent.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span>Powered by Customer Intelligence Agent</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowAICampaignModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                      console.log('Creating AI campaign with retention data:', approvalData.data);
                      setShowAICampaignModal(false);
                      // Here you would trigger the actual AI campaign creation
                      alert('Campaign created successfully! The Customer Intelligence Agent will now execute the retention strategy.');
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Create Campaign
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{successData.title}</h3>
                    <p className="text-sm text-gray-600">Customer Intelligence Agent is now executing the retention strategy</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Execution Details */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    {successData.playbook ? 'Executed Playbook Details' : 'Retention Outreach Details'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {successData.playbook ? (
                      <>
                        <div>
                          <span className="font-medium text-gray-700">Playbook:</span>
                          <p className="text-gray-600">{successData.playbook.name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Strategy:</span>
                          <p className="text-gray-600">{successData.strategy.approach}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Priority:</span>
                          <p className="text-gray-600">{successData.strategy.priority}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Timeline:</span>
                          <p className="text-gray-600">{successData.strategy.timeline}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium text-gray-700">Customer:</span>
                          <p className="text-gray-600">{successData.customer.name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Action:</span>
                          <p className="text-gray-600">{successData.recommendation.action}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Priority:</span>
                          <p className="text-gray-600">{successData.recommendation.priority}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Timeline:</span>
                          <p className="text-gray-600">{successData.recommendation.timeline}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Execution Plan */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-600" />
                    Execution Plan
                  </h4>
                  <div className="space-y-3">
                    {successData.playbook ? (
                      // Playbook execution plan
                      <>
                        <div className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{successData.executionPlan.phase1.name}</h5>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{successData.executionPlan.phase1.duration}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{successData.executionPlan.phase1.expectedOutcome}</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            {successData.executionPlan.phase1.actions.map((action, index) => (
                              <li key={index}>• {action}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{successData.executionPlan.phase2.name}</h5>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{successData.executionPlan.phase2.duration}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{successData.executionPlan.phase2.expectedOutcome}</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            {successData.executionPlan.phase2.actions.map((action, index) => (
                              <li key={index}>• {action}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{successData.executionPlan.phase3.name}</h5>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{successData.executionPlan.phase3.duration}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{successData.executionPlan.phase3.expectedOutcome}</p>
                          <ul className="text-xs text-gray-500 space-y-1">
                            {successData.executionPlan.phase3.actions.map((action, index) => (
                              <li key={index}>• {action}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      // Retention outreach execution plan
                      <div className="space-y-3">
                        {successData.recommendation.tactics.map((tactic, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <p className="text-sm text-gray-700">{tactic}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">What happens next?</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    The Customer Intelligence Agent will now monitor customer behavior and automatically execute the retention strategy when the trigger conditions are met. You can track progress in the Retention Analytics dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Brain className="w-4 h-4 text-green-600" />
                  <span>Powered by Customer Intelligence Agent</span>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Got it!
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Retention Outreach Modal */}
      {showRetentionOutreachModal && retentionOutreachData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRetentionOutreachModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Retention Outreach</h3>
                    <p className="text-sm text-gray-600">AI-powered retention strategy for {retentionOutreachData.customer.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRetentionOutreachModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Customer Details */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-red-600" />
                    Customer Profile
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Customer:</span>
                      <p className="text-gray-600">{retentionOutreachData.customer.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Health Score:</span>
                      <p className="text-gray-600">{retentionOutreachData.customer.health_score}/100</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Churn Risk:</span>
                      <p className="text-gray-600 capitalize">{retentionOutreachData.customer.churn_risk}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Lifetime Value:</span>
                      <p className="text-gray-600">${retentionOutreachData.customer.lifetime_value.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-600" />
                    AI-Generated Recommendation
                  </h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-gray-900">{retentionOutreachData.recommendation.action}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        retentionOutreachData.recommendation.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                        retentionOutreachData.recommendation.priority === 'Premium' ? 'bg-purple-100 text-purple-800' :
                        retentionOutreachData.recommendation.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {retentionOutreachData.recommendation.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{retentionOutreachData.recommendation.strategy}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Reason:</span>
                        <p className="text-gray-600">{retentionOutreachData.recommendation.reason}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Timeline:</span>
                        <p className="text-gray-600">{retentionOutreachData.recommendation.timeline}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Expected Outcome:</span>
                        <p className="text-gray-600">{retentionOutreachData.recommendation.expectedOutcome}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Channels:</span>
                        <p className="text-gray-600">{retentionOutreachData.recommendation.channels.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Execution Plan */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-600" />
                    Execution Plan
                  </h4>
                  <div className="space-y-3">
                    {retentionOutreachData.recommendation.tactics.map((tactic, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700">{tactic}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">What happens next?</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    The Customer Intelligence Agent will execute the retention strategy immediately and monitor customer response. You'll receive updates on engagement and success metrics.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span>Powered by Customer Intelligence Agent</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowRetentionOutreachModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setApprovalData({
                        title: 'Execute Retention Outreach',
                        message: `Execute "${retentionOutreachData.recommendation.action}" for ${retentionOutreachData.customer.name}?`,
                        action: 'retention_outreach',
                        data: retentionOutreachData
                      });
                      setShowRetentionOutreachModal(false);
                      setShowApprovalModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Heart className="w-4 h-4 mr-2" />
                    Execute Outreach
                </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CustomerRetentionTab;
