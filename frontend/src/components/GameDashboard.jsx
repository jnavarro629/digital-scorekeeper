import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ThemeToggle } from './ThemeToggle';
import { Scoreboard } from './Scoreboard';
import { GameTimer } from './GameTimer';
import { PlayerSelector } from './PlayerSelector';
import { ActionButtons } from './ActionButtons';
import { PlayByPlay } from './PlayByPlay';
import { BoxScore } from './BoxScore';
import { Button } from './ui/button';
import { Undo, BarChart3, Download, Home, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { exportGameToPDF } from '../utils/pdfExport';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

export const GameDashboard = () => {
  const { undo, history, resetGame, getGameData } = useGameStore();
  const [showBoxScore, setShowBoxScore] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [includePlayByPlay, setIncludePlayByPlay] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleUndo = () => {
    if (history.length === 0) {
      toast.error('No hay acciones para deshacer');
      return;
    }
    undo();
    toast.success('Acción deshecha', { duration: 1500 });
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const confirmExport = () => {
    const gameData = getGameData();
    exportGameToPDF(gameData, includePlayByPlay);
    toast.success('Box Score exportado correctamente', { duration: 1500 });
    setShowExportDialog(false);
    setIncludePlayByPlay(false);
  };

  const handleReset = () => {
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    resetGame();
    toast.success('Partido reiniciado');
    setShowResetDialog(false);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold font-digital">
                Digital Scorekeeper
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUndo}
                disabled={history.length === 0}
                title="Deshacer última acción"
              >
                <Undo className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBoxScore(true)}
                title="Ver estadísticas"
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExport}
                title="Exportar Box Score a PDF"
              >
                <Download className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                title="Reiniciar partido"
              >
                <Settings className="h-5 w-5" />
              </Button>
              
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Scoreboard and Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <Scoreboard />
          </div>
          <div className="flex justify-center lg:justify-end">
            <GameTimer />
          </div>
        </div>

        {/* Players and Play by Play */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PlayerSelector />
          </div>
          <div className="hidden lg:block">
            <PlayByPlay />
          </div>
        </div>
        
        {/* Play by Play for mobile */}
        <div className="lg:hidden">
          <PlayByPlay />
        </div>
      </main>

      {/* Action Buttons (Sticky Footer) */}
      <ActionButtons />

      {/* Box Score Dialog */}
      <BoxScore open={showBoxScore} onOpenChange={setShowBoxScore} />

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Box Score Completo a PDF</DialogTitle>
            <DialogDescription>
              Se exportarán todas las estadísticas detalladas del partido
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="play-by-play" className="cursor-pointer">
                Incluir jugada a jugada
              </Label>
              <Switch
                id="play-by-play"
                checked={includePlayByPlay}
                onCheckedChange={setIncludePlayByPlay}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmExport}>
              Exportar PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Reiniciar partido?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará todos los datos del partido actual. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmReset}>
              Reiniciar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
