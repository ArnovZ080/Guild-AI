import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Check, X, ArrowRight } from 'lucide-react';

const SummaryStep = ({ answers, onNext }) => {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editedAnswers, setEditedAnswers] = useState(answers);

  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const handleSave = () => {
    setEditedAnswers(prev => ({ ...prev, [editingField]: editValue }));
    setEditingField(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const summarySections = [
    {
      title: "Business Overview",
      fields: [
        { key: 'business_type', label: 'Business Type', icon: '🏢' },
        { key: 'business_stage', label: 'Business Stage', icon: '📈' },
        { key: 'business_description', label: 'Description', icon: '📝' }
      ]
    },
    {
      title: "Audience & Clients",
      fields: [
        { key: 'audience_type', label: 'Target Audience', icon: '👥' },
        { key: 'customer_avatar', label: 'Customer Avatar', icon: '🎯' },
        { key: 'audience_problem', label: 'Main Problem', icon: '💡' }
      ]
    },
    {
      title: "Goals & Priorities",
      fields: [
        { key: 'priority_3months', label: '3-Month Priority', icon: '🎯' },
        { key: 'guild_support_focus', label: 'Guild Focus', icon: '🤖' },
        { key: 'vision_12months', label: '12-Month Vision', icon: '🚀' }
      ]
    },
    {
      title: "Preferences",
      fields: [
        { key: 'data_storage', label: 'Data Storage', icon: '💾' },
        { key: 'automation_level', label: 'Automation Level', icon: '⚡' },
        { key: 'selectedSoftware', label: 'Connected Tools', icon: '🔌' }
      ]
    }
  ];

  const formatValue = (key, value) => {
    if (key === 'selectedSoftware' && Array.isArray(value)) {
      return value.length > 0 ? `${value.length} tools connected` : 'No tools selected';
    }
    return value || 'Not specified';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold text-gray-900">Here's what I've got so far:</h2>
        <p className="text-lg text-gray-600">
          Take a look at your setup summary. If I missed anything or got something wrong, 
          you can edit it right here.
        </p>
      </motion.div>

      {/* Summary sections */}
      <div className="space-y-6">
        {summarySections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{field.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{field.label}</span>
                  </div>
                  
                  {editingField === field.key ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSave}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <p className="text-gray-900 flex-1">
                        {formatValue(field.key, editedAnswers[field.key])}
                      </p>
                      <button
                        onClick={() => handleEdit(field.key, editedAnswers[field.key])}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-opacity"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            Looks good? If I missed anything, you can edit it later in your settings.
          </p>
        </div>
        
        <motion.button
          onClick={() => onNext(editedAnswers)}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Show Me What Guild Can Do</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SummaryStep;
