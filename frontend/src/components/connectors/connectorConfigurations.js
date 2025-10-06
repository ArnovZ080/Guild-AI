import {
  Calendar, DollarSign, FileText, Users, Camera, Globe,
  BarChart, MessageSquare, Zap, Database, Wrench, Shield,
  Package, TrendingUp, Mail, Video, Phone, ShoppingCart
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

