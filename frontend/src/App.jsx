import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import GoalsView from './components/GoalsView';
import CustomersView from './components/CustomersView';
import ConversationsView from './components/ConversationsView';
import CalendarView from './components/CalendarView';
import OnboardingFlow from './components/OnboardingFlow';
import './index.css';

function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    localStorage.getItem('guild_onboarding_completed') === 'true'
  );

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    localStorage.setItem('guild_onboarding_completed', 'true');
  };

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Fixed Sidebar Navigation */}
        <Navigation />
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/goals" element={<GoalsView />} />
            <Route path="/customers" element={<CustomersView />} />
            <Route path="/conversations" element={<ConversationsView />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;