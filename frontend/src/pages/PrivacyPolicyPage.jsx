import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Sparkles, ArrowLeft } from 'lucide-react'

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-sky-600 dark:text-sky-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                Guild AI
              </span>
            </Link>
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Last updated: October 9, 2025
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">1. Introduction</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Welcome to Guild AI. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we look after your personal data when you visit our 
                website and use our services, and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">2. Information We Collect</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We may collect, use, store and transfer different kinds of personal data about you:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li><strong>Identity Data:</strong> First name, last name, username or similar identifier</li>
                <li><strong>Contact Data:</strong> Email address, telephone numbers, billing address</li>
                <li><strong>Financial Data:</strong> Payment card details, bank account information</li>
                <li><strong>Transaction Data:</strong> Details about payments and subscriptions</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                <li><strong>Usage Data:</strong> Information about how you use our website and services</li>
                <li><strong>Marketing Data:</strong> Your preferences in receiving marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">3. How We Use Your Information</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We use your personal data for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>To provide and maintain our AI workforce services</li>
                <li>To process your subscription payments and manage your account</li>
                <li>To communicate with you about your account and our services</li>
                <li>To improve our services and develop new features</li>
                <li>To comply with legal obligations and enforce our terms</li>
                <li>To send you marketing communications (with your consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">4. Data Security</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We have implemented appropriate security measures to prevent your personal data from being 
                accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal 
                data to those employees, agents, contractors, and other third parties who have a business need 
                to know.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">5. Data Retention</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We will only retain your personal data for as long as necessary to fulfill the purposes we 
                collected it for, including for the purposes of satisfying any legal, accounting, or reporting 
                requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">6. Your Legal Rights</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Under certain circumstances, you have rights under data protection laws in relation to your 
                personal data, including the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Request access to your personal data</li>
                <li>Request correction of your personal data</li>
                <li>Request erasure of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">7. Third-Party Services</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We may use third-party service providers to help us operate our business and deliver services 
                to you. These providers include payment processors (Paystack), cloud hosting services, and 
                analytics providers. We ensure that all third parties respect the security of your personal 
                data and treat it in accordance with the law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">8. Cookies</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We use cookies and similar tracking technologies to track activity on our service and store 
                certain information. You can instruct your browser to refuse all cookies or to indicate when 
                a cookie is being sent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">9. Changes to This Policy</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">10. Contact Us</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <ul className="list-none space-y-2 text-slate-700 dark:text-slate-300">
                <li><strong>Email:</strong> support@guildof1.com</li>
                <li><strong>Address:</strong> Guild AI</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage

