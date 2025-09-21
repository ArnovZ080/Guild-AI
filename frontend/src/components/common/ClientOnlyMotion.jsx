import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ClientOnlyMotion = ({ children, ...props }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // Return a static version during SSR
    return <div {...props}>{children}</div>;
  }

  return <motion.div {...props}>{children}</motion.div>;
};

export default ClientOnlyMotion;
