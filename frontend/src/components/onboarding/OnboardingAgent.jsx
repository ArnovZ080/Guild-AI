import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle, User, Building, Target, DollarSign, 
  MessageSquare, Palette, Calendar, Globe, Mail, Database,
  Shield, Zap, Brain, Users, TrendingUp, FileText, Camera,
  Mic, Headphones, Settings, Star, Heart, Lightbulb, BarChart
} from 'lucide-react';
import { useCelebrations, CelebrationType } from '../psychological/MicroCelebrations.jsx';

const OnboardingAgent = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [userData, setUserData] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [selectedSoftware, setSelectedSoftware] = useState([]);
  const [sensitiveDataStorage, setSensitiveDataStorage] = useState('');
  const [generalDataStorage, setGeneralDataStorage] = useState('');
  const [selectedStoragePlatforms, setSelectedStoragePlatforms] = useState([]);
  const [showScreenRecording, setShowScreenRecording] = useState(false);
  const [recordingSoftware, setRecordingSoftware] = useState(null);
  const { triggerCelebration } = useCelebrations();

  // Business discovery questions
  const businessQuestions = [
    {
      id: 'business_description',
      question: "Tell me about your business. What do you do?",
      type: 'textarea',
      placeholder: "Describe your business, what products or services you offer, and what makes you unique...",
      icon: Building
    },
    {
      id: 'team_size',
      question: "How many people are in your business?",
      type: 'select',
      options: [
        'Just me (Solo entrepreneur)',
        '2-5 people',
        '6-10 people',
        '11-25 people',
        '26-50 people',
        '50+ people'
      ],
      icon: Users
    },
    {
      id: 'business_experience',
      question: "How long have you been doing this?",
      type: 'select',
      options: [
        'Just starting out (0-6 months)',
        'Getting established (6 months - 2 years)',
        'Growing business (2-5 years)',
        'Established business (5-10 years)',
        'Mature business (10+ years)'
      ],
      icon: Calendar
    },
    {
      id: 'ideal_client',
      question: "Who is your ideal client for your product or service?",
      type: 'textarea',
      placeholder: "Describe your ideal customer - their demographics, pain points, needs, and how they typically find you...",
      icon: Target
    },
    {
      id: 'client_avatar',
      question: "Do you have a specific client avatar? If not, it's okay, we can build one later.",
      type: 'select',
      options: [
        'Yes, I have a detailed client avatar',
        'I have a basic idea but need help developing it',
        'No, but I know I need one',
        'Not sure what a client avatar is'
      ],
      icon: User
    },
    {
      id: 'products_services',
      question: "What products or services do you sell, or would you like to sell? If you don't have any yet, that's okay, we can help you create some...",
      type: 'textarea',
      placeholder: "List your current offerings, pricing, and any new products/services you're considering...",
      icon: Star
    },
    {
      id: 'pricing_strategy',
      question: "What is your pricing strategy? Just broadly, we can go into details later.",
      type: 'select',
      options: [
        'Premium pricing (high-end market)',
        'Competitive pricing (market rate)',
        'Value pricing (affordable but quality)',
        'Freemium model (free + paid tiers)',
        'Subscription-based',
        'One-time purchases',
        'Not sure yet'
      ],
      icon: DollarSign
    },
    {
      id: 'current_turnover',
      question: "What is your current turnover? I know you don't trust me yet, so you can give me just a ballpark figure for now. If you don't have any yet, that's also okay. We all have to start somewhere and we are here to help you make that happen!",
      type: 'select',
      options: [
        'Pre-revenue (just starting)',
        '$0 - $10,000 per year',
        '$10,000 - $50,000 per year',
        '$50,000 - $100,000 per year',
        '$100,000 - $500,000 per year',
        '$500,000 - $1,000,000 per year',
        '$1,000,000+ per year',
        'Prefer not to say'
      ],
      icon: TrendingUp
    },
    {
      id: 'turnover_goals',
      question: "What are your turnover goals for the next 6 months? And for the next year?",
      type: 'textarea',
      placeholder: "Share your revenue goals for the next 6 months and 1 year. Be specific if you can...",
      icon: Target
    },
    {
      id: 'pain_points',
      question: "What is currently your biggest pain points in your business? What are the things that eat the most of your time and the things you really don't like doing? Please name them all. This is exactly what we are here to help with and take off your hands so that you can focus on what you love doing.",
      type: 'textarea',
      placeholder: "List all the tasks, processes, or activities that take up your time or that you dislike doing...",
      icon: Heart
    },
    {
      id: 'social_media',
      question: "What social media platforms are you on and what does your follower situation look like?",
      type: 'textarea',
      placeholder: "List your social media platforms, follower counts, and how active you are on each...",
      icon: Globe
    },
    {
      id: 'brand_voice',
      question: "Tell me more about your brand. Do you have a specific brand voice? If you're not sure yet, we can work on that for you.",
      type: 'select',
      options: [
        'Yes, I have a clear brand voice and guidelines',
        'I have some ideas but need help defining it',
        'No, but I know I need one',
        'Not sure what brand voice means'
      ],
      icon: MessageSquare
    },
    {
      id: 'brand_colors',
      question: "What are your brand colours, and are there any specific fonts you would like to use? If you're not sure, it's okay, we have a graphic designer on our team.",
      type: 'textarea',
      placeholder: "Describe your brand colors, fonts, and any visual elements. If you're not sure, just say so...",
      icon: Palette
    },
    {
      id: 'business_software',
      question: "What business software and tools are you currently using? This helps us understand your current workflow and integrate with your existing systems.",
      type: 'textarea',
      placeholder: "List all the software, tools, and platforms you use for your business (e.g., QuickBooks, HubSpot, Slack, Shopify, etc.)...",
      icon: Settings
    },
    {
      id: 'five_year_vision',
      question: "Where do you see yourself with this brand in 5 years? Dream big and give us your vision, then we will know how to proceed to make your dream a reality.",
      type: 'textarea',
      placeholder: "Share your 5-year vision for your business. Think big and be specific about what success looks like...",
      icon: Lightbulb
    }
  ];

  // Integration platforms
  const storagePlatforms = [
    { id: 'google_drive', name: 'Google Drive', icon: Database },
    { id: 'onedrive', name: 'OneDrive', icon: Database },
    { id: 'dropbox', name: 'Dropbox', icon: Database },
    { id: 'notion', name: 'Notion', icon: FileText },
    { id: 'slack', name: 'Slack', icon: MessageSquare }
  ];

  const businessSoftware = [
    { id: 'xero', name: 'Xero', icon: DollarSign, category: 'accounting' },
    { id: 'quickbooks', name: 'QuickBooks', icon: DollarSign, category: 'accounting' },
    { id: 'freshbooks', name: 'FreshBooks', icon: DollarSign, category: 'accounting' },
    { id: 'wave', name: 'Wave', icon: DollarSign, category: 'accounting' },
    { id: 'hubspot', name: 'HubSpot', icon: Database, category: 'crm' },
    { id: 'salesforce', name: 'Salesforce', icon: Database, category: 'crm' },
    { id: 'pipedrive', name: 'Pipedrive', icon: Database, category: 'crm' },
    { id: 'zoho_crm', name: 'Zoho CRM', icon: Database, category: 'crm' },
    { id: 'slack', name: 'Slack', icon: MessageSquare, category: 'communication' },
    { id: 'teams', name: 'Microsoft Teams', icon: MessageSquare, category: 'communication' },
    { id: 'discord', name: 'Discord', icon: MessageSquare, category: 'communication' },
    { id: 'trello', name: 'Trello', icon: Calendar, category: 'project_management' },
    { id: 'asana', name: 'Asana', icon: Calendar, category: 'project_management' },
    { id: 'monday', name: 'Monday.com', icon: Calendar, category: 'project_management' },
    { id: 'clickup', name: 'ClickUp', icon: Calendar, category: 'project_management' },
    { id: 'shopify', name: 'Shopify', icon: Globe, category: 'ecommerce' },
    { id: 'woocommerce', name: 'WooCommerce', icon: Globe, category: 'ecommerce' },
    { id: 'magento', name: 'Magento', icon: Globe, category: 'ecommerce' },
    { id: 'stripe', name: 'Stripe', icon: DollarSign, category: 'payments' },
    { id: 'paypal', name: 'PayPal', icon: DollarSign, category: 'payments' },
    { id: 'square', name: 'Square', icon: DollarSign, category: 'payments' },
    { id: 'mailchimp', name: 'Mailchimp', icon: Mail, category: 'email_marketing' },
    { id: 'constant_contact', name: 'Constant Contact', icon: Mail, category: 'email_marketing' },
    { id: 'convertkit', name: 'ConvertKit', icon: Mail, category: 'email_marketing' },
    { id: 'activecampaign', name: 'ActiveCampaign', icon: Mail, category: 'email_marketing' },
    { id: 'zendesk', name: 'Zendesk', icon: Headphones, category: 'support' },
    { id: 'intercom', name: 'Intercom', icon: Headphones, category: 'support' },
    { id: 'freshdesk', name: 'Freshdesk', icon: Headphones, category: 'support' },
    { id: 'google_analytics', name: 'Google Analytics', icon: BarChart, category: 'analytics' },
    { id: 'mixpanel', name: 'Mixpanel', icon: BarChart, category: 'analytics' },
    { id: 'hotjar', name: 'Hotjar', icon: BarChart, category: 'analytics' },
    { id: 'other', name: 'Other Software', icon: Settings, category: 'other' }
  ];

  const socialPlatforms = [
    { id: 'facebook', name: 'Facebook', icon: Globe },
    { id: 'instagram', name: 'Instagram', icon: Camera },
    { id: 'twitter', name: 'Twitter', icon: MessageSquare },
    { id: 'linkedin', name: 'LinkedIn', icon: Users },
    { id: 'tiktok', name: 'TikTok', icon: Camera },
    { id: 'youtube', name: 'YouTube', icon: Camera },
    { id: 'pinterest', name: 'Pinterest', icon: Heart }
  ];

  const emailPlatforms = [
    { id: 'gmail', name: 'Gmail', icon: Mail },
    { id: 'outlook', name: 'Outlook', icon: Mail },
    { id: 'hubspot', name: 'HubSpot', icon: Database },
    { id: 'sendgrid', name: 'SendGrid', icon: Mail },
    { id: 'mailchimp', name: 'Mailchimp', icon: Mail },
    { id: 'salesforce', name: 'Salesforce', icon: Database },
    { id: 'zendesk', name: 'Zendesk', icon: Headphones },
    { id: 'pipedrive', name: 'Pipedrive', icon: Database },
    { id: 'monday', name: 'Monday.com', icon: Calendar }
  ];

  // Handle answer submission
  const handleAnswer = (answer) => {
    const questionId = businessQuestions[currentQuestion].id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Reset current answer for next question
    setCurrentAnswer('');

    if (currentQuestion < businessQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep('setup');
    }
  };

  const handleContinue = () => {
    if (currentAnswer.trim()) {
      handleAnswer(currentAnswer);
    }
  };

  // Handle setup completion
  const handleSetupComplete = () => {
    // Store integration data
    const integrationData = {
      sensitiveDataStorage,
      generalDataStorage,
      selectedSoftware,
      selectedStoragePlatforms,
      storagePlatforms: selectedStoragePlatforms, // Add selected storage platforms
      socialPlatforms: [], // Add selected social platforms
      emailPlatforms: [], // Add selected email platforms
      screenRecordingEnabled: selectedSoftware.length > 0
    };
    
    setShowCapabilities(true);
    triggerCelebration(CelebrationType.TASK_COMPLETE, {
      message: "Welcome to Guild! 🎉",
      intensity: 'high'
    });
  };

  // Render welcome screen
  const renderWelcome = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center space-y-8"
    >
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Hello {userData.firstName || 'there'}!
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Welcome to Guild! Your AI Company of 1. To get the most out of us, I am going to ask you some questions to get to know you, your business, and your goals a bit better. Once we have that all down, I can walk you through the setup procedures and show you some of the epic things we can do for you.
        </p>
        <p className="text-lg font-semibold text-blue-600">
          Sounds Good?
        </p>
      </div>
      
      <motion.button
        onClick={() => setCurrentStep('questions')}
        className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors flex items-center space-x-2 mx-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>Start</span>
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );

  // Render questions
  const renderQuestions = () => {
    const question = businessQuestions[currentQuestion];
    const Icon = question.icon;

    return (
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {businessQuestions.length}
            </div>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / businessQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {question.question}
          </h2>

          {question.type === 'select' ? (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={question.placeholder}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={6}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleContinue();
                  }
                }}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleContinue}
                  disabled={!currentAnswer.trim()}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Render setup screen
  const renderSetup = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Setup & Integration
        </h1>
        <p className="text-lg text-gray-600">
          Let's get you hooked up and ready to go!
        </p>
      </div>

      {/* Sensitive Data Storage Preference */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Sensitive Data Storage Preference
        </h2>
        <p className="text-gray-600 mb-6">
          For sensitive information like financials, product specs, assets, and confidential business data, we want to respect your privacy preferences. Would you prefer to store this sensitive data locally on your computer, or are you comfortable with our secure cloud storage? You can always change this option later.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            onClick={() => setSensitiveDataStorage('local')}
            className={`p-6 border-2 rounded-lg transition-colors text-left ${
              sensitiveDataStorage === 'local' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <Database className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Local Storage</h3>
            </div>
            <p className="text-sm text-gray-600">Store sensitive data locally on your computer</p>
          </motion.button>
          
          <motion.button
            onClick={() => setSensitiveDataStorage('cloud')}
            className={`p-6 border-2 rounded-lg transition-colors text-left ${
              sensitiveDataStorage === 'cloud' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Secure Cloud</h3>
            </div>
            <p className="text-sm text-gray-600">Store sensitive data in secure cloud database</p>
          </motion.button>
        </div>
      </div>

      {/* General Data Storage Preference */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          General Data Storage Preference
        </h2>
        <p className="text-gray-600 mb-6">
          For general business information and non-sensitive data, we can either create a folder for ourselves on your desktop, or we can store it in our secure cloud database to save you some space. Which would you prefer? You can always change it later.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            onClick={() => setGeneralDataStorage('local')}
            className={`p-6 border-2 rounded-lg transition-colors text-left ${
              generalDataStorage === 'local' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <Database className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">On-site</h3>
            </div>
            <p className="text-sm text-gray-600">Store data locally on your computer</p>
          </motion.button>
          
          <motion.button
            onClick={() => setGeneralDataStorage('cloud')}
            className={`p-6 border-2 rounded-lg transition-colors text-left ${
              generalDataStorage === 'cloud' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">Off-site</h3>
            </div>
            <p className="text-sm text-gray-600">Store data in secure cloud database</p>
          </motion.button>
        </div>
      </div>

      {/* Business Software Integration */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Connect Your Business Software
        </h2>
        <p className="text-gray-600 mb-6">
          Based on your business software list, we can integrate with the tools you're already using. This allows us to automate workflows and sync data seamlessly. Select the software you'd like us to connect to:
        </p>
        
        <div className="space-y-6">
          {['accounting', 'crm', 'communication', 'project_management', 'ecommerce', 'payments', 'email_marketing', 'support', 'analytics', 'other'].map(category => {
            const categorySoftware = businessSoftware.filter(software => software.category === category);
            if (categorySoftware.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                  {category.replace('_', ' ')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categorySoftware.map((software) => {
                    const Icon = software.icon;
                    const isSelected = selectedSoftware.includes(software.id);
                    return (
                      <motion.button
                        key={software.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSoftware(prev => prev.filter(id => id !== software.id));
                          } else {
                            setSelectedSoftware(prev => [...prev, software.id]);
                          }
                        }}
                        className={`p-3 border-2 rounded-lg transition-colors text-center ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                        <div className="text-xs font-medium text-gray-900">{software.name}</div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {selectedSoftware.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Selected Software ({selectedSoftware.length})</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSoftware.map(softwareId => {
                const software = businessSoftware.find(s => s.id === softwareId);
                return (
                  <span key={softwareId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {software?.name}
                  </span>
                );
              })}
            </div>
            <button
              onClick={() => setShowScreenRecording(true)}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Need to record screen actions for any of these? →
            </button>
          </div>
        )}
      </div>

      {/* Storage Services Integration */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Connect Your Storage Services
        </h2>
        <p className="text-gray-600 mb-6">
          We also connect to whatever storage services you currently use for your business so that we have access to your documents. If you're not comfortable with that yet, then that's okay. We will build our trust relationship first. If you are though, it will enable us to get a much clearer picture of your business and it will enable us to help you take a lot more stuff off your hands.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {storagePlatforms.map((platform) => {
            const Icon = platform.icon;
            const isSelected = selectedStoragePlatforms.includes(platform.id);
            return (
              <motion.button
                key={platform.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedStoragePlatforms(prev => prev.filter(id => id !== platform.id));
                  } else {
                    setSelectedStoragePlatforms(prev => [...prev, platform.id]);
                  }
                }}
                className={`p-4 border-2 rounded-lg transition-colors text-center ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">{platform.name}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Social Media Management */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Social Media Management
        </h2>
        <p className="text-gray-600 mb-6">
          We are happy to take this off your hands as well. We do a full-stack service where we research the most current topics which is the best fit for your audience, then we compose the posts in a format that works best for whichever platform, we create the visuals, hashtags, and anything else that is needed - even reels and stories! Social media is where we really shine! Would you like us to take this off your hands? If so, which of your platforms would you like for us to manage?
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <motion.button
                key={platform.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">{platform.name}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Email Platform Integration */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Email & CRM Integration
        </h2>
        <p className="text-gray-600 mb-6">
          The other area where we shine is cold outreach and emails. We know this is the hard, boring, and time-consuming part of any business, so let us take it off your hands as well. What email address or platform do you use to send your business emails from? Would you care to show us, then we can record and follow the clicks you use on your computer, then access your email directly to compose and send outreach emails for you, answer the emails that need answering.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {emailPlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <motion.button
                key={platform.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">{platform.name}</div>
              </motion.button>
            );
          })}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Camera className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Screen Recording & Learning</h3>
          </div>
          <p className="text-sm text-yellow-700">
            If you use a platform that we don't have direct API access to, we can record your screen actions and learn how to automate those tasks for you in the future. This is completely secure and only records the specific actions you show us.
          </p>
        </div>
      </div>

      {/* Setup Summary */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Setup Summary</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Sensitive Data Storage:</span>
            <span className="font-medium text-gray-900">
              {sensitiveDataStorage ? (sensitiveDataStorage === 'local' ? 'Local Storage' : 'Secure Cloud') : 'Not selected'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">General Data Storage:</span>
            <span className="font-medium text-gray-900">
              {generalDataStorage ? (generalDataStorage === 'local' ? 'On-site' : 'Off-site') : 'Not selected'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Business Software:</span>
            <span className="font-medium text-gray-900">
              {selectedSoftware.length} selected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Storage Platforms:</span>
            <span className="font-medium text-gray-900">
              {selectedStoragePlatforms.length} selected
            </span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <motion.button
          onClick={handleSetupComplete}
          className="bg-green-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2 mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <CheckCircle className="w-5 h-5" />
          <span>Complete Setup</span>
        </motion.button>
      </div>
    </motion.div>
  );

  // Render capabilities overview
  const renderCapabilities = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Your Guild Capabilities
        </h1>
        <p className="text-lg text-gray-600">
          Here's what your AI workforce can do for you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Globe, title: 'Social Media Management', desc: 'Full-stack social media strategy, content creation, and posting' },
          { icon: FileText, title: 'Content Creation', desc: 'Blog posts, articles, marketing copy, and lead magnets' },
          { icon: Calendar, title: 'Content Scheduling', desc: 'Automated content calendar and cross-platform posting' },
          { icon: Zap, title: 'App Development', desc: 'Custom applications and tools for your business' },
          { icon: Palette, title: 'Design Work', desc: 'Graphics, logos, branding, and visual content' },
          { icon: Mic, title: 'Voice Calls', desc: 'Customer service calls and cold calling automation' },
          { icon: Mail, title: 'Email Management', desc: 'Inbound, outbound, and campaign management' },
          { icon: Target, title: 'Marketing & Advertising', desc: 'Full-stack marketing campaigns and ad management' },
          { icon: Camera, title: 'Computer Vision', desc: 'Screen recording and task automation learning' },
          { icon: DollarSign, title: 'Bookkeeping', desc: 'Financial management and accounting automation' },
          { icon: Brain, title: 'Lead Magnets', desc: 'Asset creation for lead generation and nurturing' },
          { icon: Users, title: 'Customer Service', desc: 'Automated support and customer relationship management' }
        ].map((capability, index) => {
          const Icon = capability.icon;
          return (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{capability.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{capability.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Dashboard Features</h2>
        <p className="text-lg mb-6">
          Your main dashboard includes customizable features, psychological triggers, agent theater, and real-time monitoring of all your AI workforce activities.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div>
            <h3 className="font-semibold mb-2">Core Features:</h3>
            <ul className="space-y-1 text-sm">
              <li>• Real-time agent activity monitoring</li>
              <li>• Customizable dashboard widgets</li>
              <li>• Psychological optimization triggers</li>
              <li>• Goal tracking and progress visualization</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Advanced Features:</h3>
            <ul className="space-y-1 text-sm">
              <li>• Agent theater for live interactions</li>
              <li>• Voice and memory integration</li>
              <li>• Document processing and analysis</li>
              <li>• Financial analytics and reporting</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Congratulations! 🎉
          </h2>
          <p className="text-lg text-green-700">
            You are now fully hooked up to your Guild of expert workers that will take care of all the heavy lifting for you so that you can focus on the things that you love!
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            What would you like to work on first?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              'Brand voice development',
              'Business goals strategy',
              'Brand colors & design',
              'Social media strategy',
              'Email marketing setup',
              'Content creation plan'
            ].map((option, index) => (
              <motion.button
                key={index}
                onClick={() => onComplete({ ...answers, firstTask: option })}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {option}
              </motion.button>
            ))}
          </div>
          
          <div className="mt-4">
            <textarea
              placeholder="Or tell us what you'd like to work on..."
              className="w-full max-w-2xl p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  onComplete({ ...answers, firstTask: e.target.value });
                }
              }}
            />
            <div className="mt-2">
              <button
                onClick={(e) => {
                  const textarea = e.target.previousElementSibling;
                  onComplete({ ...answers, firstTask: textarea.value });
                }}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Let's Get Started!
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <AnimatePresence mode="wait">
        {currentStep === 'welcome' && renderWelcome()}
        {currentStep === 'questions' && renderQuestions()}
        {currentStep === 'setup' && renderSetup()}
        {showCapabilities && renderCapabilities()}
      </AnimatePresence>

      {/* Screen Recording Modal */}
      {showScreenRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Screen Recording Setup</h2>
                  <p className="text-gray-600 mt-1">Record your workflow for software without API access</p>
                </div>
                <button
                  onClick={() => setShowScreenRecording(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Camera className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">How Screen Recording Works</h3>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• We'll record your screen actions while you use the software</li>
                    <li>• Only records the specific actions you show us</li>
                    <li>• Completely secure and private - data stays on your device</li>
                    <li>• We learn the workflow to automate it in the future</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Software to Record
                  </label>
                  <select
                    value={recordingSoftware || ''}
                    onChange={(e) => setRecordingSoftware(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose software...</option>
                    {selectedSoftware.map(softwareId => {
                      const software = businessSoftware.find(s => s.id === softwareId);
                      return (
                        <option key={softwareId} value={softwareId}>
                          {software?.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {recordingSoftware && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Recording Instructions</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Click "Start Recording" below</li>
                      <li>Open the software and perform your typical workflow</li>
                      <li>Show us how you access, navigate, and use the software</li>
                      <li>Click "Stop Recording" when finished</li>
                      <li>We'll analyze and learn the workflow automatically</li>
                    </ol>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowScreenRecording(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsRecording(true);
                      // Simulate recording process
                      setTimeout(() => {
                        setIsRecording(false);
                        setShowScreenRecording(false);
                        triggerCelebration(CelebrationType.TASK_COMPLETE, {
                          message: "Workflow recorded! 🎥",
                          intensity: 'normal'
                        });
                      }, 3000);
                    }}
                    disabled={!recordingSoftware}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isRecording ? (
                      <>
                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>Start Recording</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingAgent;
