import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const WelcomeStep = ({ onNext }) => (
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
        className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          👋 Welcome to Guild
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Your AI workforce is ready to get to work. Let's set up your business profile
          so we can create a personalized strategy that actually moves the needle.
        </p>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">What we'll cover:</h2>
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
    </div>

    <motion.button
      onClick={onNext}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span>Let's Get Started</span>
      <ArrowRight className="w-5 h-5" />
    </motion.button>

    <p className="text-sm text-gray-500">
      Takes about 5-7 minutes • You can always update your answers later
    </p>
  </motion.div>
);

export default WelcomeStep;