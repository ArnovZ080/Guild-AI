import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getRandomSnippet, getReassurance } from './conversationSnippets';

export default function Question({
  text,
  subtext,
  options = [],
  allowCustom = false,
  reassurance,
  supportText,
  onAnswer,
  showAcknowledgement = true
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [customValue, setCustomValue] = useState('');
  const [showAck, setShowAck] = useState(false);

  const handleAnswer = (val) => {
    setSelectedOption(val);
    if (onAnswer) onAnswer(val);
    
    if (showAcknowledgement) {
      setShowAck(true);
      setTimeout(() => setShowAck(false), 2000);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim() && onAnswer) {
      onAnswer(customValue.trim());
      setShowAck(true);
      setTimeout(() => setShowAck(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-100"
    >
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">{text}</h3>
        {subtext && (
          <p className="text-gray-600 leading-relaxed">{subtext}</p>
        )}
        {supportText && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 italic">{supportText}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((option, index) => (
              <motion.button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  selectedOption === option
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="font-medium">{option}</span>
              </motion.button>
            ))}
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
              />
              <button
                onClick={handleCustomSubmit}
                disabled={!customValue.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
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
                "🚀 Awesome! We're making great progress."
              ])}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
