import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

console.log('📦 App.jsx: Starting imports...')

console.log('📦 App.jsx: Importing AdaptiveModeProvider...')
import { AdaptiveModeProvider } from './contexts/AdaptiveModeContext';
console.log('✅ App.jsx: AdaptiveModeProvider imported')

console.log('📦 App.jsx: Importing CelebrationProvider...')
import { CelebrationProvider } from './contexts/CelebrationContext';
console.log('✅ App.jsx: CelebrationProvider imported')

console.log('📦 App.jsx: Importing AgentCommunicationProvider...')
import { AgentCommunicationProvider } from './contexts/AgentCommunicationContext.simple';
console.log('✅ App.jsx: AgentCommunicationProvider imported')

console.log('📦 App.jsx: Importing PsychologicalOptimizationProvider...')
import { PsychologicalOptimizationProvider } from './contexts/PsychologicalOptimizationContext';
console.log('✅ App.jsx: PsychologicalOptimizationProvider imported')
import ClaudeStyleChat from './components/chat/ClaudeStyleChat';
import { MainDashboard } from './components/dashboard/MainDashboard';
import PageLayout from './components/layout/PageLayout';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import AgentMarketplace from './components/marketplace/AgentMarketplace';
import EnhancedCalendar from './components/calendar/EnhancedCalendar';
import WorkflowBuilder from './components/workflow/WorkflowBuilder';
import GoalsView from './components/goals/GoalsView';
import AchievementsView from './components/achievements/AchievementsView';
import GrowthOpportunitiesView from './components/growth/GrowthOpportunitiesView';
import CustomersView from './components/customers/CustomersView';
import ConversationsView from './components/conversations/ConversationsView';
import ConnectorsView from './components/connectors/ConnectorsView';

function App() {
  console.log('🎭 App: Component function called')
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [currentView, setCurrentView] = useState('chat'); // 'chat', 'dashboard', 'onboarding', 'marketplace', 'calendar', 'workflow', 'goals', 'achievements', 'growth'

  console.log('🎭 App: State initialized, hasCompletedOnboarding:', hasCompletedOnboarding, 'currentView:', currentView)

  useEffect(() => {
    console.log('🎭 App: useEffect called')
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

  // Dashboard components are now handled by MainDashboard

  console.log('🎭 App: About to render JSX')
  console.log('🎭 App: currentView:', currentView, 'hasCompletedOnboarding:', hasCompletedOnboarding)

  console.log('🎭 App: About to render providers and components')
  
  // Step 5: Test with OnboardingFlow + PsychologicalOptimizationProvider
  console.log('🎭 App: Testing with OnboardingFlow + PsychologicalOptimizationProvider')
  
  return (
    <PsychologicalOptimizationProvider>
      <AdaptiveModeProvider>
        <CelebrationProvider>
          <AgentCommunicationProvider>
          <div className="min-h-screen">
            {currentView === 'onboarding' && (
              (() => {
                console.log('🎭 App: About to render full OnboardingFlow')
                try {
                  // Restore full OnboardingFlow with fixed EnhancedWelcomeStep
                  const OnboardingFlow = React.lazy(() => import('./components/onboarding/OnboardingFlow'));
                  
                  return (
                    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                      <OnboardingFlow onComplete={handleOnboardingComplete} />
                    </React.Suspense>
                  )
                } catch (error) {
                  console.error('❌ Error rendering OnboardingFlow:', error)
                  return <div>Error loading OnboardingFlow: {error.message}</div>
                }
              })()
            )}
            
            {currentView !== 'onboarding' && (
              <Router>
                <Routes>
                  <Route path="/" element={
                    <PageLayout onNavigate={handleNavigate}>
                      {currentView === 'chat' && <ClaudeStyleChat />}
                      {currentView === 'dashboard' && <MainDashboard />}
                      {currentView === 'marketplace' && <AgentMarketplace />}
                      {currentView === 'calendar' && <EnhancedCalendar />}
                      {currentView === 'workflow' && <WorkflowBuilder />}
                      {currentView === 'goals' && <GoalsView />}
                      {currentView === 'achievements' && <AchievementsView />}
                      {currentView === 'growth' && <GrowthOpportunitiesView />}
                      {currentView === 'customers' && <CustomersView />}
                      {currentView === 'conversations' && <ConversationsView />}
                      {currentView === 'connectors' && <ConnectorsView />}
                    </PageLayout>
                  } />
                </Routes>
              </Router>
            )}
          </div>
          </AgentCommunicationProvider>
        </CelebrationProvider>
      </AdaptiveModeProvider>
    </PsychologicalOptimizationProvider>
  )
  
  // Original complex render (commented out for debugging)
  /*
  return (
    <AdaptiveModeProvider>
      <CelebrationProvider>
        <AgentCommunicationProvider>
          <div className="min-h-screen">
          {currentView === 'onboarding' && (
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          )}
          
          {currentView === 'chat' && (
            (() => {
              console.log('🎭 App: About to render ClaudeStyleChat')
              try {
                return <ClaudeStyleChat 
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
              } catch (error) {
                console.error('❌ Error rendering ClaudeStyleChat:', error)
                return <div>Error loading chat component: {error.message}</div>
              }
            })()
          )}
          
          {currentView === 'dashboard' && (
            <PageLayout currentView={currentView} onNavigate={handleNavigate}>
              <MainDashboard />
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
          
          {currentView === 'customers' && (
            <PageLayout currentView={currentView} onNavigate={handleNavigate}>
              <CustomersView
                onNavigateToChat={handleNavigateToChat}
                onNavigateToDashboard={handleNavigateToDashboard}
              />
            </PageLayout>
          )}
          
          {currentView === 'conversations' && (
            <PageLayout currentView={currentView} onNavigate={handleNavigate}>
              <ConversationsView
                onNavigateToChat={handleNavigateToChat}
                onNavigateToDashboard={handleNavigateToDashboard}
              />
            </PageLayout>
          )}
          
          {currentView === 'connectors' && (
            <PageLayout currentView={currentView} onNavigate={handleNavigate}>
              <ConnectorsView
                onNavigateToChat={handleNavigateToChat}
                onNavigateToDashboard={handleNavigateToDashboard}
              />
            </PageLayout>
          )}
        </div>
        </AgentCommunicationProvider>
      </CelebrationProvider>
    </AdaptiveModeProvider>
  );
  */
}

export default App;