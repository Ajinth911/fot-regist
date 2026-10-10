import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../hooks/useUserAuth';
import { IconArrowRight, IconShield } from '../lib/icons';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useUserAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
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
          <span className="text-[#55554F]">Already a member?</span>
          <Link
            to="/login"
            className="text-[#0A0A0A] font-semibold hover:underline underline-offset-4"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* Main Sign Up Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">
          <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-8 sm:p-10 shadow-sm relative">
            {/* Header */}
            <div className="mb-8">
              <span className="inline-block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#8C8C85] mb-1">
                Builder Registration
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#0A0A0A]">
                Create your account
              </h1>
              <p className="text-xs sm:text-sm text-[#55554F] mt-2 leading-relaxed">
                Track your registrations, download your QR pass, and access check-in details.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-6 p-3.5 bg-[#FFF1F2] border border-[#FECDD3] rounded-xl text-xs text-[#BE123C] font-medium flex items-start gap-2.5">
                <span className="text-sm font-bold">!</span>
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-[#55554F] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full h-11 px-3.5 bg-[#FAFAF7] border border-[#E6E6DF] rounded-xl text-sm text-[#0A0A0A] placeholder-[#8C8C85] focus:outline-none focus:border-[#0A0A0A] focus:bg-[#FFFFFF] transition-colors"
                />
              </div>

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
                <label className="block text-xs font-mono font-semibold uppercase text-[#55554F] mb-1.5">
                  Phone Number <span className="text-[#8C8C85] lowercase font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
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
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-11 px-3.5 bg-[#FAFAF7] border border-[#E6E6DF] rounded-xl text-sm text-[#0A0A0A] placeholder-[#8C8C85] focus:outline-none focus:border-[#0A0A0A] focus:bg-[#FFFFFF] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase text-[#55554F] mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full h-11 px-3.5 bg-[#FAFAF7] border border-[#E6E6DF] rounded-xl text-sm text-[#0A0A0A] placeholder-[#8C8C85] focus:outline-none focus:border-[#0A0A0A] focus:bg-[#FFFFFF] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-[#0A0A0A] hover:bg-[#262626] text-[#FFFFFF] text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm pt-0 mt-4"
              >
                {submitting ? (
                  <span>Creating account...</span>
                ) : (
                  <>
                    <span>Create account</span>
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
                Already have an account?{' '}
                <Link to="/login" className="text-[#0A0A0A] font-semibold hover:underline underline-offset-4">
                  Log in
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
