import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { 
  Sparkles, ArrowLeft, Search, Check, Globe, Zap,
  Mail, Calendar, FileText, Database, Cloud, Code,
  MessageSquare, ShoppingCart, DollarSign, Users,
  BarChart3, Briefcase, Image, Video, Music, Folder
} from 'lucide-react'
import guildLogo from '../assets/guild-logo.png'
import guildLogo from '../assets/guild-logo.png'

function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Integrations', count: 123, icon: <Globe className="w-4 h-4" /> },
    { id: 'communication', name: 'Communication', count: 15, icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'productivity', name: 'Productivity', count: 18, icon: <Briefcase className="w-4 h-4" /> },
    { id: 'marketing', name: 'Marketing', count: 20, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'finance', name: 'Finance', count: 12, icon: <DollarSign className="w-4 h-4" /> },
    { id: 'storage', name: 'Storage', count: 10, icon: <Folder className="w-4 h-4" /> },
    { id: 'creative', name: 'Creative', count: 8, icon: <Image className="w-4 h-4" /> },
    { id: 'ecommerce', name: 'E-commerce', count: 10, icon: <ShoppingCart className="w-4 h-4" /> }
  ]

  const integrations = [
    // Communication
    {
      name: 'Gmail',
      category: 'communication',
      description: 'Send, receive, and manage emails automatically',
      icon: <Mail className="w-6 h-6" />,
      color: 'from-red-500 to-orange-500',
      status: 'operational',
      features: ['Email automation', 'Template management', 'Scheduling', 'Analytics']
    },
    {
      name: 'Slack',
      category: 'communication',
      description: 'Post messages, manage channels, and automate workflows',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      status: 'operational',
      features: ['Message posting', 'Channel management', 'Notifications', 'Bot integration']
    },
    {
      name: 'Microsoft Teams',
      category: 'communication',
      description: 'Collaborate and communicate with your team',
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-purple-500',
      status: 'operational',
      features: ['Team messaging', 'File sharing', 'Meeting scheduling', 'Integrations']
    },
    {
      name: 'Zoom',
      category: 'communication',
      description: 'Schedule and manage video meetings',
      icon: <Video className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      status: 'operational',
      features: ['Meeting scheduling', 'Recording management', 'Participant tracking', 'Webinars']
    },

    // Productivity
    {
      name: 'Google Calendar',
      category: 'productivity',
      description: 'Manage schedules, events, and appointments',
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-blue-500 to-green-500',
      status: 'operational',
      features: ['Event creation', 'Scheduling', 'Reminders', 'Availability checking']
    },
    {
      name: 'Notion',
      category: 'productivity',
      description: 'Organize notes, docs, and knowledge bases',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-slate-700 to-slate-900',
      status: 'operational',
      features: ['Database management', 'Page creation', 'Content sync', 'Templates']
    },
    {
      name: 'Trello',
      category: 'productivity',
      description: 'Manage projects with boards, lists, and cards',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-blue-500 to-sky-500',
      status: 'operational',
      features: ['Board management', 'Card automation', 'Task tracking', 'Team collaboration']
    },
    {
      name: 'Asana',
      category: 'productivity',
      description: 'Track work and manage projects efficiently',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-orange-500 to-pink-500',
      status: 'operational',
      features: ['Task management', 'Project tracking', 'Team coordination', 'Reporting']
    },
    {
      name: 'Monday.com',
      category: 'productivity',
      description: 'Work management platform for teams',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-red-500 to-orange-500',
      status: 'operational',
      features: ['Workflow automation', 'Dashboard views', 'Time tracking', 'Integrations']
    },

    // Marketing
    {
      name: 'HubSpot',
      category: 'marketing',
      description: 'CRM and marketing automation platform',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      status: 'operational',
      features: ['Contact management', 'Email campaigns', 'Lead tracking', 'Analytics']
    },
    {
      name: 'Mailchimp',
      category: 'marketing',
      description: 'Email marketing and automation',
      icon: <Mail className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      status: 'operational',
      features: ['Email campaigns', 'Audience segmentation', 'A/B testing', 'Analytics']
    },
    {
      name: 'Google Analytics',
      category: 'marketing',
      description: 'Web analytics and reporting',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-orange-500 to-amber-500',
      status: 'operational',
      features: ['Traffic analysis', 'Conversion tracking', 'Custom reports', 'Real-time data']
    },
    {
      name: 'Facebook Ads',
      category: 'marketing',
      description: 'Create and manage Facebook advertising campaigns',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-500',
      status: 'operational',
      features: ['Campaign management', 'Ad creation', 'Audience targeting', 'Performance tracking']
    },
    {
      name: 'LinkedIn',
      category: 'marketing',
      description: 'Professional networking and content sharing',
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-600 to-blue-800',
      status: 'operational',
      features: ['Post scheduling', 'Lead generation', 'Company pages', 'Analytics']
    },

    // Finance
    {
      name: 'QuickBooks',
      category: 'finance',
      description: 'Accounting and financial management',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      status: 'operational',
      features: ['Expense tracking', 'Invoicing', 'Financial reports', 'Tax preparation']
    },
    {
      name: 'Stripe',
      category: 'finance',
      description: 'Payment processing and subscription management',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-purple-500 to-indigo-500',
      status: 'operational',
      features: ['Payment processing', 'Subscription billing', 'Invoice management', 'Analytics']
    },
    {
      name: 'PayPal',
      category: 'finance',
      description: 'Online payment processing',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-700',
      status: 'operational',
      features: ['Payment processing', 'Invoicing', 'Transaction tracking', 'Refunds']
    },
    {
      name: 'Xero',
      category: 'finance',
      description: 'Cloud accounting software',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-500',
      status: 'operational',
      features: ['Bookkeeping', 'Invoicing', 'Bank reconciliation', 'Financial reporting']
    },

    // Storage
    {
      name: 'Google Drive',
      category: 'storage',
      description: 'Cloud storage and file sharing',
      icon: <Folder className="w-6 h-6" />,
      color: 'from-blue-500 to-green-500',
      status: 'operational',
      features: ['File storage', 'Sharing', 'Collaboration', 'Version control']
    },
    {
      name: 'Dropbox',
      category: 'storage',
      description: 'File hosting and synchronization',
      icon: <Cloud className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      status: 'operational',
      features: ['File sync', 'Sharing', 'Team folders', 'File recovery']
    },
    {
      name: 'OneDrive',
      category: 'storage',
      description: 'Microsoft cloud storage service',
      icon: <Cloud className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-500',
      status: 'operational',
      features: ['File storage', 'Office integration', 'Sharing', 'Collaboration']
    },
    {
      name: 'Box',
      category: 'storage',
      description: 'Enterprise cloud content management',
      icon: <Folder className="w-6 h-6" />,
      color: 'from-blue-600 to-blue-800',
      status: 'operational',
      features: ['Secure storage', 'Collaboration', 'Workflow automation', 'Compliance']
    },

    // E-commerce
    {
      name: 'Shopify',
      category: 'ecommerce',
      description: 'E-commerce platform for online stores',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      status: 'operational',
      features: ['Store management', 'Inventory tracking', 'Order processing', 'Analytics']
    },
    {
      name: 'WooCommerce',
      category: 'ecommerce',
      description: 'WordPress e-commerce plugin',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      status: 'operational',
      features: ['Product management', 'Order tracking', 'Payment processing', 'Shipping']
    },
    {
      name: 'Amazon',
      category: 'ecommerce',
      description: 'Sell products on Amazon marketplace',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'from-orange-500 to-yellow-500',
      status: 'operational',
      features: ['Product listings', 'Inventory management', 'Order fulfillment', 'Analytics']
    },

    // Creative
    {
      name: 'Canva',
      category: 'creative',
      description: 'Design platform for graphics and visuals',
      icon: <Image className="w-6 h-6" />,
      color: 'from-cyan-500 to-purple-500',
      status: 'operational',
      features: ['Design creation', 'Template access', 'Brand kit', 'Export options']
    },
    {
      name: 'Adobe Creative Cloud',
      category: 'creative',
      description: 'Professional creative software suite',
      icon: <Image className="w-6 h-6" />,
      color: 'from-red-500 to-orange-500',
      status: 'operational',
      features: ['Photoshop', 'Illustrator', 'Premiere Pro', 'After Effects']
    },
    {
      name: 'Figma',
      category: 'creative',
      description: 'Collaborative design and prototyping tool',
      icon: <Image className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      status: 'operational',
      features: ['Design collaboration', 'Prototyping', 'Component libraries', 'Version control']
    }
  ]

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const stats = [
    { label: 'Total Integrations', value: '123', icon: <Globe className="w-6 h-6" /> },
    { label: 'Fully Operational', value: '123', icon: <Check className="w-6 h-6" /> },
    { label: 'More Coming', value: '∞', icon: <Zap className="w-6 h-6" /> },
    { label: 'Categories', value: '8', icon: <Briefcase className="w-6 h-6" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src={guildLogo} alt="Guild AI Logo" className="w-8 h-8 rounded-lg text-sky-600 dark:text-sky-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                Guild AI
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link to="/subscription">
                <Button className="bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
          <Globe className="w-3 h-3 mr-1" />
          123 Platform Integrations
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-sky-800 to-emerald-800 dark:from-slate-100 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Connect Your Entire Tech Stack
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
          Guild AI integrates with 123 platforms to create a seamless workflow across all your business tools. All integrations are fully implemented and working, with more coming soon. If an integration doesn't exist yet, simply screen record the action—Guild will learn and autonomously perform it on your computer.
        </p>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-600 to-emerald-600 flex items-center justify-center text-white mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Search and Filter */}
      <section className="container mx-auto px-4 py-12 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? 'bg-gradient-to-r from-sky-600 to-emerald-600' : ''}
              >
                {category.icon}
                <span className="ml-2">{category.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
                {category.status === 'live' && (
                  <Badge className="ml-2 bg-emerald-500 text-white text-xs">
                    Live
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${integration.color} flex items-center justify-center text-white`}>
                      {integration.icon}
                    </div>
                    <Badge 
                      className={integration.status === 'operational' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                      }
                    >
                      {integration.status === 'operational' ? 'Operational' : 'Expanding'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Key Features:
                    </p>
                    <ul className="space-y-1">
                      {integration.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600 dark:text-slate-400">
                No integrations found matching your search.
              </p>
            </div>
          )}

          <div className="mt-8 text-center text-slate-600 dark:text-slate-400">
            <p>
              Showing {filteredIntegrations.length} integrations
              {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
            </p>
            <p className="text-sm mt-2">
              Note: This is a sample of our 123 integrations. More integrations available in the platform.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Seamless Integration Setup
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Connect your tools in minutes with guided setup
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                Select Integration
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Choose from 123 available integrations in our marketplace
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                Authenticate
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Securely connect your account with OAuth or API keys
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                Start Automating
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                AI agents automatically use your connected tools
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Custom Integration */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <Code className="w-16 h-16 text-sky-600 dark:text-sky-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Need a Custom Integration?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Enterprise customers can request custom integrations with proprietary tools and internal systems. Our team will work with you to build exactly what you need.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-sky-600 to-emerald-600 border-0 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Connect Your Tools?
            </h2>
            <p className="text-xl mb-8 text-sky-50">
              Start integrating your business platforms with Guild AI today
            </p>
            <Link to="/subscription">
              <Button 
                size="lg" 
                className="bg-white text-sky-700 hover:bg-slate-100 text-lg px-8 py-6"
              >
                Start Free Trial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default IntegrationsPage

