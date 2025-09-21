import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Debug logging for initialization tracking
console.log('🚀 Starting application initialization...')

// Global error handlers for debugging
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', event.error);
  console.error('🚨 Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
  console.error('🚨 Promise rejection details:', event.reason?.stack);
});

// Log all console errors
const originalConsoleError = console.error;
console.error = (...args) => {
  console.log('🔍 Console Error Detected:', ...args);
  originalConsoleError.apply(console, args);
};

try {
  console.log('✅ React imported successfully')
  console.log('✅ ReactDOM imported successfully')
  console.log('✅ App component imported successfully')
  console.log('✅ CSS imported successfully')
  
  const rootElement = document.getElementById('root')
  console.log('🎯 Root element found:', rootElement)
  
  console.log('🔧 Creating React root...')
  const root = ReactDOM.createRoot(rootElement)
  console.log('✅ React root created successfully')
  
  console.log('🎨 Rendering App component...')
  root.render(<App />)
  console.log('✅ App component rendered successfully')
  
  console.log('🎉 Application initialization complete!')
} catch (error) {
  console.error('❌ Application initialization failed:', error)
  console.error('Error stack:', error.stack)
  
  // Show error in UI as fallback
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; color: red;">
        <h2>Application Error</h2>
        <p>Failed to initialize the application.</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <p><strong>Stack:</strong></p>
        <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.stack}</pre>
      </div>
    `
  }
}
