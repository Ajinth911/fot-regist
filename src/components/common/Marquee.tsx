import React from 'react';

interface MarqueeProps {
  items?: string[];
  reverse?: boolean;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  items = [
    'EXCLUSIVE ENTRY',
    'FOT 2026',
    'CYBERNETIC SPEED',
    'AUTHENTIC PASSES',
    'TEAM BATTLES',
    'INSTANT ON-CHAIN QR',
    'ZERO COMPROMISE',
  ],
  reverse = false,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-hidden whitespace-nowrap hairline-t hairline-b py-3 bg-fot-black relative select-none ${className}`}>
      <div className={`flex w-max ${reverse ? 'animate-[marquee-reverse_30s_linear_infinite]' : 'animate-[marquee_30s_linear_infinite]'}`}>
        {[...Array(4)].map((_, loopIdx) => (
          <div key={loopIdx} className="flex items-center gap-8 shrink-0 px-4">
            {items.map((item, idx) => (
              <React.Fragment key={`${loopIdx}-${idx}`}>
                <span
                  data-cursor="FOT"
                  className="marquee-stroked font-display font-bold text-3xl md:text-5xl uppercase tracking-tighter cursor-pointer"
                >
                  {item}
                </span>
                <span className="w-2 h-2 bg-fot-lime shrink-0" />
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
