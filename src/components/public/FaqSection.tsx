import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FaqItem } from '../../types';
import { IconPlus, IconMinus } from '../../lib/icons';

interface FaqSectionProps {
  faq: FaqItem[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faq }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faq || faq.length === 0) return null;

  return (
    <section id="faq" className="py-28 sm:py-36 px-4 sm:px-6 max-w-7xl mx-auto hairline-t">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4 border-b border-[#E6E6DF] pb-8">
        <div>
          <span className="text-xs font-semibold text-[#8C8C85] uppercase tracking-wider block mb-2 font-mono">
            Common questions
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#0A0A0A]">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-sm text-[#55554F] max-w-md">
          Everything you need to know about registering, tickets, team rules, and check-in.
        </p>
      </div>

      <div className="max-w-3xl mx-auto divide-y divide-[#E6E6DF]">
        {faq.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-6">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
              >
                <h3 className="text-lg sm:text-xl font-bold text-[#0A0A0A] group-hover:text-[#55554F] transition-colors">
                  {item.question}
                </h3>
                <span className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#E6E6DF] shadow-sm flex items-center justify-center text-[#0A0A0A] group-hover:border-[#0A0A0A] transition-colors shrink-0">
                  {isOpen ? <IconMinus size={14} /> : <IconPlus size={14} />}
                </span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pt-4 text-base text-[#55554F] leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
