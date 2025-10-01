import React, { useState } from 'react';
import { X, Sparkles, Image, Wand2, RefreshCw, Download, Loader } from 'lucide-react';

const GenerateImageModal = ({ onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('professional');
  const [mood, setMood] = useState('neutral');
  const [platform, setPlatform] = useState('general');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  const styles = [
    { value: 'professional', label: 'Professional', description: 'Clean, modern, business-appropriate' },
    { value: 'artistic', label: 'Artistic', description: 'Creative, expressive, unique' },
    { value: 'modern', label: 'Modern', description: 'Contemporary, sleek, minimalist' },
    { value: 'vintage', label: 'Vintage', description: 'Retro, classic, timeless' }
  ];

  const moods = [
    { value: 'neutral', label: 'Neutral', description: 'Balanced, professional' },
    { value: 'energetic', label: 'Energetic', description: 'Dynamic, vibrant, exciting' },
    { value: 'calm', label: 'Calm', description: 'Peaceful, serene, relaxing' },
    { value: 'dramatic', label: 'Dramatic', description: 'Bold, striking, impactful' }
  ];

  const platforms = [
    { value: 'general', label: 'General', dimensions: '1024x1024' },
    { value: 'linkedin', label: 'LinkedIn', dimensions: '1200x627' },
    { value: 'instagram', label: 'Instagram', dimensions: '1080x1080' },
    { value: 'twitter', label: 'Twitter', dimensions: '1200x675' },
    { value: 'facebook', label: 'Facebook', dimensions: '1200x630' }
  ];

  const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '4:3', label: 'Standard (4:3)' }
  ];

  const examplePrompts = [
    "Professional business team collaborating in modern office",
    "Abstract geometric shapes representing growth and innovation",
    "Minimalist product showcase on clean white background",
    "Vibrant social media graphic with bold colors and text space",
    "Serene nature scene with professional overlay space"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt describing the image you want');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Call the image generation agent via API
      const response = await fetch('/api/agents/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visual_request: {
            prompt: prompt,
            style: style,
            mood: mood,
            platform: platform,
            aspect_ratio: aspectRatio
          },
          brand_guidelines: {
            // This would come from user's stored brand guidelines
            style: 'corporate',
            colors: ['#1E3A8A', '#3B82F6', '#FFFFFF']
          },
          target_audience: {
            // This would come from user's profile
            demographics: 'professionals',
            preferences: 'clean, modern design'
          },
          content_context: {
            purpose: 'marketing',
            use_case: 'social_media'
          },
          technical_requirements: {
            platform: platform,
            aspect_ratio: aspectRatio
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      
      // Set the generated image
      setGeneratedImage({
        url: data.image_path || data.url,
        prompt: prompt,
        style: style,
        mood: mood,
        platform: platform,
        name: `AI Generated Image - ${new Date().toLocaleString()}`,
        description: prompt,
        metadata: data
      });

    } catch (error) {
      console.error('Error generating image:', error);
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveImage = () => {
    if (generatedImage) {
      onGenerate(generatedImage);
    }
  };

  const handleUseExamplePrompt = (examplePrompt) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Image Generator</h2>
                <p className="text-purple-100 text-sm">Powered by Image Generation Agent</p>
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
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Description *
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                
                {/* Example Prompts */}
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-2">Try these examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUseExamplePrompt(example)}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-200 transition-colors"
                      >
                        {example.substring(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>
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
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        style === s.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{s.label}</div>
                      <div className="text-xs text-gray-600">{s.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood & Atmosphere
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {moods.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        mood === m.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{m.label}</div>
                      <div className="text-xs text-gray-600">{m.description}</div>
                    </button>
                  ))}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {platforms.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label} ({p.dimensions})
                    </option>
                  ))}
                </select>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {aspectRatios.map(ar => (
                    <button
                      key={ar.value}
                      onClick={() => setAspectRatio(ar.value)}
                      className={`p-2 border-2 rounded-lg text-xs transition-all ${
                        aspectRatio === ar.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {ar.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Generating Image...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Image
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
                    <Loader className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-spin" />
                    <p className="text-gray-600">Generating your image...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take 20-30 seconds</p>
                  </div>
                ) : generatedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={generatedImage.url}
                      alt={generatedImage.description}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <button
                        onClick={() => setGeneratedImage(null)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        title="Clear"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={handleSaveImage}
                        className="p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                        title="Save to Library"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <Image className="w-16 h-16 mx-auto mb-4" />
                    <p>Your generated image will appear here</p>
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
                  Pro Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Be specific about what you want in the image</li>
                  <li>• Include details about colors, composition, and mood</li>
                  <li>• Mention the setting or environment</li>
                  <li>• Use style keywords like "professional", "modern", or "minimalist"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            {generatedImage && (
              <button
                onClick={handleSaveImage}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Save to Library
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateImageModal;

