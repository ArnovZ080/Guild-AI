import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressiveDisclosure from '../ui/ProgressiveDisclosure';
import { usePsychologicalOptimization } from '../../contexts/PsychologicalOptimizationContext';

// Comprehensive agent analytics dashboard
const AgentAnalyticsDashboard = () => {
  const { state: psychState, getCurrentMode } = usePsychologicalOptimization();
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [timeRange, setTimeRange] = useState('today');
  const [analyticsData, setAnalyticsData] = useState({});

  const currentMode = getCurrentMode();

  // Mock comprehensive agent data - this will be replaced with real integration
  const mockAgentData = {
    research: {
      name: 'Dr. Insight',
      type: 'research',
      avatar: '🔬',
      color: '#3B82F6',
      summary: 'Market research and competitive analysis specialist',
      details: 'Currently analyzing competitor pricing strategies and market trends. Processing data from 15 different sources including industry reports, competitor websites, and market surveys.',
      analysis: 'Research efficiency has increased by 23% this week. The agent is successfully identifying market gaps and opportunities with 92% accuracy. Recent analysis led to identification of 3 new market segments worth exploring.',
      metrics: {
        tasksCompleted: 47,
        efficiency: 92,
        accuracy: 89,
        insightsGenerated: 23,
        dataSources: 15,
        timeSpent: '8.5h',
        successRate: 94
      },
      recentActivity: [
        'Completed competitor pricing analysis',
        'Generated market opportunity report',
        'Updated industry trend database'
      ],
      performance: {
        daily: [85, 88, 92, 89, 94, 91, 92],
        weekly: [87, 89, 91, 93, 95],
        monthly: [82, 85, 88, 92]
      }
    },
    marketing: {
      name: 'Creative Spark',
      type: 'marketing',
      avatar: '🎨',
      color: '#22C55E',
      summary: 'Creative campaign development and brand strategy specialist',
      details: 'Developing multi-channel marketing campaigns for Q4 product launch. Creating content across social media, email, and paid advertising channels with focus on customer acquisition.',
      analysis: 'Campaign performance exceeding expectations by 25%. Content engagement rates up 18% compared to last month. The agent has successfully identified the most effective messaging and visual elements.',
      metrics: {
        campaignsActive: 3,
        efficiency: 88,
        engagement: 4.2,
        reach: 12500,
        conversions: 156,
        contentPieces: 28,
        timeSpent: '12.3h',
        successRate: 91
      },
      recentActivity: [
        'Launched social media campaign',
        'Optimized email sequences',
        'Created video content series'
      ],
      performance: {
        daily: [82, 85, 88, 86, 89, 87, 88],
        weekly: [84, 86, 88, 90, 88],
        monthly: [78, 82, 85, 88]
      }
    },
    sales: {
      name: 'Deal Closer',
      type: 'sales',
      avatar: '🤝',
      color: '#F59E0B',
      summary: 'Sales pipeline management and customer relationship specialist',
      details: 'Managing high-value prospects and nurturing leads through the sales funnel. Currently focusing on enterprise clients with deal sizes over $10K.',
      analysis: 'Sales pipeline value increased by $45K this week. Conversion rate improved by 3% through better lead qualification and personalized outreach strategies.',
      metrics: {
        callsMade: 42,
        efficiency: 95,
        meetingsScheduled: 8,
        dealsClosed: 3,
        pipelineValue: 145000,
        conversionRate: 12.5,
        timeSpent: '9.8h',
        successRate: 87
      },
      recentActivity: [
        'Closed enterprise deal worth $25K',
        'Scheduled 3 product demos',
        'Updated CRM with new leads'
      ],
      performance: {
        daily: [88, 91, 93, 89, 95, 92, 95],
        weekly: [90, 92, 94, 96, 93],
        monthly: [85, 88, 91, 95]
      }
    },
    content: {
      name: 'Story Weaver',
      type: 'content',
      avatar: '✍️',
      color: '#8B5CF6',
      summary: 'Content creation and thought leadership specialist',
      details: 'Creating engaging content across multiple formats including blog posts, social media, and thought leadership pieces. Focus on establishing brand authority and driving organic traffic.',
      analysis: 'Content performance significantly improved with 156 total shares this week. Blog post about industry trends is trending with 2.3K views in 24 hours.',
      metrics: {
        articlesPublished: 4,
        efficiency: 90,
        socialPosts: 18,
        shares: 156,
        views: 2300,
        engagement: 6.8,
        timeSpent: '11.2h',
        successRate: 93
      },
      recentActivity: [
        'Published trending blog post',
        'Created LinkedIn article series',
        'Developed content calendar for next month'
      ],
      performance: {
        daily: [85, 88, 90, 87, 93, 89, 90],
        weekly: [87, 89, 91, 93, 88],
        monthly: [82, 85, 88, 90]
      }
    },
    operations: {
      name: 'Efficiency Expert',
      type: 'operations',
      avatar: '⚙️',
      color: '#6B7280',
      summary: 'Process optimization and workflow management specialist',
      details: 'Streamlining business processes and optimizing workflows for maximum efficiency. Currently focusing on automation opportunities and system integrations.',
      analysis: 'Process optimization efforts have saved 3.2 hours of manual work this week. Error rates reduced by 67% through improved automation and validation.',
      metrics: {
        processesOptimized: 5,
        efficiency: 96,
        timeSaved: '3.2h',
        errorsReduced: 67,
        automationsCreated: 3,
        systemsIntegrated: 2,
        timeSpent: '7.5h',
        successRate: 98
      },
      recentActivity: [
        'Automated lead scoring process',
        'Integrated CRM with email system',
        'Optimized customer onboarding workflow'
      ],
      performance: {
        daily: [92, 94, 96, 93, 98, 95, 96],
        weekly: [94, 95, 97, 98, 96],
        monthly: [89, 92, 95, 96]
      }
    }
  };

  useEffect(() => {
    // Simulate data loading
    setAnalyticsData(mockAgentData);
  }, []);

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          border: 'border-sky-morning/30',
          text: 'text-sky-dusk'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          border: 'border-forest-spring/30',
          text: 'text-forest-deep'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          border: 'border-earth-warm/30',
          text: 'text-earth-sand'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          border: 'border-forest-spring/30',
          text: 'text-forest-deep'
        };
    }
  };

  const modeStyles = getModeStyles();

  const getFilteredData = () => {
    if (selectedAgent === 'all') {
      return analyticsData;
    }
    return { [selectedAgent]: analyticsData[selectedAgent] };
  };

  const getOverallMetrics = () => {
    const data = Object.values(analyticsData);
    if (data.length === 0) return {};

    return {
      totalTasks: data.reduce((sum, agent) => sum + (agent.metrics.tasksCompleted || 0), 0),
      averageEfficiency: Math.round(data.reduce((sum, agent) => sum + agent.metrics.efficiency, 0) / data.length),
      totalTimeSpent: data.reduce((sum, agent) => {
        const time = parseFloat(agent.metrics.timeSpent) || 0;
        return sum + time;
      }, 0),
      totalSuccessRate: Math.round(data.reduce((sum, agent) => sum + agent.metrics.successRate, 0) / data.length)
    };
  };

  const overallMetrics = getOverallMetrics();
  const filteredData = getFilteredData();

  return (
    <motion.div
      className={`bg-gradient-to-br ${modeStyles.background} rounded-xl p-6 shadow-lg border-2 ${modeStyles.border}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${modeStyles.text}`}>
          Agent Analytics Dashboard
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-white/80 text-sm"
          >
            <option value="all">All Agents</option>
            {Object.keys(analyticsData).map(agent => (
              <option key={agent} value={agent}>
                {analyticsData[agent]?.name || agent}
              </option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-white/80 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Overall Metrics */}
      {selectedAgent === 'all' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(overallMetrics).map(([key, value]) => (
            <motion.div
              key={key}
              className="bg-white/60 rounded-lg p-4 border border-white/40"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="text-sm text-muted-foreground capitalize mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className={`text-2xl font-bold ${modeStyles.text}`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
                {key.includes('Efficiency') || key.includes('SuccessRate') ? '%' : ''}
                {key.includes('TimeSpent') ? 'h' : ''}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Agent Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {Object.entries(filteredData).map(([agentKey, agentData], index) => (
            <motion.div
              key={agentKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProgressiveDisclosure
                title={`${agentData.name} - ${agentData.type.charAt(0).toUpperCase() + agentData.type.slice(1)} Agent`}
                summary={agentData.summary}
                details={agentData.details}
                analysis={agentData.analysis}
                level={1}
                maxLevel={3}
                agentType={agentKey}
                metrics={agentData.metrics}
                onLevelChange={(level) => {
                  // Could trigger additional data loading or analytics
                  console.log(`Loading level ${level} data for ${agentKey}`);
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Performance Trends */}
      {selectedAgent !== 'all' && analyticsData[selectedAgent] && (
        <motion.div
          className="mt-6 bg-white/40 rounded-lg p-4 border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className={`text-lg font-semibold ${modeStyles.text} mb-3`}>
            Performance Trends
          </h3>
          <div className="text-sm text-muted-foreground">
            {analyticsData[selectedAgent].name} performance over time shows consistent improvement
            with efficiency trending upward and success rates maintaining above 90%.
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AgentAnalyticsDashboard;
