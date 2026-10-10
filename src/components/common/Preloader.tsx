import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has already seen the preloader in this session
    const hasSeen = sessionStorage.getItem('fot_preloader_seen');
    if (hasSeen) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('fot_preloader_seen', 'true');
      setTimeout(onComplete, 350);
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
        className="fixed inset-0 z-[9999] bg-[#FAFAF7] flex flex-col items-center justify-center p-6 select-none"
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#0A0A0A]">
              Friends of Tech<span className="text-[#C2E600]">.</span>
            </span>
          </motion.div>

          {/* Minimalist Progress Line */}
          <div className="w-32 h-[2px] bg-[#E6E6DF] rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
              className="w-1/2 h-full bg-[#0A0A0A]"
            />
          </div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-xs text-[#8C8C85] font-medium"
          >
            Presented by GenLab
          </motion.span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
