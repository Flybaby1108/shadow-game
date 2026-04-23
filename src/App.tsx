import { useEffect, useState, useRef } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { Chapter1 } from './chapters/Chapter1/Chapter1';
import { ChapterTransition } from './components/ChapterTransition';
import { gameStore, type GameState } from './store/GameState';
import { CHAPTERS } from './config/ChapterConfig';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [gameState, setGameState] = useState<GameState>(gameStore.getState());
  const [transitioningTo, setTransitioningTo] = useState<number | null>(null);
  
  // Track previous chapter to intercept transitions
  const prevChapter = useRef(gameState.currentChapterId);

  useEffect(() => {
    const unsubscribe = gameStore.subscribe(setGameState);
    return () => {
      unsubscribe();
    };
  }, []);

  // Intercept chapter changes to show transition overlay
  useEffect(() => {
    if (gameState.currentChapterId !== prevChapter.current) {
      if (gameState.currentChapterId !== 0) { // Don't transition when returning to title
        setTransitioningTo(gameState.currentChapterId);
      }
      prevChapter.current = gameState.currentChapterId;
    }
  }, [gameState.currentChapterId]);

  return (
    <>
      <AnimatePresence mode="wait">
        {gameState.currentChapterId === 0 && <TitleScreen key="title" />}
        {gameState.currentChapterId === 1 && <Chapter1 key="c1" />}
        {gameState.currentChapterId > 1 && (
           <div key={`c${gameState.currentChapterId}`} className="w-full h-full flex flex-col items-center justify-center text-2xl text-gray-400 bg-[#fcfbfa]">
             <p className="font-handwritten text-4xl mb-4">WIP</p>
             <p>{CHAPTERS.find(c => c.id === gameState.currentChapterId)?.title} - Art Assets Needed</p>
             <button 
                className="mt-8 px-6 py-2 border rounded hover:bg-gray-100 transition-colors"
                onClick={() => gameStore.setChapter(gameState.currentChapterId + 1)}
             >
                Skip to Next Chapter
             </button>
           </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transitioningTo !== null && (
          <ChapterTransition
            chapterId={transitioningTo}
            onTransitionComplete={() => setTransitioningTo(null)}
          />
        )}
      </AnimatePresence>

      {/* Global Emotional Vignette Overlay (always applicable) */}
      <div 
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000 z-40"
        style={{ 
          boxShadow: `inset 0 0 ${100 + gameState.emotionalIntensity}px rgba(0,0,0,${gameState.emotionalIntensity / 200})`,
          opacity: gameState.emotionalIntensity > 0 ? 1 : 0
        }}
      />

      {/* Dev Tool: Chapter Select */}
      <div className="absolute bottom-4 right-4 z-50 flex gap-2 text-xs opacity-20 hover:opacity-100 transition-opacity bg-white p-2 border rounded shadow">
         <span className="text-gray-500 mr-2">Dev:</span>
         <button onClick={() => gameStore.setChapter(0)} className="hover:text-blue-500">Title</button>
         {CHAPTERS.map(c => (
            <button key={c.id} onClick={() => gameStore.setChapter(c.id)} className="hover:text-blue-500">
              C{c.id}
            </button>
         ))}
      </div>
    </>
  );
}

export default App;
