import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Eye, EyeOff, Shield, ExternalLink, Info, CheckCircle,
  AlertTriangle, BookOpen, Key, Link, Activity, Clock, Zap,
  ChevronRight, ChevronDown, HelpCircle, Lock
} from 'lucide-react';

/**
 * Enhanced ConnectModal Component
 * 
 * Purpose: Provides a comprehensive, transparent, and educational experience
 * for connecting external services to Guild-AI
 * 
 * Key Features:
 * - Detailed service descriptions with use cases
 * - Step-by-step API key acquisition instructions
 * - Transparency about data access and usage
 * - Educational tooltips and explanations
 * - Security best practices highlighted
 * - Link to official documentation
 * 
 * This component embodies Guild-AI's core principles:
 * 1. Full transparency: Shows exactly what data is accessed and why
 * 2. Learning platform: Educates users about integrations and APIs
 */
const ConnectModal = ({ connector, onClose, onConnect, isConnecting }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [additionalFields, setAdditionalFields] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // overview, instructions, security, transparency
  const [expandedSteps, setExpandedSteps] = useState({});
  const [showTooltip, setShowTooltip] = useState({});

  if (!connector) return null;

  const Icon = connector.icon;
  const instructions = connector.api_key_instructions || {};

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      return;
    }

    onConnect({
      connector_id: connector.id,
      api_key: apiKey,
      additional_config: additionalFields
    });
  };

  // Toggle step expansion for detailed view
  const toggleStep = (index) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Complexity badge styling
  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className={`${connector.color} text-white p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Connect {connector.name}</h2>
                <p className="text-sm opacity-90 mt-1">{connector.category.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Meta information */}
          <div className="flex flex-wrap gap-3">
            <div className={`px-3 py-1 rounded-full border text-sm ${getComplexityColor(connector.setup_complexity)} bg-white`}>
              <span className="font-medium">Setup: {connector.setup_complexity}</span>
            </div>
            <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{connector.estimated_setup_time}</span>
            </div>
            <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>{connector.capabilities?.length || 0} capabilities</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 bg-gray-50">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'instructions', label: 'Setup Instructions', icon: BookOpen },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'transparency', label: 'Transparency', icon: Activity }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What is {connector.name}?</h3>
                  <p className="text-gray-700 leading-relaxed">{connector.description}</p>
                </div>

                {/* Use Cases */}
                {connector.use_cases && connector.use_cases.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">What Guild Agents Can Do</h3>
                    <div className="space-y-2">
                      {connector.use_cases.map((useCase, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-800 text-sm">{useCase}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capabilities */}
                {connector.capabilities && connector.capabilities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Capabilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {connector.capabilities.map(capability => (
                        <span
                          key={capability}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg border border-gray-200"
                        >
                          {capability.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* N8N Blueprints */}
                {connector.id === 'n8n' && connector.api_key_instructions?.blueprints && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pre-built Automation Blueprints</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {connector.api_key_instructions.blueprints.map((blueprint, index) => (
                        <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="text-sm text-gray-800">{blueprint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Instructions Tab */}
            {activeTab === 'instructions' && (
              <motion.div
                key="instructions"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Instructions Header */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">{instructions.title || `How to Connect ${connector.name}`}</h3>
                      <p className="text-sm text-blue-800">
                        Follow these steps carefully to obtain your API credentials. This process teaches you about API authentication - a fundamental concept in software integrations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step-by-step Instructions */}
                {instructions.steps && instructions.steps.length > 0 && (
                  <div className="space-y-3">
                    {instructions.steps.map((step, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleStep(index)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                              {step.step}
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-gray-900">{step.action}</h4>
                              {!expandedSteps[index] && (
                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{step.details}</p>
                              )}
                            </div>
                          </div>
                          {expandedSteps[index] ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedSteps[index] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4"
                            >
                              <div className="pl-12">
                                <p className="text-gray-700 leading-relaxed">{step.details}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}

                {/* Important Notes */}
                {instructions.notes && instructions.notes.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-2">Important Notes</h4>
                        <ul className="space-y-1">
                          {instructions.notes.map((note, index) => (
                            <li key={index} className="text-sm text-yellow-800 flex items-start space-x-2">
                              <span className="text-yellow-600 mt-0.5">•</span>
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Troubleshooting */}
                {instructions.troubleshooting && instructions.troubleshooting.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <HelpCircle className="w-5 h-5 text-gray-600" />
                      <span>Common Issues</span>
                    </h4>
                    <div className="space-y-3">
                      {instructions.troubleshooting.map((item, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-900 mb-1">⚠️ {item.issue}</p>
                          <p className="text-sm text-gray-700">💡 {item.solution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Link to Documentation */}
                <a
                  href={connector.documentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
                >
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">View Official {connector.name} Documentation</span>
                </a>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-900 mb-2">How We Protect Your Data</h3>
                      <p className="text-green-800 leading-relaxed">
                        {connector.security_notes || `Your ${connector.name} credentials are encrypted using industry-standard AES-256 encryption and stored securely in our database. We only use these credentials to connect to your ${connector.name} account on your behalf when performing actions you've authorized.`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Security Best Practices</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                      <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">End-to-End Encryption</p>
                        <p className="text-sm text-gray-600 mt-1">All API keys and tokens are encrypted both in transit (HTTPS) and at rest (AES-256).</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                      <Key className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Secure Storage</p>
                        <p className="text-sm text-gray-600 mt-1">Credentials are stored in isolated, encrypted databases with strict access controls.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Principle of Least Privilege</p>
                        <p className="text-sm text-gray-600 mt-1">We only request the minimum permissions necessary to provide the features you use.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                      <Activity className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Audit Logging</p>
                        <p className="text-sm text-gray-600 mt-1">Every API call is logged so you can review exactly what actions were taken.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {connector.required_permissions && connector.required_permissions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Required Permissions</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">Guild-AI will request the following permissions:</p>
                      <div className="space-y-2">
                        {connector.required_permissions.map((permission, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700 font-mono">{permission}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">You're Always in Control</h4>
                  <p className="text-sm text-blue-800">
                    You can revoke Guild-AI's access to {connector.name} at any time from your {connector.name} account settings or from the Guild-AI dashboard. When you disconnect, we immediately delete all stored credentials.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Transparency Tab */}
            {activeTab === 'transparency' && (
              <motion.div
                key="transparency"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <Activity className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">Full Transparency Promise</h3>
                      <p className="text-purple-800 leading-relaxed">
                        At Guild-AI, we believe in complete transparency. Here's exactly what data we access, how we use it, and why. You'll always know what your agents are doing.
                      </p>
                    </div>
                  </div>
                </div>

                {connector.transparency_info && (
                  <div className="space-y-6">
                    {/* Data Accessed */}
                    {connector.transparency_info.data_accessed && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Info className="w-5 h-5 text-blue-600" />
                          <span>What Data We Access</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {connector.transparency_info.data_accessed.map((dataType, index) => (
                            <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="text-sm text-gray-800">{dataType}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Data Storage */}
                    {connector.transparency_info.data_stored && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Database className="w-5 h-5 text-purple-600" />
                          <span>What We Store</span>
                        </h4>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <p className="text-sm text-gray-700">{connector.transparency_info.data_stored}</p>
                        </div>
                      </div>
                    )}

                    {/* Sync Frequency */}
                    {connector.transparency_info.frequency && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-orange-600" />
                          <span>When We Access Your Data</span>
                        </h4>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <p className="text-sm text-gray-700">{connector.transparency_info.frequency}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">See What Agents Are Doing</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Every action taken by Guild-AI agents is logged in the Agent Theater. You can view:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2 text-sm text-gray-700">
                      <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Exactly which API endpoints were called and when</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm text-gray-700">
                      <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>What data was retrieved or modified</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm text-gray-700">
                      <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Which agent performed the action and why</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm text-gray-700">
                      <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Full audit trail of all integrations activities</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer with API Key Input */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Key className="w-4 h-4" />
                <span>API Key / Token</span>
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowTooltip({ apiKey: true })}
                    onMouseLeave={() => setShowTooltip({ apiKey: false })}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  {showTooltip.apiKey && (
                    <div className="absolute left-6 bottom-0 w-64 bg-gray-900 text-white text-xs rounded-lg p-2 z-10">
                      Paste the API key you obtained from {connector.name}. This will be encrypted and stored securely.
                    </div>
                  )}
                </div>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${connector.name} API key`}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-2">
              <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-800">
                Your credentials are encrypted with AES-256 encryption and stored securely. Guild only uses them to connect to your {connector.name} account on your behalf.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                disabled={isConnecting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!apiKey.trim() || isConnecting}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4" />
                    <span>Connect {connector.name}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ConnectModal;

