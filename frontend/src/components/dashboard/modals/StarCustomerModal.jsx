import React, { useState } from 'react';
import { 
  Star, 
  X, 
  Tag, 
  Plus, 
  Users, 
  CheckCircle,
  Heart,
  Award,
  Target
} from 'lucide-react';

const StarCustomerModal = ({ 
  customer, 
  onClose, 
  onConfirm 
}) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');

  if (!customer) return null;

  const availableTags = [
    'VIP Customer',
    'High Value',
    'Frequent Buyer',
    'Strategic Partner',
    'Early Adopter',
    'Brand Advocate',
    'Enterprise Client',
    'Startup Partner',
    'Long-term Customer',
    'Priority Support'
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleConfirm = () => {
    onConfirm({
      customer: customer,
      tags: selectedTags,
      priority: priority,
      notes: notes,
      starred: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Star Customer</h2>
                <p className="text-sm text-gray-600">Add {customer.name} to your priority customers</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {customer.name[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                <p className="text-sm text-gray-600">{customer.email}</p>
                <p className="text-sm text-gray-500">{customer.conversationCount} conversations • ${customer.totalValue?.toLocaleString() || 0} value</p>
              </div>
            </div>
          </div>

          {/* Priority Selection */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Priority Level</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'low', label: 'Low', icon: Target, color: 'bg-green-100 text-green-800' },
                { value: 'medium', label: 'Medium', icon: Award, color: 'bg-yellow-100 text-yellow-800' },
                { value: 'high', label: 'High', icon: Heart, color: 'bg-red-100 text-red-800' }
              ].map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  onClick={() => setPriority(value)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    priority === value 
                      ? `border-current ${color}` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-2" />
                  <div className="text-sm font-medium">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags Selection */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Customer Tags</h4>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {tag}
                </button>
              ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add custom tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
              />
              <button
                onClick={addCustomTag}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this customer..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Selected Tags Preview */}
          {selectedTags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Selected Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
            >
              <Star className="w-4 h-4 mr-2" />
              Star Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarCustomerModal;
