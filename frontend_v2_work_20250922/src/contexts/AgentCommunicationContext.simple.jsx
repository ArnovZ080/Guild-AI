import React, { createContext, useContext, useState, useCallback } from 'react';

const AgentCommunicationContext = createContext(null);

export const useAgentCommunication = () => {
  const ctx = useContext(AgentCommunicationContext);
  if (!ctx) throw new Error('useAgentCommunication must be used within AgentCommunicationProvider');
  return ctx;
};

export const AgentCommunicationProvider = ({ children }) => {
  const [hasPendingResponses, setHasPendingResponses] = useState(false);

  const sendTaskToAgent = useCallback(async (actionName, payload) => {
    setHasPendingResponses(true);
    try {
      // TODO: Replace with real API call
      await new Promise((r) => setTimeout(r, 500));
      return { ok: true };
    } finally {
      setHasPendingResponses(false);
    }
  }, []);

  return (
    <AgentCommunicationContext.Provider value={{ sendTaskToAgent, hasPendingResponses }}>
      {children}
    </AgentCommunicationContext.Provider>
  );
};


