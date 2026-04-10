/**
 * GameModeSelect Page
 * Main entry point for game mode selection
 * Route: /play
 */

import React from 'react';
import Navigation from '@/components/reusable/Navigation';
import Footer from '@/components/reusable/Footer';
import { useGameModeSelect } from './hook/useGameModeSelect.hook';
import './styles.css';
import GameModeCard from './sub-components/GameModeCard';

const GameModeSelect = () => {
  const { gameModes, handleSelectMode } = useGameModeSelect();

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body overflow-hidden min-h-screen w-full select-none">
      {/* Navigation */}
      <Navigation />

      {/* Visual Texture Layers */}
      <div className="fixed inset-0 pixel-grid opacity-20 pointer-events-none"></div>
      <div className="fixed inset-0 scanlines opacity-30 pointer-events-none z-50"></div>

      {/* Main Content */}
      <main className="pt-24 pb-20 px-12 flex flex-col items-center justify-center min-h-screen relative z-10">
        {/* Page Header */}
        <header className="mb-16 text-center">
          <h1 className="font-headline text-4xl text-primary-container drop-shadow-[0_0_12px_rgba(76,201,240,0.6)] mb-2">
            SELECT GAME MODE
          </h1>
        </header>

        {/* Mode Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {gameModes.map((mode) => (
            <GameModeCard key={mode.id} mode={mode} onSelect={handleSelectMode} />
          ))}
        </div>
      </main>

    </div>
  );
};

export default GameModeSelect;