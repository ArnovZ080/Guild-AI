import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  MapPin,
  Users,
  Calendar,
  Bell,
  Brain,
  Trash2,
  Edit,
  Share2,
  Bot,
  CheckCircle,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  Upload
} from 'lucide-react';
import DelegateEventModal from './DelegateEventModal';
import AddPrepMaterialsModal from './AddPrepMaterialsModal';
import ShareEventModal from './ShareEventModal';

const SmartEventModal = ({ isOpen, onClose, event, onUpdate, onDelete, onDelegate, onAddMaterials, onShare, onReschedule }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showPrepMaterialsModal, setShowPrepMaterialsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    type: '',
    date: '',
    time: '',
    duration: 0,
    location: '',
    description: '',
    priority: '',
    attendees: ''
  });

  // Initialize edit form when event changes or editing mode is toggled
  React.useEffect(() => {
    if (event && isEditing) {
      setEditForm({
        title: event.title || '',
        type: event.type || 'meeting',
        date: event.date instanceof Date ? event.date.toISOString().split('T')[0] : new Date(event.date).toISOString().split('T')[0],
        time: event.time || '09:00',
        duration: event.duration || 60,
        location: event.location || '',
        description: event.description || '',
        priority: event.priority || 'medium',
        attendees: Array.isArray(event.attendees) ? event.attendees.join(', ') : ''
      });
    }
  }, [event, isEditing]);

  if (!event) return null;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      if (onDelete) {
        onDelete(event.id);
      }
      onClose();
    }
  };

  const handleDelegate = () => {
    setShowDelegateModal(true);
  };

  const handleAddPrep = () => {
    setShowPrepMaterialsModal(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleRescheduleClick = () => {
    if (onReschedule) {
      onReschedule(event);
    }
  };

  const handleSaveEdit = () => {
    if (!editForm.title.trim()) return;
    
    const updatedEvent = {
      ...event,
      title: editForm.title,
      type: editForm.type,
      date: new Date(editForm.date),
      time: editForm.time,
      duration: parseInt(editForm.duration),
      location: editForm.location,
      description: editForm.description,
      priority: editForm.priority,
      attendees: editForm.attendees ? editForm.attendees.split(',').map(a => a.trim()).filter(Boolean) : []
    };
    
    if (onUpdate) {
      onUpdate(updatedEvent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className={`p-6 text-white ${
          event.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-orange-600' :
          event.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
          'bg-gradient-to-r from-blue-500 to-purple-600'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold">{event.title}</h2>
                {event.agentCreated && (
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                    🤖 AI Created
                  </span>
                )}
              </div>
              <p className="text-sm opacity-90">
                {new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
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
          {/* Editing Mode */}
          {isEditing ? (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Team standup meeting"
                  required
                />
              </div>

              {/* Type and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Event Type *</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="meeting">👥 Meeting</option>
                    <option value="financial">💰 Financial</option>
                    <option value="goal">🎯 Goal/Task</option>
                    <option value="personal">✨ Personal</option>
                    <option value="reminder">⏰ Reminder</option>
                    <option value="content">📝 Content</option>
                    <option value="wellness">💚 Wellness</option>
                    <option value="agent_task">🤖 Agent Task</option>
                    <option value="break">☕ Break</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Priority *</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Date *</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Time *</label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Duration (min) *</label>
                  <input
                    type="number"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="15"
                    step="15"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Conference Room A, Zoom, etc."
                />
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Attendees (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.attendees}
                  onChange={(e) => setEditForm({ ...editForm, attendees: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., John Smith, Sarah Johnson"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                  placeholder="Additional details about the event..."
                />
              </div>

              {/* Edit Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editForm.title.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Event Details */}
              <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Time</p>
                <p className="font-semibold text-gray-900">{event.time} ({event.duration} min)</p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{event.location}</p>
                </div>
              </div>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">Attendees</p>
                  <p className="font-semibold text-gray-900">{event.attendees.length} people</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Reminders</p>
                <p className="font-semibold text-gray-900">
                  {event.reminders ? event.reminders.join(', ') + ' min' : 'None'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Prep Materials */}
          {event.prepMaterials && event.prepMaterials.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Prep Materials ({event.prepMaterials.length})
              </h3>
              <div className="space-y-2">
                {event.prepMaterials.map((material, index) => {
                  const Icon = material.type === 'link' ? LinkIcon : 
                               material.type === 'file' ? Upload : FileText;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <Icon className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {material.type === 'link' ? (
                          <a 
                            href={material.content} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-purple-700 hover:text-purple-900 hover:underline truncate block"
                          >
                            {material.content}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-gray-900 truncate">{material.content}</p>
                        )}
                        {material.description && (
                          <p className="text-xs text-gray-600 mt-1">{material.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Summary */}
          {event.aiSummary && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">AI Summary</h3>
                  <p className="text-sm text-gray-700">{event.aiSummary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Related Agent Tasks */}
          {event.relatedAgents && event.relatedAgents.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-blue-600" />
                Related Agent Tasks
              </h3>
              <div className="space-y-2">
                {event.relatedAgents.map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {agent.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Smart Suggestions */}
          {event.recommendations && event.recommendations.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                Smart Suggestions
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {event.recommendations.map((recommendation, index) => (
                  <button
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition-colors"
                  >
                    <span className="text-purple-600 font-bold">💡</span>
                    <span className="text-sm text-gray-700 flex-1">{recommendation}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Attendees List */}
          {event.attendees && event.attendees.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Attendees</h3>
              <div className="space-y-2">
                {event.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {attendee[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{attendee}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDelegate}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
              >
                <Bot className="w-4 h-4" />
                <span>Delegate to Agent</span>
              </button>
              
              <button
                onClick={handleAddPrep}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
              >
                <Brain className="w-4 h-4" />
                <span>Add Prep Materials</span>
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Event</span>
              </button>
              
              <button 
                onClick={handleRescheduleClick}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors font-medium"
              >
                <Calendar className="w-4 h-4" />
                <span>Reschedule</span>
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Event</span>
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Sub-Modals */}
      <AnimatePresence>
        {showDelegateModal && (
          <DelegateEventModal
            isOpen={showDelegateModal}
            onClose={() => setShowDelegateModal(false)}
            event={event}
            onDelegate={(data) => {
              if (onDelegate) onDelegate(data);
              setShowDelegateModal(false);
            }}
          />
        )}

        {showPrepMaterialsModal && (
          <AddPrepMaterialsModal
            isOpen={showPrepMaterialsModal}
            onClose={() => setShowPrepMaterialsModal(false)}
            event={event}
            onAddMaterials={(data) => {
              if (onAddMaterials) onAddMaterials(data);
              setShowPrepMaterialsModal(false);
            }}
          />
        )}

        {showShareModal && (
          <ShareEventModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            event={event}
            onShare={(data) => {
              if (onShare) onShare(data);
              setShowShareModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SmartEventModal;

