import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Trophy } from 'lucide-react';

export const Scoreboard = () => {
  const { homeTeam, awayTeam, homeScore, awayScore } = useGameStore();

  return (
    <div className="grid grid-cols-3 gap-4 items-center w-full max-w-4xl mx-auto">
      {/* Home Team */}
      <div className="text-center space-y-2">
        <div 
          className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
          style={{ 
            backgroundColor: homeTeam.color + '20',
            color: homeTeam.color,
            border: `2px solid ${homeTeam.color}`,
          }}
        >
          {homeTeam.name}
        </div>
        <div 
          className="font-digital text-6xl md:text-7xl font-bold tracking-wider"
          style={{ color: homeTeam.color }}
        >
          {homeScore}
        </div>
      </div>

      {/* VS Separator */}
      <div className="flex flex-col items-center justify-center">
        <Trophy className="w-8 h-8 text-muted-foreground mb-2" />
        <span className="text-sm font-medium text-muted-foreground">VS</span>
      </div>

      {/* Away Team */}
      <div className="text-center space-y-2">
        <div 
          className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
          style={{ 
            backgroundColor: awayTeam.color + '20',
            color: awayTeam.color,
            border: `2px solid ${awayTeam.color}`,
          }}
        >
          {awayTeam.name}
        </div>
        <div 
          className="font-digital text-6xl md:text-7xl font-bold tracking-wider"
          style={{ color: awayTeam.color }}
        >
          {awayScore}
        </div>
      </div>
    </div>
  );
};
