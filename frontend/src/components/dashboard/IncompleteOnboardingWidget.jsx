import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';

const IncompleteOnboardingWidget = ({ user }) => {
  const [incompleteData, setIncompleteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitiating, setIsInitiating] = useState(false);

  useEffect(() => {
    fetchIncompleteData();
  }, []);

  const fetchIncompleteData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const { auth } = await import('../../config/firebase.js');
      const token = auth?.currentUser ? await auth.currentUser.getIdToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/onboarding/incomplete`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIncompleteData(data);
      }
    } catch (error) {
      console.error('Failed to fetch incomplete onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteField = async (fieldId) => {
    try {
      setIsInitiating(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const { auth } = await import('../../config/firebase.js');
      const token = auth?.currentUser ? await auth.currentUser.getIdToken();
      
      const response = await fetch(`${API_URL}/api/orchestrator/complete-field`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ field_id: fieldId })
      });

      if (response.ok) {
        const result = await response.json();
        // Show success message and refresh data
        alert(`Great! I'll help you complete your ${fieldId.replace('_', ' ')}. ${result.initial_prompt}`);
        fetchIncompleteData(); // Refresh the data
      } else {
        console.error('Failed to initiate field completion:', await response.text());
      }
    } catch (error) {
      console.error('Error initiating field completion:', error);
    } finally {
      setIsInitiating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!incompleteData || !incompleteData.needs_follow_up || incompleteData.completion_percentage === 100) {
    return null; // Don't show widget if complete
  }

  const priorityFields = incompleteData.incomplete_fields?.slice(0, 5) || [];
  const fieldDisplayNames = {
    'business_type': 'Business Type',
    'target_audience': 'Target Audience', 
    'customer_avatar': 'Customer Avatar',
    'audience_problems': 'Audience Problems',
    'brand_voice_tone': 'Brand Voice',
    'brand_colors': 'Brand Colors',
    'logo_status': 'Logo Status',
    'brand_story': 'Brand Story',
    'brand_differentiation': 'Brand Differentiation',
    'pricing_status': 'Pricing Strategy',
    'marketing_budget': 'Marketing Budget',
    'priority_3months': '3-Month Priorities'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-lg p-6 mb-6"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Complete Your Business Profile
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {incompleteData.completion_percentage}% complete
              </span>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${incompleteData.completion_percentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            Your business profile is {incompleteData.completion_percentage}% complete. 
            Complete these details to help your AI agents work more effectively for you.
          </p>
          
          {priorityFields.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Complete these areas:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {priorityFields.map((fieldId, index) => (
                  <motion.button
                    key={fieldId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleCompleteField(fieldId)}
                    disabled={isInitiating}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-900">
                        {fieldDisplayNames[fieldId] || fieldId.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> Click any item above and I'll guide you through 
                  completing it with targeted questions and research. Your AI agents will then 
                  have complete context to work more effectively for you.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default IncompleteOnboardingWidget;