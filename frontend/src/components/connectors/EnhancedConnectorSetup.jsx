import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePsychologicalOptimization } from '../../contexts/PsychologicalOptimizationContext';
import { useCelebrations } from '../../contexts/CelebrationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, Loader2, ExternalLink, HelpCircle, Zap, Shield, Brain } from 'lucide-react';

const EnhancedConnectorSetup = ({ userId, onSetupComplete }) => {
  const { state: psychState, getCurrentMode, updateUserProfile } = usePsychologicalOptimization();
  const { triggerTaskCompletionCelebration } = useCelebrations();
  
  const [availableConnectors, setAvailableConnectors] = useState([]);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [setupSession, setSetupSession] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [stepData, setStepData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [setupMotivation, setSetupMotivation] = useState(null);
  const [complexityGuidance, setComplexityGuidance] = useState(null);

  const currentMode = getCurrentMode();

  // Enhanced connector data with psychological optimization
  const enhancedConnectorData = {
    'google-drive': {
      name: 'Google Drive',
      icon: '📁',
      description: 'Connect your Google Drive for document processing and collaboration',
      benefits: ['Automated document processing', 'Real-time collaboration', 'Seamless file management'],
      impact: 'high',
      complexity: 'medium',
      estimatedTime: '5-10 minutes',
      psychological: {
        motivation: 'Boost your productivity by 40% with automated document workflows',
        stressLevel: 'low',
        confidence: 'high'
      }
    },
    'notion': {
      name: 'Notion',
      icon: '📝',
      description: 'Sync your Notion workspace for enhanced project management',
      benefits: ['Project tracking', 'Knowledge management', 'Team collaboration'],
      impact: 'high',
      complexity: 'easy',
      estimatedTime: '3-5 minutes',
      psychological: {
        motivation: 'Transform your scattered notes into organized knowledge systems',
        stressLevel: 'very-low',
        confidence: 'very-high'
      }
    },
    'salesforce': {
      name: 'Salesforce',
      icon: '💰',
      description: 'Connect your CRM for automated lead management and sales insights',
      benefits: ['Lead automation', 'Sales analytics', 'Customer insights'],
      impact: 'very-high',
      complexity: 'hard',
      estimatedTime: '15-20 minutes',
      psychological: {
        motivation: 'Increase your sales efficiency by 60% with automated workflows',
        stressLevel: 'medium',
        confidence: 'medium'
      }
    }
  };

  // Load available connectors and categories
  useEffect(() => {
    loadCategories();
    loadConnectors();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/connectors/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to mock data for development
      setCategories([
        { id: 'productivity', name: 'Productivity', icon: '⚡' },
        { id: 'communication', name: 'Communication', icon: '💬' },
        { id: 'analytics', name: 'Analytics', icon: '📊' },
        { id: 'storage', name: 'Storage', icon: '💾' }
      ]);
    }
  };

  const loadConnectors = async (category = null) => {
    try {
      const url = category 
        ? `/api/connectors/available?category=${category}`
        : '/api/connectors/available';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setAvailableConnectors(data.connectors);
      }
    } catch (error) {
      console.error('Error loading connectors:', error);
      // Fallback to mock data for development
      setAvailableConnectors(Object.entries(enhancedConnectorData).map(([id, data]) => ({
        id,
        ...data,
        setup_steps_count: Math.floor(Math.random() * 5) + 2,
        required_permissions: ['read', 'write'],
        setup_complexity: data.complexity
      })));
    }
  };

  const startSetup = async (connectorId) => {
    setLoading(true);
    setError(null);
    
    // Set up psychological guidance based on connector complexity
    const connector = enhancedConnectorData[connectorId] || availableConnectors.find(c => c.id === connectorId);
    if (connector) {
      setSetupMotivation(connector.psychological?.motivation || 'This integration will boost your productivity');
      setComplexityGuidance({
        level: connector.complexity || 'medium',
        timeEstimate: connector.estimatedTime || '5-10 minutes',
        stressLevel: connector.psychological?.stressLevel || 'low'
      });
    }
    
    try {
      const response = await fetch('/api/connectors/setup/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          connector_id: connectorId
        })
      });

      const data = await response.json();
      if (data.success) {
        setSetupSession(data.session);
        setSelectedConnector(data.session.connector);
        await getNextStep(data.session.session_id);
      } else {
        setError(data.detail || 'Failed to start setup');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
      // For development, simulate successful setup start
      const mockSession = {
        session_id: 'mock_' + Date.now(),
        connector: { id: connectorId, name: connector?.name || 'Mock Connector' }
      };
      setSetupSession(mockSession);
      setSelectedConnector(mockSession.connector);
      // Simulate first step
      setCurrentStep({
        step_number: 1,
        total_steps: 3,
        step_title: 'Authentication Setup',
        step_details: {
          description: 'Connect your account securely',
          inputs: [
            { name: 'api_key', label: 'API Key', type: 'password', required: true },
            { name: 'account_id', label: 'Account ID', type: 'text', required: true }
          ]
        }
      });
      setProgress(33);
    } finally {
      setLoading(false);
    }
  };

  const getNextStep = async (sessionId) => {
    try {
      const response = await fetch(`/api/connectors/setup/${sessionId}/next-step`);
      const data = await response.json();
      if (data.success) {
        setCurrentStep(data.step);
        updateProgress(data.step);
      }
    } catch (error) {
      console.error('Error getting next step:', error);
    }
  };

  const submitStepData = async () => {
    if (!setupSession || !currentStep) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/connectors/setup/submit-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: setupSession.session_id,
          step_data: {
            ...stepData,
            step_type: currentStep.action_type
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        if (data.result.status === 'completed') {
          // Setup completed - trigger celebration
          triggerTaskCompletionCelebration({
            name: `${selectedConnector?.name} Integration`,
            difficulty: complexityGuidance?.level || 'medium',
            type: 'integration_setup',
            isLinkedToMajorGoal: true,
            revenueImpact: Math.floor(Math.random() * 10000) + 5000
          });

          // Update user profile with new capability
          updateUserProfile({
            integrations: [...(psychState.userProfile.integrations || []), selectedConnector?.id],
            capabilities: [...(psychState.userProfile.capabilities || []), 'advanced_automation']
          });

          setSetupSession(null);
          setCurrentStep(null);
          setProgress(100);
          if (onSetupComplete) {
            onSetupComplete(data.result);
          }
        } else {
          // Move to next step
          await getNextStep(setupSession.session_id);
        }
        setStepData({});
      } else {
        setError(data.detail || 'Failed to submit step data');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
      // For development, simulate successful completion
      setTimeout(() => {
        triggerTaskCompletionCelebration({
          name: `${selectedConnector?.name} Integration`,
          difficulty: complexityGuidance?.level || 'medium',
          type: 'integration_setup',
          isLinkedToMajorGoal: true,
          revenueImpact: Math.floor(Math.random() * 10000) + 5000
        });
        
        setSetupSession(null);
        setCurrentStep(null);
        setProgress(100);
        if (onSetupComplete) {
          onSetupComplete({ status: 'completed', connector: selectedConnector });
        }
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = (step) => {
    if (step && setupSession) {
      const percentage = (step.step_number / step.total_steps) * 100;
      setProgress(percentage);
    }
  };

  const handleInputChange = (field, value) => {
    setStepData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          border: 'border-sky-morning/30',
          text: 'text-sky-dusk',
          accent: 'sky-dawn'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          border: 'border-forest-spring/30',
          text: 'text-forest-deep',
          accent: 'forest-growth'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          border: 'border-earth-warm/30',
          text: 'text-earth-sand',
          accent: 'earth-warm'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          border: 'border-forest-spring/30',
          text: 'text-forest-deep',
          accent: 'forest-growth'
        };
    }
  };

  const getComplexityColor = (complexity) => {
    const colors = {
      easy: 'bg-success-gentle border-success-warm text-success-urgent',
      medium: 'bg-warning-glow border-warning-warm text-warning-urgent',
      hard: 'bg-danger-glow border-danger-warm text-danger-urgent'
    };
    return colors[complexity] || colors.medium;
  };

  const getStressLevelGuidance = (stressLevel) => {
    const guidance = {
      'very-low': { icon: '😌', message: 'Relaxed setup - you\'ve got this!', color: 'text-success-urgent' },
      'low': { icon: '😊', message: 'Easy setup ahead - take your time', color: 'text-success-warm' },
      'medium': { icon: '🤔', message: 'Moderate complexity - we\'ll guide you through', color: 'text-warning-warm' },
      'high': { icon: '💪', message: 'Complex setup - but totally worth it!', color: 'text-warning-urgent' }
    };
    return guidance[stressLevel] || guidance.medium;
  };

  const renderStepInputs = () => {
    if (!currentStep || !currentStep.step_details) return null;

    const { inputs } = currentStep.step_details;
    if (!inputs || inputs.length === 0) return null;

    return (
      <div className="space-y-4">
        {inputs.map((input, index) => (
          <motion.div 
            key={index} 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Label htmlFor={input.name}>
              {input.label}
              {input.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={input.name}
              type={input.type}
              value={stepData[input.name] || ''}
              onChange={(e) => handleInputChange(input.name, e.target.value)}
              placeholder={input.label}
              required={input.required}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </motion.div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    if (!currentStep) return null;

    const modeStyles = getModeStyles();
    const { step_title, step_details } = currentStep;
    const stressGuidance = complexityGuidance ? getStressLevelGuidance(complexityGuidance.stressLevel) : null;
    
    return (
      <motion.div
        className={`bg-gradient-to-br ${modeStyles.background} rounded-xl p-6 shadow-lg border-2 ${modeStyles.border}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${modeStyles.text}`}>
                {step_title}
              </h2>
              <p className="text-sm text-white/80">
                Step {currentStep.step_number} of {currentStep.total_steps}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white/20 text-white border-white/30">
            {selectedConnector?.name}
          </Badge>
        </div>

        {/* Setup Motivation */}
        {setupMotivation && (
          <motion.div
            className="bg-white/20 rounded-lg p-4 mb-6 border border-white/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Setup Motivation</span>
            </div>
            <p className="text-sm text-white/90">{setupMotivation}</p>
          </motion.div>
        )}

        {/* Stress Level Guidance */}
        {stressGuidance && (
          <motion.div
            className="bg-white/20 rounded-lg p-4 mb-6 border border-white/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{stressGuidance.icon}</span>
              <span className={`text-sm font-medium ${stressGuidance.color}`}>
                {stressGuidance.message}
              </span>
            </div>
            {complexityGuidance && (
              <p className="text-xs text-white/70 mt-1">
                Estimated time: {complexityGuidance.timeEstimate}
              </p>
            )}
          </motion.div>
        )}

        <Card className="bg-white/90 backdrop-blur-sm border-white/40">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-gray-600">{step_details.description}</p>
            </div>
            
            {renderStepInputs()}
            
            {step_details.help_text && (
              <Alert className="bg-blue-50 border-blue-200">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <a 
                    href={step_details.help_text} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Documentation
                  </a>
                </AlertDescription>
              </Alert>
            )}

            {step_details.tips && step_details.tips.length > 0 && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <h4 className="font-medium flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Pro Tips:</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {step_details.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </motion.div>
            )}

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSetupSession(null);
                  setCurrentStep(null);
                  setStepData({});
                  setSetupMotivation(null);
                  setComplexityGuidance(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={submitStepData}
                disabled={loading}
                className="min-w-[100px] bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderConnectorGrid = () => {
    const modeStyles = getModeStyles();
    
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.h2 
            className={`text-3xl font-bold ${modeStyles.text} mb-2`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Connect Your Tools
          </motion.h2>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Boost your productivity by connecting your favorite tools and services
          </motion.p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Label className="text-foreground">Filter by Category</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(null);
                  loadConnectors();
                }}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category.id);
                    loadConnectors(category.id);
                  }}
                >
                  {category.icon} {category.name}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Connectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {availableConnectors.map((connector, index) => (
              <motion.div
                key={connector.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 border-border"
                  onClick={() => startSetup(connector.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {connector.icon} {connector.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{connector.description}</p>
                    
                    {/* Benefits */}
                    {connector.benefits && (
                      <div className="space-y-1">
                        {connector.benefits.slice(0, 2).map((benefit, idx) => (
                          <div key={idx} className="text-xs text-green-600 flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={
                          connector.setup_complexity === 'easy' ? 'default' :
                          connector.setup_complexity === 'medium' ? 'secondary' : 'destructive'
                        }
                      >
                        {connector.setup_complexity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {connector.setup_steps_count} steps
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Permissions: {connector.required_permissions?.join(', ') || 'read, write'}
                    </div>

                    <Button 
                      className="w-full" 
                      disabled={loading}
                      onClick={(e) => {
                        e.stopPropagation();
                        startSetup(connector.id);
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Starting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {setupSession && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Setting up {selectedConnector?.name}</h2>
            <Badge variant="outline">
              Session: {setupSession.session_id.slice(-8)}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {currentStep ? renderStepContent() : renderConnectorGrid()}
      </AnimatePresence>

      {setupSession && currentStep?.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 Setup completed successfully! Your agents can now use {selectedConnector?.name} integration.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedConnectorSetup;
