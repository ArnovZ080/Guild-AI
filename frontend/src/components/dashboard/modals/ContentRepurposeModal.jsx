import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Shuffle, Zap, FileText, Image, Video, Mic, Target, Calendar } from 'lucide-react';

const ContentRepurposeModal = ({ content, onClose, onSave }) => {
  const [repurposeType, setRepurposeType] = useState('duplicate');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [repurposedContent, setRepurposedContent] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customizations, setCustomizations] = useState({
    tone: 'maintain',
    length: 'maintain',
    audience: 'maintain',
    addHashtags: false,
    addCallToAction: false
  });

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📸', formats: ['post', 'story', 'reel'] },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', formats: ['post', 'article'] },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', formats: ['tweet', 'thread'] },
    { id: 'facebook', name: 'Facebook', icon: '📘', formats: ['post', 'story'] },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', formats: ['video'] },
    { id: 'youtube', name: 'YouTube', icon: '📺', formats: ['video', 'short'] },
    { id: 'email', name: 'Email', icon: '📧', formats: ['newsletter'] },
    { id: 'blog', name: 'Blog', icon: '📝', formats: ['article'] }
  ];

  const repurposeTypes = [
    {
      id: 'duplicate',
      name: 'Duplicate & Modify',
      description: 'Create copies for different platforms',
      icon: Copy,
      color: 'blue'
    },
    {
      id: 'repurpose',
      name: 'AI Repurpose',
      description: 'Transform content for different formats',
      icon: Shuffle,
      color: 'purple'
    },
    {
      id: 'expand',
      name: 'Expand Content',
      description: 'Turn short content into long-form',
      icon: FileText,
      color: 'green'
    },
    {
      id: 'condense',
      name: 'Condense Content',
      description: 'Turn long content into short snippets',
      icon: Target,
      color: 'orange'
    }
  ];

  const formatIcons = {
    post: FileText,
    story: Image,
    reel: Video,
    article: FileText,
    tweet: FileText,
    thread: FileText,
    video: Video,
    short: Video,
    newsletter: FileText
  };

  useEffect(() => {
    if (content) {
      // Auto-select the original platform
      setSelectedPlatforms([content.platform]);
      setSelectedFormats([content.content_type]);
    }
  }, [content]);

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleFormatToggle = (platformId, format) => {
    const formatKey = `${platformId}_${format}`;
    setSelectedFormats(prev => 
      prev.includes(formatKey) 
        ? prev.filter(key => key !== formatKey)
        : [...prev, formatKey]
    );
  };

  const generateRepurposedContent = async () => {
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newContent = [];
      let contentCounter = 1;

      selectedPlatforms.forEach(platformId => {
        const platform = platforms.find(p => p.id === platformId);
        const platformFormats = selectedFormats.filter(f => f.startsWith(`${platformId}_`));
        
        if (platformFormats.length === 0) {
          // If no formats selected for this platform, use default
          platformFormats.push(`${platformId}_${platform.formats[0]}`);
        }

        platformFormats.forEach(formatKey => {
          const format = formatKey.split('_')[1];
          const baseContent = content.content_preview || content.caption || '';
          
          let transformedContent = '';
          let newCaption = '';

          switch (repurposeType) {
            case 'duplicate':
              transformedContent = baseContent;
              newCaption = content.caption || baseContent;
              break;
            case 'repurpose':
              transformedContent = transformContentForPlatform(baseContent, platformId, format);
              newCaption = transformCaptionForPlatform(content.caption || baseContent, platformId, format);
              break;
            case 'expand':
              transformedContent = expandContent(baseContent);
              newCaption = expandCaption(content.caption || baseContent);
              break;
            case 'condense':
              transformedContent = condenseContent(baseContent);
              newCaption = condenseCaption(content.caption || baseContent);
              break;
          }

          newContent.push({
            content_id: `repurposed_${Date.now()}_${contentCounter++}`,
            platform: platformId,
            content_type: format,
            theme: content.theme,
            content_preview: transformedContent,
            caption: newCaption,
            scheduled_date: new Date(Date.now() + contentCounter * 24 * 60 * 60 * 1000).toISOString(),
            scheduled_timezone: content.scheduled_timezone || 'UTC',
            status: 'draft',
            priority: content.priority,
            assignee: 'You',
            ai_generated: true,
            repurposed_from: content.content_id,
            repurpose_type: repurposeType,
            created_at: new Date().toISOString()
          });
        });
      });

      setRepurposedContent(newContent);
    } catch (error) {
      console.error('Repurpose generation failed:', error);
      alert('Failed to generate repurposed content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const transformContentForPlatform = (content, platform, format) => {
    const transformations = {
      instagram: {
        post: `${content} 📸 Perfect for Instagram!`,
        story: `Story: ${content}`,
        reel: `Reel: ${content} 🎬`
      },
      linkedin: {
        post: `${content} 💼 Professional insight for LinkedIn`,
        article: `Article: ${content}\n\nThis professional perspective explores...`
      },
      twitter: {
        tweet: `${content.substring(0, 200)}... 🐦`,
        thread: `Thread: ${content}\n\n1/ ${content.substring(0, 200)}`
      },
      tiktok: {
        video: `TikTok: ${content} 🎵 #viral #trending`
      },
      youtube: {
        video: `Video: ${content}\n\nFull video description...`,
        short: `Shorts: ${content} 📱`
      },
      email: {
        newsletter: `Newsletter: ${content}\n\nRead more in our newsletter...`
      },
      blog: {
        article: `Blog Post: ${content}\n\nFull article content with detailed insights...`
      }
    };

    return transformations[platform]?.[format] || content;
  };

  const transformCaptionForPlatform = (caption, platform, format) => {
    const platformHashtags = {
      instagram: ['#instagram', '#socialmedia', '#content'],
      linkedin: ['#linkedin', '#professional', '#business'],
      twitter: ['#twitter', '#tweet', '#social'],
      tiktok: ['#tiktok', '#viral', '#trending'],
      youtube: ['#youtube', '#video', '#content'],
      email: [],
      blog: ['#blog', '#article', '#content']
    };

    const hashtags = customizations.addHashtags ? platformHashtags[platform] || [] : [];
    const cta = customizations.addCallToAction ? '\n\nWhat do you think? Comment below! 👇' : '';
    
    return `${caption} ${hashtags.join(' ')}${cta}`;
  };

  const expandContent = (content) => {
    return `Expanded: ${content}\n\nThis topic deserves a deeper dive. Let's explore the key points:\n\n1. ${content}\n2. Additional insights and analysis\n3. Practical applications\n4. Real-world examples\n\nIn conclusion, ${content.toLowerCase()} offers valuable opportunities for growth and development.`;
  };

  const expandCaption = (caption) => {
    return `${caption}\n\nWant to learn more? Check out our detailed guide in the link in bio! 🔗`;
  };

  const condenseContent = (content) => {
    return content.length > 100 ? `${content.substring(0, 100)}...` : content;
  };

  const condenseCaption = (caption) => {
    return caption.length > 50 ? `${caption.substring(0, 50)}...` : caption;
  };

  const handleSaveAll = () => {
    if (onSave) {
      onSave(repurposedContent);
    }
    onClose();
  };

  if (!content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Shuffle className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Repurpose Content</h2>
              <p className="text-sm text-gray-600">
                Transform "{content.content_preview?.substring(0, 50)}..." for different platforms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Configuration */}
            <div className="space-y-6">
              {/* Repurpose Type */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Repurpose Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {repurposeTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setRepurposeType(type.id)}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          repurposeType === type.id 
                            ? `border-${type.color}-300 bg-${type.color}-50` 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon className={`w-5 h-5 ${
                            repurposeType === type.id ? `text-${type.color}-600` : 'text-gray-500'
                          }`} />
                          <span className="font-medium text-gray-900">{type.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Platforms</h3>
                <div className="space-y-2">
                  {platforms.map(platform => (
                    <div key={platform.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPlatforms.includes(platform.id)}
                            onChange={() => handlePlatformToggle(platform.id)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-lg">{platform.icon}</span>
                          <span className="font-medium text-gray-900">{platform.name}</span>
                        </label>
                      </div>
                      
                      {selectedPlatforms.includes(platform.id) && (
                        <div className="ml-6 space-y-1">
                          <p className="text-sm text-gray-600">Content formats:</p>
                          <div className="flex flex-wrap gap-2">
                            {platform.formats.map(format => {
                              const Icon = formatIcons[format] || FileText;
                              const formatKey = `${platform.id}_${format}`;
                              return (
                                <button
                                  key={formatKey}
                                  onClick={() => handleFormatToggle(platform.id, format)}
                                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                                    selectedFormats.includes(formatKey)
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  <Icon className="w-3 h-3" />
                                  <span>{format}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Customizations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customizations</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={customizations.addHashtags}
                      onChange={(e) => setCustomizations(prev => ({ ...prev, addHashtags: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Add platform-specific hashtags</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={customizations.addCallToAction}
                      onChange={(e) => setCustomizations(prev => ({ ...prev, addCallToAction: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Add call-to-action</span>
                  </label>
                </div>
              </div>

              <button
                onClick={generateRepurposedContent}
                disabled={isGenerating || selectedPlatforms.length === 0}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Repurposed Content
                  </>
                )}
              </button>
            </div>

            {/* Right Column - Generated Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Generated Content</h3>
              
              {repurposedContent.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Shuffle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Configure settings and generate content to see results</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {repurposedContent.map((item, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{platforms.find(p => p.id === item.platform)?.icon}</span>
                          <span className="font-medium capitalize">{item.platform}</span>
                          <span className="text-sm text-gray-500 capitalize">{item.content_type}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.scheduled_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {item.content_preview}
                      </div>
                      {item.caption && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Caption:</strong> {item.caption}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={handleSaveAll}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Add All to Calendar ({repurposedContent.length} items)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContentRepurposeModal;
