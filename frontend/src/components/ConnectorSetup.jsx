import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Loader2, ExternalLink, HelpCircle } from 'lucide-react';

const ConnectorSetup = ({ userId, onSetupComplete }) => {
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
    }
  };

  const startSetup = async (connectorId) => {
    setLoading(true);
    setError(null);
    
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
          // Setup completed
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

  const renderStepInputs = () => {
    if (!currentStep || !currentStep.step_details) return null;

    const { inputs } = currentStep.step_details;
    if (!inputs || inputs.length === 0) return null;

    return (
      <div className="space-y-4">
        {inputs.map((input, index) => (
          <div key={index} className="space-y-2">
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
            />
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    if (!currentStep) return null;

    const { step_title, step_details } = currentStep;
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Step {currentStep.step_number} of {currentStep.total_steps}
            <Badge variant="outline">{selectedConnector?.name}</Badge>
          </CardTitle>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{step_title}</h3>
            <p className="text-gray-600">{step_details.description}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStepInputs()}
          
          {step_details.help_text && (
            <Alert>
              <HelpCircle className="h-4 w-4" />
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
            <div className="space-y-2">
              <h4 className="font-medium">Tips:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {step_details.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setSetupSession(null);
                setCurrentStep(null);
                setStepData({});
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitStepData}
              disabled={loading}
              className="min-w-[100px]"
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
    );
  };

  const renderConnectorGrid = () => {
    return (
      <div className="space-y-6">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <Label>Filter by Category</Label>
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
          </div>
        )}

        {/* Connectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableConnectors.map((connector) => (
            <Card 
              key={connector.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => startSetup(connector.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {connector.icon} {connector.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{connector.description}</p>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={
                      connector.setup_complexity === 'easy' ? 'default' :
                      connector.setup_complexity === 'medium' ? 'secondary' : 'destructive'
                    }
                  >
                    {connector.setup_complexity}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {connector.setup_steps_count} steps
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  Permissions: {connector.required_permissions.join(', ')}
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
                    'Set Up'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {setupSession && (
        <div className="space-y-4">
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
        </div>
      )}

      {currentStep ? renderStepContent() : renderConnectorGrid()}

      {setupSession && currentStep?.status === 'completed' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            🎉 Setup completed successfully! Your agents can now use {selectedConnector?.name} integration.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ConnectorSetup;
