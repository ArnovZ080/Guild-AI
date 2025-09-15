import React from 'react';
import { motion } from 'framer-motion';
import { Construction, Sparkles } from 'lucide-react';

const ComingSoonView = ({ title = "Coming Soon", description = "This feature is under development" }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="mb-6"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Construction className="w-16 h-16 text-blue-500 mx-auto" />
        </motion.div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">{description}</p>
        
        <motion.div
          className="flex items-center justify-center space-x-2 text-blue-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">In Development</span>
          <Sparkles className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ComingSoonView;
