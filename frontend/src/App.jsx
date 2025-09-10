import React, { useState } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import { MainDashboard } from './components/MainDashboard';
import OnboardingFlow from './components/OnboardingFlow';
import OAuthConnections from './components/OAuthConnections';

function App() {
  const [currentView, setCurrentView] = useState('chat'); // Start with chat interface
  const [isOnboarded, setIsOnboarded] = useState(true); // Set to false for new users

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setIsOnboarded(true);
    setCurrentView('chat'); // Go to chat after onboarding
  };

  // Navigation handlers
  const navigateToChat = () => setCurrentView('chat');
  const navigateToDashboard = () => setCurrentView('dashboard');
  const navigateToConnections = () => setCurrentView('connections');

  // Show onboarding flow for new users
  if (!isOnboarded) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-white">
        <OnboardingFlow onOnboardingComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="App">
      {currentView === 'chat' && (
        <ChatInterface onNavigateToDashboard={navigateToDashboard} />
      )}
      
      {currentView === 'dashboard' && (
        <div>
          {/* Add a simple navigation header to the dashboard */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-2">
            <div className="flex items-center justify-between">
              <button
                onClick={navigateToChat}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Chat</span>
              </button>
              <button
                onClick={navigateToConnections}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Data Connections</span>
              </button>
            </div>
          </div>
          <MainDashboard />
        </div>
      )}

      {currentView === 'connections' && (
        <div>
          {/* Add a simple navigation header to the connections */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-2">
            <button
              onClick={navigateToDashboard}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
          </div>
          <OAuthConnections />
        </div>
      )}
    </div>
  );
}

export default App;
