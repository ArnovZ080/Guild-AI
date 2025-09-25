import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PsychologicalOptimizationProvider } from './contexts/PsychologicalOptimizationContext.jsx';
import { AdaptiveModeProvider } from './contexts/AdaptiveModeContext.jsx';
// Celebrations disabled to avoid runtime issues
import DashboardLayout from './components/layouts/DashboardLayout.jsx';
import DashboardView from './views/DashboardView.jsx';
import AgentsView from './views/AgentsView.jsx';
import WorkflowsView from './views/WorkflowsView.jsx';
import AnalyticsView from './views/AnalyticsView.jsx';
import FinancialDashboardView from './views/FinancialDashboardView.jsx';
import ComingSoonView from './views/ComingSoonView.jsx';
import ChatInterface from './components/chat/ChatInterface.jsx';
import CalendarView from './views/CalendarView.jsx';
import CustomersView from './views/CustomersView.jsx';
import GoalsView from './views/GoalsView.jsx';
import ConversationsView from './views/ConversationsView.jsx';
import DocumentsView from './views/DocumentsView.jsx';
import VoiceView from './views/VoiceView.jsx';
import OnboardingView from './views/OnboardingView.jsx';
import ConnectorsView from './views/ConnectorsView.jsx';
import GrowthView from './views/GrowthView.jsx';
import AchievementsView from './views/AchievementsView.jsx';
import ContentDashboard from './components/dashboard/ContentDashboard.jsx';
import './App.css';
import './index.css';

function App() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if onboarding is completed
    const onboardingCompleted = localStorage.getItem('guild_onboarding_completed') === 'true';
    setIsOnboardingCompleted(onboardingCompleted);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Guild...</p>
        </div>
      </div>
    );
  }

  return (
    <PsychologicalOptimizationProvider>
      <AdaptiveModeProvider>
          <Router>
            <Routes>
              <Route path="/" element={
                isOnboardingCompleted ?
                  <Navigate to="/chat" replace /> :
                  <Navigate to="/onboarding" replace />
              } />
              <Route path="/onboarding" element={<OnboardingView />} />
              <Route path="/chat" element={
                <DashboardLayout>
                  <ChatInterface onNavigateToDashboard={() => window.location.href = '/dashboard'} />
                </DashboardLayout>
              } />
              <Route path="/dashboard" element={
                <DashboardLayout>
                  <DashboardView />
                </DashboardLayout>
              } />
              <Route path="/agents" element={
                <DashboardLayout>
                  <AgentsView />
                </DashboardLayout>
              } />
              <Route path="/workflows" element={
                <DashboardLayout>
                  <WorkflowsView />
                </DashboardLayout>
              } />
              <Route path="/analytics" element={
                <DashboardLayout>
                  <AnalyticsView />
                </DashboardLayout>
              } />
              <Route path="/customers" element={
                <DashboardLayout>
                  <CustomersView />
                </DashboardLayout>
              } />
              <Route path="/goals" element={
                <DashboardLayout>
                  <GoalsView />
                </DashboardLayout>
              } />
              <Route path="/calendar" element={
                <DashboardLayout>
                  <CalendarView />
                </DashboardLayout>
              } />
              <Route path="/conversations" element={
                <DashboardLayout>
                  <ConversationsView />
                </DashboardLayout>
              } />
              <Route path="/documents" element={
                <DashboardLayout>
                  <DocumentsView />
                </DashboardLayout>
              } />
          <Route path="/voice" element={
            <DashboardLayout>
              <VoiceView />
            </DashboardLayout>
          } />
          <Route path="/connectors" element={
            <DashboardLayout>
              <ConnectorsView />
            </DashboardLayout>
          } />
              <Route path="/achievements" element={
                <DashboardLayout>
                  <AchievementsView />
                </DashboardLayout>
              } />
              <Route path="/growth" element={
                <DashboardLayout>
                  <GrowthView />
                </DashboardLayout>
              } />
              <Route path="/content-dashboard" element={
                <DashboardLayout>
                  <ContentDashboard />
                </DashboardLayout>
              } />
              <Route path="/settings" element={
                <DashboardLayout>
                  <ComingSoonView title="Settings" description="Application settings and preferences coming soon" />
                </DashboardLayout>
              } />
              <Route path="/financial" element={
                <DashboardLayout>
                  <FinancialDashboardView />
                </DashboardLayout>
              } />
            </Routes>
          </Router>
      </AdaptiveModeProvider>
    </PsychologicalOptimizationProvider>
  );
}

export default App;