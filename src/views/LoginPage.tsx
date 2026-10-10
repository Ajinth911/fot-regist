import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../hooks/useUserAuth';
import { IconArrowRight, IconShield } from '../lib/icons';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useUserAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col justify-between selection:bg-[#C2E600] selection:text-[#0A0A0A]">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display text-xl font-bold tracking-tight text-[#0A0A0A]">
            Friends of Tech<span className="text-[#C2E600]">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-[#55554F]">New builder?</span>
          <Link
            to="/signup"
            className="text-[#0A0A0A] font-semibold hover:underline underline-offset-4"
          >
            Create account
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-8 sm:p-10 shadow-sm relative">
            {/* Header */}
            <div className="mb-8">
              <span className="inline-block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#8C8C85] mb-1">
                Builder & Attendee Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#0A0A0A]">
                Log in to your account
              </h1>
              <p className="text-xs sm:text-sm text-[#55554F] mt-2 leading-relaxed">
                Access your official passes, check-in QR codes, and event updates.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-6 p-3.5 bg-[#FFF1F2] border border-[#FECDD3] rounded-xl text-xs text-[#BE123C] font-medium flex items-start gap-2.5">
                <span className="text-sm font-bold">!</span>
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-[#55554F] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 px-3.5 bg-[#FAFAF7] border border-[#E6E6DF] rounded-xl text-sm text-[#0A0A0A] placeholder-[#8C8C85] focus:outline-none focus:border-[#0A0A0A] focus:bg-[#FFFFFF] transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-semibold uppercase text-[#55554F]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-[#8C8C85] hover:text-[#0A0A0A] transition-colors"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 px-3.5 bg-[#FAFAF7] border border-[#E6E6DF] rounded-xl text-sm text-[#0A0A0A] placeholder-[#8C8C85] focus:outline-none focus:border-[#0A0A0A] focus:bg-[#FFFFFF] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-[#0A0A0A] hover:bg-[#262626] text-[#FFFFFF] text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm mt-2"
              >
                {submitting ? (
                  <span>Logging in...</span>
                ) : (
                  <>
                    <span>Log in</span>
                    <span className="w-5 h-5 rounded-full bg-[#C2E600] text-[#0A0A0A] flex items-center justify-center">
                      <IconArrowRight size={12} />
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Action Footer */}
            <div className="mt-8 pt-6 border-t border-[#E6E6DF] text-center">
              <p className="text-xs text-[#55554F]">
                Don't have an account yet?{' '}
                <Link to="/signup" className="text-[#0A0A0A] font-semibold hover:underline underline-offset-4">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Secondary Organizer Link */}
          <div className="mt-6 text-center">
            <Link
              to="/admin/login"
              className="text-xs text-[#8C8C85] hover:text-[#0A0A0A] transition-colors inline-flex items-center gap-1.5"
            >
              <IconShield size={13} />
              <span>Organizers & Staff: Go to Admin Portal</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-[#8C8C85] border-t border-[#E6E6DF]/60">
        &copy; 2026 Friends of Tech. Presented by GenLab Pvt Ltd.
      </footer>
    </div>
  );
};
