import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Search, 
  Eye, 
  Download, 
  Share, 
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Folder,
  File,
  Image,
  Video,
  Music,
  Archive,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Zap
} from 'lucide-react';

// Mock document data with autonomous processing capabilities
const mockDocuments = [
  {
    id: '1',
    name: 'Q1 Business Plan 2024',
    type: 'pdf',
    size: '2.4 MB',
    uploadDate: new Date(2024, 0, 10),
    lastModified: new Date(2024, 0, 12),
    status: 'processed',
    category: 'business',
    tags: ['business-plan', 'q1', 'strategy'],
    processedBy: 'Document Processing Agent',
    aiInsights: {
      summary: 'Comprehensive business plan covering market analysis, financial projections, and growth strategies',
      keyPoints: ['Market expansion planned', 'Revenue target: $2M', 'Team growth: 15 new hires'],
      recommendations: ['Consider automation tools', 'Review pricing strategy', 'Expand to new markets'],
      confidence: 0.95
    },
    dataRoom: 'Business Strategy',
    accessLevel: 'confidential',
    version: '2.1',
    collaborators: ['Strategy Agent', 'Financial Agent', 'CEO'],
    autoActions: [
      { action: 'Extract financial data', status: 'completed', agent: 'Financial Agent' },
      { action: 'Generate executive summary', status: 'completed', agent: 'Brief Generator Agent' },
      { action: 'Create action items', status: 'completed', agent: 'Task Manager Agent' }
    ]
  },
  {
    id: '2',
    name: 'Customer Feedback Analysis',
    type: 'xlsx',
    size: '856 KB',
    uploadDate: new Date(2024, 0, 8),
    lastModified: new Date(2024, 0, 11),
    status: 'processing',
    category: 'analytics',
    tags: ['customer-feedback', 'analysis', 'insights'],
    processedBy: 'Data Enrichment Agent',
    aiInsights: {
      summary: 'Customer feedback data showing 87% satisfaction rate with key improvement areas identified',
      keyPoints: ['87% satisfaction rate', 'Response time needs improvement', 'Product quality praised'],
      recommendations: ['Improve response time', 'Address pricing concerns', 'Enhance support system'],
      confidence: 0.88
    },
    dataRoom: 'Customer Insights',
    accessLevel: 'internal',
    version: '1.3',
    collaborators: ['Customer Success Agent', 'Analytics Agent'],
    autoActions: [
      { action: 'Analyze sentiment', status: 'completed', agent: 'Sentiment Analysis Agent' },
      { action: 'Generate insights', status: 'in-progress', agent: 'Data Analyst Agent' },
      { action: 'Create recommendations', status: 'pending', agent: 'Strategy Agent' }
    ]
  },
  {
    id: '3',
    name: 'Marketing Campaign Assets',
    type: 'folder',
    size: '45.2 MB',
    uploadDate: new Date(2024, 0, 5),
    lastModified: new Date(2024, 0, 12),
    status: 'processed',
    category: 'marketing',
    tags: ['marketing', 'campaign', 'assets'],
    processedBy: 'Content Strategist Agent',
    aiInsights: {
      summary: 'Comprehensive marketing campaign assets including visuals, copy, and strategy documents',
      keyPoints: ['15 visual assets', '8 copy variations', 'Multi-platform strategy'],
      recommendations: ['A/B test variations', 'Optimize for mobile', 'Track engagement metrics'],
      confidence: 0.92
    },
    dataRoom: 'Marketing Campaigns',
    accessLevel: 'team',
    version: '3.0',
    collaborators: ['Marketing Agent', 'Design Agent', 'Copywriter Agent'],
    autoActions: [
      { action: 'Optimize images', status: 'completed', agent: 'Image Generation Agent' },
      { action: 'Generate variations', status: 'completed', agent: 'Ad Copy Agent' },
      { action: 'Schedule posts', status: 'completed', agent: 'Social Media Agent' }
    ],
    children: [
      { id: '3a', name: 'Hero Banner.png', type: 'image', size: '2.1 MB' },
      { id: '3b', name: 'Email Template.html', type: 'html', size: '156 KB' },
      { id: '3c', name: 'Social Media Posts.docx', type: 'docx', size: '1.2 MB' }
    ]
  },
  {
    id: '4',
    name: 'Legal Contract Template',
    type: 'docx',
    size: '1.8 MB',
    uploadDate: new Date(2024, 0, 3),
    lastModified: new Date(2024, 0, 9),
    status: 'reviewed',
    category: 'legal',
    tags: ['legal', 'contract', 'template'],
    processedBy: 'Legal Agent',
    aiInsights: {
      summary: 'Standard legal contract template with compliance checks and risk assessment completed',
      keyPoints: ['Compliance verified', 'Risk level: Low', 'Standard terms included'],
      recommendations: ['Review annually', 'Update for new regulations', 'Consider jurisdiction-specific terms'],
      confidence: 0.97
    },
    dataRoom: 'Legal Documents',
    accessLevel: 'confidential',
    version: '4.2',
    collaborators: ['Legal Agent', 'Compliance Agent'],
    autoActions: [
      { action: 'Compliance check', status: 'completed', agent: 'Legal Agent' },
      { action: 'Risk assessment', status: 'completed', agent: 'Risk Assessment Agent' },
      { action: 'Generate variations', status: 'completed', agent: 'Contract Compiler Agent' }
    ]
  },
  {
    id: '5',
    name: 'Product Demo Video',
    type: 'mp4',
    size: '128.5 MB',
    uploadDate: new Date(2024, 0, 7),
    lastModified: new Date(2024, 0, 7),
    status: 'processed',
    category: 'media',
    tags: ['demo', 'video', 'product'],
    processedBy: 'Video Editor Agent',
    aiInsights: {
      summary: 'Product demonstration video with automatic transcription and key moment extraction',
      keyPoints: ['5:32 duration', 'Key features highlighted', 'Call-to-action included'],
      recommendations: ['Add captions', 'Create shorter versions', 'Optimize for mobile'],
      confidence: 0.89
    },
    dataRoom: 'Product Assets',
    accessLevel: 'public',
    version: '1.0',
    collaborators: ['Video Editor Agent', 'Product Agent'],
    autoActions: [
      { action: 'Generate transcript', status: 'completed', agent: 'Voice Agent' },
      { action: 'Extract key moments', status: 'completed', agent: 'Video Editor Agent' },
      { action: 'Create thumbnails', status: 'completed', agent: 'Image Generation Agent' }
    ]
  }
];

const DocumentsView = () => {
  const [documents, setDocuments] = useState(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDataRoom, setFilterDataRoom] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('lastModified');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Handler functions
  const handleViewDocument = (document) => {
    // Original behavior placeholder
    alert(`Document Viewer: Opening "${document.name}"\n\nType: ${document.type.toUpperCase()}\nSize: ${document.size}\nVersion: ${document.version}`);
  };

  const handleDownloadDocument = async (document, format = 'original') => {
    setShowDownloadOptions(false);
    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(document.id)}/export?format=${encodeURIComponent(format)}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = `${(document.name || 'document').replace(/\s+/g, '_')}.${format === 'original' ? 'bin' : format}`;
      a.click();
      window.URL.revokeObjectURL(a.href);
    } catch {}
  };

  const handleShareDocument = (document) => {
    setSelectedDocument(document);
    setShowShareModal(true);
  };

  const handleReanalyzeDocument = async (document) => {
    try {
      const res = await fetch('/api/agents/judge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaign: { document_id: document.id, path: document.name } }) });
      if (res.ok) setAnalysis(await res.json());
    } catch {}
  };

  const handleAcceptRecommendations = async (document) => {
    try {
      const recs = (analysis?.feedback || document.aiInsights?.recommendations || []).map(t => ({ action: 'apply_feedback', text: t }));
      await fetch('/api/agents/orchestrate/launch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ document_id: document.id, workflow_id: document.workflowId, recommendations: recs }) });
    } catch {}
  };

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
      const matchesDataRoom = filterDataRoom === 'all' || doc.dataRoom === filterDataRoom;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesDataRoom;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = parseFloat(a.size) - parseFloat(b.size);
          break;
        case 'uploadDate':
          comparison = new Date(a.uploadDate) - new Date(b.uploadDate);
          break;
        case 'lastModified':
          comparison = new Date(a.lastModified) - new Date(b.lastModified);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Get file type icon
  const getFileTypeIcon = (type) => {
    const icons = {
      pdf: FileText,
      docx: FileText,
      xlsx: FileText,
      pptx: FileText,
      txt: FileText,
      html: FileText,
      mp4: Video,
      mp3: Music,
      jpg: Image,
      png: Image,
      gif: Image,
      svg: Image,
      folder: Folder,
      zip: Archive
    };
    return icons[type] || File;
  };

  // Get file type color
  const getFileTypeColor = (type) => {
    const colors = {
      pdf: 'text-red-600 bg-red-100',
      docx: 'text-blue-600 bg-blue-100',
      xlsx: 'text-green-600 bg-green-100',
      pptx: 'text-orange-600 bg-orange-100',
      txt: 'text-gray-600 bg-gray-100',
      html: 'text-purple-600 bg-purple-100',
      mp4: 'text-pink-600 bg-pink-100',
      mp3: 'text-indigo-600 bg-indigo-100',
      jpg: 'text-yellow-600 bg-yellow-100',
      png: 'text-yellow-600 bg-yellow-100',
      gif: 'text-yellow-600 bg-yellow-100',
      svg: 'text-yellow-600 bg-yellow-100',
      folder: 'text-blue-600 bg-blue-100',
      zip: 'text-gray-600 bg-gray-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  // Get status styling
  const getStatusStyle = (status) => {
    const styles = {
      processed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // Get access level styling
  const getAccessLevelStyle = (level) => {
    const styles = {
      public: 'bg-green-100 text-green-800',
      internal: 'bg-yellow-100 text-yellow-800',
      team: 'bg-blue-100 text-blue-800',
      confidential: 'bg-red-100 text-red-800'
    };
    return styles[level] || 'bg-gray-100 text-gray-800';
  };

  // Document card component
  const DocumentCard = ({ document }) => {
    const FileIcon = getFileTypeIcon(document.type);
    
    return (
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 border hover:shadow-xl transition-shadow cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setSelectedDocument(document)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${getFileTypeColor(document.type)}`}>
              <FileIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{document.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{document.type} • {document.size}</p>
              <div className="hidden md:flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(document.status)}`}>{document.status}</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAccessLevelStyle(document.accessLevel)}`}>{document.accessLevel}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-1 md:hidden">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(document.status)}`}>{document.status}</span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAccessLevelStyle(document.accessLevel)}`}>{document.accessLevel}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Data Room:</span>
            <span className="font-medium text-gray-900">{document.dataRoom}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Processed by:</span>
            <span className="font-medium text-gray-900">{document.processedBy}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Version:</span>
            <span className="font-medium text-gray-900">{document.version}</span>
          </div>
        </div>

        {/* AI Insights Preview */}
        {document.aiInsights && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">AI Insights</span>
              <span className="text-xs text-gray-500">({Math.round(document.aiInsights.confidence * 100)}% confidence)</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{document.aiInsights.summary}</p>
          </div>
        )}

        {/* Auto Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Auto Actions:</h4>
          <div className="space-y-1">
            {document.autoActions.slice(0, 2).map((action, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                {action.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : action.status === 'in-progress' ? (
                  <Clock className="w-4 h-4 text-yellow-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-gray-600">{action.action}</span>
              </div>
            ))}
            {document.autoActions.length > 2 && (
              <div className="text-xs text-gray-500">
                +{document.autoActions.length - 2} more actions
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-4">
          {document.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{document.tags.length - 3}
            </span>
          )}
        </div>
      </motion.div>
    );
  };

  // Document detail modal
  const DocumentDetailModal = () => {
    if (!selectedDocument) return null;

    const FileIcon = getFileTypeIcon(selectedDocument.type);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-lg ${getFileTypeColor(selectedDocument.type)}`}>
                  <FileIcon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDocument.name}</h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(selectedDocument.status)}`}>
                      {selectedDocument.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAccessLevelStyle(selectedDocument.accessLevel)}`}>
                      {selectedDocument.accessLevel}
                    </span>
                    <span className="text-sm text-gray-600">v{selectedDocument.version}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* AI Insights */}
                {selectedDocument.aiInsights && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-blue-500" />
                      AI Analysis
                      <span className="ml-2 text-sm text-gray-600">
                        ({Math.round(selectedDocument.aiInsights.confidence * 100)}% confidence)
                      </span>
                    </h3>
                    <p className="text-gray-700 mb-4">{selectedDocument.aiInsights.summary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Key Points:</h4>
                        <ul className="space-y-1">
                          {selectedDocument.aiInsights.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {selectedDocument.aiInsights.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    Autonomous Actions
                  </h3>
                  <div className="space-y-3">
                    {selectedDocument.autoActions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {action.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : action.status === 'in-progress' ? (
                            <Clock className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{action.action}</div>
                            <div className="text-sm text-gray-600">by {action.agent}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          action.status === 'completed' ? 'bg-green-100 text-green-800' :
                          action.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {action.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Document Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Document Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Type</span>
                      <span className="font-semibold capitalize">{selectedDocument.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Size</span>
                      <span className="font-semibold">{selectedDocument.size}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category</span>
                      <span className="font-semibold capitalize">{selectedDocument.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Data Room</span>
                      <span className="font-semibold">{selectedDocument.dataRoom}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Upload Date</span>
                      <span className="font-semibold">{selectedDocument.uploadDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last Modified</span>
                      <span className="font-semibold">{selectedDocument.lastModified.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Collaborators */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Collaborators</h3>
                  <div className="space-y-2">
                    {selectedDocument.collaborators.map((collaborator, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                          {collaborator[0]}
                        </div>
                        <span className="text-sm text-gray-700">{collaborator}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button 
                    onClick={() => handleViewDocument(selectedDocument)}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Document</span>
                  </button>
                  
                  {/* Download with format options */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                      className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    {showDownloadOptions && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button 
                        onClick={() => handleDownloadDocument(selectedDocument, 'original')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        Original Format
                      </button>
                      <button 
                        onClick={() => handleDownloadDocument(selectedDocument, 'pdf')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        PDF
                      </button>
                      <button 
                        onClick={() => handleDownloadDocument(selectedDocument, 'google')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        Google Suite
                      </button>
                      <button 
                        onClick={() => handleDownloadDocument(selectedDocument, 'office')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        MS Office
                      </button>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleShareDocument(selectedDocument)}
                    className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button 
                    onClick={() => handleReanalyzeDocument(selectedDocument)}
                    className="w-full flex items-center justify-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Re-analyze</span>
                  </button>
                  
                  {/* Accept and Initiate Recommendations Button */}
                  {selectedDocument?.aiInsights?.recommendations && selectedDocument.aiInsights.recommendations.length > 0 && (
                    <button 
                      onClick={() => handleAcceptRecommendations(selectedDocument)}
                      className="w-full flex items-center justify-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Accept & Initiate Recommendations</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600 mt-2">Autonomous document processing and AI-powered insights</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="business">Business</option>
              <option value="analytics">Analytics</option>
              <option value="marketing">Marketing</option>
              <option value="legal">Legal</option>
              <option value="media">Media</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="processed">Processed</option>
              <option value="processing">Processing</option>
              <option value="reviewed">Reviewed</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={filterDataRoom}
              onChange={(e) => setFilterDataRoom(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Data Rooms</option>
              <option value="Business Strategy">Business Strategy</option>
              <option value="Customer Insights">Customer Insights</option>
              <option value="Marketing Campaigns">Marketing Campaigns</option>
              <option value="Legal Documents">Legal Documents</option>
              <option value="Product Assets">Product Assets</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lastModified">Last Modified</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="uploadDate">Upload Date</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid/List */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        <AnimatePresence>
          {filteredDocuments.map(document => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </AnimatePresence>
      </div>

      {/* Document Detail Modal */}
      <DocumentDetailModal />

      {/* Share Modal */}
      {showShareModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Share Document</h2>
            <p className="text-gray-600 mb-4">Share "{selectedDocument.name}" with others:</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="recipient@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add a personal message..."
                />
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">Share Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm">View only</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Allow comments</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Allow download</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                disabled={!shareEmail}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Send Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsView;


