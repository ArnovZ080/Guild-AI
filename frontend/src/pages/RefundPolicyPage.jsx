import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { ArrowLeft } from 'lucide-react';

function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="https://i.postimg.cc/kXWX5H30/Guild-AI-logo.png" 
                alt="Guild AI Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                Guild AI
              </span>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold">Refund Policy</CardTitle>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Free Trial Period</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  All paid subscription plans include a 21-day free trial. During this trial period, you can 
                  cancel your subscription at any time without any charges. If you do not cancel before the 
                  trial period ends, you will be automatically charged for your selected plan.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Subscription Refunds</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  Our refund policy for subscriptions is as follows:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>
                    <strong>Within 7 Days:</strong> If you are not satisfied with Guild AI within the first 
                    7 days of your paid subscription, you may request a full refund. Simply contact our 
                    support team with your account details.
                  </li>
                  <li>
                    <strong>After 7 Days:</strong> Subscription fees are non-refundable after the first 7 days 
                    of your billing period. However, you may cancel your subscription at any time, and you will 
                    retain access until the end of your current billing period.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Credit Package Refunds</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  Credit packages (bonus credits) are non-refundable once purchased. However, unused credits 
                  do not expire and can be used at any time while you maintain an active account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Cancellation Process</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  To cancel your subscription:
                </p>
                <ol className="list-decimal pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Log in to your Guild AI account</li>
                  <li>Navigate to Settings → Subscription</li>
                  <li>Click "Cancel Subscription"</li>
                  <li>Follow the prompts to confirm cancellation</li>
                </ol>
                <p className="text-slate-700 dark:text-slate-300 mt-3">
                  Your subscription will remain active until the end of your current billing period.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Refund Processing</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  Approved refunds will be processed within 5-10 business days. Refunds will be issued to the 
                  original payment method used for the purchase. Please note that it may take additional time 
                  for the refund to appear in your account, depending on your payment provider.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Exceptions</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  We reserve the right to refuse refunds in cases of:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Violation of our Terms of Service</li>
                  <li>Abusive or fraudulent behavior</li>
                  <li>Excessive usage inconsistent with refund requests</li>
                  <li>Previous refunds granted for the same account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Downgrading Your Plan</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  Instead of canceling, you may choose to downgrade to a lower-tier plan or the free plan. 
                  When downgrading:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>The change will take effect at the end of your current billing period</li>
                  <li>You will retain access to your current plan features until then</li>
                  <li>No prorated refunds are provided for downgrades</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  If you have any questions about our refund policy or need to request a refund, please 
                  contact our support team:
                </p>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                  <strong>Email:</strong> support@guildai.com<br />
                  <strong>Response Time:</strong> We aim to respond within 24 hours
                </p>
              </section>

              <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  <strong>Customer Satisfaction Guarantee:</strong> We're committed to your success with 
                  Guild AI. If you're experiencing any issues or have concerns, please reach out to our 
                  support team before requesting a refund. We're here to help!
                </p>
              </div>

              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> This is a placeholder Refund Policy. Please consult with a legal 
                  professional to ensure your refund policy complies with consumer protection laws in your 
                  jurisdiction (including South African consumer protection regulations).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RefundPolicyPage;

