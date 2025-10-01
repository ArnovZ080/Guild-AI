import React, { useState } from 'react';
import { 
  Image, 
  Video, 
  FileText, 
  Music, 
  Plus, 
  Upload,
  Sparkles,
  Edit,
  Trash2,
  Download,
  Eye,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';

// Import modals
import UploadAssetModal from '../modals/UploadAssetModal';
import GenerateImageModal from '../modals/GenerateImageModal';
import GenerateVideoModal from '../modals/GenerateVideoModal';
import EditAssetModal from '../modals/EditAssetModal';

const AssetsTab = ({ assets = [] }) => {
  // State management
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGenerateImageModal, setShowGenerateImageModal] = useState(false);
  const [showGenerateVideoModal, setShowGenerateVideoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Section visibility states
  const [showVideos, setShowVideos] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSounds, setShowSounds] = useState(false);

  // Mock assets data (this would come from props/state in real implementation)
  const [localAssets, setLocalAssets] = useState(assets);

  // Filter assets by type
  const filterAssetsByType = (type) => {
    return localAssets.filter(asset => 
      asset.type === type && 
      (searchQuery === '' || 
       asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (asset.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const videoAssets = filterAssetsByType('video');
  const imageAssets = filterAssetsByType('image');
  const templateAssets = filterAssetsByType('template');
  const soundAssets = filterAssetsByType('sound');

  // Handle asset upload
  const handleAssetUpload = (assetData) => {
    const newAsset = {
      asset_id: `asset_${Date.now()}_${Math.random().toString(36).slice(2,9)}`,
      ...assetData,
      created_at: new Date().toISOString(),
      created_by: 'You'
    };
    setLocalAssets(prev => [...prev, newAsset]);
    setShowUploadModal(false);
  };

  // Handle image generation
  const handleImageGeneration = (generatedImage) => {
    const newAsset = {
      asset_id: `generated_image_${Date.now()}_${Math.random().toString(36).slice(2,9)}`,
      type: 'image',
      name: generatedImage.name || 'AI Generated Image',
      description: generatedImage.description || generatedImage.prompt,
      url: generatedImage.url || generatedImage.image_path,
      created_at: new Date().toISOString(),
      created_by: 'Image Generator Agent',
      ai_generated: true,
      metadata: generatedImage
    };
    setLocalAssets(prev => [...prev, newAsset]);
    setShowGenerateImageModal(false);
  };

  // Handle video generation
  const handleVideoGeneration = (generatedVideo) => {
    const newAsset = {
      asset_id: `generated_video_${Date.now()}_${Math.random().toString(36).slice(2,9)}`,
      type: 'video',
      name: generatedVideo.name || 'AI Generated Video',
      description: generatedVideo.description || generatedVideo.content,
      url: generatedVideo.url || generatedVideo.video_path,
      created_at: new Date().toISOString(),
      created_by: 'Video Editor Agent',
      ai_generated: true,
      metadata: generatedVideo
    };
    setLocalAssets(prev => [...prev, newAsset]);
    setShowGenerateVideoModal(false);
  };

  // Handle asset edit
  const handleAssetEdit = (updatedAsset) => {
    setLocalAssets(prev => 
      prev.map(asset => 
        asset.asset_id === updatedAsset.asset_id ? updatedAsset : asset
      )
    );
    setShowEditModal(false);
    setSelectedAsset(null);
  };

  // Handle AI edit with asset
  const handleAIEdit = (asset) => {
    console.log('handleAIEdit called with asset:', asset);
    if (asset.type === 'image') {
      console.log('Opening image generation modal');
      setSelectedAsset(asset);
      setShowGenerateImageModal(true);
    } else if (asset.type === 'video') {
      console.log('Opening video generation modal');
      setSelectedAsset(asset);
      setShowGenerateVideoModal(true);
    } else {
      console.log('Opening edit modal for template/sound');
      // For templates and sounds, open the metadata edit modal
      setSelectedAsset(asset);
      setShowEditModal(true);
    }
  };

  // Handle asset delete
  const handleAssetDelete = (assetId) => {
    console.log('handleAssetDelete called with assetId:', assetId);
    if (window.confirm('Are you sure you want to delete this asset?')) {
      console.log('User confirmed deletion');
      setLocalAssets(prev => prev.filter(asset => asset.asset_id !== assetId));
    } else {
      console.log('User cancelled deletion');
    }
  };

  // Asset Card Component
  const AssetCard = ({ asset, type }) => {
    const getTypeIcon = () => {
      switch (type) {
        case 'video':
          return <Video className="w-8 h-8 text-purple-500" />;
        case 'image':
          return <Image className="w-8 h-8 text-blue-500" />;
        case 'template':
          return <FileText className="w-8 h-8 text-green-500" />;
        case 'sound':
          return <Music className="w-8 h-8 text-pink-500" />;
        default:
          return <FileText className="w-8 h-8 text-gray-500" />;
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 group">
        {/* Asset Preview */}
        <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
          {asset.url ? (
            <>
              {type === 'image' && (
                <img 
                  src={asset.url} 
                  alt={asset.name} 
                  className="w-full h-full object-cover"
                />
              )}
              {type === 'video' && (
                <video 
                  src={asset.url} 
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              )}
              {(type === 'template' || type === 'sound') && (
                <div className="text-center">
                  {getTypeIcon()}
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              {getTypeIcon()}
            </div>
          )}
          

          {/* AI Generated Badge */}
          {asset.ai_generated && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>AI</span>
              </span>
            </div>
          )}
        </div>

        {/* Asset Info */}
        <div className="p-4">
          <h4 className="font-medium text-gray-900 truncate">{asset.name}</h4>
          {asset.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{asset.description}</p>
          )}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>{new Date(asset.created_at).toLocaleDateString()}</span>
            <span>{asset.created_by}</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                console.log('Edit with AI button clicked!', asset);
                handleAIEdit(asset);
              }}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Edit with AI
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('Delete button clicked!', asset.asset_id);
                handleAssetDelete(asset.asset_id);
              }}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center">
            <Image className="w-6 h-6 text-green-500 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Creative Assets Library</h3>
              <p className="text-sm text-gray-600">Manage and generate all your content assets</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Upload Asset Button */}
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Asset
            </button>

            {/* Generate Image Button */}
            <button 
              onClick={() => setShowGenerateImageModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Image
            </button>

            {/* Generate Video Button */}
            <button 
              onClick={() => setShowGenerateVideoModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors flex items-center"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Video
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            <option value="video">Videos</option>
            <option value="image">Images</option>
            <option value="template">Templates</option>
            <option value="sound">Sounds</option>
          </select>
        </div>

        {/* Assets Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Image className="w-5 h-5 text-green-500 mr-2" />
            Assets Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {videoAssets.length}
              </div>
              <div className="text-sm text-gray-600">Videos</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {imageAssets.length}
              </div>
              <div className="text-sm text-gray-600">Images</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {templateAssets.length}
              </div>
              <div className="text-sm text-gray-600">Templates</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">
                {soundAssets.length}
              </div>
              <div className="text-sm text-gray-600">Sounds</div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Video className="w-5 h-5 text-purple-500 mr-2" />
            Video Assets ({videoAssets.length})
          </h3>
          <button 
            onClick={() => setShowVideos(!showVideos)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
          >
            {showVideos ? 'Hide Videos' : 'View Videos'}
            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showVideos ? 'rotate-90' : ''}`} />
          </button>
        </div>
        
        {showVideos && (
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              {videoAssets.length > 0 ? (
                videoAssets.map(asset => (
                  <div key={asset.asset_id} className="flex-shrink-0 w-80">
                    <AssetCard asset={asset} type="video" />
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-12 text-gray-500">
                  <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No video assets yet</p>
                  <button 
                    onClick={() => setShowGenerateVideoModal(true)}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Generate Your First Video
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Images Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Image className="w-5 h-5 text-blue-500 mr-2" />
            Image Assets ({imageAssets.length})
          </h3>
          <button 
            onClick={() => setShowImages(!showImages)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
          >
            {showImages ? 'Hide Images' : 'View Images'}
            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showImages ? 'rotate-90' : ''}`} />
          </button>
        </div>
        
        {showImages && (
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              {imageAssets.length > 0 ? (
                imageAssets.map(asset => (
                  <div key={asset.asset_id} className="flex-shrink-0 w-80">
                    <AssetCard asset={asset} type="image" />
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-12 text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No image assets yet</p>
                  <button 
                    onClick={() => setShowGenerateImageModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generate Your First Image
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Templates Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 text-green-500 mr-2" />
            Template Assets ({templateAssets.length})
          </h3>
          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
          >
            {showTemplates ? 'Hide Templates' : 'View Templates'}
            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showTemplates ? 'rotate-90' : ''}`} />
          </button>
        </div>
        
        {showTemplates && (
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              {templateAssets.length > 0 ? (
                templateAssets.map(asset => (
                  <div key={asset.asset_id} className="flex-shrink-0 w-80">
                    <AssetCard asset={asset} type="template" />
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No template assets yet</p>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Upload Your First Template
                  </button>
              </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sounds Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Music className="w-5 h-5 text-pink-500 mr-2" />
            Sound Assets ({soundAssets.length})
          </h3>
          <button 
            onClick={() => setShowSounds(!showSounds)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center text-sm"
          >
            {showSounds ? 'Hide Sounds' : 'View Sounds'}
            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showSounds ? 'rotate-90' : ''}`} />
          </button>
        </div>
        
        {showSounds && (
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-4">
              {soundAssets.length > 0 ? (
                soundAssets.map(asset => (
                  <div key={asset.asset_id} className="flex-shrink-0 w-80">
                    <AssetCard asset={asset} type="sound" />
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-12 text-gray-500">
                  <Music className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No sound assets yet</p>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Upload Your First Sound
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadAssetModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleAssetUpload}
        />
      )}

      {showGenerateImageModal && (
        <GenerateImageModal
          onClose={() => {
            setShowGenerateImageModal(false);
            setSelectedAsset(null);
          }}
          onGenerate={handleImageGeneration}
          availableAssets={localAssets}
          initialReferenceAsset={selectedAsset}
        />
      )}

      {showGenerateVideoModal && (
        <GenerateVideoModal
          onClose={() => {
            setShowGenerateVideoModal(false);
            setSelectedAsset(null);
          }}
          onGenerate={handleVideoGeneration}
          availableAssets={localAssets}
          initialReferenceAsset={selectedAsset}
        />
      )}

      {showEditModal && selectedAsset && (
        <EditAssetModal
          asset={selectedAsset}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAsset(null);
          }}
          onSave={handleAssetEdit}
        />
      )}
    </div>
  );
};

export default AssetsTab;
