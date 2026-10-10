import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ScheduleItem } from '../../types';

interface ScheduleHorizontalProps {
  schedule: ScheduleItem[];
}

const TiltCard: React.FC<{ item: ScheduleItem; index: number }> = ({ item, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = -(y / (rect.height / 2)) * 6;
    const rotateY = (x / (rect.width / 2)) * 6;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{ transform, transition: 'transform 0.15s ease-out' }}
      className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] hover:border-[#0A0A0A]/40 flex flex-col justify-between min-w-[300px] sm:min-w-[360px] h-[340px] transition-colors group shadow-studio relative select-none"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-6">
          <span className="font-mono text-sm font-bold text-[#0A0A0A] tracking-tight bg-[#F2F2EC] px-3 py-1 rounded-full">
            {item.time}
          </span>
          {item.tag && (
            <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-[#FAFAF7] border border-[#E6E6DF] text-[#55554F]">
              {item.tag}
            </span>
          )}
        </div>

        <h3 className="font-display text-2xl font-bold text-[#0A0A0A] leading-snug group-hover:text-[#0A0A0A] mb-3">
          {item.title}
        </h3>

        <p className="text-sm text-[#55554F] leading-relaxed line-clamp-4">
          {item.description}
        </p>
      </div>

      <div className="pt-4 border-t border-[#E6E6DF] text-xs text-[#8C8C85] flex items-center justify-between">
        <span>Session {index + 1}</span>
        <span className="text-[#0A0A0A] font-semibold group-hover:translate-x-1 transition-transform">&rarr;</span>
      </div>
    </motion.div>
  );
};

export const ScheduleHorizontal: React.FC<ScheduleHorizontalProps> = ({ schedule }) => {
  if (!schedule || schedule.length === 0) return null;

  return (
    <section id="schedule" className="py-28 sm:py-36 px-4 sm:px-6 max-w-7xl mx-auto relative z-10 hairline-t">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4 border-b border-[#E6E6DF] pb-8">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8C8C85] font-mono block mb-2">
            Schedule & Track
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#0A0A0A] tracking-tight">
            What's happening on the day
          </h2>
        </div>
        <p className="text-sm text-[#55554F] max-w-md leading-relaxed">
          From keynote architectural deep-dives to live collaborative hacking sessions.
        </p>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="overflow-x-auto pb-6 scrollbar-none flex gap-6 snap-x snap-mandatory">
        {schedule.map((item, idx) => (
          <div key={idx} className="snap-start shrink-0">
            <TiltCard item={item} index={idx} />
          </div>
        ))}
      </div>
    </section>
  );
};
