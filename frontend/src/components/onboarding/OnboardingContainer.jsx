import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeStep from './WelcomeStep';
import BusinessQuestions from './BusinessQuestions';
import AudienceQuestions from './AudienceQuestions';
import BrandQuestions from './BrandQuestions.jsx';
import FinancialQuestions from './FinancialQuestions';
import GoalsQuestions from './GoalsQuestions';
import PreferencesStep from './PreferencesStep';
import IntegrationsStep from './IntegrationsStep';
import ScreenRecordingStep from './ScreenRecordingStep';
import SummaryStep from './SummaryStep';
import CapabilitiesStep from './CapabilitiesStep';
import CompletionScreen from './CompletionScreen';

const OnboardingContainer = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [answers, setAnswers] = useState({});
  const [unknowns, setUnknowns] = useState([]); // track questions answered as unknown
  const [showScreenRecording, setShowScreenRecording] = useState(false);

  const updateAnswers = (newData) => {
    // merge answers
    setAnswers(prev => ({ ...prev, ...newData }));
    // collect unknowns based on simple heuristics
    const lowered = Object.entries(newData).map(([k, v]) => [k, String(v || '').toLowerCase()]);
    const newUnknowns = lowered
      .filter(([, v]) => v.includes("not sure") || v.includes("don't know") || v === '' )
      .map(([k]) => k);
    if (newUnknowns.length) {
      setUnknowns(prev => Array.from(new Set([...
        prev,
        ...newUnknowns
      ])));
    }
  };

  const steps = {
    welcome: <WelcomeStep onNext={() => setCurrentStep('business')} />,
    business: (
      <BusinessQuestions
        onNext={(data) => { 
          updateAnswers(data); 
          setCurrentStep('audience'); 
        }}
      />
    ),
    audience: (
      <AudienceQuestions
        onNext={(data) => { 
          updateAnswers(data); 
          setCurrentStep('brand'); 
        }}
        businessType={answers.business_type}
      />
    ),
    brand: (
      <BrandQuestions
        onNext={(data) => {
          updateAnswers(data);
          setCurrentStep('financial');
        }}
      />
    ),
    financial: (
      <FinancialQuestions
        onNext={(data) => { 
          updateAnswers(data); 
          setCurrentStep('goals'); 
        }}
      />
    ),
    goals: (
      <GoalsQuestions
        onNext={(data) => { 
          updateAnswers(data); 
          setCurrentStep('preferences'); 
        }}
      />
    ),
    preferences: (
      <PreferencesStep
        onNext={(data) => { 
          updateAnswers(data); 
          setCurrentStep('integrations'); 
        }}
      />
    ),
    integrations: (
      <IntegrationsStep
        onNext={(data) => { 
          updateAnswers(data); 
          setCurrentStep('summary'); 
        }}
        onScreenRecord={() => setShowScreenRecording(true)}
      />
    ),
    summary: (
      <SummaryStep
        answers={answers}
        onNext={() => setCurrentStep('capabilities')}
      />
    ),
    capabilities: (
      <CapabilitiesStep
        answers={answers}
        onNext={() => setCurrentStep('completion')}
      />
    ),
    completion: (
      <CompletionScreen
        answers={{ ...answers, unknowns }}
        onFinish={() => onComplete({ ...answers, unknowns })}
      />
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {showScreenRecording && (
        <ScreenRecordingStep
          selectedSoftware={answers.selectedSoftware}
          onClose={() => setShowScreenRecording(false)}
          onComplete={(data) => {
            updateAnswers(data);
            setShowScreenRecording(false);
          }}
        />
      )}
    </div>
  );
};

export default OnboardingContainer;
