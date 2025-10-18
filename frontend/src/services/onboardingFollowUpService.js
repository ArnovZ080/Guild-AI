/**
 * Service for managing onboarding follow-up and orchestrator integration
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class OnboardingFollowUpService {
  
  /**
   * Get user's source of truth data
   */
  async getSourceOfTruth() {
    try {
      const { auth } = await import('../config/firebase.js');
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_URL}/api/onboarding/data`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch source of truth: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching source of truth:', error);
      throw error;
    }
  }

  /**
   * Get incomplete onboarding fields
   */
  async getIncompleteFields() {
    try {
      const { auth } = await import('../config/firebase.js');
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_URL}/api/onboarding/incomplete`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch incomplete fields: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching incomplete fields:', error);
      throw error;
    }
  }

  /**
   * Get incomplete tasks with orchestrator prompts
   */
  async getIncompleteTasks() {
    try {
      const { auth } = await import('../config/firebase.js');
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_URL}/api/orchestrator/incomplete-tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch incomplete tasks: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching incomplete tasks:', error);
      throw error;
    }
  }

  /**
   * Initiate orchestrator workflow to complete a specific field
   */
  async initiateFieldCompletion(fieldId) {
    try {
      const { auth } = await import('../config/firebase.js');
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_URL}/api/orchestrator/complete-field`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ field_id: fieldId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to initiate field completion: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error initiating field completion:', error);
      throw error;
    }
  }

  /**
   * Update a completed field in the source of truth
   */
  async updateCompletedField(fieldId, value) {
    try {
      const { auth } = await import('../config/firebase.js');
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_URL}/api/orchestrator/update-field`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ field_id: fieldId, value })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update field: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating completed field:', error);
      throw error;
    }
  }

  /**
   * Save updated onboarding data
   */
  async saveOnboardingData(responses, incompleteFields = []) {
    try {
      const { auth } = await import('../config/firebase.js');
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_URL}/api/onboarding/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          responses,
          incomplete_fields: incompleteFields
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save onboarding data: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw error;
    }
  }

  /**
   * Get next follow-up question for incomplete fields
   */
  getNextFollowUpQuestion(incompleteFields) {
    const priorityOrder = [
      'business_type',
      'target_audience', 
      'customer_avatar',
      'audience_problems',
      'priority_3months',
      'brand_voice_tone',
      'brand_differentiation',
      'pricing_status',
      'marketing_budget'
    ];

    // Find the highest priority incomplete field
    for (const field of priorityOrder) {
      if (incompleteFields.includes(field)) {
        return {
          field,
          question: this.getFollowUpQuestion(field),
          action: this.getFollowUpAction(field)
        };
      }
    }

    return null;
  }

  /**
   * Get follow-up question for a specific field
   */
  getFollowUpQuestion(fieldId) {
    const questions = {
      'business_type': "Would you like help determining the best business type for your skills and market?",
      'target_audience': "Would you like help identifying your ideal target audience?",
      'customer_avatar': "Would you like help creating a detailed customer avatar?",
      'audience_problems': "Would you like help researching what problems your audience faces?",
      'brand_voice_tone': "Would you like help discovering your authentic brand voice?",
      'brand_colors': "Would you like help choosing brand colors that align with your personality?",
      'logo_status': "Would you like help creating or improving your logo?",
      'brand_story': "Would you like help crafting your brand story?",
      'brand_differentiation': "Would you like help identifying what makes you unique?",
      'pricing_status': "Would you like help developing a pricing strategy?",
      'marketing_budget': "Would you like help determining the right marketing budget?",
      'priority_3months': "Would you like help setting clear priorities for the next 3 months?"
    };

    return questions[fieldId] || `Would you like help completing your ${fieldId.replace('_', ' ')}?`;
  }

  /**
   * Get follow-up action for a specific field
   */
  getFollowUpAction(fieldId) {
    const actions = {
      'business_type': {
        agents: ['strategy_agent', 'business_consultant_agent'],
        task: 'determine_business_fit'
      },
      'target_audience': {
        agents: ['research_agent', 'audience_analysis_agent'],
        task: 'determine_optimal_audience'
      },
      'customer_avatar': {
        agents: ['research_agent', 'persona_builder_agent'],
        task: 'create_ideal_customer_avatar'
      },
      'audience_problems': {
        agents: ['research_agent', 'market_analysis_agent'],
        task: 'identify_audience_painpoints'
      },
      'brand_voice_tone': {
        agents: ['brand_strategist_agent', 'voice_analysis_agent'],
        task: 'define_brand_voice'
      },
      'brand_colors': {
        agents: ['brand_strategist_agent', 'color_psychology_agent'],
        task: 'develop_color_palette'
      },
      'logo_status': {
        agents: ['design_agent', 'logo_creator_agent'],
        task: 'create_improve_logo'
      },
      'brand_story': {
        agents: ['storytelling_agent', 'brand_narrative_agent'],
        task: 'craft_brand_story'
      },
      'brand_differentiation': {
        agents: ['strategy_agent', 'competitive_analysis_agent'],
        task: 'identify_unique_value'
      },
      'pricing_status': {
        agents: ['pricing_agent', 'market_research_agent'],
        task: 'develop_pricing_strategy'
      },
      'marketing_budget': {
        agents: ['marketing_agent', 'budget_planner_agent'],
        task: 'optimize_marketing_budget'
      },
      'priority_3months': {
        agents: ['strategy_agent', 'goal_setting_agent'],
        task: 'set_and_achieve_goals'
      }
    };

    return actions[fieldId] || {
      agents: ['orchestrator'],
      task: 'complete_field'
    };
  }
}

export default new OnboardingFollowUpService();