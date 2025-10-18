import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import onboardingFollowUpService from '../../services/onboardingFollowUpService';

const OnboardingFollowUp = ({ onMessageSend, user }) => {
  const [incompleteTasks, setIncompleteTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    loadIncompleteTasks();
  }, []);

  const loadIncompleteTasks = async () => {
    try {
      setIsLoading(true);
      const data = await onboardingFollowUpService.getIncompleteTasks();
      
      if (data.tasks && data.tasks.length > 0) {
        setIncompleteTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to load incomplete tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteField = async (task) => {
    try {
      setActiveField(task.field_id);
      
      // Initiate the orchestrator workflow
      const result = await onboardingFollowUpService.initiateFieldCompletion(task.field_id);
      
      // Send the orchestrator's initial prompt to the chat
      if (result.initial_prompt) {
        onMessageSend(result.initial_prompt, 'assistant');
      }
      
      // Show success message
      setTimeout(() => {
        setActiveField(null);
        loadIncompleteTasks(); // Refresh the list
      }, 2000);
      
    } catch (error) {
      console.error('Failed to initiate field completion:', error);
      setActiveField(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 text-sm">Checking for incomplete profile details...</span>
        </div>
      </div>
    );
  }

  if (!incompleteTasks || incompleteTasks.length === 0) {
    return null; // Don't show if no incomplete tasks
  }

  // Show only the highest priority task
  const topTask = incompleteTasks[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">
              Complete Your Profile
            </h4>
            <span className="text-xs text-gray-500">
              {incompleteTasks.length} remaining
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            I noticed you haven't completed your {topTask.field_name.toLowerCase()}. 
            This helps me provide more personalized assistance.
          </p>
          
          <motion.button
            onClick={() => handleCompleteField(topTask)}
            disabled={activeField === topTask.field_id}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {activeField === topTask.field_id ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Complete {topTask.field_name}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
          
          {incompleteTasks.length > 1 && (
            <p className="text-xs text-gray-500 mt-2">
              After completing this, I'll help with {incompleteTasks.length - 1} more areas.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OnboardingFollowUp;
