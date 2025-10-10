import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Sparkles, ArrowLeft, Check, Zap, TrendingUp, 
  Building2, Users, DollarSign, Calculator
} from 'lucide-react'
import guildLogo from '../assets/guild-logo.png'

function PricingPage() {
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('monthly')

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingCycle === 'monthly' ? 49 : 470,
      originalPrice: billingCycle === 'monthly' ? null : 588,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Perfect for getting started',
      agents: '5 Agents',
      credits: '500 credits/month',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      features: [
        '5 AI Agents included',
        '500 monthly credits',
        'Judge Layer Quality Assurance',
        'Core integrations',
        'Email support',
        'Educational transparency',
        'Hire additional agents at $12/mo',
        'Basic analytics'
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      price: billingCycle === 'monthly' ? 99 : 950,
      originalPrice: billingCycle === 'monthly' ? null : 1188,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For growing businesses',
      agents: '10 Agents',
      credits: '1,000 credits/month',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-emerald-500 to-green-500',
      popular: true,
      features: [
        '10 AI Agents included',
        '1,000 monthly credits',
        'Judge Layer Quality Assurance',
        'All integrations (36 operational)',
        'Priority support',
        'Meta KPIs tracking',
        'Hire additional agents at $11/mo',
        'Advanced analytics',
        'Custom workflows'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: billingCycle === 'monthly' ? 199 : 1910,
      originalPrice: billingCycle === 'monthly' ? null : 2388,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'For serious automation',
      agents: '25 Agents',
      credits: '2,500 credits/month',
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      features: [
        '25 AI Agents included',
        '2,500 monthly credits',
        'Judge Layer Quality Assurance',
        'All integrations + priority access',
        'Premium support',
        'Advanced analytics',
        'Custom workflows',
        'Hire additional agents at $10/mo',
        'API access',
        'White-label options (add-on)',
        'Dedicated account manager'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 499 : 4790,
      originalPrice: billingCycle === 'monthly' ? null : 5988,
      period: billingCycle === 'monthly' ? '/month' : '/year',
      description: 'Unlimited AI workforce',
      agents: 'All 114 Agents',
      credits: '10,000 credits/month',
      icon: <Building2 className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      features: [
        'All 114 AI Agents included',
        '10,000 monthly credits',
        'Judge Layer Quality Assurance',
        'All integrations + custom connectors',
        'Dedicated support',
        'White-label options',
        'API access',
        'Hire additional agents at $8/mo',
        'Custom integrations',
        'SLA guarantee',
        'Priority feature requests',
        'Training & onboarding'
      ]
    }
  ]

  const addOns = [
    {
      name: 'Additional Agent (Daily)',
      price: '$2-4/day',
      description: 'Hire extra agents on demand for short-term projects'
    },
    {
      name: 'Additional Agent (Monthly)',
      price: '$8-12/month',
      description: 'Add permanent agents to your workforce (price varies by plan)'
    },
    {
      name: 'Extra Credits',
      price: '$0.10/credit',
      description: 'Purchase additional credits when you need more capacity'
    },
    {
      name: 'Custom Integration',
      price: 'Custom',
      description: 'Connect Guild AI to your proprietary tools and systems'
    },
    {
      name: 'White Label',
      price: '+$200/month',
      description: 'Rebrand Guild AI with your company logo and colors'
    },
    {
      name: 'Priority Support',
      price: '+$100/month',
      description: 'Get 24/7 support with <1 hour response time'
    }
  ]

  const faqs = [
    {
      question: 'What are credits?',
      answer: 'Credits are used to power AI agent operations. Different tasks consume different amounts of credits based on complexity. Simple tasks like email drafting use fewer credits, while complex research or generation tasks use more.'
    },
    {
      question: 'What happens if I run out of credits?',
      answer: 'Your agents will pause until the next billing cycle or you can purchase additional credits. We\'ll notify you when you reach 80% usage so you can plan accordingly.'
    },
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades apply at your next billing cycle.'
    },
    {
      question: 'Do unused credits roll over?',
      answer: 'Yes! Unused credits roll over to the next month, so you never lose what you\'ve paid for. Credits accumulate as long as your subscription is active.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 14-day free trial with 100 credits to test Guild AI. No credit card required.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and bank transfers through our secure payment processor, Paystack.'
    }
  ]

  const handleGetStarted = (planId) => {
    navigate(`/signup?plan=${planId}`)
  }

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
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
          <DollarSign className="w-3 h-3 mr-1" />
          Save 99% vs Hiring a Human Team
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-sky-800 to-emerald-800 dark:from-slate-100 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
          Choose the plan that fits your needs. No hidden fees, no surprises. Scale up or down anytime.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-lg ${billingCycle === 'monthly' ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded-full transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            <div className={`absolute top-1 left-1 w-6 h-6 bg-gradient-to-r from-sky-600 to-emerald-600 rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-8' : ''}`} />
          </button>
          <span className={`text-lg ${billingCycle === 'yearly' ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-200">
              Save 20%
            </Badge>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                plan.popular ? 'border-2 border-sky-500 shadow-xl' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-4`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                      ${plan.price}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 ml-1">
                      {plan.period}
                    </span>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-sm text-slate-500 line-through">
                      ${plan.originalPrice}/year
                    </div>
                  )}
                  <div className="flex gap-2 text-sm mt-2">
                    <span className="font-semibold text-sky-600 dark:text-sky-400">{plan.agents}</span>
                    <span className="text-slate-600 dark:text-slate-400">•</span>
                    <span className="text-slate-600 dark:text-slate-400">{plan.credits}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className={`w-full mb-6 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white' 
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleGetStarted(plan.id)}
                >
                  Get Started
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
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
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Add-ons & Extras
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Customize your plan with additional services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {addOns.map((addon, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{addon.name}</CardTitle>
                  <Badge variant="secondary">{addon.price}</Badge>
                </div>
                <CardDescription>{addon.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
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

      {/* FAQs */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
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
              Ready to Start Saving?
            </h2>
            <p className="text-xl mb-8 text-sky-50">
              Join thousands of solopreneurs automating their business with Guild AI
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

export default PricingPage

