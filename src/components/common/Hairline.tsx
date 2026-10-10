import React from 'react';
import { motion } from 'framer-motion';

interface HairlineProps {
  className?: string;
  vertical?: boolean;
}

export const Hairline: React.FC<HairlineProps> = ({ className = '', vertical = false }) => {
  if (vertical) {
    return (
      <motion.div
        initial={{ scaleY: 0, transformOrigin: 'top' }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`w-[1px] bg-fot-hairline ${className}`}
      />
    );
  }

  return (
    <motion.div
      initial={{ scaleX: 0, transformOrigin: 'left' }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`h-[1px] w-full bg-fot-hairline ${className}`}
    />
  );
};
