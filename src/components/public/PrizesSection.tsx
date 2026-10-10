import React from 'react';
import { motion } from 'framer-motion';
import type { PrizeItem } from '../../types';

interface PrizesSectionProps {
  prizes: PrizeItem[];
}

export const PrizesSection: React.FC<PrizesSectionProps> = ({ prizes }) => {
  if (!prizes || prizes.length === 0) return null;

  return (
    <section id="prizes" className="py-28 sm:py-36 px-4 sm:px-6 max-w-7xl mx-auto hairline-t">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4 border-b border-[#E6E6DF] pb-8">
        <div>
          <span className="text-xs font-semibold text-[#8C8C85] uppercase tracking-wider block mb-2 font-mono">
            Recognition
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#0A0A0A]">
            Prizes & Community Grants
          </h2>
        </div>
        <p className="text-sm text-[#55554F] max-w-md">
          Awarded by our panel of mentors and sponsors to the most impactful community projects.
        </p>
      </div>

      {/* Prize Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {prizes.map((prize, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: idx * 0.1 }}
            className="border border-[#E6E6DF] rounded-2xl p-8 flex flex-col justify-between bg-[#FFFFFF] shadow-studio hover:border-[#0A0A0A]/40 transition-colors"
          >
            <div>
              <span className="text-xs font-semibold text-[#8C8C85] uppercase tracking-wider block mb-3 font-mono">
                {prize.rank}
              </span>
              <div className="font-display text-4xl sm:text-5xl font-bold text-[#0A0A0A] mb-4">
                {prize.amount}
              </div>
              <p className="text-sm text-[#55554F] leading-relaxed">
                {prize.description}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E6E6DF] text-xs text-[#8C8C85]">
              Awarded on the day
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
