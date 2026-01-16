import React from 'react';
import { useGameStore } from '../store/gameStore';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { List } from 'lucide-react';

export const PlayByPlay = () => {
  const { playByPlay, currentQuarter } = useGameStore();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuarterLabel = (quarter) => {
    if (quarter <= 4) {
      return `Q${quarter}`;
    } else {
      return `OT${quarter - 4}`;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <List className="w-5 h-5" />
          Jugada a Jugada
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4">
          {playByPlay.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay jugadas registradas aún
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {playByPlay.map((play) => (
                <div 
                  key={play.id}
                  className="border-l-2 pl-3 py-2 hover:bg-muted/50 transition-colors rounded-r"
                  style={{ borderColor: play.team === 'home' ? '#0074ff' : '#ff4757' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {getQuarterLabel(play.quarter)} - {formatTime(play.time)}
                    </span>
                  </div>
                  <div className="text-sm">{play.text}</div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
