import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHAPTERS } from '../config/ChapterConfig';

interface Props {
  chapterId: number;
  onTransitionComplete: () => void;
}

export const ChapterTransition: React.FC<Props> = ({ chapterId, onTransitionComplete }) => {
  const [stage, setStage] = useState<'black' | 'text' | 'video' | 'image' | 'fadeout'>('black');
  const [isSkipping, setIsSkipping] = useState(false);

  const chapter = CHAPTERS.find(c => c.id === chapterId);

  useEffect(() => {
    if (!chapter) {
      onTransitionComplete();
      return;
    }

    // Sequence:
    // 0s      → black
    // 1s      → title text fades in   (stage: 'text')
    // 4s      → text fades out, image fades in  (stage: 'image')  [only if introImage exists]
    // 5.5s    → image fades out       (stage: 'fadeout')
    // 7s      → onTransitionComplete

    const hasImage = Boolean(chapter.introImage);
    const hasVideo = Boolean(chapter.introVideo);

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setStage('text'), 1000));

    if (hasVideo) {
      timers.push(setTimeout(() => setStage('video'), 5500));
    } else if (hasImage) {
      timers.push(setTimeout(() => setStage('image'), 4000));
      timers.push(setTimeout(() => setStage('fadeout'), 5500));
      timers.push(setTimeout(() => onTransitionComplete(), 7000));
    } else {
      timers.push(setTimeout(() => setStage('fadeout'), 4000));
      timers.push(setTimeout(() => onTransitionComplete(), 5000));
    }

    return () => timers.forEach(clearTimeout);
  }, [chapter, onTransitionComplete]);

  const handleVideoEnd = () => {
    if (chapter?.introImage) {
      setStage('image');
      setTimeout(() => setStage('fadeout'), 1500);
      setTimeout(() => onTransitionComplete(), 3000);
    } else {
      setStage('fadeout');
      setTimeout(() => onTransitionComplete(), 1500);
    }
  };

  if (!chapter) return null;

  return (
    <motion.div
      className="absolute inset-0 z-50 bg-black flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: stage === 'fadeout' ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Intro video — plays after title text, before intro image */}
      {chapter.introVideo && (
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: (stage === 'video' || stage === 'image' || stage === 'fadeout') ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          {(!isSkipping && (stage === 'video' || stage === 'image' || stage === 'fadeout')) && (
            <video
              src={`${import.meta.env.BASE_URL}${chapter.introVideo}`}
              autoPlay
              playsInline
              muted
              onEnded={handleVideoEnd}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </motion.div>
      )}

      {/* Intro image — appears AFTER the title text (or video), fades in on stage 'image' */}
      {chapter.introImage && (
        <motion.img
          src={`${import.meta.env.BASE_URL}${chapter.introImage}`}
          alt=""
          draggable={false}
          className="absolute inset-0 z-30 w-full h-full object-cover select-none pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'image' || stage === 'fadeout' ? 1 : 0 }}
          transition={{ duration: 1.2 }}
        />
      )}

      {/* Chapter title text — shown only during 'text' stage */}
      <AnimatePresence>
        {stage === 'text' && (
          <motion.div
            className="flex flex-col items-center justify-center text-[#fcfbfa] relative z-10"
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

      {/* Skip Button for Chapter Transition */}
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
        title="Skip Transition"
        onClick={() => {
          setIsSkipping(true);
          onTransitionComplete();
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2L8 6L2 10V2Z" fill="white" />
          <rect x="9" y="2" width="1.5" height="8" rx="0.75" fill="white" />
        </svg>
      </button>
    </motion.div>
  );
};
