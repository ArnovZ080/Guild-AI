import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Sparkles, ArrowLeft, Target, Lightbulb, Heart, Users,
  TrendingUp, Shield, Zap, Globe, Award, Rocket
} from 'lucide-react'
import guildLogo from '../assets/guild-logo.png'

function AboutUsPage() {
  const values = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Quality First',
      description: 'We built the Judge Layer because we believe AI outputs should be guaranteed, not hoped for. Quality is non-negotiable.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: 'Educational Transparency',
      description: 'AI should teach, not just execute. Every action includes reasoning so you build business expertise while automating.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Solopreneur Focus',
      description: 'Built for lean teams and solo founders who need enterprise capabilities without enterprise complexity or cost.',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'True Autonomy',
      description: 'AI agents that actually work autonomously, not just glorified chatbots. Set goals and let them execute.',
      color: 'from-yellow-500 to-amber-500'
    }
  ]

  const milestones = [
    {
      year: 'May 2025',
      title: 'Founded',
      description: 'Guild AI was founded with a mission to democratize AI workforce automation for solopreneurs and small teams.'
    },
    {
      year: 'July 2025',
      title: 'Development Started',
      description: 'Began building the platform with a focus on autonomous AI agents, quality assurance, and educational transparency.'
    },
    {
      year: 'September 2025',
      title: '114 Agents & 123 Integrations',
      description: 'Reached 114 specialized AI agents and 123 platform integrations, creating the most comprehensive AI workforce ecosystem.'
    },
    {
      year: 'October 2025',
      title: 'Beta Testing',
      description: 'Launched beta testing program with select users to refine agent capabilities and integration reliability.'
    },
    {
      year: 'November 2025',
      title: 'Public Launch',
      description: 'Official public launch of Guild AI, making autonomous AI workforce automation accessible to everyone.'
    }
  ]

  const team = [
    {
      role: 'Product Vision',
      description: 'Designing the future of autonomous AI workforces',
      icon: <Lightbulb className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      role: 'Engineering',
      description: 'Building robust, scalable AI agent infrastructure',
      icon: <Rocket className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      role: 'AI Research',
      description: 'Advancing agent capabilities and quality assurance',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      role: 'Customer Success',
      description: 'Ensuring every customer achieves their automation goals',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const stats = [
    { value: '114', label: 'AI Agents', icon: <Users className="w-6 h-6" /> },
    { value: '123', label: 'Integrations', icon: <Globe className="w-6 h-6" /> },
    { value: '99%', label: 'Cost Savings', icon: <TrendingUp className="w-6 h-6" /> },
    { value: '24/7', label: 'Operation', icon: <Zap className="w-6 h-6" /> }
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
          <Target className="w-3 h-3 mr-1" />
          Our Mission
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-sky-800 to-emerald-800 dark:from-slate-100 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Democratizing AI Workforce Automation
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
          We believe every solopreneur and small team deserves access to enterprise-grade AI automation. Guild AI makes that possible with 114 specialized agents, built-in quality assurance, and transparent pricing.
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

      {/* Our Story */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center text-slate-900 dark:text-slate-100">
            Our Story
          </h2>
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
              Guild AI was born from a simple observation: AI tools were getting powerful, but they weren't getting reliable. Solopreneurs and small teams were promised automation, but delivered tools that still required constant supervision and manual quality checks.
            </p>
            <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
              We asked ourselves: what if AI could validate its own work? What if it could measure its own performance? What if it could teach you business strategy while executing tasks? These questions led to Guild AI's three core innovations: the Judge Layer, Meta KPIs, and Educational Transparency.
            </p>
            <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
              Today, Guild AI is the only platform that combines autonomous AI agents with built-in quality assurance, self-monitoring, and educational insights. We've built 114 specialized agents, integrated with 123 platforms, and helped thousands of solopreneurs automate their businesses without sacrificing quality or understanding.
            </p>
            <p className="text-lg text-slate-700 dark:text-slate-300">
              Our mission remains unchanged: democratize AI workforce automation so that every entrepreneur can compete with enterprise-level efficiency, regardless of their team size or budget.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Our Values
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            The principles that guide everything we build
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${value.color} flex items-center justify-center text-white mb-4`}>
                  {value.icon}
                </div>
                <CardTitle className="text-2xl">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Our Journey
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Key milestones in building the future of AI automation
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-sky-600 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                    {milestone.year}
                  </div>
                </div>
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="text-xl">{milestone.title}</CardTitle>
                    <CardDescription className="text-base">
                      {milestone.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Our Team
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Passionate experts building the future of work
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {team.map((member, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white mx-auto mb-4`}>
                  {member.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                  {member.role}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {member.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Interested in joining our team?
          </p>
          <Link to="/affiliates">
            <Button size="lg" variant="outline">
              View Affiliate Opportunities
            </Button>
          </Link>
        </div>
      </section>

      {/* Recognition */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <Award className="w-16 h-16 text-sky-600 dark:text-sky-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Industry Recognition
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Guild AI is recognized as a pioneer in autonomous AI workforce automation, with unique features that set new industry standards for quality assurance, transparency, and performance measurement.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">
                  First
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Built-in AI Quality Assurance
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  Only
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Self-Monitoring Meta KPIs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  Most
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Comprehensive Agent Library
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-sky-600 to-emerald-600 border-0 text-white">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Join the AI Automation Revolution
            </h2>
            <p className="text-xl mb-8 text-sky-50">
              Start building your autonomous AI workforce today
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

export default AboutUsPage

