import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { gameStore } from '../store/GameState';

// A single puzzle piece
const PuzzlePiece: React.FC<{
  id: number;
  initialPos: { x: number; y: number };
  targetPos: { x: number; y: number };
  path: string;
  onSnap: (id: number) => void;
  isSnapped: boolean;
}> = ({ id, initialPos, targetPos, path, onSnap, isSnapped }) => {
  const [pos, setPos] = useState(initialPos);

  const bind = useDrag(({ offset: [x, y], down }) => {
    if (isSnapped) return;
    
    // Check if close to target
    const dist = Math.sqrt(Math.pow(x - targetPos.x, 2) + Math.pow(y - targetPos.y, 2));
    if (!down && dist < 40) {
      setPos(targetPos);
      onSnap(id);
    } else {
      setPos({ x, y });
    }
  }, {
    from: () => [pos.x, pos.y]
  });

  return (
    <motion.path
      d={path}
      {...(bind() as any)}
      animate={{ 
        x: pos.x, 
        y: pos.y, 
        scale: isSnapped ? 1 : 1.05,
        filter: isSnapped ? 'blur(0px)' : 'blur(2px)'
      }}
      transition={isSnapped ? { type: 'spring', stiffness: 300, damping: 20 } : { type: 'tween', duration: 0 }}
      className={`cursor-grab active:cursor-grabbing ${isSnapped ? 'pointer-events-none' : ''}`}
      fill="var(--shadow-color)"
      stroke="none"
    />
  );
};

export const Phase2Desire: React.FC = () => {
  const [snappedPieces, setSnappedPieces] = useState<Set<number>>(new Set());
  const [stage, setStage] = useState(0);

  const handleSnap = (id: number) => {
    setSnappedPieces(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  useEffect(() => {
    // There are 3 pieces.
    if (snappedPieces.size === 3 && stage === 0) {
      setTimeout(() => setStage(1), 1000);
    }
  }, [snappedPieces, stage]);

  useEffect(() => {
    if (stage === 1) {
      // Increase emotional intensity globally to show the strain
      gameStore.setEmotionalIntensity(30);
      gameStore.setShadowDesire('money');
      
      // After a pause, move to phase 3 
      setTimeout(() => {
        gameStore.setPhase('phase3_block');
      }, 4000);
    }
  }, [stage]);

  // SVG paths for a simple car silhouette broken into 3 pieces
  const pieces = [
    { id: 1, initial: { x: -100, y: 150 }, target: { x: 0, y: 0 }, path: "M50,100 L100,60 L200,60 L250,100 Z" }, // Top roof
    { id: 2, initial: { x: 150, y: -100 }, target: { x: 0, y: 0 }, path: "M20,100 L280,100 L280,140 L20,140 Z" },  // Main body
    { id: 3, initial: { x: -50, y: -150 }, target: { x: 0, y: 0 }, path: "M60,140 A20,20 0 1,0 100,140 A20,20 0 1,0 60,140 M200,140 A20,20 0 1,0 240,140 A20,20 0 1,0 200,140" }, // Wheels
  ];

  return (
    <motion.div
      className="w-full h-full relative bg-[#fcfbfa] flex items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 1.5 } }}
    >
      <div className="text-center absolute top-1/4 w-full pointer-events-none">
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.p 
              key="text1"
              className="font-handwritten text-3xl text-[#5a5a5a]"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              The shadow hungers. Piece it together...
            </motion.p>
          )}
          {stage === 1 && (
            <motion.p 
              key="text2"
              className="font-handwritten text-3xl text-red-500"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            >
              IT DRAGS YOU FORWARD
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="relative w-[300px] h-[200px] border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
         {/* Drop zone visual hint */}
         {stage === 0 && (
           <div className="absolute inset-0 opacity-10 flex items-center justify-center">
             <svg width="300" height="200" viewBox="0 0 300 200">
               <path d="M50,100 L100,60 L200,60 L250,100 M20,100 L280,100 L280,140 L20,140 M60,140 A20,20 0 1,0 100,140 A20,20 0 1,0 60,140 M200,140 A20,20 0 1,0 240,140 A20,20 0 1,0 200,140" fill="none" stroke="black" strokeWidth="4" />
             </svg>
           </div>
         )}
         
         <svg width="300" height="200" viewBox="0 0 300 200" style={{ overflow: 'visible' }}>
            {pieces.map(p => (
               <PuzzlePiece 
                 key={p.id}
                 id={p.id}
                 initialPos={p.initial}
                 targetPos={p.target}
                 path={p.path}
                 onSnap={handleSnap}
                 isSnapped={snappedPieces.has(p.id)}
               />
            ))}
         </svg>
      </div>
      
      {/* Visual distortion overlay when stage 1 */}
      {stage === 1 && (
        <motion.div 
          className="absolute inset-0 bg-black pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  );
};
