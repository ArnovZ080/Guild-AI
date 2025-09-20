import React, { useState, useEffect } from 'react';
import EpicBusinessDashboard from './EpicBusinessDashboard';

// Enhanced Achievement Narrative Component
const AchievementNarrative = ({ achievement, onDismiss }: any) => {
  if (!achievement) return null;

  const narratives = {
    'content_consistency': {
      title: 'Content Momentum Building',
      message: "You've maintained consistent content creation for a full week! This consistency is building your brand authority and audience trust.",
      celebration: '🚀',
      color: 'from-forest-growth to-success-gentle'
    },
    'lead_conversion': {
      title: 'Sales Excellence Achievement',
      message: "Congratulations! You've achieved a 25% increase in lead conversion. This improvement demonstrates the effectiveness of your refined sales process.",
      celebration: '💰',
      color: 'from-earth-sand to-warning-warm'
    }
  };

  const narrative = narratives[achievement.type as keyof typeof narratives] || narratives['content_consistency'];

  return (
    <div className="fixed bottom-6 right-6 max-w-sm z-50">
      <div className={`bg-gradient-to-r ${narrative.color} p-6 rounded-xl shadow-2xl border border-white/20`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <span className="text-3xl mr-3">{narrative.celebration}</span>
            <div>
              <h3 className="font-bold text-lg text-white">{narrative.title}</h3>
              <p className="text-sm text-white/90">Achievement Unlocked!</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="text-sm text-white leading-relaxed">
          {narrative.message}
        </div>
      </div>
    </div>
  );
};

// Debug panel for testing celebrations
const DebugPanel = () => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg z-50 space-y-2">
      <h4 className="font-bold text-sm">Debug Panel</h4>
      <p className="text-xs text-gray-300">Dashboard is running in development mode</p>
    </div>
  );
};

// Inner dashboard component that uses the contexts
const DashboardContent: React.FC = () => {
  const [achievement, setAchievement] = useState<{type: string} | null>(null);
  const [activeAgentForFullChat, setActiveAgentForFullChat] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const hasCompletedOnboarding = localStorage.getItem('guild_onboarding_completed') === 'true';
    setOnboardingCompleted(hasCompletedOnboarding);
    
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }

    // For demonstration, trigger an achievement narrative on load (only if onboarding is complete)
    if (hasCompletedOnboarding) {
      setTimeout(() => {
        setAchievement({ type: 'content_consistency' });
      }, 3000);
      
      // Trigger another achievement later
      setTimeout(() => {
        setAchievement({ type: 'lead_conversion' });
      }, 8000);
    }
  }, []);

  const handleOpenFullConversation = (agentId: string) => {
    setActiveAgentForFullChat(agentId);
  };

  const handleCloseFullConversation = () => {
    setActiveAgentForFullChat(null);
  };

  const handleOnboardingComplete = (onboardingData: any) => {
    setShowOnboarding(false);
    setOnboardingCompleted(true);
    
    // Store onboarding data for future use
    localStorage.setItem('guild_onboarding_data', JSON.stringify(onboardingData));
    localStorage.setItem('guild_onboarding_completed', 'true');
    
    // Trigger welcome celebration
    setTimeout(() => {
      setAchievement({ type: 'onboarding_complete' });
    }, 1000);
  };

  // Show onboarding if not completed
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-500 text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Guild AI</h2>
          <p className="text-gray-600 mb-4">Setting up your business intelligence dashboard...</p>
          <button
            onClick={() => handleOnboardingComplete({})}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <EpicBusinessDashboard />
      
      {/* Achievement Narratives */}
      {achievement && (
        <AchievementNarrative
          achievement={achievement}
          onDismiss={() => setAchievement(null)}
        />
      )}

      {/* Full Conversation Modal */}
      {activeAgentForFullChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Full Conversation with Agent
              </h3>
              <button
                onClick={handleCloseFullConversation}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="text-gray-600 text-sm">
              Full conversational interface for {activeAgentForFullChat} would be implemented here.
              This would include full chat history, voice input, and advanced agent reasoning display.
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      <DebugPanel />
    </>
  );
};

// The main dashboard container
export const MainDashboard: React.FC = () => {
  return <DashboardContent />;
};
