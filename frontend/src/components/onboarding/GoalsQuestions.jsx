import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Question from './Question';
import { getReassurance } from './conversationSnippets';

const GoalsQuestions = ({ onNext }) => {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    {
      id: 'priority_3months',
      text: "What's your #1 priority for the next 3 months?",
      subtext: "Pick the one that feels most urgent or exciting right now. This will guide how Guild prioritizes your workflows.",
      options: [
        "Get more clients / customers",
        "Grow my revenue",
        "Build a brand and community",
        "Launch a new product or service",
        "Get more organized and efficient",
        "Improve my marketing",
        "Something else"
      ],
      allowCustom: true,
      reassurance: "Don't overthink it — you can always change or refine your goals later as your business evolves."
    },
    {
      id: 'guild_support_focus',
      text: "What kind of support do you want Guild to give you first?",
      subtext: "This will guide how our AI agents step in to help you. Think of this as telling your new AI team what to focus on first.",
      options: [
        "Marketing support (content, campaigns, ads)",
        "Sales support (funnels, outreach, partnerships)",
        "Operations support (project management, SOPs, automation)",
        "Finance support (bookkeeping, pricing, planning)",
        "Product & customer support (feedback, testing, customer service)",
        "Strategy & planning (business model, growth planning)",
        "A bit of everything"
      ],
      allowCustom: true,
      reassurance: "This sets the initial focus, but Guild will adapt and expand support as your needs grow."
    },
    {
      id: 'guild_working_style',
      text: "How do you prefer Guild to work with you?",
      subtext: "Some founders like more autonomy, others want to stay in the driver's seat. This helps us match your working style.",
      options: [
        "Take initiative and act proactively",
        "Give me options and let me choose",
        "Teach me as we go along",
        "A mix of all of these",
        "I'm not sure yet"
      ],
      allowCustom: false,
      reassurance: "Guild adapts to your style — this just sets the initial tone. You can always adjust how hands-on or hands-off you want to be."
    },
    {
      id: 'vision_12months',
      text: "When you think about success 12 months from now, what would make you say 'this was worth it'?",
      subtext: "Paint a picture of your future — Guild will help you reverse engineer it into actionable steps.",
      allowCustom: true,
      supportText: "Think big picture: revenue goals, lifestyle changes, impact you want to make, or problems you want to solve.",
      reassurance: getReassurance('vision')
    },
    {
      id: 'biggest_challenge',
      text: "What's your biggest challenge right now?",
      subtext: "This helps us understand what's holding you back so we can tackle it head-on.",
      allowCustom: true,
      supportText: "Be specific — the more we understand your challenges, the better we can help you overcome them.",
      reassurance: "This is exactly what Guild was built for — turning challenges into opportunities for growth."
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
      {/* Motivational intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <div className="text-purple-600 text-xl">🚀</div>
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">Time to dream big</h3>
            <p className="text-purple-800 italic">
              Great — we've got a picture of your business, your audience, and some basics. 
              Now let's talk about your goals, so Guild can prioritize what matters most to you. 
              This is where we turn your vision into a reality.
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

export default GoalsQuestions;
