import React from 'react';

const WelcomeStep = ({ onNext, userProfile, updateUserProfile }) => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Guild-AI</h1>
      <p className="text-lg mb-8">Let's get you started with your AI workforce</p>
      <button 
        onClick={onNext}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Get Started
      </button>
    </div>
  );
};

export default WelcomeStep;