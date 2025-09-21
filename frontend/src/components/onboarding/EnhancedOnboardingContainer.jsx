import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '../common/AnimationWrapper';
import { usePsychologicalOptimization } from '../../contexts/PsychologicalOptimizationContext';
import { useCelebrations } from '../../contexts/CelebrationContext';
import onboardingFollowUpService from '../../services/onboardingFollowUpService';
import WelcomeStep from './WelcomeStep';
import EnhancedWelcomeStep from './EnhancedWelcomeStep';
import EnhancedQuestion from './EnhancedQuestion';
import BusinessQuestions from './BusinessQuestions';
import AudienceQuestions from './AudienceQuestions';
import BrandQuestions from './BrandQuestions';
import FinancialQuestions from './FinancialQuestions';
import GoalsQuestions from './GoalsQuestions';
import PreferencesStep from './PreferencesStep';
import IntegrationsStep from './IntegrationsStep';
import ScreenRecordingStep from './ScreenRecordingStep';
import SummaryStep from './SummaryStep';
import CapabilitiesStep from './CapabilitiesStep';
import CompletionScreen from './CompletionScreen';
import EnhancedConnectorSetup from '../connectors/EnhancedConnectorSetup';

const EnhancedOnboardingContainer = ({ onComplete }) => {
  const { updateUserProfile, getCurrentMode } = usePsychologicalOptimization();
  const { triggerTaskCompletionCelebration } = useCelebrations();
  
  const [currentStep, setCurrentStep] = useState('welcome');
  const [answers, setAnswers] = useState({});
  const [showScreenRecording, setShowScreenRecording] = useState(false);
  const [showConnectorSetup, setShowConnectorSetup] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState({
    completedSteps: 0,
    totalSteps: 11,
    currentStepIndex: 0
  });

  const currentMode = getCurrentMode();

  // Enhanced step configuration with psychological optimization
  const stepConfig = {
    welcome: { index: 0, weight: 1, category: 'introduction' },
    business: { index: 1, weight: 2, category: 'discovery' },
    audience: { index: 2, weight: 2, category: 'discovery' },
    brand: { index: 3, weight: 2, category: 'brand_identity' },
    financial: { index: 4, weight: 1.5, category: 'sensitive' },
    goals: { index: 5, weight: 2, category: 'planning' },
    preferences: { index: 6, weight: 1, category: 'configuration' },
    integrations: { index: 7, weight: 1.5, category: 'technical' },
    summary: { index: 8, weight: 1, category: 'review' },
    capabilities: { index: 9, weight: 1, category: 'education' },
    completion: { index: 10, weight: 1, category: 'completion' }
  };

  const updateAnswers = (newData) => {
    const updatedAnswers = { ...answers, ...newData };
    setAnswers(updatedAnswers);
    
    // Update psychological profile based on answers
    updatePsychologicalProfile(updatedAnswers);
  };

  const updatePsychologicalProfile = (profileAnswers) => {
    const psychologicalInsights = analyzeAnswersForPsychology(profileAnswers);
    updateUserProfile(psychologicalInsights);
  };

  const analyzeAnswersForPsychology = (answers) => {
    const insights = {
      userType: 'solopreneur',
      confidenceLevel: 'medium',
      stressIndicators: [],
      motivationDrivers: [],
      workingStyle: 'collaborative',
      riskTolerance: 'moderate'
    };

    // Analyze business stage for confidence level
    if (answers.business_stage) {
      if (answers.business_stage.includes('Just getting started') || answers.business_stage.includes('Recently launched')) {
        insights.confidenceLevel = 'lower';
        insights.stressIndicators.push('uncertainty_about_business');
      } else if (answers.business_stage.includes('Established') || answers.business_stage.includes('Scaling')) {
        insights.confidenceLevel = 'higher';
        insights.motivationDrivers.push('growth_ambition');
      }
    }

    // Analyze financial comfort level
    if (answers.revenue_range) {
      if (answers.revenue_range.includes('Pre-revenue') || answers.revenue_range.includes('$0 - $1,000')) {
        insights.stressIndicators.push('financial_pressure');
      } else if (answers.revenue_range.includes('$10,000+')) {
        insights.motivationDrivers.push('success_momentum');
      }
    }

    // Analyze automation preference
    if (answers.automation_level) {
      if (answers.automation_level.includes('Very autonomous')) {
        insights.workingStyle = 'hands-off';
        insights.riskTolerance = 'higher';
      } else if (answers.automation_level.includes('Conservative')) {
        insights.workingStyle = 'hands-on';
        insights.riskTolerance = 'lower';
      }
    }

    // Analyze pain points for stress indicators
    if (answers.pain_points) {
      const painPoints = answers.pain_points.toLowerCase();
      if (painPoints.includes('time') || painPoints.includes('overwhelmed')) {
        insights.stressIndicators.push('time_management');
      }
      if (painPoints.includes('marketing') || painPoints.includes('sales')) {
        insights.stressIndicators.push('growth_anxiety');
      }
      if (painPoints.includes('financial') || painPoints.includes('money')) {
        insights.stressIndicators.push('financial_management');
      }
    }

    // Analyze vision for motivation drivers
    if (answers.vision_12months) {
      const vision = answers.vision_12months.toLowerCase();
      if (vision.includes('freedom') || vision.includes('lifestyle')) {
        insights.motivationDrivers.push('lifestyle_freedom');
      }
      if (vision.includes('scale') || vision.includes('grow')) {
        insights.motivationDrivers.push('growth_ambition');
      }
      if (vision.includes('help') || vision.includes('impact')) {
        insights.motivationDrivers.push('purpose_driven');
      }
    }

    return insights;
  };

  const handleStepTransition = (nextStep, stepData = {}) => {
    const currentStepInfo = stepConfig[currentStep];
    const nextStepInfo = stepConfig[nextStep];
    
    // Update progress
    setOnboardingProgress(prev => ({
      ...prev,
      completedSteps: nextStepInfo.index,
      currentStepIndex: nextStepInfo.index
    }));

    // Trigger appropriate celebration based on step importance
    if (nextStepInfo.weight >= 2) {
      triggerTaskCompletionCelebration({
        name: `Completed ${nextStepInfo.category} section`,
        difficulty: nextStepInfo.weight >= 2 ? 'hard' : 'medium',
        type: 'onboarding_milestone',
        isLinkedToMajorGoal: true,
        revenueImpact: 0
      });
    }

    setCurrentStep(nextStep);
    if (Object.keys(stepData).length > 0) {
      updateAnswers(stepData);
    }
  };

  const handleConnectorSetup = (connectorData) => {
    updateAnswers({ connectorSetup: connectorData });
    setShowConnectorSetup(false);
    
    // Trigger celebration for successful integration
    triggerTaskCompletionCelebration({
      name: 'Connected external tools',
      difficulty: 'medium',
      type: 'integration_success',
      isLinkedToMajorGoal: true,
      revenueImpact: Math.floor(Math.random() * 5000) + 2000
    });
  };

  const handleOnboardingComplete = (finalAnswers) => {
    // Process onboarding completion and generate follow-up questions
    const followUpResult = onboardingFollowUpService.processOnboardingCompletion(finalAnswers);
    
    // Store onboarding data with psychological insights and follow-up data
    const completeProfile = {
      ...finalAnswers,
      onboardingCompletedAt: new Date().toISOString(),
      psychologicalProfile: analyzeAnswersForPsychology(finalAnswers),
      onboardingVersion: '2.0_psychologically_optimized',
      followUpData: followUpResult
    };

    // Store in localStorage for persistence
    localStorage.setItem('guild_onboarding_data', JSON.stringify(completeProfile));
    localStorage.setItem('guild_onboarding_completed', 'true');

    // Trigger major completion celebration
    triggerTaskCompletionCelebration({
      name: 'Onboarding completed successfully',
      difficulty: 'hard',
      type: 'onboarding_complete',
      isLinkedToMajorGoal: true,
      revenueImpact: 10000 // Significant milestone
    });

    onComplete(completeProfile);
  };

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          accent: 'sky-dawn',
          text: 'text-sky-dusk'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          accent: 'forest-growth',
          text: 'text-forest-deep'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          accent: 'earth-warm',
          text: 'text-earth-sand'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          accent: 'forest-growth',
          text: 'text-forest-deep'
        };
    }
  };

  const modeStyles = getModeStyles();

  const steps = {
    welcome: (
      <EnhancedWelcomeStep 
        onNext={() => handleStepTransition('business')} 
        modeStyles={modeStyles}
      />
    ),
    business: (
      <EnhancedQuestion
        onNext={(data) => handleStepTransition('audience', data)}
        modeStyles={modeStyles}
        questionType="business"
      />
    ),
    audience: (
      <EnhancedQuestion
        onNext={(data) => handleStepTransition('brand', data)}
        businessType={answers.business_type}
        modeStyles={modeStyles}
        questionType="audience"
      />
    ),
    brand: (
      <BrandQuestions
        onNext={(data) => handleStepTransition('financial', data)}
      />
    ),
    financial: (
      <EnhancedQuestion
        onNext={(data) => handleStepTransition('goals', data)}
        modeStyles={modeStyles}
        questionType="financial"
      />
    ),
    goals: (
      <EnhancedQuestion
        onNext={(data) => handleStepTransition('preferences', data)}
        modeStyles={modeStyles}
        questionType="goals"
      />
    ),
    preferences: (
      <EnhancedQuestion
        onNext={(data) => handleStepTransition('integrations', data)}
        modeStyles={modeStyles}
        questionType="preferences"
      />
    ),
    integrations: (
      <EnhancedConnectorSetup
        onNext={(data) => {
          if (data.selectedSoftware && data.selectedSoftware.length > 0) {
            setShowConnectorSetup(true);
          }
          handleStepTransition('summary', data);
        }}
        onScreenRecord={() => setShowScreenRecording(true)}
        modeStyles={modeStyles}
      />
    ),
    summary: (
      <EnhancedQuestion
        answers={answers}
        onNext={(data) => {
          updateAnswers(data);
          handleStepTransition('capabilities');
        }}
        modeStyles={modeStyles}
        questionType="summary"
      />
    ),
    capabilities: (
      <EnhancedQuestion
        answers={answers}
        onNext={() => handleStepTransition('completion')}
        modeStyles={modeStyles}
        questionType="capabilities"
      />
    ),
    completion: (
      <EnhancedQuestion
        answers={answers}
        onFinish={handleOnboardingComplete}
        modeStyles={modeStyles}
        questionType="completion"
      />
    ),
  };

  // Enhanced progress indicator
  const ProgressIndicator = () => {
    const progressPercentage = (onboardingProgress.completedSteps / onboardingProgress.totalSteps) * 100;
    
    return (
      <motion.div 
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/20`}>
          <div className="flex items-center space-x-3">
            <div className="text-sm font-medium text-gray-700">
              Step {onboardingProgress.completedSteps + 1} of {onboardingProgress.totalSteps}
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <motion.div
                className={`bg-gradient-to-r ${modeStyles.accent} h-2 rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${modeStyles.background} py-12 px-4 relative`}>
      <ProgressIndicator />
      
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
      
      {/* Enhanced Connector Setup Modal */}
      {showConnectorSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Connect Your Tools</h2>
                <button
                  onClick={() => setShowConnectorSetup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <EnhancedConnectorSetup
                userId="onboarding_user"
                onSetupComplete={handleConnectorSetup}
              />
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Screen Recording Modal */}
      {showScreenRecording && (
        <ScreenRecordingStep
          selectedSoftware={answers.selectedSoftware}
          onClose={() => setShowScreenRecording(false)}
          onComplete={(data) => {
            updateAnswers(data);
            setShowScreenRecording(false);
          }}
          modeStyles={modeStyles}
        />
      )}
    </div>
  );
};

export default EnhancedOnboardingContainer;
