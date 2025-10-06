import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Star, Archive, Bot, Search, Filter, RefreshCw, Download } from 'lucide-react';
import { fetchConversations as fetchConversationsApi } from '../../services/conversationsApi.js';
import { getMessagesForCustomer } from '../../services/conversationsApi.js';
import CustomerDetailModal from './modals/CustomerDetailModal.jsx';
import AgentInsightsModal from './modals/AgentInsightsModal.jsx';
import EnhancedApprovalModal from './modals/EnhancedApprovalModal.jsx';
import ComposeEmailModal from './modals/ComposeEmailModal.jsx';
import MessageComposeModal from './modals/MessageComposeModal.jsx';
import CustomerProfileModal from './modals/CustomerProfileModal.jsx';
import ConversationDetailModal from './modals/ConversationDetailModal.jsx';

const ConversationsTab = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [starredCustomers, setStarredCustomers] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showAgentInsights, setShowAgentInsights] = useState(false);
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [approvalData, setApprovalData] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversationDetail, setShowConversationDetail] = useState(false);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterValueRange, setFilterValueRange] = useState('all');
  const [filterStarred, setFilterStarred] = useState('all');

  useEffect(() => {
    fetchConversations();
  }, []);

  // optional auto-refresh every 30s for near real-time updates
  const refreshTimer = useRef(null);
  useEffect(() => {
    // clear any previous
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(() => {
      fetchConversations();
    }, 30000);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchConversationsApi({
        type: filterType,
        status: filterStatus,
        agent: filterAgent,
        priority: filterPriority,
        search: searchTerm,
        source: filterSource
      });
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Try to subscribe to a conversations websocket if available; fallback is the polling above
  useEffect(() => {
    const base = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    try {
      const wsUrl = base.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/conversations';
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        // console.log('Conversations WS connected');
      };
      ws.onmessage = () => {
        // Any message triggers a refresh
        fetchConversations();
      };
      ws.onerror = () => {
        // ignore, polling continues
      };
      return () => {
        try { ws.close(); } catch {}
      };
    } catch {}
  }, []);

  // Group conversations by customer
  const getCustomerData = () => {
    if (!conversations || !Array.isArray(conversations)) {
      return [];
    }

    const customerMap = new Map();

    conversations.forEach(conversation => {
      const customer = conversation.participants.find(p => p.role === 'customer');
      if (!customer || !customer.email) return;

      const customerKey = customer.email;
      
      if (!customerMap.has(customerKey)) {
        customerMap.set(customerKey, {
          id: customerKey,
          name: customer.name,
          email: customer.email,
          conversations: [],
          totalValue: 0,
          lastActivity: conversation.lastActivity,
          status: conversation.status,
          priority: conversation.priority,
          tags: new Set(),
          agents: new Set(),
          channels: new Set(),
          sentiment: conversation.sentiment,
          messageCount: 0,
          createdAt: conversation.createdAt
        });
      }

      const customerData = customerMap.get(customerKey);
      customerData.conversations.push(conversation);
      customerData.totalValue += (conversation.estimatedValue || conversation.actualValue || 0);
      customerData.messageCount += (conversation.messageCount || 0);
      
      // Update last activity
      if (new Date(conversation.lastActivity) > new Date(customerData.lastActivity)) {
        customerData.lastActivity = conversation.lastActivity;
        customerData.status = conversation.status;
        customerData.priority = conversation.priority;
        customerData.sentiment = conversation.sentiment;
      }

      // Collect tags, agents, and channels
      conversation.tags.forEach(tag => customerData.tags.add(tag));
      customerData.agents.add(conversation.agentType);
      customerData.channels.add(conversation.type);
    });

    // Convert to array and format data
    return Array.from(customerMap.values()).map(customer => ({
      ...customer,
      totalValue: Number(customer.totalValue) || 0, // Ensure totalValue is always a number
      tags: Array.from(customer.tags),
      agents: Array.from(customer.agents),
      channels: Array.from(customer.channels),
      conversationCount: customer.conversations.length,
      avgSentiment: customer.conversations.reduce((sum, conv) => {
        const sentimentScores = { positive: 1, neutral: 0.5, negative: 0 };
        return sum + (sentimentScores[conv.sentiment] || 0.5);
      }, 0) / customer.conversations.length
    }));
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleStarCustomer = (customer) => {
    const customerId = customer.email || customer.id;
    setStarredCustomers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
        console.log('Unstarred customer:', customer.name);
      } else {
        newSet.add(customerId);
        console.log('Starred customer:', customer.name);
      }
      return newSet;
    });
  };

  const handleArchiveCustomer = (customer) => {
    console.log('Archiving customer:', customer.name);
    // In real implementation, this would remove from current list and archive
    setConversations(prev => prev.filter(conv => 
      !conv.participants.some(p => p.email === customer.email)
    ));
    setShowModal(false);
  };

  const handleViewProfile = async (customer) => {
    try {
      const messages = await getMessagesForCustomer(customer);
      const customerWithMessages = { ...customer, messages };
      setSelectedCustomer(customerWithMessages);
    } catch (e) {
      setSelectedCustomer(customer);
    } finally {
      setShowCustomerProfile(true);
      // Close the current customer detail modal
      setShowModal(false);
    }
  };

  const handleReply = (conversation) => {
    // ensure detail modal closes so compose modal is interactable and visible
    setShowConversationDetail(false);
    setSelectedConversation(conversation);
    if (conversation.type === 'email') {
      setShowEmailModal(true);
    } else {
      setShowMessageModal(true);
    }
  };

  const openConversationDetail = async (customer) => {
    try {
      // pick the latest conversation for this customer
      const conv = (customer.conversations || [])[0];
      if (!conv) return;
      setSelectedConversation(conv);
      setSelectedCustomer(customer);
      // build message-like entries for the detail modal using the same API used for profile messages
      const msgs = await getMessagesForCustomer({ email: customer.email, name: customer.name });
      setConversationMessages(msgs);
      setShowConversationDetail(true);
    } catch (e) {
      console.error('Failed to open conversation detail', e);
    }
  };

  const handleSelectConversationInModal = async (conversationId) => {
    if (!selectedCustomer) return;
    const conv = (selectedCustomer.conversations || []).find(c => c.id === conversationId);
    if (!conv) return;
    setSelectedConversation(conv);
  };

  const handleInitiateAction = async (conversation) => {
    // Close detail modal before opening approval for clear focus
    setShowConversationDetail(false);
    // Open EnhancedApprovalModal configured with conversation context
    setApprovalData({
      action_type: 'Initiate Recommended Action',
      action_title: conversation.subject || 'Initiate Action',
      action_description: conversation.nextAction || 'Proceed with recommended next step.',
      initiating_agent: conversation.agentType || 'orchestrator_agent',
      estimated_duration: 300,
      requested_at: new Date().toISOString(),
      risk_level: 'low',
      involved_agents: [
        { type: 'orchestrator_agent', name: 'Orchestrator', role: 'Coordinator', status: 'ready', estimated_duration: 60, actions: [{ name: 'Delegate to agents', description: 'Assign tasks to appropriate agents', estimated_duration: 60 }] },
      ],
      workflow_steps: [
        { name: 'Prepare task context', agent: 'Orchestrator', estimated_duration: 60, approval_required: false },
        { name: 'Delegate to channel agent', agent: conversation.agentType || 'Agent', estimated_duration: 120, approval_required: false },
      ],
      decision_rationale: {},
    });
    setConfirmActionOpen(true);
  };

  const handleStarConversation = (conversation) => {
    const customer = selectedCustomer || { email: conversation?.participants?.find(p => p.role === 'customer')?.email };
    if (!customer?.email) return;
    handleStarCustomer({ email: customer.email, id: customer.email, name: customer.name || customer.email });
    // Keep the detail modal open and provide immediate visual feedback by toggling local state
    // no-op UI change here since star indicator is on the customer card; we could also toast if desired
  };

  const handleArchiveConversation = (conversation) => {
    if (!conversation) return;
    setConversations(prev => prev.filter(c => c.id !== conversation.id));
    setShowConversationDetail(false);
    // Ensure compose modals are not inadvertently open
    setShowEmailModal(false);
    setShowMessageModal(false);
  };

  const handleOrchestrateAction = (actionData) => {
    console.log('AI insight action:', actionData);
    // No apply button needed - just insights
  };

  // Filter customers based on search and filters
  const getFilteredCustomers = () => {
    const customers = getCustomerData();
    
    return customers.filter(customer => {
      // Search filter
      const matchesSearch = (() => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        if (customer.name.toLowerCase().includes(s) || customer.email.toLowerCase().includes(s)) return true;
        // search across conversation subjects and last messages
        return (customer.conversations || []).some(c =>
          (c.subject || '').toLowerCase().includes(s) || (c.lastMessage || '').toLowerCase().includes(s)
        );
      })();
      
      // Type filter (channels)
      const matchesType = filterType === 'all' || customer.channels.includes(filterType);
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
      
      // Agent filter
      const matchesAgent = filterAgent === 'all' || customer.agents.includes(filterAgent);

      // Source filter
      const matchesSource = filterSource === 'all' || (customer.conversations || []).some(c => (c.source || '') === filterSource);
      
      // Priority filter
      const matchesPriority = filterPriority === 'all' || customer.priority === filterPriority;
      
      // Starred filter
      const customerId = customer.email || customer.id;
      const matchesStarred = filterStarred === 'all' || 
                           (filterStarred === 'starred' && starredCustomers.has(customerId)) ||
                           (filterStarred === 'unstarred' && !starredCustomers.has(customerId));
      
      // Value range filter
      const matchesValue = (() => {
        if (filterValueRange === 'all') return true;
        const value = customer.totalValue || 0;
        switch (filterValueRange) {
          case 'high': return value >= 50000;
          case 'medium': return value >= 10000 && value < 50000;
          case 'low': return value > 0 && value < 10000;
          case 'none': return value === 0;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesType && matchesStatus && matchesAgent && matchesPriority && matchesStarred && matchesValue && matchesSource;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Conversations Dashboard</h3>
            <p className="text-sm text-gray-600">Unified inbox for all customer communications</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchConversations()}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowAgentInsights(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center"
            >
              <Bot className="w-4 h-4 mr-2" />
              Agent Insights
            </button>
            <button
              onClick={() => {
                try {
                  const rows = getCustomerData().map(c => ({
                    name: c.name,
                    email: c.email,
                    conversationCount: c.conversationCount,
                    channels: (c.channels || []).join('|'),
                    agents: (c.agents || []).join('|'),
                    status: c.status,
                    priority: c.priority,
                    sentiment: c.sentiment,
                    totalValue: c.totalValue
                  }));
                  const header = Object.keys(rows[0] || { name: '', email: '' });
                  const csv = [header.join(','), ...rows.map(r => header.map(h => `${String(r[h] ?? '').replace(/"/g,'""')}`).join(','))].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'conversations_export.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (e) {
                  console.error('Export failed', e);
                }
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              title="Export CSV"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 space-y-4">
            {/* Search */}
          <div>
              <input
                type="text"
              placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="voice">Voice</option>
              <option value="chat">Chat</option>
              <option value="social">Social</option>
              <option value="sms">SMS</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="pending">Pending</option>
              <option value="automated">Automated</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Agents</option>
              <option value="sales">Sales</option>
              <option value="support">Support</option>
              <option value="chat">Chat</option>
              <option value="partnerships">Partnerships</option>
              <option value="email">Email</option>
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Sources</option>
              <option value="customer_intelligence_agent">Customer Intelligence</option>
              <option value="content_intelligence_agent">Content Intelligence</option>
              <option value="business_intelligence_agent">Business Intelligence</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={filterValueRange}
              onChange={(e) => setFilterValueRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Values</option>
              <option value="high">High Value ($50K+)</option>
              <option value="medium">Medium Value ($10K-$50K)</option>
              <option value="low">Low Value ($1K-$10K)</option>
              <option value="none">No Value</option>
            </select>

            <select
              value={filterStarred}
              onChange={(e) => setFilterStarred(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Customers</option>
              <option value="starred">Starred Only</option>
              <option value="unstarred">Unstarred Only</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading conversations...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            {getFilteredCustomers().map(customer => (
              <div key={customer.id} className="bg-gray-50 rounded-lg p-4 transition-colors shadow-md hover:shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {customer.name[0]}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                    <p className="text-sm text-gray-600">{customer.email} • {customer.conversationCount} conversations</p>
                    <p className="text-sm text-gray-500">Channels: {customer.channels.join(', ')} • Agents: {customer.agents.join(', ')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {starredCustomers.has(customer.email || customer.id) && (
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    )}
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {customer.status}
                    </span>
                    {/* Sentiment Indicator */}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center ${
                      customer.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      customer.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {customer.sentiment || 'neutral'}
                    </span>
                    {customer.totalValue && customer.totalValue > 0 && (
                      <span className="text-sm font-medium text-green-600">
                        ${customer.totalValue.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {/* Inline preview of latest message */}
                <div className="mt-2 text-xs text-gray-500">
                  Latest: {customer.conversations && customer.conversations[0]?.lastMessage ? customer.conversations[0].lastMessage : '—'}
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    className="px-3 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50"
                    onClick={() => handleCustomerClick(customer)}
                  >
                    View Customer
                  </button>
                  <button
                    className="px-3 py-1 text-xs bg-gray-100 border border-gray-200 rounded hover:bg-gray-200"
                    onClick={async () => {
                      try {
                        const messages = await getMessagesForCustomer(customer);
                        const header = ['conversationId','direction','channel','subject','timestamp','preview','sentiment','source','tags'];
                        const rows = messages.map(m => ({
                          conversationId: m.conversationId,
                          direction: m.direction,
                          channel: m.channel,
                          subject: (m.subject || '').replace(/\"/g,'\"\"'),
                          timestamp: typeof m.timestamp === 'function' ? m.timestamp().toISOString() : (m.timestamp || ''),
                          preview: (m.preview || '').replace(/\"/g,'\"\"'),
                          sentiment: m.sentiment || '',
                          source: m.source || '',
                          tags: (m.tags || []).join('|')
                        }));
                        const csv = [header.join(','), ...rows.map(r => header.map(h => `${String(r[h] ?? '')}`).join(','))].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${(customer.name || customer.email || 'customer').replace(/\s+/g,'_')}_conversations.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (e) {
                        console.error('Customer CSV export failed', e);
                      }
                    }}
                  >
                    Export Customer CSV
                  </button>
                  <button
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => openConversationDetail(customer)}
                  >
                    View Conversation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmActionOpen && selectedConversation && (
        <EnhancedApprovalModal
          isOpen={confirmActionOpen}
          onClose={() => setConfirmActionOpen(false)}
          approvalData={approvalData}
          onApprove={async () => {
            setConfirmActionOpen(false);
            try {
              await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/orchestrator/delegate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  conversation_id: selectedConversation.id,
                  action: selectedConversation.nextAction || 'proceed',
                  customer: selectedCustomer?.email || null,
                }),
              });
            } catch (e) {
              console.error('Orchestrator delegation failed', e);
            }
          }}
          onReject={() => setConfirmActionOpen(false)}
          onRequestMoreInfo={() => {}}
        />
      )}

      {/* Customer Detail Modal */}
      {showModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          isStarred={starredCustomers.has(selectedCustomer.email || selectedCustomer.id)}
          onClose={() => {
            setShowModal(false);
            setSelectedCustomer(null);
          }}
          onReply={handleReply}
          onStar={handleStarCustomer}
          onArchive={handleArchiveCustomer}
          onViewProfile={handleViewProfile}
          onPlayRecording={() => console.log('Play recording')}
          onDownloadRecording={() => console.log('Download recording')}
          onInitiateAction={() => console.log('Initiate action')}
          onOrchestrateAction={handleOrchestrateAction}
        />
      )}

      {/* Agent Insights Modal */}
      {showAgentInsights && (
        <AgentInsightsModal
          onClose={() => setShowAgentInsights(false)}
          onOrchestrateAction={handleOrchestrateAction}
          conversations={conversations}
        />
      )}

      {/* Compose Email Modal */}
      {showEmailModal && selectedConversation && (
        <ComposeEmailModal
          open={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedConversation(null);
          }}
          defaultTo={selectedConversation.participants?.find(p => p.role === 'customer')?.email}
          onSent={() => {
            setShowEmailModal(false);
            setSelectedConversation(null);
          }}
        />
      )}

      {/* Message Compose Modal */}
      {showMessageModal && selectedConversation && (
        <MessageComposeModal
          open={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedConversation(null);
          }}
          customer={selectedConversation.participants?.find(p => p.role === 'customer')}
          replyTo={{
            channel: selectedConversation.type,
            platform: selectedConversation.type === 'social' ? 'linkedin' : undefined,
            customer: selectedConversation.participants?.find(p => p.role === 'customer')
          }}
        />
      )}

      {/* Customer Profile Modal */}
      {showCustomerProfile && selectedCustomer && (
        <CustomerProfileModal
          isOpen={showCustomerProfile}
          customer={selectedCustomer}
          onClose={() => {
            setShowCustomerProfile(false);
            setSelectedCustomer(null);
          }}
          onSave={(updatedCustomer) => {
            console.log('Customer updated:', updatedCustomer);
            setSelectedCustomer(updatedCustomer);
          }}
          onAction={(action, data) => {
            console.log('Customer action:', action, data);
          }}
        />
      )}

      {/* Conversation Detail Modal */}
      {showConversationDetail && selectedConversation && (
        <ConversationDetailModal
          conversation={selectedConversation}
          conversations={(selectedCustomer?.conversations || [])}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversationInModal}
          messages={conversationMessages}
          isStarred={starredCustomers.has((selectedCustomer?.email || selectedCustomer?.id))}
          onClose={() => {
            setShowConversationDetail(false);
            setSelectedConversation(null);
            setConversationMessages([]);
          }}
          onReply={handleReply}
          onStar={handleStarConversation}
          onArchive={handleArchiveConversation}
          onInitiateAction={handleInitiateAction}
          onPlayRecording={() => {}}
          onDownloadRecording={() => {}}
        />
      )}
    </div>
  );
};

export default ConversationsTab;
