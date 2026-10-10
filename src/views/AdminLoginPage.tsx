import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { IconEye, IconEyeOff, IconAlertCircle, IconCheck, IconArrowRight } from '../lib/icons';
import { StudioSculpture3D } from '../components/3d/StudioSculpture3D';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password State
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/admin');
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    setForgotLoading(true);

    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotSuccess(res.message || 'Password reset link sent to your email.');
    } catch (err: unknown) {
      setForgotError((err as Error).message || 'Failed to send reset link.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex">
      {/* Left Light Brand Panel with Studio 3D Sculpture */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#FFFFFF] border-r border-[#E6E6DF] p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        {/* Top brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display font-bold text-2xl tracking-tight text-[#0A0A0A]">
            FOT<span className="text-[#C2E600]">.</span>
          </Link>
          <span className="text-xs text-[#8C8C85] font-semibold border-l border-[#E6E6DF] pl-3">
            Presented by GenLab
          </span>
        </div>

        {/* 3D Visual Centerpiece */}
        <div className="my-auto w-full flex items-center justify-center max-w-sm mx-auto">
          <StudioSculpture3D />
        </div>

        {/* Bottom Headline info */}
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAFAF7] border border-[#E6E6DF] text-xs font-mono font-bold text-[#0A0A0A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C2E600]" />
            <span>ORGANISER PORTAL</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0A0A0A]">
            Friends of Tech Administration
          </h1>
          <p className="text-xs text-[#8C8C85]">
            Secured access for GenLab event administrators only.
          </p>
        </div>
      </div>

      {/* Right Login / Form Panel */}
      <div className="w-full lg:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-between max-w-xl mx-auto lg:max-w-none">
        {/* Top return link */}
        <div className="flex items-center justify-between">
          <div className="lg:hidden flex items-center gap-2">
            <Link to="/" className="font-display font-bold text-xl tracking-tight text-[#0A0A0A]">
              FOT<span className="text-[#C2E600]">.</span>
            </Link>
          </div>
          <Link
            to="/"
            className="text-xs font-semibold text-[#55554F] hover:text-[#0A0A0A] transition-colors ml-auto flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Return to public site</span>
          </Link>
        </div>

        {/* Center Form Area */}
        <div className="my-auto py-10 w-full max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {!isForgotMode ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-[#0A0A0A]">
                    Sign in to organiser desk
                  </h2>
                  <p className="text-xs text-[#8C8C85] mt-1 font-medium">
                    Enter your administrator credentials to manage event operations.
                  </p>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-[#FFF5F5] border border-[#E53935]/30 text-[#E53935] text-xs flex items-center gap-2.5">
                    <IconAlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="login-email" className="block text-xs font-semibold text-[#8C8C85]">
                      Email address
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="admin@fot.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="field-input w-full"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-pass" className="block text-xs font-semibold text-[#8C8C85]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotMode(true);
                          setForgotEmail(email);
                        }}
                        className="text-xs font-medium text-[#8C8C85] hover:text-[#0A0A0A] transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        id="login-pass"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="field-input w-full pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-[#8C8C85] hover:text-[#0A0A0A] transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="h-12 w-full bg-[#0A0A0A] hover:bg-[#222222] text-[#FAFAF7] text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign in to dashboard</span>
                          <span className="w-5 h-5 rounded-full bg-[#C2E600] text-[#0A0A0A] flex items-center justify-center">
                            <IconArrowRight size={12} />
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="forgot-form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-[#0A0A0A]">
                    Reset your password
                  </h2>
                  <p className="text-xs text-[#8C8C85] mt-1 font-medium">
                    Enter your email and we’ll send a secure password reset link.
                  </p>
                </div>

                {forgotSuccess && (
                  <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#10B981]/30 text-[#10B981] text-xs flex items-center gap-2.5">
                    <IconCheck size={16} className="shrink-0" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                {forgotError && (
                  <div className="p-4 rounded-xl bg-[#FFF5F5] border border-[#E53935]/30 text-[#E53935] text-xs flex items-center gap-2.5">
                    <IconAlertCircle size={16} className="shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="forgot-email" className="block text-xs font-semibold text-[#8C8C85]">
                      Admin email address
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="admin@fot.org"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="field-input w-full"
                      required
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(false);
                        setForgotSuccess(null);
                        setForgotError(null);
                      }}
                      className="h-12 flex-1 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] hover:bg-[#F2F2EC] text-sm font-semibold text-[#0A0A0A] shadow-sm transition-colors cursor-pointer"
                    >
                      Back to sign in
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="h-12 flex-1 bg-[#0A0A0A] hover:bg-[#222222] text-[#FAFAF7] text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      {forgotLoading ? (
                        <span>Sending...</span>
                      ) : (
                        <span>Send reset link</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-[#8C8C85]">
          GenLab Pvt Ltd · Friends of Tech 2026
        </div>
      </div>
    </div>
  );
};
