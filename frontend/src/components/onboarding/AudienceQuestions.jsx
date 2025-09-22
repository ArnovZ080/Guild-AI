import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Question from './Question';
import { getReassurance } from './conversationSnippets';

const AudienceQuestions = ({ onNext, businessType }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Generate contextual intro based on business type
  const getIntro = () => {
    if (businessType) {
      const lowered = String(businessType).toLowerCase();
      if (lowered.includes("not sure")) {
       return "It's fine if you're not sure yet. We can work on that. In the meantime, let's talk about your ideal audience or clients. This is where the magic happens — when you know exactly who you're serving, everything else becomes clearer.";
      }
      return `Perfect! Now that we understand your ${businessType.toLowerCase()} business, let's talk about your ideal audience or clients. This is where the magic happens — when you know exactly who you're serving, everything else becomes clearer.`;
    }
    return "Now let's talk about your ideal audience or clients. This is where the magic happens — when you know exactly who you're serving, everything else becomes clearer.";
  };

  const questions = [
    {
      id: 'audience_type',
      text: "Who do you imagine benefits the most from what you offer?",
      subtext: "Think about people or businesses who really need what you provide.",
      options: [
        "Individual consumers (B2C)",
        "Small businesses (B2B)",
        "Enterprise companies",
        "Non-profits / Organizations",
        "Other creators / Freelancers",
        "Not sure yet"
      ],
      allowCustom: true,
      reassurance: "If you're not sure, that's okay — Guild will help you define this through research and testing."
    },
    {
      id: 'customer_avatar',
      text: "Do you already have a customer avatar (ideal client profile)?",
      subtext: "An avatar is a detailed description of your perfect client — their pain points, goals, and characteristics.",
      options: [
        "Yes, I have a detailed avatar",
        "I have a rough idea",
        "No, but I know my audience generally",
        "Not sure what that is"
      ],
      allowCustom: false,
      supportText: "Don't worry if you don't have one yet — this is exactly what our Strategy Agent excels at creating.",
      reassurance: "This is one of our specialties! If you don't have one, we'll build it together using research and data."
    },
    {
      id: 'audience_problem',
      text: "What's the biggest problem your audience struggles with?",
      subtext: "This will help Guild craft messaging that resonates and solutions that actually work.",
      allowCustom: true,
      supportText: "The more specific you can be, the better we can help you solve it. Think about the pain that keeps them up at night.",
      reassurance: getReassurance('painPoints')
    },
    {
      id: 'audience_size',
      text: "How big is your current audience or customer base?",
      subtext: "This helps us understand your reach and growth potential.",
      options: [
        "Just starting (0-10 people)",
        "Small but growing (10-100 people)",
        "Moderate (100-1,000 people)",
        "Large (1,000+ people)",
        "Not sure / Don't track this"
      ],
      allowCustom: true,
      reassurance: "No pressure on the numbers — this just helps us tailor our growth strategies to your current situation."
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
      {/* Header + Contextual intro */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Let's talk about who you want to serve in your business</h3>
        <p className="text-gray-700 italic text-lg leading-relaxed">
          {getIntro()}
        </p>
      </div>
      
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

      {/* Navigation controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)}
          className={`text-sm underline transition-colors ${
            currentQuestion > 0 ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'
          }`}
          disabled={currentQuestion === 0}
        >
          Back
        </button>
        <button
          onClick={() => {
            const nextIndex = currentQuestion + 1;
            setAnswers(prev => ({ ...prev, [currentQ.id]: '' }));
            if (nextIndex < questions.length) {
              setCurrentQuestion(nextIndex);
            } else {
              onNext({ ...answers, [currentQ.id]: '' });
            }
          }}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Skip this question
        </button>
      </div>

      {/* Skip remaining */}
      <div className="text-center">
        <button
          onClick={() => onNext(answers)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Skip remaining questions
        </button>
      </div>
    </div>
  );
};

export default AudienceQuestions;
