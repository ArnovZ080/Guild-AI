import React from 'react';

const CompletionScreen = ({ onComplete, onBack, userProfile }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Completion</h2>
      <p className="mb-8">You're all set up!</p>
      <div className="flex gap-4 justify-center">
        <button onClick={onBack} className="px-4 py-2 border rounded">Back</button>
        <button onClick={onComplete} className="bg-green-600 text-white px-4 py-2 rounded">Complete</button>
      </div>
    </div>
  );
};

export default CompletionScreen;