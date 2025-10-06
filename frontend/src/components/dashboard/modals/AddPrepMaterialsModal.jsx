import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Link as LinkIcon, Plus, Trash2, Upload, CheckCircle } from 'lucide-react';

const AddPrepMaterialsModal = ({ isOpen, onClose, event, onAddMaterials }) => {
  const [materials, setMaterials] = useState([]);
  const [currentMaterial, setCurrentMaterial] = useState({ type: 'link', content: '', description: '' });

  const materialTypes = [
    { value: 'link', label: 'Link/URL', icon: LinkIcon },
    { value: 'note', label: 'Note/Text', icon: FileText },
    { value: 'file', label: 'File Upload', icon: Upload },
  ];

  const handleAddMaterial = () => {
    if (!currentMaterial.content.trim()) return;
    
    setMaterials([...materials, { ...currentMaterial, id: Date.now() }]);
    setCurrentMaterial({ type: 'link', content: '', description: '' });
  };

  const handleRemoveMaterial = (id) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleSubmit = () => {
    if (materials.length === 0) return;
    
    onAddMaterials({
      eventId: event.id,
      materials: materials
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
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Add Prep Materials
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Add documents, links, or notes to prepare for this event
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

          {/* Add New Material */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Add New Material</h3>
            
            {/* Material Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {materialTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setCurrentMaterial({ ...currentMaterial, type: type.value })}
                      className={`
                        flex items-center justify-center space-x-2 p-3 border-2 rounded-lg transition-all
                        ${currentMaterial.type === type.value 
                          ? 'border-purple-500 bg-purple-50 text-purple-700' 
                          : 'border-gray-200 hover:border-purple-300'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentMaterial.type === 'link' && 'URL'}
                {currentMaterial.type === 'note' && 'Note Content'}
                {currentMaterial.type === 'file' && 'File Name/Path'}
              </label>
              {currentMaterial.type === 'note' ? (
                <textarea
                  value={currentMaterial.content}
                  onChange={(e) => setCurrentMaterial({ ...currentMaterial, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows="4"
                  placeholder="Enter your note content..."
                />
              ) : (
                <input
                  type="text"
                  value={currentMaterial.content}
                  onChange={(e) => setCurrentMaterial({ ...currentMaterial, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={
                    currentMaterial.type === 'link' 
                      ? 'https://example.com/document.pdf' 
                      : 'document.pdf'
                  }
                />
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={currentMaterial.description}
                onChange={(e) => setCurrentMaterial({ ...currentMaterial, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief description of this material..."
              />
            </div>

            <button
              onClick={handleAddMaterial}
              disabled={!currentMaterial.content.trim()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Add Material</span>
            </button>
          </div>

          {/* Added Materials List */}
          {materials.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Added Materials ({materials.length})
              </h3>
              <div className="space-y-2">
                {materials.map((material) => {
                  const Icon = materialTypes.find(t => t.value === material.type)?.icon || FileText;
                  return (
                    <div
                      key={material.id}
                      className="flex items-start space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg"
                    >
                      <Icon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{material.content}</p>
                        {material.description && (
                          <p className="text-xs text-gray-600 mt-1">{material.description}</p>
                        )}
                        <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mt-1">
                          {materialTypes.find(t => t.value === material.type)?.label}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveMaterial(material.id)}
                        className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Where will these appear?</h4>
                <p className="text-sm text-gray-700">
                  Prep materials will be attached to this event and shown in:
                </p>
                <ul className="text-sm text-gray-700 list-disc list-inside mt-2 space-y-1">
                  <li>Event details modal (this view)</li>
                  <li>Pre-meeting notifications and reminders</li>
                  <li>AI briefing cards before the event</li>
                  <li>Meeting companion overlay during the event</li>
                </ul>
              </div>
            </div>
          </div>

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
              disabled={materials.length === 0}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Save Materials ({materials.length})</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddPrepMaterialsModal;

