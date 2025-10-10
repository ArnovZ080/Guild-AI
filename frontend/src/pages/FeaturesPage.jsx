import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Sparkles, ArrowLeft, Shield, TrendingUp, Zap, Brain, 
  Target, Users, Workflow, BarChart3, FileCheck, Clock,
  Database, Globe, Lock, Cpu, MessageSquare, CheckCircle2
} from 'lucide-react'
import guildLogo from '../assets/guild-logo.png'

function FeaturesPage() {
  const coreFeatures = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Judge Layer Quality Assurance',
      description: 'Every output is automatically validated before you see it. Our Judge Layer uses fact-checking, brand consistency checks, and rubric-based evaluation to ensure quality.',
      benefits: ['Zero bad outputs', 'Automatic fact verification', 'Brand consistency enforcement', 'Quality scoring'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Cross-Agent Meta KPIs',
      description: '7 KPIs that measure Guild\'s own performance. Track accuracy, coverage, efficiency, and ROI across all your AI agents in real-time.',
      benefits: ['Accuracy tracking', 'Coverage metrics', 'Efficiency monitoring', 'ROI calculation'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Educational Transparency',
      description: 'Every action includes reasoning that teaches business strategy. Learn while AI works, understanding the "why" behind every decision.',
      benefits: ['Strategic insights', 'Decision explanations', 'Business education', 'Continuous learning'],
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const platformFeatures = [
    {
      icon: <Workflow className="w-6 h-6" />,
      title: 'Visual Workflow Builder',
      description: 'Drag-and-drop interface to create complex business processes without coding.',
      color: 'text-sky-600'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '114 Specialized Agents',
      description: 'From content creation to financial analysis, we have an agent for every business function.',
      color: 'text-emerald-600'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Advanced Analytics',
      description: 'Track 40+ business KPIs and get actionable insights from your AI workforce.',
      color: 'text-purple-600'
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: 'Outcome Contracts',
      description: 'Define objectives and deliverables upfront. AI agents work towards specific, measurable outcomes.',
      color: 'text-blue-600'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '24/7 Operation',
      description: 'Your AI workforce never sleeps. Tasks continue running around the clock.',
      color: 'text-orange-600'
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Multi-Source RAG',
      description: 'Connect to Google Drive, Notion, local files, and more for comprehensive knowledge access.',
      color: 'text-cyan-600'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: '123 Integrations',
      description: 'Connect with all your favorite tools and platforms seamlessly.',
      color: 'text-green-600'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, SOC 2 compliance, and data isolation for your peace of mind.',
      color: 'text-red-600'
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'Visual Automation',
      description: 'AI agents can see and interact with any application on your screen like a human assistant.',
      color: 'text-indigo-600'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Natural Language Interface',
      description: 'Communicate with your AI workforce in plain English. No technical knowledge required.',
      color: 'text-pink-600'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Pre-flight Planning',
      description: 'AI reviews your goals and suggests optimal agent assignments before execution.',
      color: 'text-yellow-600'
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: 'Quality Controller',
      description: 'Automated quality checks ensure all outputs meet your standards before delivery.',
      color: 'text-teal-600'
    }
  ]

  const useCases = [
    {
      title: 'Content Creation',
      description: 'Generate blog posts, social media content, ad copy, and more with consistent brand voice.',
      agents: ['Content Strategist', 'Writer', 'Social Media Manager', 'Brand Checker']
    },
    {
      title: 'Lead Generation',
      description: 'Scrape, enrich, and personalize outreach to potential customers automatically.',
      agents: ['Advanced Scraper', 'Lead Personalization', 'Data Enrichment', 'Sales Agent']
    },
    {
      title: 'Financial Management',
      description: 'Automate bookkeeping, generate reports, and get financial health insights.',
      agents: ['Accounting', 'Bookkeeping', 'Analytics', 'Investor Relations']
    },
    {
      title: 'Research & Analysis',
      description: 'Conduct market research, competitive analysis, and synthesize findings.',
      agents: ['Research', 'Data Analyst', 'Fact Checker', 'Report Generator']
    },
    {
      title: 'Customer Support',
      description: 'Handle customer inquiries, create knowledge bases, and maintain documentation.',
      agents: ['Support Agent', 'Document Processor', 'Knowledge Manager', 'QA Specialist']
    },
    {
      title: 'Marketing Automation',
      description: 'Plan campaigns, create assets, schedule posts, and track performance.',
      agents: ['Marketing Strategist', 'Ad Copy', 'Image Generation', 'Analytics']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src={guildLogo} alt="Guild AI Logo" className="w-8 h-8 rounded-lg" />
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
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 border-sky-200 dark:border-sky-800">
          <Sparkles className="w-3 h-3 mr-1" />
          No Competitor Has These
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-sky-800 to-emerald-800 dark:from-slate-100 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Features That Set Us Apart
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
          Guild AI offers capabilities that no other AI platform can match. Built for solopreneurs who demand quality, transparency, and results.
        </p>
      </section>

      {/* Core Unique Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            4 Unique Features
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            These features are exclusive to Guild AI and provide unmatched value
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
          {coreFeatures.map((feature, index) => (
            <Card key={index} className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {feature.description}
                </CardDescription>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, bIndex) => (
                    <div key={bIndex} className="flex items-center text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                      <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Platform Features */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Comprehensive Platform
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to run your business with AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {platformFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`${feature.color} mb-3`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Common Use Cases
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            See how Guild AI can transform your business operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {useCases.map((useCase, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{useCase.title}</CardTitle>
                <CardDescription>{useCase.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Key Agents:</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.agents.map((agent, aIndex) => (
                      <Badge key={aIndex} variant="secondary" className="text-xs">
                        {agent}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-sky-600 to-emerald-600 border-0 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl mb-8 text-sky-50">
              Start your free trial and see the difference Guild AI makes
            </p>
            <Link to="/signup">
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

export default FeaturesPage

