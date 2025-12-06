import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.TREE_SHAPE);

  const toggleState = () => {
    setAppState((prev) => 
      prev === AppState.SCATTERED ? AppState.TREE_SHAPE : AppState.SCATTERED
    );
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene appState={appState} />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">
        
        {/* Header */}
        <header className="flex flex-col items-center mt-4">
          {/* Updated Title with Calligraphy Font */}
          <h1 className="text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#C5A000] drop-shadow-lg text-center font-cursive tracking-wide pb-2">
            Taotao's Christmas
          </h1>
          <p className="text-[#8a0000] mt-0 text-sm md:text-lg tracking-[0.3em] font-semibold uppercase font-serif">
            Signature Collection 2025
          </p>
        </header>

        {/* Footer / Controls */}
        <footer className="mb-8 flex flex-col items-center pointer-events-auto">
          <button
            onClick={toggleState}
            className="group relative px-8 py-4 bg-transparent border border-[#FFD700]/30 overflow-hidden rounded-full transition-all duration-500 hover:border-[#FFD700] hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]"
          >
            <div className="absolute inset-0 w-0 bg-gradient-to-r from-[#8a0000] to-[#500000] transition-all duration-[250ms] ease-out group-hover:w-full opacity-80" />
            <span className="relative text-[#FFD700] font-serif text-xl tracking-widest group-hover:text-white transition-colors duration-300">
              {appState === AppState.TREE_SHAPE ? 'SCATTER MAGIC' : 'ASSEMBLE TREE'}
            </span>
          </button>
          
          <div className="mt-4 text-[#C5A000]/60 text-xs tracking-widest">
            INTERACTIVE 3D EXPERIENCE
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;