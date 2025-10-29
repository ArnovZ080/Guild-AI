import React, { useState } from 'react';
import { X, Sparkles, Video, Loader, Download, Wand2 } from 'lucide-react';

const EditVideoWithAIModal = ({ videoAsset, onClose, onGenerate }) => {
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [resultVideo, setResultVideo] = useState(null);

  const handleApplyEdit = async () => {
    if (!instruction.trim()) {
      setError('Please describe how you want to edit the video.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    setResultVideo(null);

    try {
      const response = await fetch('/api/agents/edit-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: videoAsset.asset_id || videoAsset.id || 'unknown_video',
          asset_url: videoAsset.url,
          edit_instruction: instruction,
          asset_type: 'video',
          current_metadata: videoAsset.metadata || {}
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process video edit');
      }

      const data = await response.json();
      const edited = {
        url: data.edited_url || data.url,
        video_path: data.video_path,
        metadata: data.metadata || data,
        name: `${videoAsset.name || 'Video'} (Edited)`
      };
      setResultVideo(edited);
    } catch (e) {
      console.error('Video edit failed:', e);
      setError(e.message || 'Video edit failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (resultVideo) {
      onGenerate(resultVideo);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Video with AI</h2>
                <p className="text-indigo-100 text-sm">Describe the change and let the Video Agent do the rest</p>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Reference Video & Result Preview */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Video</label>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <video
                    src={videoAsset.url}
                    controls
                    className="w-full h-56 object-contain bg-black"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Selected from your library: {videoAsset.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Edited Preview</label>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden min-h-[14rem] flex items-center justify-center bg-gray-50">
                  {isProcessing ? (
                    <div className="text-center">
                      <Loader className="w-10 h-10 mx-auto mb-3 text-indigo-600 animate-spin" />
                      <p className="text-gray-600">Applying your edit with AI...</p>
                    </div>
                  ) : resultVideo ? (
                    <video
                      src={resultVideo.url || resultVideo.video_path}
                      controls
                      className="w-full h-56 object-contain bg-black"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Video className="w-12 h-12 mx-auto mb-2" />
                      <p>Your edited video will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Instruction */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Describe your edit</label>
                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="E.g., Trim to first 15 seconds, add white caption at bottom saying 'New Product Launch', apply modern color grade"
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Tips: Include actions like trim, add text overlay, crop, add audio, speed change, or color grade.
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleApplyEdit}
                  disabled={isProcessing || !instruction.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Apply Edit
                    </>
                  )}
                </button>
                {resultVideo && (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Save to Library
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVideoWithAIModal;


