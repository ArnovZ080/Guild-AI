import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdaptiveModeProvider } from './contexts/AdaptiveModeContext';
import { CelebrationProvider } from './components/psychological/EnhancedMicroCelebrations';
import ClaudeStyleChat from './components/chat/ClaudeStyleChat';
import DashboardLayout from './components/layout/DashboardLayout';
import PageLayout from './components/layout/PageLayout';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import AgentMarketplace from './components/marketplace/AgentMarketplace';
import EnhancedCalendar from './components/calendar/EnhancedCalendar';
import WorkflowBuilder from './components/workflow/WorkflowBuilder';
import GoalsView from './components/goals/GoalsView';
import AchievementsView from './components/achievements/AchievementsView';
import GrowthOpportunitiesView from './components/growth/GrowthOpportunitiesView';

function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [currentView, setCurrentView] = useState('chat'); // 'chat', 'dashboard', 'onboarding', 'marketplace', 'calendar', 'workflow', 'goals', 'achievements', 'growth'

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem('guild_onboarding_completed') === 'true';
    setHasCompletedOnboarding(onboardingCompleted);
    
    if (onboardingCompleted) {
      setCurrentView('chat');
    } else {
      setCurrentView('onboarding');
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('guild_onboarding_completed', 'true');
    setHasCompletedOnboarding(true);
    setCurrentView('chat');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleNavigateToChat = () => {
    setCurrentView('chat');
  };

  const handleNavigateToMarketplace = () => {
    setCurrentView('marketplace');
  };

  const handleNavigateToCalendar = () => {
    setCurrentView('calendar');
  };

  const handleNavigateToWorkflow = () => {
    setCurrentView('workflow');
  };

  const handleNavigateToGoals = () => {
    setCurrentView('goals');
  };

  const handleNavigateToAchievements = () => {
    setCurrentView('achievements');
  };

  const handleNavigateToGrowth = () => {
    setCurrentView('growth');
  };

  const handleNavigateToCustomers = () => {
    setCurrentView('customers');
  };

  const handleNavigateToConversations = () => {
    setCurrentView('conversations');
  };

  const handleNavigateToConnectors = () => {
    setCurrentView('connectors');
  };

  // Mock dashboard components for now
  const CommandCenter = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Business Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">Revenue</h3>
          <p className="text-3xl font-bold text-green-600">$12,543</p>
          <p className="text-sm text-gray-500">+8.5% this month</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">Active Customers</h3>
          <p className="text-3xl font-bold text-blue-600">332</p>
          <p className="text-sm text-gray-500">+12 new this week</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">Conversion Rate</h3>
          <p className="text-3xl font-bold text-purple-600">69%</p>
          <p className="text-sm text-gray-500">+2.1% improvement</p>
        </div>
      </div>
    </div>
  );

  const ActionTheater = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Agent Activity</h2>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
        <p className="text-gray-600 dark:text-gray-400">
          Your AI agents are working on various tasks. Use the chat interface to interact with them directly.
        </p>
        <div className="flex space-x-3 mt-4">
          <button
            onClick={handleNavigateToChat}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Open Chat Interface
          </button>
          <button
            onClick={handleNavigateToMarketplace}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            View Agent Marketplace
          </button>
          <button
            onClick={handleNavigateToCalendar}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Open Calendar
          </button>
          <button
            onClick={handleNavigateToWorkflow}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Workflow Builder
          </button>
        </div>
      </div>
    </div>
  );

  const OpportunityHorizon = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Opportunities</h2>
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
          <h3 className="font-semibold">Social Media Campaign</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Launch a new campaign to increase engagement</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
          <h3 className="font-semibold">Customer Feedback Analysis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Analyze recent customer feedback for insights</p>
        </div>
      </div>
    </div>
  );

  return (
    <AdaptiveModeProvider>
      <CelebrationProvider>
        <div className="min-h-screen">
          {currentView === 'onboarding' && (
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          )}
          
          {currentView === 'chat' && (
            <ClaudeStyleChat 
              onNavigateToDashboard={handleNavigateToDashboard}
              onNavigateToMarketplace={handleNavigateToMarketplace}
              onNavigateToCalendar={handleNavigateToCalendar}
              onNavigateToGoals={handleNavigateToGoals}
              onNavigateToAchievements={handleNavigateToAchievements}
              onNavigateToGrowth={handleNavigateToGrowth}
              onNavigateToCustomers={handleNavigateToCustomers}
              onNavigateToConversations={handleNavigateToConversations}
              onNavigateToConnectors={handleNavigateToConnectors}
            />
          )}
          
          {currentView === 'dashboard' && (
            <PageLayout currentView={currentView} onNavigate={handleNavigate}>
              <DashboardLayout
                commandCenter={<CommandCenter />}
                actionTheater={<ActionTheater />}
                opportunityHorizon={<OpportunityHorizon />}
                onNavigateToChat={handleNavigateToChat}
              />
            </PageLayout>
          )}
          
          {currentView === 'marketplace' && (
            <PageLayout currentView={currentView} onNavigate={handleNavigate}>
              <AgentMarketplace
                onNavigateToChat={handleNavigateToChat}
                onNavigateToDashboard={handleNavigateToDashboard}
              />
            </PageLayout>
          )}
          
          {currentView === 'calendar' && (
            <PageLayout currentView={currentView} onNavigate={handleNavigate}>
              <EnhancedCalendar
                onNavigateToChat={handleNavigateToChat}
                onNavigateToDashboard={handleNavigateToDashboard}
              />
            </PageLayout>
          )}
          
          {currentView === 'workflow' && (
            <PageLayout currentView={currentView} onNavigate={handleNavigate}>
              <WorkflowBuilder
                onNavigateToChat={handleNavigateToChat}
                onNavigateToDashboard={handleNavigateToDashboard}
              />
            </PageLayout>
          )}
          
          {currentView === 'goals' && (
            <PageLayout currentView={currentView} onNavigate={handleNavigate}>
              <GoalsView
                onNavigateToChat={handleNavigateToChat}
                onNavigateToDashboard={handleNavigateToDashboard}
              />
            </PageLayout>
          )}
          
          {currentView === 'achievements' && (
            <PageLayout currentView={currentView} onNavigate={handleNavigate}>
              <AchievementsView
                onNavigateToChat={handleNavigateToChat}
                onNavigateToDashboard={handleNavigateToDashboard}
              />
            </PageLayout>
          )}
          
          {currentView === 'growth' && (
            <PageLayout currentView={currentView} onNavigate={handleNavigate}>
              <GrowthOpportunitiesView
                onNavigateToChat={handleNavigateToChat}
                onNavigateToDashboard={handleNavigateToDashboard}
              />
            </PageLayout>
          )}
        </div>
      </CelebrationProvider>
    </AdaptiveModeProvider>
  );
}

export default App;