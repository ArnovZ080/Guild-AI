import React, { useState, useEffect } from 'react';
import { X, Sparkles, Video, Wand2, RefreshCw, Download, Loader, Image as ImageIcon } from 'lucide-react';

const GenerateVideoModal = ({ onClose, onGenerate, availableAssets = [], initialReferenceAsset = null }) => {
  const [videoType, setVideoType] = useState('slideshow'); // 'slideshow', 'text_video', 'social_media'
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [style, setStyle] = useState('modern');
  const [duration, setDuration] = useState(15);
  const [images, setImages] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  // Pre-populate with reference asset if provided
  useEffect(() => {
    if (initialReferenceAsset) {
      if (initialReferenceAsset.type === 'image') {
        // Add the image to the slideshow
        setImages([{
          file: null,
          url: initialReferenceAsset.url,
          name: initialReferenceAsset.name
        }]);
        setVideoType('slideshow');
      } else if (initialReferenceAsset.type === 'video') {
        // Set content based on video name
        setContent(`Create a variation of ${initialReferenceAsset.name}`);
        setVideoType('social_media');
      }
    }
  }, [initialReferenceAsset]);

  const videoTypes = [
    { 
      value: 'slideshow', 
      label: 'Slideshow', 
      description: 'Create a video from images with transitions',
      icon: ImageIcon
    },
    { 
      value: 'text_video', 
      label: 'Text Video', 
      description: 'Animated text-based video',
      icon: Video
    },
    { 
      value: 'social_media', 
      label: 'Social Media', 
      description: 'Platform-optimized social video',
      icon: Sparkles
    }
  ];

  const platforms = [
    { value: 'instagram', label: 'Instagram', dimensions: '1080x1080', fps: 30 },
    { value: 'tiktok', label: 'TikTok', dimensions: '1080x1920', fps: 30 },
    { value: 'youtube', label: 'YouTube', dimensions: '1920x1080', fps: 30 },
    { value: 'linkedin', label: 'LinkedIn', dimensions: '1280x720', fps: 24 }
  ];

  const styles = [
    { value: 'modern', label: 'Modern', color: '#2C3E50' },
    { value: 'minimalist', label: 'Minimalist', color: '#FFFFFF' },
    { value: 'colorful', label: 'Colorful', color: '#E74C3C' },
    { value: 'professional', label: 'Professional', color: '#34495E' }
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageURLs = files.map(file => ({
      file: file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setImages(prev => [...prev, ...imageURLs]);
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile({
        file: file,
        url: URL.createObjectURL(file),
        name: file.name
      });
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (videoType === 'slideshow' && images.length === 0) {
      setError('Please upload at least one image for the slideshow');
      return;
    }

    if ((videoType === 'text_video' || videoType === 'social_media') && !content.trim()) {
      setError('Please enter content for the video');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideo(null);

    try {
      // Judge Layer gating with brand profile context
      try {
        const profRes = await fetch('/api/profile');
        const profJson = await profRes.json();
        const profile = profJson?.data || null;
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const judgePayload = {
          brief: {
            objective: `Generate ${videoType} video`,
            goals: { engagement: 'increase' },
            audience: undefined,
            topic: content || `AI ${videoType} for ${platform}`
          },
          platforms: [platform],
          brand: profile ? { voice: profile.brand_voice, colors: profile.brand_colors, guidelines: profile.guidelines } : undefined
        };
        const jr = await fetch(`${apiBase}/content/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(judgePayload) });
        const judge = await jr.json();
        if (judge?.data?.approved === false) {
          const score = judge?.data?.overall_score;
          setIsGenerating(false);
          setError(`Video content failed quality gate${typeof score==='number'?` (score: ${Math.round(score*100)/100})`:''}. Refine inputs and try again.`);
          return;
        }
      } catch {}

      // Prepare form data for file upload
      const formData = new FormData();
      formData.append('video_type', videoType);
      formData.append('platform', platform);
      formData.append('style', style);
      formData.append('duration', duration);
      formData.append('content', content);

      // Add images for slideshow
      if (videoType === 'slideshow') {
        images.forEach((img, index) => {
          formData.append(`image_${index}`, img.file);
        });
      }

      // Add audio if provided
      if (audioFile) {
        formData.append('audio', audioFile.file);
      }

      // Call the video generation agent via API
      const response = await fetch('/content/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: content || `Generate ${videoType} video`,
          duration: duration,
          style: style,
          platform: platform,
          aspectRatio: aspectRatio,
          referenceAssets: images.map(img => img.id || img.name)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      const data = await response.json();
      
      // Set the generated video
      setGeneratedVideo({
        url: data.video_path || data.url,
        content: content,
        style: style,
        platform: platform,
        duration: data.duration || duration,
        name: `AI Generated Video - ${new Date().toLocaleString()}`,
        description: content || `${videoType} video for ${platform}`,
        metadata: data
      });

    } catch (error) {
      console.error('Error generating video:', error);
      setError('Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveVideo = () => {
    if (generatedVideo) {
      onGenerate(generatedVideo);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Video Generator</h2>
                <p className="text-green-100 text-sm">Powered by Video Editor Agent</p>
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
            {/* Left Column - Controls */}
            <div className="space-y-6">
              {/* Video Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {videoTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setVideoType(type.value)}
                        className={`p-3 border-2 rounded-lg text-left transition-all flex items-start space-x-3 ${
                          videoType === type.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm">{type.label}</div>
                          <div className="text-xs text-gray-600">{type.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slideshow Images Upload */}
              {videoType === 'slideshow' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images ({images.length})
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <label className="cursor-pointer flex-1 text-center">
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <span className="text-sm text-gray-600">Upload from device</span>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <div className="text-gray-400">or</div>
                      <button
                        type="button"
                        onClick={() => setShowAssetPicker(true)}
                        className="flex-1 text-center text-sm text-green-600 hover:text-green-700"
                      >
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <span>Select from library</span>
                      </button>
                    </div>
                    
                    {images.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-20 object-cover rounded"
                            />
                            <button
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content Input for Text/Social Videos */}
              {(videoType === 'text_video' || videoType === 'social_media') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Content *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter the text content for your video..."
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
              )}

              {/* Audio Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Audio (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {audioFile ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{audioFile.name}</span>
                      <button
                        onClick={() => setAudioFile(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="text-center">
                        <span className="text-sm text-gray-600">Click to upload audio</span>
                      </div>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {platforms.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label} ({p.dimensions}, {p.fps}fps)
                    </option>
                  ))}
                </select>
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visual Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {styles.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        style === s.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-sm font-medium">{s.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration: {duration} seconds
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5s</span>
                  <span>30s</span>
                  <span>60s</span>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Video
                  </>
                )}
              </button>
            </div>

            {/* Right Column - Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="border-2 border-gray-300 rounded-lg aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                {isGenerating ? (
                  <div className="text-center">
                    <Loader className="w-12 h-12 mx-auto mb-4 text-green-500 animate-spin" />
                    <p className="text-gray-600">Generating your video...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
                  </div>
                ) : generatedVideo ? (
                  <div className="relative w-full h-full">
                    <video
                      src={generatedVideo.url}
                      controls
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <button
                        onClick={() => setGeneratedVideo(null)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        title="Clear"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={handleSaveVideo}
                        className="p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
                        title="Save to Library"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <Video className="w-16 h-16 mx-auto mb-4" />
                    <p>Your generated video will appear here</p>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Tips */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Video Creation Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use 3-5 high-quality images for best results</li>
                  <li>• Keep text concise for better readability</li>
                  <li>• Match your video style to your brand</li>
                  <li>• Consider platform-specific dimensions</li>
                  <li>• Add background music to enhance engagement</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            {generatedVideo && (
              <button
                onClick={handleSaveVideo}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Save to Library
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Asset Picker Overlay */}
      {showAssetPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
            <div className="p-4 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select Images from Library</h3>
                <button
                  onClick={() => setShowAssetPicker(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {availableAssets.filter(a => a.type === 'image').map(asset => (
                  <div
                    key={asset.asset_id}
                    onClick={() => {
                      // Add asset to images array
                      setImages(prev => [...prev, {
                        file: null,
                        url: asset.url,
                        name: asset.name
                      }]);
                      setShowAssetPicker(false);
                    }}
                    className="cursor-pointer border-2 border-gray-200 rounded-lg overflow-hidden hover:border-green-500 transition-all"
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{asset.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              {availableAssets.filter(a => a.type === 'image').length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No images in your library yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateVideoModal;

