import React from 'react';
import { useGameStore } from './store/gameStore';
import { GameSetup } from './components/GameSetup';
import { GameDashboard } from './components/GameDashboard';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  const { isConfigured } = useGameStore();

  return (
    <>
      {isConfigured ? <GameDashboard /> : <GameSetup />}
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
