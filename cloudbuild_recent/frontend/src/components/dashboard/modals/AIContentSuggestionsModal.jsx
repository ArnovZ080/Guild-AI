import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, TrendingUp, Calendar, Target, Users, Hash, Clock, Zap } from 'lucide-react';
import ConfidenceScore from '../shared/ConfidenceScore';
import AIRecommendations from '../shared/AIRecommendations';
import { ContentIntelligenceAPIService } from '../../../services/contentIntelligenceApi';
import EvaluatorRubricDrawer from '../shared/EvaluatorRubricDrawer.jsx';

const AIContentSuggestionsModal = ({ onClose, onSchedule }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedContent, setSuggestedContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState([]);
  const [generationSettings, setGenerationSettings] = useState({
    timeframe: '7d',
    platforms: ['instagram', 'linkedin', 'twitter'],
    contentTypes: ['trending', 'educational', 'behind_scenes'],
    quantity: 10,
    includeTrending: true,
    includeSeasonal: true,
    includeIndustry: true
  });
  const [rubric, setRubric] = useState(null);
  const [showRubric, setShowRubric] = useState(false);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', icon: '📺' },
    { id: 'email', name: 'Email', icon: '📧' }
  ];

  const contentTypes = [
    { id: 'trending', name: 'Trending Topics', icon: TrendingUp, description: 'Hot topics in your industry' },
    { id: 'educational', name: 'Educational', icon: Target, description: 'How-to guides and tips' },
    { id: 'behind_scenes', name: 'Behind the Scenes', icon: Users, description: 'Company culture content' },
    { id: 'promotional', name: 'Promotional', icon: Hash, description: 'Product and service highlights' },
    { id: 'seasonal', name: 'Seasonal', icon: Calendar, description: 'Holiday and seasonal content' },
    { id: 'industry', name: 'Industry Insights', icon: Sparkles, description: 'Thought leadership content' }
  ];

  const generateContentSuggestions = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI agent calls
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockSuggestions = [
        {
          id: 'suggestion_1',
          platform: 'instagram',
          content_type: 'post',
          theme: 'trending',
          content_preview: 'AI automation is revolutionizing small businesses! 🤖✨ Share your thoughts on how AI has changed your workflow.',
          caption: 'The future of work is here! 💼 What AI tools are you using in your business? #AI #Automation #SmallBusiness',
          scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          suggested_by: 'trending_agent',
          confidence_score: 0.95,
          trending_keywords: ['AI automation', 'small business', 'workflow'],
          engagement_prediction: 'High'
        },
        {
          id: 'suggestion_2',
          platform: 'linkedin',
          content_type: 'post',
          theme: 'educational',
          content_preview: '5 AI tools that every entrepreneur should know about in 2024',
          caption: '🚀 Ready to supercharge your business? Here are 5 AI tools that are game-changers for entrepreneurs:\n\n1. ChatGPT for content creation\n2. Midjourney for visual assets\n3. Zapier for automation\n4. Notion AI for organization\n5. Grammarly for writing\n\nWhat AI tools are you using? Share in the comments! 👇',
          scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          suggested_by: 'content_strategist',
          confidence_score: 0.88,
          trending_keywords: ['AI tools', 'entrepreneur', '2024'],
          engagement_prediction: 'Medium'
        },
        {
          id: 'suggestion_3',
          platform: 'twitter',
          content_type: 'tweet',
          theme: 'industry',
          content_preview: 'The biggest mistake I see entrepreneurs make with AI? Using it as a replacement instead of an enhancement.',
          caption: 'The biggest mistake I see entrepreneurs make with AI? Using it as a replacement instead of an enhancement. \n\nAI should amplify your human skills, not replace them. 🤝\n\n#AI #Entrepreneurship #Productivity',
          scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          suggested_by: 'industry_agent',
          confidence_score: 0.92,
          trending_keywords: ['entrepreneurs', 'AI', 'productivity'],
          engagement_prediction: 'High'
        },
        {
          id: 'suggestion_4',
          platform: 'instagram',
          content_type: 'story',
          theme: 'behind_scenes',
          content_preview: 'Behind the scenes: How our team uses AI to create content',
          caption: 'Behind the scenes: How our team uses AI to create content 📱✨ Swipe to see our process! #BehindTheScenes #AI #ContentCreation',
          scheduled_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          suggested_by: 'content_strategist',
          confidence_score: 0.85,
          trending_keywords: ['behind the scenes', 'AI', 'content creation'],
          engagement_prediction: 'Medium'
        },
        {
          id: 'suggestion_5',
          platform: 'youtube',
          content_type: 'short',
          theme: 'educational',
          content_preview: '60-second guide: How to use AI for social media content',
          caption: '60-second guide: How to use AI for social media content 🎬 Perfect for busy entrepreneurs! #Shorts #AI #SocialMedia #QuickTips',
          scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          suggested_by: 'video_agent',
          confidence_score: 0.90,
          trending_keywords: ['AI', 'social media', 'quick tips'],
          engagement_prediction: 'High'
        },
        {
          id: 'suggestion_6',
          platform: 'email',
          content_type: 'newsletter',
          theme: 'industry',
          content_preview: 'Weekly AI Roundup: Latest tools and trends for entrepreneurs',
          caption: '📧 Weekly AI Roundup: Latest tools and trends for entrepreneurs\n\nThis week we cover:\n• New AI tools for productivity\n• Industry insights\n• Success stories\n• Upcoming trends\n\nRead more in our newsletter!',
          scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          suggested_by: 'newsletter_agent',
          confidence_score: 0.87,
          trending_keywords: ['AI tools', 'productivity', 'entrepreneurs'],
          engagement_prediction: 'Medium'
        }
      ];

      // Filter based on selected platforms
      const filteredSuggestions = mockSuggestions.filter(suggestion => 
        generationSettings.platforms.includes(suggestion.platform)
      );

      setSuggestedContent(filteredSuggestions);
    } catch (error) {
      console.error('Content generation failed:', error);
      alert('Failed to generate content suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContentToggle = (contentId) => {
    setSelectedContent(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedContent(suggestedContent.map(item => item.id));
  };

  const handleDeselectAll = () => {
    setSelectedContent([]);
  };

  const handleScheduleSelected = async () => {
    const selectedItems = suggestedContent.filter(item => selectedContent.includes(item.id));

    const calendarItems = selectedItems.map(item => ({
      content_id: `ai_suggestion_${Date.now()}_${Math.random().toString(36).slice(2,9)}`,
      platform: item.platform,
      content_type: item.content_type,
      theme: item.theme,
      content_preview: item.content_preview,
      caption: item.caption,
      scheduled_date: item.scheduled_date,
      scheduled_timezone: 'UTC',
      status: 'draft',
      priority: 'medium',
      assignee: 'AI Agent',
      ai_generated: true,
      suggested_by: item.suggested_by,
      confidence_score: item.confidence_score,
      created_at: new Date().toISOString()
    }));

    try {
      const api = new ContentIntelligenceAPIService();
      // Fetch Business Profile for brand guidelines (if available)
      let profile = null;
      try {
        const res = await fetch('/api/profile');
        const json = await res.json();
        profile = json?.data || null;
      } catch {}

      // Judge Layer gating via /content/create API
      const judgePayload = {
        brief: {
          objective: 'Schedule AI content suggestions',
          goals: { engagement: 'increase', consistency: true },
          audience: profile?.ideal_client ? { description: profile.ideal_client } : undefined,
          topic: 'Content calendar fill',
        },
        platforms: Array.from(new Set(calendarItems.map(i => i.platform))),
        brand: profile ? { voice: profile.brand_voice, colors: profile.brand_colors, guidelines: profile.guidelines } : undefined
      };
      const judgeResult = await api.createContent(judgePayload);
      const approved = judgeResult?.data?.approved !== false;
      if (!approved) {
        setRubric(judgeResult?.data || {});
        setShowRubric(true);
        return;
      }

      const requiredPlatforms = Array.from(new Set(calendarItems.map(i => i.platform)));
      const result = await api.scheduleContent({
        items: calendarItems,
        required_platforms: requiredPlatforms,
        // connected_platforms: pass from state when available
      });

      if (!result || result?.success === false) {
        const detail = result?.detail || {};
        if (detail?.missing_credentials) {
          const entries = Object.entries(detail.missing_credentials).map(([p, vars]) => `${p}: ${vars.join(', ')}`).join('\n');
          alert(`Missing credentials for scheduling:\n${entries}\n\nGo to Connections to configure.`);
        } else {
          alert('Scheduling failed. Please ensure your platform connections are set up in Connections.');
        }
        return;
      }

      if (onSchedule) {
        onSchedule(calendarItems);
      }
      // Notify server to broadcast calendar update
      try {
        await fetch('/content/calendar/update', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: calendarItems })
        });
      } catch {}
      onClose();
    } catch (e) {
      alert('Could not schedule content. Please check Connections and try again.');
    }
  };

  const getEngagementColor = (prediction) => {
    switch (prediction) {
      case 'High': return 'text-green-700 bg-green-100 border-green-200';
      case 'Medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'Low': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

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
            <Sparkles className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Content Suggestions</h2>
              <p className="text-sm text-gray-600">Let AI fill your calendar with trending, engaging content</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Settings */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Generation Settings</h3>
                
                {/* Timeframe */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                  <select
                    value={generationSettings.timeframe}
                    onChange={(e) => setGenerationSettings(prev => ({ ...prev, timeframe: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="3d">Next 3 days</option>
                    <option value="7d">Next week</option>
                    <option value="14d">Next 2 weeks</option>
                    <option value="30d">Next month</option>
                  </select>
                </div>

                {/* Platforms */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                  <div className="space-y-2">
                    {platforms.map(platform => (
                      <label key={platform.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={generationSettings.platforms.includes(platform.id)}
                          onChange={(e) => {
                            const platforms = generationSettings.platforms;
                            if (e.target.checked) {
                              setGenerationSettings(prev => ({ ...prev, platforms: [...platforms, platform.id] }));
                            } else {
                              setGenerationSettings(prev => ({ ...prev, platforms: platforms.filter(p => p !== platform.id) }));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm">{platform.icon} {platform.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Content Types */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Types</label>
                  <div className="space-y-2">
                    {contentTypes.map(type => (
                      <label key={type.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={generationSettings.contentTypes.includes(type.id)}
                          onChange={(e) => {
                            const types = generationSettings.contentTypes;
                            if (e.target.checked) {
                              setGenerationSettings(prev => ({ ...prev, contentTypes: [...types, type.id] }));
                            } else {
                              setGenerationSettings(prev => ({ ...prev, contentTypes: types.filter(t => t !== type.id) }));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <type.icon className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{type.name}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateContentSuggestions}
                  disabled={isGenerating || generationSettings.platforms.length === 0}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Suggestions...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate AI Suggestions
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Generated Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Generated Suggestions Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Generated Suggestions</h3>
                {suggestedContent.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Deselect All
                    </button>
                    <span className="text-sm text-gray-500">
                      {selectedContent.length} selected
                    </span>
                  </div>
                )}
              </div>

              {/* Platform Distribution Summary */}
              {suggestedContent.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Platform Distribution</h4>
                  <div className="flex flex-wrap gap-2">
                    {platforms.filter(p => suggestedContent.some(s => s.platform === p.id)).map(platform => {
                      const count = suggestedContent.filter(s => s.platform === platform.id).length;
                      return (
                        <div key={platform.id} className="flex items-center space-x-1 px-2 py-1 bg-white rounded-md border">
                          <span>{platform.icon}</span>
                          <span className="text-sm font-medium">{platform.name}</span>
                          <span className="text-xs text-gray-500">({count})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Content Suggestions */}
              {suggestedContent.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Configure settings and generate suggestions to see AI-recommended content</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestedContent.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedContent.includes(item.id) ? 'border-purple-300 bg-purple-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleContentToggle(item.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedContent.includes(item.id)}
                            onChange={() => handleContentToggle(item.id)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-lg">{platforms.find(p => p.id === item.platform)?.icon}</span>
                          <span className="font-medium capitalize">{item.platform}</span>
                          <span className="text-sm text-gray-500 capitalize">{item.content_type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ConfidenceScore score={item.confidence_score} size="small" showDetails={false} />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEngagementColor(item.engagement_prediction)}`}>
                            {item.engagement_prediction} engagement
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-2">
                        {item.content_preview}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center space-x-4">
                          <span>📅 {new Date(item.scheduled_date).toLocaleDateString()}</span>
                          <span>🤖 {item.suggested_by.replace('_', ' ')}</span>
                          <span>📊 {item.trending_keywords.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>
                      
                      {/* AI Recommendations for this content */}
                      <AIRecommendations 
                        content={item} 
                        showDetails={true} 
                        defaultExpanded={false}
                        className="mt-3"
                      />
                    </div>
                  ))}
                  
                  {selectedContent.length > 0 && (
                    <button
                      onClick={handleScheduleSelected}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Selected ({selectedContent.length} items)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      <EvaluatorRubricDrawer open={showRubric} onClose={()=>setShowRubric(false)} data={rubric} />
    </div>
  );
};

export default AIContentSuggestionsModal;
