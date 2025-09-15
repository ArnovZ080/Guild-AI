import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles, Users, Target, Zap } from 'lucide-react';

const CompletionScreen = ({ answers, onFinish }) => {
  const getFirstName = () => {
    // Try to extract first name from business description or use a default
    const businessDesc = answers.business_description || '';
    const nameMatch = businessDesc.match(/(?:I am|My name is|I'm)\s+(\w+)/i);
    return nameMatch ? nameMatch[1] : 'founder';
  };

  const getKeyInsights = () => {
    const insights = [];
    
    if (answers.business_type) {
      insights.push({
        icon: '🏢',
        title: 'Business Type',
        value: answers.business_type,
        color: 'blue'
      });
    }
    
    if (answers.priority_3months) {
      insights.push({
        icon: '🎯',
        title: 'Top Priority',
        value: answers.priority_3months,
        color: 'green'
      });
    }
    
    if (answers.guild_support_focus) {
      insights.push({
        icon: '🤖',
        title: 'Guild Focus',
        value: answers.guild_support_focus,
        color: 'purple'
      });
    }
    
    if (answers.selectedSoftware && answers.selectedSoftware.length > 0) {
      insights.push({
        icon: '🔌',
        title: 'Connected Tools',
        value: `${answers.selectedSoftware.length} tools ready`,
        color: 'orange'
      });
    }
    
    return insights;
  };

  const insights = getKeyInsights();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto text-center space-y-8 py-12"
    >
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            You're all set, {getFirstName()}! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your Guild now knows your business, your audience, and your goals.  
            We'll use this to prioritize how agents work for you from day one.
          </p>
        </div>
      </motion.div>

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white shadow-lg rounded-xl p-6 border border-gray-100"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Business Snapshot</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${
                insight.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                insight.color === 'green' ? 'border-green-500 bg-green-50' :
                insight.color === 'purple' ? 'border-purple-500 bg-purple-50' :
                'border-orange-500 bg-orange-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{insight.icon}</span>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                  <p className="text-sm text-gray-600">{insight.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">What happens next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Agents Get to Work</h4>
              <p className="text-sm text-gray-600">Your AI workforce starts analyzing your business and creating personalized strategies.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Goals Get Prioritized</h4>
              <p className="text-sm text-gray-600">Based on your priorities, agents will focus on what matters most to you first.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Automation Begins</h4>
              <p className="text-sm text-gray-600">Connected tools start syncing, and workflows begin running automatically.</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="space-y-6"
      >
        <motion.button
          onClick={onFinish}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Enter Your Dashboard</span>
          <ArrowRight className="w-6 h-6" />
        </motion.button>

        <p className="text-sm text-gray-500 max-w-md mx-auto">
          💡 <strong>Pro tip:</strong> You can always revisit your onboarding answers and update them as your business grows. 
          Guild learns and adapts with you.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default CompletionScreen;
