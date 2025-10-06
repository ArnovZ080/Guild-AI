import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, DollarSign, Users, TrendingUp, Globe } from 'lucide-react';
import { useCelebration } from './CelebrationProvider';

/**
 * Celebration Demo Component
 * 
 * Allows testing different celebration types with mock achievements
 */
const CelebrationDemo = () => {
  const { triggerCelebration } = useCelebration();
  const [isOpen, setIsOpen] = useState(false);

  const mockAchievements = [
    {
      id: 'demo-1',
      title: '1,000 Instagram Followers!',
      description: 'Successfully reached 1,000 followers on Instagram',
      category: 'social',
      metric: 'instagram_followers',
      currentValue: 1000,
      thresholdValue: 1000,
      impact: 'high',
      celebration: '🎉 Social media milestone reached!',
      achievedAt: new Date().toISOString(),
      agentFlow: [
        {
          agent: 'Social Media Agent',
          action: 'Content Strategy',
          description: 'Created engaging content calendar'
        },
        {
          agent: 'Marketing Agent',
          action: 'Campaign Launch',
          description: 'Ran targeted Instagram campaigns'
        }
      ]
    },
    {
      id: 'demo-2',
      title: '$50,000 Monthly Revenue!',
      description: 'Successfully reached $50,000 in monthly revenue',
      category: 'financial',
      metric: 'monthly_revenue',
      currentValue: 50000,
      thresholdValue: 50000,
      impact: 'high',
      celebration: '💰 Financial milestone achieved!',
      achievedAt: new Date().toISOString()
    },
    {
      id: 'demo-3',
      title: '25% Email Open Rate!',
      description: 'Achieved 25% open rate on email campaigns',
      category: 'marketing',
      metric: 'email_open_rate',
      currentValue: 25,
      thresholdValue: 25,
      impact: 'medium',
      celebration: '📧 Marketing success!',
      achievedAt: new Date().toISOString()
    },
    {
      id: 'demo-4',
      title: '100 Total Customers!',
      description: 'Reached 100 active customers',
      category: 'growth',
      metric: 'total_customers',
      currentValue: 100,
      thresholdValue: 100,
      impact: 'medium',
      celebration: '🚀 Growth milestone!',
      achievedAt: new Date().toISOString()
    },
    {
      id: 'demo-5',
      title: '1 Million Campaign Impressions!',
      description: 'Marketing campaign reached 1 million impressions',
      category: 'marketing',
      metric: 'campaign_impressions',
      currentValue: 1000000,
      thresholdValue: 1000000,
      impact: 'high',
      celebration: '📈 Campaign went viral!',
      achievedAt: new Date().toISOString()
    }
  ];

  const getIcon = (category) => {
    const icons = {
      social: Globe,
      financial: DollarSign,
      marketing: TrendingUp,
      growth: Users,
      productivity: Zap
    };
    return icons[category] || Zap;
  };

  return (
    <>
      {/* Floating Demo Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap className="w-4 h-4" />
          <span className="font-semibold">Test Celebrations</span>
        </motion.button>
      </div>

      {/* Demo Panel */}
      {isOpen && (
        <motion.div
          className="fixed bottom-24 left-6 z-50 bg-white rounded-2xl shadow-2xl p-6 w-96 max-h-[600px] overflow-y-auto"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">🎊 Celebration Demo</h3>
            <p className="text-sm text-gray-600">
              Click any achievement below to trigger a celebration!
            </p>
          </div>

          <div className="space-y-3">
            {mockAchievements.map((achievement) => {
              const Icon = getIcon(achievement.category);
              
              return (
                <button
                  key={achievement.id}
                  onClick={() => triggerCelebration(achievement)}
                  className="w-full text-left p-4 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.impact === 'high' ? 'bg-red-100 text-red-600' :
                      achievement.impact === 'medium' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {achievement.category} • {achievement.impact} impact
                      </p>
                    </div>
                    <Zap className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              These are demo achievements. Real achievements are tracked automatically.
            </p>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default CelebrationDemo;

