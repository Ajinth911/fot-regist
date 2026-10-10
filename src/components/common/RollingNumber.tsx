import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RollingNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const digits = String(displayValue).split('');

  return (
    <div className={`inline-flex items-baseline font-mono tracking-tight ${className}`}>
      {prefix && <span className="mr-1">{prefix}</span>}
      <div className="flex overflow-hidden h-[1.15em] leading-none">
        {digits.map((digit, index) => (
          <div key={`${index}-${digits.length}`} className="relative w-[0.62em] h-[1.15em]">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={`${index}-${digit}`}
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -28, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {digit}
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
      </div>
      {suffix && <span className="ml-1">{suffix}</span>}
    </div>
  );
};
