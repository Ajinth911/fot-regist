import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { IconCheck, IconArrowRight } from '../lib/icons';
import { PublicFooter } from '../components/public/PublicFooter';

export const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const refNumber = searchParams.get('ref') || 'FOT-REG-PENDING';
  const email = searchParams.get('email') || 'your registered email';

  useEffect(() => {
    // Subtle celebration confetti
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#C2E600', '#0A0A0A', '#8C8C85'],
      disableForReducedMotion: true,
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b border-[#E6E6DF] bg-[#FAFAF7]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-2xl tracking-tight text-[#0A0A0A]">
            FOT<span className="text-[#C2E600]">.</span>
          </Link>
          <span className="text-xs text-[#8C8C85] font-medium">
            Presented by GenLab
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center w-full flex-1">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[#C2E600] text-[#0A0A0A] flex items-center justify-center mx-auto mb-6 shadow-md">
          <IconCheck size={32} />
        </div>

        {/* Headlines */}
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#0A0A0A] mb-3">
          You're registered.
        </h1>
        <p className="text-[#55554F] text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
          We'll verify your payment and email each person's QR pass.
        </p>

        {/* Reference Card */}
        <div className="my-10 p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] text-left space-y-6 shadow-studio">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#E6E6DF]">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#8C8C85] font-mono font-bold block">
                Booking Reference
              </span>
              <span className="text-xl font-mono font-bold text-[#0A0A0A]">
                {refNumber}
              </span>
            </div>
            <div className="text-xs text-[#0A0A0A] bg-[#F2F2EC] border border-[#E6E6DF] px-3.5 py-1.5 rounded-full self-start sm:self-auto font-bold">
              Payment Pending Verification
            </div>
          </div>

          {/* What happens next */}
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-[#8C8C85] font-mono">
              What happens next
            </h2>

            <div className="space-y-3.5 text-xs text-[#55554F]">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F2F2EC] border border-[#E6E6DF] text-[#0A0A0A] flex items-center justify-center shrink-0 font-bold font-mono">
                  1
                </div>
                <div>
                  <strong className="text-[#0A0A0A] block">Payment Verification</strong>
                  <span>The GenLab team will verify your UPI transaction screenshot against the bank statement.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F2F2EC] border border-[#E6E6DF] text-[#0A0A0A] flex items-center justify-center shrink-0 font-bold font-mono">
                  2
                </div>
                <div>
                  <strong className="text-[#0A0A0A] block">Individual QR Pass Issuance</strong>
                  <span>Each registered attendee will receive their digital badge and entry QR code at their email address.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F2F2EC] border border-[#E6E6DF] text-[#0A0A0A] flex items-center justify-center shrink-0 font-bold font-mono">
                  3
                </div>
                <div>
                  <strong className="text-[#0A0A0A] block">Event Day Entry</strong>
                  <span>Simply show your QR pass at the entrance on Saturday, October 24 for seamless check-in.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E6DF] text-xs text-[#8C8C85]">
            Confirmation updates will be sent to <strong className="text-[#0A0A0A]">{email}</strong>.
          </div>
        </div>

        {/* Home Link */}
        <div>
          <Link
            to="/"
            className="h-12 px-8 bg-[#0A0A0A] hover:bg-[#222222] text-[#FAFAF7] text-sm font-semibold rounded-xl inline-flex items-center gap-2.5 shadow-md transition-all hover:scale-105 group"
          >
            <span>Return to event page</span>
            <span className="w-5 h-5 rounded-full bg-[#C2E600] text-[#0A0A0A] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
              <IconArrowRight size={12} />
            </span>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
