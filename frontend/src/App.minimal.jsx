import React, { useState, useEffect } from 'react';
import { AdaptiveModeProvider } from './contexts/AdaptiveModeContext';

// Minimal test component
const MinimalTest = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Guild AI</h1>
        <p className="text-gray-600">Minimal test - no complex dependencies</p>
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800">✅ App loads successfully!</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AdaptiveModeProvider>
      <MinimalTest />
    </AdaptiveModeProvider>
  );
}

export default App;
