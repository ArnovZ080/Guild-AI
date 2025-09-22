import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdaptiveModeProvider } from '../contexts/AdaptiveModeContext';
import { AgentCommunicationProvider } from '../contexts/AgentCommunicationContext.simple';
import ChatPageV2 from './pages/Chat';

function AppV2() {
  return (
    <AdaptiveModeProvider>
      <AgentCommunicationProvider>
        <Router basename={window.location.pathname.startsWith('/v2') ? '/v2' : '/'}>
          <Routes>
            <Route path="/" element={<ChatPageV2 />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AgentCommunicationProvider>
    </AdaptiveModeProvider>
  );
}

export default AppV2;


