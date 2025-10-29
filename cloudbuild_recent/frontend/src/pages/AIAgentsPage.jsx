import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import {
  Sparkles, ArrowLeft, Search, Users, TrendingUp, DollarSign,
  FileText, MessageSquare, BarChart3, Calendar, Mail, Phone,
  ShoppingCart, Briefcase, Code, Image, Video, Mic, Database,
  Globe, Shield, Zap, Target, Brain, Lightbulb, BookOpen
} from 'lucide-react'
import guildLogo from '../assets/guild-logo.png'

function AIAgentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Agents', count: 114, icon: <Sparkles className="w-4 h-4" /> },
    { id: 'marketing_sales', name: 'Marketing & Sales', count: 30, icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'content_creative', name: 'Content & Creative', count: 9, icon: <FileText className="w-4 h-4" /> },
    { id: 'customer_success', name: 'Customer Success', count: 13, icon: <Users className="w-4 h-4" /> },
    { id: 'finance_accounting', name: 'Finance & Accounting', count: 9, icon: <DollarSign className="w-4 h-4" /> },
    { id: 'operations_management', name: 'Operations & Management', count: 53, icon: <Briefcase className="w-4 h-4" /> }
  ]

  const agents = [
    // Marketing & Sales (30 Agents)
    { name: 'Ad Performance Optimizer', category: 'marketing_sales', description: 'Optimizes paid advertising campaigns for maximum return on investment.' },
    { name: 'Affiliate Partnerships', category: 'marketing_sales', description: 'Manages and grows affiliate marketing programs and relationships.' },
    { name: 'Brand Strategist', category: 'marketing_sales', description: 'Develops and maintains a consistent and compelling brand identity and strategy.' },
    { name: 'Business Intelligence', category: 'marketing_sales', description: 'Analyzes complex business data to provide actionable insights and strategic recommendations.' },
    { name: 'Competitive Intelligence', category: 'marketing_sales', description: 'Monitors competitors, market trends, and industry shifts to inform strategy.' },
    { name: 'Content Intelligence', category: 'marketing_sales', description: 'Analyzes content performance, identifies gaps, and recommends optimization strategies.' },
    { name: 'Content Repurposer', category: 'marketing_sales', description: 'Transforms existing content into new formats for broader reach and engagement.' },
    { name: 'Content Strategist', category: 'marketing_sales', description: 'Plans, develops, and manages content marketing strategies across various platforms.' },
    { name: 'Copywriter', category: 'marketing_sales', description: 'Crafts persuasive and engaging copy for marketing materials, ads, and websites.' },
    { name: 'CRM', category: 'marketing_sales', description: 'Manages customer relationship management data, ensuring accurate and up-to-date records.' },
    { name: 'CRM Automation', category: 'marketing_sales', description: 'Automates tasks and workflows within the CRM system to streamline customer interactions.' },
    { name: 'Customer Intelligence', category: 'marketing_sales', description: 'Analyzes customer data to understand behavior, preferences, and predict future trends.' },
    { name: 'Enhanced Campaign', category: 'marketing_sales', description: 'Provides advanced analytics and optimization for marketing campaigns.' },
    { name: 'Enhanced Marketing', category: 'marketing_sales', description: 'Applies AI-driven insights to elevate overall marketing effectiveness.' },
    { name: 'Event Marketing', category: 'marketing_sales', description: 'Plans, promotes, and manages marketing events, webinars, and conferences.' },
    { name: 'Growth Opportunity', category: 'marketing_sales', description: 'Identifies and evaluates new market opportunities and growth avenues.' },
    { name: 'ICP Evolution', category: 'marketing_sales', description: 'Tracks and analyzes the evolution of the Ideal Customer Profile for targeted marketing.' },
    { name: 'Influencer Outreach', category: 'marketing_sales', description: 'Identifies, engages, and manages relationships with relevant influencers.' },
    { name: 'Lead Personalization', category: 'marketing_sales', description: 'Tailors marketing messages and outreach to individual leads for higher conversion.' },
    { name: 'Market Trends', category: 'marketing_sales', description: 'Continuously monitors and reports on emerging market trends and shifts.' },
    { name: 'Marketing', category: 'marketing_sales', description: 'A versatile agent capable of handling a wide range of general marketing tasks.' },
    { name: 'Outbound Sales', category: 'marketing_sales', description: 'Executes outbound sales strategies, including prospecting and initial outreach.' },
    { name: 'Paid Ads', category: 'marketing_sales', description: 'Manages and optimizes paid advertising campaigns across various digital platforms.' },
    { name: 'Partnerships', category: 'marketing_sales', description: 'Identifies, negotiates, and manages strategic business partnerships.' },
    { name: 'PR Outreach', category: 'marketing_sales', description: 'Manages public relations efforts, including media outreach and press releases.' },
    { name: 'Pricing Intelligence', category: 'marketing_sales', description: 'Analyzes competitor pricing and market demand to optimize pricing strategies.' },
    { name: 'Sales Funnel', category: 'marketing_sales', description: 'Optimizes and manages the sales funnel to improve conversion rates.' },
    { name: 'SEO', category: 'marketing_sales', description: 'Implements and monitors search engine optimization strategies to improve organic rankings.' },
    { name: 'Trend Spotter', category: 'marketing_sales', description: 'Identifies and reports on emerging trends relevant to the business and market.' },
    { name: 'Upsell Cross Sell', category: 'marketing_sales', description: 'Identifies opportunities to upsell and cross-sell products or services to existing customers.' },

    // Content & Creative (9 Agents)
    { name: 'Blog Writer', category: 'content_creative', description: 'Generates high-quality, SEO-friendly blog posts and articles on various topics.' },
    { name: 'Content Strategist', category: 'content_creative', description: 'Develops comprehensive content strategies aligned with business goals and audience needs.' },
    { name: 'Copywriter', category: 'content_creative', description: 'Creates compelling and conversion-focused copy for all marketing and sales materials.' },
    { name: 'Image Generation', category: 'content_creative', description: 'Generates unique and relevant images based on textual descriptions and creative briefs.' },
    { name: 'Technical Writer', category: 'content_creative', description: 'Produces clear, concise, and accurate technical documentation, manuals, and guides.' },
    { name: 'Video Editor', category: 'content_creative', description: 'Edits and refines video content, adding effects, transitions, and audio enhancements.' },
    { name: 'Visual', category: 'content_creative', description: 'A versatile agent focused on creating various visual assets for branding and marketing.' },
    { name: 'Voice', category: 'content_creative', description: 'Generates natural-sounding voiceovers and audio content for various applications.' },
    { name: 'Voice Persona', category: 'content_creative', description: 'Develops and maintains distinct voice personas for consistent audio branding and communication.' },

    // Customer Success (13 Agents)
    { name: 'Accountability Coach', category: 'customer_success', description: 'Provides guidance and support to users, helping them stay on track with their goals.' },
    { name: 'Celebration Narrator', category: 'customer_success', description: 'Automates the recognition and celebration of customer milestones and achievements.' },
    { name: 'Churn Predictor', category: 'customer_success', description: 'Analyzes customer data to predict potential churn and identifies at-risk accounts.' },
    { name: 'Community Connector', category: 'customer_success', description: 'Facilitates connections between users and relevant resources within the community.' },
    { name: 'Community Manager', category: 'customer_success', description: 'Manages and fosters engagement within online communities and forums.' },
    { name: 'Customer Success', category: 'customer_success', description: 'Ensures customer satisfaction and helps users achieve maximum value from the platform.' },
    { name: 'Customer Support', category: 'customer_success', description: 'Provides timely and effective support to resolve customer inquiries and issues.' },
    { name: 'Feedback Collector', category: 'customer_success', description: 'Gathers and analyzes customer feedback to drive product improvements and service enhancements.' },
    { name: 'Motivation Coach', category: 'customer_success', description: 'Offers motivational support and encouragement to users to boost productivity and engagement.' },
    { name: 'Onboarding', category: 'customer_success', description: 'Guides new users through the onboarding process, ensuring a smooth and successful start.' },
    { name: 'Well Being', category: 'customer_success', description: 'Promotes user well-being by providing resources and insights for a healthy work-life balance.' },
    { name: 'Wellbeing', category: 'customer_success', description: 'A general agent focused on enhancing the overall well-being of users within the platform.' },
    { name: 'Wellbeing Workload', category: 'customer_success', description: 'Monitors and helps manage user workload to prevent burnout and promote sustainable productivity.' },

    // Finance & Accounting (9 Agents)
    { name: 'Accounting', category: 'finance_accounting', description: 'Manages accounting tasks, including ledger entries, reconciliations, and financial reporting.' },
    { name: 'Bookkeeping', category: 'finance_accounting', description: 'Handles daily bookkeeping tasks, ensuring accurate and organized financial records.' },
    { name: 'Expense Optimizer', category: 'finance_accounting', description: 'Analyzes expenses to identify cost-saving opportunities and optimize spending.' },
    { name: 'Financial Intelligence', category: 'finance_accounting', description: 'Provides advanced financial analysis, forecasting, and strategic insights.' },
    { name: 'Grant Funding', category: 'finance_accounting', description: 'Identifies potential grant opportunities and assists with the application process.' },
    { name: 'Investor Relations', category: 'finance_accounting', description: 'Manages communications and relationships with investors and stakeholders.' },
    { name: 'Investor Update', category: 'finance_accounting', description: 'Prepares and delivers regular updates and reports to investors.' },
    { name: 'Pricing', category: 'finance_accounting', description: 'Analyzes market data and business costs to optimize product and service pricing.' },
    { name: 'Tax Advisor', category: 'finance_accounting', description: 'Provides expert advice and assistance on tax planning and compliance.' },

    // Operations & Management (53 Agents)
    { name: 'Agent Evaluator', category: 'operations_management', description: 'Evaluates the performance and effectiveness of other AI agents within the system.' },
    { name: 'Automation', category: 'operations_management', description: 'Designs and implements automation workflows to streamline business processes.' },
    { name: 'Automation Bridge', category: 'operations_management', description: 'Connects disparate automation tools and platforms to create seamless workflows.' },
    { name: 'Board Advisor', category: 'operations_management', description: 'Provides strategic advice and insights to the board of directors.' },
    { name: 'Business Strategist', category: 'operations_management', description: 'Develops and implements overarching business strategies to achieve organizational goals.' },
    { name: 'Calendar Harmony', category: 'operations_management', description: 'Manages and optimizes schedules and calendars to ensure efficient time management.' },
    { name: 'Chief Of Staff', category: 'operations_management', description: 'Supports executive leadership by managing projects, communications, and strategic initiatives.' },
    { name: 'Compliance', category: 'operations_management', description: 'Ensures adherence to regulatory requirements and internal policies.' },
    { name: 'Connector', category: 'operations_management', description: 'Facilitates connections and data exchange between various systems and applications.' },
    { name: 'Contract Analyzer', category: 'operations_management', description: 'Analyzes legal contracts and documents for key terms, risks, and compliance.' },
    { name: 'Data Hygiene', category: 'operations_management', description: 'Cleans, validates, and maintains the quality and integrity of data sets.' },
    { name: 'Design QA', category: 'operations_management', description: 'Performs quality assurance checks on design assets and user interfaces.' },
    { name: 'Desktop Automation', category: 'operations_management', description: 'Automates repetitive tasks and workflows directly on the user\'s desktop environment.' },
    { name: 'Enhanced Prompts', category: 'operations_management', description: 'Optimizes and refines AI prompts for better performance and output quality.' },
    { name: 'Hiring HR', category: 'operations_management', description: 'Manages the hiring process, from candidate sourcing to onboarding.' },
    { name: 'HR', category: 'operations_management', description: 'Handles various human resources tasks, including employee management and policy enforcement.' },
    { name: 'Judge', category: 'operations_management', description: 'Provides a critical evaluation layer for AI outputs, ensuring quality and accuracy.' },
    { name: 'Knowledge Management', category: 'operations_management', description: 'Organizes, stores, and retrieves organizational knowledge and information.' },
    { name: 'Knowledge Updater', category: 'operations_management', description: 'Keeps knowledge bases, documentation, and information repositories up-to-date.' },
    { name: 'Learning', category: 'operations_management', description: 'Manages and facilitates learning and development programs for employees.' },
    { name: 'Localization', category: 'operations_management', description: 'Manages the adaptation of content and products for different languages and cultures.' },
    { name: 'Meeting Notes', category: 'operations_management', description: 'Automatically transcribes and summarizes meeting discussions and action items.' },
    { name: 'Multi Channel Inbox', category: 'operations_management', description: 'Consolidates and manages communications from various channels into a single inbox.' },
    { name: 'OKR Goal Tracking', category: 'operations_management', description: 'Tracks and manages Objectives and Key Results (OKRs) to ensure goal alignment.' },
    { name: 'Orchestration Tuner', category: 'operations_management', description: 'Optimizes the coordination and workflow of multiple AI agents for complex tasks.' },
    { name: 'Orchestrator', category: 'operations_management', description: 'Coordinates and manages the execution of tasks across multiple AI agents.' },
    { name: 'Outsourcing', category: 'operations_management', description: 'Manages outsourcing processes and relationships with external vendors.' },
    { name: 'Product Manager', category: 'operations_management', description: 'Oversees the entire product lifecycle, from conception to launch and iteration.' },
    { name: 'Project Manager', category: 'operations_management', description: 'Plans, executes, and closes projects, ensuring timely and successful completion.' },
    { name: 'Proposal Writer', category: 'operations_management', description: 'Generates professional and compelling proposals for business opportunities.' },
    { name: 'Research', category: 'operations_management', description: 'Conducts in-depth research on various topics, compiling and synthesizing information.' },
    { name: 'Research Scraper', category: 'operations_management', description: 'Extracts and collects data from websites and online sources for research purposes.' },
    { name: 'Risk Management', category: 'operations_management', description: 'Identifies, assesses, and mitigates potential risks to the business.' },
    { name: 'Scalability', category: 'operations_management', description: 'Ensures that systems and processes can handle increased workloads and growth.' },
    { name: 'Scenario Planner', category: 'operations_management', description: 'Develops and analyzes various business scenarios to aid strategic decision-making.' },
    { name: 'Scraper', category: 'operations_management', description: 'Extracts data from web pages and other digital sources.' },
    { name: 'Security', category: 'operations_management', description: 'Manages and enhances the security posture of systems and data.' },
    { name: 'Skill Development', category: 'operations_management', description: 'Facilitates the development of new skills and competencies within the team.' },
    { name: 'SOP', category: 'operations_management', description: 'Creates and manages Standard Operating Procedures for consistent task execution.' },
    { name: 'Storage', category: 'operations_management', description: 'Manages data storage solutions and ensures data accessibility and integrity.' },
    { name: 'Strategic Sounding Board', category: 'operations_management', description: 'Provides a platform for brainstorming and refining strategic ideas.' },
    { name: 'Strategy', category: 'operations_management', description: 'A general agent focused on developing and executing business strategies.' },
    { name: 'Supplier Research', category: 'operations_management', description: 'Conducts research to identify and evaluate potential suppliers and vendors.' },
    { name: 'Telephony Voice', category: 'operations_management', description: 'Manages and automates telephony and voice communication systems.' },
    { name: 'Training', category: 'operations_management', description: 'Develops and delivers training programs for various business functions.' },
    { name: 'Unified Automation', category: 'operations_management', description: 'Integrates and manages automation across all business functions for a unified approach.' },
    { name: 'UX UI Tester', category: 'operations_management', description: 'Tests user experience and user interface designs for usability and effectiveness.' },
    { name: 'Vendor Management', category: 'operations_management', description: 'Manages relationships and contracts with external vendors and service providers.' },
    { name: 'Vision Enhanced Training', category: 'operations_management', description: 'Provides training programs enhanced with visual learning and recognition capabilities.' },
    { name: 'Wellness', category: 'operations_management', description: 'Promotes and supports employee wellness initiatives and programs.' },
    { name: 'Facebook Scheduler Adapter', category: 'operations_management', description: 'Adapts scheduling for Facebook platforms.' },
    { name: 'Instagram Scheduler Adapter', category: 'operations_management', description: 'Adapts scheduling for Instagram platforms.' },
    { name: 'Linkedin Scheduler Adapter', category: 'operations_management', description: 'Adapts scheduling for LinkedIn platforms.' },
    { name: 'Tiktok Scheduler Adapter', category: 'operations_management', description: 'Adapts scheduling for TikTok platforms.' },
    { name: 'Twitter Scheduler Adapter', category: 'operations_management', description: 'Adapts scheduling for Twitter platforms.' },

    // The following agents are listed in all_agents_list.txt but were not explicitly categorized above. Adding them to operations_management for now.
    { name: 'Enhanced Prompts', category: 'operations_management', description: 'Optimizes and refines AI prompts for better performance and output quality.' },
    { name: 'Well Being', category: 'customer_success', description: 'Promotes user well-being by providing resources and insights for a healthy work-life balance.' },
    { name: 'Wellbeing', category: 'customer_success', description: 'A general agent focused on enhancing the overall well-being of users within the platform.' },
    { name: 'Wellbeing Workload', category: 'customer_success', description: 'Monitors and helps manage user workload to prevent burnout and promote sustainable productivity.' },
  ]

  const specialAgents = [
    {
      name: 'Judge Agent',
      description: 'Quality assurance layer that validates all outputs before delivery',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-emerald-500 to-green-500',
      unique: true
    },
    {
      name: 'Meta KPI Tracker',
      description: 'Monitors 7 performance metrics across all AI agents',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      unique: true
    },
    {
      name: 'Educational Explainer',
      description: 'Provides reasoning and business strategy insights for every action',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      unique: true
    }
  ]

  const filteredAgents = agents.filter(agent => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
          <Users className="w-3 h-3 mr-1" />
          114 Specialized Agents
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-sky-800 to-emerald-800 dark:from-slate-100 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Your Complete AI Workforce
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
          114 specialized AI agents ready to handle every aspect of your business. From marketing to finance, operations to creative work.
        </p>
      </section>

      {/* Special Agents */}
      <section className="container mx-auto px-4 pb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Unique Quality & Intelligence Agents
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            No other platform has these
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {specialAgents.map((agent, index) => (
            <Card key={index} className="border-2 border-sky-500 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center text-white mb-4`}>
                  {agent.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-xl">{agent.name}</CardTitle>
                  <Badge className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white text-xs">
                    Unique
                  </Badge>
                </div>
                <CardDescription className="text-base">
                  {agent.description}
                </CardDescription>
              </CardHeader>
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
                placeholder="Search agents by name or capability..."
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
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {agent.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600 dark:text-slate-400">
                No agents found matching your search.
              </p>
            </div>
          )}

          <div className="mt-8 text-center text-slate-600 dark:text-slate-400">
            <p>
              Showing {filteredAgents.length} of {agents.length} agents
              {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            How Agents Work Together
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Agents collaborate seamlessly to complete complex business tasks
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                    You Define the Goal
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Tell Guild AI what you want to accomplish in plain English. No technical knowledge required.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                    AI Plans the Workflow
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    The system identifies which agents are needed and creates an optimal workflow to achieve your goal.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                    Agents Execute & Collaborate
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Agents work together, passing information and building on each other's work to complete the task.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                    Quality Validation
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    The Judge Agent reviews all outputs for quality, accuracy, and brand consistency before delivery.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  5
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                    You Receive Results
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Get high-quality outputs with explanations of the strategy and reasoning behind every decision.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-sky-600 to-emerald-600 border-0 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Build Your AI Team?
            </h2>
            <p className="text-xl mb-8 text-sky-50">
              Get access to all 114 specialized agents and start automating your business today
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

export default AIAgentsPage

