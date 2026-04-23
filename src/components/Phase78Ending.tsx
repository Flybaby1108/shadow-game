import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';

export const Phase78Ending: React.FC = () => {
  const [posX, setPosX] = useState(0);
  const [isDone, setIsDone] = useState(false);

  // Drag the protagonist forward. Max distance = 400.
  const bind = useDrag(({ offset: [x] }) => {
    if (isDone) return;
    
    // Constrain x between 0 and 400
    const boundedX = Math.max(0, Math.min(x, 400));
    setPosX(boundedX);

    if (boundedX >= 390) {
      setIsDone(true);
    }
  }, {
    from: () => [posX, 0],
    bounds: { left: 0, right: 400, top: 0, bottom: 0 },
    rubberband: false,
  });

  // Calculate shadow weight based on progress (0 to 1)
  const progress = posX / 400;
  
  // Shadow scales down from 3 to 1
  const shadowScale = 3 - (progress * 2);
  // Shadow moves closer to feet from -100 to 0
  const shadowOffset = -100 * (1 - progress);
  // Shadow blur goes from 8px to 0px
  const shadowBlur = 8 * (1 - progress);

  return (
    <motion.div
      className="w-full h-full relative bg-[#fcfbfa] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 3 } }}
    >
      <AnimatePresence>
        {!isDone && (
          <motion.div 
            className="absolute top-1/4 text-center pointer-events-none w-full"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 - progress }} // fades out as they walk
            exit={{ opacity: 0 }}
          >
            <p className="font-handwritten text-gray-500 text-3xl">
              Walk forward.<br/>Without the weight.
            </p>
            <p className="text-gray-400 mt-4 text-sm animate-pulse">&gt;&gt; Drag the circle right</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center">
        {/* Track / Floor line */}
        <div className="absolute top-[60%] w-full h-[2px] bg-gray-200" />

        {/* The protagonist and shadow */}
        <motion.div 
          className="absolute top-[60%] left-0 w-16 h-16 ml-[20%] -mt-16 z-20 cursor-grab active:cursor-grabbing"
          style={{ x: posX }}
          {...(bind() as any)}
        >
          {/* Shadow Behind */}
          <motion.div 
            className="absolute bottom-0 w-full h-4 bg-black rounded-[50%]"
            style={{
               scaleX: shadowScale,
               scaleY: shadowScale * 0.5,
               y: 8,
               x: shadowOffset,
               filter: `blur(${shadowBlur}px)`,
               opacity: 0.5 + (0.5 * progress) // gets darker/solid as it shrinks
            }}
          />
          
          {/* Protagonist (simple circle/head for now) */}
          <div className="w-12 h-12 bg-[#1a1a1a] rounded-full border-4 border-[#fcfbfa] shadow-sm relative z-10 top-4 left-2" />
        </motion.div>
      </div>

      {/* Final Fade and Credits */}
      <AnimatePresence>
        {isDone && (
          <motion.div 
            className="absolute inset-0 bg-[#fcfbfa] flex flex-col items-center justify-center z-50 text-[#1a1a1a]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3 }}
          >
            <motion.h1 
              className="text-6xl font-black tracking-widest mb-12 uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 2 }}
            >
              See You Tomorrow
            </motion.h1>
            <motion.p 
               className="font-handwritten text-gray-500 text-2xl"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 4, duration: 2 }}
            >
               Thank you for playing.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
