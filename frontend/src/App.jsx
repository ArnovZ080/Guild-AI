import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { EnhancedMainDashboard } from './components/dashboard/EnhancedMainDashboard';
import ConnectorSetup from './components/ConnectorSetup';
import { MomentumBankingDashboard } from './components/banking/MomentumBankingDashboard';
import { ContextualIntelligenceDashboard } from './components/intelligence/ContextualIntelligenceDashboard';

// Import all context providers
import { PsychologicalOptimizationProvider } from './contexts/PsychologicalOptimizationContext';
import { CelebrationProvider } from './contexts/CelebrationContext';
import { MomentumBankingProvider } from './contexts/MomentumBankingContext';
import { ContextualIntelligenceProvider } from './contexts/ContextualIntelligenceContext';

function App() {
  return (
    <Router>
      <PsychologicalOptimizationProvider>
        <CelebrationProvider>
          <MomentumBankingProvider>
            <ContextualIntelligenceProvider>
              <Routes>
                {/* Main Dashboard Routes */}
                <Route path="/" element={<EnhancedMainDashboard />} />
                <Route path="/dashboard" element={<MainDashboard />} />
                
                {/* Integration Routes */}
                <Route path="/connectors" element={<ConnectorSetup />} />
                <Route path="/connectors/setup" element={<ConnectorSetup />} />
                
                {/* Advanced System Routes */}
                <Route path="/momentum-banking" element={<MomentumBankingDashboard />} />
                <Route path="/intelligence" element={<ContextualIntelligenceDashboard />} />
                
                {/* Legacy Routes */}
                <Route path="/legacy" element={<MainDashboard />} />
              </Routes>
            </ContextualIntelligenceProvider>
          </MomentumBankingProvider>
        </CelebrationProvider>
      </PsychologicalOptimizationProvider>
    </Router>
  );
}

export default App;
