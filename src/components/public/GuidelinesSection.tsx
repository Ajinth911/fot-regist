import React from 'react';
import { motion } from 'framer-motion';

interface GuidelinesSectionProps {
  guidelines: string[];
}

export const GuidelinesSection: React.FC<GuidelinesSectionProps> = ({ guidelines }) => {
  if (!guidelines || guidelines.length === 0) return null;

  return (
    <section id="guidelines" className="py-28 sm:py-36 px-4 sm:px-6 max-w-7xl mx-auto hairline-t">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4 border-b border-[#E6E6DF] pb-8">
        <div>
          <span className="text-xs font-semibold text-[#8C8C85] uppercase tracking-wider block mb-2 font-mono">
            Important Information
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#0A0A0A]">
            Know before you come
          </h2>
        </div>
        <p className="text-sm text-[#55554F] max-w-md">
          A few simple guidelines to make sure everyone has an enjoyable and productive experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guidelines.map((rule, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: idx * 0.08 }}
            className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] flex items-start gap-4 shadow-card-subtle hover:border-[#0A0A0A]/30 transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-[#F2F2EC] border border-[#E6E6DF] text-xs font-mono font-bold text-[#0A0A0A] flex items-center justify-center shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <p className="text-[#0A0A0A] text-base font-normal leading-relaxed">
              {rule}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
