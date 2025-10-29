// Environment configuration for Guild-AI Frontend
// This file centralizes all environment variables and API endpoints

const getApiBaseUrl = () => {
  // Always use production API URL for now
  return import.meta.env.VITE_API_URL || 'https://guild-ai-api-881782424.us-central1.run.app';
};

const getOrchestratorBaseUrl = () => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/orchestrator`;
};

export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: getApiBaseUrl(),
  ORCHESTRATOR_BASE_URL: getOrchestratorBaseUrl(),
  
  // Feature Flags
  ENABLE_ORCHESTRATOR: import.meta.env.VITE_ENABLE_ORCHESTRATOR !== 'false',
  ENABLE_AGENTS: import.meta.env.VITE_ENABLE_AGENTS !== 'false',
  ENABLE_WORKFLOWS: import.meta.env.VITE_ENABLE_WORKFLOWS !== 'false',
  
  // Firebase Configuration
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  
  // Debug Configuration
  DEBUG_MODE: import.meta.env.DEV,
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info'
};

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 Environment Configuration:', ENV_CONFIG);
}

