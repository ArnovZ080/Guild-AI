import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Sparkles, ArrowLeft } from 'lucide-react'

function RefundPolicyPage() {
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
            Refund Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Last updated: October 9, 2025
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">1. Overview</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                At Guild AI, we stand behind the quality of our service. This Refund Policy outlines the 
                circumstances under which refunds may be issued and the process for requesting a refund.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">2. 14-Day Money-Back Guarantee</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We offer a 14-day money-back guarantee for first-time subscribers. If you are not satisfied 
                with our service within the first 14 days of your initial subscription, you may request a 
                full refund.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>This guarantee applies only to your first subscription payment</li>
                <li>The refund must be requested within 14 days of the initial payment</li>
                <li>You must provide a reason for the refund request</li>
                <li>Refunds are processed within 5-10 business days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">3. Monthly Subscription Refunds</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                For ongoing monthly subscriptions (after the initial 14-day period):
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Refunds are generally not provided for partial months</li>
                <li>You may cancel at any time to prevent future charges</li>
                <li>Cancellation takes effect at the end of the current billing period</li>
                <li>You retain access to the service until the end of the paid period</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">4. Agent Hiring Refunds</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                For additional agents hired on a daily or monthly basis:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li><strong>Daily rentals:</strong> No refunds once the rental period has started</li>
                <li><strong>Monthly rentals:</strong> Refunds may be considered on a case-by-case basis if requested within 48 hours of purchase and minimal usage has occurred</li>
                <li>Unused rental periods do not carry over or qualify for refunds</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">5. Service Interruptions</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                If our service experiences significant downtime or interruptions:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>We may provide service credits or partial refunds at our discretion</li>
                <li>Downtime of less than 1% per month is considered within acceptable limits</li>
                <li>Scheduled maintenance does not qualify for refunds</li>
                <li>You must report service issues within 7 days to be eligible for consideration</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">6. Non-Refundable Items</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                The following are not eligible for refunds:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Used monthly credits (credits do not have monetary value)</li>
                <li>Custom integration or development work</li>
                <li>Third-party service fees or charges</li>
                <li>Subscriptions terminated due to Terms of Service violations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">7. How to Request a Refund</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                To request a refund, please follow these steps:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Contact our support team at <strong>support@guildai.com</strong></li>
                <li>Include your account email and subscription details</li>
                <li>Provide a brief explanation of your reason for the refund request</li>
                <li>Allow 2-3 business days for our team to review your request</li>
                <li>If approved, refunds are processed within 5-10 business days</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">8. Refund Processing</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                Once a refund is approved:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Refunds are issued to the original payment method</li>
                <li>Processing time depends on your payment provider (typically 5-10 business days)</li>
                <li>You will receive an email confirmation when the refund is processed</li>
                <li>Your account access will be terminated upon refund completion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">9. Chargebacks</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                If you initiate a chargeback with your payment provider without first contacting us:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Your account will be immediately suspended</li>
                <li>We reserve the right to dispute the chargeback</li>
                <li>Future access to Guild AI services may be denied</li>
                <li>Please contact us first to resolve any billing disputes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">10. Plan Downgrades</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                If you downgrade your subscription plan:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>The downgrade takes effect at the next billing cycle</li>
                <li>No refunds are provided for the difference in plan pricing</li>
                <li>You retain access to your current plan features until the billing cycle ends</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">11. Exceptional Circumstances</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We understand that exceptional circumstances may arise. If you believe you have a unique 
                situation that warrants consideration outside of this policy, please contact our support 
                team. We will review each case individually and may provide accommodations at our discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">12. Policy Updates</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                We reserve the right to modify this Refund Policy at any time. Changes will be posted on 
                this page with an updated "Last updated" date. Your continued use of the service after 
                changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">13. Contact Us</h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                For questions about our Refund Policy or to request a refund, please contact:
              </p>
              <ul className="list-none space-y-2 text-slate-700 dark:text-slate-300">
                <li><strong>Email:</strong> support@guildai.com</li>
                <li><strong>Subject Line:</strong> Refund Request - [Your Account Email]</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RefundPolicyPage

