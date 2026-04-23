

export interface GameState {
  currentChapterId: number; // 0 = Title, 1-12 = Chapters
  currentSceneId: number;
  emotionalIntensity: number; // 0 to 100, drives audio/visual distortion
  shadowDesire: 'money' | 'validation' | 'none'; // The current shape the shadow is taking
  phase: string;
}

class GameStore {
  private state: GameState = {
    currentChapterId: 0,
    currentSceneId: 0,
    emotionalIntensity: 0,
    shadowDesire: 'none',
    phase: 'intro',
  };

  private listeners: Set<(state: GameState) => void> = new Set();

  getState() {
    return this.state;
  }

  setChapter(chapterId: number) {
    this.state = { ...this.state, currentChapterId: chapterId, currentSceneId: 0 };
    this.notify();
  }

  setScene(sceneId: number) {
    this.state = { ...this.state, currentSceneId: sceneId };
    this.notify();
  }

  setEmotionalIntensity(intensity: number) {
    this.state = { ...this.state, emotionalIntensity: intensity };
    this.notify();
  }

  setShadowDesire(desire: GameState['shadowDesire']) {
    this.state = { ...this.state, shadowDesire: desire };
    this.notify();
  }

  setPhase(phase: string) {
    this.state = { ...this.state, phase };
    this.notify();
  }

  subscribe(listener: (state: GameState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const gameStore = new GameStore();
