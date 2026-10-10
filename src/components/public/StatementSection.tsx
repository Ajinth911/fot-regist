import React, { useRef, useEffect, useState } from 'react';

export const StatementSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalDist = windowHeight + rect.height;
      const currentPos = windowHeight - rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentPos / totalDist));
      setProgress(rawProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const statementText =
    "We believe the best technology is built by communities that share ideas openly, push craft to the edge, and support one another. Friends of Tech is where the brightest minds in engineering, design, and product meet in person.";

  const words = statementText.split(' ');

  return (
    <section
      ref={containerRef}
      className="py-32 sm:py-44 px-4 sm:px-6 max-w-5xl mx-auto relative z-10"
    >
      <span className="text-xs font-semibold text-[#8C8C85] tracking-wider block mb-8 uppercase font-mono">
        The Gathering
      </span>

      <p className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.2] tracking-tight">
        {words.map((word, idx) => {
          const wordProgressThreshold = idx / words.length;
          const isHighlighted = progress >= wordProgressThreshold;

          return (
            <span
              key={idx}
              className="inline-block mr-[0.25em] transition-colors duration-300"
              style={{
                color: isHighlighted ? '#0A0A0A' : '#C9C9C2',
              }}
            >
              {word}
            </span>
          );
        })}
      </p>
    </section>
  );
};
