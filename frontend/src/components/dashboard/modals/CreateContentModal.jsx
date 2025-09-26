import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react';

const CreateContentModal = ({ onClose, onSave }) => {
  // Basic state
  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState('');
  const [theme, setTheme] = useState('');
  const [caption, setCaption] = useState('');
  const [priority, setPriority] = useState('medium');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Platform-specific content types and limits
  const platformConfig = {
    instagram: {
      contentTypes: ['image', 'carousel', 'reel', 'story'],
      captionLimit: 2200,
      imageAspectRatios: ['1:1', '4:5', '16:9'],
      videoLimits: { duration: '60', size: '100MB' }
    },
    facebook: {
      contentTypes: ['text', 'image', 'video', 'link'],
      captionLimit: 63206,
      imageAspectRatios: ['1.91:1', '1:1'],
      videoLimits: { duration: '240', size: '4GB' }
    },
    twitter: {
      contentTypes: ['text', 'image', 'video'],
      captionLimit: 280,
      imageAspectRatios: ['16:9', '1:1'],
      videoLimits: { duration: '140', size: '512MB' }
    },
    linkedin: {
      contentTypes: ['text', 'image', 'video', 'article'],
      captionLimit: 3000,
      imageAspectRatios: ['1.91:1'],
      videoLimits: { duration: '600', size: '5GB' }
    },
    tiktok: {
      contentTypes: ['video'],
      captionLimit: 2200,
      videoLimits: { duration: '180', size: '287.6MB' }
    },
    youtube: {
      contentTypes: ['video'],
      captionLimit: 5000,
      videoLimits: { duration: '43200', size: '128GB' }
    }
  };

  // Reset content type when platform changes
  useEffect(() => {
    setContentType('');
    setValidationErrors({});
  }, [platform]);

  // Reset media when content type changes
  useEffect(() => {
    setMediaFile(null);
    setMediaPreview('');
  }, [contentType]);

  // Handle media upload
  const handleMediaUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (contentType === 'image' && !isImage) {
      setValidationErrors({ media: 'Please upload an image file' });
      return;
    }
    if (contentType === 'video' && !isVideo) {
      setValidationErrors({ media: 'Please upload a video file' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Get file metadata
    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration);
        const size = file.size / (1024 * 1024); // Convert to MB
        
        // Validate against platform limits
        if (platformConfig[platform]?.videoLimits) {
          const limits = platformConfig[platform].videoLimits;
          if (duration > parseInt(limits.duration)) {
            setValidationErrors({ media: `Video duration exceeds ${limits.duration} seconds limit for ${platform}` });
            return;
          }
          if (size > parseFloat(limits.size)) {
            setValidationErrors({ media: `File size exceeds ${limits.size} limit for ${platform}` });
            return;
          }
        }
      };
      video.src = URL.createObjectURL(file);
    }

    if (isImage) {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = (img.width / img.height).toFixed(2);
        // Add aspect ratio validation here based on platform
        if (platformConfig[platform]?.imageAspectRatios) {
          // Implementation for aspect ratio validation
        }
      };
      img.src = URL.createObjectURL(file);
    }

    setMediaFile(file);
    setValidationErrors({});
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!platform) errors.platform = 'Please select a platform';
    if (!contentType) errors.contentType = 'Please select a content type';
    if (!theme) errors.theme = 'Please select a theme';
    if (!caption) errors.caption = 'Please enter a caption';
    if (!scheduledDate) errors.scheduledDate = 'Please select a date';
    if (!scheduledTime) errors.scheduledTime = 'Please select a time';
    
    if (caption && platformConfig[platform]?.captionLimit) {
      if (caption.length > platformConfig[platform].captionLimit) {
        errors.caption = `Caption exceeds ${platform}'s ${platformConfig[platform].captionLimit} character limit`;
      }
    }

    if (['image', 'video'].includes(contentType) && !mediaFile) {
      errors.media = 'Please upload media';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;

    const content = {
      platform,
      content_type: contentType,
      theme,
      caption,
      priority,
      scheduled_date: `${scheduledDate}T${scheduledTime}`,
      timezone,
      media: mediaFile,
      status: 'scheduled'
    };

    onSave(content);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Content</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className={`w-full p-2 border rounded-md ${
                  validationErrors.platform ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Platform</option>
                {Object.keys(platformConfig).map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
              {validationErrors.platform && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.platform}</p>
              )}
            </div>

            {/* Content Type Selection */}
            {platform && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className={`w-full p-2 border rounded-md ${
                    validationErrors.contentType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Content Type</option>
                  {platformConfig[platform].contentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {validationErrors.contentType && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.contentType}</p>
                )}
              </div>
            )}

            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className={`w-full p-2 border rounded-md ${
                  validationErrors.theme ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Theme</option>
                <option value="educational">Educational</option>
                <option value="promotional">Promotional</option>
                <option value="entertainment">Entertainment</option>
                <option value="behind_the_scenes">Behind the Scenes</option>
                <option value="user_generated">User Generated</option>
                <option value="company_culture">Company Culture</option>
              </select>
              {validationErrors.theme && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.theme}</p>
              )}
            </div>

            {/* Media Upload */}
            {['image', 'video'].includes(contentType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept={contentType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload {contentType === 'image' ? 'an image' : 'a video'}
                    </span>
                    {platform && (
                      <span className="text-xs text-gray-500 mt-1">
                        {contentType === 'image'
                          ? `Recommended aspect ratios: ${platformConfig[platform].imageAspectRatios.join(
                              ', '
                            )}`
                          : `Max duration: ${platformConfig[platform].videoLimits.duration}s, Max size: ${
                              platformConfig[platform].videoLimits.size
                            }`}
                      </span>
                    )}
                  </label>
                </div>
                {mediaPreview && (
                  <div className="mt-4">
                    {contentType === 'image' ? (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-w-full h-auto rounded-lg"
                      />
                    ) : (
                      <video
                        src={mediaPreview}
                        controls
                        className="max-w-full h-auto rounded-lg"
                      />
                    )}
                  </div>
                )}
                {validationErrors.media && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.media}</p>
                )}
              </div>
            )}

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption
                {platform && platformConfig[platform].captionLimit && (
                  <span className="text-gray-500 ml-2">
                    ({caption.length}/{platformConfig[platform].captionLimit})
                  </span>
                )}
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows="4"
                className={`w-full p-2 border rounded-md ${
                  validationErrors.caption ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your caption..."
              />
              {validationErrors.caption && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.caption}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Scheduling */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline-block mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className={`w-full p-2 border rounded-md ${
                    validationErrors.scheduledDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.scheduledDate && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.scheduledDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline-block mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className={`w-full p-2 border rounded-md ${
                    validationErrors.scheduledTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.scheduledTime && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.scheduledTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {Intl.supportedValuesOf('timeZone').map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Content
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateContentModal;
