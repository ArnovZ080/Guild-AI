import React, { useState, useEffect } from 'react';
import { motion } from '../common/AnimationWrapper';
import { Sparkles, ArrowRight, Brain, Zap, Users, Target } from 'lucide-react';
import { useCelebrations } from '../../contexts/CelebrationContext';

const EnhancedWelcomeStep = ({ onNext, modeStyles }) => {
  const { triggerTaskCompletionCelebration } = useCelebrations();
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    // Trigger welcome celebration
    triggerTaskCompletionCelebration({
      name: 'Welcome to Guild!',
      difficulty: 'easy',
      type: 'onboarding_start',
      isLinkedToMajorGoal: false,
      revenueImpact: 0
    });
  }, []);

  const features = [
    {
      icon: Brain,
      title: "Psychological Optimization",
      description: "Adapts to your working style and reduces cognitive load",
      color: "text-purple-600 bg-purple-100"
    },
    {
      icon: Zap,
      title: "Micro-Celebrations",
      description: "Dopamine-driven progress tracking keeps you motivated",
      color: "text-yellow-600 bg-yellow-100"
    },
    {
      icon: Users,
      title: "52 Specialized Agents",
      description: "Each focused on specific business functions",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: Target,
      title: "Goal-Driven Automation",
      description: "Everything works toward your specific objectives",
      color: "text-green-600 bg-green-100"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-2xl mx-auto space-y-8"
    >
      <div className="space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`w-20 h-20 bg-gradient-to-br ${modeStyles.accent} rounded-full flex items-center justify-center mx-auto shadow-lg`}
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
        
        <div className="space-y-4">
          <h1 className={`text-4xl font-bold ${modeStyles.text}`}>
            👋 Welcome to Guild
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Your AI workforce is ready to get to work. Let's set up your business profile 
            so we can create a personalized strategy that actually moves the needle.
          </p>
        </div>
      </div>

      {/* Enhanced features preview */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 space-y-4 border border-white/40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">What makes Guild different:</h2>
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showFeatures ? 'Hide details' : 'Show details'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Your business & goals</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Target audience & messaging</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Tools & integrations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Your AI workforce setup</span>
          </div>
        </div>

        <AnimatePresence>
          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-4 border-t border-gray-200"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${feature.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-900 text-sm">{feature.title}</h3>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.button
        onClick={onNext}
        className={`bg-gradient-to-r ${modeStyles.accent} text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <span>Let's Get Started</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      <motion.p 
        className="text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Takes about 5-7 minutes • You can always update your answers later
      </motion.p>
    </motion.div>
  );
};

export default EnhancedWelcomeStep;
