import React from 'react';
import { motion } from 'framer-motion';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-28 sm:py-36 px-4 sm:px-6 max-w-7xl mx-auto hairline-t">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-5 space-y-4">
          <span className="text-xs font-semibold text-[#8C8C85] uppercase tracking-wider block font-mono">
            About the event
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#0A0A0A] leading-tight">
            Built by engineers, <br />
            for the tech community.
          </h2>
        </div>

        <div className="lg:col-span-7 space-y-8 text-[#55554F] text-base sm:text-lg leading-relaxed">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Friends of Tech is where India's developers, product makers, and technology leaders step away from routine sprints to build, learn, and collaborate in person.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Whether you are joining solo to meet fellow builders or teaming up with a friend for the sprint track, FOT is structured to give you practical takeaways, real peer feedback, and memorable connections.
          </motion.p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 text-[#0A0A0A] border-t border-[#E6E6DF]">
            <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-card-subtle">
              <span className="font-display text-3xl font-bold text-[#0A0A0A] block">1 Day</span>
              <span className="text-xs text-[#8C8C85] mt-1 block">Full schedule</span>
            </div>
            <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-card-subtle">
              <span className="font-display text-3xl font-bold text-[#0A0A0A] block">200+</span>
              <span className="text-xs text-[#8C8C85] mt-1 block">Active builders</span>
            </div>
            <div className="p-6 bg-[#FFFFFF] rounded-2xl border border-[#E6E6DF] shadow-card-subtle">
              <span className="font-display text-3xl font-bold text-[#0A0A0A] block">1:1</span>
              <span className="text-xs text-[#8C8C85] mt-1 block">Peer feedback</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
