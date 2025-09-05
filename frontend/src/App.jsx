import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
// Placeholder for WorkflowBuilderView, will be created in a later step
const WorkflowBuilderView = () => <div>Workflow Builder Placeholder</div>;
// Placeholder for OnboardingFlow
const OnboardingFlow = ({ onOnboardingComplete }) => <div onClick={onOnboardingComplete}>Onboarding Placeholder. Click to continue.</div>;


const DevNavigation = () => (
  <nav className="bg-gray-900 text-white p-2 absolute top-0 left-0 z-50">
    <Link to="/" className="mr-4">Dashboard</Link>
    <Link to="/builder">Builder</Link>
  </nav>
);


function App() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const showOnboarding = false;


  if (showOnboarding && !isOnboardingComplete) {
    return <OnboardingFlow onOnboardingComplete={() => setIsOnboardingComplete(true)} />;
  }

  return (
    <div className="relative">
      <DevNavigation />
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/builder" element={<WorkflowBuilderView />} />
      </Routes>
    </div>

  );
}

export default App;
