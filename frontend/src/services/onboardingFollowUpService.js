// Onboarding Follow-Up Service (frontend singleton)

class OnboardingFollowUpService {
  constructor() {
    this.followUpQuestions = this.initializeFollowUpQuestions();
    this.pendingFollowUps = [];
    this.completedFollowUps = [];
  }

  initializeFollowUpQuestions() {
    return {
      benefit_audience: {
        question: "Who do you imagine benefits the most from what you offer?",
        followUpQuestion:
          'Would you like to work on who the best audience for your product or service will be?',
        action: {
          type: 'orchestrator_initiate',
          agents: ['research_agent', 'audience_analysis_agent'],
          task: 'determine_optimal_audience',
          description: "Find the right audience for the user's product or service",
        },
      },
      customer_avatar: {
        question: 'Do you already have a customer avatar (ideal client profile)?',
        followUpQuestion: 'Would you like us to build your Ideal Customer Avatar?',
        action: {
          type: 'orchestrator_initiate',
          agents: ['research_agent', 'persona_builder_agent'],
          task: 'create_ideal_customer_avatar',
          description:
            "Determine the user's ideal client avatar for their product or service",
        },
      },
      audience_problems: {
        question: "What's the biggest problem your audience struggles with?",
        followUpQuestion:
          'Should we do some research to see what the biggest problem is that your audience struggles with?',
        action: {
          type: 'orchestrator_initiate',
          agents: ['research_agent', 'market_analysis_agent'],
          task: 'identify_audience_painpoints',
          description:
            "Determine the biggest hurdles/problems/painpoints of the user's ideal client",
        },
      },
      audience_size: {
        question: 'How big is your current audience or customer base?',
        followUpQuestion: "Let's determine the size of your current audience",
        action: {
          type: 'orchestrator_initiate',
          agents: ['research_agent', 'analytics_agent'],
          task: 'analyze_audience_size',
          description:
            "Ask the user's about their followings on social platforms and email list size",
        },
      },
      business_type: {
        question: 'What type of business are you running (or planning to run)?',
        followUpQuestion: "Let's find out what business will be right up your alley",
        action: {
          type: 'orchestrator_initiate',
          agents: ['strategy_agent', 'business_consultant_agent'],
          task: 'determine_business_fit',
          description:
            "Determine the best business fit for the user based on passions, interests and existing skills",
        },
      },
      pricing_status: {
        question: 'How are you handling pricing right now?',
        followUpQuestion: 'Would you like us to work on your pricing strategy?',
        action: {
          type: 'orchestrator_initiate',
          agents: ['pricing_agent', 'market_research_agent'],
          task: 'develop_pricing_strategy',
          description:
            "Determine the best pricing strategy for the user's existing products and services based on market research",
        },
      },
      marketing_budget: {
        question: 'Do you have a monthly marketing/advertising budget?',
        followUpQuestion:
          'Would you like some help figuring out what budget for your marketing/advertising will yield the best results?',
        action: {
          type: 'orchestrator_initiate',
          agents: ['marketing_agent', 'budget_planner_agent'],
          task: 'optimize_marketing_budget',
          description:
            'Determine what results certain budgets will have when combined with social media marketing strategies',
        },
      },
      priority_3months: {
        question: "What's your #1 priority for the next 3 months?",
        followUpQuestion:
          'Would you like us to help you determine your biggest priority for the next 3 months?',
        action: {
          type: 'orchestrator_initiate',
          agents: ['strategy_agent', 'goal_setting_agent'],
          task: 'set_and_achieve_goals',
          description:
            "Help the user set goals and then initiate actions to achieve them",
        },
      },
      guild_working_style: {
        question: 'How do you prefer Guild to work with you?',
        followUpQuestion:
          "Would you like to work out and delve deeper into how we can benefit you?",
        action: {
          type: 'orchestrator_initiate',
          agents: ['strategy_agent', 'consultation_agent'],
          task: 'discover_user_needs',
          description:
            "Find out the user's biggest pain points and explain capabilities",
        },
      },
      data_storage: {
        question: 'Where would you prefer to store your business data?',
        followUpQuestion:
          'Should we help you set up a local storage space for your business data?',
        action: {
          type: 'orchestrator_initiate',
          agents: ['data_management_agent', 'storage_setup_agent'],
          task: 'setup_data_storage',
          description: "Create local storage areas or databases for the users' data",
        },
      },
      sensitive_data: {
        question: 'How do you want Guild to handle sensitive information?',
        followUpQuestion: "Let's work on a solution for your sensitive storage information",
        action: {
          type: 'orchestrator_initiate',
          agents: ['security_agent', 'data_protection_agent'],
          task: 'setup_secure_storage',
          description:
            'Work on secure storage options, local or secure cloud like Drive/OneDrive',
        },
      },
      brand_voice_tone: {
        question: "How would you describe your brand's voice and tone?",
        followUpQuestion:
          'Would you like us to help you discover and define your brand voice?',
        action: {
          type: 'orchestrator_initiate',
          agents: ['brand_strategist_agent', 'voice_analysis_agent'],
          task: 'define_brand_voice',
          description:
            "Analyze existing content and feedback to discover the user's authentic brand voice",
        },
      },
      brand_colors: {
        question: 'Do you have established brand colors?',
        followUpQuestion:
          'Should we help you choose brand colors that align with your personality and industry?',
        action: {
          type: 'orchestrator_initiate',
          agents: ['brand_strategist_agent', 'color_psychology_agent'],
          task: 'develop_color_palette',
          description:
            'Choose brand colors that align with personality, industry, and audience preferences',
        },
      },
      logo_status: {
        question: "What's the status of your logo?",
        followUpQuestion: 'Would you like us to help create or improve your logo?',
        action: {
          type: 'orchestrator_initiate',
          agents: ['design_agent', 'logo_creator_agent'],
          task: 'create_improve_logo',
          description:
            'Create professional logo concepts and iterations based on brand identity',
        },
      },
      brand_story: {
        question: 'Do you have a clear brand story or origin story?',
        followUpQuestion: 'Should we help you craft a compelling brand story?',
        action: {
          type: 'orchestrator_initiate',
          agents: ['storytelling_agent', 'brand_narrative_agent'],
          task: 'craft_brand_story',
          description:
            'Craft a compelling narrative that connects with the audience and differentiates the brand',
        },
      },
      brand_differentiation: {
        question: 'What makes your brand unique or different?',
        followUpQuestion:
          'Would you like us to help identify and articulate what makes you unique?',
        action: {
          type: 'orchestrator_initiate',
          agents: ['strategy_agent', 'competitive_analysis_agent'],
          task: 'identify_unique_value',
          description:
            "Identify and articulate what makes the user's brand special vs competitors",
        },
      },
    };
  }

  analyzeOnboardingAnswers(answers) {
    const notSureAnswers = [];
    const notSurePhrases = [
      'not sure',
      "i don't know",
      'unsure',
      'not sure yet',
      "i'm not sure",
      "don't know",
      'uncertain',
      'maybe later',
      "i haven't really thought about it",
      "i'm not sure what",
      "i don't think",
      "i haven't",
      "i don't have",
      "don't track",
      'not sure what that is',
    ];
    Object.entries(answers).forEach(([questionId, answer]) => {
      if (typeof answer === 'string') {
        const lowerAnswer = answer.toLowerCase();
        const isNotSure = notSurePhrases.some((phrase) => lowerAnswer.includes(phrase));
        if (isNotSure && this.followUpQuestions[questionId]) {
          notSureAnswers.push({
            questionId,
            originalAnswer: answer,
            followUpData: this.followUpQuestions[questionId],
          });
        }
      }
    });
    return notSureAnswers;
  }

  generateFollowUpQuestions(notSureAnswers) {
    return notSureAnswers.map((item) => ({
      id: `followup_${item.questionId}`,
      originalQuestion: item.followUpData.question,
      originalAnswer: item.originalAnswer,
      followUpQuestion: item.followUpData.followUpQuestion,
      action: item.followUpData.action,
      priority: this.calculatePriority(item.questionId),
      status: 'pending',
    }));
  }

  calculatePriority(questionId) {
    const highPriority = [
      'business_type',
      'benefit_audience',
      'customer_avatar',
      'audience_problems',
      'priority_3months',
    ];
    const mediumPriority = [
      'pricing_status',
      'marketing_budget',
      'brand_voice_tone',
      'brand_differentiation',
      'guild_working_style',
    ];
    if (highPriority.includes(questionId)) return 'high';
    if (mediumPriority.includes(questionId)) return 'medium';
    return 'low';
  }

  storeFollowUpQuestions(followUpQuestions) {
    this.pendingFollowUps = followUpQuestions;
    localStorage.setItem('guild_pending_followups', JSON.stringify(followUpQuestions));
    return followUpQuestions;
  }

  processOnboardingCompletion(answers) {
    const notSureAnswers = this.analyzeOnboardingAnswers(answers);
    const followUpQuestions = this.generateFollowUpQuestions(notSureAnswers);
    if (followUpQuestions.length > 0) {
      this.storeFollowUpQuestions(followUpQuestions);
      const onboardingData = {
        ...answers,
        hasPendingFollowUps: true,
        followUpCount: followUpQuestions.length,
        onboardingCompletedAt: new Date().toISOString(),
      };
      localStorage.setItem('guild_onboarding_data', JSON.stringify(onboardingData));
      return {
        success: true,
        followUpQuestions,
        message: `Identified ${followUpQuestions.length} follow-ups to help you progress.`,
      };
    }
    return { success: true, followUpQuestions: [], message: 'Onboarding complete.' };
  }
}

const onboardingFollowUpService = new OnboardingFollowUpService();
export default onboardingFollowUpService;


