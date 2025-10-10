import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Sparkles, ArrowLeft, Mail, MessageSquare, Phone,
  MapPin, Clock, Send, HelpCircle, Briefcase, Users
} from 'lucide-react'
import guildLogo from '../assets/guild-logo.png'

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'general',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Us',
      description: 'Get a response within 24 hours',
      contact: 'support@guildof1.com',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Chat with our team in real-time',
      contact: 'Available 9am-6pm EST',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Schedule a Call',
      description: 'Book a demo or consultation',
      contact: 'calendly.com/guildai',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const departments = [
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: 'General Support',
      email: 'support@guildof1.com',
      description: 'Technical issues, account questions, billing'
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      title: 'Sales & Demos',
      email: 'sales@guildof1.com',
      description: 'Product demos, pricing, enterprise plans'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Partnerships',
      email: 'partnerships@guildof1.com',
      description: 'Integrations, affiliates, collaborations'
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: 'Press & Media',
      email: 'press@guildof1.com',
      description: 'Media inquiries, interviews, press releases'
    }
  ]

  const faqs = [
    {
      question: 'How quickly will I get a response?',
      answer: 'We aim to respond to all inquiries within 24 hours during business days. Priority support customers receive responses within 1 hour.'
    },
    {
      question: 'Can I schedule a product demo?',
      answer: 'Yes! You can schedule a personalized demo with our team by selecting "Sales & Demos" as your inquiry type or booking directly through our calendar link.'
    },
    {
      question: 'Do you offer phone support?',
      answer: 'Phone support is available for Professional and Enterprise plan customers. All other customers can reach us via email, live chat, or by scheduling a call.'
    },
    {
      question: 'What information should I include in my message?',
      answer: 'Please include your account email (if applicable), a detailed description of your question or issue, and any relevant screenshots or error messages.'
    }
  ]

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Integrate with backend API to send contact form
      // await fetch(`${API_BASE_URL}/contact`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      alert('Thank you for contacting us! We\'ll get back to you within 24 hours.')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: 'general',
        message: ''
      })
    } catch (error) {
      console.error('Contact form error:', error)
      alert('There was an error sending your message. Please try again or email us directly at support@guildof1.com')
    } finally {
      setIsSubmitting(false)
    }
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
              <Link to="/subscription">
                <Button className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white hover:from-sky-700 hover:to-emerald-700">
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
          <MessageSquare className="w-3 h-3 mr-1" />
          We're Here to Help
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-sky-800 to-emerald-800 dark:from-slate-100 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Get in Touch
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
          Have questions about Guild AI? Our team is ready to help you get started with your autonomous AI workforce.
        </p>
      </section>

      {/* Contact Methods */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {contactMethods.map((method, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center text-white mb-4`}>
                  {method.icon}
                </div>
                <CardTitle className="text-xl">{method.title}</CardTitle>
                <CardDescription>{method.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-sky-600 dark:text-sky-400">
                  {method.contact}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Send Us a Message
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Fill out the form below and we'll get back to you within 24 hours
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
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="sales">Sales & Demos</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="press">Press & Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Tell us how we can help..."
                    rows={6}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-lg py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>

                <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                  By submitting this form, you agree to our{' '}
                  <Link to="/privacy-policy" className="text-sky-600 hover:text-sky-700 dark:text-sky-400">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Departments */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Contact by Department
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Reach out to the right team for faster assistance
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {departments.map((dept, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-sky-600 to-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                    {dept.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{dept.title}</CardTitle>
                    <CardDescription className="text-sm mb-3">
                      {dept.description}
                    </CardDescription>
                    <a 
                      href={`mailto:${dept.email}`}
                      className="text-sky-600 hover:text-sky-700 dark:text-sky-400 font-semibold text-sm"
                    >
                      {dept.email}
                    </a>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Office Info */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                  <CardTitle>Office Location</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Guild AI, Inc.<br />
                  123 AI Innovation Drive<br />
                  San Francisco, CA 94103<br />
                  United States
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                  <CardTitle>Business Hours</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-slate-600 dark:text-slate-400">
                  <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM EST</p>
                  <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM EST</p>
                  <p><strong>Sunday:</strong> Closed</p>
                  <p className="text-sm mt-4">
                    * Enterprise customers have 24/7 support access
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Common Questions
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

        <div className="text-center mt-12">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Can't find what you're looking for?
          </p>
          <Link to="/subscription">
            <Button variant="outline" size="lg">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-slate-900/50">
        <Card className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white border-0 text-white max-w-4xl mx-auto">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-sky-50">
              Try Guild AI free for 14 days. No credit card required.
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

export default ContactPage

