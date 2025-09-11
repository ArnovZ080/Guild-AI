import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Info, Lightbulb, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils';

export const ContextualOverlay = ({
  isOpen,
  onClose,
  title,
  content,
  type = 'info',
  position = 'right',
  trigger,
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getTypeConfig = () => {
    const configs = {
      info: {
        icon: Info,
        colors: 'from-blue-500/10 to-cyan-500/10 border-blue-200/50',
        iconColor: 'text-blue-600',
        titleColor: 'text-blue-900 dark:text-blue-100'
      },
      insight: {
        icon: Lightbulb,
        colors: 'from-yellow-500/10 to-amber-500/10 border-yellow-200/50',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-900 dark:text-yellow-100'
      },
      warning: {
        icon: AlertTriangle,
        colors: 'from-orange-500/10 to-red-500/10 border-orange-200/50',
        iconColor: 'text-orange-600',
        titleColor: 'text-orange-900 dark:text-orange-100'
      }
    };
    return configs[type] || configs.info;
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-0 top-0 h-full';
      case 'right':
        return 'right-0 top-0 h-full';
      case 'top':
        return 'top-0 left-0 w-full';
      case 'bottom':
        return 'bottom-0 left-0 w-full';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'right-0 top-0 h-full';
    }
  };

  const getAnimationVariants = () => {
    const variants = {
      left: {
        initial: { x: '-100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '-100%', opacity: 0 }
      },
      right: {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '100%', opacity: 0 }
      },
      top: {
        initial: { y: '-100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-100%', opacity: 0 }
      },
      bottom: {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 }
      },
      center: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 }
      }
    };
    return variants[position] || variants.right;
  };

  const typeConfig = getTypeConfig();
  const TypeIcon = typeConfig.icon;
  const animationVariants = getAnimationVariants();

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Overlay Content */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              "fixed z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl",
              position === 'center' ? 'rounded-2xl max-w-md w-full mx-4' : '',
              position === 'left' || position === 'right' ? 'w-96 max-w-[90vw]' : '',
              position === 'top' || position === 'bottom' ? 'h-64 max-h-[90vh]' : '',
              getPositionClasses()
            )}
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className={cn(
                "flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-slate-700/50",
                "bg-gradient-to-r", typeConfig.colors
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg bg-white/50 dark:bg-slate-800/50 flex items-center justify-center",
                    typeConfig.iconColor
                  )}>
                    <TypeIcon className="w-4 h-4" />
                  </div>
                  <h3 className={cn("font-semibold", typeConfig.titleColor)}>
                    {title}
                  </h3>
                </div>
                <motion.button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                {content && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {typeof content === 'string' ? (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {content}
                      </p>
                    ) : (
                      content
                    )}
                  </div>
                )}
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hook for managing contextual overlays
export const useContextualOverlay = () => {
  const [overlays, setOverlays] = useState([]);

  const showOverlay = (overlayConfig) => {
    const id = Date.now().toString();
    setOverlays(prev => [...prev, { ...overlayConfig, id }]);
    return id;
  };

  const hideOverlay = (id) => {
    setOverlays(prev => prev.filter(overlay => overlay.id !== id));
  };

  const hideAllOverlays = () => {
    setOverlays([]);
  };

  return {
    overlays,
    showOverlay,
    hideOverlay,
    hideAllOverlays
  };
};

// Progressive Disclosure Component
export const ProgressiveDisclosure = ({
  trigger,
  content,
  title,
  type = 'info',
  position = 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        onClick={() => setIsOpen(true)}
        className="cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {trigger}
      </motion.div>

      <ContextualOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        content={content}
        type={type}
        position={position}
      />
    </>
  );
};

// Smart Tooltip with contextual information
export const SmartTooltip = ({ children, content, delay = 500 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium shadow-lg max-w-xs">
              {content}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
