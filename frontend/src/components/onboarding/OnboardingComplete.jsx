import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles, Users, Target, Zap } from 'lucide-react';

const OnboardingComplete = ({ completionData, onEnterDashboard }) => {
  const getFirstName = () => {
    // Try to extract first name from completion data or use a default
    return 'founder';
  };

  const getCompletionMessage = () => {
    const percentage = completionData?.completion_percentage || 0;
    const needsFollowUp = completionData?.needs_follow_up || false;
    
    if (percentage === 100) {
      return {
        title: "Perfect! Your profile is complete! 🎉",
        message: "Your Guild now has complete context about your business and can provide highly personalized assistance.",
        color: "green"
      };
    } else if (percentage >= 75) {
      return {
        title: "Great start! Your profile is mostly complete! ✨",
        message: `Your Guild has ${percentage}% of the context it needs. You can complete the remaining details later through your dashboard.`,
        color: "blue"
      };
    } else {
      return {
        title: "Welcome to your Guild! 🚀",
        message: `Your Guild is ready to help! You've completed ${percentage}% of your profile. We'll help you complete the rest as we work together.`,
        color: "purple"
      };
    }
  };

  const completionInfo = getCompletionMessage();

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
            {completionInfo.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {completionInfo.message}
          </p>
        </div>
      </motion.div>

      {/* Completion Status */}
      {completionData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white shadow-lg rounded-xl p-6 border border-gray-100"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-2xl font-bold text-blue-600">
              {completionData.completion_percentage}%
            </div>
            <div className="text-gray-600">Profile Complete</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${completionData.completion_percentage}%` }}
            />
          </div>
          
          {completionData.needs_follow_up && completionData.incomplete_fields?.length > 0 && (
            <div className="text-sm text-gray-600">
              <p className="mb-2">We'll help you complete:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {completionData.incomplete_fields.slice(0, 3).map((field, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {field.replace('_', ' ')}
                  </span>
                ))}
                {completionData.incomplete_fields.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{completionData.incomplete_fields.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
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

      {/* Enter Dashboard Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <motion.button
          onClick={onEnterDashboard}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Enter Your Dashboard</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingComplete;
