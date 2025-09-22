import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Play, Square, CheckCircle, X, AlertCircle } from 'lucide-react';

const ScreenRecordingStep = ({ selectedSoftware, onClose, onComplete }) => {
  const [recording, setRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [selectedApp, setSelectedApp] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');

  const handleStartRecording = async () => {
    try {
      // Request screen recording permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      setRecording(true);
      
      // Simulate recording process
      setTimeout(() => {
        setRecording(false);
        setRecordingComplete(true);
      }, 5000);
      
    } catch (error) {
      console.error('Error starting screen recording:', error);
      alert('Screen recording not supported or permission denied');
    }
  };

  const handleSaveWorkflow = () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      app: selectedApp,
      type: 'screen_recorded',
      timestamp: new Date().toISOString()
    };
    
    onComplete({ recordedWorkflows: [workflowData] });
  };

  if (recordingComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
        >
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recording Complete!</h2>
              <p className="text-gray-600">
                We've captured your workflow. Now let's give it a name and description so Guild can use it effectively.
              </p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="e.g., Create new project in Asana"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Describe what this workflow does..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWorkflow}
                disabled={!workflowName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Workflow
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🎥 Record Your Workflow</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">How this works:</h3>
                <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                  <li>Click "Start Recording" below</li>
                  <li>Select the screen/window you want to record</li>
                  <li>Perform your workflow (click through the steps you normally do)</li>
                  <li>We'll capture it and learn how to automate it for you</li>
                </ol>
              </div>
            </div>
          </div>

          {/* App selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Which app are you recording?
            </label>
            <input
              type="text"
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              placeholder="e.g., Asana, Notion, HubSpot..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Recording status */}
          {recording ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Square className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recording in progress...</h3>
                <p className="text-gray-600">Go ahead and perform your workflow. We're watching and learning!</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Video className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ready to record?</h3>
                <p className="text-gray-600">
                  We can learn this workflow by watching you click through once. 
                  No coding, no stress — just show us how you do it.
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStartRecording}
              disabled={recording || !selectedApp.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {recording ? (
                <>
                  <Square className="w-4 h-4" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Recording</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScreenRecordingStep;
