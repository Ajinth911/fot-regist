import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '../../lib/icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full ${maxWidthClass} bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-6 sm:p-8 z-10 shadow-studio my-8`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6 border-b border-[#E6E6DF] pb-4">
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight text-[#0A0A0A]">
                  {title}
                </h3>
                {subtitle && (
                  <p className="font-mono text-xs text-[#8C8C85] mt-1 tracking-wider uppercase font-semibold">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-[#8C8C85] hover:text-[#0A0A0A] p-2 hover:bg-[#F2F2EC] rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
