import {
  Calendar, DollarSign, FileText, Users, Camera, Globe,
  BarChart, MessageSquare, Zap, Database, Wrench, Shield,
  Package, TrendingUp, Mail, Video, Phone, ShoppingCart,
  Cloud, Palette, Smartphone, Headphones, Layout, Monitor,
  Layers, CheckSquare, Target, Brain, Heart, FileCode
} from 'lucide-react';

/**
 * Comprehensive connector configurations for Guild-AI platform
 * Each connector includes detailed setup instructions, API documentation, and platform-specific guidance
 * 
 * This configuration supports transparency and learning by providing:
 * - Clear, step-by-step API key acquisition instructions
 * - Educational context about what each integration does
 * - Direct links to official documentation
 * - Security best practices
 */

export const connectorConfigurations = {
  // ======================
  // PROJECT MANAGEMENT
  // ======================
  asana: {
    id: 'asana',
    name: 'Asana',
    category: 'project_management',
    status: 'active',
    icon: Calendar,
    color: 'bg-purple-500',
    description: 'Connect Asana to sync tasks, projects, and team workflows. Guild agents can create tasks, update project status, and coordinate team activities automatically.',
    capabilities: ['tasks', 'projects', 'teams', 'users', 'comments', 'attachments'],
    use_cases: [
      'Automatically create tasks from customer feedback',
      'Update project status based on workflow completion',
      'Sync team assignments and deadlines',
      'Generate project reports and insights'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '2-3 minutes',
    documentation_url: 'https://developers.asana.com/docs',
    api_key_instructions: {
      title: 'How to Get Your Asana API Key',
      steps: [
        {
          step: 1,
          action: 'Log in to your Asana account',
          details: 'Go to https://app.asana.com and sign in with your credentials'
        },
        {
          step: 2,
          action: 'Navigate to My Settings',
          details: 'Click your profile photo in the top right, then select "My Settings"'
        },
        {
          step: 3,
          action: 'Go to the Apps tab',
          details: 'In the left sidebar, click on "Apps" to access developer settings'
        },
        {
          step: 4,
          action: 'Create a Personal Access Token',
          details: 'Scroll down to "Personal access tokens" and click "Create new token"'
        },
        {
          step: 5,
          action: 'Copy your token',
          details: 'Give your token a descriptive name (e.g., "Guild AI Integration"), then copy the generated token immediately - it won\'t be shown again!'
        }
      ],
      notes: [
        'Personal Access Tokens have full access to your Asana account',
        'Treat this token like a password - never share it publicly',
        'You can revoke access anytime from the same settings page'
      ],
      troubleshooting: [
        {
          issue: 'Token not working',
          solution: 'Ensure you copied the entire token without extra spaces'
        },
        {
          issue: 'Permission errors',
          solution: 'Check that your Asana account has appropriate permissions for the workspace'
        }
      ]
    },
    required_permissions: ['read', 'write'],
    security_notes: 'Your API token is encrypted and stored securely. Guild only accesses data necessary for the features you enable.',
    transparency_info: {
      data_accessed: ['Tasks', 'Projects', 'Team members', 'Comments', 'Attachments'],
      data_stored: 'We cache project metadata for performance but sync with Asana in real-time',
      frequency: 'Guild syncs every 5 minutes or on-demand when agents need data'
    }
  },

  linear: {
    id: 'linear',
    name: 'Linear',
    category: 'project_management',
    status: 'active',
    icon: Calendar,
    color: 'bg-blue-500',
    description: 'Integrate Linear for streamlined issue tracking and project management. Perfect for software development teams using modern workflows.',
    capabilities: ['issues', 'projects', 'teams', 'users', 'cycles', 'roadmaps'],
    use_cases: [
      'Auto-create issues from bug reports',
      'Track sprint progress and velocity',
      'Sync development roadmaps',
      'Generate engineering insights'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '2-3 minutes',
    documentation_url: 'https://developers.linear.app/docs',
    api_key_instructions: {
      title: 'How to Get Your Linear API Key',
      steps: [
        {
          step: 1,
          action: 'Log in to Linear',
          details: 'Go to https://linear.app and sign in'
        },
        {
          step: 2,
          action: 'Access Settings',
          details: 'Click your avatar in the bottom left, then select "Settings"'
        },
        {
          step: 3,
          action: 'Navigate to API',
          details: 'In the left sidebar, find and click "API" under the Workspace section'
        },
        {
          step: 4,
          action: 'Create Personal API Key',
          details: 'Click "Create new key", give it a name like "Guild AI", and copy the generated key'
        }
      ],
      notes: [
        'API keys inherit your permissions in Linear',
        'You can create multiple keys for different integrations',
        'Keys can be revoked anytime from the same page'
      ]
    },
    required_permissions: ['read', 'write'],
    documentation_url: 'https://developers.linear.app/docs'
  },

  monday: {
    id: 'monday',
    name: 'Monday.com',
    category: 'project_management',
    status: 'active',
    icon: Calendar,
    color: 'bg-red-500',
    description: 'Connect Monday.com to manage boards, items, and team workflows with visual project tracking.',
    capabilities: ['boards', 'items', 'columns', 'users', 'groups', 'updates'],
    use_cases: [
      'Sync board updates across tools',
      'Automate status updates based on triggers',
      'Create items from external sources',
      'Generate board analytics'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://developer.monday.com/api-reference',
    api_key_instructions: {
      title: 'How to Get Your Monday.com API Token',
      steps: [
        {
          step: 1,
          action: 'Log in to Monday.com',
          details: 'Access your Monday.com workspace'
        },
        {
          step: 2,
          action: 'Open Admin Panel',
          details: 'Click your avatar, then select "Admin"'
        },
        {
          step: 3,
          action: 'Navigate to API',
          details: 'In the Admin section, find "API" in the left menu'
        },
        {
          step: 4,
          action: 'Generate Token',
          details: 'Click "Copy" next to your API token, or generate a new one if needed'
        }
      ],
      notes: [
        'API v2 is recommended for best compatibility',
        'Token provides access to all boards you can see',
        'Consider creating a dedicated API user for integrations'
      ]
    },
    required_permissions: ['read', 'write']
  },

  notion: {
    id: 'notion',
    name: 'Notion',
    category: 'productivity',
    status: 'active',
    icon: FileText,
    color: 'bg-gray-800',
    description: 'Integrate Notion to search, update, and power workflows across your knowledge base, databases, and documentation.',
    capabilities: ['pages', 'databases', 'blocks', 'users', 'search'],
    use_cases: [
      'Auto-populate databases from external sources',
      'Search across your knowledge base',
      'Create meeting notes automatically',
      'Sync project documentation'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-7 minutes',
    documentation_url: 'https://developers.notion.com/docs',
    api_key_instructions: {
      title: 'How to Create a Notion Integration',
      steps: [
        {
          step: 1,
          action: 'Go to Notion Integrations',
          details: 'Visit https://www.notion.so/my-integrations'
        },
        {
          step: 2,
          action: 'Create New Integration',
          details: 'Click "+ New integration" and give it a name like "Guild AI"'
        },
        {
          step: 3,
          action: 'Configure Capabilities',
          details: 'Select the capabilities needed: Read content, Update content, Insert content'
        },
        {
          step: 4,
          action: 'Copy Internal Integration Token',
          details: 'After creation, copy the "Internal Integration Token"'
        },
        {
          step: 5,
          action: 'Share Pages with Integration',
          details: 'In Notion, open pages you want to access, click "Share", and invite your integration'
        }
      ],
      notes: [
        'Integrations only access pages explicitly shared with them',
        'You can modify permissions anytime',
        'Different workspaces require separate integrations'
      ],
      troubleshooting: [
        {
          issue: 'Cannot access page',
          solution: 'Make sure the page is shared with your integration via the Share menu'
        }
      ]
    },
    required_permissions: ['read', 'write', 'insert']
  },

  // ======================
  // PAYMENTS & FINANCE
  // ======================
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    category: 'payments',
    status: 'active',
    icon: DollarSign,
    color: 'bg-indigo-600',
    description: 'Connect Stripe for payment processing, subscription management, and financial infrastructure. Track revenue, manage customers, and automate billing.',
    capabilities: ['payments', 'customers', 'subscriptions', 'invoices', 'payouts', 'disputes'],
    use_cases: [
      'Monitor revenue and payment trends',
      'Automatically handle failed payments',
      'Sync customer data with CRM',
      'Generate financial reports',
      'Track subscription metrics'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '2-3 minutes',
    documentation_url: 'https://stripe.com/docs/api',
    api_key_instructions: {
      title: 'How to Get Your Stripe API Keys',
      steps: [
        {
          step: 1,
          action: 'Log in to Stripe Dashboard',
          details: 'Go to https://dashboard.stripe.com and sign in'
        },
        {
          step: 2,
          action: 'Navigate to Developers',
          details: 'Click "Developers" in the top navigation bar'
        },
        {
          step: 3,
          action: 'Select API Keys',
          details: 'In the left sidebar, click "API keys"'
        },
        {
          step: 4,
          action: 'Choose Environment',
          details: 'Use "Test mode" for testing, "Live mode" for production. Toggle using the switch'
        },
        {
          step: 5,
          action: 'Copy Secret Key',
          details: 'Click "Reveal test/live key" next to "Secret key" and copy it. The key starts with sk_test_ or sk_live_'
        }
      ],
      notes: [
        'Never expose your Secret Key in client-side code',
        'Use Test mode keys while setting up and testing',
        'Switch to Live mode keys only when ready for production',
        'Publishable keys (pk_) are different from Secret keys (sk_)'
      ],
      troubleshooting: [
        {
          issue: 'API key not working',
          solution: 'Ensure you\'re using the Secret key (sk_), not the Publishable key (pk_)'
        },
        {
          issue: 'Test data not syncing',
          solution: 'Verify you\'re in Test mode and using test mode keys'
        }
      ]
    },
    required_permissions: ['read', 'write'],
    security_notes: 'Stripe keys are stored encrypted. We follow PCI compliance best practices and never store sensitive payment data.',
    transparency_info: {
      data_accessed: ['Payments', 'Customers', 'Subscriptions', 'Invoices', 'Products'],
      data_stored: 'We cache transaction metadata only, never full payment details',
      frequency: 'Real-time webhook updates for payments, hourly sync for other data'
    }
  },

  // ======================
  // CRM & SALES
  // ======================
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    status: 'active',
    icon: Database,
    color: 'bg-orange-500',
    description: 'Connect HubSpot to access CRM data, marketing automation, and sales pipelines. Sync contacts, companies, deals, and tickets seamlessly.',
    capabilities: ['contacts', 'companies', 'deals', 'tickets', 'emails', 'tasks', 'meetings'],
    use_cases: [
      'Auto-enrich contact records',
      'Track deal progression',
      'Sync marketing campaigns',
      'Generate sales insights',
      'Automate follow-ups'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-7 minutes',
    documentation_url: 'https://developers.hubspot.com/',
    api_key_instructions: {
      title: 'How to Create a HubSpot Private App',
      steps: [
        {
          step: 1,
          action: 'Log in to HubSpot',
          details: 'Access your HubSpot account'
        },
        {
          step: 2,
          action: 'Navigate to Settings',
          details: 'Click the settings icon in the top navigation'
        },
        {
          step: 3,
          action: 'Go to Integrations',
          details: 'In the left sidebar, find "Integrations" and click "Private Apps"'
        },
        {
          step: 4,
          action: 'Create Private App',
          details: 'Click "Create a private app" and give it a name like "Guild AI Integration"'
        },
        {
          step: 5,
          action: 'Configure Scopes',
          details: 'Select the scopes needed: CRM (contacts, companies, deals), Content, Tickets'
        },
        {
          step: 6,
          action: 'Copy Access Token',
          details: 'After creation, copy the access token from the "Auth" tab'
        }
      ],
      notes: [
        'Private Apps are the recommended authentication method',
        'Grant only the scopes you need',
        'You can modify scopes later',
        'API keys from the Integrations page are deprecated'
      ]
    },
    required_permissions: ['crm.objects.contacts', 'crm.objects.companies', 'crm.objects.deals']
  },

  salesforce: {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    status: 'active',
    icon: Database,
    color: 'bg-blue-500',
    description: 'Integrate with Salesforce CRM to access leads, opportunities, accounts, and contacts. Perfect for sales teams using enterprise CRM.',
    capabilities: ['leads', 'opportunities', 'accounts', 'contacts', 'tasks', 'campaigns'],
    use_cases: [
      'Sync lead information',
      'Track opportunity pipeline',
      'Update account data',
      'Create tasks automatically',
      'Monitor campaign performance'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developer.salesforce.com/',
    api_key_instructions: {
      title: 'How to Create Salesforce Connected App',
      steps: [
        {
          step: 1,
          action: 'Log in to Salesforce',
          details: 'Access your Salesforce org as an administrator'
        },
        {
          step: 2,
          action: 'Navigate to Setup',
          details: 'Click the gear icon and select "Setup"'
        },
        {
          step: 3,
          action: 'Find App Manager',
          details: 'In Quick Find, search for "App Manager"'
        },
        {
          step: 4,
          action: 'Create Connected App',
          details: 'Click "New Connected App" and fill in basic information'
        },
        {
          step: 5,
          action: 'Enable OAuth Settings',
          details: 'Check "Enable OAuth Settings", set callback URL, and select OAuth scopes'
        },
        {
          step: 6,
          action: 'Get Consumer Key and Secret',
          details: 'After saving, copy the Consumer Key and Consumer Secret'
        }
      ],
      notes: [
        'Requires administrator access to create Connected Apps',
        'OAuth 2.0 is the recommended authentication method',
        'You\'ll need to authorize the app after setup'
      ]
    },
    required_permissions: ['api', 'full']
  },

  // ======================
  // SOCIAL MEDIA
  // ======================
  facebook: {
    id: 'facebook',
    name: 'Facebook Business',
    category: 'social_media',
    status: 'active',
    icon: Globe,
    color: 'bg-blue-600',
    description: 'Manage Facebook pages, posts, and advertising campaigns. Access insights, schedule content, and track engagement metrics.',
    capabilities: ['pages', 'posts', 'ads', 'insights', 'lead_forms', 'comments'],
    use_cases: [
      'Schedule and publish posts',
      'Monitor page engagement',
      'Manage ad campaigns',
      'Respond to comments',
      'Track lead generation'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developers.facebook.com/docs/marketing-api/',
    api_key_instructions: {
      title: 'How to Get Facebook Access Token',
      steps: [
        {
          step: 1,
          action: 'Go to Facebook Developers',
          details: 'Visit https://developers.facebook.com'
        },
        {
          step: 2,
          action: 'Create or Select App',
          details: 'Create a new app or select an existing one'
        },
        {
          step: 3,
          action: 'Add Facebook Login',
          details: 'In your app dashboard, add the Facebook Login product'
        },
        {
          step: 4,
          action: 'Generate Access Token',
          details: 'Go to Tools > Access Token Tool and generate a User or Page Access Token'
        },
        {
          step: 5,
          action: 'Extend Token (Optional)',
          details: 'Use the Access Token Debugger to exchange for a long-lived token'
        }
      ],
      notes: [
        'User tokens expire in 60 days, Page tokens can be permanent',
        'Requires Business verification for advanced features',
        'Request only necessary permissions'
      ]
    },
    required_permissions: ['pages_manage_posts', 'pages_read_engagement', 'ads_management']
  },

  instagram: {
    id: 'instagram',
    name: 'Instagram Business',
    category: 'social_media',
    status: 'active',
    icon: Camera,
    color: 'bg-pink-500',
    description: 'Manage Instagram business accounts, publish content, and track performance metrics. Access media, stories, and audience insights.',
    capabilities: ['posts', 'stories', 'insights', 'media', 'comments', 'mentions'],
    use_cases: [
      'Schedule Instagram posts',
      'Track engagement metrics',
      'Manage comments and DMs',
      'Analyze audience demographics',
      'Monitor story performance'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developers.facebook.com/docs/instagram-api/',
    api_key_instructions: {
      title: 'How to Connect Instagram Business Account',
      steps: [
        {
          step: 1,
          action: 'Convert to Business Account',
          details: 'Ensure your Instagram account is a Business or Creator account'
        },
        {
          step: 2,
          action: 'Connect to Facebook Page',
          details: 'Link your Instagram Business account to a Facebook Page'
        },
        {
          step: 3,
          action: 'Use Facebook App',
          details: 'The Instagram API uses Facebook authentication - create a Facebook App'
        },
        {
          step: 4,
          action: 'Add Instagram Product',
          details: 'In your Facebook app, add the Instagram product'
        },
        {
          step: 5,
          action: 'Generate Access Token',
          details: 'Generate a Page Access Token with Instagram permissions'
        }
      ],
      notes: [
        'Instagram API requires a connected Facebook Page',
        'Personal accounts cannot use the Instagram API',
        'Rate limits apply based on your app review status'
      ]
    },
    required_permissions: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement']
  },

  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'social_media',
    status: 'active',
    icon: Users,
    color: 'bg-blue-700',
    description: 'Connect LinkedIn for professional networking, content publishing, and company page management. Track engagement and build your professional presence.',
    capabilities: ['company_pages', 'posts', 'analytics', 'messaging', 'profiles'],
    use_cases: [
      'Publish company updates',
      'Track post engagement',
      'Manage professional network',
      'Analyze page performance',
      'Share articles and insights'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://docs.microsoft.com/en-us/linkedin/',
    api_key_instructions: {
      title: 'How to Create LinkedIn Application',
      steps: [
        {
          step: 1,
          action: 'Go to LinkedIn Developers',
          details: 'Visit https://www.linkedin.com/developers/apps'
        },
        {
          step: 2,
          action: 'Create New App',
          details: 'Click "Create app" and fill in required information'
        },
        {
          step: 3,
          action: 'Verify Company Page',
          details: 'Associate your app with a LinkedIn Company Page (you must be admin)'
        },
        {
          step: 4,
          action: 'Request API Access',
          details: 'Apply for the necessary API products (Marketing Developer Platform, etc.)'
        },
        {
          step: 5,
          action: 'Get Client Credentials',
          details: 'Once approved, copy your Client ID and Client Secret from the Auth tab'
        }
      ],
      notes: [
        'LinkedIn API access requires company verification',
        'Different products have different approval requirements',
        'Marketing API requires LinkedIn Marketing Partner status'
      ]
    },
    required_permissions: ['w_member_social', 'r_organization_social', 'w_organization_social']
  },

  // ======================
  // COMMUNICATION
  // ======================
  slack: {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    status: 'active',
    icon: MessageSquare,
    color: 'bg-purple-500',
    description: 'Integrate Slack for team communication, notifications, and workflow automation. Send messages, create channels, and respond to events.',
    capabilities: ['messages', 'channels', 'users', 'files', 'reactions', 'threads'],
    use_cases: [
      'Send automated notifications',
      'Create channels for projects',
      'Share reports and updates',
      'Respond to team mentions',
      'Archive important conversations'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://api.slack.com/',
    api_key_instructions: {
      title: 'How to Create Slack App and Get Token',
      steps: [
        {
          step: 1,
          action: 'Go to Slack API',
          details: 'Visit https://api.slack.com/apps'
        },
        {
          step: 2,
          action: 'Create New App',
          details: 'Click "Create New App" and choose "From scratch"'
        },
        {
          step: 3,
          action: 'Add Bot Scopes',
          details: 'Go to "OAuth & Permissions" and add required Bot Token Scopes'
        },
        {
          step: 4,
          action: 'Install to Workspace',
          details: 'Click "Install to Workspace" and authorize'
        },
        {
          step: 5,
          action: 'Copy Bot Token',
          details: 'Copy the "Bot User OAuth Token" (starts with xoxb-)'
        }
      ],
      notes: [
        'Bot tokens are more secure than user tokens',
        'Add only the scopes you need',
        'You can update scopes and reinstall anytime'
      ]
    },
    required_permissions: ['chat:write', 'channels:read', 'users:read']
  },

  gmail: {
    id: 'gmail',
    name: 'Gmail',
    category: 'communication',
    status: 'active',
    icon: Mail,
    color: 'bg-red-500',
    description: 'Connect Gmail to send emails, manage drafts, and search conversations. Automate email workflows and organize your inbox.',
    capabilities: ['send_email', 'drafts', 'labels', 'search', 'threads', 'attachments'],
    use_cases: [
      'Send automated emails',
      'Create and manage drafts',
      'Search email history',
      'Organize with labels',
      'Track email threads'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '7-10 minutes',
    documentation_url: 'https://developers.google.com/gmail/api',
    api_key_instructions: {
      title: 'How to Set Up Gmail API',
      steps: [
        {
          step: 1,
          action: 'Go to Google Cloud Console',
          details: 'Visit https://console.cloud.google.com'
        },
        {
          step: 2,
          action: 'Create or Select Project',
          details: 'Create a new project or select an existing one'
        },
        {
          step: 3,
          action: 'Enable Gmail API',
          details: 'Go to "APIs & Services" > "Library" and enable the Gmail API'
        },
        {
          step: 4,
          action: 'Create Credentials',
          details: 'Go to "Credentials", click "Create Credentials", and choose "OAuth client ID"'
        },
        {
          step: 5,
          action: 'Configure OAuth Consent',
          details: 'Set up the OAuth consent screen if not already done'
        },
        {
          step: 6,
          action: 'Download Credentials',
          details: 'Download the JSON file with your client ID and secret'
        }
      ],
      notes: [
        'Gmail API uses OAuth 2.0 authentication',
        'You\'ll need to authorize each user',
        'Requires verification for production use'
      ]
    },
    required_permissions: ['gmail.send', 'gmail.modify']
  },

  // ======================
  // AUTOMATION PLATFORMS
  // ======================
  n8n: {
    id: 'n8n',
    name: 'N8N',
    category: 'automation',
    status: 'active',
    icon: Zap,
    color: 'bg-orange-500',
    description: 'Powerful workflow automation with visual node-based editor. Create complex workflows and connect hundreds of services without code.',
    capabilities: ['workflows', 'nodes', 'webhooks', 'executions', 'credentials', 'blueprints'],
    use_cases: [
      'Deploy pre-built automation blueprints',
      'Create custom workflows visually',
      'Connect multiple services together',
      'Schedule recurring tasks',
      'Monitor workflow executions'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-7 minutes',
    documentation_url: 'https://docs.n8n.io/integrations/',
    api_key_instructions: {
      title: 'How to Get N8N API Credentials',
      steps: [
        {
          step: 1,
          action: 'Access Your N8N Instance',
          details: 'Log in to your self-hosted or cloud N8N instance'
        },
        {
          step: 2,
          action: 'Go to Settings',
          details: 'Click your profile icon and select "Settings"'
        },
        {
          step: 3,
          action: 'Navigate to API',
          details: 'In Settings, find the "API" section'
        },
        {
          step: 4,
          action: 'Generate API Key',
          details: 'Click "Create API key", give it a name, and copy the generated key'
        },
        {
          step: 5,
          action: 'Note Your Instance URL',
          details: 'You\'ll also need your N8N instance URL (e.g., https://your-n8n.com)'
        }
      ],
      notes: [
        'N8N must be self-hosted or on N8N Cloud',
        'API access may need to be enabled in your instance settings',
        'Keep your instance URL and API key together'
      ],
      blueprints: [
        'Lead Generation Workflow',
        'Customer Onboarding Automation',
        'Social Media Content Scheduler',
        'Email Marketing Campaign',
        'Data Sync Between Apps',
        'Invoice Processing Automation'
      ]
    },
    required_permissions: ['workflow:execute', 'workflow:read']
  },

  zapier: {
    id: 'zapier',
    name: 'Zapier',
    category: 'automation',
    status: 'active',
    icon: Zap,
    color: 'bg-orange-500',
    description: 'Automate workflows across thousands of apps via conversation. Create Zaps that connect your tools and automate repetitive tasks.',
    capabilities: ['webhooks', 'triggers', 'actions', 'zaps', 'filters'],
    use_cases: [
      'Trigger actions across multiple apps',
      'Automate data synchronization',
      'Create multi-step workflows',
      'Filter and transform data',
      'Schedule automated tasks'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://zapier.com/developer',
    api_key_instructions: {
      title: 'How to Get Zapier API Key',
      steps: [
        {
          step: 1,
          action: 'Log in to Zapier',
          details: 'Go to https://zapier.com and sign in'
        },
        {
          step: 2,
          action: 'Access Developer Platform',
          details: 'Visit https://developer.zapier.com'
        },
        {
          step: 3,
          action: 'Create Integration',
          details: 'Click "Start a Zapier Integration" if you haven\'t already'
        },
        {
          step: 4,
          action: 'Get API Key',
          details: 'Go to your integration settings and copy your API key'
        }
      ],
      notes: [
        'Zapier uses OAuth for most integrations',
        'Developer account may be required for custom integrations',
        'Standard users can use pre-built integrations'
      ]
    },
    required_permissions: ['read', 'write']
  },

  // ======================
  // PRODUCTIVITY & STORAGE
  // ======================
  google_drive: {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'productivity',
    status: 'active',
    icon: Database,
    color: 'bg-blue-500',
    description: 'Access and manage your Google Drive files, folders, and documents. Upload, download, and organize files automatically.',
    capabilities: ['files', 'folders', 'documents', 'sheets', 'permissions', 'sharing'],
    use_cases: [
      'Upload files automatically',
      'Organize documents by project',
      'Share files with team members',
      'Backup important data',
      'Search across Drive'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '7-10 minutes',
    documentation_url: 'https://developers.google.com/drive/api',
    api_key_instructions: {
      title: 'How to Set Up Google Drive API',
      steps: [
        {
          step: 1,
          action: 'Go to Google Cloud Console',
          details: 'Visit https://console.cloud.google.com'
        },
        {
          step: 2,
          action: 'Create or Select Project',
          details: 'Create a new project or select an existing one'
        },
        {
          step: 3,
          action: 'Enable Drive API',
          details: 'Go to "APIs & Services" > "Library" and enable Google Drive API'
        },
        {
          step: 4,
          action: 'Create OAuth Credentials',
          details: 'Create OAuth 2.0 credentials in the Credentials section'
        },
        {
          step: 5,
          action: 'Download JSON',
          details: 'Download the credentials JSON file'
        }
      ],
      notes: [
        'Requires OAuth 2.0 authentication',
        'Users must authorize access',
        'Different scopes for read vs. write access'
      ]
    },
    required_permissions: ['drive.file', 'drive.metadata']
  },

  dropbox: {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'productivity',
    status: 'active',
    icon: Database,
    color: 'bg-blue-700',
    description: 'Integrate Dropbox to access, manage, and share files and folders. Sync documents across your organization.',
    capabilities: ['files', 'folders', 'documents', 'sharing', 'paper'],
    use_cases: [
      'Access shared files',
      'Upload documents automatically',
      'Sync folder contents',
      'Share links with team',
      'Organize project files'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://www.dropbox.com/developers',
    api_key_instructions: {
      title: 'How to Create Dropbox App',
      steps: [
        {
          step: 1,
          action: 'Go to Dropbox App Console',
          details: 'Visit https://www.dropbox.com/developers/apps'
        },
        {
          step: 2,
          action: 'Create App',
          details: 'Click "Create app" and choose API and access type'
        },
        {
          step: 3,
          action: 'Configure App',
          details: 'Set app name and choose folder access or full Dropbox access'
        },
        {
          step: 4,
          action: 'Generate Access Token',
          details: 'In the OAuth 2 section, click "Generate access token"'
        }
      ],
      notes: [
        'Access tokens don\'t expire by default',
        'Can be limited to specific folders',
        'Requires user authorization for production'
      ]
    },
    required_permissions: ['files.content.write', 'files.content.read']
  },

  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'communication',
    status: 'active',
    icon: MessageSquare,
    color: 'bg-green-500',
    description: 'Send WhatsApp Business messages and manage conversations. Perfect for customer support and engagement.',
    capabilities: ['send_messages', 'media', 'templates', 'webhooks'],
    use_cases: [
      'Send automated customer notifications',
      'Respond to customer inquiries',
      'Send order confirmations',
      'Share media and documents',
      'Manage conversation threads'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '15-20 minutes',
    documentation_url: 'https://developers.facebook.com/docs/whatsapp/',
    api_key_instructions: {
      title: 'How to Set Up WhatsApp Business API',
      steps: [
        {
          step: 1,
          action: 'Apply for WhatsApp Business API',
          details: 'Visit Facebook Business Manager and apply for WhatsApp Business API access'
        },
        {
          step: 2,
          action: 'Set Up Business Account',
          details: 'Complete business verification process with Facebook'
        },
        {
          step: 3,
          action: 'Create App in Meta Developer Portal',
          details: 'Create a new app and add WhatsApp product'
        },
        {
          step: 4,
          action: 'Get Credentials',
          details: 'Copy your WhatsApp Business Account ID and Access Token'
        }
      ],
      notes: [
        'Requires business verification by Facebook',
        'Must use approved message templates for outbound messages',
        'Different pricing model than standard Facebook API'
      ]
    },
    required_permissions: ['whatsapp_business_messaging', 'whatsapp_business_management']
  },

  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    category: 'social_media',
    status: 'active',
    icon: Globe,
    color: 'bg-black',
    description: 'Manage Twitter/X account, post tweets, track engagement, and monitor conversations.',
    capabilities: ['tweets', 'direct_messages', 'analytics', 'search', 'trends'],
    use_cases: [
      'Schedule and publish tweets',
      'Monitor brand mentions',
      'Track trending topics',
      'Respond to customer inquiries',
      'Analyze tweet performance'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developer.twitter.com/en/docs',
    api_key_instructions: {
      title: 'How to Get Twitter API Keys',
      steps: [
        {
          step: 1,
          action: 'Go to Twitter Developer Portal',
          details: 'Visit https://developer.twitter.com/en/portal/dashboard'
        },
        {
          step: 2,
          action: 'Create App',
          details: 'Click "Create Project" and then "Create App"'
        },
        {
          step: 3,
          action: 'Configure Permissions',
          details: 'Set your app permissions (Read, Write, Direct Messages)'
        },
        {
          step: 4,
          action: 'Generate Keys',
          details: 'Generate API Key, API Secret, Access Token, and Access Token Secret'
        }
      ],
      notes: [
        'Basic tier is free but has rate limits',
        'Elevated access requires application review',
        'Enterprise access available for high-volume usage'
      ]
    },
    required_permissions: ['tweet.read', 'tweet.write', 'users.read']
  },

  shopify: {
    id: 'shopify',
    name: 'Shopify',
    category: 'ecommerce',
    status: 'active',
    icon: ShoppingCart,
    color: 'bg-green-600',
    description: 'Connect your Shopify store to manage products, orders, customers, and inventory automatically.',
    capabilities: ['products', 'orders', 'customers', 'inventory', 'analytics'],
    use_cases: [
      'Sync product inventory',
      'Process and fulfill orders',
      'Manage customer data',
      'Track sales analytics',
      'Automate order notifications'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://shopify.dev/docs/api',
    api_key_instructions: {
      title: 'How to Create Shopify Private App',
      steps: [
        {
          step: 1,
          action: 'Log in to Shopify Admin',
          details: 'Access your Shopify store admin panel'
        },
        {
          step: 2,
          action: 'Go to Apps',
          details: 'Navigate to Apps > App and sales channel settings'
        },
        {
          step: 3,
          action: 'Develop Apps',
          details: 'Click "Develop apps" and then "Create an app"'
        },
        {
          step: 4,
          action: 'Configure Scopes',
          details: 'Select the Admin API scopes you need'
        },
        {
          step: 5,
          action: 'Get API Credentials',
          details: 'Install the app and copy the Admin API access token'
        }
      ],
      notes: [
        'Custom apps replaced Private Apps in 2022',
        'Different scopes control different permissions',
        'API versioning - use the latest stable version'
      ]
    },
    required_permissions: ['read_products', 'write_products', 'read_orders', 'write_orders']
  },

  github: {
    id: 'github',
    name: 'GitHub',
    category: 'development',
    status: 'active',
    icon: Globe,
    color: 'bg-gray-900',
    description: 'Integrate GitHub for repository management, issue tracking, and automated workflows.',
    capabilities: ['repositories', 'issues', 'pull_requests', 'actions', 'webhooks'],
    use_cases: [
      'Create and manage issues',
      'Monitor pull requests',
      'Trigger automated workflows',
      'Track repository activity',
      'Manage releases'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '2-3 minutes',
    documentation_url: 'https://docs.github.com/en/rest',
    api_key_instructions: {
      title: 'How to Create GitHub Personal Access Token',
      steps: [
        {
          step: 1,
          action: 'Go to GitHub Settings',
          details: 'Click your profile photo, then Settings'
        },
        {
          step: 2,
          action: 'Developer Settings',
          details: 'Scroll down and click "Developer settings" in the left sidebar'
        },
        {
          step: 3,
          action: 'Personal Access Tokens',
          details: 'Click "Personal access tokens" > "Tokens (classic)"'
        },
        {
          step: 4,
          action: 'Generate New Token',
          details: 'Click "Generate new token", select scopes, and create'
        },
        {
          step: 5,
          action: 'Copy Token',
          details: 'Copy the generated token immediately - it won\'t be shown again!'
        }
      ],
      notes: [
        'Fine-grained tokens provide more granular control',
        'Classic tokens are simpler but less secure',
        'Set token expiration for better security'
      ]
    },
    required_permissions: ['repo', 'workflow']
  },

  // ======================
  // ACCOUNTING & FINANCE
  // ======================
  xero: {
    id: 'xero',
    name: 'Xero',
    category: 'accounting',
    status: 'active',
    icon: DollarSign,
    color: 'bg-blue-500',
    description: 'Connect Xero for accounting data and financial information. Access invoices, contacts, accounts, and comprehensive financial reports.',
    capabilities: ['invoices', 'contacts', 'accounts', 'reports', 'bank_transactions', 'payments'],
    use_cases: [
      'Sync invoice data',
      'Track financial metrics',
      'Reconcile transactions',
      'Generate financial reports',
      'Manage contacts and accounts'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developer.xero.com/',
    api_key_instructions: {
      title: 'How to Create Xero OAuth App',
      steps: [
        {
          step: 1,
          action: 'Go to Xero Developer Portal',
          details: 'Visit https://developer.xero.com/app/manage'
        },
        {
          step: 2,
          action: 'Create New App',
          details: 'Click "New app" and choose OAuth 2.0'
        },
        {
          step: 3,
          action: 'Configure OAuth',
          details: 'Set redirect URIs and choose scopes'
        },
        {
          step: 4,
          action: 'Get Credentials',
          details: 'Copy Client ID and Client Secret'
        },
        {
          step: 5,
          action: 'Authorize Organization',
          details: 'Connect to your Xero organization through OAuth flow'
        }
      ],
      notes: [
        'OAuth 2.0 is the only supported authentication',
        'Tokens expire after 30 minutes',
        'Refresh tokens are valid for 60 days'
      ]
    },
    required_permissions: ['accounting.transactions', 'accounting.contacts']
  },

  quickbooks: {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'accounting',
    status: 'active',
    icon: DollarSign,
    color: 'bg-green-600',
    description: 'Integrate QuickBooks for comprehensive accounting and financial data access. Manage invoices, customers, and accounting workflows.',
    capabilities: ['invoices', 'customers', 'accounts', 'reports', 'expenses', 'bills'],
    use_cases: [
      'Sync customer invoices',
      'Track expenses automatically',
      'Generate financial reports',
      'Manage accounts payable/receivable',
      'Reconcile bank accounts'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '15-20 minutes',
    documentation_url: 'https://developer.intuit.com/',
    api_key_instructions: {
      title: 'How to Create QuickBooks App',
      steps: [
        {
          step: 1,
          action: 'Go to Intuit Developer',
          details: 'Visit https://developer.intuit.com'
        },
        {
          step: 2,
          action: 'Create App',
          details: 'Go to "My Apps" and click "Create an app"'
        },
        {
          step: 3,
          action: 'Select QuickBooks Online',
          details: 'Choose "QuickBooks Online and Payments" platform'
        },
        {
          step: 4,
          action: 'Configure Keys and OAuth',
          details: 'Set up OAuth redirect URIs and get Client ID and Secret'
        },
        {
          step: 5,
          action: 'Connect Company',
          details: 'Authorize your QuickBooks company through OAuth'
        }
      ],
      notes: [
        'Requires Intuit developer account',
        'Must go through app review for production',
        'OAuth tokens refresh automatically'
      ]
    },
    required_permissions: ['com.intuit.quickbooks.accounting']
  },

  // ======================
  // ADDITIONAL SOCIAL MEDIA & ADVERTISING
  // ======================
  tiktok: {
    id: 'tiktok',
    name: 'TikTok for Business',
    category: 'social_media',
    status: 'active',
    icon: Video,
    color: 'bg-black',
    description: 'Manage TikTok Business account for short-form video marketing. Perfect for Gen-Z and Millennial targeting with trending content.',
    capabilities: ['videos', 'analytics', 'ads', 'hashtags', 'trends'],
    use_cases: [
      'Schedule and publish TikTok videos',
      'Track video performance and trends',
      'Run TikTok ad campaigns',
      'Monitor engagement metrics',
      'Discover trending hashtags'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-7 minutes',
    documentation_url: 'https://developers.tiktok.com/',
    api_key_instructions: {
      title: 'How to Get TikTok for Business API Access',
      steps: [
        { step: 1, action: 'Convert to Business Account', details: 'Switch your TikTok account to a Business Account in settings' },
        { step: 2, action: 'Go to TikTok for Developers', details: 'Visit https://developers.tiktok.com and create an account' },
        { step: 3, action: 'Create App', details: 'Click "Manage apps" and create a new app for your business' },
        { step: 4, action: 'Select API Products', details: 'Add the products you need (Content Posting API, Marketing API, etc.)' },
        { step: 5, action: 'Get Credentials', details: 'Copy your Client Key and Client Secret from the app dashboard' }
      ],
      notes: [
        'Business account required for API access',
        'Some features require additional approval',
        'Rate limits vary by API tier'
      ]
    },
    required_permissions: ['video.publish', 'user.info.basic', 'video.list']
  },

  youtube: {
    id: 'youtube',
    name: 'YouTube',
    category: 'social_media',
    status: 'active',
    icon: Video,
    color: 'bg-red-600',
    description: 'Manage YouTube channel, upload videos, track analytics, and engage with your audience. Perfect for long-form and Shorts content.',
    capabilities: ['videos', 'playlists', 'analytics', 'comments', 'live_streams', 'shorts'],
    use_cases: [
      'Upload and schedule videos automatically',
      'Track video analytics and performance',
      'Manage video metadata and thumbnails',
      'Respond to comments',
      'Create and manage playlists'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '7-10 minutes',
    documentation_url: 'https://developers.google.com/youtube/v3',
    api_key_instructions: {
      title: 'How to Set Up YouTube Data API',
      steps: [
        { step: 1, action: 'Go to Google Cloud Console', details: 'Visit https://console.cloud.google.com' },
        { step: 2, action: 'Create Project', details: 'Create a new project or select an existing one' },
        { step: 3, action: 'Enable YouTube Data API', details: 'Go to "APIs & Services" > "Library" and enable YouTube Data API v3' },
        { step: 4, action: 'Create Credentials', details: 'Create OAuth 2.0 credentials for your application' },
        { step: 5, action: 'Configure OAuth Consent', details: 'Set up OAuth consent screen with required scopes' }
      ],
      notes: [
        'Requires Google account verification',
        'Upload quota is 10,000 units per day by default',
        'Can request quota increase for higher volume'
      ]
    },
    required_permissions: ['youtube.upload', 'youtube.readonly', 'youtubepartner']
  },

  pinterest: {
    id: 'pinterest',
    name: 'Pinterest Business',
    category: 'social_media',
    status: 'active',
    icon: Camera,
    color: 'bg-red-500',
    description: 'Connect Pinterest for visual discovery marketing. Excellent for eCommerce, lifestyle brands, and driving traffic to your website.',
    capabilities: ['pins', 'boards', 'analytics', 'ads', 'shopping'],
    use_cases: [
      'Create and schedule pins automatically',
      'Manage product catalogs',
      'Track pin performance',
      'Run Pinterest ad campaigns',
      'Organize boards and collections'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-7 minutes',
    documentation_url: 'https://developers.pinterest.com/',
    api_key_instructions: {
      title: 'How to Create Pinterest App',
      steps: [
        { step: 1, action: 'Convert to Business Account', details: 'Switch to Pinterest Business account' },
        { step: 2, action: 'Go to Pinterest Developers', details: 'Visit https://developers.pinterest.com' },
        { step: 3, action: 'Create App', details: 'Click "My Apps" and create a new app' },
        { step: 4, action: 'Configure OAuth', details: 'Set redirect URIs and get App ID and Secret' },
        { step: 5, action: 'Request Permissions', details: 'Apply for necessary API access levels' }
      ],
      notes: [
        'Business account required',
        'Some features require approval',
        'Shopping features need merchant verification'
      ]
    },
    required_permissions: ['pins:read', 'pins:write', 'boards:read', 'boards:write']
  },

  google_ads: {
    id: 'google_ads',
    name: 'Google Ads',
    category: 'advertising',
    status: 'active',
    icon: Target,
    color: 'bg-blue-600',
    description: 'Manage Google Ads campaigns, track ROI, and optimize ad spend automatically. Essential for search and display advertising.',
    capabilities: ['campaigns', 'ad_groups', 'keywords', 'analytics', 'bidding'],
    use_cases: [
      'Create and optimize ad campaigns',
      'Track campaign ROI and conversions',
      'Manage keyword bidding strategies',
      'Analyze search term performance',
      'Generate advertising reports'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developers.google.com/google-ads/api',
    api_key_instructions: {
      title: 'How to Set Up Google Ads API',
      steps: [
        { step: 1, action: 'Create Google Cloud Project', details: 'Set up a project in Google Cloud Console' },
        { step: 2, action: 'Enable Google Ads API', details: 'Enable the API in the API Library' },
        { step: 3, action: 'Create OAuth Credentials', details: 'Set up OAuth 2.0 credentials' },
        { step: 4, action: 'Get Developer Token', details: 'Apply for a developer token in your Google Ads account' },
        { step: 5, action: 'Configure Manager Account', details: 'Link to your Google Ads Manager account' }
      ],
      notes: [
        'Requires Google Ads account',
        'Developer token approval can take days',
        'Test account available for development'
      ]
    },
    required_permissions: ['adwords']
  },

  reddit_ads: {
    id: 'reddit_ads',
    name: 'Reddit Ads',
    category: 'advertising',
    status: 'active',
    icon: MessageSquare,
    color: 'bg-orange-600',
    description: 'Run targeted Reddit advertising campaigns. Perfect for niche targeting and community-based marketing.',
    capabilities: ['campaigns', 'ads', 'targeting', 'analytics'],
    use_cases: [
      'Create community-targeted campaigns',
      'Track ad performance by subreddit',
      'Manage ad budgets and bidding',
      'Analyze audience engagement'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-7 minutes',
    documentation_url: 'https://www.reddit.com/dev/api/',
    api_key_instructions: {
      title: 'How to Get Reddit Ads Access',
      steps: [
        { step: 1, action: 'Create Ads Account', details: 'Set up a Reddit Ads account at ads.reddit.com' },
        { step: 2, action: 'Go to Reddit Apps', details: 'Visit https://www.reddit.com/prefs/apps' },
        { step: 3, action: 'Create App', details: 'Click "create app" and select "script" type' },
        { step: 4, action: 'Get Credentials', details: 'Copy your client ID and secret' }
      ],
      notes: [
        'Requires Reddit account and Ads account',
        'OAuth 2.0 authentication required',
        'Respect Reddit API rate limits'
      ]
    },
    required_permissions: ['read', 'submit', 'adcampaigns']
  },

  linkedin_ads: {
    id: 'linkedin_ads',
    name: 'LinkedIn Ads Manager',
    category: 'advertising',
    status: 'active',
    icon: Target,
    color: 'bg-blue-700',
    description: 'Manage LinkedIn advertising campaigns for B2B marketing. Perfect for professional audience targeting and lead generation.',
    capabilities: ['campaigns', 'sponsored_content', 'lead_gen_forms', 'analytics'],
    use_cases: [
      'Create B2B ad campaigns',
      'Target professional audiences',
      'Collect leads via Lead Gen Forms',
      'Track campaign ROI',
      'Analyze professional demographics'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://docs.microsoft.com/en-us/linkedin/marketing/',
    api_key_instructions: {
      title: 'How to Set Up LinkedIn Marketing API',
      steps: [
        { step: 1, action: 'Create LinkedIn App', details: 'Go to LinkedIn Developers and create an app' },
        { step: 2, action: 'Associate with Company Page', details: 'Link app to your LinkedIn Company Page' },
        { step: 3, action: 'Request Marketing Partner Access', details: 'Apply for Marketing Developer Platform access' },
        { step: 4, action: 'Get Credentials', details: 'Copy Client ID and Secret from Auth tab' },
        { step: 5, action: 'Wait for Approval', details: 'LinkedIn will review your application (can take weeks)' }
      ],
      notes: [
        'Requires LinkedIn Marketing Partner status for full access',
        'Company Page admin access required',
        'Strict approval process'
      ]
    },
    required_permissions: ['rw_ads', 'r_ads_reporting']
  },

  meta_business_suite: {
    id: 'meta_business_suite',
    name: 'Meta Business Suite',
    category: 'advertising',
    status: 'active',
    icon: Globe,
    color: 'bg-blue-600',
    description: 'Centralized management for Facebook and Instagram advertising, content scheduling, and analytics through Meta Business Suite.',
    capabilities: ['cross_platform_ads', 'content_scheduling', 'insights', 'messaging', 'commerce'],
    use_cases: [
      'Manage Facebook and Instagram ads from one place',
      'Schedule cross-platform content',
      'Unified inbox for all messages',
      'Compare cross-platform analytics',
      'Manage commerce catalogs'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '15-20 minutes',
    documentation_url: 'https://developers.facebook.com/docs/marketing-apis/',
    api_key_instructions: {
      title: 'How to Set Up Meta Business Suite API',
      steps: [
        { step: 1, action: 'Create Business Manager', details: 'Set up Facebook Business Manager account' },
        { step: 2, action: 'Create App in Meta Developers', details: 'Go to developers.facebook.com and create an app' },
        { step: 3, action: 'Add Products', details: 'Add Facebook Login, Instagram, and Marketing API products' },
        { step: 4, action: 'Business Verification', details: 'Complete business verification process' },
        { step: 5, action: 'Get Access Tokens', details: 'Generate long-lived access tokens for your business' }
      ],
      notes: [
        'Business verification required for advanced features',
        'Requires admin access to Facebook Pages and Instagram accounts',
        'Token management is crucial for security'
      ]
    },
    required_permissions: ['pages_manage_posts', 'instagram_basic', 'ads_management', 'business_management']
  },

  // ======================
  // ADDITIONAL CRM & SALES
  // ======================
  pipedrive: {
    id: 'pipedrive',
    name: 'Pipedrive',
    category: 'crm',
    status: 'active',
    icon: Database,
    color: 'bg-green-500',
    description: 'Simple and visual sales CRM loved by small businesses. Track deals, activities, and sales pipeline with ease.',
    capabilities: ['deals', 'contacts', 'activities', 'pipeline', 'reports'],
    use_cases: [
      'Manage sales pipeline visually',
      'Track deals and follow-ups',
      'Automate activity logging',
      'Generate sales forecasts',
      'Sync contacts and communications'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://developers.pipedrive.com/',
    api_key_instructions: {
      title: 'How to Get Pipedrive API Token',
      steps: [
        { step: 1, action: 'Log in to Pipedrive', details: 'Access your Pipedrive account' },
        { step: 2, action: 'Go to Settings', details: 'Click your profile icon and select "Settings"' },
        { step: 3, action: 'Navigate to API', details: 'In Personal preferences, find the API section' },
        { step: 4, action: 'Generate Token', details: 'Copy your Personal API token' }
      ],
      notes: [
        'One token per user',
        'Token has full account access',
        'Can regenerate if compromised'
      ]
    },
    required_permissions: ['deals:read', 'deals:write', 'persons:read', 'persons:write']
  },

  zoho_crm: {
    id: 'zoho_crm',
    name: 'Zoho CRM',
    category: 'crm',
    status: 'active',
    icon: Database,
    color: 'bg-red-600',
    description: 'Affordable and comprehensive CRM used globally. Manage leads, contacts, deals, and customer relationships effectively.',
    capabilities: ['leads', 'contacts', 'deals', 'accounts', 'campaigns', 'reports'],
    use_cases: [
      'Track lead journey from prospect to customer',
      'Manage multi-touch sales processes',
      'Automate email campaigns',
      'Generate sales analytics',
      'Integrate with Zoho ecosystem'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '7-10 minutes',
    documentation_url: 'https://www.zoho.com/crm/developer/docs/api/',
    api_key_instructions: {
      title: 'How to Set Up Zoho CRM API',
      steps: [
        { step: 1, action: 'Go to Zoho API Console', details: 'Visit https://api-console.zoho.com' },
        { step: 2, action: 'Create Client', details: 'Register a new client application' },
        { step: 3, action: 'Configure OAuth', details: 'Set redirect URIs and select scopes' },
        { step: 4, action: 'Get Credentials', details: 'Copy Client ID and Client Secret' },
        { step: 5, action: 'Generate Grant Token', details: 'Use OAuth flow to get initial access' }
      ],
      notes: [
        'OAuth 2.0 required',
        'Tokens refresh automatically',
        'Different data centers (US, EU, IN, AU, etc.)'
      ]
    },
    required_permissions: ['ZohoCRM.modules.ALL']
  },

  activecampaign: {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    category: 'crm',
    status: 'active',
    icon: Mail,
    color: 'bg-blue-500',
    description: 'Email automation and CRM hybrid. Perfect for marketing automation, customer experience automation, and sales automation.',
    capabilities: ['contacts', 'deals', 'automations', 'campaigns', 'forms', 'tags'],
    use_cases: [
      'Create sophisticated email automations',
      'Track customer lifecycle',
      'Segment contacts dynamically',
      'Score leads automatically',
      'Trigger actions based on behavior'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://developers.activecampaign.com/',
    api_key_instructions: {
      title: 'How to Get ActiveCampaign API Key',
      steps: [
        { step: 1, action: 'Log in to ActiveCampaign', details: 'Access your account' },
        { step: 2, action: 'Go to Settings', details: 'Click Settings in the left menu' },
        { step: 3, action: 'Navigate to Developer', details: 'Select Developer from settings options' },
        { step: 4, action: 'Copy API URL and Key', details: 'You\'ll need both your API URL and API Key' }
      ],
      notes: [
        'Each account has unique API URL',
        'API key is account-wide',
        'All API calls use both URL and key'
      ]
    },
    required_permissions: ['contacts', 'deals', 'automations']
  },

  gohighlevel: {
    id: 'gohighlevel',
    name: 'GoHighLevel',
    category: 'crm',
    status: 'active',
    icon: Target,
    color: 'bg-green-600',
    description: 'All-in-one platform for marketing agencies and solopreneurs. CRM, funnels, automation, and white-label capabilities.',
    capabilities: ['contacts', 'opportunities', 'pipelines', 'calendars', 'funnels', 'workflows'],
    use_cases: [
      'Manage agency client relationships',
      'Create sales funnels',
      'Automate follow-up sequences',
      'Schedule appointments',
      'Build complete client portals'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://highlevel.stoplight.io/',
    api_key_instructions: {
      title: 'How to Get GoHighLevel API Key',
      steps: [
        { step: 1, action: 'Log in to GHL', details: 'Access your GoHighLevel account' },
        { step: 2, action: 'Go to Settings', details: 'Click on Settings in the left sidebar' },
        { step: 3, action: 'Select Integrations', details: 'Find the Integrations or API section' },
        { step: 4, action: 'Generate API Key', details: 'Create a new API key with required permissions' }
      ],
      notes: [
        'Different keys for agency vs. location level',
        'OAuth 2.0 available for white-label',
        'Webhook support for real-time updates'
      ]
    },
    required_permissions: ['contacts.readonly', 'contacts.write', 'opportunities.readonly']
  },

  clickfunnels: {
    id: 'clickfunnels',
    name: 'ClickFunnels 2.0',
    category: 'crm',
    status: 'active',
    icon: TrendingUp,
    color: 'bg-orange-500',
    description: 'Sales funnel builder with integrated CRM. Create landing pages, funnels, and track customer journey.',
    capabilities: ['funnels', 'pages', 'contacts', 'orders', 'products', 'analytics'],
    use_cases: [
      'Track funnel performance',
      'Sync customer data',
      'Monitor conversion rates',
      'Analyze page analytics',
      'Automate order fulfillment'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-7 minutes',
    documentation_url: 'https://developers.clickfunnels.com/',
    api_key_instructions: {
      title: 'How to Get ClickFunnels API Access',
      steps: [
        { step: 1, action: 'Log in to ClickFunnels', details: 'Access your ClickFunnels 2.0 account' },
        { step: 2, action: 'Go to Settings', details: 'Navigate to account settings' },
        { step: 3, action: 'Find API Settings', details: 'Look for API or Integrations section' },
        { step: 4, action: 'Generate Token', details: 'Create a new API token' }
      ],
      notes: [
        'ClickFunnels 2.0 has different API than Classic',
        'Rate limits apply',
        'Webhook notifications available'
      ]
    },
    required_permissions: ['read', 'write']
  },

  systeme_io: {
    id: 'systeme_io',
    name: 'Systeme.io',
    category: 'crm',
    status: 'active',
    icon: Globe,
    color: 'bg-purple-600',
    description: 'All-in-one marketing platform for online businesses. Funnels, email marketing, automation, and course hosting.',
    capabilities: ['contacts', 'funnels', 'emails', 'automations', 'courses', 'products'],
    use_cases: [
      'Manage email list and campaigns',
      'Track funnel conversions',
      'Automate customer onboarding',
      'Monitor course enrollments',
      'Process product sales'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://systeme.io/integrations',
    api_key_instructions: {
      title: 'How to Get Systeme.io API Key',
      steps: [
        { step: 1, action: 'Log in to Systeme.io', details: 'Access your account dashboard' },
        { step: 2, action: 'Go to Settings', details: 'Click on Settings in the menu' },
        { step: 3, action: 'Find API Section', details: 'Navigate to Integrations or API' },
        { step: 4, action: 'Generate Key', details: 'Create a new API key for Guild-AI' }
      ],
      notes: [
        'API access included in all plans',
        'Webhook support available',
        'Real-time synchronization possible'
      ]
    },
    required_permissions: ['contacts', 'tags', 'emails']
  },

  // ======================
  // ADDITIONAL PROJECT MANAGEMENT
  // ======================
  clickup: {
    id: 'clickup',
    name: 'ClickUp',
    category: 'project_management',
    status: 'active',
    icon: CheckSquare,
    color: 'bg-purple-600',
    description: 'Highly versatile project management platform. Replace multiple tools with one flexible system for tasks, docs, and collaboration.',
    capabilities: ['tasks', 'spaces', 'lists', 'docs', 'goals', 'time_tracking'],
    use_cases: [
      'Centralize all project management',
      'Track tasks across multiple projects',
      'Collaborate on documents',
      'Monitor team time tracking',
      'Set and track OKRs and goals'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://clickup.com/api/',
    api_key_instructions: {
      title: 'How to Get ClickUp API Token',
      steps: [
        { step: 1, action: 'Log in to ClickUp', details: 'Access your workspace' },
        { step: 2, action: 'Click Your Avatar', details: 'Click your profile picture in the bottom left' },
        { step: 3, action: 'Go to Settings', details: 'Select "Settings" from the menu' },
        { step: 4, action: 'Find Apps', details: 'Click on "Apps" in the left sidebar' },
        { step: 5, action: 'Generate Token', details: 'Click "Generate" to create a Personal API Token' }
      ],
      notes: [
        'Personal tokens have full workspace access',
        'OAuth 2.0 available for public integrations',
        'Webhook support for real-time updates'
      ]
    },
    required_permissions: ['task:read', 'task:write', 'space:read']
  },

  trello: {
    id: 'trello',
    name: 'Trello',
    category: 'project_management',
    status: 'active',
    icon: Layout,
    color: 'bg-blue-500',
    description: 'Simple Kanban-style project management. Visual boards, lists, and cards for organizing work.',
    capabilities: ['boards', 'lists', 'cards', 'checklists', 'attachments', 'labels'],
    use_cases: [
      'Manage Kanban workflows',
      'Track project stages visually',
      'Organize team tasks',
      'Automate card movements',
      'Sync with team calendars'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://developer.atlassian.com/cloud/trello/',
    api_key_instructions: {
      title: 'How to Get Trello API Key',
      steps: [
        { step: 1, action: 'Log in to Trello', details: 'Access your Trello account' },
        { step: 2, action: 'Get API Key', details: 'Visit https://trello.com/app-key' },
        { step: 3, action: 'Copy Key', details: 'Copy your API Key from the page' },
        { step: 4, action: 'Generate Token', details: 'Click the Token link to generate a user token' },
        { step: 5, action: 'Authorize', details: 'Authorize the token with required permissions' }
      ],
      notes: [
        'One API key per account',
        'Tokens can have different scopes',
        'Owned by Atlassian (integrates with Jira)'
      ]
    },
    required_permissions: ['read', 'write']
  },

  basecamp: {
    id: 'basecamp',
    name: 'Basecamp',
    category: 'project_management',
    status: 'active',
    icon: Users,
    color: 'bg-green-600',
    description: 'Simple, all-in-one project management and team communication. Perfect for small teams prioritizing simplicity.',
    capabilities: ['projects', 'messages', 'todos', 'schedules', 'docs', 'files'],
    use_cases: [
      'Centralize team communication',
      'Track project to-dos',
      'Share files and documents',
      'Manage project schedules',
      'Keep everyone aligned'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-7 minutes',
    documentation_url: 'https://github.com/basecamp/bc3-api',
    api_key_instructions: {
      title: 'How to Set Up Basecamp Integration',
      steps: [
        { step: 1, action: 'Register OAuth App', details: 'Register your integration at https://launchpad.37signals.com/integrations' },
        { step: 2, action: 'Get OAuth Credentials', details: 'Receive Client ID and Secret' },
        { step: 3, action: 'Configure Callback', details: 'Set your OAuth callback URL' },
        { step: 4, action: 'Implement OAuth Flow', details: 'Use OAuth 2.0 to get access token' }
      ],
      notes: [
        'OAuth 2.0 only (no API keys)',
        'Must register app with 37signals',
        'Rate limiting applies'
      ]
    },
    required_permissions: ['read', 'write']
  },

  jira: {
    id: 'jira',
    name: 'Jira',
    category: 'project_management',
    status: 'active',
    icon: CheckSquare,
    color: 'bg-blue-600',
    description: 'Professional project tracking for software teams. Agile boards, sprint planning, and comprehensive issue tracking.',
    capabilities: ['issues', 'projects', 'sprints', 'boards', 'workflows', 'reports'],
    use_cases: [
      'Track software development issues',
      'Manage agile sprints',
      'Automate workflow transitions',
      'Generate development reports',
      'Integrate with development tools'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developer.atlassian.com/cloud/jira/platform/',
    api_key_instructions: {
      title: 'How to Set Up Jira API Access',
      steps: [
        { step: 1, action: 'Go to Atlassian Account', details: 'Visit https://id.atlassian.com/manage-profile/security/api-tokens' },
        { step: 2, action: 'Create API Token', details: 'Click "Create API token" and give it a label' },
        { step: 3, action: 'Copy Token', details: 'Save the generated token immediately' },
        { step: 4, action: 'Note Your Domain', details: 'You\'ll need your Jira cloud domain (e.g., yourcompany.atlassian.net)' },
        { step: 5, action: 'Use with Email', details: 'API token is used with your Atlassian account email' }
      ],
      notes: [
        'Different for Cloud vs. Server/Data Center',
        'OAuth 2.0 available for apps',
        'Comprehensive permission scopes'
      ]
    },
    required_permissions: ['read:jira-work', 'write:jira-work']
  },

  // ======================
  // ADDITIONAL PAYMENTS (South African Focus)
  // ======================
  paystack: {
    id: 'paystack',
    name: 'Paystack',
    category: 'payments',
    status: 'active',
    icon: DollarSign,
    color: 'bg-blue-500',
    description: 'Leading payment gateway for Africa. Accept payments online and grow your business across African markets.',
    capabilities: ['payments', 'subscriptions', 'customers', 'refunds', 'transfers'],
    use_cases: [
      'Accept online payments in African currencies',
      'Manage recurring subscriptions',
      'Process refunds automatically',
      'Send money to customers or vendors',
      'Track transaction analytics'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://paystack.com/docs/api/',
    api_key_instructions: {
      title: 'How to Get Paystack API Keys',
      steps: [
        { step: 1, action: 'Log in to Paystack', details: 'Access your Paystack dashboard' },
        { step: 2, action: 'Go to Settings', details: 'Click Settings in the left menu' },
        { step: 3, action: 'Navigate to API Keys', details: 'Select "API Keys & Webhooks"' },
        { step: 4, action: 'Copy Keys', details: 'Copy both Public Key (pk_) and Secret Key (sk_)' },
        { step: 5, action: 'Choose Environment', details: 'Use Test keys for testing, Live keys for production' }
      ],
      notes: [
        'Available in Nigeria, Ghana, South Africa, and Kenya',
        'Business verification required for live mode',
        'Webhook secret for secure callbacks'
      ]
    },
    required_permissions: ['read', 'write'],
    transparency_info: {
      data_accessed: ['Transactions', 'Customer details', 'Subscription status'],
      data_stored: 'Transaction metadata only, no card details',
      frequency: 'Real-time via webhooks, hourly sync for analytics'
    }
  },

  yoco: {
    id: 'yoco',
    name: 'Yoco',
    category: 'payments',
    status: 'active',
    icon: DollarSign,
    color: 'bg-green-600',
    description: 'South African card payment solution for small businesses. Accept card payments in-store and online.',
    capabilities: ['payments', 'transactions', 'customers', 'analytics'],
    use_cases: [
      'Process card payments',
      'Track daily sales',
      'Manage customer transactions',
      'Generate sales reports',
      'Reconcile payments'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-7 minutes',
    documentation_url: 'https://developer.yoco.com/',
    api_key_instructions: {
      title: 'How to Get Yoco API Keys',
      steps: [
        { step: 1, action: 'Log in to Yoco Portal', details: 'Access your Yoco business portal' },
        { step: 2, action: 'Go to Settings', details: 'Navigate to account settings' },
        { step: 3, action: 'Find Developer Section', details: 'Look for API or Developer settings' },
        { step: 4, action: 'Generate Keys', details: 'Create API keys for your integration' }
      ],
      notes: [
        'South Africa focused',
        'Business verification required',
        'Supports online and in-person payments'
      ]
    },
    required_permissions: ['payments', 'transactions']
  },

  ozow: {
    id: 'ozow',
    name: 'Ozow',
    category: 'payments',
    status: 'active',
    icon: DollarSign,
    color: 'bg-orange-500',
    description: 'Instant EFT payment solution for South Africa. Enable fast, secure bank transfers without card details.',
    capabilities: ['instant_eft', 'notifications', 'reconciliation'],
    use_cases: [
      'Accept instant bank transfers',
      'Skip card fees',
      'Real-time payment confirmation',
      'Automated reconciliation',
      'Reduce payment fraud'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://ozow.com/developer-docs/',
    api_key_instructions: {
      title: 'How to Set Up Ozow Integration',
      steps: [
        { step: 1, action: 'Register with Ozow', details: 'Sign up for Ozow merchant account' },
        { step: 2, action: 'Complete Verification', details: 'Verify your business details' },
        { step: 3, action: 'Access Portal', details: 'Log in to merchant portal' },
        { step: 4, action: 'Get API Credentials', details: 'Retrieve API Key, Site Code, and Private Key' }
      ],
      notes: [
        'South African banks only',
        'Lower fees than card payments',
        'Instant payment confirmation'
      ]
    },
    required_permissions: ['payments']
  },

  wise: {
    id: 'wise',
    name: 'Wise (TransferWise)',
    category: 'payments',
    status: 'active',
    icon: Globe,
    color: 'bg-green-500',
    description: 'International money transfers and multi-currency accounts. Best rates for global payments and receiving money abroad.',
    capabilities: ['transfers', 'balances', 'recipients', 'exchange_rates'],
    use_cases: [
      'Send international payments',
      'Receive money in multiple currencies',
      'Pay contractors globally',
      'Get real exchange rates',
      'Manage multi-currency business'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-7 minutes',
    documentation_url: 'https://api-docs.wise.com/',
    api_key_instructions: {
      title: 'How to Get Wise API Token',
      steps: [
        { step: 1, action: 'Log in to Wise', details: 'Access your Wise Business account' },
        { step: 2, action: 'Go to Settings', details: 'Navigate to Settings' },
        { step: 3, action: 'Find API Tokens', details: 'Look for "API tokens" section' },
        { step: 4, action: 'Create Token', details: 'Generate a new API token' }
      ],
      notes: [
        'Business account required for API',
        'Sandbox environment available',
        'Strong Customer Authentication required in some regions'
      ]
    },
    required_permissions: ['transfers', 'balances']
  },

  // ======================
  // PAYMENTS (GLOBAL & SA CONT.)
  // ======================
  payoneer: {
    id: 'payoneer',
    name: 'Payoneer',
    category: 'payments',
    status: 'active',
    icon: DollarSign,
    color: 'bg-orange-600',
    description: 'Global payouts for freelancers and SMBs. Receive and send money internationally with low friction.',
    capabilities: ['payouts', 'receiving_accounts', 'balances', 'transactions'],
    use_cases: [
      'Pay international contractors at scale',
      'Create local receiving accounts',
      'Reconcile payout transactions',
      'Automate vendor payments'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developer.payoneer.com/',
    api_key_instructions: {
      title: 'How to Get Payoneer API Access',
      steps: [
        { step: 1, action: 'Apply for API access', details: 'Contact Payoneer support to enable API for your business account' },
        { step: 2, action: 'Receive credentials', details: 'Get your API username and password / keys' },
        { step: 3, action: 'Whitelist IPs', details: 'Provide IPs for API access if requested' }
      ],
      notes: [
        'Business account required',
        'Partner approval may be required'
      ]
    },
    required_permissions: ['read', 'write']
  },
  braintree: {
    id: 'braintree',
    name: 'Braintree',
    category: 'payments',
    status: 'active',
    icon: DollarSign,
    color: 'bg-gray-800',
    description: 'Payments by PayPal. Flexible gateway with PayPal and cards support.',
    capabilities: ['payments', 'vault', 'subscriptions', 'webhooks'],
    use_cases: [
      'Accept PayPal and card payments',
      'Store customer payment methods',
      'Manage recurring billing',
      'Handle disputes and refunds'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developer.paypal.com/braintree/docs',
    api_key_instructions: {
      title: 'How to Get Braintree API Keys',
      steps: [
        { step: 1, action: 'Create Braintree account', details: 'Sign up and complete verification' },
        { step: 2, action: 'Get API keys', details: 'In Settings > API, generate Public/Private keys and Merchant ID' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  snapscan: {
    id: 'snapscan',
    name: 'SnapScan',
    category: 'payments',
    status: 'active',
    icon: DollarSign,
    color: 'bg-blue-700',
    description: 'South African mobile QR payments for in-person and online checkout.',
    capabilities: ['qr_payments', 'transactions', 'refunds'],
    use_cases: [
      'Accept QR payments at checkout',
      'Reconcile transactions',
      'Issue refunds programmatically'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://merchantportal.snapscan.io/',
    api_key_instructions: {
      title: 'How to Get SnapScan API Key',
      steps: [
        { step: 1, action: 'Create merchant account', details: 'Register your business with SnapScan' },
        { step: 2, action: 'Request API access', details: 'Enable API in merchant portal and generate keys' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  zapper: {
    id: 'zapper',
    name: 'Zapper',
    category: 'payments',
    status: 'active',
    icon: DollarSign,
    color: 'bg-indigo-600',
    description: 'South African QR payments and loyalty. Great for SMEs and hospitality.',
    capabilities: ['qr_payments', 'transactions', 'reconciliation'],
    use_cases: [
      'Accept QR payments',
      'Track daily settlements',
      'Reconcile orders to payments'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://zapper.com/',
    api_key_instructions: {
      title: 'How to Integrate Zapper',
      steps: [
        { step: 1, action: 'Merchant signup', details: 'Create merchant account and request integration docs' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  peach_payments: {
    id: 'peach_payments',
    name: 'Peach Payments',
    category: 'payments',
    status: 'active',
    icon: DollarSign,
    color: 'bg-teal-600',
    description: 'South African and African online payments platform for cards and APMs.',
    capabilities: ['payments', 'subscriptions', 'refunds', 'webhooks'],
    use_cases: [
      'Accept card and alternative payments',
      'Manage refunds and settlements',
      'Process recurring billing'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://peachpayments.docs.apiary.io/',
    api_key_instructions: {
      title: 'How to Get Peach Payments Credentials',
      steps: [
        { step: 1, action: 'Contact sales/support', details: 'Request test and live credentials' },
        { step: 2, action: 'Configure webhooks', details: 'Set notification URLs for payment events' }
      ]
    },
    required_permissions: ['read', 'write']
  },

  // ======================
  // ACCOUNTING
  // ======================
  sage: {
    id: 'sage',
    name: 'Sage Business Cloud Accounting',
    category: 'accounting',
    status: 'active',
    icon: DollarSign,
    color: 'bg-green-700',
    description: 'Popular accounting for SMEs in SA/EU. Invoices, bank feeds, VAT, and reporting.',
    capabilities: ['invoices', 'contacts', 'bank', 'tax', 'reports'],
    use_cases: [
      'Sync invoices and contacts',
      'Reconcile bank transactions',
      'Generate VAT reports'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developer.sage.com/',
    api_key_instructions: {
      title: 'How to Set Up Sage API',
      steps: [
        { step: 1, action: 'Create developer app', details: 'Register an app in Sage Developer portal' },
        { step: 2, action: 'Use OAuth 2.0', details: 'Obtain client credentials and perform OAuth flow' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  freshbooks: {
    id: 'freshbooks',
    name: 'FreshBooks',
    category: 'accounting',
    status: 'active',
    icon: DollarSign,
    color: 'bg-blue-600',
    description: 'Simple accounting and invoicing for freelancers and small teams.',
    capabilities: ['invoices', 'expenses', 'clients', 'time_tracking'],
    use_cases: [
      'Generate invoices automatically',
      'Sync expenses by category',
      'Track time for billing'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://www.freshbooks.com/api',
    api_key_instructions: {
      title: 'How to Get FreshBooks OAuth Credentials',
      steps: [
        { step: 1, action: 'Create Developer App', details: 'Register app and obtain client ID/secret' },
        { step: 2, action: 'Authorize', details: 'Use OAuth to authorize account access' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  wave: {
    id: 'wave',
    name: 'Wave Accounting',
    category: 'accounting',
    status: 'active',
    icon: DollarSign,
    color: 'bg-indigo-700',
    description: 'Free accounting for micro-businesses. Invoicing, receipts, and reporting.',
    capabilities: ['invoices', 'customers', 'payments', 'reports'],
    use_cases: [
      'Generate and send invoices',
      'Track invoice payments',
      'Produce financial summaries'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developer.waveapps.com/',
    api_key_instructions: {
      title: 'How to Use Wave GraphQL API',
      steps: [
        { step: 1, action: 'Create developer app', details: 'Register and obtain client credentials' },
        { step: 2, action: 'Use OAuth', details: 'Perform OAuth flow and call GraphQL endpoint' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  zoho_books: {
    id: 'zoho_books',
    name: 'Zoho Books',
    category: 'accounting',
    status: 'active',
    icon: DollarSign,
    color: 'bg-red-600',
    description: 'Zoho suite accounting with invoices, expenses, and GST/VAT support.',
    capabilities: ['invoices', 'contacts', 'items', 'expenses', 'reports'],
    use_cases: [
      'Sync customer invoices',
      'Manage product/service items',
      'Track expenses'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '7-10 minutes',
    documentation_url: 'https://www.zoho.com/books/api/',
    api_key_instructions: {
      title: 'How to Set Up Zoho Books API',
      steps: [
        { step: 1, action: 'Create OAuth client', details: 'Use Zoho API Console to create client' },
        { step: 2, action: 'Authorize', details: 'Perform OAuth to obtain access/refresh tokens' }
      ]
    },
    required_permissions: ['ZohoBooks.fullaccess']
  },

  // ======================
  // COMMUNICATION & MEETINGS
  // ======================
  outlook: {
    id: 'outlook',
    name: 'Outlook / Office 365 Mail',
    category: 'communication',
    status: 'active',
    icon: Mail,
    color: 'bg-blue-700',
    description: 'Microsoft 365 mail integration for sending, receiving, and organizing email.',
    capabilities: ['send_mail', 'read_mail', 'folders', 'labels'],
    use_cases: [
      'Send automated emails',
      'Organize inbox with rules',
      'Search threads and attachments'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '7-10 minutes',
    documentation_url: 'https://learn.microsoft.com/en-us/graph/api/overview',
    api_key_instructions: {
      title: 'How to Use Microsoft Graph API',
      steps: [
        { step: 1, action: 'Register Azure AD app', details: 'Create app in Azure portal and configure permissions' },
        { step: 2, action: 'Use OAuth 2.0', details: 'Obtain tokens via OAuth and call Graph endpoints' }
      ]
    },
    required_permissions: ['Mail.Read', 'Mail.Send']
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    category: 'communication',
    status: 'active',
    icon: MessageSquare,
    color: 'bg-blue-500',
    description: 'Messaging platform popular with creators and global markets. Bots and channels supported.',
    capabilities: ['bots', 'channels', 'messages', 'webhooks'],
    use_cases: [
      'Send broadcast messages',
      'Automate bot responses',
      'Manage community channels'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://core.telegram.org/bots/api',
    api_key_instructions: {
      title: 'How to Create Telegram Bot',
      steps: [
        { step: 1, action: 'Talk to @BotFather', details: 'Create a bot and receive token' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    category: 'communication',
    status: 'active',
    icon: MessageSquare,
    color: 'bg-indigo-700',
    description: 'Community and creator platform with servers, channels, and bots.',
    capabilities: ['bots', 'channels', 'webhooks', 'messages', 'voice'],
    use_cases: [
      'Automate announcements',
      'Manage community channels',
      'Log agent actions to a channel'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://discord.com/developers/docs/intro',
    api_key_instructions: {
      title: 'How to Create Discord Bot',
      steps: [
        { step: 1, action: 'Create application', details: 'In Discord Developer Portal create an application and bot' },
        { step: 2, action: 'Invite bot', details: 'Invite bot to your server with required scopes' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  zoom: {
    id: 'zoom',
    name: 'Zoom',
    category: 'communication',
    status: 'active',
    icon: Video,
    color: 'bg-blue-600',
    description: 'Video conferencing and webinars. Meetings, recordings, and transcripts.',
    capabilities: ['meetings', 'recordings', 'transcripts', 'users'],
    use_cases: [
      'Schedule meetings for agents',
      'Fetch recordings for summaries',
      'Analyze call transcripts'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '7-10 minutes',
    documentation_url: 'https://developers.zoom.us/docs/api/',
    api_key_instructions: {
      title: 'How to Create Zoom App',
      steps: [
        { step: 1, action: 'Create Server-to-Server OAuth app', details: 'In Zoom Marketplace create app and get credentials' }
      ]
    },
    required_permissions: ['meeting:read', 'recording:read']
  },
  google_meet: {
    id: 'google_meet',
    name: 'Google Meet',
    category: 'communication',
    status: 'active',
    icon: Video,
    color: 'bg-green-600',
    description: 'Google Meet integration for scheduling and meeting insights.',
    capabilities: ['meetings', 'calendar_hooks'],
    use_cases: [
      'Schedule meetings via Calendar',
      'Route recordings to Content Intelligence Agent'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '7-10 minutes',
    documentation_url: 'https://developers.google.com/calendar',
    api_key_instructions: {
      title: 'How to Enable Google APIs',
      steps: [
        { step: 1, action: 'Enable Calendar API', details: 'Use Google Cloud Console to enable and create OAuth credentials' }
      ]
    },
    required_permissions: ['calendar']
  },
  microsoft_teams: {
    id: 'microsoft_teams',
    name: 'Microsoft Teams',
    category: 'communication',
    status: 'active',
    icon: MessageSquare,
    color: 'bg-purple-700',
    description: 'Corporate communication with channels, chat, and meetings.',
    capabilities: ['chat', 'channels', 'meetings', 'webhooks'],
    use_cases: [
      'Post agent updates to channels',
      'Schedule meetings',
      'Notify stakeholders of actions'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://learn.microsoft.com/en-us/microsoftteams/platform/',
    api_key_instructions: {
      title: 'How to Register Azure AD App for Teams',
      steps: [
        { step: 1, action: 'Register app', details: 'Use Azure AD App Registrations and configure Graph permissions' }
      ]
    },
    required_permissions: ['ChannelMessage.Send', 'Chat.ReadWrite']
  },
  twilio: {
    id: 'twilio',
    name: 'Twilio',
    category: 'communication',
    status: 'active',
    icon: Phone,
    color: 'bg-red-600',
    description: 'Programmable SMS, voice, and WhatsApp messaging.',
    capabilities: ['sms', 'voice', 'whatsapp', 'webhooks'],
    use_cases: [
      'Send OTP and notifications',
      'Automate outbound SMS',
      'Handle voice calls with IVR'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://www.twilio.com/docs',
    api_key_instructions: {
      title: 'How to Get Twilio Credentials',
      steps: [
        { step: 1, action: 'Create account', details: 'Get Account SID and Auth Token from Console' }
      ]
    },
    required_permissions: ['read', 'write']
  },

  // ======================
  // PRODUCTIVITY & STORAGE
  // ======================
  airtable: {
    id: 'airtable',
    name: 'Airtable',
    category: 'productivity',
    status: 'active',
    icon: Database,
    color: 'bg-cyan-600',
    description: 'Relational spreadsheets for content ops, campaign planning, and data workflows.',
    capabilities: ['bases', 'tables', 'records', 'views'],
    use_cases: [
      'Manage content calendars',
      'Sync leads and deals',
      'Build lightweight CRMs'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://airtable.com/developers',
    api_key_instructions: {
      title: 'How to Get Airtable Token',
      steps: [
        { step: 1, action: 'Create personal token', details: 'In Airtable account, create a personal access token with scopes' }
      ]
    },
    required_permissions: ['data.records:read', 'data.records:write']
  },
  confluence: {
    id: 'confluence',
    name: 'Confluence',
    category: 'productivity',
    status: 'active',
    icon: FileText,
    color: 'bg-blue-700',
    description: 'Knowledge base and documentation for teams.',
    capabilities: ['pages', 'spaces', 'search'],
    use_cases: [
      'Publish SOPs and docs',
      'Index knowledge for agents',
      'Link to Jira issues'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developer.atlassian.com/cloud/confluence/rest/',
    api_key_instructions: {
      title: 'How to Use Confluence Cloud API',
      steps: [
        { step: 1, action: 'Create API token', details: 'Use Atlassian account to create token; use with email' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  box: {
    id: 'box',
    name: 'Box',
    category: 'productivity',
    status: 'active',
    icon: Package,
    color: 'bg-blue-500',
    description: 'Enterprise content management and file storage.',
    capabilities: ['files', 'folders', 'collaboration'],
    use_cases: [
      'Store large media assets',
      'Share files securely',
      'Sync client deliverables'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developer.box.com/',
    api_key_instructions: {
      title: 'How to Create Box App',
      steps: [
        { step: 1, action: 'Create Custom App', details: 'In Box Developer Console, create app and get JWT/OAuth credentials' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  icloud_drive: {
    id: 'icloud_drive',
    name: 'iCloud Drive',
    category: 'productivity',
    status: 'active',
    icon: Cloud,
    color: 'bg-gray-600',
    description: 'Apple file storage for Apple-heavy users.',
    capabilities: ['files', 'folders'],
    use_cases: [
      'Sync Apple ecosystem files',
      'Access shared folders'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developer.apple.com/icloud/',
    api_key_instructions: {
      title: 'How to Integrate iCloud Drive',
      steps: [
        { step: 1, action: 'Enable iCloud APIs', details: 'Use Apple Developer Program and configure entitlements' }
      ]
    },
    required_permissions: ['read', 'write']
  },

  // ======================
  // AUTOMATION PLATFORMS
  // ======================
  make: {
    id: 'make',
    name: 'Make (Integromat)',
    category: 'automation',
    status: 'active',
    icon: Zap,
    color: 'bg-purple-700',
    description: 'No-code automation for connecting apps and building workflows.',
    capabilities: ['scenarios', 'webhooks', 'modules', 'scheduling'],
    use_cases: [
      'Automate data syncing',
      'Trigger workflows via webhooks',
      'Orchestrate multi-step processes'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://www.make.com/en/help',
    api_key_instructions: {
      title: 'How to Get Make API Key',
      steps: [
        { step: 1, action: 'Generate token', details: 'In profile > API keys, generate and copy key' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  pabbly: {
    id: 'pabbly',
    name: 'Pabbly Connect',
    category: 'automation',
    status: 'active',
    icon: Zap,
    color: 'bg-pink-600',
    description: 'Affordable Zapier alternative for connecting apps and automating workflows.',
    capabilities: ['workflows', 'webhooks', 'scheduling'],
    use_cases: [
      'Automate lead capture',
      'Sync CRM to email marketing',
      'Post-process form submissions'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://www.pabbly.com/connect/integrations/',
    api_key_instructions: {
      title: 'How to Use Pabbly Webhooks',
      steps: [
        { step: 1, action: 'Create workflow', details: 'Add webhook trigger and copy URL for Guild-AI to call' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  tray: {
    id: 'tray',
    name: 'Tray.io',
    category: 'automation',
    status: 'active',
    icon: Zap,
    color: 'bg-gray-700',
    description: 'Enterprise-grade workflow automation with APIs and connectors.',
    capabilities: ['workflows', 'connectors', 'api_calls'],
    use_cases: [
      'Build enterprise integrations',
      'Create back-office automations'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://tray.io/documentation',
    api_key_instructions: {
      title: 'How to Use Tray Tokens',
      steps: [
        { step: 1, action: 'Create token', details: 'Generate personal or org token in Tray console' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  google_apps_script: {
    id: 'google_apps_script',
    name: 'Google Apps Script',
    category: 'automation',
    status: 'active',
    icon: FileCode,
    color: 'bg-yellow-500',
    description: 'Automate Google Workspace (Sheets, Docs, Gmail) with Apps Script.',
    capabilities: ['scripts', 'triggers', 'web_apps'],
    use_cases: [
      'Build Sheets workflows',
      'Automate Gmail drafting',
      'Publish webhooks'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developers.google.com/apps-script',
    api_key_instructions: {
      title: 'How to Deploy Apps Script',
      steps: [
        { step: 1, action: 'Create project and deploy', details: 'Use Apps Script editor, deploy web app, copy URL/token' }
      ]
    },
    required_permissions: ['read', 'write']
  },

  // ======================
  // E-COMMERCE & COURSES
  // ======================
  woocommerce: {
    id: 'woocommerce',
    name: 'WooCommerce',
    category: 'ecommerce',
    status: 'active',
    icon: ShoppingCart,
    color: 'bg-purple-700',
    description: 'WordPress e-commerce plugin for online stores of all sizes.',
    capabilities: ['products', 'orders', 'customers', 'coupons'],
    use_cases: [
      'Sync products and inventory',
      'Automate order processing',
      'Send customer notifications'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
    api_key_instructions: {
      title: 'How to Create WooCommerce REST Keys',
      steps: [
        { step: 1, action: 'In WP Admin', details: 'WooCommerce > Settings > Advanced > REST API: add key' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  bigcommerce: {
    id: 'bigcommerce',
    name: 'BigCommerce',
    category: 'ecommerce',
    status: 'active',
    icon: ShoppingCart,
    color: 'bg-blue-700',
    description: 'SaaS commerce platform for growing brands.',
    capabilities: ['catalog', 'orders', 'customers'],
    use_cases: [
      'Sync catalog and pricing',
      'Automate order flows'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developer.bigcommerce.com/api-docs',
    api_key_instructions: {
      title: 'How to Create API Account',
      steps: [
        { step: 1, action: 'Store settings', details: 'Advanced Settings > API Accounts: create and copy credentials' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  etsy: {
    id: 'etsy',
    name: 'Etsy',
    category: 'ecommerce',
    status: 'active',
    icon: ShoppingCart,
    color: 'bg-orange-500',
    description: 'Marketplace for handmade, vintage, and custom goods.',
    capabilities: ['listings', 'orders', 'shops'],
    use_cases: [
      'Sync product listings',
      'Track orders and messages'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developers.etsy.com/documentation',
    api_key_instructions: {
      title: 'How to Create Etsy App',
      steps: [
        { step: 1, action: 'Create app', details: 'From Etsy Developer portal, create app and get keystring' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  magento: {
    id: 'magento',
    name: 'Magento / Adobe Commerce',
    category: 'ecommerce',
    status: 'active',
    icon: ShoppingCart,
    color: 'bg-gray-800',
    description: 'Enterprise-grade e-commerce platform with powerful APIs.',
    capabilities: ['catalog', 'orders', 'customers'],
    use_cases: [
      'Sync catalog and inventory',
      'Manage orders and shipments'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developer.adobe.com/commerce/',
    api_key_instructions: {
      title: 'How to Use Magento Tokens',
      steps: [
        { step: 1, action: 'Create integration', details: 'System > Extensions > Integrations: create integration for tokens' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  gumroad: {
    id: 'gumroad',
    name: 'Gumroad',
    category: 'ecommerce',
    status: 'active',
    icon: ShoppingCart,
    color: 'bg-pink-600',
    description: 'Sell digital goods, memberships, and courses.',
    capabilities: ['products', 'sales', 'customers'],
    use_cases: [
      'Sync digital product sales',
      'Automate delivery emails'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://gumroad.com/api',
    api_key_instructions: {
      title: 'How to Get Gumroad Token',
      steps: [
        { step: 1, action: 'Create application', details: 'Register app and obtain OAuth token' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  kajabi: {
    id: 'kajabi',
    name: 'Kajabi',
    category: 'ecommerce',
    status: 'active',
    icon: ShoppingCart,
    color: 'bg-blue-600',
    description: 'All-in-one courses, communities, and digital products platform.',
    capabilities: ['offers', 'products', 'contacts', 'orders'],
    use_cases: [
      'Sync students and purchases',
      'Automate onboarding sequences'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developers.kajabi.com/',
    api_key_instructions: {
      title: 'How to Create Kajabi API Key',
      steps: [
        { step: 1, action: 'Admin settings', details: 'In Kajabi admin, generate API key/secret' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  teachable: {
    id: 'teachable',
    name: 'Teachable',
    category: 'ecommerce',
    status: 'active',
    icon: ShoppingCart,
    color: 'bg-orange-600',
    description: 'Create and sell online courses with student management.',
    capabilities: ['courses', 'students', 'orders'],
    use_cases: [
      'Sync students to CRM',
      'Track course purchases'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developers.teachable.com/',
    api_key_instructions: {
      title: 'How to Get Teachable Key',
      steps: [
        { step: 1, action: 'Developer settings', details: 'Enable API and copy key/secret' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  podia: {
    id: 'podia',
    name: 'Podia',
    category: 'ecommerce',
    status: 'active',
    icon: ShoppingCart,
    color: 'bg-purple-600',
    description: 'Sell courses, downloads, and memberships.',
    capabilities: ['products', 'customers', 'orders'],
    use_cases: [
      'Sync buyers and orders',
      'Automate onboarding'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://docs.podia.com/',
    api_key_instructions: {
      title: 'How to Get Podia API Key',
      steps: [
        { step: 1, action: 'Create developer token', details: 'Generate token from Podia settings' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  thinkific: {
    id: 'thinkific',
    name: 'Thinkific',
    category: 'ecommerce',
    status: 'active',
    icon: ShoppingCart,
    color: 'bg-teal-600',
    description: 'Online course platform with robust APIs.',
    capabilities: ['courses', 'enrollments', 'orders', 'users'],
    use_cases: [
      'Sync enrollments to CRM',
      'Track student progress'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developers.thinkific.com/api/',
    api_key_instructions: {
      title: 'How to Get Thinkific API Key',
      steps: [
        { step: 1, action: 'Create API key', details: 'In Thinkific Admin > Settings > Code & analytics' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  payhip: {
    id: 'payhip',
    name: 'Payhip',
    category: 'ecommerce',
    status: 'active',
    icon: ShoppingCart,
    color: 'bg-gray-700',
    description: 'Sell digital downloads and memberships.',
    capabilities: ['products', 'orders', 'customers'],
    use_cases: [
      'Sync product sales',
      'Send post-purchase sequences'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://docs.payhip.com/',
    api_key_instructions: {
      title: 'How to Get Payhip API Key',
      steps: [
        { step: 1, action: 'Generate API key', details: 'From Payhip account settings' }
      ]
    },
    required_permissions: ['read', 'write']
  },

  // ======================
  // DEVELOPMENT & CLOUD
  // ======================
  gitlab: {
    id: 'gitlab',
    name: 'GitLab',
    category: 'development',
    status: 'active',
    icon: Globe,
    color: 'bg-orange-600',
    description: 'Source code hosting, CI/CD, and DevOps platform.',
    capabilities: ['repos', 'issues', 'merge_requests', 'pipelines'],
    use_cases: [
      'Track issues and MRs',
      'Monitor pipelines',
      'Automate releases'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://docs.gitlab.com/ee/api/',
    api_key_instructions: {
      title: 'How to Create GitLab Token',
      steps: [
        { step: 1, action: 'Create personal access token', details: 'In GitLab profile > Access Tokens' }
      ]
    },
    required_permissions: ['api']
  },
  bitbucket: {
    id: 'bitbucket',
    name: 'Bitbucket',
    category: 'development',
    status: 'active',
    icon: Globe,
    color: 'bg-blue-600',
    description: 'Git hosting by Atlassian, integrated with Jira.',
    capabilities: ['repos', 'pull_requests', 'pipelines'],
    use_cases: [
      'Sync issues with Jira',
      'Automate pipeline notifications'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://developer.atlassian.com/bitbucket/api/2/reference/',
    api_key_instructions: {
      title: 'How to Use App Passwords',
      steps: [
        { step: 1, action: 'Create app password', details: 'From Bitbucket account > App passwords' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  aws_cloudwatch: {
    id: 'aws_cloudwatch',
    name: 'AWS CloudWatch',
    category: 'development',
    status: 'active',
    icon: Monitor,
    color: 'bg-orange-500',
    description: 'AWS monitoring and observability for logs, metrics, and alarms.',
    capabilities: ['metrics', 'logs', 'alarms'],
    use_cases: [
      'Alert on error spikes',
      'Visualize performance metrics'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://docs.aws.amazon.com/cloudwatch/',
    api_key_instructions: {
      title: 'How to Configure AWS Access',
      steps: [
        { step: 1, action: 'Create IAM user', details: 'Grant CloudWatch read permissions and create access keys' }
      ]
    },
    required_permissions: ['cloudwatch:Read']
  },
  cloudflare: {
    id: 'cloudflare',
    name: 'Cloudflare',
    category: 'development',
    status: 'active',
    icon: Globe,
    color: 'bg-yellow-600',
    description: 'CDN, security, and performance with analytics and DNS APIs.',
    capabilities: ['dns', 'analytics', 'security', 'workers'],
    use_cases: [
      'Purge cache on deploy',
      'Manage DNS automatically'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://api.cloudflare.com/',
    api_key_instructions: {
      title: 'How to Create API Token',
      steps: [
        { step: 1, action: 'Create API token', details: 'Use template for DNS/Zone read-write as needed' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  digitalocean: {
    id: 'digitalocean',
    name: 'DigitalOcean',
    category: 'development',
    status: 'active',
    icon: Globe,
    color: 'bg-blue-500',
    description: 'Simple cloud infrastructure: Droplets, Kubernetes, Spaces.',
    capabilities: ['droplets', 'kubernetes', 'spaces'],
    use_cases: [
      'Scale workloads',
      'Manage deployments'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://docs.digitalocean.com/reference/api/',
    api_key_instructions: {
      title: 'How to Create DO Token',
      steps: [
        { step: 1, action: 'Generate PAT', details: 'Personal access token in DO Control Panel' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  google_cloud_vertex_ai: {
    id: 'google_cloud_vertex_ai',
    name: 'Google Cloud Vertex AI',
    category: 'development',
    status: 'active',
    icon: Brain,
    color: 'bg-purple-700',
    description: 'Managed ML platform: models, endpoints, vector search, and pipelines.',
    capabilities: ['models', 'endpoints', 'embeddings', 'pipelines'],
    use_cases: [
      'Host custom LLMs',
      'Embed and search documents'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://cloud.google.com/vertex-ai/docs',
    api_key_instructions: {
      title: 'How to Enable Vertex AI',
      steps: [
        { step: 1, action: 'Enable APIs and service account', details: 'Create service account JSON and set roles' }
      ]
    },
    required_permissions: ['read', 'write']
  },

  // ======================
  // DESIGN & CREATIVE
  // ======================
  figma: {
    id: 'figma',
    name: 'Figma',
    category: 'design',
    status: 'active',
    icon: Palette,
    color: 'bg-pink-500',
    description: 'Collaborative design platform for UI/UX with component APIs.',
    capabilities: ['files', 'comments', 'components'],
    use_cases: [
      'Export assets for campaigns',
      'Sync design comments to tasks'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://www.figma.com/developers/api',
    api_key_instructions: {
      title: 'How to Create Figma Token',
      steps: [
        { step: 1, action: 'Generate personal access token', details: 'In Figma account settings' }
      ]
    },
    required_permissions: ['read']
  },
  adobe_cc: {
    id: 'adobe_cc',
    name: 'Adobe Creative Cloud',
    category: 'design',
    status: 'active',
    icon: Camera,
    color: 'bg-red-600',
    description: 'Industry-standard apps (Photoshop, Premiere, Illustrator) with cloud APIs.',
    capabilities: ['assets', 'libraries', 'storage'],
    use_cases: [
      'Manage brand assets',
      'Automate render workflows'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developer.adobe.com/',
    api_key_instructions: {
      title: 'How to Register Adobe App',
      steps: [
        { step: 1, action: 'Create project', details: 'In Adobe Developer Console, create project and add APIs' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  midjourney: {
    id: 'midjourney',
    name: 'Midjourney',
    category: 'design',
    status: 'active',
    icon: Brain,
    color: 'bg-gray-900',
    description: 'AI image generation via Discord bot workflows.',
    capabilities: ['image_generation'],
    use_cases: [
      'Generate hero images',
      'Create concepts for campaigns'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://docs.midjourney.com/',
    api_key_instructions: {
      title: 'How to Automate Midjourney',
      steps: [
        { step: 1, action: 'Use Discord bot', details: 'Automate prompts via Discord bot and webhooks' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  stable_diffusion: {
    id: 'stable_diffusion',
    name: 'Stable Diffusion',
    category: 'design',
    status: 'active',
    icon: Brain,
    color: 'bg-green-700',
    description: 'Local or hosted image generation via Diffusers/SDXL.',
    capabilities: ['image_generation'],
    use_cases: [
      'Generate branded assets',
      'Batch render variations'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://huggingface.co/docs/diffusers/index',
    api_key_instructions: {
      title: 'How to Run SD',
      steps: [
        { step: 1, action: 'Setup env', details: 'Use GPU runtime or local install and provide endpoint URL' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  runwayml: {
    id: 'runwayml',
    name: 'RunwayML',
    category: 'design',
    status: 'active',
    icon: Video,
    color: 'bg-teal-700',
    description: 'AI video generation and editing platform.',
    capabilities: ['video_generation', 'assets'],
    use_cases: [
      'Create short-form videos',
      'Generate b-roll and edits'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://runwayml.com/docs',
    api_key_instructions: {
      title: 'How to Use Runway API',
      steps: [
        { step: 1, action: 'Generate API key', details: 'From account settings' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  descript: {
    id: 'descript',
    name: 'Descript',
    category: 'design',
    status: 'active',
    icon: Video,
    color: 'bg-indigo-600',
    description: 'Video and audio editing with transcripts and AI tools.',
    capabilities: ['projects', 'media', 'transcripts'],
    use_cases: [
      'Edit podcasts automatically',
      'Generate social clips'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://www.descript.com/api',
    api_key_instructions: {
      title: 'How to Use Descript API',
      steps: [
        { step: 1, action: 'Create API token', details: 'From Descript account settings' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  opusclip: {
    id: 'opusclip',
    name: 'OpusClip',
    category: 'design',
    status: 'active',
    icon: Video,
    color: 'bg-purple-600',
    description: 'Auto video clipping for short-form social content.',
    capabilities: ['clips', 'exports'],
    use_cases: [
      'Auto-generate shorts from long videos'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://www.opus.pro/',
    api_key_instructions: {
      title: 'How to Use OpusClip API',
      steps: [
        { step: 1, action: 'Request API access', details: 'Obtain key from support/portal' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  did: {
    id: 'did',
    name: 'D-ID',
    category: 'design',
    status: 'active',
    icon: Video,
    color: 'bg-gray-700',
    description: 'Talking head video generator from still images and audio.',
    capabilities: ['talking_head'],
    use_cases: [
      'Generate presenter videos'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://docs.d-id.com/docs',
    api_key_instructions: {
      title: 'How to Use D-ID API',
      steps: [
        { step: 1, action: 'Create API key', details: 'From D-ID console' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  leonardo: {
    id: 'leonardo',
    name: 'Leonardo AI',
    category: 'design',
    status: 'active',
    icon: Camera,
    color: 'bg-yellow-600',
    description: 'AI image generation tuned for design workflows.',
    capabilities: ['image_generation'],
    use_cases: [
      'Create ad variations',
      'Generate illustrations'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://docs.leonardo.ai/',
    api_key_instructions: {
      title: 'How to Get Leonardo API Key',
      steps: [
        { step: 1, action: 'Create API key', details: 'From Leonardo account portal' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  lumen5: {
    id: 'lumen5',
    name: 'Lumen5',
    category: 'design',
    status: 'active',
    icon: Video,
    color: 'bg-blue-500',
    description: 'Turn articles into videos with AI templates.',
    capabilities: ['video_generation'],
    use_cases: [
      'Convert blogs to social videos'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://lumen5.com/',
    api_key_instructions: {
      title: 'How to Access Lumen5 API',
      steps: [
        { step: 1, action: 'Request API access', details: 'Contact sales for API availability' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  synthesia: {
    id: 'synthesia',
    name: 'Synthesia',
    category: 'design',
    status: 'active',
    icon: Video,
    color: 'bg-green-600',
    description: 'AI avatar video generation platform.',
    capabilities: ['avatar_video'],
    use_cases: [
      'Generate training and marketing videos'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://docs.synthesia.io/',
    api_key_instructions: {
      title: 'How to Use Synthesia API',
      steps: [
        { step: 1, action: 'Create API key', details: 'From Synthesia dashboard' }
      ]
    },
    required_permissions: ['read', 'write']
  },

  // ======================
  // CUSTOMER SUPPORT
  // ======================
  zendesk: {
    id: 'zendesk',
    name: 'Zendesk',
    category: 'support',
    status: 'active',
    icon: Users,
    color: 'bg-green-600',
    description: 'Industry-leading ticketing and customer service platform.',
    capabilities: ['tickets', 'users', 'organizations', 'macros'],
    use_cases: [
      'Create and triage tickets',
      'Auto-assign based on intent'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developer.zendesk.com/api-reference/',
    api_key_instructions: {
      title: 'How to Use Zendesk API',
      steps: [
        { step: 1, action: 'Create API token', details: 'Admin Center > Apps and integrations > APIs' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  freshdesk: {
    id: 'freshdesk',
    name: 'Freshdesk',
    category: 'support',
    status: 'active',
    icon: Users,
    color: 'bg-blue-600',
    description: 'SMB-friendly helpdesk with email and chat support.',
    capabilities: ['tickets', 'contacts', 'conversations'],
    use_cases: [
      'Auto-reply with knowledge base',
      'Escalate based on SLAs'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://developers.freshdesk.com/api/',
    api_key_instructions: {
      title: 'How to Get Freshdesk API Key',
      steps: [
        { step: 1, action: 'Profile settings', details: 'Copy API key from Freshdesk profile' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  crisp: {
    id: 'crisp',
    name: 'Crisp Chat',
    category: 'support',
    status: 'active',
    icon: Users,
    color: 'bg-cyan-700',
    description: 'Affordable multichannel live chat and chatbot platform.',
    capabilities: ['conversations', 'contacts', 'events'],
    use_cases: [
      'Route chats to agents',
      'Send proactive messages'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://docs.crisp.chat/',
    api_key_instructions: {
      title: 'How to Create Crisp Tokens',
      steps: [
        { step: 1, action: 'Create website token', details: 'In Crisp dashboard, generate REST token' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  drift: {
    id: 'drift',
    name: 'Drift',
    category: 'support',
    status: 'active',
    icon: Users,
    color: 'bg-gray-700',
    description: 'Conversational marketing and sales chat platform.',
    capabilities: ['conversations', 'playbooks', 'contacts'],
    use_cases: [
      'Qualify leads via chatbots',
      'Hand off to sales automatically'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://devdocs.drift.com/',
    api_key_instructions: {
      title: 'How to Use Drift API',
      steps: [
        { step: 1, action: 'Create OAuth app', details: 'In Drift admin, create app and copy client credentials' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  tidio: {
    id: 'tidio',
    name: 'Tidio',
    category: 'support',
    status: 'active',
    icon: Users,
    color: 'bg-indigo-600',
    description: 'Live chat and chatbot automation for SMB websites.',
    capabilities: ['conversations', 'contacts'],
    use_cases: [
      'Capture leads via chat',
      'Automate FAQs'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://apidocs.tidio.com/',
    api_key_instructions: {
      title: 'How to Get Tidio API Key',
      steps: [
        { step: 1, action: 'Enable API', details: 'In Tidio settings, enable and copy API key' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  livechat: {
    id: 'livechat',
    name: 'LiveChat',
    category: 'support',
    status: 'active',
    icon: Users,
    color: 'bg-yellow-600',
    description: 'Live chat platform with rich integrations and reporting.',
    capabilities: ['conversations', 'agents', 'reports'],
    use_cases: [
      'Handoff to human agents',
      'Report on chat performance'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developers.livechat.com/',
    api_key_instructions: {
      title: 'How to Use LiveChat API',
      steps: [
        { step: 1, action: 'Create app', details: 'In Developer Console, create app and obtain tokens' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  helpscout: {
    id: 'helpscout',
    name: 'HelpScout',
    category: 'support',
    status: 'active',
    icon: Users,
    color: 'bg-blue-600',
    description: 'Email-style customer service tool for small teams.',
    capabilities: ['conversations', 'mailboxes', 'customers'],
    use_cases: [
      'Manage support email at scale',
      'Auto-label and route conversations'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://developer.helpscout.com/',
    api_key_instructions: {
      title: 'How to Create HelpScout App',
      steps: [
        { step: 1, action: 'OAuth app', details: 'Create OAuth app and copy client credentials' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  aircall: {
    id: 'aircall',
    name: 'Aircall',
    category: 'support',
    status: 'active',
    icon: Phone,
    color: 'bg-green-600',
    description: 'Cloud phone system with call routing and analytics.',
    capabilities: ['calls', 'contacts', 'webhooks'],
    use_cases: [
      'Log calls to CRM',
      'Trigger workflows on missed calls'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developer.aircall.io/',
    api_key_instructions: {
      title: 'How to Use Aircall API',
      steps: [
        { step: 1, action: 'Create API key', details: 'From Aircall admin > API keys' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  justcall: {
    id: 'justcall',
    name: 'JustCall',
    category: 'support',
    status: 'active',
    icon: Phone,
    color: 'bg-purple-600',
    description: 'Cloud telephony platform for sales and support teams.',
    capabilities: ['calls', 'sms', 'webhooks'],
    use_cases: [
      'Send SMS follow-ups',
      'Log calls to CRM'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://justcall.io/developer-docs',
    api_key_instructions: {
      title: 'How to Get JustCall API Key',
      steps: [
        { step: 1, action: 'Generate API key', details: 'From JustCall admin' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  twilio_flex: {
    id: 'twilio_flex',
    name: 'Twilio Flex',
    category: 'support',
    status: 'active',
    icon: Phone,
    color: 'bg-red-700',
    description: 'Programmable contact center built on Twilio.',
    capabilities: ['contacts', 'tasks', 'voice', 'chat'],
    use_cases: [
      'Route conversations intelligently',
      'Automate agent assist'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://www.twilio.com/docs/flex',
    api_key_instructions: {
      title: 'How to Configure Flex',
      steps: [
        { step: 1, action: 'Provision Flex project', details: 'Enable Flex and obtain credentials from Console' }
      ]
    },
    required_permissions: ['read', 'write']
  },

  // ======================
  // HUMAN OS (NEXT-GEN)
  // ======================
  google_calendar: {
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'human_os',
    status: 'active',
    icon: Calendar,
    color: 'bg-blue-600',
    description: 'Bi-directional calendar sync for tasks, meetings, and agent scheduling.',
    capabilities: ['events', 'webhooks', 'availability'],
    use_cases: [
      'Book meetings for agents',
      'Block time for focus work'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '7-10 minutes',
    documentation_url: 'https://developers.google.com/calendar',
    api_key_instructions: {
      title: 'How to Enable Calendar API',
      steps: [
        { step: 1, action: 'Create OAuth app', details: 'Enable API and create OAuth credentials' }
      ]
    },
    required_permissions: ['calendar']
  },
  outlook_calendar: {
    id: 'outlook_calendar',
    name: 'Outlook Calendar',
    category: 'human_os',
    status: 'active',
    icon: Calendar,
    color: 'bg-blue-800',
    description: 'Microsoft 365 calendar integration for corporate environments.',
    capabilities: ['events', 'rooms', 'availability'],
    use_cases: [
      'Reserve rooms and book meetings'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://learn.microsoft.com/en-us/graph/api/resources/event',
    api_key_instructions: {
      title: 'How to Use Microsoft Graph Calendar',
      steps: [
        { step: 1, action: 'Register app in Azure', details: 'Grant Calendars.ReadWrite and perform OAuth' }
      ]
    },
    required_permissions: ['Calendars.ReadWrite']
  },
  apple_calendar: {
    id: 'apple_calendar',
    name: 'Apple Calendar',
    category: 'human_os',
    status: 'active',
    icon: Calendar,
    color: 'bg-gray-700',
    description: 'Apple ecosystem calendar integration.',
    capabilities: ['events'],
    use_cases: [
      'Sync Apple calendar events'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developer.apple.com/',
    api_key_instructions: {
      title: 'How to Integrate Apple Calendar',
      steps: [
        { step: 1, action: 'Use CalDAV or Apple APIs', details: 'Configure tokens/entitlements as required' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  google_fit: {
    id: 'google_fit',
    name: 'Google Fit',
    category: 'human_os',
    status: 'active',
    icon: Heart,
    color: 'bg-red-600',
    description: 'Wellness signals for burnout prevention and productivity insights.',
    capabilities: ['activity', 'sleep', 'heart_rate'],
    use_cases: [
      'Detect burnout risk',
      'Recommend breaks'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developers.google.com/fit',
    api_key_instructions: {
      title: 'How to Enable Google Fit',
      steps: [
        { step: 1, action: 'Enable Fitness API', details: 'Create OAuth credentials and request sensitive scopes' }
      ]
    },
    required_permissions: ['read']
  },
  apple_health: {
    id: 'apple_health',
    name: 'Apple Health',
    category: 'human_os',
    status: 'active',
    icon: Heart,
    color: 'bg-red-700',
    description: 'HealthKit integration for wellness monitoring (with consent).',
    capabilities: ['activity', 'sleep', 'heart_rate'],
    use_cases: [
      'Track recovery and workload'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developer.apple.com/healthkit/',
    api_key_instructions: {
      title: 'How to Integrate HealthKit',
      steps: [
        { step: 1, action: 'Configure entitlements', details: 'Build native app connector to request permissions' }
      ]
    },
    required_permissions: ['read']
  },
  openai: {
    id: 'openai',
    name: 'OpenAI API',
    category: 'human_os',
    status: 'active',
    icon: Brain,
    color: 'bg-gray-800',
    description: 'LLM capabilities for reasoning, generation, and tool use.',
    capabilities: ['chat', 'embeddings', 'image', 'audio'],
    use_cases: [
      'Agent reasoning and planning',
      'Summarization and generation'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://platform.openai.com/docs',
    api_key_instructions: {
      title: 'How to Get OpenAI API Key',
      steps: [
        { step: 1, action: 'Create API key', details: 'From OpenAI dashboard' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    category: 'human_os',
    status: 'active',
    icon: Brain,
    color: 'bg-blue-900',
    description: 'Claude API for safe, helpful conversational AI.',
    capabilities: ['chat', 'tool_use'],
    use_cases: [
      'Long-context reasoning',
      'Evaluation and planning'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://docs.anthropic.com/claude/docs',
    api_key_instructions: {
      title: 'How to Get Anthropic API Key',
      steps: [
        { step: 1, action: 'Create key', details: 'From Anthropic console' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  google_gemini: {
    id: 'google_gemini',
    name: 'Google Gemini',
    category: 'human_os',
    status: 'active',
    icon: Brain,
    color: 'bg-blue-700',
    description: 'Google Generative AI for multimodal understanding and generation.',
    capabilities: ['chat', 'vision', 'embeddings'],
    use_cases: [
      'Multimodal content analysis',
      'Structured output generation'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://ai.google.dev/',
    api_key_instructions: {
      title: 'How to Get Gemini API Key',
      steps: [
        { step: 1, action: 'Create key', details: 'From Google AI Studio' }
      ]
    },
    required_permissions: ['read', 'write']
  },

  // ======================
  // REMAINING REQUESTED CONNECTORS
  // ======================
  snapchat_ads: {
    id: 'snapchat_ads',
    name: 'Snapchat Ads Manager',
    category: 'advertising',
    status: 'active',
    icon: Target,
    color: 'bg-yellow-500',
    description: 'Advertise to younger demographics with Snap Ads, Story Ads, and AR Lenses.',
    capabilities: ['campaigns', 'ad_squads', 'ads', 'creatives', 'reports'],
    use_cases: [
      'Launch Snap Ads for product brands',
      'Analyze AR Lens performance',
      'Optimize campaigns for engagement'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://marketingapi.snapchat.com/',
    api_key_instructions: {
      title: 'How to Use Snapchat Marketing API',
      steps: [
        { step: 1, action: 'Create Snap Developer app', details: 'Register app and request Marketing API access' },
        { step: 2, action: 'Obtain OAuth credentials', details: 'Copy client ID/secret and set redirect URI' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  buffer: {
    id: 'buffer',
    name: 'Buffer',
    category: 'social_media',
    status: 'active',
    icon: Globe,
    color: 'bg-teal-600',
    description: 'Plan and schedule posts to multiple social platforms.',
    capabilities: ['profiles', 'queue', 'posts', 'analytics'],
    use_cases: [
      'Centralize multi-platform scheduling',
      'Analyze post performance'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://docs.buffer.com/developer',
    api_key_instructions: {
      title: 'How to Use Buffer API',
      steps: [
        { step: 1, action: 'Create app', details: 'In Buffer developer portal create app and get OAuth credentials' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  hootsuite: {
    id: 'hootsuite',
    name: 'Hootsuite',
    category: 'social_media',
    status: 'active',
    icon: Globe,
    color: 'bg-gray-700',
    description: 'Enterprise social media scheduling and analytics.',
    capabilities: ['profiles', 'scheduler', 'analytics'],
    use_cases: [
      'Manage enterprise social posting',
      'Collaborate on content calendars'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developer.hootsuite.com/',
    api_key_instructions: {
      title: 'How to Use Hootsuite API',
      steps: [
        { step: 1, action: 'Request app access', details: 'Apply for API access and obtain OAuth credentials' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  later: {
    id: 'later',
    name: 'Later',
    category: 'social_media',
    status: 'active',
    icon: Globe,
    color: 'bg-purple-500',
    description: 'Visual social media planner for Instagram, TikTok, and more.',
    capabilities: ['posts', 'media', 'scheduler'],
    use_cases: [
      'Plan Instagram grid visually',
      'Schedule TikTok videos'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developers.later.com/',
    api_key_instructions: {
      title: 'How to Integrate Later',
      steps: [
        { step: 1, action: 'Create developer account', details: 'Request API access and create OAuth app' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  google_analytics: {
    id: 'google_analytics',
    name: 'Google Analytics 4',
    category: 'analytics',
    status: 'active',
    icon: BarChart,
    color: 'bg-orange-600',
    description: 'Measure campaign ROI, traffic sources, and conversions for data-driven decisions.',
    capabilities: ['reports', 'events', 'audiences'],
    use_cases: [
      'Attribute ad spend to conversions',
      'Analyze channel performance'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '7-10 minutes',
    documentation_url: 'https://developers.google.com/analytics',
    api_key_instructions: {
      title: 'How to Use GA4 Reporting API',
      steps: [
        { step: 1, action: 'Enable Analytics Data API', details: 'Create service account and grant GA4 property access' }
      ]
    },
    required_permissions: ['read']
  },

  keap: {
    id: 'keap',
    name: 'Keap (Infusionsoft)',
    category: 'crm',
    status: 'active',
    icon: Database,
    color: 'bg-green-700',
    description: 'CRM plus powerful email automation for solopreneurs and SMBs.',
    capabilities: ['contacts', 'tags', 'campaigns', 'orders'],
    use_cases: [
      'Trigger complex email sequences',
      'Tag-based segmentation'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developer.keap.com/',
    api_key_instructions: {
      title: 'How to Create Keap App',
      steps: [
        { step: 1, action: 'Create OAuth app', details: 'In Keap developer portal, create app and get client credentials' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  close: {
    id: 'close',
    name: 'Close CRM',
    category: 'crm',
    status: 'active',
    icon: Database,
    color: 'bg-gray-700',
    description: 'High-performance sales CRM with calling and SMS built-in.',
    capabilities: ['leads', 'opportunities', 'activities', 'calls', 'sms'],
    use_cases: [
      'Power outbound sales',
      'Log activities automatically'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://developer.close.com/',
    api_key_instructions: {
      title: 'How to Get Close API Key',
      steps: [
        { step: 1, action: 'Generate API key', details: 'In Close settings > API keys' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  freshsales: {
    id: 'freshsales',
    name: 'Freshsales',
    category: 'crm',
    status: 'active',
    icon: Database,
    color: 'bg-indigo-600',
    description: 'CRM for SMBs with AI lead scoring and pipelines.',
    capabilities: ['leads', 'contacts', 'deals', 'tasks'],
    use_cases: [
      'Score and route leads',
      'Automate sales stages'
    ],
    setup_complexity: 'easy',
    estimated_setup_time: '3-5 minutes',
    documentation_url: 'https://developers.freshworks.com/crm/',
    api_key_instructions: {
      title: 'How to Get Freshsales API Key',
      steps: [
        { step: 1, action: 'User settings', details: 'Copy API key from Freshsales profile' }
      ]
    },
    required_permissions: ['read', 'write']
  },

  evernote: {
    id: 'evernote',
    name: 'Evernote',
    category: 'productivity',
    status: 'active',
    icon: FileText,
    color: 'bg-green-600',
    description: 'Note-taking for individuals and teams, still widely used.',
    capabilities: ['notes', 'notebooks', 'search'],
    use_cases: [
      'Sync research notes',
      'Index knowledge for agents'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://dev.evernote.com/',
    api_key_instructions: {
      title: 'How to Use Evernote API',
      steps: [
        { step: 1, action: 'Create developer app', details: 'Apply for API access and obtain keys' }
      ]
    },
    required_permissions: ['read', 'write']
  },

  alexa: {
    id: 'alexa',
    name: 'Amazon Alexa Skills',
    category: 'human_os',
    status: 'active',
    icon: Voice,
    color: 'bg-blue-600',
    description: 'Voice assistant integration for voice-triggered workflows.',
    capabilities: ['skills', 'events'],
    use_cases: [
      'Trigger workflows by voice',
      'Provide spoken status updates'
    ],
    setup_complexity: 'high',
    estimated_setup_time: '10-15 minutes',
    documentation_url: 'https://developer.amazon.com/en-US/alexa',
    api_key_instructions: {
      title: 'How to Build an Alexa Skill',
      steps: [
        { step: 1, action: 'Create skill', details: 'Use Alexa Developer Console and link account for OAuth' }
      ]
    },
    required_permissions: ['read']
  },
  siri_shortcuts: {
    id: 'siri_shortcuts',
    name: 'Apple Siri Shortcuts',
    category: 'human_os',
    status: 'active',
    icon: Voice,
    color: 'bg-gray-700',
    description: 'Trigger Guild automations from Siri Shortcuts on iOS/macOS.',
    capabilities: ['shortcuts'],
    use_cases: [
      'Start workflows hands-free'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developer.apple.com/sirikit/',
    api_key_instructions: {
      title: 'How to Integrate Shortcuts',
      steps: [
        { step: 1, action: 'Create App Intents', details: 'Implement App Intents/Shortcuts in a companion app' }
      ]
    },
    required_permissions: ['read']
  },

  taxjar: {
    id: 'taxjar',
    name: 'TaxJar',
    category: 'accounting',
    status: 'active',
    icon: DollarSign,
    color: 'bg-purple-700',
    description: 'Automated sales tax calculations and filings.',
    capabilities: ['rates', 'transactions', 'returns'],
    use_cases: [
      'Calculate sales tax',
      'Prepare returns'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://developers.taxjar.com/',
    api_key_instructions: {
      title: 'How to Use TaxJar API',
      steps: [
        { step: 1, action: 'Create API token', details: 'From TaxJar account settings' }
      ]
    },
    required_permissions: ['read', 'write']
  },
  quickfile: {
    id: 'quickfile',
    name: 'QuickFile',
    category: 'accounting',
    status: 'active',
    icon: DollarSign,
    color: 'bg-blue-700',
    description: 'UK-focused online accounting with API access.',
    capabilities: ['invoices', 'clients', 'bank', 'reports'],
    use_cases: [
      'Sync invoices and clients',
      'Reconcile bank feeds'
    ],
    setup_complexity: 'medium',
    estimated_setup_time: '5-10 minutes',
    documentation_url: 'https://api.quickfile.co.uk/',
    api_key_instructions: {
      title: 'How to Use QuickFile API',
      steps: [
        { step: 1, action: 'Generate API key', details: 'Enable API and create key from account settings' }
      ]
    },
    required_permissions: ['read', 'write']
  }
};

/**
 * Category metadata for organizing connectors
 */
export const connectorCategories = [
  {
    id: 'all',
    name: 'All Connectors',
    icon: Database,
    description: 'View all available integrations'
  },
  {
    id: 'advertising',
    name: 'Advertising',
    icon: Target,
    description: 'Ad platforms and campaign management'
  },
  {
    id: 'project_management',
    name: 'Project Management',
    icon: Calendar,
    description: 'Task and project tracking tools',
    connectors: ['asana', 'linear', 'monday']
  },
  {
    id: 'payments',
    name: 'Payments & Finance',
    icon: DollarSign,
    description: 'Payment processing and financial tools',
    connectors: ['stripe', 'square', 'paypal']
  },
  {
    id: 'accounting',
    name: 'Accounting',
    icon: DollarSign,
    description: 'Accounting and bookkeeping software',
    connectors: ['xero', 'quickbooks']
  },
  {
    id: 'crm',
    name: 'CRM & Sales',
    icon: Database,
    description: 'Customer relationship management',
    connectors: ['hubspot', 'salesforce', 'pipedrive']
  },
  {
    id: 'social_media',
    name: 'Social Media',
    icon: Globe,
    description: 'Social networking platforms',
    connectors: ['facebook', 'instagram', 'linkedin', 'twitter']
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: MessageSquare,
    description: 'Messaging and email platforms',
    connectors: ['slack', 'gmail', 'whatsapp', 'messenger']
  },
  {
    id: 'productivity',
    name: 'Productivity & Storage',
    icon: FileText,
    description: 'Document and file management',
    connectors: ['google_drive', 'onedrive', 'dropbox', 'notion']
  },
  {
    id: 'automation',
    name: 'Automation Platforms',
    icon: Zap,
    description: 'Workflow automation tools',
    connectors: ['n8n', 'zapier', 'make', 'workato']
  },
  {
    id: 'development',
    name: 'Development & Deployment',
    icon: Globe,
    description: 'Developer tools and platforms',
    connectors: ['vercel', 'netlify', 'github', 'sentry']
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    icon: ShoppingCart,
    description: 'Online store platforms',
    connectors: ['shopify', 'woocommerce', 'square']
  },
  {
    id: 'design',
    name: 'Design & Media',
    icon: Camera,
    description: 'Design tools and media management',
    connectors: ['canva', 'cloudinary']
  },
  {
    id: 'support',
    name: 'Customer Support',
    icon: Users,
    description: 'Customer support and engagement',
    connectors: ['intercom', 'zendesk']
  },
  {
    id: 'human_os',
    name: 'Human OS',
    icon: Heart,
    description: 'Calendars, wellness, assistants and agent collaboration'
  }
];

/**
 * Get connector configuration by ID
 */
export const getConnectorConfig = (connectorId) => {
  return connectorConfigurations[connectorId];
};

/**
 * Get all connectors for a specific category
 */
export const getConnectorsByCategory = (categoryId) => {
  if (categoryId === 'all') {
    return Object.values(connectorConfigurations);
  }
  
  return Object.values(connectorConfigurations).filter(
    connector => connector.category === categoryId
  );
};

/**
 * Get category information
 */
export const getCategoryInfo = (categoryId) => {
  return connectorCategories.find(cat => cat.id === categoryId);
};

