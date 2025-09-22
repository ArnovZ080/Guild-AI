import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Question from './Question';
import { getReassurance } from './conversationSnippets';

const FinancialQuestions = ({ onNext }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showFinancials, setShowFinancials] = useState(false);

  const questions = [
    {
      id: 'share_financials',
      text: "Would you like to share any financial details now?",
      subtext: "This could include revenue, pricing, budgets, or financial goals. It's completely optional.",
      options: [
        "Yes, I'll share some details",
        "Not yet, but maybe later",
        "I prefer to keep this private"
      ],
      allowCustom: false,
      supportText: "Financial information helps us create more accurate strategies and recommendations, but Guild works great without it too.",
      reassurance: getReassurance('financial')
    },
    {
      id: 'revenue_range',
      text: "What's your current monthly revenue range?",
      subtext: "This helps us understand your business scale and growth potential.",
      options: [
        "Pre-revenue / Just starting",
        "$0 - $1,000",
        "$1,000 - $5,000",
        "$5,000 - $10,000",
        "$10,000 - $25,000",
        "$25,000+",
        "Prefer not to say"
      ],
      allowCustom: true,
      reassurance: "This is just to help us tailor our strategies — no judgment here!"
    },
    {
      id: 'pricing_status',
      text: "How are you handling pricing right now?",
      subtext: "This helps us understand if you need pricing strategy support.",
      options: [
        "I have clear pricing set",
        "I'm working on pricing",
        "I'm not sure how to price",
        "I use dynamic/flexible pricing"
      ],
      allowCustom: true,
      reassurance: "Pricing is tricky for everyone — if you're unsure, our Strategy Agent can help you develop a solid pricing model."
    },
    {
      id: 'marketing_budget',
      text: "Do you have a monthly marketing/advertising budget?",
      subtext: "This helps us recommend realistic marketing strategies.",
      options: [
        "Yes, I have a set budget",
        "I spend as needed",
        "I don't have a budget yet",
        "I'm not sure what to budget"
      ],
      allowCustom: true,
      reassurance: "No worries if you don't have a budget yet — we can help you figure out what makes sense for your business."
    },
    {
      id: 'financial_goals',
      text: "What are your financial goals for the next 12 months?",
      subtext: "This helps us create strategies that align with your ambitions.",
      allowCustom: true,
      supportText: "Think about revenue targets, profit goals, or other financial milestones you'd like to hit.",
      reassurance: "Dream big! The more ambitious your goals, the more motivated we'll be to help you achieve them."
    }
  ];

  const handleAnswer = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // If they choose not to share financials, skip the rest
    if (questionId === 'share_financials' && answer === 'I prefer to keep this private') {
      onNext(newAnswers);
      return;
    }

    // If they choose not yet, skip financial details
    if (questionId === 'share_financials' && answer === 'Not yet, but maybe later') {
      onNext(newAnswers);
      return;
    }

    // If they choose to share, show financial questions
      if (questionId === 'share_financials' && answer === 'Yes, I\'ll share some details') {
      setShowFinancials(true);
      setTimeout(() => setCurrentQuestion(1), 1000);
      return;
    }

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
      {/* Sensitive topic intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <div className="text-amber-600 text-xl">💛</div>
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">Money can feel sensitive</h3>
            <p className="text-amber-800 italic">
              We get it. Financial information is personal, and sharing it can feel vulnerable. 
              This section is completely optional — Guild works beautifully without any financial details. 
              If you do choose to share, it just helps us create more targeted strategies for your business.
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
          Skip all financial questions
        </button>
      </div>
    </div>
  );
};

export default FinancialQuestions;
