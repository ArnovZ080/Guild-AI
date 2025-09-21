import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Brain, Zap, Users, Target } from 'lucide-react';
import { useCelebrations } from '../../contexts/CelebrationContext';

const EnhancedWelcomeStep = ({ onNext, modeStyles }) => {
  const { triggerTaskCompletionCelebration } = useCelebrations();
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    // Trigger welcome celebration
    try {
      triggerTaskCompletionCelebration({
        name: 'Welcome to Guild!',
        difficulty: 'easy',
        type: 'onboarding_start',
        isLinkedToMajorGoal: false,
        revenueImpact: 0
      });
    } catch (error) {
      console.log('Celebration error (non-critical):', error);
    }
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
      description: "Small wins celebrated to keep you motivated",
      color: "text-yellow-600 bg-yellow-100"
    },
    {
      icon: Users,
      title: "AI Workforce",
      description: "40+ specialized agents working 24/7 for you",
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
    <div className="text-center max-w-2xl mx-auto space-y-8">
      <div className="space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">
            👋 Welcome to Guild
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Your AI workforce is ready to get to work. Let's set up your business profile 
            so we can create a personalized strategy that actually moves the needle.
          </p>
        </div>
      </div>

      {/* Enhanced features preview */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 space-y-4 border border-white/40">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">What makes Guild different:</h2>
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showFeatures ? 'Hide details' : 'Show details'}
          </button>
        </div>
        
        {showFeatures && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="p-4 rounded-lg bg-white border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${feature.color} rounded-full flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
      >
        <span>Get Started</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default EnhancedWelcomeStep;
