import React from 'react';
import { Link } from 'react-router-dom';
import { PublicFooter } from '../components/public/PublicFooter';

export const TermsPage: React.FC = () => {
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
            Legal & Guidelines
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#0A0A0A]">
            Terms of Service
          </h1>
          <p className="text-xs text-[#8C8C85] mt-2">
            Last updated: October 2026 · Friends of Tech presented by GenLab Pvt Ltd
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#55554F] leading-relaxed border-t border-[#E6E6DF] pt-8">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#0A0A0A]">1. Event Participation</h2>
            <p>
              By registering for Friends of Tech (FOT), you agree to comply with all event guidelines and venue rules set forth by the organizers, GenLab Pvt Ltd. Entry is strictly permitted to ticket holders with verified QR passes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#0A0A0A]">2. Team Formation & Rules</h2>
            <p>
              Participants selecting team participation must adhere to the 2-person team structure. Solo participants are paired only upon explicit request or if registered as a complete team pair.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#0A0A0A]">3. Payment & Confirmation</h2>
            <p>
              Registration fees are paid via direct UPI transfer to GenLab Pvt Ltd. Passes are issued only after payment verification against valid transaction references (UTR). Unverified or duplicate payment claims are subject to rejection.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#0A0A0A]">4. Code of Conduct</h2>
            <p>
              Friends of Tech is dedicated to providing a respectful, welcoming, and inclusive experience for everyone, regardless of gender, sexual orientation, disability, physical appearance, or background. Harassment of any form will not be tolerated.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#0A0A0A]">5. Photography & Media</h2>
            <p>
              Photographers and videographers may document event sessions and team workshops. By attending, you consent to being photographed and recorded for community recap materials published by GenLab Pvt Ltd.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
