import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameStore } from '../../store/GameState';
import { Scene1WakeUp } from './Scene1WakeUp';

const A = (name: string) => `${import.meta.env.BASE_URL}assets/chapter0/${name}`;

// A simple comic panel component matching our established style
const Panel: React.FC<{
  children: React.ReactNode;
  delay?: number;
  isActive: boolean;
  onInteract?: () => void;
}> = ({ children, delay = 0, isActive, onInteract }) => {
  return (
    <motion.div
      className={`absolute cursor-pointer transition-shadow rounded overflow-hidden bg-white border-2 border-[#1a1a1a] ${
        isActive ? 'shadow-[8px_8px_0px_rgba(0,0,0,0.2)] scale-[1.02]' : 'shadow-sm opacity-50'
      }`}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0.5, scale: isActive ? 1.02 : 1, y: 0 }}
      transition={{ delay: isActive ? 0 : delay, duration: 0.5, type: 'spring' }}
      onClick={isActive ? onInteract : undefined}
      style={{
        width: '300px',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {children}
    </motion.div>
  );
};

export const Chapter1: React.FC = () => {
  const [isPlayingIntro, setIsPlayingIntro] = useState(true);
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // End of Chapter 1 -> Transition to Chapter 2
      gameStore.setChapter(2);
    }
  };

  return (
    <motion.div
      className="w-full h-full relative bg-black" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1.5 } }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <AnimatePresence mode="wait">
        
        {/* Opening Credits Video Layer */}
        {isPlayingIntro && (
          <motion.div
            key="opening-credits"
            className="w-full h-full absolute inset-0 z-50 flex items-center justify-center bg-black"
            exit={{ opacity: 0, transition: { duration: 1 } }}
          >
            <video
              src={A('Chapter0_2_OpeningCredits.mp4')}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              onEnded={() => setIsPlayingIntro(false)}
            />
          </motion.div>
        )}

        {/* Scene 1: Wake Up */}
        {!isPlayingIntro && step === 0 && (
          <motion.div 
            key="scene-1" 
            className="w-full h-full absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
          >
            <Scene1WakeUp onComplete={nextStep} />
          </motion.div>
        )}
        
        {/* Scene 2+: Narrative Panels */}
        {!isPlayingIntro && step > 0 && (
          <motion.div 
            key="scene-2-plus"
            className="w-full h-full relative p-8 flex items-center justify-center overflow-hidden bg-[#fcfbfa]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
          >
            <div className="w-full max-w-5xl h-full relative">
              <AnimatePresence>
                {step >= 1 && (
                  <div style={{ position: 'absolute', top: '5%', left: '45%' }}>
                    <Panel delay={0} isActive={step === 1} onInteract={nextStep}>
                      <p className="text-gray-400 text-sm mb-4">c1_subway.png placeholder</p>
                      <div className="w-32 h-20 border-2 border-gray-600 bg-gray-100 flex items-center justify-center text-3xl mb-4 transform -skew-x-12">
                        🚌
                      </div>
                      <p className="font-handwritten text-xl text-[#5a5a5a]">Machine Rhythm</p>
                    </Panel>
                  </div>
                )}

                {step >= 2 && (
                  <div style={{ position: 'absolute', top: '50%', left: '20%' }}>
                    <Panel delay={0.2} isActive={step === 2} onInteract={nextStep}>
                      <p className="text-gray-400 text-sm mb-4">c1_office.png placeholder</p>
                      <div className="w-24 h-24 border-2 border-dashed border-gray-400 flex items-center justify-center text-2xl mb-4 relative">
                        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-gray-300"></div>
                        💻
                      </div>
                      <p className="font-handwritten text-xl text-[#5a5a5a]">9 to 5</p>
                    </Panel>
                  </div>
                )}

                {step >= 3 && (
                  <div style={{ position: 'absolute', top: '40%', left: '60%' }}>
                    <Panel delay={0.2} isActive={step === 3} onInteract={nextStep}>
                      <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-4">
                        <p className="text-gray-400 text-sm mb-4">c1_leaf.png placeholder</p>
                        <p className="font-handwritten text-xl mb-6 text-center text-[#5a5a5a]">A brief pause...</p>
                        <motion.div 
                          className="text-4xl"
                          animate={{ y: [0, 20], opacity: [1, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          🍂
                        </motion.div>
                      </div>
                      {step === 3 && <p className="text-sm mt-4 text-gray-400 animate-pulse absolute bottom-4">Click to end Chapter</p>}
                    </Panel>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
