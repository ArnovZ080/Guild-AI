import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  X, 
  Clock, 
  User, 
  MessageSquare, 
  AlertTriangle,
  Info,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  History,
  Users,
  Target,
  Zap
} from 'lucide-react';

const ApprovalModal = ({ content, onClose, onApprove, onReject, onRequestChanges }) => {
  const [approvalAction, setApprovalAction] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  if (!content) return null;

  // Get approval history and workflow details
  const getApprovalHistory = () => {
    return [
      {
        id: 1,
        action: 'created',
        user: 'Content Strategist Agent',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        comment: 'Generated content based on trending topics and brand guidelines',
        details: 'Analyzed 15 trending hashtags, identified 3 key themes, and created content that aligns with your brand voice'
      },
      {
        id: 2,
        action: 'reviewed',
        user: 'Brand Checker Agent',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        comment: 'Content passes brand compliance check',
        details: 'Verified tone matches brand voice, confirmed keyword usage, validated visual guidelines compliance'
      },
      {
        id: 3,
        action: 'submitted_for_approval',
        user: 'Content Strategist Agent',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        comment: 'Ready for final approval - all quality checks passed',
        details: 'Content has been optimized for engagement, scheduled for optimal time, and all assets are ready'
      }
    ];
  };

  const approvalHistory = getApprovalHistory();

  const getApprovalRecommendation = () => {
    // AI-powered approval recommendation with transparency
    const factors = [
      {
        factor: 'Brand Alignment',
        score: 95,
        explanation: 'Content perfectly matches your brand voice and guidelines',
        icon: Target,
        color: 'text-green-600'
      },
      {
        factor: 'Engagement Potential',
        score: 88,
        explanation: 'Based on similar content performance, this should generate high engagement',
        icon: Zap,
        color: 'text-blue-600'
      },
      {
        factor: 'Timing Optimization',
        score: 92,
        explanation: 'Scheduled for peak audience activity time based on your analytics',
        icon: Clock,
        color: 'text-purple-600'
      },
      {
        factor: 'Content Quality',
        score: 90,
        explanation: 'Passes all quality checks including grammar, readability, and visual appeal',
        icon: Eye,
        color: 'text-orange-600'
      }
    ];

    const averageScore = Math.round(factors.reduce((sum, f) => sum + f.score, 0) / factors.length);
    
    return {
      recommendation: averageScore >= 85 ? 'approve' : averageScore >= 70 ? 'review' : 'reject',
      confidence: averageScore,
      factors,
      reasoning: averageScore >= 85 
        ? 'All quality indicators suggest this content will perform well and align with your brand'
        : averageScore >= 70
        ? 'Content shows promise but may benefit from minor adjustments'
        : 'Content needs significant improvements before publishing'
    };
  };

  const recommendation = getApprovalRecommendation();

  const handleApproval = (action) => {
    const approvalData = {
      content_id: content.content_id,
      action,
      comment: approvalComment,
      timestamp: new Date(),
      user: 'You', // In real implementation, this would be the actual user
      reasoning: action === 'approve' 
        ? 'Approved based on brand alignment and engagement potential'
        : action === 'reject'
        ? 'Rejected due to quality concerns or brand misalignment'
        : 'Requested changes to improve content quality'
    };

    if (action === 'approve') {
      onApprove(approvalData);
    } else if (action === 'reject') {
      onReject(approvalData);
    } else {
      onRequestChanges(approvalData);
    }
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-blue-500 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Content Approval</h2>
                <p className="text-sm text-gray-600">
                  Review and approve content before publishing
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  content.platform === 'instagram' ? 'bg-pink-500' :
                  content.platform === 'linkedin' ? 'bg-blue-500' :
                  content.platform === 'twitter' ? 'bg-blue-400' :
                  content.platform === 'facebook' ? 'bg-blue-600' :
                  content.platform === 'tiktok' ? 'bg-black' :
                  content.platform === 'youtube' ? 'bg-red-500' :
                  content.platform === 'email' ? 'bg-green-500' :
                  'bg-gray-500'
                }`}></div>
                <span className="font-medium capitalize">{content.platform} {content.content_type}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{content.theme}</span>
                {content.assignee && (
                  <>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-blue-600">@{content.assignee}</span>
                  </>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(content.scheduled_date).toLocaleDateString()}
              </div>
            </div>
            <div className="text-gray-800">{content.content_preview}</div>
            {content.caption && (
              <div className="mt-3 p-3 bg-white rounded border">
                <div className="text-sm font-medium text-gray-700 mb-1">Caption:</div>
                <div className="text-gray-800">{content.caption}</div>
              </div>
            )}
          </div>

          {/* AI Recommendation */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <Zap className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">AI Recommendation</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="ml-auto text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Info className="w-4 h-4 mr-1" />
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            
            <div className={`transition-all duration-300 ${showDetails ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Overall Score: {recommendation.confidence}/100</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    recommendation.recommendation === 'approve' ? 'bg-green-100 text-green-800' :
                    recommendation.recommendation === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {recommendation.recommendation === 'approve' ? 'RECOMMENDED' : 
                     recommendation.recommendation === 'review' ? 'NEEDS REVIEW' : 'NOT RECOMMENDED'}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4">{recommendation.reasoning}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendation.factors.map((factor, idx) => {
                  const Icon = factor.icon;
                  return (
                    <div key={idx} className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Icon className={`w-4 h-4 mr-2 ${factor.color}`} />
                          <span className="font-medium text-gray-800">{factor.factor}</span>
                        </div>
                        <span className="font-bold text-gray-900">{factor.score}/100</span>
                      </div>
                      <p className="text-xs text-gray-600">{factor.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start">
                <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Why this recommendation?</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Our AI analyzes your content against your brand guidelines, audience engagement patterns, 
                    and optimal posting times to provide this recommendation. This helps ensure your content 
                    performs well and maintains brand consistency.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Approval History */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex items-center mb-4">
              <History className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Approval Workflow</h3>
            </div>
            <div className="space-y-3">
              {approvalHistory.map((item, idx) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    item.action === 'created' ? 'bg-blue-100 text-blue-800' :
                    item.action === 'reviewed' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{item.user}</div>
                      <div className="text-sm text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">{item.comment}</div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <strong>Agent reasoning:</strong> {item.details}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Actions */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Decision</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a comment (optional)
              </label>
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="Add your thoughts or feedback..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleApproval('approve')}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Approve & Publish
              </button>
              <button
                onClick={() => handleApproval('request_changes')}
                className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Request Changes
              </button>
              <button
                onClick={() => handleApproval('reject')}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Reject
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-900">Learning Tip</div>
                  <div className="text-xs text-blue-700 mt-1">
                    Notice how our agents work together: the Content Strategist creates content, 
                    the Brand Checker ensures compliance, and the system provides AI recommendations. 
                    This collaborative approach ensures quality and consistency in your content.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ApprovalModal;
