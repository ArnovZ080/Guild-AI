import React, { useState } from 'react';

const AchievementCelebration = () => {
  const [show, setShow] = useState(false);
  const [ach, setAch] = useState(null);
  const trigger = (a) => { setAch(a); setShow(true); setTimeout(() => setShow(false), 4000); };
  return (
    <div className="absolute bottom-4 right-4 z-50"><button onClick={() => trigger({icon: '🎉', title: 'Test!'})} className="px-2 py-1 bg-blue-500 text-white rounded-lg text-xs">Trigger Achievement</button>
      {show && ach && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none"><div className="bg-white rounded-2xl p-8 text-center"><div className="text-6xl mb-4">{ach.icon}</div><h2 className="text-2xl font-bold text-gray-800">{ach.title}</h2></div></div>}
    </div>
  );
};
export default AchievementCelebration;
