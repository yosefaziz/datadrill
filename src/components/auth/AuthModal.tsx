import { useState, useEffect, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useAuthStore } from '@/stores/authStore';

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalView,
    closeAuthModal,
    signInWithGoogle,
    signInWithGitHub,
    signInWithEmail,
    signUpWithEmail,
    openAuthModal,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setEmail('');
      setPassword('');
      setCaptchaToken('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isAuthModalOpen]);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const isSignUp = authModalView === 'sign_up';

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('');
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithGitHub();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!captchaToken) {
          setError('Please complete the captcha');
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, captchaToken);
      } else {
        await signInWithEmail(email, password);
      }
      closeAuthModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      captchaRef.current?.resetCaptcha();
      setCaptchaToken('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hcaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY as string;

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
        <div className="px-6 py-4 border-b border-white/10">
          <h2 id="auth-modal-title" className="text-lg font-semibold text-text-primary">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {isSignUp
              ? 'Sign up to track progress and unlock unlimited submissions'
              : 'Sign in to continue your practice'}
          </p>
        </div>

        <div className="p-6">
          {/* Tab Switcher */}
          <div className="flex mb-6 bg-bg-primary rounded-lg p-1">
            <button
              onClick={() => openAuthModal('sign_in')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                !isSignUp
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('sign_up')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                isSignUp
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg ring-1 ring-white/10 hover:bg-bg-primary transition-colors text-text-primary"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg ring-1 ring-white/10 hover:bg-bg-primary transition-colors text-text-primary"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface px-3 text-text-muted">or</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-text-primary mb-1">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-bg-primary text-text-primary placeholder:text-text-muted ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-text-primary mb-1">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 rounded-lg bg-bg-primary text-text-primary placeholder:text-text-muted ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Min 6 characters"
              />
            </div>

            {isSignUp && hcaptchaSiteKey && (
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
              {isSubmitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
