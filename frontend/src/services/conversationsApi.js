/**
 * Conversations API Service
 * Integrates with customer_intelligence_agent, content_intelligence_agent, and business_intelligence_agent
 * to provide unified conversation data across all channels
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Mock data for development - in production this would come from actual agents
const mockConversationsData = [
  {
    id: '1',
    type: 'email',
    subject: 'Product Demo Request - TechCorp Solutions',
    participants: [
      { name: 'Sarah Johnson', email: 'sarah.johnson@techcorp.com', role: 'customer' },
      { name: 'Sales Agent', email: 'sales@guild-ai.com', role: 'agent' }
    ],
    status: 'active',
    priority: 'high',
    lastMessage: 'Looking forward to the demo next week. Please send calendar invite.',
    lastActivity: () => new Date(2024, 0, 12, 14, 30),
    createdAt: () => new Date(2024, 0, 8, 10, 15),
    messageCount: 8,
    tags: ['demo', 'enterprise', 'hot-lead'],
    agentType: 'sales',
    customerId: '1',
    summary: 'Customer interested in enterprise package. Demo scheduled for next week.',
    sentiment: 'positive',
    nextAction: 'Send calendar invite and demo materials',
    nextActionDate: () => new Date(2024, 0, 15),
    estimatedValue: 50000,
    actualValue: 0,
    source: 'customer_intelligence_agent',
    agentReasoning: 'Customer showed high engagement with product demo and requested enterprise pricing.'
  },
  {
    id: '2',
    type: 'voice',
    subject: 'Support Call - Account Issues',
    participants: [
      { name: 'Michael Chen', email: 'michael@growthmarketing.com', role: 'customer' },
      { name: 'Support Agent', email: 'support@guild-ai.com', role: 'agent' }
    ],
    status: 'resolved',
    priority: 'medium',
    lastMessage: 'Issue resolved. Customer satisfied with solution.',
    lastActivity: () => new Date(2024, 0, 11, 16, 45),
    createdAt: () => new Date(2024, 0, 11, 15, 20),
    messageCount: 1,
    tags: ['support', 'resolved', 'billing'],
    agentType: 'support',
    customerId: '2',
    summary: 'Customer had billing issues. Resolved by updating payment method.',
    sentiment: 'neutral',
    duration: 15,
    recordingUrl: '/recordings/call_20240111_1520.mp3',
    estimatedValue: 0,
    actualValue: 0,
    source: 'customer_intelligence_agent',
    agentReasoning: 'Customer reported payment failure - immediate attention required to prevent service interruption.'
  },
  {
    id: '3',
    type: 'chat',
    subject: 'Website Chat - Pricing Inquiry',
    participants: [
      { name: 'Emily Rodriguez', email: 'emily@startupxyz.com', role: 'customer' },
      { name: 'Chat Agent', email: 'chat@guild-ai.com', role: 'agent' }
    ],
    status: 'active',
    priority: 'medium',
    lastMessage: 'Can you send me more information about the startup package?',
    lastActivity: () => new Date(2024, 0, 12, 11, 20),
    createdAt: () => new Date(2024, 0, 12, 11, 15),
    messageCount: 12,
    tags: ['pricing', 'startup', 'inquiry'],
    agentType: 'chat',
    customerId: '3',
    summary: 'Startup founder inquiring about pricing. Interested in basic package.',
    sentiment: 'positive',
    nextAction: 'Send pricing information and schedule follow-up call',
    nextActionDate: () => new Date(2024, 0, 13),
    estimatedValue: 5000,
    actualValue: 0,
    source: 'content_intelligence_agent',
    agentReasoning: 'Customer spent significant time on pricing pages indicating strong purchase intent.'
  },
  {
    id: '4',
    type: 'social',
    subject: 'LinkedIn DM - Partnership Opportunity',
    participants: [
      { name: 'David Kim', email: 'david.kim@enterprise.com', role: 'customer' },
      { name: 'Partnership Agent', email: 'partnerships@guild-ai.com', role: 'agent' }
    ],
    status: 'active',
    priority: 'high',
    lastMessage: 'Would love to discuss a potential partnership. When can we meet?',
    lastActivity: () => new Date(2024, 0, 10, 9, 30),
    createdAt: () => new Date(2024, 0, 10, 9, 25),
    messageCount: 6,
    tags: ['partnership', 'linkedin', 'enterprise'],
    agentType: 'partnerships',
    customerId: '4',
    summary: 'Enterprise client interested in partnership opportunities.',
    sentiment: 'positive',
    nextAction: 'Schedule partnership meeting',
    nextActionDate: () => new Date(2024, 0, 16),
    estimatedValue: 100000,
    actualValue: 0,
    source: 'business_intelligence_agent',
    agentReasoning: 'Enterprise-level prospect with strategic partnership potential identified through social engagement.'
  },
  {
    id: '5',
    type: 'email',
    subject: 'Newsletter Subscription - Welcome Series',
    participants: [
      { name: 'Newsletter Subscriber', email: 'subscriber@example.com', role: 'customer' },
      { name: 'Email Agent', email: 'email@guild-ai.com', role: 'agent' }
    ],
    status: 'automated',
    priority: 'low',
    lastMessage: 'Welcome to our newsletter! Here are some tips to get started...',
    lastActivity: () => new Date(2024, 0, 12, 8, 0),
    createdAt: () => new Date(2024, 0, 12, 8, 0),
    messageCount: 1,
    tags: ['newsletter', 'automated', 'welcome'],
    agentType: 'email',
    customerId: null,
    summary: 'Automated welcome email sent to new newsletter subscriber.',
    sentiment: 'positive',
    campaign: 'Welcome Series',
    source: 'content_intelligence_agent',
    agentReasoning: 'New subscriber triggered automated welcome sequence to nurture engagement.'
  }
];

/**
 * Fetch conversations from all connected agents
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of conversation objects
 */
export async function fetchConversations(filters = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters,
        agents: ['customer_intelligence_agent', 'content_intelligence_agent', 'business_intelligence_agent']
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.conversations || [];
    } else {
      console.log(`API request failed for conversations, falling back to mock data: HTTP ${response.status}`);
      return filterMockConversations(mockConversationsData, filters);
    }
  } catch (error) {
    console.log('Error fetching conversations, falling back to mock data:', error.message);
    return filterMockConversations(mockConversationsData, filters);
  }
}

/**
 * Filter mock conversations based on provided filters
 * @param {Array} conversations - Array of conversation objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered conversations
 */
function filterMockConversations(conversations, filters) {
  // Convert date functions to actual dates
  const conversationsWithDates = conversations.map(conv => ({
    ...conv,
    lastActivity: typeof conv.lastActivity === 'function' ? conv.lastActivity() : conv.lastActivity,
    createdAt: typeof conv.createdAt === 'function' ? conv.createdAt() : conv.createdAt,
    nextActionDate: typeof conv.nextActionDate === 'function' ? conv.nextActionDate() : conv.nextActionDate
  }));
  
  let filtered = [...conversationsWithDates];

  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(conv => conv.type === filters.type);
  }

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(conv => conv.status === filters.status);
  }

  if (filters.agent && filters.agent !== 'all') {
    filtered = filtered.filter(conv => conv.agentType === filters.agent);
  }

  if (filters.priority && filters.priority !== 'all') {
    filtered = filtered.filter(conv => conv.priority === filters.priority);
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(conv => 
      conv.subject.toLowerCase().includes(searchTerm) ||
      conv.participants.some(p => p.name.toLowerCase().includes(searchTerm)) ||
      conv.lastMessage.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
}

/**
 * Get conversation details by ID
 * @param {string} conversationId - Unique conversation identifier
 * @returns {Promise<Object>} Conversation object with full details
 */
export async function getConversationById(conversationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.conversation;
    } else {
      console.log(`API request failed for conversation ${conversationId}, falling back to mock data: HTTP ${response.status}`);
      const mockConversation = mockConversationsData.find(conv => conv.id === conversationId);
      return mockConversation || null;
    }
  } catch (error) {
    console.log('Error fetching conversation details, falling back to mock data:', error.message);
    const mockConversation = mockConversationsData.find(conv => conv.id === conversationId);
    return mockConversation || null;
  }
}

/**
 * Get all conversations for a specific customer and flatten to message-like entries
 * Ensures the Customer Profile modal messaging tab stays in sync with dashboard
 * @param {Object} customer - expects at least { email, name }
 * @returns {Promise<Array>} Array of message-like objects
 */
export async function getMessagesForCustomer(customer) {
  try {
    // For now, we derive from mock conversations
    const all = filterMockConversations(mockConversationsData, {});
    const email = (customer?.email || '').toLowerCase();
    const relevant = all.filter(conv => (conv.participants || []).some(p => (p.role === 'customer') && (p.email || '').toLowerCase() === email));

    // Synthesize message-like rows from conversations for UI consumption
    const messages = relevant.flatMap((conv, idx) => {
      const customerParticipant = (conv.participants || []).find(p => p.role === 'customer') || {};
      const agentParticipant = (conv.participants || []).find(p => p.role === 'agent') || {};

      // Create a basic two-turn thread preview per conversation as fallback
      const createdAt = typeof conv.createdAt === 'function' ? conv.createdAt() : conv.createdAt;
      const lastActivity = typeof conv.lastActivity === 'function' ? conv.lastActivity() : conv.lastActivity;

      const subject = conv.subject || `${conv.type?.toUpperCase() || 'MSG'} with ${customerParticipant.name || customer.name || 'Customer'}`;
      const preview = conv.lastMessage || conv.summary || '';

      const base = [
        {
          id: `m_${conv.id}_in`,
          conversationId: conv.id,
          channel: conv.type === 'voice' ? 'phone' : (conv.type || 'chat'),
          direction: 'in',
          subject,
          timestamp: createdAt || new Date().toISOString(),
          preview: preview || 'Conversation started',
          sentiment: conv.sentiment || 'neutral',
          source: conv.source || 'customer_intelligence_agent',
          tags: conv.tags || [],
        },
        {
          id: `m_${conv.id}_out`,
          conversationId: conv.id,
          channel: conv.type === 'voice' ? 'phone' : (conv.type || 'chat'),
          direction: 'out',
          subject,
          timestamp: lastActivity || createdAt || new Date().toISOString(),
          preview: preview,
          sentiment: conv.sentiment || 'neutral',
          source: conv.source || 'customer_intelligence_agent',
          tags: conv.tags || [],
        }
      ];

      return base;
    });

    // Sort newest first
    return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (e) {
    console.error('Error building messages for customer:', e);
    return [];
  }
}

/**
 * Update conversation status
 * @param {string} conversationId - Unique conversation identifier
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated conversation object
 */
export async function updateConversation(conversationId, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (response.ok) {
      const data = await response.json();
      return data.conversation;
    } else {
      throw new Error('Failed to update conversation');
    }
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
}

/**
 * Get conversation analytics from business intelligence agent
 * @returns {Promise<Object>} Analytics data
 */
export async function getConversationAnalytics() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations/analytics`);
    
    if (response.ok) {
      const data = await response.json();
      return data.analytics;
    } else {
      console.log(`API request failed for conversation analytics, falling back to mock data: HTTP ${response.status}`);
      // Return mock analytics
      return {
        total: mockConversationsData.length,
        active: mockConversationsData.filter(c => c.status === 'active').length,
        resolved: mockConversationsData.filter(c => c.status === 'resolved').length,
        automated: mockConversationsData.filter(c => c.status === 'automated').length,
        highValue: mockConversationsData.filter(c => (c.estimatedValue || 0) >= 50000).length,
        recent: mockConversationsData.filter(c => {
          const lastActivity = typeof c.lastActivity === 'function' ? c.lastActivity() : c.lastActivity;
          const daysDiff = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        }).length
      };
    }
  } catch (error) {
    console.log('Error fetching conversation analytics, falling back to mock data:', error.message);
    // Return mock analytics as fallback
    return {
      total: mockConversationsData.length,
      active: mockConversationsData.filter(c => c.status === 'active').length,
      resolved: mockConversationsData.filter(c => c.status === 'resolved').length,
      automated: mockConversationsData.filter(c => c.status === 'automated').length,
      highValue: mockConversationsData.filter(c => (c.estimatedValue || 0) >= 50000).length,
      recent: mockConversationsData.filter(c => {
        const daysDiff = Math.floor((new Date() - new Date(c.lastActivity)) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
      }).length
    };
  }
}

/**
 * Get agent insights for conversations
 * @returns {Promise<Object>} Agent insights data
 */
export async function getAgentInsights() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agents/insights`);
    
    if (response.ok) {
      const data = await response.json();
      return data.insights;
    } else {
      // Return mock insights
      return {
        customer_intelligence: {
          agent: 'Customer Intelligence Agent',
          status: 'active',
          lastUpdate: new Date().toISOString(),
          insights: [
            'Monitoring customer sentiment across all channels',
            'Identified 3 high-value opportunities requiring attention',
            'Customer satisfaction score: 8.7/10'
          ]
        },
        business_intelligence: {
          agent: 'Business Intelligence Agent',
          status: 'active',
          lastUpdate: new Date().toISOString(),
          insights: [
            'Analyzing conversation patterns and customer journey',
            'Partnership opportunity detected with enterprise client',
            'Revenue potential: $150K identified in pipeline'
          ]
        },
        content_intelligence: {
          agent: 'Content Intelligence Agent',
          status: 'active',
          lastUpdate: new Date().toISOString(),
          insights: [
            'Managing automated email campaigns',
            'Social media engagement up 23% this week',
            'Content performance optimization in progress'
          ]
        }
      };
    }
  } catch (error) {
    console.error('Error fetching agent insights:', error);
    return {};
  }
}

export default {
  fetchConversations,
  getConversationById,
  updateConversation,
  getConversationAnalytics,
  getAgentInsights,
  getMessagesForCustomer
};
