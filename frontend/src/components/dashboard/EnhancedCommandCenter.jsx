import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePsychologicalOptimization } from '../../contexts/PsychologicalOptimizationContext';

// Enhanced Command Center with agent analytics integration
const EnhancedCommandCenter = ({ timeOfDay, userContext }) => {
  const { state: psychState, getCurrentMode } = usePsychologicalOptimization();
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const [priorityInsights, setPriorityInsights] = useState([]);
  const [contextualActions, setContextualActions] = useState([]);
  const [agentAnalytics, setAgentAnalytics] = useState({});

  const currentMode = getCurrentMode();

  // Mock agent analytics data - this will be replaced with real agent data integration
  const mockAgentAnalytics = {
    research: {
      activeTasks: 3,
      completedToday: 7,
      efficiency: 92,
      insights: ['Market trend analysis complete', 'Competitor research updated'],
      metrics: { leadsGenerated: 15, researchDepth: 85 }
    },
    marketing: {
      activeTasks: 5,
      completedToday: 12,
      efficiency: 88,
      insights: ['Campaign performance +23%', 'Content engagement up'],
      metrics: { campaignsActive: 3, reach: 12500, engagement: 4.2 }
    },
    sales: {
      activeTasks: 2,
      completedToday: 8,
      efficiency: 95,
      insights: ['Pipeline value: $45K', '3 hot prospects identified'],
      metrics: { callsMade: 12, meetingsScheduled: 4, dealsClosed: 1 }
    },
    content: {
      activeTasks: 4,
      completedToday: 6,
      efficiency: 90,
      insights: ['Blog post trending', 'Social content performing well'],
      metrics: { articlesPublished: 2, socialPosts: 8, shares: 156 }
    },
    operations: {
      activeTasks: 1,
      completedToday: 4,
      efficiency: 96,
      insights: ['Process optimization complete', 'System efficiency improved'],
      metrics: { processesOptimized: 2, timeSaved: '3.2h', errorsReduced: 67 }
    }
  };

  const generateExecutiveSummary = (context) => {
    const summaries = {
      morning: {
        title: "Today's Strategic Focus",
        insights: [
          "Revenue tracking 12% above monthly target",
          "3 high-priority leads require immediate attention", 
          "Content calendar has 2 gaps this week"
        ],
        mood: "energizing",
        primaryAction: "Review priority leads"
      },
      active: {
        title: "Current Business Pulse",
        insights: [
          "Marketing campaign performing 25% above expectations",
          "Sales pipeline shows strong momentum",
          "Customer satisfaction trending upward"
        ],
        mood: "focused",
        primaryAction: "Optimize high-performing campaigns"
      },
      evening: {
        title: "Today's Accomplishments",
        insights: [
          "Completed 8 of 10 planned activities",
          "Generated 15 new qualified leads", 
          "Improved conversion rate by 3%"
        ],
        mood: "reflective",
        primaryAction: "Plan tomorrow's priorities"
      }
    };

    return summaries[currentMode] || summaries.morning;
  };

  const generatePriorityInsights = () => {
    const allInsights = [];
    Object.entries(mockAgentAnalytics).forEach(([agentType, data]) => {
      data.insights.forEach(insight => {
        allInsights.push({
          id: `${agentType}-${Date.now()}-${Math.random()}`,
          agent: agentType,
          insight,
          priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          timestamp: new Date()
        });
      });
    });

    // Sort by priority and return top insights
    return allInsights
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5);
  };

  const generateContextualActions = (summary) => {
    const actions = [
      { 
        title: summary.primaryAction, 
        urgency: 'high', 
        impact: 'revenue',
        timeEstimate: '15 min',
        agent: 'sales'
      },
      { 
        title: 'Review agent recommendations', 
        urgency: 'medium', 
        impact: 'efficiency',
        timeEstimate: '10 min',
        agent: 'operations'
      },
      { 
        title: 'Check market opportunities', 
        urgency: 'low', 
        impact: 'growth',
        timeEstimate: '20 min',
        agent: 'research'
      }
    ];

    return actions;
  };

  useEffect(() => {
    const summary = generateExecutiveSummary(userContext);
    setExecutiveSummary(summary);
    
    const insights = generatePriorityInsights();
    setPriorityInsights(insights);
    
    const actions = generateContextualActions(summary);
    setContextualActions(actions);

    setAgentAnalytics(mockAgentAnalytics);
  }, [currentMode, userContext]);

  const getUrgencyColor = (urgency) => {
    const colors = {
      high: 'bg-warning-glow border-warning-warm text-warning-urgent',
      medium: 'bg-sky-dawn border-sky-morning text-sky-dusk',
      low: 'bg-forest-mist border-forest-spring text-forest-deep'
    };
    return colors[urgency];
  };

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          border: 'border-sky-morning/30',
          text: 'text-sky-dusk',
          accent: 'sky-dawn'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          border: 'border-forest-spring/30',
          text: 'text-forest-deep',
          accent: 'forest-growth'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          border: 'border-earth-warm/30',
          text: 'text-earth-sand',
          accent: 'earth-warm'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          border: 'border-forest-spring/30',
          text: 'text-forest-deep',
          accent: 'forest-growth'
        };
    }
  };

  const modeStyles = getModeStyles();

  return (
    <motion.div
      className={`bg-gradient-to-r ${modeStyles.background} rounded-xl p-8 shadow-lg border-2 ${modeStyles.border}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {executiveSummary && (
        <>
          <div className="flex items-center justify-between mb-6">
            <motion.h2 
              className={`text-2xl font-bold ${modeStyles.text}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {executiveSummary.title}
            </motion.h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <motion.div 
                className={`w-2 h-2 bg-${modeStyles.accent} rounded-full`}
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>Live insights</span>
            </div>
          </div>

          {/* Executive Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {executiveSummary.insights.map((insight, index) => (
              <motion.div
                key={index}
                className="bg-white/60 rounded-lg p-4 border border-white/40"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <p className="text-sm text-foreground font-medium">{insight}</p>
              </motion.div>
            ))}
          </div>

          {/* Agent Analytics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {Object.entries(agentAnalytics).map(([agentType, data], index) => (
              <motion.div
                key={agentType}
                className="bg-white/40 rounded-lg p-3 border border-white/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-xs font-medium text-foreground capitalize mb-1">
                  {agentType}
                </div>
                <div className="text-lg font-bold text-foreground">
                  {data.efficiency}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.completedToday} tasks
                </div>
              </motion.div>
            ))}
          </div>

          {/* Priority Insights from Agents */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold ${modeStyles.text} mb-3`}>
              Agent Insights
            </h3>
            <div className="space-y-2">
              {priorityInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  className={`bg-white/50 rounded-lg p-3 border-l-4 ${
                    insight.priority === 'high' ? 'border-warning-urgent' :
                    insight.priority === 'medium' ? 'border-sky-day' : 'border-forest-spring'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{insight.insight}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {insight.agent} agent
                      </p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      insight.priority === 'high' ? 'bg-warning-urgent/20 text-warning-urgent' :
                      insight.priority === 'medium' ? 'bg-sky-day/20 text-sky-dusk' : 'bg-forest-spring/20 text-forest-deep'
                    }`}>
                      {insight.priority}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contextual Actions */}
          <div className="space-y-3">
            <h3 className={`text-lg font-semibold ${modeStyles.text} mb-3`}>
              Recommended Actions
            </h3>
            {contextualActions.map((action, index) => (
              <motion.button
                key={index}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${getUrgencyColor(action.urgency)} hover:shadow-md`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs opacity-80 mt-1">
                      Impact: {action.impact} • Est. {action.timeEstimate} • {action.agent} agent
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase font-medium">
                      {action.urgency}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default EnhancedCommandCenter;
