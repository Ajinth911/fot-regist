import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { EventConfig } from '../../types';
import { IconArrowRight, IconCalendar, IconMapPin, IconClock } from '../../lib/icons';
import { StudioSculpture3D } from '../3d/StudioSculpture3D';

interface HeroSectionProps {
  config: EventConfig;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config }) => {
  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between pt-32 sm:pt-40 pb-16 px-4 sm:px-6 max-w-7xl mx-auto z-10 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center flex-1">
        {/* Left Content (7 columns) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Label Chip */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E6E6DF] text-xs font-medium text-[#55554F] shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#C2E600]" />
            <span>Official Community Gathering · 2026</span>
          </motion.div>

          {/* Main Headline with Lime Highlighter Bar */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#0A0A0A] leading-[0.98]"
            >
              Where builders <span className="lime-highlight">meet.</span>
            </motion.h1>
          </div>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-[#55554F] max-w-xl leading-relaxed font-normal"
          >
            {config.description ||
              'A full day of hands-on building, keynote talks, team sprints, and honest conversations with India’s best tech community.'}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-5 pt-2"
          >
            <Link
              to="/register"
              data-cursor="Register"
              className="h-14 px-8 bg-[#C2E600] hover:bg-[#b5db00] text-[#0A0A0A] font-semibold text-base rounded-xl inline-flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(194,230,0,0.35)] group"
            >
              <span>Register now</span>
              <span className="text-xs font-mono font-bold bg-[#0A0A0A]/10 px-2 py-0.5 rounded">
                ₹{config.price_per_person || 99}
              </span>
              <span className="w-6 h-6 rounded-full bg-[#0A0A0A] text-[#FAFAF7] flex items-center justify-center transition-transform group-hover:translate-x-1">
                <IconArrowRight size={13} />
              </span>
            </Link>

            <button
              onClick={scrollToAbout}
              className="text-sm font-medium text-[#55554F] hover:text-[#0A0A0A] transition-colors inline-flex items-center gap-1.5 py-3 px-2 cursor-pointer"
            >
              <span>See what's on</span>
              <span>&darr;</span>
            </button>
          </motion.div>
        </div>

        {/* Right 3D Studio Sculpture (5 columns) */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="w-full h-full min-h-[380px] sm:min-h-[440px] flex items-center justify-center"
          >
            <StudioSculpture3D />
          </motion.div>
        </div>
      </div>

      {/* Facts Metadata Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-16 pt-8 border-t border-[#E6E6DF] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#8C8C85]"
      >
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-card-subtle">
          <IconCalendar size={18} className="text-[#0A0A0A] shrink-0 mt-0.5" />
          <div>
            <span className="text-[#8C8C85] block font-medium">Date</span>
            <span className="text-sm font-semibold text-[#0A0A0A]">{config.date_text}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-card-subtle">
          <IconClock size={18} className="text-[#0A0A0A] shrink-0 mt-0.5" />
          <div>
            <span className="text-[#8C8C85] block font-medium">Hours</span>
            <span className="text-sm font-semibold text-[#0A0A0A]">{config.time_text}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] shadow-card-subtle">
          <IconMapPin size={18} className="text-[#0A0A0A] shrink-0 mt-0.5" />
          <div>
            <span className="text-[#8C8C85] block font-medium">Location</span>
            <span className="text-sm font-semibold text-[#0A0A0A] line-clamp-1">{config.venue_name}</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
