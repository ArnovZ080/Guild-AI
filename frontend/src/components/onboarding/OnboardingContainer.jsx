import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import WelcomeStep from './WelcomeStep';

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
    const UNKNOWN_PATTERNS = [
      'not sure',
      "don't know",
      'dont know',
      'do not know',
      'not sure yet',
      'not sure what',
      "don't track",
      'dont track',
      "i don't have",
      'i dont have',
    ];
    const newUnknowns = lowered
      .filter(([, v]) => v === '' || UNKNOWN_PATTERNS.some(p => v.includes(p)))
      .map(([k]) => k);
    if (newUnknowns.length) {
      setUnknowns(prev => Array.from(new Set([...
        prev,
        ...newUnknowns
      ])));
    }
  };

  const persistProfile = async (data) => {
    try {
      const payload = {
        company_name: data.company_name,
        description: data.business_description || data.tagline || data.business_blurb,
        team_size: data.team_size ? parseInt(data.team_size) : undefined,
        years_active: data.years_active ? parseInt(data.years_active) : undefined,
        ideal_client: data.ideal_customer || data.icp,
        products_services: data.products_services || data.offerings,
        pricing_strategy: data.pricing_strategy,
        turnover_current: data.revenue_current,
        turnover_goals_6m: data.revenue_goal_6m,
        turnover_goals_12m: data.revenue_goal_12m,
        pain_points: data.primary_pain_points,
        platforms: data.platforms || { social: data.social_platforms, email: data.email_platforms },
        brand_voice: data.brand_voice,
        brand_colors: data.brand_colors,
        brand_fonts: data.brand_fonts,
        long_term_vision: data.vision,
        guidelines: data.guidelines
      };
      await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch (e) {
      console.warn('Failed to persist onboarding profile', e);
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
        onNext={async () => {
          await persistProfile(answers);
          onComplete({ ...answers, unknowns });
        }}
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
