import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Lightbulb, Heart } from 'lucide-react';

const Question = ({ 
  text, 
  subtext, 
  options = [], 
  allowCustom = false, 
  supportText, 
  reassurance,
  onAnswer 
}) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [showReassurance, setShowReassurance] = useState(false);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowReassurance(true);
    
    // Auto-advance after selection
    setTimeout(() => {
      onAnswer(option);
    }, 1500);
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      handleOptionSelect(customValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && customValue.trim()) {
      handleCustomSubmit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-900">{text}</h2>
        {subtext && (
          <p className="text-lg text-gray-600">{subtext}</p>
        )}
      </motion.div>

      {/* Support text */}
      {supportText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-blue-800 text-sm">{supportText}</p>
          </div>
        </motion.div>
      )}

      {/* Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {options.map((option, index) => (
          <motion.button
            key={option}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onClick={() => handleOptionSelect(option)}
            className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${
              selectedOption === option
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option}</span>
              {selectedOption === option && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}

        {/* Custom input */}
        {allowCustom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + options.length * 0.1 }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4"
          >
            <div className="flex space-x-3">
              <input
                type="text"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your own answer..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCustomSubmit}
                disabled={!customValue.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Submit</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Reassurance message */}
      {showReassurance && reassurance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <Heart className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-green-800 text-sm">{reassurance}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Question;