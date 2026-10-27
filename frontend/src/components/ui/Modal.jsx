import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'drawer'
  isDrawer = false,
  className = '',
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }[size] || 'max-w-xl';

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden">
          {/* Fullscreen Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {isDrawer ? (
            /* Slide-over Drawer */
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title || 'Details panel'}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className={`fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl flex flex-col z-10 ${className}`}
            >
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-black/10 bg-[#FAFAFC] shrink-0">
                <div className="min-w-0 pr-3">
                  {title && (
                    <h3 className="font-display font-bold text-lg sm:text-xl text-[#0B0B0F] truncate">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close panel"
                  className="p-2 rounded-full hover:bg-black/5 text-[#64748B] hover:text-[#0B0B0F] transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
            </motion.div>
          ) : (
            /* Centered Modal */
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title || 'Dialog'}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className={`relative w-full ${sizeClasses} max-h-[min(90vh,calc(100dvh-2.5rem))] flex flex-col bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl border border-black/10 overflow-hidden z-10 my-auto ${className}`}
            >
              <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-black/5 bg-[#FAFAFC] shrink-0">
                <div className="min-w-0 pr-3">
                  {title && (
                    <h3 className="font-display font-bold text-xl md:text-2xl text-[#0B0B0F]">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs md:text-sm text-[#64748B] mt-0.5">{subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-2 rounded-full hover:bg-black/5 text-[#64748B] hover:text-[#0B0B0F] transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 sm:py-6">{children}</div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
