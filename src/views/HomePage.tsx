import React, { useState, useEffect } from 'react';
import type { EventConfig } from '../types';
import { api } from '../lib/api';
import { useLenis } from '../hooks/useLenis';

import { Preloader } from '../components/common/Preloader';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { HeroSection } from '../components/public/HeroSection';
import { StatementSection } from '../components/public/StatementSection';
import { AboutSection } from '../components/public/AboutSection';
import { ScheduleHorizontal } from '../components/public/ScheduleHorizontal';
import { PrizesSection } from '../components/public/PrizesSection';
import { GuidelinesSection } from '../components/public/GuidelinesSection';
import { FaqSection } from '../components/public/FaqSection';
import { FinalCtaSection } from '../components/public/FinalCtaSection';
import { PublicFooter } from '../components/public/PublicFooter';

export const HomePage: React.FC = () => {
  const [config, setConfig] = useState<EventConfig | null>(null);

  useLenis();

  useEffect(() => {
    api.getEventConfig()
      .then((data) => {
        setConfig(data);
      })
      .catch((err) => {
        console.error('Failed to load event config:', err);
      });
  }, []);

  const activeConfig: EventConfig = config || {
    id: 1,
    name: 'Friends of Tech',
    tagline: 'Where builders meet.',
    description: 'A full day of hands-on building, keynote talks, team sprints, and honest conversations with India’s best tech community. Presented by GenLab Pvt Ltd.',
    banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=80',
    logo_url: '',
    genlab_logo_url: '',
    date_text: 'Saturday, October 24, 2026',
    time_text: '08:30 AM - 06:00 PM IST',
    venue_name: 'Auditorium 01, Tech Innovation Center',
    venue_address: '100 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka 560034',
    price_per_person: 99,
    upi_id: 'genlab.fot@upi',
    upi_name: 'GenLab Pvt Ltd - Friends of Tech',
    gpay_qr_url: '',
    guidelines: [],
    schedule: [],
    prizes: [],
    faq: [],
    contact: [],
    google_sheet_url: '',
    google_sheet_status: 'Unconfigured',
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A] relative overflow-x-hidden flex flex-col justify-between">

      {/* Intro Preloader */}
      <Preloader onComplete={() => {}} />

      {/* Floating Pill Navbar */}
      <PublicNavbar />

      {/* Main Showcase Page Content */}
      <main className="relative z-10 flex-1">
        <HeroSection config={activeConfig} />
        <StatementSection />
        <AboutSection />
        <ScheduleHorizontal schedule={activeConfig.schedule} />
        {activeConfig.prizes && activeConfig.prizes.length > 0 && (
          <PrizesSection prizes={activeConfig.prizes} />
        )}
        <GuidelinesSection guidelines={activeConfig.guidelines} />
        <FaqSection faq={activeConfig.faq} />
        <FinalCtaSection
          price={activeConfig.price_per_person}
          dateText={activeConfig.date_text}
          venueName={activeConfig.venue_name}
        />
      </main>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
};
