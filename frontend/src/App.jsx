import React from 'react';
import { AdaptiveModeProvider } from './components/adaptive/AdaptiveModeContext.jsx';
import { CelebrationProvider } from './components/psychological/MicroCelebrations.jsx';
import { MainDashboard } from './components/dashboard/MainDashboard.tsx';
import './App.css';

function App() {
  return (
    <AdaptiveModeProvider>
      <CelebrationProvider>
        <MainDashboard />
      </CelebrationProvider>
    </AdaptiveModeProvider>
  );
}

export default App;