import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Question from './Question';
import { getRandomSnippet } from './conversationSnippets';

const BusinessQuestions = ({ onNext }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    {
      id: 'business_type',
      text: "What type of business are you running (or planning to run)?",
      subtext: "This helps Guild understand your context and industry.",
      options: [
        "Coaching / Consulting",
        "E-commerce / Online Store",
        "SaaS / Digital Products",
        "Freelancing / Services",
        "Content Creation / Media",
        "Agency / Marketing",
        "Not sure yet"
      ],
      allowCustom: true,
      reassurance: "It's okay if you're still figuring this out — Guild will help refine your business model."
    },
    {
      id: 'business_stage',
      text: "What stage is your business at right now?",
      subtext: "This helps us tailor our approach to where you are in your journey.",
      options: [
        "Just getting started (pre-launch)",
        "Recently launched (0-6 months)",
        "Growing (6 months - 2 years)",
        "Established (2+ years)",
        "Scaling up (hiring, expanding)"
      ],
      allowCustom: true,
      reassurance: "No judgment here — every stage has its own opportunities and challenges."
    },
    {
      id: 'business_description',
      text: "Tell us about your business in your own words",
      subtext: "A quick overview of what you do, who you serve, and what makes you unique.",
      allowCustom: true,
      supportText: "Don't overthink it — just share what comes to mind. We'll help you refine this later.",
      reassurance: "This is just to get us started. You can always expand on this later."
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
          Skip remaining questions
        </button>
      </div>
    </div>
  );
};

export default BusinessQuestions;
