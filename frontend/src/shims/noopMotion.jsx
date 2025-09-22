import React from 'react';

export const AnimatePresence = ({ children }) => <>{children}</>;

function makeNoop(tag) {
  const Comp = React.forwardRef(({ children, ...rest }, ref) => (
    React.createElement(tag || 'div', { ref, ...rest }, children)
  ));
  Comp.displayName = 'NoopMotion';
  return Comp;
}

export const motion = new Proxy({}, {
  get: (_, prop) => makeNoop(prop),
});

export default { AnimatePresence, motion };


