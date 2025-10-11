import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

const IncompleteOnboardingWidget = () => {
  const [incompleteData, setIncompleteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeHelp, setActiveHelp] = useState(null);

  useEffect(() => {
    fetchIncompleteFields();
  }, []);

  const fetchIncompleteFields = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const { auth } = await import('../../config/firebase');
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      
      if (!token) return;
      
      const response = await fetch(`${API_URL}/onboarding/incomplete`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIncompleteData(data);
      }
    } catch (error) {
      console.error('Failed to fetch incomplete fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpComplete = async (fieldId) => {
    try {
      setActiveHelp(fieldId);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const { auth } = await import('../../config/firebase');
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      
      if (!token) return;
      
      // Trigger orchestrator to help complete this field
      const response = await fetch(`${API_URL}/orchestrator/complete-field`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ field_id: fieldId })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Orchestrator initiated:', result);
        // Show success message or redirect to chat
        alert(`Great! I'll help you develop your ${fieldId.replace(/_/g, ' ')}. Check the chat for my questions!`);
      }
    } catch (error) {
      console.error('Failed to initiate help:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setActiveHelp(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!incompleteData?.needs_follow_up || incompleteData?.incomplete_fields?.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Business Profile Complete! 🎉</h3>
            <p className="text-sm text-gray-600">
              Your business information is {incompleteData?.completion_percentage || 100}% complete.
              All agents now have the context they need to help you effectively.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fieldLabels = {
    business_type: 'Business Type',
    business_description: 'Business Description',
    target_audience: 'Target Audience',
    customer_avatar: 'Customer Avatar (Ideal Client Profile)',
    audience_problems: 'Audience Pain Points',
    brand_voice_tone: 'Brand Voice & Tone',
    brand_colors: 'Brand Colors',
    logo_status: 'Logo Development',
    brand_story: 'Brand Story',
    brand_differentiation: 'What Makes You Unique',
    pricing_status: 'Pricing Strategy',
    marketing_budget: 'Marketing Budget',
    priority_3months: '3-Month Priorities',
    data_storage_preference: 'Data Storage Preference'
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Let's Complete Your Business Profile
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Your profile is {incompleteData.completion_percentage}% complete. 
            I can help you develop the missing pieces so all agents have complete context.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {incompleteData.incomplete_fields.slice(0, 5).map((fieldId) => (
          <div 
            key={fieldId}
            className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-200"
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {fieldLabels[fieldId] || fieldId.replace(/_/g, ' ')}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Incomplete or needs clarification
              </div>
            </div>
            <button
              onClick={() => handleHelpComplete(fieldId)}
              disabled={activeHelp === fieldId}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeHelp === fieldId ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Help me complete
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {incompleteData.incomplete_fields.length > 5 && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          + {incompleteData.incomplete_fields.length - 5} more fields to complete
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-amber-200">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Complete fields help agents create better, more personalized content
          and strategies tailored specifically to your business.
        </p>
      </div>
    </div>
  );
};

export default IncompleteOnboardingWidget;

