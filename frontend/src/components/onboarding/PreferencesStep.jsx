import React, { useState } from 'react';
import { motion } from '../common/AnimationWrapper';
import Question from './Question';
import { Shield, Cloud, HardDrive, Lock } from 'lucide-react';

const PreferencesStep = ({ onNext }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    {
      id: 'data_storage',
      text: "Where would you prefer to store your business data?",
      subtext: "This affects how Guild accesses and processes your information.",
      options: [
        "Secure cloud storage (recommended)",
        "Local storage only",
        "Hybrid approach (some cloud, some local)",
        "I'm not sure"
      ],
      allowCustom: false,
      supportText: "Cloud storage allows Guild to work more effectively across devices and provides better backup security.",
      reassurance: "You can always change this preference later in your settings."
    },
    {
      id: 'sensitive_data',
      text: "How do you want Guild to handle sensitive information?",
      subtext: "This includes financial data, customer information, and other confidential business details.",
      options: [
        "Full access for better automation",
        "Limited access with my approval",
        "Minimal access, I'll handle sensitive tasks",
        "I'm not sure yet"
      ],
      allowCustom: false,
      supportText: "More access means better automation, but we respect your privacy preferences completely.",
      reassurance: "Your data security is our top priority. You can adjust these settings anytime."
    },
    {
      id: 'automation_level',
      text: "How autonomous should Guild be?",
      subtext: "This determines how much Guild can do on its own versus asking for your approval first.",
      options: [
        "Very autonomous - act first, ask later",
        "Moderately autonomous - ask for important decisions",
        "Conservative - ask before taking action",
        "I want to learn as we go"
      ],
      allowCustom: false,
      reassurance: "You can always adjust this as you get more comfortable with Guild's capabilities."
    },
    {
      id: 'notification_preferences',
      text: "How do you want to stay updated on Guild's activities?",
      subtext: "This helps us keep you informed without overwhelming you.",
      options: [
        "Real-time notifications",
        "Daily summary emails",
        "Weekly reports",
        "Only important updates",
        "Minimal notifications"
      ],
      allowCustom: false,
      reassurance: "You can customize these notifications later to match your workflow."
    }
  ];

  const handleAnswer = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // Show micro-acknowledgement
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // All questions answered, move to next step
        onNext(newAnswers);
      }
    }, 1000);
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-8">
      {/* Privacy & preferences intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">Your preferences matter</h3>
            <p className="text-green-800 italic">
              These settings help Guild work the way you want it to. Don't worry —
              you can change any of these preferences later as you get more comfortable with the platform.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-2 mb-8">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index <= currentQuestion ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Current question */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Question
          text={currentQ.text}
          subtext={currentQ.subtext}
          options={currentQ.options}
          allowCustom={currentQ.allowCustom}
          supportText={currentQ.supportText}
          reassurance={currentQ.reassurance}
          onAnswer={(answer) => handleAnswer(currentQ.id, answer)}
        />
      </motion.div>

      {/* Skip option */}
      <div className="text-center">
        <button
          onClick={() => onNext(answers)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Use default preferences
        </button>
      </div>
    </div>
  );
};

export default PreferencesStep;
