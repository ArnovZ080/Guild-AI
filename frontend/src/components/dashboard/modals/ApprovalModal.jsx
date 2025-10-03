import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  Zap,
  Clock,
  Users,
  Target,
  BarChart3,
  Activity,
  Heart,
  TrendingUp,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  MessageCircle,
  Shield,
  Sparkles
} from 'lucide-react';

const ApprovalModal = ({ 
  isOpen, 
  onClose, 
  onApprove, 
  title = "Approve Action",
  message = "Are you sure you want to proceed?",
  details = [],
  action = "approve",
  data = {},
  showPreview = true
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await onApprove(action, data);
      onClose();
    } catch (error) {
      console.error('Error approving action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'execute_playbook':
      case 'execute_campaign':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'activate_agents':
        return <Brain className="w-5 h-5 text-purple-600" />;
      case 'retention_outreach':
        return <Heart className="w-5 h-5 text-red-600" />;
      case 'schedule_call':
        return <Phone className="w-5 h-5 text-green-600" />;
      case 'send_email':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'ai_outreach':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'execute_playbook':
      case 'execute_campaign':
        return 'text-blue-600 bg-blue-100';
      case 'activate_agents':
        return 'text-purple-600 bg-purple-100';
      case 'retention_outreach':
        return 'text-red-600 bg-red-100';
      case 'schedule_call':
        return 'text-green-600 bg-green-100';
      case 'send_email':
        return 'text-blue-600 bg-blue-100';
      case 'ai_outreach':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getActionColor(action)}`}>
                {getActionIcon(action)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                <p className="text-gray-600">{message}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {showPreview && details.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions to be executed:</h4>
              <div className="space-y-3">
                {details.map((detail, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-gray-900 font-medium">{detail}</p>
                      {typeof detail === 'object' && detail.description && (
                        <p className="text-sm text-gray-600 mt-1">{detail.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Workflow Preview */}
          {action === 'activate_agents' && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">AI Agent Workflow</h4>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">AI Agents will:</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Analyze customer behavior patterns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Generate personalized outreach content</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Execute on preferred communication channel</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Monitor engagement and follow up</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expected Outcomes */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Expected Outcomes</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-green-600 font-medium">Success Rate</div>
                <div className="text-sm text-gray-600">Based on similar actions</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">2-3 days</div>
                <div className="text-blue-600 font-medium">Timeline</div>
                <div className="text-sm text-gray-600">Expected completion</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">$2.5K</div>
                <div className="text-purple-600 font-medium">Potential Value</div>
                <div className="text-sm text-gray-600">Revenue impact</div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h4>
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Low Risk</span>
            </div>
            <p className="text-sm text-gray-600">
              This action has been optimized by AI agents and follows established best practices. 
              All communications will be reviewed before sending.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500 flex items-center space-x-2 mb-3">
            <Clock className="w-4 h-4" />
            <span>This action will be executed immediately upon approval</span>
          </div>
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Execute
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ApprovalModal;