import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AgentCollaborationFlow = () => {
  const [workflow] = useState([
    { id: 'step-1', agent: 'Research Agent', action: 'Analyze market trends', status: 'completed', dependencies: [] },
    { id: 'step-2', agent: 'Content Agent', action: 'Create blog outline', status: 'active', dependencies: ['step-1'] },
    { id: 'step-3', agent: 'SEO Agent', action: 'Optimize keywords', status: 'pending', dependencies: ['step-2'] },
    { id: 'step-4', agent: 'Marketing Agent', action: 'Plan promotion', status: 'pending', dependencies: ['step-2'] }
  ]);

  const getStatusColor = (status) => ({
    pending: '#94A3B8', active: '#3B82F6', completed: '#10B981'
  })[status];

  return (
    <div className="w-full h-full mx-auto p-6 bg-gray-700 rounded-lg overflow-y-auto">
      <div className="relative">
        {workflow.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex items-center mb-6 relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4 z-10"
              style={{ backgroundColor: getStatusColor(step.status) }}
            >
              {step.status === 'completed' ? '✓' : index + 1}
            </motion.div>
            <div className="flex-1 bg-gray-800 rounded-lg shadow-sm border border-gray-600 p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-white">{step.agent}</h4>
                  <p className="text-gray-300 text-sm mt-1">{step.action}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium text-white capitalize" style={{ backgroundColor: getStatusColor(step.status) }}>
                  {step.status}
                </span>
              </div>
            </div>
            {index < workflow.length - 1 && (
              <div className="absolute left-5 top-10 w-0.5 h-12 bg-gray-600" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AgentCollaborationFlow;
