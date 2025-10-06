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
  currentDate
}) => {
  // Collapsible card states
  const [expandedCards, setExpandedCards] = useState({
    upcoming: true,
    timeUse: true,
    aiInsights: true,
    wellbeing: true,
    agents: true,
    predictive: true
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
      />

      {/* AI Insights */}
      <AIInsightsCard
        insights={aiInsights}
        isExpanded={expandedCards.aiInsights}
        onToggle={() => toggleCard('aiInsights')}
      />

      {/* Well-being Pulse */}
      <WellbeingPulseCard
        data={wellbeingData}
        isExpanded={expandedCards.wellbeing}
        onToggle={() => toggleCard('wellbeing')}
      />

      {/* Agent Coordination */}
      <AgentCoordinationCard
        agents={agentCoordination}
        isExpanded={expandedCards.agents}
        onToggle={() => toggleCard('agents')}
      />

      {/* Predictive Planner */}
      <PredictivePlannerCard
        events={events}
        currentDate={currentDate}
        isExpanded={expandedCards.predictive}
        onToggle={() => toggleCard('predictive')}
      />
    </div>
  );
};

export default CalendarRightPanel;

