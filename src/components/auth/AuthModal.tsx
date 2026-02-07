import { useState, useEffect, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalView,
    closeAuthModal,
    setAuthModalView,
    signInWithGoogle,
    signInWithGitHub,
    signInWithLinkedIn,
    signInWithEmail,
    signUpWithEmail,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isAuthModalOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setCaptchaToken('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isAuthModalOpen]);

  // Autofocus management
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const timer = setTimeout(() => {
      if (authModalView === 'initial') {
        emailInputRef.current?.focus();
      } else {
        passwordInputRef.current?.focus();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isAuthModalOpen, authModalView]);

  // Escape key handler
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleOAuth = async (provider: 'google' | 'github' | 'linkedin') => {
    setError('');
    try {
      if (provider === 'google') await signInWithGoogle();
      else if (provider === 'github') await signInWithGitHub();
      else await signInWithLinkedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPassword('');
    setShowPassword(false);
    setCaptchaToken('');
    setAuthModalView('sign_up');
  };

  const handleBack = () => {
    setError('');
    setPassword('');
    setShowPassword(false);
    setCaptchaToken('');
    setAuthModalView('initial');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signInWithEmail(email, password);
      closeAuthModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const hcaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY as string;
    if (hcaptchaSiteKey && !captchaToken) {
      setError('Please complete the captcha');
      setIsSubmitting(false);
      return;
    }

    try {
      await signUpWithEmail(email, password, captchaToken);
      closeAuthModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      if (message.toLowerCase().includes('already registered') || message.toLowerCase().includes('already been registered')) {
        setAuthModalView('sign_in');
        setPassword('');
        setError('This email already has an account. Sign in instead.');
      } else {
        setError(message);
        captchaRef.current?.resetCaptcha();
        setCaptchaToken('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hcaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY as string;

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  const GitHubIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );

  const LinkedInIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );

  // --- Initial View: OAuth + Email entry ---
  if (authModalView === 'initial') {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={closeAuthModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div
          className="bg-surface rounded-xl shadow-2xl w-full max-w-md mx-4 ring-1 ring-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-6 pb-2 text-center">
            <h2 id="auth-modal-title" className="text-xl font-bold text-text-primary">
              Welcome to DataDrill
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Sign in or create an account
            </p>
          </div>

          <div className="p-6 pt-4">
            {/* OAuth Buttons */}
            <div className="space-y-3 mb-5">
              <button
                onClick={() => handleOAuth('google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg ring-1 ring-white/10 hover:bg-bg-primary transition-colors text-text-primary"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <button
                onClick={() => handleOAuth('github')}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg ring-1 ring-white/10 hover:bg-bg-primary transition-colors text-text-primary"
              >
                <GitHubIcon />
                Continue with GitHub
              </button>
              <button
                onClick={() => handleOAuth('linkedin')}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg ring-1 ring-white/10 hover:bg-bg-primary transition-colors text-text-primary"
              >
                <LinkedInIcon />
                Continue with LinkedIn
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-surface px-3 text-text-muted">or use email</span>
              </div>
            </div>

            {/* Email Entry */}
            <form onSubmit={handleEmailContinue}>
              <div className="mb-4">
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-lg bg-bg-primary text-text-primary placeholder:text-text-muted ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                Continue
              </button>
            </form>

            <p className="text-xs text-text-muted text-center mt-4">
              By continuing, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Sign In View ---
  if (authModalView === 'sign_in') {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={closeAuthModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div
          className="bg-surface rounded-xl shadow-2xl w-full max-w-md mx-4 ring-1 ring-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-5 pb-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h2 id="auth-modal-title" className="text-xl font-bold text-text-primary">
              Welcome back!
            </h2>
            <p className="text-sm text-text-secondary mt-1 truncate">
              {email}
            </p>
          </div>

          <div className="p-6 pt-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="auth-password" className="block text-sm font-medium text-text-primary mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2.5 pr-10 rounded-lg bg-bg-primary text-text-primary placeholder:text-text-muted ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-border text-text-muted cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-sm text-center mt-4 text-text-secondary">
              Don't have an account?{' '}
              <button
                onClick={() => { setError(''); setPassword(''); setAuthModalView('sign_up'); }}
                className="text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Sign Up View ---
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={closeAuthModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="bg-surface rounded-xl shadow-2xl w-full max-w-md mx-4 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h2 id="auth-modal-title" className="text-xl font-bold text-text-primary">
            Create your account
          </h2>
          <p className="text-sm text-text-secondary mt-1 truncate">
            {email}
          </p>
        </div>

        <div className="p-6 pt-4">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-text-primary mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-bg-primary text-text-primary placeholder:text-text-muted ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-text-muted mt-1">Min 6 characters</p>
            </div>

            {hcaptchaSiteKey && (
              <div className="flex justify-center">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={hcaptchaSiteKey}
                  onVerify={setCaptchaToken}
                  onExpire={() => setCaptchaToken('')}
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                isSubmitting
                  ? 'bg-border text-text-muted cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-hover'
              }`}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-text-secondary">
            Already have an account?{' '}
            <button
              onClick={() => { setError(''); setPassword(''); setAuthModalView('sign_in'); }}
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
