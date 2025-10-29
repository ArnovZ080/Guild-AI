// Customer Action Handler Utility
export const handleCustomerAction = (action, data, context = {}) => {
  console.log('Customer action:', action, data);
  
  switch (action) {
    // Profile Actions
    case 'view_profile':
      return { type: 'open_modal', modal: 'customer_profile', data };
    
    case 'edit_profile':
      return { type: 'open_modal', modal: 'edit_customer', data };
    
    case 'delete_profile':
      return { type: 'confirm_action', message: 'Are you sure you want to delete this customer?', action: 'delete_customer', data };
    
    // Communication Actions
    case 'message':
      return { type: 'open_modal', modal: 'compose_message', data };
    
    case 'call':
      return { type: 'open_modal', modal: 'schedule_call', data };
    
    case 'email':
      return { type: 'open_modal', modal: 'compose_email', data };
    
    case 'ai_outreach':
      return { type: 'open_modal', modal: 'ai_outreach', data };
    
    // Retention Actions
    case 'execute_playbook':
      return { type: 'open_modal', modal: 'approve_action', 
        title: 'Execute Retention Playbook',
        message: `Are you sure you want to execute the "${data.name}" playbook?`,
        details: data.actions,
        action: 'execute_playbook',
        data 
      };
    
    case 'edit_playbook':
      return { type: 'open_modal', modal: 'edit_playbook', data };
    
    case 'pause_playbook':
      return { type: 'confirm_action', message: 'Pause this playbook?', action: 'pause_playbook', data };
    
    case 'retention_outreach':
      return { type: 'open_modal', modal: 'retention_outreach', data };
    
    case 'schedule_call':
      return { type: 'open_modal', modal: 'schedule_call', data };
    
    case 'send_email':
      return { type: 'open_modal', modal: 'compose_email', data };
    
    // Messaging Actions
    case 'reply':
      return { type: 'open_modal', modal: 'compose_message', data: { ...data, action: 'reply' } };
    
    case 'forward':
      return { type: 'open_modal', modal: 'forward_message', data };
    
    case 'archive':
      return { type: 'confirm_action', 
        message: `Are you sure you want to archive this conversation with ${data.customer?.name || 'customer'}?`, 
        action: 'archive_conversation', 
        data 
      };
    
    // Campaign Actions
    case 'execute_campaign':
      return { type: 'open_modal', modal: 'approve_action',
        title: 'Execute Campaign',
        message: `Are you sure you want to execute the "${data.name}" campaign?`,
        details: data.actions,
        action: 'execute_campaign',
        data
      };
    
    case 'edit_campaign':
      return { type: 'open_modal', modal: 'edit_campaign', data };
    
    case 'pause_campaign':
      return { type: 'confirm_action', message: 'Pause this campaign?', action: 'pause_campaign', data };
    
    // Segment Actions
    case 'view_segment':
      return { type: 'open_modal', modal: 'customer_segment', data };
    
    case 'execute_campaign':
      return { type: 'open_modal', modal: 'approve_action',
        title: 'Execute Segment Campaign',
        message: `Execute campaign for segment "${data.name}"?`,
        action: 'execute_segment_campaign',
        data
      };
    
    case 'export':
      return { type: 'download', format: 'csv', data };

    case 'export_customers':
      return { type: 'open_modal', modal: 'export_customers', data };

    case 'import_customers':
      return { type: 'open_modal', modal: 'import_customers', data };
    
    case 'analyze':
      return { type: 'open_modal', modal: 'ai_analysis', data };
    
    // Bulk Actions
    case 'bulk_actions':
      return { type: 'open_modal', modal: 'bulk_actions', data };
    
    // Agent Actions
    case 'activate_agents':
      return { type: 'open_modal', modal: 'approve_action',
        title: 'Activate AI Agents',
        message: 'Activate AI agents to execute recommended actions?',
        details: data.recommendations,
        action: 'activate_agents',
        data
      };
    
    default:
      console.log('Unknown action:', action);
      return { type: 'error', message: `Unknown action: ${action}` };
  }
};

// Modal data formatters
export const formatModalData = (action, data) => {
  switch (action) {
    case 'customer_profile':
      return {
        customer: data,
        showTimeline: true,
        showAIInsights: true,
        showActions: true
      };
    
    case 'compose_message':
      return {
        recipient: data,
        type: 'message',
        channels: ['email', 'sms', 'chat']
      };
    
    case 'schedule_call':
      return {
        customer: data,
        type: 'call',
        integration: 'calendar'
      };
    
    case 'ai_outreach':
      return {
        customer: data,
        type: 'ai_optimized',
        channels: ['email', 'call', 'message'],
        showPreview: true
      };
    
    case 'retention_outreach':
      return {
        customer: data,
        type: 'retention',
        urgency: data.churn_risk,
        showRecommendations: true
      };
    
    case 'segment':
      return { type: 'open_modal', modal: 'customer_segment', data };

    case 'assign_segment':
      return { 
        type: 'confirm_action', 
        message: `Assign ${data?.customer?.name || 'customer'} to segment "${data?.segment?.name || ''}"?`,
        action: 'run_workflow',
        data: { payload: { workflow: 'assign_segment', context: data } }
      };
    
    default:
      return data;
  }
};
