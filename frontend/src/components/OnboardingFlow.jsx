import React, { useState } from 'react';
import { ChevronRight, CheckCircle, Building, Users, Target, Zap } from 'lucide-react';

const OnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    businessType: '',
    teamSize: '',
    primaryGoal: '',
    industry: '',
    experience: ''
  });

  const steps = [
    {
      title: 'Welcome to Guild AI',
      subtitle: 'Let\'s get you set up in just a few minutes',
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      component: 'welcome'
    },
    {
      title: 'Tell us about yourself',
      subtitle: 'Help us personalize your experience',
      icon: <Users className="w-8 h-8 text-green-500" />,
      component: 'personal'
    },
    {
      title: 'Your business',
      subtitle: 'Understanding your business helps us serve you better',
      icon: <Building className="w-8 h-8 text-purple-500" />,
      component: 'business'
    },
    {
      title: 'Your goals',
      subtitle: 'What do you want to achieve?',
      icon: <Target className="w-8 h-8 text-orange-500" />,
      component: 'goals'
    },
    {
      title: 'All set!',
      subtitle: 'You\'re ready to start using Guild AI',
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      component: 'complete'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save onboarding data
      localStorage.setItem('guild_onboarding_data', JSON.stringify(formData));
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    const step = steps[currentStep];
    switch (step.component) {
      case 'personal':
        return formData.name.trim() !== '';
      case 'business':
        return formData.businessType && formData.teamSize;
      case 'goals':
        return formData.primaryGoal;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.component) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              {step.icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Guild AI is your intelligent business assistant that helps you automate tasks, 
                manage projects, and grow your business with the power of AI agents.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">AI Agents</h3>
                <p className="text-sm text-gray-600">Specialized AI agents for every task</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Goal Tracking</h3>
                <p className="text-sm text-gray-600">Stay focused on what matters</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Building className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Business Growth</h3>
                <p className="text-sm text-gray-600">Scale your operations efficiently</p>
              </div>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {step.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-600">{step.subtitle}</p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your name?
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {step.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-600">{step.subtitle}</p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your business type</option>
                  <option value="startup">Startup</option>
                  <option value="small-business">Small Business</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="consultant">Consultant</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Size
                </label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select team size</option>
                  <option value="1">Just me</option>
                  <option value="2-5">2-5 people</option>
                  <option value="6-20">6-20 people</option>
                  <option value="21-50">21-50 people</option>
                  <option value="50+">50+ people</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {step.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
              <p className="text-gray-600">{step.subtitle}</p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Goal
                </label>
                <select
                  value={formData.primaryGoal}
                  onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your primary goal</option>
                  <option value="increase-sales">Increase Sales</option>
                  <option value="improve-efficiency">Improve Efficiency</option>
                  <option value="grow-team">Grow Team</option>
                  <option value="expand-market">Expand Market</option>
                  <option value="reduce-costs">Reduce Costs</option>
                  <option value="better-customer-service">Better Customer Service</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              {step.icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Perfect! We've set up your Guild AI workspace. You're now ready to start 
                automating tasks and growing your business with AI.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg max-w-md mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">What's next?</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Explore the chat interface</li>
                <li>• Set up your first AI agent</li>
                <li>• Connect your business tools</li>
                <li>• Start automating tasks</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
