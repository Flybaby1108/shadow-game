import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from '@use-gesture/react';

export type SceneState =
  | 'SLEEPING'
  | 'PHONE_LIT'
  | 'HOLDING_PHONE'
  | 'HUD_ALARM'
  | 'HUD_NOTIFICATIONS'
  | 'HUD_WEATHER'
  | 'WHITE_OUT'
  | 'CHECK_INTERFACE'
  | 'CHECK_INTERFACE_DONE'
  | 'PLAYING_VIDEO'
  | 'SCENE_COMPLETE';

interface Scene1WakeUpProps {
  onComplete: () => void;
}

// Helper to keep paths consistent with base URL
const A = (name: string) => `${import.meta.env.BASE_URL}assets/chapter1/${name}`;

const ScratchOffCanvas: React.FC<{
  imageSrc: string;
  onScratchedEnough: () => void;
  maxScrub?: number;
}> = ({ imageSrc, onScratchedEnough, maxScrub = 2500 }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const scrubAccumulator = React.useRef(0);
  const lastPos = React.useRef<{x: number, y: number} | null>(null);

  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const maskCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const hasTriggered = React.useRef(false);

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      if (canvasRef.current) {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = img.width;
        maskCanvas.height = img.height;
        maskCanvasRef.current = maskCanvas;
      }
    };
  }, [imageSrc]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const img = imgRef.current;
    if (!canvas || !maskCanvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(maskCanvas, 0, 0);
    
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(img, 0, 0);
  };

  const drawStroke = (x: number, y: number, isDown: boolean) => {
    if (hasTriggered.current) return;
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;
    
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // With object-fill, the DOM rect maps 1:1 to the canvas internally
    const cx = (x - rect.left) * scaleX;
    const cy = (y - rect.top) * scaleY;

    if (isDown) {
      lastPos.current = { x: cx, y: cy };
    }

    if (lastPos.current) {
      maskCtx.beginPath();
      maskCtx.lineWidth = 120; // Brush size
      maskCtx.lineCap = 'round';
      maskCtx.lineJoin = 'round';
      maskCtx.strokeStyle = 'black';
      maskCtx.moveTo(lastPos.current.x, lastPos.current.y);
      maskCtx.lineTo(cx, cy);
      maskCtx.stroke();
      
      const dx = cx - lastPos.current.x;
      const dy = cy - lastPos.current.y;
      scrubAccumulator.current += Math.sqrt(dx * dx + dy * dy);

      if (scrubAccumulator.current > maxScrub * scaleX) {
        hasTriggered.current = true;
        onScratchedEnough();
      }
    }

    lastPos.current = { x: cx, y: cy };
    renderCanvas();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    drawStroke(e.clientX, e.clientY, true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    drawStroke(e.clientX, e.clientY, false);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDrawing(false);
    lastPos.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full object-contain touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
};

export const Scene1WakeUp: React.FC<Scene1WakeUpProps> = ({ onComplete }) => {
  // Dev variables removed to satisfy TS build
  
  // --- DEV MODE V6.0 STATE (Alarm Button Control) ---
  const devModeAlarm = false;
  const [alarmWidth, setAlarmWidth] = useState(25.70);
  const [alarmY, setAlarmY] = useState(6.0);
  const [alarmX, setAlarmX] = useState(1.0);

  // --- DEV MODE V7.0 STATE (PhoneShock Control) ---
  const devModeShock = false;
  const [shockWidth, setShockWidth] = useState(6.80);
  const [shockX, setShockX] = useState(26.98);
  const [shockY, setShockY] = useState(14.32);

  const [sceneState, setSceneState] = useState<SceneState>(
    devModeShock ? 'PHONE_LIT' : devModeAlarm ? 'HUD_ALARM' : 'SLEEPING'
  );
  
  // Track notification clicks
  const [infoCleared, setInfoCleared] = useState(false);
  const [scheduleCleared, setScheduleCleared] = useState(false);

  // Sync body.dev-mode class whenever any director mode is active
  useEffect(() => {
    const isDevMode = devModeAlarm || devModeShock;
    if (isDevMode) {
      document.body.classList.add('dev-mode');
    } else {
      document.body.classList.remove('dev-mode');
    }
    return () => document.body.classList.remove('dev-mode');
  }, [devModeAlarm, devModeShock]);

  // Sync body.cursor-brush class during CHECK_INTERFACE (scratch drawing)
  useEffect(() => {
    if (sceneState === 'CHECK_INTERFACE') {
      document.body.classList.add('cursor-brush');
    } else {
      document.body.classList.remove('cursor-brush');
    }
    return () => document.body.classList.remove('cursor-brush');
  }, [sceneState]);

  // Auto transition from SLEEPING to PHONE_LIT
  useEffect(() => {
    if (sceneState === 'SLEEPING') {
      const timer = setTimeout(() => {
        setSceneState('PHONE_LIT');
      }, 3500); 
      return () => clearTimeout(timer);
    }
  }, [sceneState]);


  // Handle Notifications check — both cards must be cleared
  useEffect(() => {
    if (sceneState === 'HUD_NOTIFICATIONS') {
      if (infoCleared && scheduleCleared) {
        const timer = setTimeout(() => {
          setSceneState('HUD_WEATHER');
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [infoCleared, scheduleCleared, sceneState]);

  // Transition from White Out to Check Interface
  useEffect(() => {
    if (sceneState === 'WHITE_OUT') {
      const timer = setTimeout(() => {
        setSceneState('CHECK_INTERFACE');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sceneState]);

  // Transition away after checking is done
  useEffect(() => {
    if (sceneState === 'CHECK_INTERFACE_DONE') {
      const timer = setTimeout(() => {
        setSceneState('PLAYING_VIDEO');
      }, 500); // 0.5s pause then play video
      return () => clearTimeout(timer);
    }
  }, [sceneState]);


  // Handle Video complete check
  useEffect(() => {
    if (sceneState === 'SCENE_COMPLETE') {
      const timer = setTimeout(() => {
         onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sceneState, onComplete]);

  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Slider Logic for Alarm
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(0);
  const [maxDrag, setMaxDrag] = useState(430);

  useEffect(() => {
    if (trackRef.current && sceneState === 'HUD_ALARM') {
      const updateBounds = () => {
        // Max slide distance = container width × (1 - button_left% - button_width%)
        // This keeps the button's right edge flush with AlarmOff's right edge
        const containerWidth = trackRef.current!.clientWidth;
        setMaxDrag(containerWidth * (1 - alarmX / 100 - alarmWidth / 100));
      };
      updateBounds();
      window.addEventListener('resize', updateBounds);
      return () => window.removeEventListener('resize', updateBounds);
    }
  }, [sceneState, alarmX, alarmWidth]);


  const bindDrag = useDrag((state) => {
    const { offset: [x], last } = state;
    const newPos = Math.max(0, Math.min(x, maxDrag));
    
    if (last) {
      if (newPos >= maxDrag * 0.9) { 
        setSliderPos(maxDrag);
        setTimeout(() => setSceneState('HUD_NOTIFICATIONS'), 300);
      } else {
        setSliderPos(0);
      }
    } else {
      setSliderPos(newPos);
    }
  }, {
    axis: 'x',         
    from: () => [sliderPos, 0], 
    bounds: { left: 0, top: 0, bottom: 0 },
    rubberband: true,
  });

  const crossfadeProgress = maxDrag > 0 ? Math.min(1, Math.max(0, sliderPos / maxDrag)) : 0;

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden relative">
      
      {/* 16:9 Aspect Ratio Container */}
      <div className="relative w-full max-w-[1920px] aspect-video bg-[#b0b8c1] shadow-2xl overflow-hidden">

        {/* Layer 1: Background Sleep Scene (base) — hidden after video ends */}
        <motion.img
          src={A('Chapter1_1_Sleep.jpg')}
          alt="Sleeping Background"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          animate={{ opacity: ['SLEEPING', 'PHONE_LIT', 'HOLDING_PHONE'].includes(sceneState) ? 1 : 0 }}
          transition={{ opacity: { duration: 0.4 } }}
          initial={{ opacity: 1 }}
        />

        {/* Layer 1b: Sleep_b — fades in on PHONE_LIT, hidden after video ends */}
        <motion.img
          src={A('Chapter1_1_Sleep_b.jpg')}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          animate={{ opacity: ['PHONE_LIT', 'HOLDING_PHONE'].includes(sceneState) ? 1 : 0 }}
          transition={{ opacity: { duration: 0.4 } }}
          initial={{ opacity: 0 }}
        />

        {/* Shock Vfx Layer — clickable to advance to HUD_ALARM */}
        <AnimatePresence>
          {sceneState === 'PHONE_LIT' && (
             <motion.img 
                key="phone-shock"
                src={A('Chapter1_1_PhoneShock.png')}
                draggable={false}
                className={`absolute z-20 select-none pointer-events-auto cursor-pointer hover:brightness-110 ${devModeShock ? 'outline outline-2 outline-dashed outline-red-500' : ''}`}
                style={{ width: `${shockWidth}%`, top: `${shockY}%`, left: `${shockX}%` }}
                initial={{ opacity: devModeShock ? 1 : 0, scale: 0.95 }}
                animate={devModeShock ? { opacity: 1 } : { 
                  opacity: [0, 1, 0], 
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={devModeShock ? {} : { 
                  duration: 0.15,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
                onClick={() => {
                  setSceneState('HOLDING_PHONE');
                }}
             />
          )}
        </AnimatePresence>



        {/* Layer 3: Wake video — full screen, plays on HOLDING_PHONE, freezes on last frame */}
        <AnimatePresence>
          {['HOLDING_PHONE', 'HUD_ALARM', 'HUD_NOTIFICATIONS', 'HUD_WEATHER'].includes(sceneState) && (
            <motion.div
              key="wake-layer"
              className="absolute inset-0 z-20 select-none pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <video
                src={A('Chapter1_1_Sleep_c.mp4')}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onEnded={() => setSceneState('HUD_ALARM')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- HUD LAYERS --- */}
        <div className="absolute left-[3%] top-[40%] z-30" style={{ width: '29%' }}>
          <AnimatePresence mode="wait">
            
            {/* 1. ALARM HUD */}
            {sceneState === 'HUD_ALARM' && (
              <motion.div 
                key="alarm"
                ref={trackRef}
                className="relative w-full"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
              >
                <img src={A('Chapter1_1_AlarmBase.png')} alt="Alarm Tracker" draggable={false} className="w-full drop-shadow-xl select-none pointer-events-none" />
                
                <img 
                  src={A('Chapter1_1_AlarmOff.png')} 
                  alt="Alarm Tracker Off State"
                  draggable={false} 
                  className="absolute top-0 left-0 w-full drop-shadow-xl pointer-events-none select-none" 
                  style={{ opacity: crossfadeProgress }}
                />

                <motion.div 
                  className={`absolute touch-none select-none ${devModeAlarm ? 'border-4 border-dashed border-red-500 bg-red-500/20' : ''}`}
                  style={{ width: `${alarmWidth}%`, top: `${alarmY}%`, left: `${alarmX}%`, x: sliderPos }}
                >
                  <div 
                    {...bindDrag()}
                    className="w-full h-full cursor-grab active:cursor-grabbing hover:brightness-110"
                  >
                    <img 
                      src={A('Chapter1_1_AlarmButton.png')} 
                      alt="Alarm Button"
                      draggable={false}
                      className="w-full"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 2. NOTIFICATIONS HUD */}
            {sceneState === 'HUD_NOTIFICATIONS' && (
              <motion.div
                key="notif-group"
                className="relative w-full flex flex-col gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
              >
                {/* Information card */}
                <AnimatePresence>
                  {!infoCleared && (
                    <motion.div
                      key="info-card"
                      className="cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all"
                      exit={{ opacity: 0, x: -24, scale: 0.93, transition: { duration: 0.25 } }}
                      onClick={() => setInfoCleared(true)}
                    >
                      <img src={A('Chapter1_1_Information.png')} alt="Notifications" className="w-full drop-shadow-xl select-none" draggable={false} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Schedule card */}
                <AnimatePresence>
                  {!scheduleCleared && (
                    <motion.div
                      key="schedule-card"
                      className="cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all"
                      exit={{ opacity: 0, x: -24, scale: 0.93, transition: { duration: 0.25 } }}
                      onClick={() => setScheduleCleared(true)}
                    >
                      <img src={A('Chapter1_1_Schedule.png')} alt="Schedule" className="w-full drop-shadow-xl select-none" draggable={false} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* 3. WEATHER HUD */}
            {sceneState === 'HUD_WEATHER' && (
              <motion.div 
                key="weather"
                className="relative w-full cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.5 } }}
                onClick={() => setSceneState('WHITE_OUT')}
              >
                <img src={A('Chapter1_1_Weather.png')} alt="Weather" className="w-[100%] drop-shadow-xl" />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* New Layer: Check Interface Scene (White Out Transition + Canvas Scratch Interaction) */}
        <AnimatePresence>
          {['WHITE_OUT', 'CHECK_INTERFACE', 'CHECK_INTERFACE_DONE'].includes(sceneState) && (
            <motion.div
              key="check-interface-scene"
              className="absolute inset-0 z-40 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Fade in the BasicScreen background after white out */}
              <motion.img 
                src={A('Chapter1_2_BasicScreen.jpg')}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: sceneState !== 'WHITE_OUT' ? 1 : 0 }}
                transition={{ duration: 1 }}
                draggable={false}
              />

              {sceneState !== 'WHITE_OUT' && (
                <motion.div 
                  className="absolute"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    width: `50%`,
                    top: 'calc(20% - 114.5px)',
                    left: 'calc(10% - 187.2px)'
                  }}
                >
                  <div className="relative w-full aspect-square pointer-events-none">
                    {/* Interface A (Base) */}
                    <img 
                      src={A('Chapter1_2_CheckInterface_a.png')} 
                      alt="Check Interface" 
                      className="absolute top-0 left-0 w-full h-full object-contain select-none pointer-events-none drop-shadow-2xl" 
                      draggable={false} 
                    />
                    
                    {/* Green Checkmark Wrapper */}
                    <motion.div
                      className="absolute pointer-events-auto"
                      style={{
                        width: '48.00%',
                        height: '40.00%',
                        top: '25.40%', 
                        left: '25.90%'
                      }}
                    >
                      {/* Canvas Scratch Off logic OR fully revealed checkmark */}
                      {sceneState === 'CHECK_INTERFACE' ? (
                        <div className="pointer-events-auto w-full h-full relative">
                          <ScratchOffCanvas 
                            imageSrc={A('Chapter1_2_GreenCheckmark.png')} 
                            onScratchedEnough={() => {
                              setSceneState('CHECK_INTERFACE_DONE');
                            }}
                            maxScrub={1200} 
                          />
                        </div>
                      ) : (
                        <img 
                          src={A('Chapter1_2_GreenCheckmark.png')} 
                          className="absolute top-0 left-0 w-full h-full object-contain select-none pointer-events-none"
                          draggable={false}
                        />
                      )}
                    </motion.div>

                    {/* Interface B (Overlay when done) */}
                    <motion.img 
                      src={A('Chapter1_2_CheckInterface_b.png')} 
                      className="absolute top-0 left-0 w-full h-full object-contain select-none pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: sceneState === 'CHECK_INTERFACE_DONE' ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                      draggable={false}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- DIRECTOR MODE V6.0 HUD (Alarm Button) --- */}
        {devModeAlarm && (
          <motion.div 
            className="absolute top-10 left-10 z-50 bg-black/90 border border-gray-700 text-white p-5 rounded-lg text-sm w-80 font-mono shadow-2xl cursor-move pointer-events-auto"
            drag
            dragMomentum={false}
          >
            <h3 className="font-bold text-lg mb-2 text-yellow-400 select-none">🎬 Director Mode V6.0</h3>
            <p className="mb-4 text-xs text-gray-300 select-none">Alarm Button Control.</p>
            
            <div className="mb-4 p-3 bg-white/10 rounded cursor-default" onPointerDown={e => e.stopPropagation()}>
              <strong className="text-red-400 block mb-2">Alarm Button Frame</strong>
              
              <label className="flex items-center gap-2 mb-2 text-gray-200">
                W:
                <input 
                  type="range" min="5" max="50" step="0.1"
                  value={alarmWidth} 
                  onChange={(e) => setAlarmWidth(Number(e.target.value))} 
                  className="flex-1"
                />
                <span className="w-16 text-right">{alarmWidth.toFixed(1)}%</span>
              </label>

              <hr className="my-2 border-gray-600" />

              <label className="flex items-center gap-2 mb-2 text-gray-200">
                X:
                <input 
                  type="range" min="-10" max="50" step="0.1"
                  value={alarmX} 
                  onChange={(e) => setAlarmX(Number(e.target.value))} 
                  className="flex-1"
                />
                <span className="w-16 text-right">{alarmX.toFixed(1)}%</span>
              </label>

              <label className="flex items-center gap-2 mb-2 text-gray-200">
                Y:
                <input 
                  type="range" min="-10" max="50" step="0.1"
                  value={alarmY} 
                  onChange={(e) => setAlarmY(Number(e.target.value))} 
                  className="flex-1"
                />
                <span className="w-16 text-right">{alarmY.toFixed(1)}%</span>
              </label>
            </div>

            <button 
              className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-colors active:scale-95"
              onPointerDown={e => e.stopPropagation()}
              onClick={(e) => {
                const text = `WIDTH: ${alarmWidth.toFixed(2)}%\nLEFT: ${alarmX.toFixed(2)}%\nTOP: ${alarmY.toFixed(2)}%`;
                navigator.clipboard.writeText(text);
                const btn = e.currentTarget;
                const oldText = btn.innerText;
                btn.innerText = "✅ Copied!";
                btn.classList.replace('bg-blue-600', 'bg-green-600');
                btn.classList.replace('hover:bg-blue-500', 'hover:bg-green-500');
                setTimeout(() => {
                  btn.innerText = oldText;
                  btn.classList.replace('bg-green-600', 'bg-blue-600');
                  btn.classList.replace('hover:bg-green-500', 'hover:bg-blue-500');
                }, 2000);
              }}
            >
              Copy Values
            </button>
          </motion.div>
        )}

        {/* --- DIRECTOR MODE V7.0 HUD (PhoneShock) --- */}
        {devModeShock && (
          <motion.div
            className="absolute top-10 left-10 z-50 bg-black/90 border border-orange-600 text-white p-5 rounded-lg text-sm w-80 font-mono shadow-2xl cursor-move pointer-events-auto"
            drag
            dragMomentum={false}
          >
            <h3 className="font-bold text-lg mb-2 text-orange-400 select-none">🎬 Director Mode V7.0</h3>
            <p className="mb-4 text-xs text-gray-300 select-none">PhoneShock 大小 & 位置</p>

            <div className="mb-4 p-3 bg-white/10 rounded cursor-default" onPointerDown={e => e.stopPropagation()}>
              <strong className="text-orange-400 block mb-2">Chapter1_1_PhoneShock.png</strong>

              <label className="flex items-center gap-2 mb-2 text-gray-200">
                W:
                <input
                  type="range" min="1" max="30" step="0.1"
                  value={shockWidth}
                  onChange={e => setShockWidth(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right">{shockWidth.toFixed(1)}%</span>
              </label>

              <hr className="my-2 border-gray-600" />

              <label className="flex items-center gap-2 mb-2 text-gray-200">
                X:
                <input
                  type="range" min="0" max="80" step="0.01"
                  value={shockX}
                  onChange={e => setShockX(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right">{shockX.toFixed(2)}%</span>
              </label>

              <label className="flex items-center gap-2 mb-2 text-gray-200">
                Y:
                <input
                  type="range" min="0" max="80" step="0.01"
                  value={shockY}
                  onChange={e => setShockY(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-right">{shockY.toFixed(2)}%</span>
              </label>
            </div>

            <button
              className="mt-2 w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded transition-colors active:scale-95"
              onPointerDown={e => e.stopPropagation()}
              onClick={(e) => {
                const text = `WIDTH: ${shockWidth.toFixed(2)}%\nLEFT: ${shockX.toFixed(2)}%\nTOP: ${shockY.toFixed(2)}%`;
                navigator.clipboard.writeText(text);
                const btn = e.currentTarget;
                const oldText = btn.innerText;
                btn.innerText = '✅ Copied!';
                btn.classList.replace('bg-orange-600', 'bg-green-600');
                btn.classList.replace('hover:bg-orange-500', 'hover:bg-green-500');
                setTimeout(() => {
                  btn.innerText = oldText;
                  btn.classList.replace('bg-green-600', 'bg-orange-600');
                  btn.classList.replace('hover:bg-green-500', 'hover:bg-orange-500');
                }, 2000);
              }}
            >
              Copy Values
            </button>
          </motion.div>
        )}



        <AnimatePresence>
          {sceneState === 'PLAYING_VIDEO' && (
            <motion.div
              key="meal-video"
              className="absolute inset-0 z-50 bg-black flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <video
                ref={videoRef}
                src={A('Chapter1_2_DrinkMealReplacement.mp4')}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onEnded={() => setSceneState('SCENE_COMPLETE')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instruction Global Overlay */}
        <div className="absolute top-4 w-full text-center pointer-events-none">
          <p className="text-gray-500 text-sm bg-white/80 inline-block px-4 py-1 rounded-full shadow-sm">
             [State: {sceneState}] 
             {sceneState === 'PHONE_LIT' && ' -> Click the phone'}
             {sceneState === 'HUD_ALARM' && ' -> Slide the knob horizontally'}
             {sceneState === 'HUD_NOTIFICATIONS' && ' -> Click both notifications'}
             {sceneState === 'HUD_WEATHER' && ' -> Click the weather card'}
          </p>
        </div>

        {/* DEV ONLY: Skip Button — remove before release */}
        {sceneState !== 'SCENE_COMPLETE' && (
          <button
            className="absolute bottom-4 right-4 pointer-events-auto"
            style={{
              zIndex: 9999,
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              opacity: 0.45,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.45')}
            title={`Skip: ${sceneState}`}
            onClick={() => {
              const next: Partial<Record<SceneState, () => void>> = {
                SLEEPING:              () => setSceneState('PHONE_LIT'),
                PHONE_LIT:            () => setSceneState('HUD_ALARM'),
                HOLDING_PHONE:        () => setSceneState('HUD_ALARM'),
                HUD_ALARM:            () => setSceneState('HUD_NOTIFICATIONS'),
                HUD_NOTIFICATIONS:    () => setSceneState('HUD_WEATHER'),
                HUD_WEATHER:          () => setSceneState('WHITE_OUT'),
                WHITE_OUT:            () => setSceneState('CHECK_INTERFACE'),
                CHECK_INTERFACE:      () => setSceneState('CHECK_INTERFACE_DONE'),
                CHECK_INTERFACE_DONE: () => setSceneState('PLAYING_VIDEO'),
                PLAYING_VIDEO:        () => setSceneState('SCENE_COMPLETE'),
              };
              next[sceneState]?.();
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L8 6L2 10V2Z" fill="white" />
              <rect x="9" y="2" width="1.5" height="8" rx="0.75" fill="white" />
            </svg>
          </button>
        )}

      </div>
    </div>
  );
};
