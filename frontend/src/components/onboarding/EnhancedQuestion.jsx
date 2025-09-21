import React, { useState } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
import { useCelebrations } from '../../contexts/CelebrationContext';
import { getRandomSnippet, getReassurance } from './conversationSnippets';

export default function EnhancedQuestion({
  text,
  subtext,
  options = [],
  allowCustom = false,
  reassurance,
  supportText,
  onAnswer,
  showAcknowledgement = true,
  modeStyles = null,
  questionType = 'standard',
  stressLevel = 'low'
}) {
  const { triggerTaskCompletionCelebration } = useCelebrations();
  const [selectedOption, setSelectedOption] = useState(null);
  const [customValue, setCustomValue] = useState('');
  const [showAck, setShowAck] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getStressStyles = () => {
    switch (stressLevel) {
      case 'high':
        return {
          border: 'border-amber-200',
          background: 'bg-amber-50',
          accent: 'text-amber-600',
          icon: '😌'
        };
      case 'medium':
        return {
          border: 'border-blue-200',
          background: 'bg-blue-50',
          accent: 'text-blue-600',
          icon: '💡'
        };
      default:
        return {
          border: 'border-gray-200',
          background: 'bg-white',
          accent: 'text-gray-600',
          icon: '✨'
        };
    }
  };

  const stressStyles = getStressStyles();

  const handleAnswer = async (val) => {
    setSelectedOption(val);
    setIsProcessing(true);
    
    // Simulate processing time for psychological effect
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (onAnswer) onAnswer(val);
    
    // Trigger micro-celebration based on question type and stress level
    const celebrationType = questionType === 'sensitive' ? 'milestone_reached' : 'task_complete';
    const intensity = stressLevel === 'high' ? 'elaborate' : stressLevel === 'medium' ? 'moderate' : 'subtle';
    
    triggerTaskCompletionCelebration({
      name: `Answered ${questionType} question`,
      difficulty: stressLevel === 'high' ? 'hard' : stressLevel === 'medium' ? 'medium' : 'easy',
      type: celebrationType,
      isLinkedToMajorGoal: questionType === 'sensitive',
      revenueImpact: questionType === 'sensitive' ? 2000 : 500
    });
    
    setIsProcessing(false);
    
    if (showAcknowledgement) {
      setShowAck(true);
      setTimeout(() => setShowAck(false), 2000);
    }
  };

  const handleCustomSubmit = async () => {
    if (customValue.trim()) {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onAnswer) onAnswer(customValue.trim());
      
      triggerTaskCompletionCelebration({
        name: 'Provided custom answer',
        difficulty: 'medium',
        type: 'task_complete',
        isLinkedToMajorGoal: false,
        revenueImpact: 1000
      });
      
      setIsProcessing(false);
      setShowAck(true);
      setTimeout(() => setShowAck(false), 2000);
    }
  };

  const getQuestionIcon = () => {
    switch (questionType) {
      case 'sensitive':
        return '🔒';
      case 'goals':
        return '🎯';
      case 'business':
        return '🏢';
      case 'audience':
        return '👥';
      case 'financial':
        return '💰';
      default:
        return '❓';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${stressStyles.background} rounded-xl shadow-lg p-6 space-y-4 border ${stressStyles.border}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Question header with type indicator */}
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getQuestionIcon()}</div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{text}</h3>
          {subtext && (
            <p className="text-gray-600 leading-relaxed">{subtext}</p>
          )}
          {supportText && (
            <div className="mt-3 p-3 bg-white/60 rounded-lg border border-white/40">
              <p className="text-sm text-gray-700 italic">{supportText}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {options.map((option, index) => (
                <motion.button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={isProcessing}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedOption === option
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25 hover:shadow-sm'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{option}</span>
                    {isProcessing && selectedOption === option && (
                      <motion.div
                        className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}

        {allowCustom && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Type your own answer..."
                disabled={isProcessing}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleCustomSubmit()}
              />
              <button
                onClick={handleCustomSubmit}
                disabled={!customValue.trim() || isProcessing}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isProcessing ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <span>Add</span>
                )}
              </button>
            </div>
          </div>
        )}

        {reassurance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <p className="text-sm text-green-800 italic">💚 {reassurance}</p>
          </motion.div>
        )}

        {showAck && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center py-2"
          >
            <p className="text-sm text-blue-600 font-medium">
              {getRandomSnippet([
                "👍 Got it! That gives us a lot to work with.",
                "✨ Perfect! I'm noting that down.",
                "🎯 Excellent — that's really helpful.",
                "💡 Great insight! That helps a lot.",
                "🚀 Awesome! We're making great progress.",
                "⭐ That's exactly what we needed to know.",
                "🔥 Love it! This is coming together nicely.",
                "💪 Perfect! You're doing great.",
                "🎉 Excellent choice! That's noted.",
                "🌟 Fantastic! That's really valuable info."
              ])}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
