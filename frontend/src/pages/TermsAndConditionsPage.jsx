import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { ArrowLeft } from 'lucide-react';

function TermsAndConditionsPage() {
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
            <CardTitle className="text-4xl font-bold">Terms & Conditions</CardTitle>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  By accessing and using Guild AI, you accept and agree to be bound by the terms and provisions 
                  of this agreement. If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  Guild AI provides an AI-powered workforce platform with 114 specialized AI agents designed to 
                  automate business operations, create content, manage workflows, and execute strategies autonomously.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Account Registration</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  To use Guild AI, you must:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Be at least 18 years old or have parental consent</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Subscription and Billing</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  Subscription terms:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Subscriptions are billed monthly in South African Rand (ZAR)</li>
                  <li>Paid plans include a 21-day free trial</li>
                  <li>Subscription fees are non-refundable except as required by law</li>
                  <li>You may cancel your subscription at any time</li>
                  <li>Credits are valid for the billing period and do not roll over</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Use the service for any illegal or unauthorized purpose</li>
                  <li>Attempt to gain unauthorized access to the service</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Share your account credentials with others</li>
                  <li>Use the service to generate harmful, abusive, or illegal content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  All content, features, and functionality of Guild AI are owned by us and are protected by 
                  international copyright, trademark, and other intellectual property laws. You retain ownership 
                  of content you create using our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  Guild AI is provided "as is" without warranties of any kind. We shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages resulting from your use of 
                  the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Termination</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  We may terminate or suspend your account immediately, without prior notice, for any reason, 
                  including breach of these Terms. Upon termination, your right to use the service will cease.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  We reserve the right to modify these terms at any time. We will notify users of any material 
                  changes. Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                <p className="text-slate-700 dark:text-slate-300">
                  For questions about these Terms & Conditions, please contact us at:
                </p>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                  <strong>Email:</strong> legal@guildai.com<br />
                  <strong>Address:</strong> [Your Company Address]
                </p>
              </section>

              <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> This is a placeholder Terms & Conditions document. Please consult 
                  with a legal professional to create comprehensive terms that comply with all applicable 
                  laws and adequately protect your business.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TermsAndConditionsPage;

