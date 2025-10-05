import React, { useState } from 'react';
import { 
  Bot, 
  CheckCircle, 
  X, 
  Edit3, 
  Plus, 
  Trash2, 
  ArrowRight,
  Clock,
  Users,
  Zap,
  AlertTriangle
} from 'lucide-react';

const ActionConfirmationModal = ({ 
  insight, 
  onClose, 
  onAccept, 
  onReject,
  onEdit 
}) => {
  const [editedActions, setEditedActions] = useState(insight?.actions || []);
  const [isEditing, setIsEditing] = useState(false);
  const [newAction, setNewAction] = useState('');

  if (!insight) return null;

  const handleAddAction = () => {
    if (newAction.trim()) {
      setEditedActions([...editedActions, {
        id: Date.now(),
        description: newAction.trim(),
        agent: 'user_added',
        estimatedTime: '5-10 minutes',
        priority: 'medium'
      }]);
      setNewAction('');
    }
  };

  const handleRemoveAction = (actionId) => {
    setEditedActions(editedActions.filter(action => action.id !== actionId));
  };

  const handleAccept = () => {
    onAccept({
      insight: insight,
      actions: editedActions
    });
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      onEdit({
        insight: insight,
        actions: editedActions
      });
    }
  };

  const getAgentIcon = (agent) => {
    const icons = {
      'customer_intelligence': Users,
      'business_intelligence': Bot,
      'content_intelligence': Bot,
      'orchestrator': Zap,
      'user_added': Edit3
    };
    return icons[agent] || Bot;
  };

  const getAgentColor = (agent) => {
    const colors = {
      'customer_intelligence': 'text-blue-600 bg-blue-100',
      'business_intelligence': 'text-green-600 bg-green-100',
      'content_intelligence': 'text-purple-600 bg-purple-100',
      'orchestrator': 'text-orange-600 bg-orange-100',
      'user_added': 'text-gray-600 bg-gray-100'
    };
    return colors[agent] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-red-600 bg-red-100',
      'medium': 'text-yellow-600 bg-yellow-100',
      'low': 'text-green-600 bg-green-100'
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Action Confirmation</h2>
                <p className="text-sm text-gray-600">Review and approve the proposed agent actions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Insight Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
            <p className="text-gray-700 mb-3">{insight.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className={`px-2 py-1 rounded-full ${getPriorityColor(insight.priority)}`}>
                {insight.priority} priority
              </span>
              <span className="text-gray-600">Affected Agents: {insight.affectedAgents?.join(', ')}</span>
            </div>
          </div>

          {/* Proposed Actions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Proposed Agent Actions</h3>
              <button
                onClick={handleEdit}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  isEditing 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Edit3 className="w-4 h-4 inline mr-1" />
                {isEditing ? 'Save Changes' : 'Edit Actions'}
              </button>
            </div>

            <div className="space-y-3">
              {editedActions.map((action, index) => {
                const AgentIcon = getAgentIcon(action.agent);
                return (
                  <div key={action.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-lg ${getAgentColor(action.agent)}`}>
                          <AgentIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              Step {index + 1}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(action.priority)}`}>
                              {action.priority} priority
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{action.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {action.agent.replace('_', ' ')}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {action.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveAction(action.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Action */}
            {isEditing && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Add Custom Action</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    placeholder="Describe the action you want to add..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAction()}
                  />
                  <button
                    onClick={handleAddAction}
                    className="px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Execution Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <ArrowRight className="w-4 h-4 mr-2" />
              Execution Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Actions:</span>
                <span className="font-medium ml-1">{editedActions.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Affected Agents:</span>
                <span className="font-medium ml-1">{[...new Set(editedActions.map(a => a.agent))].length}</span>
              </div>
              <div>
                <span className="text-gray-600">Estimated Time:</span>
                <span className="font-medium ml-1">15-30 minutes</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Review all actions before proceeding</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onReject}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept & Execute
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmationModal;
