import React from 'react';
import { Link } from 'react-router-dom';
import { PublicFooter } from '../components/public/PublicFooter';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[#E6E6DF] bg-[#FAFAF7]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-2xl tracking-tight text-[#0A0A0A]">
            FOT<span className="text-[#C2E600]">.</span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-[#55554F] hover:text-[#0A0A0A] transition-colors">
            &larr; Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 w-full flex-1 space-y-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#8C8C85] font-bold block mb-2">
            Data & Privacy
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#0A0A0A]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#8C8C85] mt-2">
            Last updated: October 2026 · GenLab Pvt Ltd
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#55554F] leading-relaxed border-t border-[#E6E6DF] pt-8">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#0A0A0A]">1. Information We Collect</h2>
            <p>
              When you register for Friends of Tech, we collect contact information including your full name, email address, phone number, and transaction receipt proof. This information is used strictly to issue admission passes and send event-day logistical updates.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#0A0A0A]">2. How Your Data Is Used</h2>
            <p>
              Your data is processed to generate unique event ID cards, dispatch tickets, verify on-site entrance passes, and ensure event safety. We never sell, rent, or trade your personal information with third-party marketers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#0A0A0A]">3. Data Retention & Security</h2>
            <p>
              All participant records are stored with standard access controls. Payment screenshots are retained solely until transaction verification is completed by GenLab administrators.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#0A0A0A]">4. Contact Us</h2>
            <p>
              If you have any questions regarding your registration data or wish to request data deletion, please contact the GenLab privacy team at <strong className="text-[#0A0A0A]">privacy@genlab.org</strong>.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
