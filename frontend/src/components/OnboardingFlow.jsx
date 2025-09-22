import React, { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface.jsx';

const ONBOARDING_QUESTIONS = [
  "Tell me about your business. What do you do?",
  "How many people are in your business?",
  "How long have you been doing this?",
  "Who is your ideal client for your product or service?",
  "Do you have a specific client avatar? If not, it’s okay, we can build one later.",
  "What products or services do you sell, or would you like to sell?",
  "What is your pricing strategy? Just broadly, we can go into details later.",
  "What is your current turnover? I know you don’t trust me yet, so you can give me a ballpark figure.",
  "What are your turnover goals for the next 6 months? And for the next year?",
  "What are your biggest pain points in your business right now?",
  "What social media platforms are you on, and what does your follower situation look like?",
  "Tell me more about your brand. Do you have a specific brand voice?",
  "What are your brand colours, and are there any specific fonts you would like to use?",
  "Finally, where do you see yourself with this brand in 5 years? Dream big and tell me your vision."
];

const OnboardingFlow = ({ onOnboardingComplete }) => {
  const [step, setStep] = useState('welcome'); // welcome, questioning, setup, complete
  const [messages, setMessages] = useState([]);
  const [actions, setActions] = useState([]);
  const [inputPlaceholder, setInputPlaceholder] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        type: 'assistant',
        content: "Hello! Welcome to Guild! Your AI Company of 1. To get the most out of us, I am going to ask you some questions to get to know you, your business, and your goals a bit better. Once we have that all down, I can walk you through the setup procedures and show you some of the epic things we can do for you. Sounds Good?",
        timestamp: new Date(),
      }
    ]);
    setActions(['Start']);
    setInputPlaceholder('');
  }, []);

  const handleActionClick = (action) => {
    if (action === 'Start' && step === 'welcome') {
      setStep('questioning');
      setActions([]);
      askNextQuestion();
    }
    // Handle other actions for setup phase later
  };

  const askNextQuestion = (index = currentQuestionIndex) => {
    if (index < ONBOARDING_QUESTIONS.length) {
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `q-${index}`,
          type: 'assistant',
          content: ONBOARDING_QUESTIONS[index],
          timestamp: new Date(),
        }]);
        setInputPlaceholder(`Your answer to: "${ONBOARDING_QUESTIONS[index].substring(0, 40)}..."`);
        setIsLoading(false);
      }, 800);
    } else {
      // All questions answered
      moveToSetupPhase();
    }
  };

  const handleSendMessage = (messageText) => {
    if (step !== 'questioning' || isLoading) return;

    // Add user's answer to messages
    setMessages(prev => [...prev, {
      id: `ans-${currentQuestionIndex}`,
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    }]);

    // Store the answer
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: messageText }));

    // Move to the next question
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    askNextQuestion(nextIndex);
  };

  const moveToSetupPhase = () => {
      setStep('setup');
      setIsLoading(true);
      setInputPlaceholder('');
      setTimeout(() => {
          setMessages(prev => [...prev, {
              id: 'setup-start',
              type: 'assistant',
              content: "Okay great! Now that we understand a bit more about your business and what you want to achieve, let’s get you hooked up and ready to go! Your data privacy is our top priority so we can do it one of two ways. We can either create a folder for ourselves on your desktop that we will use to store all the relevant company information we need, or we can store it “off site’ in a secure cloud database to save you some space if you’re okay with that. Which would you prefer? You can always change it later",
              timestamp: new Date(),
          }]);
          setActions(['On-site', 'Off-site']);
          setIsLoading(false);
      }, 1200);
  };

  const handleNewConversation = () => {
      // For now, this just resets the onboarding, but could be adapted
      setStep('welcome');
      setCurrentQuestionIndex(0);
      setAnswers({});
      // Re-trigger the initial useEffect
       setMessages([
        {
          id: 'welcome',
          type: 'assistant',
          content: "Hello! Welcome to Guild! Your AI Company of 1. To get the most out of us, I am going to ask you some questions to get to know you, your business, and your goals a bit better. Once we have that all down, I can walk you through the setup procedures and show you some of the epic things we can do for you. Sounds Good?",
          timestamp: new Date(),
        }
      ]);
      setActions(['Start']);
      setInputPlaceholder('');
  }

  return (
    <ChatInterface
      messages={messages}
      onSendMessage={handleSendMessage}
      onActionClick={handleActionClick}
      isLoading={isLoading}
      chatHistory={[]} // Placeholder for now
      onNewConversation={handleNewConversation}
      onNavigateToDashboard={onOnboardingComplete}
      inputPlaceholder={inputPlaceholder}
      actions={actions}
    />
  );
};

export default OnboardingFlow;
