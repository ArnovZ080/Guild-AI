import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const AchievementCelebration = () => {
  const [show, setShow] = useState(false);
  const [ach, setAch] = useState(null);
  const trigger = (a) => { setAch(a); setShow(true); setTimeout(() => setShow(false), 4000); };
  return (
    <div className="absolute bottom-4 right-4 z-50"><button onClick={() => trigger({icon: '🎉', title: 'Test!'})} className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs">Trigger Achievement</button>
      <AnimatePresence>{show && ach && <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className="bg-white rounded-2xl p-8 text-center" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}><motion.div className="text-6xl mb-4">{ach.icon}</motion.div><motion.h2 className="text-2xl font-bold text-gray-800">{ach.title}</motion.h2></motion.div></motion.div>}</AnimatePresence>
    </div>
  );
};

export default AchievementCelebration;
