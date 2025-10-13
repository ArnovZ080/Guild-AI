import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Rocket, Mail, Building, Briefcase, Sparkles, CheckCircle, ArrowRight } from 'lucide-react'
import apiService from '../services/api'

function WaitlistPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    company: '',
    role: '',
    howHeard: '',
    useCase: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [position, setPosition] = useState(null)

  // Pre-populate email from URL parameter
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }))
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiService.post('/waitlist/join', {
        email: formData.email,
        full_name: formData.fullName || null,
        company: formData.company || null,
        role: formData.role || null,
        how_heard: formData.howHeard || null,
        use_case: formData.useCase || null,
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
      })

      if (response.data.success) {
        setSuccess(true)
        setPosition(response.data.position)
        
        // If they already have an account, redirect to login after 3 seconds
        if (response.data.has_account) {
          setTimeout(() => navigate('/login'), 3000)
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to join waiting list. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-2 border-indigo-100">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              You're on the List! 🎉
            </CardTitle>
            <CardDescription className="text-lg">
              Thank you for your interest in Guild AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {position && (
              <Alert className="bg-indigo-50 border-indigo-200">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <AlertDescription className="text-indigo-900">
                  <strong>You're #{position} on our waiting list!</strong>
                  <br />
                  The sooner you join, the sooner you get access.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4 text-center">
              <h3 className="font-semibold text-xl">What happens next?</h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>We'll send you exclusive updates about Guild AI's development</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You'll be among the first to know when we launch</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You may be invited to our beta testing program</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Early access users get special launch pricing</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Want to learn more about Guild AI in the meantime?
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="gap-2"
                >
                  View Features
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-2 border-indigo-100">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <Rocket className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Join the Guild AI Waiting List
          </CardTitle>
          <CardDescription className="text-lg">
            Be among the first to experience the world's most advanced AI workforce platform.
            We're currently in private beta and will notify you when we launch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Email - Required */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              {/* Full Name - Optional */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="John Doe"
                />
              </div>

              {/* Company - Optional */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your Company Inc."
                  />
                </div>
              </div>

              {/* Role - Optional */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                  >
                    <option value="">Select your role...</option>
                    <option value="founder">Founder/CEO</option>
                    <option value="business_owner">Business Owner</option>
                    <option value="solopreneur">Solopreneur</option>
                    <option value="marketing">Marketing Manager</option>
                    <option value="operations">Operations Manager</option>
                    <option value="product">Product Manager</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* How did you hear about us */}
              <div>
                <label htmlFor="howHeard" className="block text-sm font-medium text-gray-700 mb-2">
                  How did you hear about us?
                </label>
                <select
                  id="howHeard"
                  name="howHeard"
                  value={formData.howHeard}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                >
                  <option value="">Select...</option>
                  <option value="google">Google Search</option>
                  <option value="social_media">Social Media</option>
                  <option value="referral">Friend/Colleague Referral</option>
                  <option value="blog">Blog/Article</option>
                  <option value="podcast">Podcast</option>
                  <option value="event">Event/Conference</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Use Case - Optional */}
              <div>
                <label htmlFor="useCase" className="block text-sm font-medium text-gray-700 mb-2">
                  What would you use Guild AI for?
                </label>
                <textarea
                  id="useCase"
                  name="useCase"
                  value={formData.useCase}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tell us about your use case... (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This helps us prioritize features you'll actually use!
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !formData.email}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 text-lg gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Joining Waiting List...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Join the Waiting List
                </>
              )}
            </Button>

            {/* Back to Landing */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                ← Back to Home
              </button>
            </div>
          </form>

          {/* Social Proof */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center space-y-4">
              <p className="text-sm font-semibold text-gray-700">
                Join entrepreneurs and businesses already on the list
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Early access pricing</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WaitlistPage

