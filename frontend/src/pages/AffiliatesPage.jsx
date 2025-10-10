import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Sparkles, ArrowLeft, DollarSign, TrendingUp, Users,
  Gift, Target, BarChart3, Zap, CheckCircle2, Award,
  Rocket, Globe, MessageSquare
} from 'lucide-react'
import guildLogo from '../assets/guild-logo.png'

function AffiliatesPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    audience: '',
    experience: '',
    message: ''
  })

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: '30% Recurring Commission',
      description: 'Earn 30% of every payment from customers you refer, for as long as they remain subscribed.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'High Conversion Rates',
      description: 'Our unique features and competitive pricing lead to industry-leading conversion rates.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Premium Product',
      description: 'Promote a product that actually delivers value with 114 agents and built-in quality assurance.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Dedicated Support',
      description: 'Get priority support, marketing materials, and a dedicated affiliate manager.',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const commissionTiers = [
    {
      plan: 'Starter',
      price: '$49/month',
      commission: '$14.70/month',
      annual: '$176.40/year'
    },
    {
      plan: 'Growth',
      price: '$99/month',
      commission: '$29.70/month',
      annual: '$356.40/year',
      popular: true
    },
    {
      plan: 'Professional',
      price: '$199/month',
      commission: '$59.70/month',
      annual: '$716.40/year'
    },
    {
      plan: 'Enterprise',
      price: '$499/month',
      commission: '$149.70/month',
      annual: '$1,796.40/year'
    }
  ]

  const resources = [
    {
      icon: <Gift className="w-5 h-5" />,
      title: 'Marketing Assets',
      items: ['Banner ads', 'Social media graphics', 'Email templates', 'Landing page copy']
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Real-Time Dashboard',
      items: ['Track clicks', 'Monitor conversions', 'View earnings', 'Export reports']
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Affiliate Community',
      items: ['Private Discord', 'Monthly webinars', 'Best practices', 'Networking']
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: 'Bonus Incentives',
      items: ['Performance bonuses', 'Contest prizes', 'Early access', 'Exclusive perks']
    }
  ]

  const faqs = [
    {
      question: 'How does the commission structure work?',
      answer: 'You earn 30% of every payment from customers you refer. This is a recurring commission, meaning you continue earning as long as the customer remains subscribed. For example, if you refer a customer to the Growth plan ($99/month), you earn $29.70 every month they stay subscribed.'
    },
    {
      question: 'When do I get paid?',
      answer: 'Commissions are paid monthly via PayPal or bank transfer. Payments are processed within 7 days of the end of each month, with a minimum payout threshold of $50.'
    },
    {
      question: 'How do I track my referrals?',
      answer: 'You\'ll get access to a real-time affiliate dashboard where you can track clicks, conversions, earnings, and customer retention. You\'ll also receive detailed monthly reports.'
    },
    {
      question: 'What marketing materials do you provide?',
      answer: 'We provide banner ads, social media graphics, email templates, landing page copy, product screenshots, demo videos, and more. All materials are professionally designed and optimized for conversion.'
    },
    {
      question: 'Can I promote Guild AI on multiple channels?',
      answer: 'Yes! You can promote Guild AI on your website, blog, social media, email list, YouTube channel, podcast, or any other platform. We encourage multi-channel promotion.'
    },
    {
      question: 'Is there a minimum audience size requirement?',
      answer: 'No minimum audience size is required. However, we look for affiliates who have an engaged audience interested in AI, automation, entrepreneurship, or business tools.'
    }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Integrate with backend API to submit affiliate application
    alert('Thank you for your interest! We\'ll review your application and get back to you within 2-3 business days.')
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
        <Badge className="mb-6 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800">
          <Rocket className="w-3 h-3 mr-1" />
          Coming Soon
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-sky-800 to-emerald-800 dark:from-slate-100 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Join the Guild AI Affiliate Program
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-4 max-w-3xl mx-auto">
          Earn recurring income by promoting the most comprehensive AI workforce platform. 30% commission on all plans, paid monthly.
        </p>
        <div className="max-w-2xl mx-auto mb-8">
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <p className="text-base text-amber-800 dark:text-amber-300">
                <strong>Note:</strong> Our affiliate program is currently under construction. The details shown below represent what will be available once we launch. Submit your application now to be notified when the program goes live!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center text-white mb-4`}>
                  {benefit.icon}
                </div>
                <CardTitle className="text-xl">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Commission Calculator */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Commission Calculator
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            See how much you can earn with each referral
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {commissionTiers.map((tier, index) => (
            <Card 
              key={index}
              className={`hover:shadow-lg transition-shadow ${
                tier.popular ? 'border-2 border-sky-500' : ''
              }`}
            >
              {tier.popular && (
                <div className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.plan}</CardTitle>
                <CardDescription className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  {tier.price}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Your Commission
                    </p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {tier.commission}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Annual Earnings (per customer)
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {tier.annual}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    10 Growth Referrals
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    $297/month
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    $3,564/year
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    25 Growth Referrals
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    $742/month
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    $8,910/year
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    50 Growth Referrals
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    $1,485/month
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    $17,820/year
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resources */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            What You Get
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to succeed as an affiliate
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {resources.map((resource, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-sky-600 to-emerald-600 flex items-center justify-center text-white mb-3">
                  {resource.icon}
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {resource.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Application Form */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Apply to Join
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Fill out the form below and we'll review your application
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website or Social Media URL *</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    required
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Describe Your Audience *</Label>
                  <Textarea
                    id="audience"
                    name="audience"
                    value={formData.audience}
                    onChange={handleInputChange}
                    required
                    placeholder="Tell us about your audience size, demographics, and interests..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Affiliate Marketing Experience</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Share your experience with affiliate marketing (optional)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Why Guild AI?</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Why do you want to promote Guild AI? (optional)"
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-lg py-6"
                >
                  Submit Application
                </Button>

                <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                  We'll review your application and get back to you within 2-3 business days
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 py-20">
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
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <Card className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white border-0 text-white max-w-4xl mx-auto">
          <CardContent className="p-12 text-center">
            <Globe className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-xl mb-8 text-sky-50">
              Join hundreds of affiliates earning recurring income with Guild AI
            </p>
            <Button 
              size="lg" 
              className="bg-white text-sky-700 hover:bg-slate-100 text-lg px-8 py-6"
              onClick={() => document.getElementById('audience')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Apply Now
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default Affiliates

