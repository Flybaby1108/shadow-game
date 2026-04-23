import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameStore } from '../store/GameState';

interface ShadowObject {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export const Phase3Block: React.FC = () => {
  const [objects, setObjects] = useState<ShadowObject[]>([]);
  const [clickedCount, setClickedCount] = useState(0);
  const [nextId, setNextId] = useState(10);
  const [isCrashed, setIsCrashed] = useState(false);

  // Initialize with a few objects
  useEffect(() => {
    setObjects([
      { id: 1, x: 30, y: 30, scale: 1, rotation: 10 },
      { id: 2, x: 70, y: 60, scale: 1.2, rotation: -15 },
      { id: 3, x: 40, y: 70, scale: 0.8, rotation: 5 },
    ]);
  }, []);

  const handleClick = (id: number) => {
    if (isCrashed) return;
    
    // Play a tiny haptic or visual effect here if needed

    setObjects(prev => {
      // Find the clicked object
      const clicked = prev.find(o => o.id === id);
      if (!clicked) return prev; // should not happen

      // Remove the clicked object
      const remaining = prev.filter(o => o.id !== id);

      // Spawn 2 new objects around the clicked location, but a bit scattered
      const newObjs: ShadowObject[] = [
        {
          id: nextId,
          x: Math.max(5, Math.min(95, clicked.x + (Math.random() * 20 - 10))),
          y: Math.max(5, Math.min(95, clicked.y + (Math.random() * 20 - 10))),
          scale: clicked.scale * 0.9 + Math.random() * 0.3,
          rotation: Math.random() * 360,
        },
        {
          id: nextId + 1,
          x: Math.max(5, Math.min(95, clicked.x + (Math.random() * 30 - 15))),
          y: Math.max(5, Math.min(95, clicked.y + (Math.random() * 30 - 15))),
          scale: clicked.scale * 0.9 + Math.random() * 0.3,
          rotation: Math.random() * 360,
        }
      ];
      setNextId(prevId => prevId + 2);
      
      return [...remaining, ...newObjs];
    });

    setClickedCount(prev => prev + 1);
  };

  useEffect(() => {
    const totalObjects = objects.length;
    // Base intensity is 30 (from phase 2). It scales up to 100 as objects grow.
    // Let's say reaching 40 objects triggers crash
    const intensity = Math.min(100, 30 + (totalObjects * 2));
    gameStore.setEmotionalIntensity(intensity);

    if (totalObjects >= 40 && !isCrashed) {
      setIsCrashed(true);
      // Let it dwell in the mess for 1 sec before breakdown
      setTimeout(() => {
        gameStore.setPhase('phase4_breakdown');
      }, 1500);
    }
  }, [objects.length, isCrashed]);

  return (
    <motion.div
      className="w-full h-full relative overflow-hidden"
      style={{ backgroundColor: `rgba(0, 0, 0, ${isCrashed ? 1 : Math.min(0.7, clickedCount * 0.05)})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 2 } }}
    >
      <AnimatePresence>
        {clickedCount === 0 && (
          <motion.div
            className="absolute top-1/4 w-full text-center pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="font-handwritten text-3xl text-gray-400">Too loud. Erase them.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {objects.map((obj) => (
          <motion.div
            key={obj.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
               opacity: 1, 
               scale: obj.scale, 
               rotate: obj.rotation,
               filter: isCrashed ? 'blur(10px)' : 'blur(0px)'
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className={`absolute cursor-pointer flex items-center justify-center`}
            style={{ 
              left: `${obj.x}%`, 
              top: `${obj.y}%`, 
              width: '60px', 
              height: '60px',
              marginLeft: '-30px', // center pivot
              marginTop: '-30px',  // center pivot
            }}
            onPointerDown={() => handleClick(obj.id)}
          >
            {/* Vague shadow box to represent desires */}
            <div className="w-full h-full bg-black shadow-xl" style={{ borderRadius: obj.id % 3 === 0 ? '50%' : '10%' }} />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Intense red flash text on threshold */}
      <AnimatePresence>
        {isCrashed && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="font-handwritten text-7xl text-red-600 blur-[2px]">TOO MUCH</h1>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
