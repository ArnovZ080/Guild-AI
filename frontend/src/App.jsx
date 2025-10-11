import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { PsychologicalOptimizationProvider } from './contexts/PsychologicalOptimizationContext.jsx';
import { AdaptiveModeProvider } from './contexts/AdaptiveModeContext.jsx';
import CelebrationProvider from './components/celebrations/CelebrationProvider.jsx';
import { SettingsProvider } from './contexts/SettingsContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

// Auth pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import SubscriptionPage from './pages/SubscriptionPage.jsx';

// Dashboard pages
import SettingsPage from './components/dashboard/SettingsPage.jsx';
import DashboardLayout from './components/layouts/DashboardLayout.jsx';
import BusinessDashboardView from './views/BusinessDashboardView.jsx';
import AgentsView from './views/AgentsView.jsx';
import WorkflowsView from './views/WorkflowsView.jsx';
import AnalyticsView from './views/AnalyticsView.jsx';
import FinancialDashboardView from './views/FinancialDashboardView.jsx';
import ComingSoonView from './views/ComingSoonView.jsx';
import ChatInterface from './components/chat/ChatInterface.jsx';
import CalendarPage from './components/dashboard/CalendarPage.jsx';
import CustomersView from './views/CustomersView.jsx';
import GoalsView from './views/GoalsView.jsx';
import ConversationsTab from './components/dashboard/ConversationsTab.jsx';
import DocumentsView from './components/dashboard/DocumentsView.jsx';
import VoiceView from './views/VoiceView.jsx';
import OnboardingView from './views/OnboardingView.jsx';
import ConnectorsView from './views/ConnectorsView.jsx';
import GrowthDashboard from './components/dashboard/GrowthDashboard.jsx';
import AchievementsView from './components/dashboard/AchievementsView.jsx';
import ContentDashboard from './components/dashboard/ContentDashboard.jsx';

// Legal and public pages
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage.jsx';
import RefundPolicyPage from './pages/RefundPolicyPage.jsx';
import FeaturesPage from './pages/FeaturesPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import AIAgentsPage from './pages/AIAgentsPage.jsx';
import IntegrationsPage from './pages/IntegrationsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx';
import AffiliatesPage from './pages/AffiliatesPage.jsx';

import './App.css';
import './index.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Only Route Component (redirects to chat/onboarding if already logged in)
function PublicOnlyRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    // Check if onboarding is completed
    const onboardingCompleted = localStorage.getItem('guild_onboarding_completed') === 'true';
    return <Navigate to={onboardingCompleted ? "/chat" : "/onboarding"} replace />;
  }

  return children;
}

// Main App Routes Component
function AppRoutes() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    // Check if onboarding is completed
    const onboardingCompleted = localStorage.getItem('guild_onboarding_completed') === 'true';
    setIsOnboardingCompleted(onboardingCompleted);
  }, [currentUser]);

  if (loading) {
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
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        currentUser ? (
          isOnboardingCompleted ? (
            <Navigate to="/chat" replace />
          ) : (
            <Navigate to="/onboarding" replace />
          )
        ) : (
          <LandingPage />
        )
      } />
      
      {/* Auth Routes - public only */}
      <Route path="/login" element={
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      } />
      <Route path="/signup" element={
        <PublicOnlyRoute>
          <SignupPage />
        </PublicOnlyRoute>
      } />
      
      {/* Legal Routes - public */}
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />
      
      {/* Public Information Pages */}
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/ai-agents" element={<AIAgentsPage />} />
      <Route path="/integrations" element={<IntegrationsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/affiliates" element={<AffiliatesPage />} />

      {/* Subscription Route - protected */}
      <Route path="/subscription" element={
        <ProtectedRoute>
          <SubscriptionPage />
        </ProtectedRoute>
      } />

      {/* Onboarding - protected */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingView />
        </ProtectedRoute>
      } />

      {/* Protected Dashboard Routes */}
      <Route path="/chat" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ChatInterface onNavigateToDashboard={() => window.location.href = '/dashboard'} />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Navigate to="/dashboard/overview" replace />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/:tab" element={
        <ProtectedRoute>
          <BusinessDashboardView />
        </ProtectedRoute>
      } />

      <Route path="/agents" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AgentsView />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/workflows" element={
        <ProtectedRoute>
          <DashboardLayout>
            <WorkflowsView />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/analytics" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AnalyticsView />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/customers" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CustomersView />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/goals" element={
        <ProtectedRoute>
          <DashboardLayout>
            <GoalsView />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/calendar" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CalendarPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/conversations" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ConversationsTab />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/documents" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DocumentsView />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/voice" element={
        <ProtectedRoute>
          <DashboardLayout>
            <VoiceView />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/connectors" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ConnectorsView />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/growth" element={
        <ProtectedRoute>
          <DashboardLayout>
            <GrowthDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/achievements" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AchievementsView />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/content" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ContentDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardLayout>
            <SettingsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/financial" element={
        <ProtectedRoute>
          <DashboardLayout>
            <FinancialDashboardView />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CelebrationProvider celebrationMode="full">
          <PsychologicalOptimizationProvider>
            <AdaptiveModeProvider>
              <SettingsProvider>
                <AppRoutes />
              </SettingsProvider>
            </AdaptiveModeProvider>
          </PsychologicalOptimizationProvider>
        </CelebrationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

