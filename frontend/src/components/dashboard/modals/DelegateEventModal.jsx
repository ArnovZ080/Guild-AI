import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Bot, CheckCircle, Clock, Sparkles } from 'lucide-react';

const DelegateEventModal = ({ isOpen, onClose, event, onDelegate }) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [delegationNotes, setDelegationNotes] = useState('');
  const [priority, setPriority] = useState('medium');

  const availableAgents = [
    { id: 'pa_agent', name: 'PA Agent', icon: '🤖', description: 'Personal assistant for scheduling and coordination' },
    { id: 'meeting_notes_agent', name: 'Meeting Notes Agent', icon: '📝', description: 'Records, transcribes, and summarizes meetings' },
    { id: 'automation_agent', name: 'Automation Agent', icon: '⚡', description: 'Automates tasks and workflows' },
    { id: 'research_agent', name: 'Research Agent', icon: '🔍', description: 'Gathers information and prepares materials' },
    { id: 'content_agent', name: 'Content Agent', icon: '✍️', description: 'Creates presentations and documents' },
    { id: 'customer_agent', name: 'Customer Agent', icon: '👥', description: 'Manages customer relations and follow-ups' },
  ];

  const handleSubmit = () => {
    if (!selectedAgent) return;
    
    onDelegate({
      eventId: event.id,
      agent: selectedAgent,
      notes: delegationNotes,
      priority: priority
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Bot className="w-6 h-6 mr-2" />
                Delegate to Agent
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Assign this event to an AI agent for preparation and management
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-700"><strong>Title:</strong> {event.title}</p>
              <p className="text-gray-700"><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p className="text-gray-700"><strong>Time:</strong> {event.time}</p>
            </div>
          </div>

          {/* Select Agent */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Select Agent
            </label>
            <div className="grid grid-cols-1 gap-3">
              {availableAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`
                    flex items-start space-x-3 p-4 border-2 rounded-lg text-left transition-all
                    ${selectedAgent === agent.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }
                  `}
                >
                  <span className="text-2xl">{agent.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                      {selectedAgent === agent.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{agent.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Task Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">🟢 Low - Handle when convenient</option>
              <option value="medium">🟡 Medium - Standard priority</option>
              <option value="high">🔴 High - Urgent attention needed</option>
            </select>
          </div>

          {/* Delegation Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              value={delegationNotes}
              onChange={(e) => setDelegationNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="4"
              placeholder="e.g., 'Prepare a 5-page report on Q4 results', 'Gather competitive analysis', 'Create agenda and send to attendees'"
            />
          </div>

          {/* AI Suggestion */}
          {selectedAgent && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">AI Recommendation</h4>
                  <p className="text-sm text-gray-700">
                    {selectedAgent === 'meeting_notes_agent' && 
                      'This agent will automatically join, record, and transcribe your meeting. You\'ll receive a summary with action items within 5 minutes after the event ends.'}
                    {selectedAgent === 'research_agent' && 
                      'This agent will gather relevant information, create briefing materials, and prepare talking points before your event.'}
                    {selectedAgent === 'content_agent' && 
                      'This agent will create presentation slides, documents, or any content needed for your event.'}
                    {selectedAgent === 'pa_agent' && 
                      'This agent will manage all logistics, send reminders, coordinate attendees, and ensure everything runs smoothly.'}
                    {selectedAgent === 'automation_agent' && 
                      'This agent will automate repetitive tasks, setup workflows, and handle post-event follow-ups automatically.'}
                    {selectedAgent === 'customer_agent' && 
                      'This agent will prepare customer insights, past interactions, and suggest optimal engagement strategies.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedAgent}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>Delegate Event</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DelegateEventModal;

