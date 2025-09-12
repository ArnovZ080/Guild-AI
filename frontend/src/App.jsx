import React from 'react';
import { AdaptiveModeProvider } from './components/adaptive/AdaptiveModeContext';
import { CelebrationProvider } from './components/psychological/MicroCelebrations';
import { MainDashboard } from './components/dashboard/MainDashboard';


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