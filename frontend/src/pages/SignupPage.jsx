import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';

export default function SignupPage() {
  const { register } = useAuth();
  const { showToast } = useLibrary();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('Please accept the NovelShelf patron reading terms.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(name, email, password);
      showToast(`Welcome to NovelShelf, ${res.user.name}. Your patron card is active.`);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-surface">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20 shadow-sm">
            <span className="material-symbols-outlined text-3xl">local_library</span>
          </div>
          <h1 className="font-title-editorial text-2xl sm:text-3xl text-primary font-normal tracking-tight">
            Register for NovelShelf
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant font-body-sm leading-relaxed max-w-sm mx-auto">
            Become a patron to read curated volumes, maintain personal reading progress, and contribute digital editions.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-surface-variant/60 shadow-lg shadow-primary/5">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-start gap-2.5 animate-fadeIn">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-label-archival text-on-surface uppercase tracking-wider mb-1.5 font-semibold">
                Patron Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                  badge
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Thomas de Quincey"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-surface-container-high/40 rounded-xl text-on-surface placeholder:text-outline/70 text-sm font-body-sm border border-surface-variant/60 focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-label-archival text-on-surface uppercase tracking-wider mb-1.5 font-semibold">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                  alternate_email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@library.org"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-surface-container-high/40 rounded-xl text-on-surface placeholder:text-outline/70 text-sm font-body-sm border border-surface-variant/60 focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-label-archival text-on-surface uppercase tracking-wider mb-1.5 font-semibold">
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-surface-container-high/40 rounded-xl text-on-surface placeholder:text-outline/70 text-sm font-body-sm border border-surface-variant/60 focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-label-archival text-on-surface uppercase tracking-wider mb-1.5 font-semibold">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                  lock_reset
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-surface-container-high/40 rounded-xl text-on-surface placeholder:text-outline/70 text-sm font-body-sm border border-surface-variant/60 focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-1 flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-surface-variant text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-xs text-on-surface-variant leading-relaxed">
                I agree to the NovelShelf reading room charter and copyright stewardship principles.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-primary text-on-primary font-label-lg text-sm tracking-wide shadow-md hover:bg-primary/95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  <span>Issuing Patron Card...</span>
                </>
              ) : (
                <>
                  <span>Create Patron Account</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-variant/60" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-surface-container-lowest text-outline font-label-archival text-[10px] uppercase tracking-widest">
                Already registered?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link
              to={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-secondary/80 font-label-lg transition-colors"
            >
              <span>Sign in with existing credentials</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

