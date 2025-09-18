import React from 'react';

const GoalsQuestions = ({ onNext, onBack, userProfile, updateUserProfile }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Goals Questions</h2>
      <p className="mb-8">What are your main goals?</p>
      <div className="flex gap-4 justify-center">
        <button onClick={onBack} className="px-4 py-2 border rounded">Back</button>
        <button onClick={onNext} className="bg-blue-600 text-white px-4 py-2 rounded">Next</button>
      </div>
    </div>
  );
};

export default GoalsQuestions;