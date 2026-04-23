import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameStore } from '../store/GameState';

// A simple comic panel component
const Panel: React.FC<{
  children: React.ReactNode;
  delay?: number;
  isActive: boolean;
  onInteract?: () => void;
}> = ({ children, delay = 0, isActive, onInteract }) => {
  return (
    <motion.div
      className={`panel absolute cursor-pointer transition-shadow ${
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

export const Phase1Oppression: React.FC = () => {
  // 0: Morning Routine
  // 1: Commute
  // 2: Cubicle
  // 3: Seeing someone else's success
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      gameStore.setPhase('phase2_desire');
    }
  };



  return (
    <motion.div
      className="w-full h-full relative bg-[#fcfbfa] p-8 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
    >
      <div className="w-full max-w-5xl h-full relative">
        <AnimatePresence>
          {step >= 0 && (
            <div style={{ position: 'absolute', top: '10%', left: '5%' }}>
              <Panel isActive={step === 0} onInteract={nextStep}>
                <div className="w-20 h-20 rounded-full border-4 border-gray-300 flex items-center justify-center text-4xl mb-4">
                  ⏰
                </div>
                <p className="font-handwritten text-xl text-[#5a5a5a]">7:00 AM</p>
                {step === 0 && <p className="text-sm mt-4 text-gray-400 animate-pulse">(Click to wake up)</p>}
              </Panel>
            </div>
          )}

          {step >= 1 && (
            <div style={{ position: 'absolute', top: '5%', left: '45%' }}>
              <Panel delay={0.2} isActive={step === 1} onInteract={nextStep}>
                <div className="w-32 h-20 border-2 border-gray-600 bg-gray-100 flex items-center justify-center text-3xl mb-4 transform -skew-x-12">
                  🚌
                </div>
                <p className="font-handwritten text-xl text-[#5a5a5a]">Gray Commute</p>
              </Panel>
            </div>
          )}

          {step >= 2 && (
            <div style={{ position: 'absolute', top: '50%', left: '20%' }}>
              <Panel delay={0.2} isActive={step === 2} onInteract={nextStep}>
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
                    <p className="font-handwritten text-2xl mb-6 text-center">Look at them...</p>
                    <div className="flex gap-4">
                       <span className="text-4xl filter drop-shadow-md">🚗</span>
                       <span className="text-4xl filter drop-shadow-md">💎</span>
                    </div>
                    <motion.div 
                      className="absolute inset-x-0 bottom-0 h-12 bg-black blur-xl opacity-20"
                      animate={{ height: ['48px', '60px', '48px'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                 </div>
                 {step === 3 && <p className="text-sm mt-4 text-red-400 animate-bounce absolute bottom-4">Shadow stirs...</p>}
              </Panel>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
