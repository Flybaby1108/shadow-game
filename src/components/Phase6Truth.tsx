import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameStore } from '../store/GameState';

export const Phase6Truth: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawnEnough, setIsDrawnEnough] = useState(false);
  
  const isPointerDown = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const container = containerRef.current;
    if (!canvas || !ctx || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill the canvas with "paper" color to hide the finished drawing underneath
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Prepare for "inking" (erasing the paper to reveal the ink)
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 35; // A nice thick marker brush size
    ctx.globalCompositeOperation = 'destination-out';
  }, []);

  const getPos = (e: React.PointerEvent) => {
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

    if (Math.random() < 0.05 && !isDrawnEnough) {
      checkDrawnArea();
    }
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
    lastPos.current = null;
    checkDrawnArea();
  };

  const checkDrawnArea = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    let total = 0;
    let revealed = 0;
    const width = canvas.width;
    const height = canvas.height;
    
    const imageData = ctx.getImageData(0, 0, width, height).data;
    for (let y = 0; y < height; y += 20) {
      for (let x = 0; x < width; x += 20) {
        total++;
        const alpha = imageData[(y * width + x) * 4 + 3];
        if (alpha < 10) revealed++;
      }
    }

    // 50% revealed means they've traced a good chunk of it
    if (total > 0 && revealed / total > 0.5) {
      setIsDrawnEnough(true);
    }
  };

  useEffect(() => {
    if (isDrawnEnough) {
      setTimeout(() => {
        gameStore.setPhase('phase78_ending');
      }, 4000);
    }
  }, [isDrawnEnough]);

  return (
    <motion.div
      className="w-full h-full relative bg-[#fcfbfa] flex items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 2 } }}
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl aspect-[4/3] rounded-lg overflow-hidden"
      >
        {/* Layer 1: The fully inked underlying memory (what we want to reveal) */}
        <div className="absolute inset-0 bg-[#fffdf5] flex items-center justify-center">
            <img 
               src="/memory.png" 
               alt="Completed memory" 
               className="w-full h-full object-contain p-4 mix-blend-multiply"
            />
        </div>

        {/* Layer 2: The opaque canvas paper. We erase this to reveal Layer 1. */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 touch-none w-full h-full cursor-crosshair transition-opacity duration-[3s] ${isDrawnEnough ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {/* Layer 3: Faded sketch overlay (Pointer events none). Guides the user on where to "trace". */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img 
               src="/memory.png" 
               alt="Sketch guide" 
               className={`w-full h-full object-contain p-4 opacity-15 mix-blend-multiply transition-opacity duration-1000 ${isDrawnEnough ? 'opacity-0' : 'opacity-15'}`}
            />
        </div>

        <AnimatePresence>
          {!isDrawnEnough && (
            <motion.div
              className="absolute bottom-12 w-full text-center pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
            >
              <p className="font-handwritten text-gray-500 text-2xl animate-pulse">
                Trace the lines. Remember.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
         {isDrawnEnough && (
            <motion.div
               className="absolute top-12 w-full text-center pointer-events-none"
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0, transition: { delay: 1, duration: 2 } }}
            >
               <h2 className="font-handwritten text-4xl text-[#3d3b38]">
                 I remember...
               </h2>
            </motion.div>
         )}
      </AnimatePresence>
    </motion.div>
  );
};
