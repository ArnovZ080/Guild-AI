import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Check, ArrowRight, Sparkles, Shield, TrendingUp, Users, Zap, Brain, Target, Award, AlertTriangle, Calculator } from 'lucide-react'
import guildLogo from '../assets/guild-logo.png'

function LandingPage() {
  const navigate = useNavigate();
  const { firebaseConfigured } = useAuth();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/forever',
      description: 'Try Guild AI risk-free',
      agents: 'Standard Agents',
      credits: '100 credits/month',
      features: [
        'All standard agents included',
        '100 monthly credits',
        'Judge Layer Quality Assurance',
        'Core integrations',
        'Community support',
        'Hire additional agents at $15/mo'
      ],
      popular: false,
      isFree: true
    },
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Perfect for getting started',
      agents: '5 Agents',
      credits: '500 credits/month',
      features: [
        '5 AI Agents included',
        '500 monthly credits',
        'Judge Layer Quality Assurance',
        'Core integrations',
        'Email support',
        'Hire additional agents at $12/mo'
      ],
      popular: false
    },
    {
      name: 'Growth',
      price: '$99',
      period: '/month',
      description: 'For growing businesses',
      agents: '10 Agents',
      credits: '1,000 credits/month',
      features: [
        '10 AI Agents included',
        '1,000 monthly credits',
        'Judge Layer Quality Assurance',
        'All integrations (36 operational)',
        'Priority support',
        'Meta KPIs tracking',
        'Hire additional agents at $11/mo'
      ],
      popular: true
    },
    {
      name: 'Professional',
      price: '$199',
      period: '/month',
      description: 'For serious automation',
      agents: '25 Agents',
      credits: '2,500 credits/month',
      features: [
        '25 AI Agents included',
        '2,500 monthly credits',
        'Judge Layer Quality Assurance',
        'All integrations + priority access',
        'Premium support',
        'Advanced analytics',
        'Custom workflows',
        'Hire additional agents at $10/mo'
      ],
      popular: false
    },
    {
      name: 'Enterprise',
      price: '$499',
      period: '/month',
      description: 'Unlimited AI workforce',
      agents: 'All 114 Agents',
      credits: '10,000 credits/month',
      features: [
        'All 114 AI Agents included',
        '10,000 monthly credits',
        'Judge Layer Quality Assurance',
        'All integrations + custom connectors',
        'Dedicated support',
        'White-label options',
        'API access',
      ],
      popular: false
    }
  ]

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Judge Layer Quality Assurance',
      description: 'Every output is automatically validated before you see it. No other AI platform has built-in QA.',
      color: 'from-blue-500 to-cyan-500',
      benefit: 'Zero manual quality checks needed - save 10+ hours/week'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Cross-Agent Meta KPIs',
      description: '7 KPIs that measure Guild\'s own performance. Track accuracy, coverage, efficiency, and ROI.',
      color: 'from-green-500 to-emerald-500',
      benefit: 'See exactly how your AI performs—no other platform monitors itself'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Local AI Generation',
      description: 'Unlimited AI images, videos, and voice at zero per-use cost. Save $5K-15K/year on API fees.',
      color: 'from-amber-500 to-orange-500',
      benefit: 'Create unlimited content for $0 - competitors charge per image'
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Educational Transparency',
      description: 'Every action includes reasoning that teaches business strategy. Learn while AI works.',
      color: 'from-purple-500 to-pink-500',
      benefit: 'Become a better business owner—not just a user'
    }
  ]

  const stats = [
    { number: '114', label: 'Specialized AI Agents', icon: <Users className="w-5 h-5" /> },
    { number: '123', label: 'Platform Integrations', icon: <Target className="w-5 h-5" /> },
    { number: '99%', label: 'Cost Savings vs Human Team', icon: <Award className="w-5 h-5" /> },
    { number: '40+', label: 'Business KPIs Tracked', icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const handleSignup = (planName) => {
    navigate(`/signup?plan=${planName.toLowerCase()}`)
  }

  const handleLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Configuration Warning (only shown if Firebase not configured) */}
      {!firebaseConfigured && (
        <Alert className="m-4 border-amber-500 bg-amber-50 dark:bg-amber-950">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Demo Mode:</strong> Firebase authentication is not configured. To enable full functionality, 
            add Firebase environment variables in Netlify. See FIREBASE_SETUP_GUIDE.md for details.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={guildLogo}
                alt="Guild AI Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                Guild AI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLogin}>
                Login
              </Button>
              <Button 
                className="bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white"
                onClick={() => handleSignup('Growth')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 border-sky-200 dark:border-sky-800">
          <Sparkles className="w-3 h-3 mr-1" />
          114 Specialized AI Agents • 123 Platform Integrations
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-sky-800 to-emerald-800 dark:from-slate-100 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Replace Your Entire Office<br />With AI That Actually Works
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-4 max-w-3xl mx-auto">
          Say "Increase my revenue by 50%" and watch 114 AI agents create the strategy, launch campaigns, 
          and execute everything autonomously while validating their own quality.
        </p>
        <p className="text-lg text-sky-600 dark:text-sky-400 mb-8 max-w-2xl mx-auto font-semibold">
          The only AI platform with built-in quality assurance that no competitor can match.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-lg px-8 py-6"
            onClick={() => handleSignup('Free')}
          >
            Start Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
          {stats.map((stat, index) => (
            <div key={index} className="p-6 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-2 text-sky-600 dark:text-sky-400">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="mt-12 p-6 bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-950 dark:to-sky-950 rounded-lg max-w-3xl mx-auto">
          <p className="text-slate-700 dark:text-slate-300 text-lg italic mb-2">
            "Other AI tools just execute tasks. Guild AI is the first platform that validates its own quality 
            before showing you results, like having a QA team built into every agent."
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            — Fortune 500-level capabilities at startup pricing
          </p>
        </div>
      </section>

      {/* Unique Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
            🏆 No Competitor Has These
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            4 Features That Make Guild Unstoppable
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            While other AI platforms hope for quality, Guild guarantees it. Here's why we're years ahead.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
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
                {feature.benefit && (
                  <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-950 rounded-lg">
                    <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                      💰 {feature.benefit}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison callout */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-slate-900 to-sky-900 dark:from-slate-800 dark:to-sky-800 text-white p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4 text-center">The Difference Is Clear</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-slate-300">❌ Other AI Platforms:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Execute tasks, hope for quality</li>
                  <li>• Manual review required</li>
                  <li>• Black box decision-making</li>
                  <li>• Pay per API call</li>
                  <li>• 5-20 generic agents</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-emerald-300">✅ Guild AI:</h4>
                <ul className="space-y-2 text-sm text-emerald-100">
                  <li>• Quality validated before you see it</li>
                  <li>• Built-in QA on every output</li>
                  <li>• Full transparency + learning</li>
                  <li>• Unlimited local AI generation</li>
                  <li>• 114 specialized agents</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-950">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800">
            ⚡ See Guild In Action
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            True Autonomy In 3 Simple Steps
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Watch how Guild transforms a simple request into complete business execution
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
                <CardTitle>You Type Your Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  "Increase my revenue by 50% in 3 months"
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Just natural conversation. No complex setup.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-emerald-500">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
                <CardTitle>AI Creates & Validates Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  114 agents analyze your business, create strategy, validate quality
                </p>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  This is where Guild is unique
                </Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
                <CardTitle>Agents Execute Everything</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Campaigns launched, content created, customers contacted - all autonomous
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  You review results, not tasks.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Real example */}
          <Card className="bg-gradient-to-br from-slate-900 to-sky-900 dark:from-slate-800 dark:to-sky-800 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">What Actually Happens Behind The Scenes:</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-sky-300">🤖 Agents Working:</h4>
                  <ul className="space-y-2 text-sm text-slate-200">
                    <li>✓ Financial Intelligence → Analyzes your Stripe revenue</li>
                    <li>✓ Growth Opportunity → Finds 12 opportunities</li>
                    <li>✓ Strategy Agent → Creates growth plan</li>
                    <li>✓ Campaign Agent → Launches Google & Meta ads</li>
                    <li>✓ Content Intelligence → Creates supporting content</li>
                    <li>✓ Judge Agent → Validates everything (94% score)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-emerald-300">📊 Results:</h4>
                  <ul className="space-y-2 text-sm text-slate-200">
                    <li>✓ Complete strategy in 30 minutes</li>
                    <li>✓ Campaigns live across 3 platforms</li>
                    <li>✓ Weekly progress monitoring</li>
                    <li>✓ Automatic optimization</li>
                    <li>✓ Full transparency log</li>
                    <li>✓ Quality guaranteed before you see it</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white/10 rounded-lg text-center">
                <p className="text-sm font-semibold text-sky-200">
                  ⏱️ Time you spent: 2 minutes typing • Time saved: 40+ hours of work
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 border-sky-200 dark:border-sky-800">
            🎉 Launch Special: 21-Day Free Trial • No Credit Card Required
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Fortune 500 Capabilities.<br />Startup Pricing.
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4">
            Replace a Marketing Director ($120K), Sales Rep ($70K), Content Manager ($80K), 
            Financial Analyst ($90K), and more → for less than a coffee budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <p className="text-lg text-emerald-600 dark:text-emerald-400 font-semibold">
              👉 Start with Free Forever plan, or try any paid tier
            </p>
            <Badge className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-1">
              21 days free on all paid plans
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-sky-500 border-2 shadow-xl scale-105' : plan.isFree ? 'border-emerald-500 border-2' : 'border-slate-200 dark:border-slate-800'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white">
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.isFree && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                    Start Free
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{plan.price}</span>
                  <span className="text-slate-600 dark:text-slate-400">{plan.period}</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-sm font-semibold text-sky-600 dark:text-sky-400">{plan.agents}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{plan.credits}</div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className={`w-full mb-6 ${plan.popular ? 'bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white' : plan.isFree ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white' : ''}`}
                  variant={plan.popular || plan.isFree ? 'default' : 'outline'}
                  onClick={() => handleSignup(plan.name)}
                >
                  {plan.isFree ? 'Start Free Now' : 'Get Started'}
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start text-sm">
                      <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            All plans include: Judge Layer QA • Educational Transparency • Local AI Generation • 24/7 Operation
          </p>
          <div className="inline-block p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              💰 Human Team Equivalent: $750,000/year → Guild AI Free: $0 • Growth: $1,188/year = 99.8% savings
            </p>
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            The Math is Simple
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            See how much you save compared to hiring a human team
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
                  <Calculator className="w-6 h-6 mr-2 text-red-600" />
                  Traditional Team
                </h3>
                <div className="space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Content Writer:</span>
                    <span className="font-semibold">$4,000/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Social Media Manager:</span>
                    <span className="font-semibold">$3,500/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Analyst:</span>
                    <span className="font-semibold">$5,000/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Virtual Assistant:</span>
                    <span className="font-semibold">$2,000/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Researcher:</span>
                    <span className="font-semibold">$3,500/mo</span>
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-2 mt-4 flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-red-600">$18,000/mo</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-emerald-600" />
                  Guild AI
                </h3>
                <div className="space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>10 AI Agents (Growth):</span>
                    <span className="font-semibold">$99/mo</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-500">
                    <span>Works 24/7:</span>
                    <span>✓</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-500">
                    <span>Never takes breaks:</span>
                    <span>✓</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-500">
                    <span>Quality guaranteed:</span>
                    <span>✓</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-500">
                    <span>Instant scaling:</span>
                    <span>✓</span>
                  </div>
                  <div className="border-t border-slate-300 dark:border-slate-700 pt-2 mt-4 flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-emerald-600">$99/mo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                Save $17,901/month (99.4%)
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                That's $214,812 saved per year with Guild AI
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-sky-600 to-emerald-600 border-0 text-white">
          <CardContent className="p-12 text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              🚀 Join The Future of Business
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Stop Managing Tasks.<br />Start Managing Results.
            </h2>
            <p className="text-xl mb-2 text-sky-50">
              Your AI workforce is ready. 114 agents. Built-in quality control. Unlimited potential.
            </p>
            <p className="text-lg mb-8 text-sky-100">
              The only AI platform that guarantees quality before you see it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-sky-700 hover:bg-slate-100 text-lg px-8 py-6"
                onClick={() => handleSignup('Free')}
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <p className="mt-6 text-sm text-sky-100">
              ✓ No credit card required • ✓ Full access to all 114 agents • ✓ Cancel anytime
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={guildLogo}
                  alt="Guild AI Logo" 
                  className="w-8 h-8 rounded-lg"
                />
                <span className="text-xl font-bold text-white">Guild AI</span>
              </div>
              <p className="text-sm text-slate-400">
                Your autonomous AI workforce. 114 specialized agents working 24/7 to grow your business.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="hover:text-sky-400 transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-sky-400 transition-colors">Pricing</Link></li>
                <li><Link to="/ai-agents" className="hover:text-sky-400 transition-colors">AI Agents</Link></li>
                <li><Link to="/integrations" className="hover:text-sky-400 transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
                <li><Link to="/affiliates" className="hover:text-sky-400 transition-colors">Affiliates</Link></li>
                <li><Link to="/contact" className="hover:text-sky-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy-policy" className="hover:text-sky-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-and-conditions" className="hover:text-sky-400 transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/refund-policy" className="hover:text-sky-400 transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 Guild AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

