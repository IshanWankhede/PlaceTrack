import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import SwipeToast from '../components/ui/SwipeToast.jsx';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Award,
} from 'lucide-react';

const ToastContext = createContext(null);

let globalToastHandler = null;

export const triggerGlobalToast = (titleOrOptions, description, type = 'success') => {
  if (globalToastHandler) {
    if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
      return globalToastHandler(titleOrOptions);
    }
    const resolvedType = titleOrOptions?.type || type;
    const msg = typeof titleOrOptions === 'string' ? titleOrOptions : titleOrOptions?.message || titleOrOptions?.title;
    const desc = description || (typeof titleOrOptions === 'object' ? titleOrOptions.description : '');

    if (resolvedType === 'error') {
      return globalToastHandler.error(msg, desc);
    } else if (resolvedType === 'info') {
      return globalToastHandler.info(msg, desc);
    } else if (resolvedType === 'warning') {
      return globalToastHandler.warning(msg, desc);
    } else if (resolvedType === 'placement') {
      return globalToastHandler.placement(msg, desc);
    } else {
      return globalToastHandler.success(msg, desc);
    }
  }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id, reason) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((options = {}) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const newToast = {
      id,
      open: true,
      title: options.title || 'Notification',
      description: options.description || '',
      icon: options.icon,
      actionLabel: options.actionLabel || '',
      onAction: options.onAction,
      background: options.background || '#FFFFFF',
      color: options.color || '#171717',
      borderColor: options.borderColor || '#E5E5E5',
      fuseColor: options.fuseColor || '#111111',
      duration: options.duration !== undefined ? options.duration : 4000,
      fuse: options.fuse || 'bottom',
      pauseOnHover: options.pauseOnHover ?? true,
      closeButton: options.closeButton ?? true,
      dismissible: options.dismissible ?? true,
      width: options.width || 380,
      radius: options.radius || 14,
      slideMs: options.slideMs || 300,
      settleBounce: options.settleBounce || 0.15,
      swipeDistance: options.swipeDistance || 40,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const toast = useCallback(
    (titleOrOptions, maybeDesc) => {
      if (typeof titleOrOptions === 'object') {
        const type = titleOrOptions.type;
        if (type === 'error') return toast.error(titleOrOptions.title, titleOrOptions.description, titleOrOptions);
        if (type === 'info') return toast.info(titleOrOptions.title, titleOrOptions.description, titleOrOptions);
        if (type === 'warning') return toast.warning(titleOrOptions.title, titleOrOptions.description, titleOrOptions);
        if (type === 'placement') return toast.placement(titleOrOptions.title, titleOrOptions.description, titleOrOptions);
        return addToast(titleOrOptions);
      }
      return toast.success(titleOrOptions, maybeDesc);
    },
    [addToast]
  );

  toast.success = useCallback(
    (title, description, opts = {}) => {
      return addToast({
        title,
        description,
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
        background: '#FFFFFF',
        color: '#171717',
        borderColor: '#E5E5E5',
        fuseColor: '#10B981',
        ...opts,
      });
    },
    [addToast]
  );

  toast.info = useCallback(
    (title, description, opts = {}) => {
      return addToast({
        title,
        description,
        icon: <Info className="w-4 h-4 text-[#171717] shrink-0" />,
        background: '#FFFFFF',
        color: '#171717',
        borderColor: '#E5E5E5',
        fuseColor: '#111111',
        ...opts,
      });
    },
    [addToast]
  );

  toast.warning = useCallback(
    (title, description, opts = {}) => {
      return addToast({
        title,
        description,
        icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
        background: '#FFFFFF',
        color: '#171717',
        borderColor: '#E5E5E5',
        fuseColor: '#F59E0B',
        ...opts,
      });
    },
    [addToast]
  );

  toast.error = useCallback(
    (title, description, opts = {}) => {
      return addToast({
        title,
        description,
        icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
        background: '#FFFFFF',
        color: '#171717',
        borderColor: '#FECACA',
        fuseColor: '#F43F5E',
        duration: opts.duration !== undefined ? opts.duration : 5000,
        ...opts,
      });
    },
    [addToast]
  );

  toast.placement = useCallback(
    (title, description, opts = {}) => {
      return addToast({
        title,
        description,
        icon: <Award className="w-4 h-4 text-[#171717] shrink-0" />,
        background: '#FFFFFF',
        color: '#171717',
        borderColor: '#E5E5E5',
        fuseColor: '#111111',
        ...opts,
      });
    },
    [addToast]
  );

  useEffect(() => {
    globalToastHandler = toast;
    return () => {
      globalToastHandler = null;
    };
  }, [toast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Global Toast Stack Container fixed at bottom-right */}
      <div
        className="fixed bottom-5 sm:bottom-6 right-4 sm:right-6 lg:right-8 z-50 flex flex-col items-end gap-2 pointer-events-none select-none max-w-[calc(100vw-2rem)] sm:max-w-sm w-full"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full flex justify-end">
            <SwipeToast
              inline
              open={t.open}
              title={t.title}
              description={t.description}
              icon={t.icon}
              actionLabel={t.actionLabel}
              onAction={t.onAction}
              background={t.background}
              color={t.color}
              borderColor={t.borderColor}
              fuseColor={t.fuseColor}
              duration={t.duration}
              fuse={t.fuse}
              pauseOnHover={t.pauseOnHover}
              closeButton={t.closeButton}
              dismissible={t.dismissible}
              width={t.width}
              radius={t.radius}
              slideMs={t.slideMs}
              settleBounce={t.settleBounce}
              swipeDistance={t.swipeDistance}
              onClose={(reason) => removeToast(t.id, reason)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
