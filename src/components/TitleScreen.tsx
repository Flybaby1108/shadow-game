import React from 'react';
import { motion } from 'framer-motion';
import { gameStore } from '../store/GameState';

const A = (name: string) => `${import.meta.env.BASE_URL}assets/chapter0/${name}`;

export const TitleScreen: React.FC = () => {
  const startJourney = () => {
    gameStore.setChapter(1);
  };

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden relative">
      
      {/* 16:9 Aspect Ratio Container */}
      <div className="relative w-full max-w-[1920px] aspect-video bg-[#000] shadow-2xl overflow-hidden">
        
        {/* Layer 1: Background Screen */}
        <motion.img 
          src={A('Chapter0_1_StartScreen.jpg')} 
          alt="Start Screen Background" 
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Layer 2: Title */}
        <motion.img 
          src={A('Chapter0_1_Title.png')} 
          alt="Shadow Title" 
          draggable={false}
          className="absolute z-10 select-none pointer-events-none" 
          style={{ 
            width: '71%', 
            top: 'calc(20% - 118.9px)', 
            left: 'calc(30% - 203.8px)' 
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 3, delay: 1, ease: "easeOut" }}
        />

        {/* Layer 3: Start Button */}
        <motion.img 
          src={A('Chapter0_1_StartButton.png')} 
          alt="Start Button" 
          draggable={false}
          className="absolute z-20 cursor-pointer hover:brightness-110 active:scale-95 transition-all select-none" 
          style={{ 
            width: '14%', 
            top: 'calc(65% + 168.0px)', 
            left: 'calc(42.5% + 12.9px)' 
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 4 }}
          onClick={startJourney}
        />

      </div>
    </div>
  );
};
