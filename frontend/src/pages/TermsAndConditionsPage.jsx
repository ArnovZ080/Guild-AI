import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Sparkles, ArrowLeft } from 'lucide-react'

function TermsAndConditionsPage() {
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
            Terms and Conditions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Last updated: October 9, 2025
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">1. Agreement to Terms</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                By accessing and using Guild AI's services, you agree to be bound by these Terms and Conditions. 
                If you disagree with any part of these terms, you may not access our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">2. Description of Service</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Guild AI provides an autonomous AI workforce platform with 114 specialized AI agents designed 
                to automate business tasks. Our service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Access to AI agents based on your subscription tier</li>
                <li>Monthly credit allocations for agent operations</li>
                <li>Judge Layer Quality Assurance system</li>
                <li>Integration with third-party business tools</li>
                <li>Educational transparency and business insights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">3. Subscription Plans</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We offer four subscription tiers: Starter, Growth, Professional, and Enterprise. Each tier 
                provides different numbers of included agents, monthly credits, and features as detailed on 
                our pricing page.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Subscriptions are billed monthly in advance</li>
                <li>Additional agents can be hired on a daily or monthly basis</li>
                <li>Credits reset at the beginning of each billing cycle and do not roll over</li>
                <li>You may upgrade or downgrade your plan at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">4. Payment Terms</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                All payments are processed through Paystack, our secure payment provider. By subscribing, you:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Authorize us to charge your payment method on a recurring basis</li>
                <li>Agree to pay all fees associated with your subscription</li>
                <li>Are responsible for maintaining valid payment information</li>
                <li>Acknowledge that prices are subject to change with 30 days notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">5. User Responsibilities</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                As a user of Guild AI, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service in compliance with all applicable laws</li>
                <li>Not use the service for any illegal or unauthorized purpose</li>
                <li>Not attempt to reverse engineer or compromise our systems</li>
                <li>Not share your account access with unauthorized parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">6. Intellectual Property</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                The Guild AI platform, including all AI agents, software, designs, and content, is owned by 
                Guild AI and protected by intellectual property laws. You are granted a limited, non-exclusive, 
                non-transferable license to use our service for your business purposes only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">7. Data Ownership</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                You retain all rights to the data you input into Guild AI and the outputs generated by our 
                AI agents for your use. We may use anonymized and aggregated data to improve our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">8. Service Availability</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                While we strive for 99.9% uptime, we do not guarantee uninterrupted access to our services. 
                We may perform scheduled maintenance and updates that temporarily affect service availability. 
                We are not liable for any damages resulting from service interruptions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">9. Limitation of Liability</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Guild AI and its affiliates shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use of or inability to use the service. 
                Our total liability shall not exceed the amount you paid for the service in the 12 months 
                preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">10. Termination</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Either party may terminate this agreement at any time. You may cancel your subscription through 
                your account settings. We may terminate or suspend your access immediately if you breach these 
                terms. Upon termination, your right to use the service ceases immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">11. Changes to Terms</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We reserve the right to modify these terms at any time. We will notify you of material changes 
                via email or through the service. Your continued use of the service after such modifications 
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">12. Governing Law</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                These terms shall be governed by and construed in accordance with applicable laws. Any disputes 
                arising from these terms or your use of the service shall be resolved through binding arbitration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">13. Contact Information</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                For questions about these Terms and Conditions, please contact us at:
              </p>
              <ul className="list-none space-y-2 text-slate-700 dark:text-slate-300">
                <li><strong>Email:</strong> Support@guildof1.com</li>
                <li><strong>Address:</strong> Guild AI</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsAndConditionsPage

