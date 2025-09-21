import React from 'react';
import { useSpring, animated, config } from 'react-spring';

// Animation variants that mimic Framer Motion's behavior
const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

// Main motion component replacement
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
    const [springProps, api] = useSpring(() => ({
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0px)' },
      config: config.default
    }));

    const handleMouseEnter = () => {
      if (whileHover) {
        api.start({ transform: 'scale(1.05)' });
      }
    };

    const handleMouseLeave = () => {
      if (whileHover) {
        api.start({ transform: 'scale(1)' });
      }
    };

    const handleMouseDown = () => {
      if (whileTap) {
        api.start({ transform: 'scale(0.95)' });
      }
    };

    const handleMouseUp = () => {
      if (whileTap) {
        api.start({ transform: 'scale(1)' });
      }
    };

    return (
      <animated.div
        ref={ref}
        style={{ ...springProps, ...style }}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={onClick}
        {...props}
      >
        {children}
      </animated.div>
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
    const [springProps, api] = useSpring(() => ({
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0px)' },
      config: config.default
    }));

    return (
      <animated.span
        ref={ref}
        style={{ ...springProps, ...style }}
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </animated.span>
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
    const [springProps, api] = useSpring(() => ({
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0px)' },
      config: config.default
    }));

    const handleMouseEnter = () => {
      if (whileHover) {
        api.start({ transform: 'scale(1.05)' });
      }
    };

    const handleMouseLeave = () => {
      if (whileHover) {
        api.start({ transform: 'scale(1)' });
      }
    };

    const handleMouseDown = () => {
      if (whileTap) {
        api.start({ transform: 'scale(0.95)' });
      }
    };

    const handleMouseUp = () => {
      if (whileTap) {
        api.start({ transform: 'scale(1)' });
      }
    };

    return (
      <animated.button
        ref={ref}
        style={{ ...springProps, ...style }}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={onClick}
        {...props}
      >
        {children}
      </animated.button>
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
    const [springProps, api] = useSpring(() => ({
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0px)' },
      config: config.default
    }));

    return (
      <animated.section
        ref={ref}
        style={{ ...springProps, ...style }}
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </animated.section>
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
    const [springProps, api] = useSpring(() => ({
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0px)' },
      config: config.default
    }));

    return (
      <animated.article
        ref={ref}
        style={{ ...springProps, ...style }}
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </animated.article>
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
