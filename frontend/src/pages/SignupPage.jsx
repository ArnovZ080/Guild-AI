import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Loader2 } from 'lucide-react';
import guildLogo from '../assets/guild-logo.png';

function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, loginWithGoogle, error: authError } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const selectedPlan = searchParams.get('plan') || 'free';

  useEffect(() => {
    // Store selected plan in localStorage for after signup
    if (selectedPlan && selectedPlan !== 'free') {
      localStorage.setItem('selected_plan', selectedPlan);
    }
  }, [selectedPlan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Check for beta access first
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const betaCheckResponse = await fetch(`${API_URL}/waitlist/check-beta-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.toLowerCase() })
      });
      
      const betaCheck = await betaCheckResponse.json();
      
      // If no beta access, redirect to waiting list
      if (!betaCheck.has_beta_access) {
        navigate(`/waitlist?email=${encodeURIComponent(email)}`);
        return;
      }
      
      // Has beta access - proceed with signup
      const result = await signup(email, password, fullName);
      
      // If user selected a paid plan, start free trial automatically
      if (selectedPlan && selectedPlan !== 'free') {
        try {
          const token = await result.user.getIdToken();
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          
          const response = await fetch(`${API_URL}/subscription/start-trial?plan_id=${selectedPlan}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            console.error('Failed to start trial, but user account created');
          } else {
            const trialData = await response.json();
            console.log('Trial started:', trialData);
          }
        } catch (trialError) {
          console.error('Trial start error:', trialError);
          // Don't fail signup if trial activation fails
        }
      }
      
      // Navigate to onboarding first (then chat after completion)
      navigate('/onboarding');
      
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      
      // Navigate to subscription page if plan selected, otherwise to dashboard
      if (selectedPlan && selectedPlan !== 'free') {
        navigate(`/subscription?plan=${selectedPlan}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src={guildLogo}
            alt="Guild AI Logo" 
            className="w-16 h-16 rounded-lg mb-4"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-center mt-2">
            Start building your AI workforce today
          </p>
          {selectedPlan && selectedPlan !== 'free' && (
            <div className="mt-3 px-4 py-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Selected Plan: {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
              </p>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(error || authError) && (
                <Alert variant="destructive">
                  <AlertDescription>{error || authError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-slate-500">
                  Must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  disabled={loading}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-slate-600 dark:text-slate-400 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{' '}
                  <Link to="/terms-and-conditions" className="text-sky-600 hover:text-sky-700 dark:text-sky-400" target="_blank">
                    Terms & Conditions
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-sky-600 hover:text-sky-700 dark:text-sky-400" target="_blank">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-300 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-800 px-2 text-slate-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignup}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
              </span>
              <Link 
                to="/login" 
                className="text-sky-600 hover:text-sky-700 dark:text-sky-400 font-semibold"
              >
                Log in
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link 
                to="/" 
                className="text-sm text-slate-600 hover:text-slate-700 dark:text-slate-400"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SignupPage;

