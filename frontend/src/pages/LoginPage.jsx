import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useLibrary();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      showToast(`Welcome back, ${res.user.name}.`);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoRole) => {
    if (demoRole === 'admin') {
      setEmail('admin@novelshelf.com');
      setPassword('Admin@123456');
    } else {
      setEmail('patron@novelshelf.com');
      setPassword('User@123456');
    }
    setError('');
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-surface">
      <div className="w-full max-w-md">
        
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20 shadow-sm">
            <span className="material-symbols-outlined text-3xl">menu_book</span>
          </div>
          <h1 className="font-title-editorial text-2xl sm:text-3xl text-primary font-normal tracking-tight">
            Sign In to NovelShelf
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant font-body-sm leading-relaxed max-w-sm mx-auto">
            Access your private reading sanctuary, annotate volumes, and explore canonical works.
          </p>
        </div>

        {/* Demo Quick-Fill Pill Bar */}
        <div className="mb-6 p-3 bg-surface-container-high/60 rounded-xl border border-surface-variant/60 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label-archival text-secondary uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <span className="material-symbols-outlined text-sm">key</span>
              Quick Demo Accounts
            </span>
            <span className="text-[10px] text-outline">Click to Autofill</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-primary/20 hover:border-primary/50 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-primary group-hover:text-secondary flex items-center gap-1">
                <span>Archivist Admin</span>
                <span className="text-[9px] px-1 bg-primary/10 text-primary rounded">Full</span>
              </div>
              <div className="text-[10px] text-outline truncate">admin@novelshelf.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('patron')}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-variant hover:border-primary/40 text-left transition-all group"
            >
              <div className="text-xs font-semibold text-on-surface group-hover:text-primary flex items-center gap-1">
                <span>Demo Patron</span>
                <span className="text-[9px] px-1 bg-surface-container-highest text-on-surface-variant rounded">User</span>
              </div>
              <div className="text-[10px] text-outline truncate">patron@novelshelf.com</div>
            </button>
          </div>
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
                  placeholder="patron@novelshelf.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-surface-container-high/40 rounded-xl text-on-surface placeholder:text-outline/70 text-sm font-body-sm border border-surface-variant/60 focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-label-archival text-on-surface uppercase tracking-wider font-semibold">
                  Password
                </label>
              </div>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-primary text-on-primary font-label-lg text-sm tracking-wide shadow-md hover:bg-primary/95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  <span>Entering Sanctuary...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
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
                New to the Library?
              </span>
            </div>
          </div>

          {/* Sign Up Redirect */}
          <div className="text-center">
            <Link
              to={`/signup${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-secondary/80 font-label-lg transition-colors"
            >
              <span>Create an archival patron account</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

