import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BusinessPulse } from '../visualizations/BusinessPulse';
import { AgentActivityTheater } from '../theater/AgentActivityTheater';
import { FinancialFlowVisualization } from '../visualizations/FinancialFlowVisualization';
import { CustomerJourneyConstellation } from '../visualizations/CustomerJourneyConstellation';
import { ProgressMomentumTracker } from '../visualizations/ProgressMomentumTracker';
import EnhancedAchievementCelebration from '../celebrations/EnhancedAchievementCelebration';
import StressReductionInterface from '../psychological/StressReductionInterface';
import { usePsychologicalOptimization } from '../../contexts/PsychologicalOptimizationContext';
import { useCelebrations } from '../../contexts/CelebrationContext';
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  TrendingUp, 
  Settings,
  Zap,
  Target,
  BarChart3,
  Brain,
  Heart,
  Star
} from 'lucide-react';

interface Widget {
  id: string;
  component: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  zone: 'overview' | 'detail' | 'action';
}

export const EnhancedMainDashboard: React.FC = () => {
  const { getCurrentMode, state: psychState } = usePsychologicalOptimization();
  const { simulateCelebration } = useCelebrations();
  const [selectedZone, setSelectedZone] = useState<'overview' | 'detail' | 'action'>('overview');
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: '1', component: 'BusinessPulse', title: 'Business Pulse', size: 'medium', position: { x: 0, y: 0 }, zone: 'overview' },
    { id: '2', component: 'AgentActivityTheater', title: 'Agent Theater', size: 'large', position: { x: 1, y: 0 }, zone: 'overview' },
    { id: '3', component: 'ProgressMomentumTracker', title: 'Momentum Tracker', size: 'medium', position: { x: 2, y: 0 }, zone: 'overview' },
    { id: '4', component: 'FinancialFlowVisualization', title: 'Financial Flow', size: 'large', position: { x: 0, y: 1 }, zone: 'detail' },
    { id: '5', component: 'CustomerJourneyConstellation', title: 'Customer Constellation', size: 'large', position: { x: 1, y: 1 }, zone: 'detail' },
    { id: '6', component: 'StressReductionInterface', title: 'Wellness Monitor', size: 'medium', position: { x: 2, y: 1 }, zone: 'action' },
  ]);

  const currentMode = getCurrentMode();

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          text: 'text-sky-dusk',
          accent: 'sky-dawn',
          card: 'bg-white/90 backdrop-blur-sm'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          text: 'text-forest-deep',
          accent: 'forest-growth',
          card: 'bg-white/95 backdrop-blur-sm'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          text: 'text-earth-sand',
          accent: 'earth-warm',
          card: 'bg-white/85 backdrop-blur-sm'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          text: 'text-forest-deep',
          accent: 'forest-growth',
          card: 'bg-white/95 backdrop-blur-sm'
        };
    }
  };

  const modeStyles = getModeStyles();

  const renderWidget = (widget: Widget) => {
    const components = {
      BusinessPulse: <BusinessPulse />,
      AgentActivityTheater: <AgentActivityTheater />,
      FinancialFlowVisualization: <FinancialFlowVisualization />,
      CustomerJourneyConstellation: <CustomerJourneyConstellation />,
      ProgressMomentumTracker: <ProgressMomentumTracker />,
      EnhancedAchievementCelebration: <EnhancedAchievementCelebration />,
      StressReductionInterface: <StressReductionInterface />,
    };

    return components[widget.component as keyof typeof components] || <div>Widget not found</div>;
  };

  const getWidgetSize = (size: string) => {
    const sizes = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-2 row-span-1',
      large: 'col-span-3 row-span-2'
    };
    return sizes[size as keyof typeof sizes];
  };

  const getZoneInfo = (zone: string) => {
    const zones = {
      overview: {
        title: 'Command Center',
        description: 'High-level business overview and agent activity',
        icon: <LayoutDashboard className="w-6 h-6" />,
        color: 'blue'
      },
      detail: {
        title: 'Action Theater',
        description: 'Detailed analytics and performance tracking',
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'green'
      },
      action: {
        title: 'Opportunity Horizon',
        description: 'Quick actions and wellness management',
        icon: <Zap className="w-6 h-6" />,
        color: 'purple'
      }
    };
    return zones[zone as keyof typeof zones];
  };

  const getCurrentZoneWidgets = () => {
    return widgets.filter(widget => widget.zone === selectedZone);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${modeStyles.background}`}>
      {/* Enhanced Header */}
      <header className={`${modeStyles.card} shadow-sm border-b border-gray-200 px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${getZoneInfo(selectedZone).color}-100`}>
                {getZoneInfo(selectedZone).icon}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${modeStyles.text}`}>
                  Guild AI Dashboard
                </h1>
                <p className="text-gray-600">{getZoneInfo(selectedZone).description}</p>
              </div>
            </div>
          </div>
          
          {/* Zone Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['overview', 'detail', 'action'].map((zone) => {
              const zoneInfo = getZoneInfo(zone);
              return (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize flex items-center space-x-2 ${
                    selectedZone === zone
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {zoneInfo.icon}
                  <span>{zoneInfo.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Psychological Context Bar */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">Mode: <span className="font-medium capitalize">{currentMode}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Momentum: <span className="font-medium">{psychState.achievementSystem.momentumScore}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-gray-700">Achievements: <span className="font-medium">{psychState.achievementSystem.unlockedAchievements.length}</span></span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => simulateCelebration('moderate')}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors"
              >
                Test Celebration
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-800 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Three-Zone Layout */}
      <main className="p-6">
        {selectedZone === 'overview' && (
          <motion.div
            className="grid grid-cols-6 gap-6 auto-rows-fr"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {getCurrentZoneWidgets().map((widget) => (
              <motion.div
                key={widget.id}
                className={`${modeStyles.card} rounded-lg shadow-lg p-6 ${getWidgetSize(widget.size)}`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${modeStyles.text}`}>{widget.title}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Live</span>
                  </div>
                </div>
                {renderWidget(widget)}
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedZone === 'detail' && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                className={`${modeStyles.card} rounded-lg shadow-lg p-6`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h3 className={`text-lg font-semibold ${modeStyles.text} mb-4`}>Financial Flow Analysis</h3>
                <FinancialFlowVisualization />
              </motion.div>
              
              <motion.div
                className={`${modeStyles.card} rounded-lg shadow-lg p-6`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h3 className={`text-lg font-semibold ${modeStyles.text} mb-4`}>Customer Journey Mapping</h3>
                <CustomerJourneyConstellation />
              </motion.div>
            </div>
            
            <motion.div
              className={`${modeStyles.card} rounded-lg shadow-lg p-6`}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <h3 className={`text-lg font-semibold ${modeStyles.text} mb-4`}>Performance Momentum Tracking</h3>
              <ProgressMomentumTracker />
            </motion.div>
          </motion.div>
        )}

        {selectedZone === 'action' && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Quick Actions */}
            <div className={`${modeStyles.card} rounded-lg shadow-lg p-6`}>
              <h3 className={`text-xl font-semibold ${modeStyles.text} mb-6`}>Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <motion.button 
                  className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className="w-6 h-6" />
                  <span>Launch Campaign</span>
                </motion.button>
                <motion.button 
                  className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BarChart3 className="w-6 h-6" />
                  <span>Generate Report</span>
                </motion.button>
                <motion.button 
                  className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Target className="w-6 h-6" />
                  <span>Set Goals</span>
                </motion.button>
                <motion.button 
                  className="p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Activity className="w-6 h-6" />
                  <span>Research Market</span>
                </motion.button>
                <motion.button 
                  className="p-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Users className="w-6 h-6" />
                  <span>Create Content</span>
                </motion.button>
                <motion.button 
                  className="p-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrendingUp className="w-6 h-6" />
                  <span>Analyze Performance</span>
                </motion.button>
              </div>
            </div>
            
            {/* Wellness and Agent Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                className={`${modeStyles.card} rounded-lg shadow-lg p-6`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h3 className={`text-lg font-semibold ${modeStyles.text} mb-4`}>Wellness Monitor</h3>
                <StressReductionInterface />
              </motion.div>
              
              <motion.div
                className={`${modeStyles.card} rounded-lg shadow-lg p-6`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <h3 className={`text-lg font-semibold ${modeStyles.text} mb-4`}>Agent Management</h3>
                <AgentActivityTheater />
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Floating Achievement System */}
      <div className="fixed bottom-4 right-4 z-50">
        <EnhancedAchievementCelebration />
      </div>

      {/* Zone Transition Indicator */}
      <motion.div
        className="fixed top-1/2 left-4 transform -translate-y-1/2 z-40"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-600 mb-2">Current Zone</div>
          <div className={`text-sm font-bold text-${getZoneInfo(selectedZone).color}-600`}>
            {getZoneInfo(selectedZone).title}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedMainDashboard;
