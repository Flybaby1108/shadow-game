import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameStore } from '../store/GameState';

export const Phase5Stillness: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWipedEnough, setIsWipedEnough] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  // Track pointer
  const isPointerDown = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const container = containerRef.current;
    if (!canvas || !ctx || !container) return;

    // Make canvas fill container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with "fog"
    ctx.fillStyle = '#dbdbd5'; // fog color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some noise or blur text if we wanted, but solid color is fine for now

    // Prepare for erasing
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 60; // Brush size
    ctx.globalCompositeOperation = 'destination-out';
  }, []);

  const getPos = (e: React.PointerEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDown.current = true;
    lastPos.current = getPos(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current) return;
    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
    if (!ctx || !lastPos.current) return;

    const currentPos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastPos.current = currentPos;

    // Random sampling to check if wiped enough
    if (Math.random() < 0.05 && !isWipedEnough) {
      checkWipedArea();
    }
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
    lastPos.current = null;
    checkWipedArea(); // Final check on release
  };

  const checkWipedArea = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    // Check a sparse grid of pixels
    let total = 0;
    let transparent = 0;
    const width = canvas.width;
    const height = canvas.height;
    
    // Sample every 20 pixels
    const imageData = ctx.getImageData(0, 0, width, height).data;
    for (let y = 0; y < height; y += 20) {
      for (let x = 0; x < width; x += 20) {
        total++;
        const alpha = imageData[(y * width + x) * 4 + 3];
        if (alpha < 10) transparent++;
      }
    }

    if (total > 0 && transparent / total > 0.4) { // 40% cleared
      setIsWipedEnough(true);
    }
  };

  useEffect(() => {
    if (isWipedEnough && !isDone) {
      setIsDone(true);
      setTimeout(() => {
         gameStore.setPhase('phase6_truth');
      }, 3000);
    }
  }, [isWipedEnough, isDone]);

  return (
    <motion.div
      className="w-full h-full relative bg-[#fcfbfa] flex items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 2 } }}
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl aspect-[4/3] rounded-lg overflow-hidden shadow-sm"
      >
        {/* Underlying Memory Image */}
        <div className="absolute inset-0 bg-[#fffdf5] flex items-center justify-center">
            <img 
               src="/memory.png" 
               alt="A childhood memory" 
               className="w-full h-full object-contain p-4 opacity-80 mix-blend-multiply"
            />
        </div>

        {/* Fog Canvas overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 touch-none w-full h-full cursor-pointer transition-opacity duration-[2s] ${isWipedEnough ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        <AnimatePresence>
          {!isWipedEnough && (
            <motion.p
              className="absolute text-center mt-12 w-full top-0 font-handwritten text-gray-500 text-2xl pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
            >
              Wipe away the fog...
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      
      {/* Visual text element overlaying everything at the end */}
      <AnimatePresence>
         {isWipedEnough && (
            <motion.div
               className="absolute bottom-16 w-full text-center pointer-events-none"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0, transition: { delay: 1.5, duration: 1 } }}
            >
               <p className="font-handwritten text-2xl text-[#3d3b38]">
                 This was all I ever wanted...
               </p>
            </motion.div>
         )}
      </AnimatePresence>
    </motion.div>
  );
};
