import React, { useState } from 'react';
import { X, Edit, Save, Wand2, Sparkles } from 'lucide-react';

const EditAssetModal = ({ asset, onClose, onSave }) => {
  const [assetName, setAssetName] = useState(asset.name || '');
  const [assetDescription, setAssetDescription] = useState(asset.description || '');
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    
    const updatedAsset = {
      ...asset,
      name: assetName,
      description: assetDescription,
      updated_at: new Date().toISOString()
    };

    onSave(updatedAsset);
  };

  const handleAIEdit = async () => {
    if (!editPrompt.trim()) {
      alert('Please describe how you want to edit this asset');
      return;
    }

    setIsProcessing(true);

    try {
      // Determine which agent to use based on asset type
      const endpoint = asset.type === 'video' 
        ? '/api/agents/edit-video' 
        : '/api/agents/edit-image';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asset_id: asset.asset_id,
          asset_url: asset.url,
          edit_instruction: editPrompt,
          asset_type: asset.type,
          current_metadata: asset.metadata || {}
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit asset');
      }

      const data = await response.json();
      
      // Update the asset with the edited version
      const updatedAsset = {
        ...asset,
        url: data.edited_url || data.url,
        name: assetName,
        description: assetDescription,
        updated_at: new Date().toISOString(),
        edit_history: [
          ...(asset.edit_history || []),
          {
            timestamp: new Date().toISOString(),
            instruction: editPrompt,
            editor: 'AI Agent'
          }
        ],
        metadata: {
          ...asset.metadata,
          ...data
        }
      };

      onSave(updatedAsset);

    } catch (error) {
      console.error('Error editing asset:', error);
      alert('Failed to edit asset. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getEditSuggestions = () => {
    if (asset.type === 'image') {
      return [
        "Add a professional overlay with company logo",
        "Adjust brightness and contrast for better visibility",
        "Add text overlay with product information",
        "Change background to white",
        "Apply modern color grading"
      ];
    } else if (asset.type === 'video') {
      return [
        "Add text overlay at the beginning",
        "Trim to first 30 seconds",
        "Add background music",
        "Apply color correction",
        "Add transitions between scenes"
      ];
    }
    return [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Asset</h2>
                <p className="text-blue-100 text-sm">Update or AI-enhance your asset</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Asset Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Asset
              </label>
              <div className="border-2 border-gray-300 rounded-lg aspect-video bg-gray-50 overflow-hidden">
                {asset.type === 'image' && (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-contain"
                  />
                )}
                {asset.type === 'video' && (
                  <video
                    src={asset.url}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
                {(asset.type === 'template' || asset.type === 'sound') && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <p className="text-lg font-medium">{asset.type}</p>
                      <p className="text-sm">{asset.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Asset Info */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{asset.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created by:</span>
                    <span className="font-medium">{asset.created_by}</span>
                  </div>
                  {asset.ai_generated && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">AI Generated:</span>
                      <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Yes
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Edit Form */}
            <div>
              <form onSubmit={handleSave} className="space-y-6">
                {/* Asset Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="Enter asset name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Asset Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={assetDescription}
                    onChange={(e) => setAssetDescription(e.target.value)}
                    placeholder="Enter asset description"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* AI Edit Section */}
                {(asset.type === 'image' || asset.type === 'video') && (
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <Wand2 className="w-4 h-4 mr-2 text-purple-500" />
                      AI-Powered Edits
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Describe how you want to modify this asset and our AI will do it for you
                    </p>
                    
                    <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="E.g., Add a white border, increase brightness, add text overlay..."
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                    />

                    {/* Edit Suggestions */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-2">Quick suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {getEditSuggestions().slice(0, 3).map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditPrompt(suggestion)}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-200 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAIEdit}
                      disabled={isProcessing || !editPrompt.trim()}
                      className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Apply AI Edit
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Edit History */}
                {asset.edit_history && asset.edit_history.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Edit History</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {asset.edit_history.map((edit, idx) => (
                        <div key={idx} className="bg-gray-50 rounded p-2 text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{edit.editor}</span>
                            <span className="text-gray-500">
                              {new Date(edit.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{edit.instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAssetModal;

