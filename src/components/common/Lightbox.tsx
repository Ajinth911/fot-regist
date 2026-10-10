import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconDownload } from '../../lib/icons';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Payment Proof Verification',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#0A0A0A]/85 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-8"
        >
          {/* Top Bar */}
          <div className="w-full max-w-5xl flex items-center justify-between border-b border-white/20 pb-4">
            <span className="font-mono text-xs text-[#FAFAF7] tracking-wider uppercase font-semibold">
              {title}
            </span>
            <div className="flex items-center gap-3">
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="px-4 py-2 rounded-xl bg-white text-[#0A0A0A] text-xs font-bold inline-flex items-center gap-2 shadow-sm"
              >
                <IconDownload size={14} />
                <span>Download</span>
              </a>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close lightbox"
              >
                <IconX size={20} />
              </button>
            </div>
          </div>

          {/* Image Canvas */}
          <div className="flex-1 w-full max-w-4xl flex items-center justify-center p-4 overflow-hidden">
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              src={imageUrl}
              alt="Proof Full View"
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl bg-white"
            />
          </div>

          {/* Footer note */}
          <div className="w-full text-center border-t border-white/20 pt-4">
            <p className="text-xs text-white/70">
              Click anywhere outside or press ESC to dismiss
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
