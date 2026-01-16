import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Button } from './ui/button';
import { Plus, Minus, AlertCircle, Hand, Users as UsersIcon, Shield, Ban, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner';

export const ActionButtons = () => {
  const { 
    selectedPlayer,
    clearSelection,
    addPoints,
    addMissedShot,
    addRebound,
    addAssist,
    addSteal,
    addTurnover,
    addBlock,
    addBlockReceived,
    addFoul,
    addFoulReceived,
    homeTeam,
    awayTeam,
    homePlayerStats,
    awayPlayerStats,
  } = useGameStore();
  
  const [actionDialog, setActionDialog] = useState({ open: false, type: null });
  const [shotType, setShotType] = useState('2pt');
  const [reboundType, setReboundType] = useState('defensive');
  const [foulType, setFoulType] = useState('personal');
  const [secondaryAction, setSecondaryAction] = useState(null);
  const [freeThrowCount, setFreeThrowCount] = useState(1);
  const [currentFreeThrow, setCurrentFreeThrow] = useState(1);
  const [freeThrowPlayer, setFreeThrowPlayer] = useState(null);

  if (!selectedPlayer) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-50">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground">
          Selecciona un jugador para registrar una acción
        </div>
      </div>
    );
  }

  const getSelectedPlayerName = () => {
    const teamData = selectedPlayer.team === 'home' ? homeTeam : awayTeam;
    return teamData.players[selectedPlayer.index]?.name || '';
  };

  const getOpponentTeam = () => {
    return selectedPlayer.team === 'home' ? 'away' : 'home';
  };

  const getOpponentPlayers = () => {
    const opponentTeam = getOpponentTeam();
    const teamData = opponentTeam === 'home' ? homeTeam : awayTeam;
    return teamData.players;
  };

  const handlePointsClick = () => {
    setActionDialog({ open: true, type: 'points' });
    setShotType('2pt');
  };

  const handleConfirmPoints = (made) => {
    if (made) {
      const points = shotType === '3pt' ? 3 : shotType === '2pt' ? 2 : 1;
      addPoints(selectedPlayer.team, selectedPlayer.index, points, shotType);
      
      // Check for assist (only for 2pt and 3pt)
      if (shotType !== '1pt') {
        setSecondaryAction({ type: 'assist', shotType });
        setActionDialog({ open: true, type: 'assist-question' });
        return;
      }
      
      toast.success(`¡${points} puntos anotados!`, { duration: 1500 });
      clearSelection();
    } else {
      addMissedShot(selectedPlayer.team, selectedPlayer.index, shotType);
      // Ask about rebound after missed shot
      setSecondaryAction({ type: 'missed-shot-rebound', shotType });
      setActionDialog({ open: true, type: 'rebound-question' });
      return;
    }
    setActionDialog({ open: false, type: null });
  };

  const handleAssistQuestion = (hasAssist) => {
    if (hasAssist) {
      setActionDialog({ open: true, type: 'assist-player' });
    } else {
      const points = secondaryAction.shotType === '3pt' ? 3 : 2;
      toast.success(`¡${points} puntos anotados!`);
      clearSelection();
      setActionDialog({ open: false, type: null });
      setSecondaryAction(null);
    }
  };

  const handleAssistPlayer = (playerIndex) => {
    addAssist(selectedPlayer.team, playerIndex);
    const points = secondaryAction.shotType === '3pt' ? 3 : 2;
    toast.success(`¡${points} puntos con asistencia!`, { duration: 1500 });
    clearSelection();
    setActionDialog({ open: false, type: null });
    setSecondaryAction(null);
  };

  const handleReboundQuestion = (hasRebound) => {
    if (hasRebound) {
      setActionDialog({ open: true, type: 'rebound-type' });
    } else {
      toast.info('Tiro fallado registrado', { duration: 1500 });
      clearSelection();
      setActionDialog({ open: false, type: null });
      setSecondaryAction(null);
    }
  };

  const handleReboundType = (type) => {
    setReboundType(type);
    setActionDialog({ open: true, type: 'rebound-player' });
  };

  const handleReboundPlayer = (team, playerIndex) => {
    if (team && playerIndex !== null) {
      addRebound(team, playerIndex, reboundType);
      toast.success(`Rebote ${reboundType === 'offensive' ? 'ofensivo' : 'defensivo'} registrado`, { duration: 1500 });
    } else {
      // Team rebound
      toast.success(`Rebote de equipo registrado`, { duration: 1500 });
    }
    clearSelection();
    setActionDialog({ open: false, type: null });
    setSecondaryAction(null);
  };

  const handleFoulClick = () => {
    setActionDialog({ open: true, type: 'foul' });
    setFoulType('personal');
  };

  const handleConfirmFoul = () => {
    addFoul(selectedPlayer.team, selectedPlayer.index, foulType);
    
    // Only ask for foul received on personal and unsportsmanlike fouls
    if (foulType === 'personal' || foulType === 'unsportsmanlike') {
      setActionDialog({ open: true, type: 'foul-received' });
    } else {
      toast.success('Falta registrada', { duration: 1500 });
      clearSelection();
      setActionDialog({ open: false, type: null });
    }
  };

  const handleFoulReceived = (playerIndex) => {
    addFoulReceived(getOpponentTeam(), playerIndex);
    // Store the player who received the foul
    setFreeThrowPlayer({ team: getOpponentTeam(), index: playerIndex });
    // Ask if it was a shooting foul
    setActionDialog({ open: true, type: 'shooting-foul-question' });
  };

  const handleReboundClick = () => {
    setActionDialog({ open: true, type: 'rebound' });
    setReboundType('defensive');
  };

  const handleConfirmRebound = () => {
    addRebound(selectedPlayer.team, selectedPlayer.index, reboundType);
    toast.success('Rebote registrado', { duration: 1500 });
    clearSelection();
    setActionDialog({ open: false, type: null });
  };

  const handleStealClick = () => {
    addSteal(selectedPlayer.team, selectedPlayer.index);
    setActionDialog({ open: true, type: 'steal-turnover' });
  };

  const handleStealTurnover = (playerIndex) => {
    addTurnover(getOpponentTeam(), playerIndex);
    toast.success('Robo registrado', { duration: 1500 });
    clearSelection();
    setActionDialog({ open: false, type: null });
  };

  const handleTurnoverClick = () => {
    addTurnover(selectedPlayer.team, selectedPlayer.index);
    setActionDialog({ open: true, type: 'turnover-steal' });
  };

  const handleTurnoverSteal = (hasSteal, playerIndex) => {
    if (hasSteal && playerIndex !== null) {
      addSteal(getOpponentTeam(), playerIndex);
      toast.success('Pérdida con robo registrada', { duration: 1500 });
    } else {
      toast.success('Pérdida registrada', { duration: 1500 });
    }
    clearSelection();
    setActionDialog({ open: false, type: null });
  };

  const handleBlockClick = () => {
    addBlock(selectedPlayer.team, selectedPlayer.index);
    setActionDialog({ open: true, type: 'block-received' });
  };

  const handleBlockReceived = (playerIndex) => {
    addBlockReceived(getOpponentTeam(), playerIndex);
    toast.success('Tapón registrado', { duration: 1500 });
    clearSelection();
    setActionDialog({ open: false, type: null });
  };

  const renderSecondaryDialog = () => {
    if (!actionDialog.open) return null;
    
    const opponentPlayers = getOpponentPlayers();
    const sameTeamPlayers = selectedPlayer.team === 'home' ? homeTeam.players : awayTeam.players;

    switch (actionDialog.type) {
      case 'rebound-question':
        return (
          <Dialog open={true} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Hubo rebote?</DialogTitle>
                <DialogDescription>
                  ¿Algún jugador capturó el rebote tras el tiro fallado?
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => handleReboundQuestion(false)}>
                  No
                </Button>
                <Button onClick={() => handleReboundQuestion(true)}>
                  Sí
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );

      case 'rebound-type':
        return (
          <Dialog open={true} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tipo de rebote</DialogTitle>
                <DialogDescription>
                  ¿Fue rebote ofensivo o defensivo?
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => handleReboundType('defensive')}>
                  Defensivo
                </Button>
                <Button onClick={() => handleReboundType('offensive')}>
                  Ofensivo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );

      case 'rebound-player':
        const reboundTeam = reboundType === 'offensive' ? selectedPlayer.team : getOpponentTeam();
        const reboundTeamData = reboundTeam === 'home' ? homeTeam : awayTeam;
        const reboundPlayers = reboundTeamData.players;
        
        return (
          <Dialog open={true} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Jugador que capturó el rebote</DialogTitle>
                <DialogDescription>
                  Selecciona el jugador de {reboundTeamData.name} que capturó el rebote
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleReboundPlayer(null, null)}
                >
                  Rebote de Equipo
                </Button>
                {reboundPlayers.map((player, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleReboundPlayer(reboundTeam, index)}
                  >
                    #{player.number} {player.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        );

      case 'assist-question':
        return (
          <Dialog open={true} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Hubo asistencia?</DialogTitle>
                <DialogDescription>
                  ¿Algún compañero asistió en esta canasta?
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => handleAssistQuestion(false)}>
                  No
                </Button>
                <Button onClick={() => handleAssistQuestion(true)}>
                  Sí
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );

      case 'assist-player':
        return (
          <Dialog open={true} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Seleccionar jugador que asistió</DialogTitle>
                <DialogDescription>
                  ¿Quién dio la asistencia?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {sameTeamPlayers.map((player, index) => {
                  if (index === selectedPlayer.index) return null;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleAssistPlayer(index)}
                    >
                      #{player.number} {player.name}
                    </Button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        );

      case 'foul-received':
        return (
          <Dialog open={true} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Falta recibida por</DialogTitle>
                <DialogDescription>
                  ¿Qué jugador del equipo contrario recibió la falta?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {opponentPlayers.map((player, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleFoulReceived(index)}
                  >
                    #{player.number} {player.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        );

      case 'steal-turnover':
        return (
          <Dialog open={true} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pérdida cometida por</DialogTitle>
                <DialogDescription>
                  ¿Qué jugador del equipo contrario cometió la pérdida?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {opponentPlayers.map((player, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleStealTurnover(index)}
                  >
                    #{player.number} {player.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        );

      case 'turnover-steal':
        return (
          <Dialog open={true} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Hubo robo?</DialogTitle>
              <DialogDescription>
                ¿Algún jugador rival robó el balón?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleTurnoverSteal(false, null)}
              >
                No hubo robo
              </Button>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {opponentPlayers.map((player, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleTurnoverSteal(true, index)}
                  >
                    #{player.number} {player.name}
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
          </Dialog>
        );

      case 'block-received':
        return (
          <Dialog open={true} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tapón recibido por</DialogTitle>
                <DialogDescription>
                  ¿Qué jugador del equipo contrario fue taponado?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {opponentPlayers.map((player, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleBlockReceived(index)}
                  >
                    #{player.number} {player.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {/* Selected Player Info */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Jugador seleccionado:</div>
            <div className="font-semibold text-lg">{getSelectedPlayerName()}</div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <Button
              variant="default"
              onClick={handlePointsClick}
              className="flex flex-col h-16 gap-1"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Puntos</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleFoulClick}
              className="flex flex-col h-16 gap-1"
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-xs">Falta</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReboundClick}
              className="flex flex-col h-16 gap-1"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Rebote</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleStealClick}
              className="flex flex-col h-16 gap-1"
            >
              <Hand className="h-5 w-5" />
              <span className="text-xs">Robo</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleTurnoverClick}
              className="flex flex-col h-16 gap-1"
            >
              <Ban className="h-5 w-5" />
              <span className="text-xs">Pérdida</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleBlockClick}
              className="flex flex-col h-16 gap-1"
            >
              <Shield className="h-5 w-5" />
              <span className="text-xs">Tapón</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={clearSelection}
              className="flex flex-col h-16 gap-1 col-span-2 md:col-span-1 lg:col-span-2"
            >
              <Minus className="h-5 w-5" />
              <span className="text-xs">Cancelar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Points Dialog */}
      {actionDialog.open && actionDialog.type === 'points' && (
        <Dialog 
          open={true} 
          onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}
        >
          <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Puntos</DialogTitle>
            <DialogDescription>
              Selecciona el tipo de tiro para {getSelectedPlayerName()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={shotType} onValueChange={setShotType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1pt" id="1pt" />
                <Label htmlFor="1pt" className="cursor-pointer">Tiro Libre (+1)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2pt" id="2pt" />
                <Label htmlFor="2pt" className="cursor-pointer">Tiro de 2 puntos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3pt" id="3pt" />
                <Label htmlFor="3pt" className="cursor-pointer">Tiro de 3 puntos</Label>
              </div>
            </RadioGroup>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => handleConfirmPoints(false)}>
                Fallo
              </Button>
              <Button onClick={() => handleConfirmPoints(true)}>
                Anotado
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}

      {/* Foul Dialog */}
      {actionDialog.open && actionDialog.type === 'foul' && (
        <Dialog 
          open={true} 
          onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}
        >
          <DialogContent>
          <DialogHeader>
            <DialogTitle>Tipo de Falta</DialogTitle>
            <DialogDescription>
              Selecciona el tipo de falta cometida por {getSelectedPlayerName()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={foulType} onValueChange={setFoulType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="cursor-pointer">Falta Personal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="technical" id="technical" />
                <Label htmlFor="technical" className="cursor-pointer">Falta Técnica</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unsportsmanlike" id="unsportsmanlike" />
                <Label htmlFor="unsportsmanlike" className="cursor-pointer">Falta Antideportiva</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="disqualifying" id="disqualifying" />
                <Label htmlFor="disqualifying" className="cursor-pointer">Falta Descalificante</Label>
              </div>
            </RadioGroup>
            <div className="flex justify-end">
              <Button onClick={handleConfirmFoul}>
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}

      {/* Rebound Dialog */}
      {actionDialog.open && actionDialog.type === 'rebound' && (
        <Dialog 
          open={true} 
          onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}
        >
          <DialogContent>
          <DialogHeader>
            <DialogTitle>Tipo de Rebote</DialogTitle>
            <DialogDescription>
              Selecciona el tipo de rebote para {getSelectedPlayerName()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={reboundType} onValueChange={setReboundType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="defensive" id="defensive" />
                <Label htmlFor="defensive" className="cursor-pointer">Rebote Defensivo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="offensive" id="offensive" />
                <Label htmlFor="offensive" className="cursor-pointer">Rebote Ofensivo</Label>
              </div>
            </RadioGroup>
            <div className="flex justify-end">
              <Button onClick={handleConfirmRebound}>
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}

      {/* Secondary Actions Dialogs */}
      {renderSecondaryDialog()}
    </>
  );
};
