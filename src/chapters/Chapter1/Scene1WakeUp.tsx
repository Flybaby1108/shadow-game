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
  | 'PLAYING_VIDEO'
  | 'SCENE_COMPLETE';

interface Scene1WakeUpProps {
  onComplete: () => void;
}

// Helper to keep paths consistent with base URL
const A = (name: string) => `${import.meta.env.BASE_URL}assets/chapter1/${name}`;

export const Scene1WakeUp: React.FC<Scene1WakeUpProps> = ({ onComplete }) => {
  const [sceneState, setSceneState] = useState<SceneState>('SLEEPING');
  
  // Track notification click (it's a combined image now)
  const [infoCleared, setInfoCleared] = useState(false);

  // Auto transition from SLEEPING to PHONE_LIT
  useEffect(() => {
    if (sceneState === 'SLEEPING') {
      const timer = setTimeout(() => {
        setSceneState('PHONE_LIT');
      }, 3500); // Wait 3.5 seconds for a cinematic silent black screen pause
      return () => clearTimeout(timer);
    }
  }, [sceneState]);

  // Handle Notifications check
  useEffect(() => {
    if (sceneState === 'HUD_NOTIFICATIONS') {
      if (infoCleared) {
        // Small delay before showing weather
        const timer = setTimeout(() => {
          setSceneState('HUD_WEATHER');
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [infoCleared, sceneState]);

  // Handle Weather complete check
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

  // Dynamically calculate the right boundary based on the responsive rendered width
  useEffect(() => {
    if (trackRef.current && sceneState === 'HUD_ALARM') {
      const updateBounds = () => {
        // Track width minus ~22% for the button width padding
        setMaxDrag(trackRef.current!.clientWidth * 0.77);
      };
      updateBounds();
      window.addEventListener('resize', updateBounds);
      return () => window.removeEventListener('resize', updateBounds);
    }
  }, [sceneState]);

  const bindDrag = useDrag((state) => {
    const { offset: [x], last } = state;
    
    // Constrain to positive range within maxDrag
    const newPos = Math.max(0, Math.min(x, maxDrag));
    
    if (last) {
      if (newPos >= maxDrag * 0.9) { // Needs to be dragged almost all the way to the right
        // Success
        setSliderPos(maxDrag);
        setTimeout(() => setSceneState('HUD_NOTIFICATIONS'), 300);
      } else {
        // Snap back if released early
        setSliderPos(0);
      }
    } else {
      setSliderPos(newPos);
    }
  }, {
    axis: 'x',         // Restrict dragging strictly to horizontal
    from: () => [sliderPos, 0], // Maintain position between grabs
    bounds: { left: 0, top: 0, bottom: 0 },
    rubberband: true,
  });

  // Calculate opacity for the cross-fade based on slider position
  const crossfadeProgress = maxDrag > 0 ? Math.min(1, Math.max(0, sliderPos / maxDrag)) : 0;

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden relative">
      
      {/* 16:9 Aspect Ratio Container for Absolute Positioning */}
      <div className="relative w-full max-w-[1920px] aspect-video bg-[#b0b8c1] shadow-2xl overflow-hidden">

        {/* Layer 1: Background Sleep Scene */}
        <img 
          src={A('Chapter1_1_Sleep.jpg')} 
          alt="Sleeping Background" 
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover select-none" 
        />

        {/* Shock Vfx Layer (Visible when phone lights up, loop flashing) */}
        <AnimatePresence>
          {sceneState === 'PHONE_LIT' && (
             <motion.img 
                key="phone-shock"
                src={A('Chapter1_1_PhoneShock.png')}
                draggable={false}
                className="absolute z-20 pointer-events-none select-none"
                style={{ width: '8%', top: '14.64%', left: '27.75%' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: [0, 1, 0], // Create a flashing/pulsing effect
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{ 
                  duration: 0.15,
                  repeat: Infinity, // Keep vibrating/flashing visually as long as it's lit
                  repeatDelay: 0.5   // Buzz buzz ... buzz buzz
                }}
             />
          )}
        </AnimatePresence>

        {/* Layer 2: Phone off/on (Visible only before it's held) */}
        {sceneState === 'SLEEPING' || sceneState === 'PHONE_LIT' ? (
          <div
            className="absolute z-10 cursor-pointer hover:brightness-110 transition-all"
            style={{ width: '5.5%', top: '16.5%', left: '29.8%' }}
            onClick={() => {
              if (sceneState === 'PHONE_LIT') {
                setSceneState('HOLDING_PHONE');
                setTimeout(() => setSceneState('HUD_ALARM'), 800);
              }
            }}
          >
            {/* 黑屏假手机垫底 */}
            <img 
              src={A('Chapter1_1_PhoneOff.png')}
              className="w-full select-none"
              draggable={false}
            />
            {/* 亮起的手机叠加 */}
            <motion.img 
              src={A('Chapter1_1_PhoneStartup.png')}
              className="absolute top-0 left-0 w-full select-none"
              draggable={false}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: sceneState === 'PHONE_LIT' ? 1 : 0
              }}
              transition={{ 
                opacity: { duration: 0.4 }
              }}
            />
          </div>
        ) : null}

        {/* Layer 3: Awoken body with held phone (Visible when HOLDING_PHONE or later, but hides when video plays) */}
        <AnimatePresence>
          {['HOLDING_PHONE', 'HUD_ALARM', 'HUD_NOTIFICATIONS', 'HUD_WEATHER'].includes(sceneState) && (
            <motion.img 
              key="wake-layer"
              src={A('Chapter1_1_Wake.png')}
              draggable={false}
              className="absolute z-20 select-none pointer-events-none"
              style={{ width: '40.7%', top: '11.91%', left: '30.02%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* --- HUD LAYERS --- */}
        {/* HUD uses absolute positioning mimicking the reference image's UI floating panel. */}
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
                {/* Base Background */}
                <img src={A('Chapter1_1_AlarmBase.png')} alt="Alarm Tracker" draggable={false} className="w-full drop-shadow-xl select-none pointer-events-none" />
                
                {/* Overlaid Crossfade Background (AlarmOff) */}
                <img 
                  src={A('Chapter1_1_AlarmOff.png')} 
                  alt="Alarm Tracker Off State"
                  draggable={false} 
                  className="absolute top-0 left-0 w-full drop-shadow-xl pointer-events-none select-none" 
                  style={{ opacity: crossfadeProgress }}
                />

                {/* Slider Button */}
                <motion.div 
                  className="absolute top-[6%] touch-none select-none"
                  style={{ width: '21%', x: sliderPos, left: '1%' }}
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
                 key="notif" 
                 className="relative w-full cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all" 
                 exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }}
                 onClick={() => setInfoCleared(true)}
               >
                 <img src={A('Chapter1_1_Information.png')} alt="Notifications" className="w-[100%] drop-shadow-xl" />
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
                onClick={() => setSceneState('PLAYING_VIDEO')}
              >
                <img src={A('Chapter1_1_Weather.png')} alt="Weather" className="w-[100%] drop-shadow-xl" />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Video Layer */}
        <AnimatePresence>
          {sceneState === 'PLAYING_VIDEO' && (
            <motion.div
              key="meal-video"
              className="absolute inset-0 z-40 bg-black flex items-center justify-center"
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

      </div>
    </div>
  );
};
