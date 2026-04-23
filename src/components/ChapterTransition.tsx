import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHAPTERS } from '../config/ChapterConfig';

interface Props {
  chapterId: number;
  onTransitionComplete: () => void;
}

export const ChapterTransition: React.FC<Props> = ({ chapterId, onTransitionComplete }) => {
  const [stage, setStage] = useState<'black' | 'text' | 'fadeout'>('black');
  
  const chapter = CHAPTERS.find(c => c.id === chapterId);

  useEffect(() => {
    if (!chapter) {
      onTransitionComplete(); // Skip if no chapter text (e.g. going to title)
      return;
    }

    // Sequence: 
    // 0s-1s: Pure black screen
    // 1s-4s: Text fades in, stays, fades out
    // 4s-5s: Black screen fades to next gameplay
    
    setTimeout(() => setStage('text'), 1000);
    setTimeout(() => setStage('fadeout'), 4000);
    setTimeout(() => onTransitionComplete(), 5000);
  }, [chapter, onTransitionComplete]);

  if (!chapter) return null;

  return (
    <motion.div
      className="absolute inset-0 z-50 bg-black flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: stage === 'fadeout' ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <AnimatePresence>
        {stage === 'text' && (
          <motion.div
            className="flex flex-col items-center justify-center text-[#fcfbfa]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1.5 }}
          >
            <p className="text-xl font-handwritten tracking-[0.3em] mb-4 opacity-70">
              CHAPTER {chapter.id}
            </p>
            <h1 className="text-5xl font-black tracking-widest mb-4">
              {chapter.title}
            </h1>
            <p className="font-handwritten text-xl opacity-50 tracking-widest">
              {chapter.engTitle}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
