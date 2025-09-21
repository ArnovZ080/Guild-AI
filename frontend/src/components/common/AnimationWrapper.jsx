import React from 'react';

// Animation variants that mimic Framer Motion's behavior
const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

// CSS transition styles
const transitionStyles = {
  default: 'transition-all duration-300 ease-out',
  hover: 'hover:scale-105 transition-transform duration-200',
  tap: 'active:scale-95 transition-transform duration-100'
};

// Main motion component replacement using pure CSS transitions
export const motion = {
  div: React.forwardRef(({ 
    initial, 
    animate, 
    exit, 
    transition, 
    whileHover, 
    whileTap, 
    style, 
    className,
    children,
    onClick,
    ...props 
  }, ref) => {
    const combinedClassName = [
      className,
      transitionStyles.default,
      whileHover ? transitionStyles.hover : '',
      whileTap ? transitionStyles.tap : ''
    ].filter(Boolean).join(' ');

    const combinedStyle = {
      opacity: animate?.opacity ?? 1,
      transform: animate?.transform ?? 'translateY(0px)',
      ...style
    };

    return (
      <div
        ref={ref}
        style={combinedStyle}
        className={combinedClassName}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }),

  span: React.forwardRef(({ 
    initial, 
    animate, 
    exit, 
    transition, 
    whileHover, 
    whileTap, 
    style, 
    className,
    children,
    onClick,
    ...props 
  }, ref) => {
    const combinedClassName = [
      className,
      transitionStyles.default,
      whileHover ? transitionStyles.hover : '',
      whileTap ? transitionStyles.tap : ''
    ].filter(Boolean).join(' ');

    const combinedStyle = {
      opacity: animate?.opacity ?? 1,
      transform: animate?.transform ?? 'translateY(0px)',
      ...style
    };

    return (
      <span
        ref={ref}
        style={combinedStyle}
        className={combinedClassName}
        onClick={onClick}
        {...props}
      >
        {children}
      </span>
    );
  }),

  button: React.forwardRef(({ 
    initial, 
    animate, 
    exit, 
    transition, 
    whileHover, 
    whileTap, 
    style, 
    className,
    children,
    onClick,
    ...props 
  }, ref) => {
    const combinedClassName = [
      className,
      transitionStyles.default,
      whileHover ? transitionStyles.hover : '',
      whileTap ? transitionStyles.tap : ''
    ].filter(Boolean).join(' ');

    const combinedStyle = {
      opacity: animate?.opacity ?? 1,
      transform: animate?.transform ?? 'translateY(0px)',
      ...style
    };

    return (
      <button
        ref={ref}
        style={combinedStyle}
        className={combinedClassName}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }),

  section: React.forwardRef(({ 
    initial, 
    animate, 
    exit, 
    transition, 
    whileHover, 
    whileTap, 
    style, 
    className,
    children,
    onClick,
    ...props 
  }, ref) => {
    const combinedClassName = [
      className,
      transitionStyles.default,
      whileHover ? transitionStyles.hover : '',
      whileTap ? transitionStyles.tap : ''
    ].filter(Boolean).join(' ');

    const combinedStyle = {
      opacity: animate?.opacity ?? 1,
      transform: animate?.transform ?? 'translateY(0px)',
      ...style
    };

    return (
      <section
        ref={ref}
        style={combinedStyle}
        className={combinedClassName}
        onClick={onClick}
        {...props}
      >
        {children}
      </section>
    );
  }),

  article: React.forwardRef(({ 
    initial, 
    animate, 
    exit, 
    transition, 
    whileHover, 
    whileTap, 
    style, 
    className,
    children,
    onClick,
    ...props 
  }, ref) => {
    const combinedClassName = [
      className,
      transitionStyles.default,
      whileHover ? transitionStyles.hover : '',
      whileTap ? transitionStyles.tap : ''
    ].filter(Boolean).join(' ');

    const combinedStyle = {
      opacity: animate?.opacity ?? 1,
      transform: animate?.transform ?? 'translateY(0px)',
      ...style
    };

    return (
      <article
        ref={ref}
        style={combinedStyle}
        className={combinedClassName}
        onClick={onClick}
        {...props}
      >
        {children}
      </article>
    );
  })
};

// AnimatePresence replacement
export const AnimatePresence = ({ children, mode }) => {
  return <>{children}</>;
};

// Export everything as a single object to match Framer Motion's API
export default {
  motion,
  AnimatePresence,
  variants
};
