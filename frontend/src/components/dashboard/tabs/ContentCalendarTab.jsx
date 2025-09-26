import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Calendar, 
  Clock, 
  Target, 
  List, 
  Grid3X3, 
  Plus, 
  Bell, 
  BarChart3, 
  Zap,
  CheckCircle,
  Target,
  Edit,
  Trash2
} from 'lucide-react';

import DroppableCalendarDay from '../calendar/DroppableCalendarDay';
import ContentDetailsModal from '../modals/ContentDetailsModal';
import CreateContentModal from '../modals/CreateContentModal';
import EditContentModal from '../modals/EditContentModal';
import AutonomousContentModal from '../modals/AutonomousContentModal';
import PerformanceAnalyticsModal from '../modals/PerformanceAnalyticsModal';
import ApprovalModal from '../modals/ApprovalModal';
import CampaignModal from '../modals/CampaignModal';

const ContentCalendarTab = ({ calendar }) => {
  const [viewMode, setViewMode] = useState('month'); // month, week, day, list, kanban
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedContent, setSelectedContent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [localCalendar, setLocalCalendar] = useState(calendar?.calendar || []);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showAutonomousModal, setShowAutonomousModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalContent, setApprovalContent] = useState(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignView, setCampaignView] = useState(false);

  const platforms = ['all', 'instagram', 'linkedin', 'twitter', 'facebook', 'tiktok', 'youtube', 'email'];
  const statuses = ['all', 'idea', 'draft', 'review', 'pending_approval', 'approved', 'scheduled', 'published', 'archived'];

  // Update local calendar when prop changes
  useEffect(() => {
    if (calendar?.calendar) {
      setLocalCalendar(calendar.calendar);
    }
  }, [calendar]);

  // Editorial Guidelines (from onboarding)
  const getEditorialGuidelines = () => {
    try {
      const data = JSON.parse(localStorage.getItem('guild_onboarding_data') || '{}');
      const brandVoice = data.brandVoice || data.answers?.[11] || '';
      const keywords = data.brandKeywords || [];
      const dos = data.brandDos || [];
      const donts = data.brandDonts || [];
      return { brandVoice, keywords, dos, donts };
    } catch (e) {
      return { brandVoice: '', keywords: [], dos: [], donts: [] };
    }
  };
  const editorial = getEditorialGuidelines();

  // Filter content based on search and filters
  const filteredCalendar = localCalendar.filter(item => {
    const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      item.content_preview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.platform?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content_type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPlatform && matchesStatus && matchesSearch;
  });

  // Get content for a specific date
  const getContentForDate = (date) => {
    return filteredCalendar.filter(item => 
      new Date(item.scheduled_date).toDateString() === date.toDateString()
    );
  };

  // Get content for current view
  const getViewContent = () => {
    const content = [];
    const today = new Date();
    
    if (viewMode === 'month') {
      // Show 30 days from today
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        content.push({
          date,
          content: getContentForDate(date)
        });
      }
    } else if (viewMode === 'week') {
      // Show 7 days from selected date
      const startDate = new Date(selectedDate);
      startDate.setDate(selectedDate.getDate() - selectedDate.getDay());
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        content.push({
          date,
          content: getContentForDate(date)
        });
      }
    } else if (viewMode === 'day') {
      // Show single day
      content.push({
        date: selectedDate,
        content: getContentForDate(selectedDate)
      });
    }
    
    return content;
  };

  const viewContent = getViewContent();

  // Handle content move via drag and drop
  const handleContentMove = (content, newDate) => {
    setLocalCalendar(prevCalendar => 
      prevCalendar.map(item => 
        item.content_id === content.content_id 
          ? { ...item, scheduled_date: newDate.toISOString() }
          : item
      )
    );
  };

  // Handle content click
  const handleContentClick = (content) => {
    setSelectedContent(content);
  };

  // Handle approval request
  const handleApprovalRequest = (content) => {
    setApprovalContent(content);
    setShowApprovalModal(true);
  };

  // Handle approval actions
  const handleApproval = (approvalData) => {
    setLocalCalendar(prevCalendar => 
      prevCalendar.map(item => 
        item.content_id === approvalData.content_id 
          ? { 
              ...item, 
              status: 'approved',
              approval_history: [...(item.approval_history || []), approvalData],
              last_approved: approvalData.timestamp,
              approved_by: approvalData.user
            }
          : item
      )
    );
    setShowApprovalModal(false);
    setApprovalContent(null);
  };

  const handleRejection = (approvalData) => {
    setLocalCalendar(prevCalendar => 
      prevCalendar.map(item => 
        item.content_id === approvalData.content_id 
          ? { 
              ...item, 
              status: 'draft',
              approval_history: [...(item.approval_history || []), approvalData],
              last_rejected: approvalData.timestamp,
              rejected_by: approvalData.user,
              rejection_reason: approvalData.comment
            }
          : item
      )
    );
    setShowApprovalModal(false);
    setApprovalContent(null);
  };

  const handleRequestChanges = (approvalData) => {
    setLocalCalendar(prevCalendar => 
      prevCalendar.map(item => 
        item.content_id === approvalData.content_id 
          ? { 
              ...item, 
              status: 'draft',
              approval_history: [...(item.approval_history || []), approvalData],
              last_changes_requested: approvalData.timestamp,
              changes_requested_by: approvalData.user,
              changes_requested: approvalData.comment
            }
          : item
      )
    );
    setShowApprovalModal(false);
    setApprovalContent(null);
  };

  // Campaign management functions
  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setShowCampaignModal(true);
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignModal(true);
  };

  const handleSaveCampaign = (campaignData) => {
    if (selectedCampaign) {
      // Update existing campaign
      setCampaigns(prev => prev.map(c => c.id === campaignData.id ? campaignData : c));
    } else {
      // Create new campaign
      setCampaigns(prev => [...prev, campaignData]);
    }
    setShowCampaignModal(false);
    setSelectedCampaign(null);
  };

  const handleDeleteCampaign = (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      setShowCampaignModal(false);
      setSelectedCampaign(null);
    }
  };

  const handleCampaignView = () => {
    setCampaignView(!campaignView);
  };

  // Handle item selection for bulk operations
  const handleItemSelect = (contentId, isSelected) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(contentId);
      } else {
        newSet.delete(contentId);
      }
      setShowBulkActions(newSet.size > 0);
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.size === filteredCalendar.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set(filteredCalendar.map(item => item.content_id));
      setSelectedItems(allIds);
      setShowBulkActions(true);
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    const selectedContent = localCalendar.filter(item => selectedItems.has(item.content_id));
    
    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedContent.length} content items?`)) {
          setLocalCalendar(prev => prev.filter(item => !selectedItems.has(item.content_id)));
          setSelectedItems(new Set());
          setShowBulkActions(false);
        }
        break;
      case 'publish':
        setLocalCalendar(prev => prev.map(item => 
          selectedItems.has(item.content_id) 
            ? { ...item, status: 'published' }
            : item
        ));
        setSelectedItems(new Set());
        setShowBulkActions(false);
        break;
      case 'schedule':
        setLocalCalendar(prev => prev.map(item => 
          selectedItems.has(item.content_id) 
            ? { ...item, status: 'scheduled' }
            : item
        ));
        setSelectedItems(new Set());
        setShowBulkActions(false);
        break;
      case 'draft':
        setLocalCalendar(prev => prev.map(item => 
          selectedItems.has(item.content_id) 
            ? { ...item, status: 'draft' }
            : item
        ));
        setSelectedItems(new Set());
        setShowBulkActions(false);
        break;
      default:
        break;
    }
  };

  // Get upcoming deadlines and reminders
  const getUpcomingDeadlines = () => {
    const now = new Date();
    const deadlines = [];

    // Check for content due for review
    filteredCalendar.forEach(content => {
      const scheduledDate = new Date(content.scheduled_date);
      const daysUntil = Math.ceil((scheduledDate - now) / (1000 * 60 * 60 * 24));
      
      if (content.status === 'draft' && daysUntil <= 2 && daysUntil >= 0) {
        deadlines.push({
          title: `${content.platform} ${content.content_type} needs review`,
          description: `"${content.content_preview.substring(0, 50)}..."`,
          dueDate: scheduledDate.toLocaleDateString(),
          timeRemaining: daysUntil === 0 ? 'Due today' : `${daysUntil} day${daysUntil === 1 ? '' : 's'} left`,
          urgency: daysUntil === 0 ? 'high' : 'medium'
        });
      }
      
      if (content.status === 'review' && daysUntil <= 1 && daysUntil >= 0) {
        deadlines.push({
          title: `${content.platform} ${content.content_type} ready to publish`,
          description: `"${content.content_preview.substring(0, 50)}..."`,
          dueDate: scheduledDate.toLocaleDateString(),
          timeRemaining: daysUntil === 0 ? 'Due today' : `${daysUntil} day${daysUntil === 1 ? '' : 's'} left`,
          urgency: daysUntil === 0 ? 'high' : 'medium'
        });
      }
    });

    // Check for overdue content
    filteredCalendar.forEach(content => {
      const scheduledDate = new Date(content.scheduled_date);
      const daysOverdue = Math.ceil((now - scheduledDate) / (1000 * 60 * 60 * 24));
      
      if ((content.status === 'draft' || content.status === 'review') && daysOverdue > 0) {
        deadlines.push({
          title: `Overdue: ${content.platform} ${content.content_type}`,
          description: `"${content.content_preview.substring(0, 50)}..."`,
          dueDate: scheduledDate.toLocaleDateString(),
          timeRemaining: `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`,
          urgency: 'high'
        });
      }
    });

    return deadlines.sort((a, b) => {
      if (a.urgency === 'high' && b.urgency !== 'high') return -1;
      if (b.urgency === 'high' && a.urgency !== 'high') return 1;
      return 0;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="space-y-6">
      {/* Enhanced Header with Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-purple-500 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Content Calendar</h3>
              <p className="text-sm text-gray-600">Plan and schedule your content across all platforms</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            

            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.size} selected
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleBulkAction('publish')}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleBulkAction('schedule')}
                    className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  >
                    Schedule
                  </button>
                  <button
                    onClick={() => handleBulkAction('draft')}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Performance Analytics Button */}
            <button 
              onClick={() => setShowAnalyticsModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>

            {/* Autonomous Content Creation Button */}
            <button 
              onClick={() => setShowAutonomousModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center"
            >
              <Zap className="w-4 h-4 mr-2" />
              Autonomous Content
            </button>

            

            {/* Request Approval Button */}
            <button 
              onClick={() => {
                const pendingApproval = filteredCalendar.find(item => item.status === 'review');
                if (pendingApproval) {
                  handleApprovalRequest(pendingApproval);
                } else {
                  alert('No content in review status found. Please create content and set it to review status first.');
                }
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Review Pending ({filteredCalendar.filter(item => item.status === 'review').length})
            </button>

            {/* Campaign Management Buttons */}
            <button 
              onClick={handleCampaignView}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <Target className="w-4 h-4 mr-2" />
              {campaignView ? 'Hide Campaigns' : 'Show Campaigns'}
            </button>

            <button 
              onClick={handleCreateCampaign}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </button>

            {/* Create Content Button */}
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
            <Plus className="w-4 h-4 mr-2" />
              Create Content
          </button>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Select All Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredCalendar.length && filteredCalendar.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label className="ml-2 text-sm text-gray-700">Select All</label>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Platform Filter */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {platforms.map(platform => (
              <option key={platform} value={platform}>
                {platform === 'all' ? 'All Platforms' : platform.charAt(0).toUpperCase() + platform.slice(1)}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Performance Analytics Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
            Content Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {filteredCalendar.length}
              </div>
              <div className="text-sm text-gray-600">Total Scheduled</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredCalendar.filter(item => item.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredCalendar.filter(item => item.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredCalendar.filter(item => item.ai_generated).length}
              </div>
              <div className="text-sm text-gray-600">AI Generated</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {filteredCalendar.filter(item => item.status === 'pending_approval').length}
              </div>
              <div className="text-sm text-gray-600">Pending Approval</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {filteredCalendar.filter(item => item.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
        </div>

        {/* Editorial Guidelines */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Editorial Guidelines</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-800 mb-1">Brand Voice</div>
              <div className="text-gray-700 whitespace-pre-line">{editorial.brandVoice || 'No brand voice found. Set during onboarding.'}</div>
            </div>
            <div>
              <div className="font-medium text-gray-800 mb-1">Keywords</div>
              <div className="text-gray-700">{Array.isArray(editorial.keywords) && editorial.keywords.length > 0 ? editorial.keywords.join(', ') : '—'}</div>
            </div>
            <div>
              <div className="font-medium text-gray-800 mb-1">Do's & Don'ts</div>
              <div className="text-gray-700">
                {Array.isArray(editorial.dos) && editorial.dos.length > 0 && (
                  <div className="mb-1"><span className="font-medium">Do:</span> {editorial.dos.join(', ')}</div>
                )}
                {Array.isArray(editorial.donts) && editorial.donts.length > 0 && (
                  <div><span className="font-medium">Don't:</span> {editorial.donts.join(', ')}</div>
                )}
                {(!editorial.dos || editorial.dos.length === 0) && (!editorial.donts || editorial.donts.length === 0) && '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines & Reminders */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bell className="w-5 h-5 text-orange-500 mr-2" />
              Upcoming Deadlines & Reminders
            </h3>
            <span className="text-sm text-gray-500">
              {getUpcomingDeadlines().length} items need attention
            </span>
          </div>
          <div className="space-y-3">
            {getUpcomingDeadlines().slice(0, 5).map((item, idx) => (
              <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                item.urgency === 'high' ? 'border-red-500 bg-red-50' :
                item.urgency === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.urgency === 'high' ? 'bg-red-500' :
                      item.urgency === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{item.dueDate}</div>
                    <div className="text-xs text-gray-500">{item.timeRemaining}</div>
                  </div>
                </div>
              </div>
            ))}
            {getUpcomingDeadlines().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No upcoming deadlines or reminders</p>
              </div>
            )}
          </div>
        </div>

        {/* Campaign View */}
        {campaignView && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Target className="w-5 h-5 text-indigo-500 mr-2" />
                Campaign Management
              </h3>
              <button 
                onClick={handleCreateCampaign}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </button>
            </div>
            
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-4">Create your first campaign to organize and track your content</p>
                <button 
                  onClick={handleCreateCampaign}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign, idx) => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{campaign.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditCampaign(campaign)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                          campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Platforms</span>
                        <span className="text-gray-900">{campaign.platforms?.length || 0} platforms</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Content</span>
                        <span className="text-gray-900">{campaign.content?.length || 0} pieces</span>
                      </div>
                      
                      {campaign.start_date && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Duration</span>
                          <span className="text-gray-900">
                            {new Date(campaign.start_date).toLocaleDateString()} - {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Ongoing'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View Mode Toggle (moved above calendar) */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          {[
            { id: 'month', label: 'Month', icon: Calendar },
            { id: 'week', label: 'Week', icon: Clock },
            { id: 'day', label: 'Day', icon: Target },
            { id: 'list', label: 'List', icon: List },
            { id: 'kanban', label: 'Kanban', icon: Grid3X3 }
          ].map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode.id
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-1" />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Calendar View */}
        {viewMode === 'month' && (
          <div className="space-y-4">
            {/* Month Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        
            {/* Month Grid */}
        <div className="grid grid-cols-7 gap-2">
              {viewContent.map((dayData, i) => (
                <DroppableCalendarDay
                  key={i}
                  date={dayData.date}
                  content={dayData.content}
                  onContentMove={handleContentMove}
                  onContentClick={handleContentClick}
                  onContentSelect={handleItemSelect}
                  selectedItems={selectedItems}
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'week' && (
          <div className="space-y-4">
            {/* Week Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {viewContent.map((dayData, i) => (
                <div key={i} className="text-center font-medium text-gray-600 py-2">
                  {dayData.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  <div className="text-sm text-gray-500">{dayData.date.getDate()}</div>
                </div>
              ))}
            </div>
            
            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-2">
              {viewContent.map((dayData, i) => (
                <DroppableCalendarDay
                  key={i}
                  date={dayData.date}
                  content={dayData.content}
                  onContentMove={handleContentMove}
                  onContentClick={handleContentClick}
                  onContentSelect={handleItemSelect}
                  selectedItems={selectedItems}
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'day' && (
          <div className="space-y-4">
            {/* Day Header */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
            </div>
            
            {/* Day Content */}
            <div className="space-y-3">
              {viewContent[0]?.content.map((content, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedContent(content)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
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
                      <div>
                        <div className="font-medium capitalize">{content.platform} {content.content_type}</div>
                        <div className="text-sm text-gray-600">{content.content_preview}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        content.status === 'published' ? 'bg-green-100 text-green-800' :
                        content.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        content.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        content.status === 'pending_approval' ? 'bg-orange-100 text-orange-800' :
                        content.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                        content.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        content.status === 'idea' ? 'bg-purple-100 text-purple-800' :
                        content.status === 'archived' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                        {content.status}
                      </div>
                    </div>
                  </div>
                    </div>
                  ))}
              
              {viewContent[0]?.content.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No content scheduled for this day</p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Schedule Content
                  </button>
                    </div>
                  )}
                </div>
              </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            {/* List Header */}
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">All Content</h4>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {filteredCalendar.length} items
                </span>
              </div>
            </div>
            
            {/* List Content */}
            <div className="space-y-3">
              {filteredCalendar.map((content, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedContent(content)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(content.content_id)}
                        onChange={(e) => handleItemSelect(content.content_id, e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        onClick={(e) => e.stopPropagation()}
                      />
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
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium capitalize">{content.platform}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600 capitalize">{content.content_type}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{content.theme}</span>
                          {content.assignee && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-blue-600">@{content.assignee}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{content.content_preview}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        content.status === 'published' ? 'bg-green-100 text-green-800' :
                        content.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        content.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        content.status === 'pending_approval' ? 'bg-orange-100 text-orange-800' :
                        content.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                        content.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        content.status === 'idea' ? 'bg-purple-100 text-purple-800' :
                        content.status === 'archived' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {content.status}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(content.scheduled_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCalendar.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or create new content</p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Content
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'kanban' && (
          <div className="space-y-4">
            {/* Kanban Header */}
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">Content Pipeline</h4>
            </div>
            
            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { id: 'idea', label: 'Ideas', color: 'bg-gray-100', textColor: 'text-gray-700' },
                { id: 'draft', label: 'Drafts', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
                { id: 'review', label: 'Review', color: 'bg-blue-100', textColor: 'text-blue-700' },
                { id: 'pending_approval', label: 'Pending Approval', color: 'bg-orange-100', textColor: 'text-orange-700' },
                { id: 'scheduled', label: 'Scheduled', color: 'bg-green-100', textColor: 'text-green-700' }
              ].map(column => {
                const columnContent = filteredCalendar.filter(item => {
                  if (column.id === 'idea') return item.status === 'idea';
                  if (column.id === 'draft') return item.status === 'draft';
                  if (column.id === 'review') return item.status === 'review';
                  if (column.id === 'pending_approval') return item.status === 'pending_approval';
                  if (column.id === 'scheduled') return item.status === 'scheduled' || item.status === 'published' || item.status === 'approved';
                  return false;
                });

                return (
                  <div key={column.id} className="space-y-3">
                    <div className={`p-3 rounded-lg ${column.color}`}>
                      <div className="flex items-center justify-between">
                        <h5 className={`font-medium ${column.textColor}`}>{column.label}</h5>
                        <span className={`text-sm ${column.textColor} bg-white bg-opacity-50 px-2 py-1 rounded-full`}>
                          {columnContent.length}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                      {columnContent.map((content, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedContent(content)}
                          className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-all"
                        >
                          <div className="flex items-start space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(content.content_id)}
                              onChange={(e) => handleItemSelect(content.content_id, e.target.checked)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  content.platform === 'instagram' ? 'bg-pink-500' :
                                  content.platform === 'linkedin' ? 'bg-blue-500' :
                                  content.platform === 'twitter' ? 'bg-blue-400' :
                                  content.platform === 'facebook' ? 'bg-blue-600' :
                                  content.platform === 'tiktok' ? 'bg-black' :
                                  content.platform === 'youtube' ? 'bg-red-500' :
                                  content.platform === 'email' ? 'bg-green-500' :
                                  'bg-gray-500'
                                }`}></div>
                                <span className="text-sm font-medium capitalize">{content.platform}</span>
                                <span className="text-xs text-gray-500 capitalize">{content.content_type}</span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2 line-clamp-2">{content.content_preview}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{content.theme}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(content.scheduled_date).toLocaleDateString()}
                                </span>
                              </div>
                              {/* Approval Button for Review Status */}
                              {content.status === 'review' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprovalRequest(content);
                                  }}
                                  className="mt-2 w-full px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors"
                                >
                                  Request Approval
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
        )}
    </div>

      {/* Content Details Modal */}
      {selectedContent && (
        <ContentDetailsModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onEdit={() => {
            setSelectedContent(null);
            setShowEditModal(true);
          }}
        />
      )}

      {/* Create Content Modal */}
      {showCreateModal && (
        <CreateContentModal
          onClose={() => setShowCreateModal(false)}
          onSave={(contentData) => {
            console.log('Creating content:', contentData);
            
            // Create new content item
            const newContent = {
              content_id: `manual_${Date.now()}_${Math.random().toString(36).slice(2,9)}`,
              platform: contentData.platform,
              content_type: contentData.content_type,
              theme: contentData.theme,
              content_preview: contentData.content_preview,
              caption: contentData.caption,
              scheduled_date: contentData.scheduled_date,
              status: 'review', // Set to review status for testing approval
              priority: contentData.priority,
              assignee: 'You',
              ai_generated: false,
              created_at: new Date().toISOString()
            };
            
            // Add to local calendar
            setLocalCalendar(prev => [...prev, newContent]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Edit Content Modal */}
      {showEditModal && (
        <EditContentModal
          content={selectedContent}
          onClose={() => setShowEditModal(false)}
          onSave={(contentData) => {
            console.log('Updating content:', contentData);
            setShowEditModal(false);
          }}
        />
      )}

      {/* Autonomous Content Modal */}
      {showAutonomousModal && (
        <AutonomousContentModal
          onClose={() => setShowAutonomousModal(false)}
          onSchedule={(content) => {
            console.log('Autonomous content generated:', content);
            // Add autonomous content to calendar
            setLocalCalendar(prev => [...prev, ...content]);
            setShowAutonomousModal(false);
          }}
        />
      )}

      

      {/* Performance Analytics Modal */}
      {showAnalyticsModal && (
        <PerformanceAnalyticsModal
          calendar={localCalendar}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}

      {/* Approval Modal */}
      {showApprovalModal && approvalContent && (
        <ApprovalModal
          content={approvalContent}
          onClose={() => {
            setShowApprovalModal(false);
            setApprovalContent(null);
          }}
          onApprove={handleApproval}
          onReject={handleRejection}
          onRequestChanges={handleRequestChanges}
        />
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <CampaignModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowCampaignModal(false);
            setSelectedCampaign(null);
          }}
          onSave={handleSaveCampaign}
          onDelete={handleDeleteCampaign}
          isEdit={!!selectedCampaign}
        />
      )}
      </div>
    </DndProvider>
  );
};

export default ContentCalendarTab;
