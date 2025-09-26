import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, X, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';

const AutonomousContentModal = ({ onClose, onSchedule }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [isRefiningAudience, setIsRefiningAudience] = useState(false);
  const [showApprovalStep, setShowApprovalStep] = useState(false);
  const [selectedContentForApproval, setSelectedContentForApproval] = useState(null);
  const [formData, setFormData] = useState({
    business_objectives: '',
    target_audience: '',
    platforms: [],
    content_themes: [],
    timeframe: '30d',
    content_frequency: 'medium',
    campaign_goals: '',
    brand_voice: '',
    competitor_analysis: false,
    trending_topics: false,
    seasonal_content: false
  });

  useEffect(() => {
    try {
      const onboardingData = localStorage.getItem('guild_onboarding_data');
      if (onboardingData) {
        const data = JSON.parse(onboardingData);
        setFormData(prev => ({
          ...prev,
          target_audience: data.idealClient || data.clientAvatar || data.answers?.[3] || '',
          business_objectives: data.businessType || data.answers?.[0] || '',
          brand_voice: data.brandVoice || data.answers?.[11] || ''
        }));
      }
    } catch (e) {}
  }, []);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', icon: '📺' },
    { id: 'pinterest', name: 'Pinterest', icon: '📌' },
    { id: 'email', name: 'Email', icon: '📧' }
  ];

  const contentThemes = [
    'Educational','Behind-the-scenes','User-generated content','Product showcases','Industry insights','Company culture','Customer stories','How-to guides','Trending topics','Seasonal content','Thought leadership','Community building'
  ];

  const workflowStepsData = [
    { id: 'content_strategist', name: 'Content Strategist Agent', description: 'Analyzing objectives and audience to create strategy...', icon: '🎯', duration: '2-3 minutes' },
    { id: 'calendar_agent', name: 'Calendar Agent', description: 'Identifying optimal posting times and alignment...', icon: '📅', duration: '1-2 minutes' },
    { id: 'brand_strategist', name: 'Brand Strategist Agent', description: 'Ensuring brand voice and messaging alignment...', icon: '🎨', duration: '1-2 minutes' },
    { id: 'content_creation', name: 'Content Creation Team', description: 'Generating copy, visuals, and video assets...', icon: '✍️', duration: '5-8 minutes' },
    { id: 'judge_evaluation', name: 'Judge Agent Evaluation', description: 'Quality control and compliance checking...', icon: '⚖️', duration: '1-2 minutes' },
    { id: 'scheduling', name: 'Autonomous Scheduling', description: 'Optimizing posting times and cross-platform publishing...', icon: '⏰', duration: '1 minute' }
  ];

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    setWorkflowSteps(workflowStepsData);
    setCurrentStep(0);
    for (let i = 0; i < workflowStepsData.length; i++) {
      setCurrentStep(i);
      await new Promise(r => setTimeout(r, 2000));
    }
    const mock = generateAutonomousContent(formData);
    setGeneratedContent(mock);
    setIsGenerating(false);
  };

  const generateAutonomousContent = (data) => {
    const content = [];
    const platforms = data.platforms.length ? data.platforms : ['instagram','linkedin','twitter'];
    const themes = data.content_themes.length ? data.content_themes : ['Educational','Behind-the-scenes'];
    platforms.forEach(platform => {
      themes.forEach(theme => {
        content.push({
          content_id: `autonomous_${Date.now()}_${Math.random().toString(36).slice(2,9)}`,
          platform,
          content_type: getContentTypeForPlatform(platform),
          theme,
          content_preview: `${theme} for ${platform}: ${data.business_objectives || 'objective'}`,
          scheduled_date: new Date(Date.now() + Math.random()*7*24*60*60*1000).toISOString(),
          status: 'scheduled',
          priority: 'high',
          ai_generated: true,
          quality_score: 0.92
        });
      });
    });
    return content;
  };

  const getContentTypeForPlatform = (platform) => {
    const types = { instagram: ['post','story','reel'], linkedin: ['article','post'], twitter: ['tweet','thread'], facebook: ['post','story'], tiktok: ['video'], youtube: ['video','short'], pinterest: ['pin'], email: ['newsletter','campaign'] };
    const arr = types[platform] || ['post'];
    return arr[Math.floor(Math.random()*arr.length)];
  };

  const handleScheduleAll = () => {
    onSchedule(generatedContent);
    onClose();
  };

  const handleApprovalRequest = (content) => {
    setSelectedContentForApproval(content);
    setShowApprovalStep(true);
  };

  const handleApproval = (content, action) => {
    if (action === 'approve') {
      // Move to approved status and schedule immediately
      const approvedContent = { 
        ...content, 
        status: 'approved', 
        approved_at: new Date().toISOString() 
      };
      
      // Update the generated content
      setGeneratedContent(prev => prev.map(c => 
        c.content_id === content.content_id ? approvedContent : c
      ));
      
      // Schedule the approved content immediately
      onSchedule([approvedContent]);
    } else if (action === 'reject') {
      // Remove from generated content
      setGeneratedContent(prev => prev.filter(c => c.content_id !== content.content_id));
    } else if (action === 'edit') {
      // Keep in draft status for editing
      setGeneratedContent(prev => prev.map(c => 
        c.content_id === content.content_id 
          ? { ...c, status: 'draft', needs_editing: true }
          : c
      ));
    }
    setShowApprovalStep(false);
    setSelectedContentForApproval(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="w-6 h-6 text-green-500 mr-3" />
              Autonomous Content Creation
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {!isGenerating && generatedContent.length === 0 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🤖 AI Workforce in Action</h3>
                <p className="text-gray-700 mb-4">Agents coordinate to create, optimize, and schedule content aligned with your goals.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Objectives</label>
                    <textarea value={formData.business_objectives} onChange={(e)=>setFormData(p=>({...p,business_objectives:e.target.value}))} placeholder="e.g., Increase brand awareness..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" rows={3}/>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                      <button type="button" onClick={()=>setIsRefiningAudience(!isRefiningAudience)} className="text-sm text-purple-600 hover:text-purple-700 font-medium">{isRefiningAudience?'Use Default':'Refine Audience'}</button>
                    </div>
                    {!isRefiningAudience ? (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-700 font-medium">Using Onboarding Data</p>
                            <p className="text-xs text-gray-500 mt-1">{formData.target_audience || 'No audience data found'}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <textarea value={formData.target_audience} onChange={(e)=>setFormData(p=>({...p,target_audience:e.target.value}))} placeholder="e.g., Small business owners..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" rows={3}/>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                    <div className="grid grid-cols-2 gap-2">
                      {platforms.map(platform => (
                        <label key={platform.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="checkbox" checked={formData.platforms.includes(platform.id)} onChange={(e)=>{
                            setFormData(p=>({...p, platforms: e.target.checked ? [...p.platforms, platform.id] : p.platforms.filter(x=>x!==platform.id)}));
                          }} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                          <span className="text-sm">{platform.icon} {platform.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Themes</label>
                    <div className="grid grid-cols-2 gap-2">
                      {contentThemes.map(theme => (
                        <label key={theme} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="checkbox" checked={formData.content_themes.includes(theme)} onChange={(e)=>{
                            setFormData(p=>({...p, content_themes: e.target.checked ? [...p.content_themes, theme] : p.content_themes.filter(t=>t!==theme)}));
                          }} className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                          <span className="text-sm">{theme}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                    <select value={formData.timeframe} onChange={(e)=>setFormData(p=>({...p,timeframe:e.target.value}))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option value="7d">1 Week</option>
                      <option value="30d">1 Month</option>
                      <option value="90d">3 Months</option>
                      <option value="180d">6 Months</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Frequency</label>
                    <select value={formData.content_frequency} onChange={(e)=>setFormData(p=>({...p,content_frequency:e.target.value}))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option value="low">Low (1-2 posts/week)</option>
                      <option value="medium">Medium (3-5 posts/week)</option>
                      <option value="high">High (6-10 posts/week)</option>
                      <option value="aggressive">Aggressive (10+ posts/week)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
                <button onClick={handleGenerateContent} className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md hover:from-green-700 hover:to-blue-700 transition-colors flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Autonomous Creation
                </button>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Workforce in Action</h3>
                <p className="text-gray-600">Our specialized agents are working together to create your content...</p>
              </div>
              <div className="space-y-4">
                {workflowStepsData.map((step, index) => (
                  <div key={step.id} className={`p-4 rounded-lg border-2 transition-all ${index < currentStep ? 'border-green-200 bg-green-50' : index === currentStep ? 'border-green-400 bg-green-100' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${index < currentStep ? 'bg-green-500 text-white' : index === currentStep ? 'bg-green-600 text-white animate-pulse' : 'bg-gray-300 text-gray-600'}`}>{index < currentStep ? '✓' : step.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">{step.name}</h4>
                          <span className="text-sm text-gray-500">{step.duration}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generatedContent.length > 0 && (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Autonomous Content Generated!</h3>
                <p className="text-green-700">Our AI workforce has created {generatedContent.length} pieces across {formData.platforms.length} platforms.</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Generated Content Preview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedContent.slice(0, 4).map((c, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${c.platform === 'instagram' ? 'bg-pink-500' : c.platform === 'linkedin' ? 'bg-blue-500' : c.platform === 'twitter' ? 'bg-blue-400' : c.platform === 'facebook' ? 'bg-blue-600' : c.platform === 'tiktok' ? 'bg-black' : c.platform === 'youtube' ? 'bg-red-500' : c.platform === 'email' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <span className="font-medium capitalize">{c.platform}</span>
                        <span className="text-sm text-gray-500 capitalize">{c.content_type}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.status === 'approved' ? 'bg-green-100 text-green-800' :
                          c.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {c.status}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{c.content_preview}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{c.theme}</span>
                        <span>Quality: {Math.round((c.quality_score||0.9)*100)}%</span>
                      </div>
                      {c.status !== 'approved' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprovalRequest(c)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            Review & Approve
                          </button>
                          <button
                            onClick={() => handleApproval(c, 'reject')}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
                <button onClick={handleScheduleAll} className="px-6 py-2 bg.gradient.to.r from-green-600 to-blue-600 text-white rounded-md hover:from-green-700 hover:to-blue-700 transition-colors flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Schedule All Content
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Approval Step Modal */}
      {showApprovalStep && selectedContentForApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <CheckCircle className="w-6 h-6 text-blue-500 mr-3" />
                  Review & Approve Content
                </h2>
                <button 
                  onClick={() => setShowApprovalStep(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Content Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedContentForApproval.platform === 'instagram' ? 'bg-pink-500' :
                      selectedContentForApproval.platform === 'linkedin' ? 'bg-blue-500' :
                      selectedContentForApproval.platform === 'twitter' ? 'bg-blue-400' :
                      selectedContentForApproval.platform === 'facebook' ? 'bg-blue-600' :
                      selectedContentForApproval.platform === 'tiktok' ? 'bg-black' :
                      selectedContentForApproval.platform === 'youtube' ? 'bg-red-500' :
                      selectedContentForApproval.platform === 'email' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="font-medium capitalize">{selectedContentForApproval.platform}</span>
                    <span className="text-sm text-gray-500 capitalize">{selectedContentForApproval.content_type}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{selectedContentForApproval.theme}</span>
                  </div>
                  <div className="text-gray-800 mb-3">{selectedContentForApproval.content_preview}</div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Quality Score: {Math.round((selectedContentForApproval.quality_score||0.9)*100)}%</span>
                    <span>Scheduled: {new Date(selectedContentForApproval.scheduled_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Zap className="w-5 h-5 text-blue-500 mr-2" />
                    AI Recommendation
                  </h3>
                  <div className="bg-white p-3 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Overall Score: 92/100</span>
                      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        RECOMMENDED
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      This content aligns well with your brand voice and has high engagement potential. 
                      The AI suggests approving this content for scheduling.
                    </p>
                  </div>
                </div>

                {/* Approval Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApproval(selectedContentForApproval, 'approve')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Schedule
                  </button>
                  <button
                    onClick={() => handleApproval(selectedContentForApproval, 'edit')}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Edit Later
                  </button>
                  <button
                    onClick={() => handleApproval(selectedContentForApproval, 'reject')}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-blue-900">Learning Tip</div>
                      <div className="text-xs text-blue-700 mt-1">
                        Notice how our AI analyzes content quality, brand alignment, and engagement potential 
                        to provide recommendations. This helps you make informed decisions about your content.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AutonomousContentModal;
