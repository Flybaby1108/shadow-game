import React from 'react';
import { motion } from 'framer-motion';
import { gameStore } from '../store/GameState';
import { Play } from 'lucide-react';

export const TitleScreen: React.FC = () => {
  const startJourney = () => {
    gameStore.setChapter(1);
  };

  return (
    <motion.div 
      className="w-full h-full flex flex-col items-center justify-center bg-[#fcfbfa]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5 } }}
    >
      <div className="relative group cursor-pointer" onClick={startJourney}>
        <motion.h1 
          className="text-8xl font-black tracking-tighter text-[#1a1a1a] select-none"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          SHADOW
        </motion.h1>
        
        {/* Animated shadow effect behind the text */}
        <motion.h1 
          className="text-8xl font-black tracking-tighter text-black select-none pointer-events-none absolute top-0 left-0"
          initial={{ x: 0, y: 0, opacity: 0, filter: 'blur(0px)' }}
          animate={{ 
            x: [0, 15, 10, 20, 0], 
            y: [0, 5, 10, 0, 0],
            opacity: [0, 0.2, 0.4, 0.2, 0],
            filter: ['blur(0px)', 'blur(8px)', 'blur(12px)', 'blur(6px)', 'blur(0px)']
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 1 
          }}
          style={{ zIndex: -1 }}
        >
          SHADOW
        </motion.h1>
      </div>

      <motion.p
        className="mt-6 text-[#5a5a5a] font-handwritten text-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1.5 }}
      >
        What are you hungry for?
      </motion.p>

      <motion.button
        className="mt-16 flex items-center gap-2 px-8 py-3 rounded-full border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors duration-300 font-semibold"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.5, duration: 1 }}
        onClick={startJourney}
      >
        <Play size={18} fill="currentColor" />
        START
      </motion.button>
    </motion.div>
  );
};
