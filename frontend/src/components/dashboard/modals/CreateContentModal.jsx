import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useCreativeAssets } from '../../../services/contentIntelligenceApi';

const CreateContentModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    platform: '',
    content_type: '',
    theme: '',
    content_preview: '',
    caption: '',
    scheduled_date: '',
    priority: 'medium',
    media_file: null,
    selected_asset: null,
    media_meta: { durationSec: null, width: null, height: null, sizeBytes: null },
    scheduled_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  });

  const platforms = ['instagram', 'linkedin', 'twitter', 'facebook', 'tiktok', 'youtube', 'email'];
  const contentTypes = ['post', 'story', 'reel', 'article', 'tweet', 'thread', 'video', 'short', 'pin', 'email'];
  const themes = ['educational', 'promotional', 'behind_scenes', 'user_generated', 'entertainment'];

  const platformAllowedTypes = {
    instagram: ['post', 'story', 'reel'],
    facebook: ['post', 'story', 'video'],
    twitter: ['tweet', 'thread'],
    linkedin: ['post', 'article'],
    tiktok: ['video'],
    youtube: ['video', 'short'],
    pinterest: ['pin'],
    email: ['email']
  };

  const getCaptionMax = (platform, type) => {
    if (!platform) return 10000;
    switch (platform) {
      case 'instagram': return 2200;
      case 'twitter': return type === 'thread' ? 2800 : 280;
      case 'linkedin': return 3000;
      case 'tiktok': return 2200;
      case 'youtube': return 5000;
      case 'facebook': return 63206;
      case 'pinterest': return 500;
      case 'email': return 100000;
      default: return 10000;
    }
  };

  const getMediaHints = (platform, type) => {
    if (!platform) return 'Select a platform to see media guidance.';
    const map = {
      instagram: 'Images 1:1/4:5/16:9; Reels: vertical video, up to 90s; Max caption 2200.',
      facebook: 'Image or video; longer captions allowed (up to ~63k).',
      twitter: 'Images or short video; tweets up to 280 chars (threads supported).',
      linkedin: 'Post (image/video) up to ~3k chars; Articles support long-form.',
      tiktok: 'Vertical video recommended; captions up to ~2200.',
      youtube: 'Video required; Shorts are vertical under 60s; descriptions long.',
      pinterest: 'Pins require an image or video; title/description concise.',
      email: 'Upload images embedded; rich text allowed; no hard caption limit.'
    };
    return map[platform] || '';
  };

  const { assets: assetsResp } = useCreativeAssets ? useCreativeAssets() : { assets: [] };
  const libraryAssets = (assetsResp && (assetsResp.items || assetsResp.assets || assetsResp)) || [];
  const [assetTab, setAssetTab] = useState('upload');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePlatformMedia(formData)) return;
    const maxCap = getCaptionMax(formData.platform, formData.content_type);
    if (formData.caption && formData.caption.length > maxCap) {
      alert(`Caption exceeds max length for ${formData.platform} (${formData.caption.length}/${maxCap}).`);
      return;
    }

    // Create initial version history entry
    const versionEntry = {
      id: `version_${Date.now()}`,
      version: '1.0',
      timestamp: new Date().toISOString(),
      author: 'You',
      changes: ['Initial creation'],
      status: 'created',
      content_snapshot: {
        content_preview: formData.content_preview,
        platform: formData.platform,
        content_type: formData.content_type,
        theme: formData.theme,
        caption: formData.caption,
        scheduled_date: formData.scheduled_date,
        priority: formData.priority
      }
    };

    const formDataWithVersion = {
      ...formData,
      version_history: [versionEntry]
    };

    onSave(formDataWithVersion);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    if (!file) {
      setFormData({ ...formData, media_file: null, selected_asset: null, media_meta: { durationSec: null, width: null, height: null, sizeBytes: null } });
      return;
    }
    const sizeBytes = file.size || null;
    if (file.type && file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        setFormData(prev => ({
          ...prev,
          media_file: file,
          selected_asset: null,
          media_meta: { durationSec: null, width: img.width, height: img.height, sizeBytes }
        }));
      };
      img.src = URL.createObjectURL(file);
    } else if (file.type && file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const durationSec = video.duration ? Math.round(video.duration) : null;
        setFormData(prev => ({
          ...prev,
          media_file: file,
          selected_asset: null,
          media_meta: { durationSec, width: null, height: null, sizeBytes }
        }));
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    } else {
      setFormData(prev => ({ ...prev, media_file: file, selected_asset: null, media_meta: { durationSec: null, width: null, height: null, sizeBytes } }));
    }
  };

  const handleAssetSelect = (asset) => {
    setFormData({ ...formData, selected_asset: asset, media_file: null });
  };

  const getSelectedMediaInfo = () => {
    const name = formData.media_file?.name || formData.selected_asset?.name || formData.selected_asset?.filename || '';
    const type = formData.media_file?.type || formData.selected_asset?.type || '';
    return { name, type };
  };

  const validatePlatformMedia = (data) => {
    const errs = [];
    const { platform, content_type } = data;
    const { name, type } = getSelectedMediaInfo();
    const isVideo = type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(name);
    const isImage = type.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(name);
    const { durationSec, width, height, sizeBytes } = data.media_meta || {};

    if (!platform) errs.push('Select a platform.');
    if (!content_type) errs.push('Select a content type.');

    if (platform === 'instagram' && content_type === 'reel' && !isVideo) errs.push('Instagram Reels require a video file.');
    if (platform === 'youtube' && content_type !== 'video') errs.push('YouTube posts must be of type "video".');
    if ((platform === 'instagram' || platform === 'facebook' || platform === 'pinterest') && content_type === 'post' && !(isImage || isVideo)) errs.push('This post requires an image or video.');
    if (platform === 'email' && content_type !== 'email') errs.push('Email platform requires content type "email".');

    if (sizeBytes && sizeBytes > 100 * 1024 * 1024) errs.push('Media file is larger than 100MB, consider compressing.');
    if (platform === 'instagram' && content_type === 'reel' && durationSec && durationSec > 90) errs.push('Instagram Reels should be 90 seconds or less.');
    if (platform === 'youtube' && content_type === 'short' && durationSec && durationSec > 60) errs.push('YouTube Shorts must be 60 seconds or less.');

    if (isImage && width && height && platform === 'instagram' && content_type === 'post') {
      const ratio = width / height;
      if (ratio < 0.7 || ratio > 1.91) {
        console.warn('Instagram prefers 4:5, 1:1 or 16:9 aspect ratios.');
      }
    }

    if (errs.length) {
      alert(errs.join('\n'));
      return false;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Plus className="w-6 h-6 text-purple-500 mr-3" />
              Create Content
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform *</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Platform</option>
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type *</label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select Type</option>
                  {contentTypes.map(type => {
                    const allowed = platformAllowedTypes[formData.platform] || contentTypes;
                    const disabled = formData.platform ? !allowed.includes(type) : false;
                    return (
                      <option key={type} value={type} disabled={disabled}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                        {disabled ? ' (not supported)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Theme</option>
                  {themes.map(theme => (
                    <option key={theme} value={theme}>
                      {theme.replace('_', ' ').charAt(0).toUpperCase() + theme.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
              <div className="flex items-center space-x-2 mb-3">
                <button type="button" onClick={() => setAssetTab('upload')} className={`px-3 py-1 rounded text-sm ${assetTab === 'upload' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Upload</button>
                <button type="button" onClick={() => setAssetTab('library')} className={`px-3 py-1 rounded text-sm ${assetTab === 'library' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Select from Library</button>
              </div>

              {assetTab === 'upload' ? (
                <div>
                  <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="w-full" />
                  {(formData.media_file || formData.selected_asset) && (
                    <div className="mt-2 text-xs text-gray-700">
                      <div className="mb-1">Selected: {formData.media_file?.name || formData.selected_asset?.name || formData.selected_asset?.filename}</div>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">{getMediaHints(formData.platform, formData.content_type)}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-auto border rounded p-2">
                  {libraryAssets.length === 0 && (
                    <div className="col-span-3 text-sm text-gray-500">No assets found. Upload in the Assets tab.</div>
                  )}
                  {libraryAssets.map((asset, idx) => (
                    <button
                      key={asset.id || idx}
                      type="button"
                      onClick={() => handleAssetSelect(asset)}
                      className={`border rounded p-2 text-left hover:bg-gray-50 ${formData.selected_asset && (formData.selected_asset.id === asset.id) ? 'ring-2 ring-purple-500' : ''}`}
                    >
                      <div className="text-sm font-medium truncate">{asset.name || asset.filename || 'Asset'}</div>
                      {asset.type && (
                        <div className="text-xs text-gray-500 mt-1">{asset.type}</div>
                      )}
                      {asset.thumbnail_url && (
                        <img src={asset.thumbnail_url} alt="thumb" className="mt-2 max-h-24 rounded border" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Preview *</label>
              <textarea
                value={formData.content_preview}
                onChange={(e) => setFormData({ ...formData, content_preview: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Describe your content..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption / Post Text</label>
              <textarea
                value={formData.caption}
                onChange={(e) => {
                  const max = getCaptionMax(formData.platform, formData.content_type);
                  const val = e.target.value.length > max ? e.target.value.slice(0, max) : e.target.value;
                  setFormData({ ...formData, caption: val });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Write the caption or post text..."
              />
              <div className="mt-1 text-xs text-gray-500">{(formData.caption || '').length}/{getCaptionMax(formData.platform, formData.content_type)} characters</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date & Time *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <select
                  value={formData.scheduled_timezone}
                  onChange={(e) => setFormData({ ...formData, scheduled_timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline.none focus:ring-2 focus:ring-purple-500"
                >
                  {['UTC','Africa/Johannesburg','America/New_York','America/Los_Angeles','Europe/London','Europe/Berlin','Asia/Dubai','Asia/Singapore','Asia/Tokyo','Australia/Sydney'].map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-md transition-colors">Create Content</button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateContentModal;
