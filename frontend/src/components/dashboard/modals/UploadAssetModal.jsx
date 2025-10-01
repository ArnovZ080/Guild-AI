import React, { useState } from 'react';
import { X, Upload, File, Image, Video, Music, FileText, Cloud, HardDrive } from 'lucide-react';

const UploadAssetModal = ({ onClose, onUpload }) => {
  const [uploadSource, setUploadSource] = useState('local'); // 'local', 'google_drive', 'one_drive'
  const [assetType, setAssetType] = useState('image');
  const [assetName, setAssetName] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (!assetName) {
      setAssetName(selectedFile.name);
    }
    
    // Auto-detect asset type from file
    const fileType = selectedFile.type;
    if (fileType.startsWith('image/')) {
      setAssetType('image');
    } else if (fileType.startsWith('video/')) {
      setAssetType('video');
    } else if (fileType.startsWith('audio/')) {
      setAssetType('sound');
    } else {
      setAssetType('template');
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    
    if (!file && uploadSource === 'local') {
      alert('Please select a file to upload');
      return;
    }

    if (!assetName) {
      alert('Please provide a name for the asset');
      return;
    }

    // Create asset data
    const assetData = {
      type: assetType,
      name: assetName,
      description: assetDescription,
      source: uploadSource,
      file: file,
      url: file ? URL.createObjectURL(file) : null,
      size: file ? file.size : 0,
      mime_type: file ? file.type : null
    };

    onUpload(assetData);
  };

  const getTypeIcon = () => {
    switch (assetType) {
      case 'image':
        return <Image className="w-8 h-8 text-blue-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-500" />;
      case 'sound':
        return <Music className="w-8 h-8 text-pink-500" />;
      case 'template':
        return <FileText className="w-8 h-8 text-green-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getAcceptedFileTypes = () => {
    switch (assetType) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'sound':
        return 'audio/*';
      case 'template':
        return '.psd,.ai,.sketch,.fig,.xd,.pdf';
      default:
        return '*';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Upload Asset</h2>
                <p className="text-green-100 text-sm">Add new assets to your library</p>
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
        <form onSubmit={handleUpload} className="p-6">
          <div className="space-y-6">
            {/* Upload Source Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Source
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setUploadSource('local')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    uploadSource === 'local'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <HardDrive className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Local File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadSource('google_drive')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    uploadSource === 'google_drive'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Cloud className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Google Drive</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadSource('one_drive')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    uploadSource === 'one_drive'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Cloud className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">OneDrive</span>
                </button>
              </div>
            </div>

            {/* Asset Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Type
              </label>
              <div className="grid grid-cols-4 gap-3">
                {['image', 'video', 'template', 'sound'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAssetType(type)}
                    className={`p-3 border-2 rounded-lg transition-all capitalize ${
                      assetType === type
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type === 'image' && <Image className="w-5 h-5 mx-auto mb-1" />}
                    {type === 'video' && <Video className="w-5 h-5 mx-auto mb-1" />}
                    {type === 'template' && <FileText className="w-5 h-5 mx-auto mb-1" />}
                    {type === 'sound' && <Music className="w-5 h-5 mx-auto mb-1" />}
                    <span className="text-xs">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Area */}
            {uploadSource === 'local' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    dragActive
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="space-y-2">
                      {getTypeIcon()}
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-2">
                        Drag and drop your file here, or
                      </p>
                      <label className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
                        Browse Files
                        <input
                          type="file"
                          onChange={handleFileInput}
                          accept={getAcceptedFileTypes()}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Supported formats: {getAcceptedFileTypes()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Cloud Storage Integration (Placeholder) */}
            {uploadSource !== 'local' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <Cloud className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-medium text-gray-900 mb-2">
                  {uploadSource === 'google_drive' ? 'Google Drive' : 'OneDrive'} Integration
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your {uploadSource === 'google_drive' ? 'Google Drive' : 'OneDrive'} account to import assets
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => alert(`${uploadSource === 'google_drive' ? 'Google Drive' : 'OneDrive'} integration coming soon!`)}
                >
                  Connect Account
                </button>
              </div>
            )}

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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                placeholder="Enter asset description (optional)"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadAssetModal;

