import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, X, CheckCircle, Calendar, Eye, Edit, Trash2, Send, Clock } from 'lucide-react';
import ConfidenceScore from '../shared/ConfidenceScore';
import AIRecommendations from '../shared/AIRecommendations';

const ContentDetailsModal = ({ 
  content, 
  onClose, 
  onRepurpose,
  onPublish,
  onSchedule,
  onEdit,
  onDelete,
  onDraft
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!content) return null;

  const handleAction = (action) => {
    switch (action) {
      case 'publish':
        if (onPublish) onPublish(content);
        break;
      case 'schedule':
        if (onSchedule) onSchedule(content);
        break;
      case 'edit':
        if (onEdit) onEdit(content);
        break;
      case 'delete':
        if (onDelete) onDelete(content);
        break;
      case 'draft':
        setIsProcessing(true);
        if (onDraft) onDraft(content);
        // Show success feedback
        setTimeout(() => {
          setIsProcessing(false);
        }, 1500);
        break;
      case 'repurpose':
        if (onRepurpose) onRepurpose(content);
        break;
      default:
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Content Details</h2>
                <p className="text-sm text-gray-600 capitalize">
                  {content.platform} • {content.content_type} • {content.status}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overall Confidence Score */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Overall Confidence Score</h3>
              <ConfidenceScore score={content.confidence_score || 0.85} size="large" />
            </div>
            <p className="text-sm text-gray-600">
              This score represents the AI's confidence in this content's potential performance based on brand alignment, audience fit, and trending relevance.
            </p>
          </div>

          {/* Post Preview */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-500" />
              Post Preview
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {/* Platform Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {content.platform === 'instagram' && '📸'}
                    {content.platform === 'linkedin' && '💼'}
                    {content.platform === 'twitter' && '🐦'}
                    {content.platform === 'facebook' && '📘'}
                    {content.platform === 'tiktok' && '🎵'}
                    {content.platform === 'youtube' && '📺'}
                    {content.platform === 'email' && '📧'}
                    {content.platform === 'blog' && '📝'}
                  </span>
                  <span className="font-medium capitalize">{content.platform}</span>
                  <span className="text-sm text-gray-500 capitalize">{content.content_type}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {content.scheduled_date ? new Date(content.scheduled_date).toLocaleDateString() : 'Draft'}
                </div>
              </div>
              
              {/* Content Preview */}
              <div className="text-gray-800">
                {content.content_preview}
              </div>
              
              {/* Caption */}
              {content.caption && (
                <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                  {content.caption}
                </div>
              )}
              
              {/* Hashtags */}
              {content.hashtags && (
                <div className="text-sm text-blue-600">
                  {content.hashtags}
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics (Confidence Breakdown) */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((content.brand_alignment || 0.92) * 100)}%
                </div>
                <div className="text-xs text-gray-600">Brand Alignment</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((content.audience_fit || 0.78) * 100)}%
                </div>
                <div className="text-xs text-gray-600">Audience Fit</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((content.trending_relevance || 0.88) * 100)}%
                </div>
                <div className="text-xs text-gray-600">Trending Relevance</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {content.engagement_prediction || 'High'}
                </div>
                <div className="text-xs text-gray-600">Engagement Prediction</div>
              </div>
            </div>
          </div>

          {/* AI Annotations */}
          <div>
            <AIRecommendations 
              content={content} 
              showDetails={true} 
              defaultExpanded={true}
            />
          </div>

          {/* Performance Data (if available) */}
          {(content.engagement_rate || content.reach || content.impressions) && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Data</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {content.engagement_rate !== undefined && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">{content.engagement_rate}%</div>
                    <div className="text-xs text-gray-600">Engagement Rate</div>
                  </div>
                )}
                {content.reach !== undefined && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">{content.reach?.toLocaleString?.() || content.reach}</div>
                    <div className="text-xs text-gray-600">Reach</div>
                  </div>
                )}
                {content.impressions !== undefined && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">{content.impressions?.toLocaleString?.() || content.impressions}</div>
                    <div className="text-xs text-gray-600">Impressions</div>
                  </div>
                )}
                {content.clicks !== undefined && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">{content.clicks?.toLocaleString?.() || content.clicks}</div>
                    <div className="text-xs text-gray-600">Clicks</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Menu at Bottom */}
        <div className="border-t p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAction('publish')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                disabled={content.status === 'published'}
              >
                <Send className="w-4 h-4 mr-2" />
                Publish
              </button>
              <button
                onClick={() => handleAction('schedule')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </button>
              <button
                onClick={() => handleAction('draft')}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  isProcessing 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                } disabled:opacity-75`}
              >
                {isProcessing ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Moved to Draft
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Draft
                  </>
                )}
              </button>
              <button
                onClick={() => handleAction('edit')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => handleAction('repurpose')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Repurpose
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAction('delete')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContentDetailsModal;
