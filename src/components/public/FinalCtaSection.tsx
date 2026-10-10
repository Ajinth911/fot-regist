import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IconArrowRight, IconCalendar, IconMapPin, IconUsers } from '../../lib/icons';

interface FinalCtaSectionProps {
  price?: number;
  dateText?: string;
  venueName?: string;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  price = 99,
  dateText = 'Saturday, October 24, 2026',
  venueName = 'Auditorium 01, Tech Innovation Center',
}) => {
  return (
    <section id="register" className="py-28 sm:py-36 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
      <div className="rounded-3xl bg-[#C2E600] p-10 sm:p-16 lg:p-20 text-center text-[#0A0A0A] shadow-[0_12px_40px_rgba(194,230,0,0.3)] relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="text-xs uppercase tracking-widest text-[#0A0A0A] font-mono font-bold block">
              Registration Open
            </span>

            <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#0A0A0A] leading-tight">
              Reserve your spot.
            </h2>

            <p className="text-[#0A0A0A]/80 text-base sm:text-xl max-w-xl mx-auto leading-relaxed pt-2 font-medium">
              Join hundreds of engineers, designers, and founders for a full day of hands-on collaboration.
            </p>
          </motion.div>

          {/* Black Primary Register CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              data-cursor="Register"
              className="w-full sm:w-auto h-14 px-10 bg-[#0A0A0A] hover:bg-[#222222] text-[#FAFAF7] font-semibold text-lg rounded-xl inline-flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl group"
            >
              <span>Register now</span>
              <span className="text-xs font-mono font-bold bg-[#FFFFFF]/20 text-[#FAFAF7] px-2.5 py-1 rounded">
                ₹{price}
              </span>
              <span className="w-6 h-6 rounded-full bg-[#C2E600] text-[#0A0A0A] flex items-center justify-center transition-transform group-hover:translate-x-1">
                <IconArrowRight size={14} />
              </span>
            </Link>
          </motion.div>

          {/* Quick Meta Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#0A0A0A]/70 font-semibold"
          >
            <div className="flex items-center gap-2 bg-[#0A0A0A]/10 px-3 py-1.5 rounded-full">
              <IconCalendar size={15} className="text-[#0A0A0A]" />
              <span>{dateText}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0A0A0A]/10 px-3 py-1.5 rounded-full">
              <IconMapPin size={15} className="text-[#0A0A0A]" />
              <span>{venueName}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0A0A0A]/10 px-3 py-1.5 rounded-full">
              <IconUsers size={15} className="text-[#0A0A0A]" />
              <span>Solo & 2-Person Teams</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
