import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { connectorSetupAPI, wsManager } from '../services/api';
import { usePsychologicalOptimization } from '../contexts/PsychologicalOptimizationContext';
import { useCelebrations } from '../contexts/CelebrationContext';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Settings,
  Zap,
  Database,
  Cloud,
  Mail,
  Calendar
} from 'lucide-react';

const ConnectorSetup = () => {
  const { getCurrentMode } = usePsychologicalOptimization();
  const { triggerCelebration } = useCelebrations();
  const [currentStep, setCurrentStep] = useState('selection');
  const [availableConnectors, setAvailableConnectors] = useState([]);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [setupSession, setSetupSession] = useState(null);
  const [currentStepData, setCurrentStepData] = useState(null);
  const [stepData, setStepData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const currentMode = getCurrentMode();

  const getModeStyles = () => {
    switch (currentMode) {
      case 'morning':
        return {
          background: 'from-sky-dawn to-forest-mist',
          text: 'text-sky-dusk',
          accent: 'sky-dawn',
          card: 'bg-white/90'
        };
      case 'active':
        return {
          background: 'from-sky-day to-forest-growth',
          text: 'text-forest-deep',
          accent: 'forest-growth',
          card: 'bg-white/95'
        };
      case 'evening':
        return {
          background: 'from-sky-dusk to-earth-bark',
          text: 'text-earth-sand',
          accent: 'earth-warm',
          card: 'bg-white/85'
        };
      default:
        return {
          background: 'from-sky-day to-forest-growth',
          text: 'text-forest-deep',
          accent: 'forest-growth',
          card: 'bg-white/95'
        };
    }
  };

  const modeStyles = getModeStyles();

  const getConnectorIcon = (type) => {
    const icons = {
      email: <Mail className="w-6 h-6" />,
      calendar: <Calendar className="w-6 h-6" />,
      database: <Database className="w-6 h-6" />,
      cloud: <Cloud className="w-6 h-6" />,
      default: <Settings className="w-6 h-6" />
    };
    return icons[type] || icons.default;
  };

  const getConnectorColor = (type) => {
    const colors = {
      email: 'bg-blue-500',
      calendar: 'bg-green-500',
      database: 'bg-purple-500',
      cloud: 'bg-orange-500',
      default: 'bg-gray-500'
    };
    return colors[type] || colors.default;
  };

  // Load available connectors
  useEffect(() => {
    const loadConnectors = async () => {
      try {
        setLoading(true);
        const connectors = await connectorSetupAPI.getAvailableConnectors();
        setAvailableConnectors(connectors.connectors || []);
      } catch (error) {
        setError('Failed to load connectors. Please try again.');
        console.error('Error loading connectors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConnectors();
  }, []);

  // Handle connector selection
  const handleConnectorSelect = async (connector) => {
    try {
      setLoading(true);
      setSelectedConnector(connector);
      
      // Start setup session
      const session = await connectorSetupAPI.startSetup(connector.id, 'current_user');
      setSetupSession(session);
      
      // Get first step
      const stepData = await connectorSetupAPI.getNextStep(session.session_id);
      setCurrentStepData(stepData);
      setCurrentStep('configuration');
      setProgress(20);
      
    } catch (error) {
      setError('Failed to start connector setup. Please try again.');
      console.error('Error starting setup:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle step data submission
  const handleStepSubmit = async () => {
    try {
      setLoading(true);
      
      // Submit current step data
      const result = await connectorSetupAPI.submitStepData(
        setupSession.session_id, 
        stepData
      );
      
      if (result.status === 'completed') {
        // Setup completed
        setCurrentStep('completed');
        setProgress(100);
        setIsConnected(true);
        triggerCelebration('moderate', null, 'Connector setup completed successfully!');
      } else {
        // Get next step
        const nextStep = await connectorSetupAPI.getNextStep(setupSession.session_id);
        setCurrentStepData(nextStep);
        setProgress(prev => Math.min(prev + 20, 80));
      }
      
    } catch (error) {
      setError('Failed to submit step data. Please try again.');
      console.error('Error submitting step:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle setup completion
  const handleComplete = async () => {
    try {
      setLoading(true);
      await connectorSetupAPI.completeSetup(setupSession.session_id);
      setCurrentStep('success');
      triggerCelebration('elaborate', null, 'Connector successfully integrated!');
    } catch (error) {
      setError('Failed to complete setup. Please try again.');
      console.error('Error completing setup:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle setup cancellation
  const handleCancel = async () => {
    try {
      if (setupSession) {
        await connectorSetupAPI.cancelSetup(setupSession.session_id);
      }
      setCurrentStep('selection');
      setSelectedConnector(null);
      setSetupSession(null);
      setCurrentStepData(null);
      setStepData({});
      setProgress(0);
      setError(null);
    } catch (error) {
      console.error('Error canceling setup:', error);
    }
  };

  // Render connector selection
  const renderConnectorSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-2xl font-bold ${modeStyles.text} mb-2`}>
          Choose Your Integration
        </h2>
        <p className="text-gray-600">
          Select a service to connect with your Guild-AI workspace
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading connectors...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableConnectors.map((connector) => (
            <motion.div
              key={connector.id}
              className={`${modeStyles.card} rounded-lg p-6 shadow-lg border-2 border-transparent hover:border-blue-200 cursor-pointer transition-all`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleConnectorSelect(connector)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-lg ${getConnectorColor(connector.type)} flex items-center justify-center text-white`}>
                  {getConnectorIcon(connector.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{connector.name}</h3>
                  <p className="text-sm text-gray-600">{connector.category}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{connector.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {connector.steps?.length || 0} steps
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // Render configuration steps
  const renderConfiguration = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${modeStyles.text} mb-2`}>
            Configure {selectedConnector?.name}
          </h2>
          <p className="text-gray-600">
            Step {currentStepData?.step_number || 1} of {currentStepData?.total_steps || 1}
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Step Content */}
      {currentStepData && (
        <div className={`${modeStyles.card} rounded-lg p-6 shadow-lg`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 mb-6">{currentStepData.description}</p>

          {/* Dynamic form fields based on step data */}
          <div className="space-y-4">
            {currentStepData.fields?.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'text' || field.type === 'email' || field.type === 'password' ? (
                  <input
                    type={field.type}
                    value={stepData[field.name] || ''}
                    onChange={(e) => setStepData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={field.required}
                  />
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={stepData[field.name] || ''}
                    onChange={(e) => setStepData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={field.required}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={stepData[field.name] || ''}
                    onChange={(e) => setStepData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : null}
                {field.help && (
                  <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleCancel}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Back
        </button>
        <button
          onClick={handleStepSubmit}
          disabled={loading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <ArrowRight className="w-4 h-4 mr-2" />
          )}
          Continue
        </button>
      </div>
    </div>
  );

  // Render completion screen
  const renderCompleted = () => (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      </motion.div>
      
      <div>
        <h2 className={`text-2xl font-bold ${modeStyles.text} mb-2`}>
          Setup Complete!
        </h2>
        <p className="text-gray-600">
          {selectedConnector?.name} has been successfully connected to your workspace.
        </p>
      </div>

      <div className={`${modeStyles.card} rounded-lg p-6 shadow-lg max-w-md mx-auto`}>
        <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
        <ul className="text-sm text-gray-600 space-y-2 text-left">
          <li>• Your data will sync automatically</li>
          <li>• AI agents can now access this integration</li>
          <li>• You can manage settings in your workspace</li>
        </ul>
      </div>

      <button
        onClick={() => {
          setCurrentStep('selection');
          setSelectedConnector(null);
          setSetupSession(null);
          setCurrentStepData(null);
          setStepData({});
          setProgress(0);
          setError(null);
          setIsConnected(false);
        }}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Connect Another Service
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${modeStyles.background} p-6`}>
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={`${modeStyles.card} rounded-xl p-8 shadow-xl`}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </motion.div>
            )}

            {currentStep === 'selection' && renderConnectorSelection()}
            {currentStep === 'configuration' && renderConfiguration()}
            {currentStep === 'completed' && renderCompleted()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConnectorSetup;
