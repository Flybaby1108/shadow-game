import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameStore } from '../store/GameState';

export const Phase4Breakdown: React.FC = () => {
  const [stage, setStage] = useState(0); // 0: pure black, 1: text appears, 2: dot appears

  useEffect(() => {
    // Drop the emotional intensity back down over time simulating collapse/exhaustion
    let intensity = 100;
    const interval = setInterval(() => {
      intensity = Math.max(0, intensity - 2);
      gameStore.setEmotionalIntensity(intensity);
      if (intensity <= 0) {
        clearInterval(interval);
      }
    }, 50);

    setTimeout(() => setStage(1), 3000);
    setTimeout(() => setStage(2), 6000);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = () => {
    gameStore.setPhase('phase5_stillness');
  };

  return (
    <motion.div
      className="w-full h-full relative bg-black flex flex-col items-center justify-center p-8 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 2 } }}
    >
      <AnimatePresence>
        {stage === 1 && (
          <motion.div
            key="text1"
            className="absolute top-1/3"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 0.5, filter: 'blur(0px)' }}
            exit={{ opacity: 0, transition: { duration: 2 } }}
          >
            <p className="font-handwritten text-2xl tracking-widest text-center leading-loose">
              Is this...<br/>
              what I wanted?
            </p>
          </motion.div>
        )}

        {stage >= 2 && (
          <motion.div
            key="dot"
            className="absolute w-4 h-4 rounded-full bg-white cursor-pointer shadow-[0_0_15px_rgba(255,255,255,1)]"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: [1, 1.2, 1] }}
            transition={{ 
              opacity: { duration: 2 },
              scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
            }}
            whileHover={{ scale: 2 }}
            onClick={handleDotClick}
          />
        )}
        
        {stage >= 2 && (
          <motion.p
            className="absolute bottom-1/4 text-xs text-gray-600 animate-pulse pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 3 } }}
          >
            Touch the light
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
