import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UpcomingEventsCard from './UpcomingEventsCard';
import TimeUseAnalyticsCard from './TimeUseAnalyticsCard';
import AIInsightsCard from './AIInsightsCard';
import WellbeingPulseCard from './WellbeingPulseCard';
import AgentCoordinationCard from './AgentCoordinationCard';
import PredictivePlannerCard from './PredictivePlannerCard';

const CalendarRightPanel = ({
  events,
  aiInsights,
  wellbeingData,
  timeUseData,
  agentCoordination,
  currentDate,
  onShowTimeUseReport,
  onShowOptimizationRecommendations,
  onScheduleBreak,
  onToggleFocusMode,
  onSelectAgent,
  onAutoOptimize
}) => {
  // Collapsible card states - All collapsed by default
  const [expandedCards, setExpandedCards] = useState({
    upcoming: false,
    timeUse: false,
    aiInsights: false,
    wellbeing: false,
    agents: false,
    predictive: false
  });

  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Upcoming Events */}
      <UpcomingEventsCard
        events={events}
        isExpanded={expandedCards.upcoming}
        onToggle={() => toggleCard('upcoming')}
      />

      {/* Time Use Analytics */}
      <TimeUseAnalyticsCard
        data={timeUseData}
        isExpanded={expandedCards.timeUse}
        onToggle={() => toggleCard('timeUse')}
        onShowFullReport={onShowTimeUseReport}
      />

      {/* AI Insights */}
      <AIInsightsCard
        insights={aiInsights}
        isExpanded={expandedCards.aiInsights}
        onToggle={() => toggleCard('aiInsights')}
        onShowOptimizations={onShowOptimizationRecommendations}
        onShowFullReport={onShowTimeUseReport}
      />

      {/* Well-being Pulse */}
      <WellbeingPulseCard
        data={wellbeingData}
        isExpanded={expandedCards.wellbeing}
        onToggle={() => toggleCard('wellbeing')}
        onScheduleBreak={onScheduleBreak}
        onToggleFocusMode={onToggleFocusMode}
      />

      {/* Agent Coordination */}
      <AgentCoordinationCard
        agents={agentCoordination}
        isExpanded={expandedCards.agents}
        onToggle={() => toggleCard('agents')}
        onSelectAgent={onSelectAgent}
      />

      {/* Predictive Planner */}
      <PredictivePlannerCard
        events={events}
        currentDate={currentDate}
        isExpanded={expandedCards.predictive}
        onToggle={() => toggleCard('predictive')}
        onAutoOptimize={onAutoOptimize}
      />
    </div>
  );
};

export default CalendarRightPanel;

