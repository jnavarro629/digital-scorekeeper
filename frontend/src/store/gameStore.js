import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'basketball-scorekeeper-game';

const initialState = {
  // Game configuration
  homeTeam: { name: '', color: '#0074ff', players: [] },
  awayTeam: { name: '', color: '#ff4757', players: [] },
  quarterDuration: 10, // minutes
  city: '',
  category: '',
  
  // Game state
  isConfigured: false,
  gameStarted: false,
  
  // Score
  homeScore: 0,
  awayScore: 0,
  
  // Time tracking
  currentQuarter: 1,
  timeElapsed: 0, // seconds
  isTimerRunning: false,
  
  // Active players (indices of players array)
  homeActivePlayers: [0, 1, 2, 3, 4],
  awayActivePlayers: [0, 1, 2, 3, 4],
  
  // Selected player for action
  selectedPlayer: null, // { team: 'home'|'away', index: number }
  
  // Play by play log
  playByPlay: [],
  
  // Player statistics
  homePlayerStats: [],
  awayPlayerStats: [],
  
  // History for undo
  history: [],
};

const createEmptyPlayerStats = (playerName) => ({
  name: playerName,
  minutes: 0,
  points: 0,
  fg2Attempted: 0,
  fg2Made: 0,
  fg3Attempted: 0,
  fg3Made: 0,
  ftAttempted: 0,
  ftMade: 0,
  rebounds: 0,
  reboundsOffensive: 0,
  reboundsDefensive: 0,
  assists: 0,
  steals: 0,
  turnovers: 0,
  blocks: 0,
  blocksReceived: 0,
  foulsCommitted: 0,
  foulsReceived: 0,
  plusMinus: 0,
});

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Configuration actions
      setTeamConfig: (team, config) => set((state) => ({
        [team === 'home' ? 'homeTeam' : 'awayTeam']: config,
      })),
      
      setQuarterDuration: (duration) => set({ quarterDuration: duration }),
      
      setGameInfo: (info) => set({ city: info.city, category: info.category }),
      
      completeConfiguration: () => {
        const state = get();
        const homeStats = state.homeTeam.players.map(p => createEmptyPlayerStats(p.name));
        const awayStats = state.awayTeam.players.map(p => createEmptyPlayerStats(p.name));
        
        set({
          isConfigured: true,
          homePlayerStats: homeStats,
          awayPlayerStats: awayStats,
        });
      },
      
      // Game control
      startGame: () => set({ gameStarted: true }),
      
      startTimer: () => set({ isTimerRunning: true }),
      
      pauseTimer: () => set({ isTimerRunning: false }),
      
      resetTimer: () => set({ timeElapsed: 0 }),
      
      updateTime: (seconds) => set({ timeElapsed: seconds }),
      
      nextQuarter: () => {
        const state = get();
        set({ 
          currentQuarter: state.currentQuarter + 1,
          timeElapsed: 0,
          isTimerRunning: false,
        });
      },
      
      // Player selection
      selectPlayer: (team, index) => set({ selectedPlayer: { team, index } }),
      
      clearSelection: () => set({ selectedPlayer: null }),
      
      // Substitutions
      substitutePlayer: (team, activeIndex, benchIndex) => {
        const activeKey = team === 'home' ? 'homeActivePlayers' : 'awayActivePlayers';
        set((state) => {
          const newActive = [...state[activeKey]];
          newActive[activeIndex] = benchIndex;
          return { [activeKey]: newActive };
        });
      },
      
      // Save state for undo
      saveStateForUndo: () => {
        const state = get();
        const snapshot = {
          homeScore: state.homeScore,
          awayScore: state.awayScore,
          playByPlay: [...state.playByPlay],
          homePlayerStats: JSON.parse(JSON.stringify(state.homePlayerStats)),
          awayPlayerStats: JSON.parse(JSON.stringify(state.awayPlayerStats)),
        };
        set((state) => ({
          history: [...state.history.slice(-9), snapshot], // Keep last 10
        }));
      },
      
      // Undo last action
      undo: () => {
        const state = get();
        if (state.history.length === 0) return;
        
        const lastState = state.history[state.history.length - 1];
        set({
          homeScore: lastState.homeScore,
          awayScore: lastState.awayScore,
          playByPlay: lastState.playByPlay,
          homePlayerStats: lastState.homePlayerStats,
          awayPlayerStats: lastState.awayPlayerStats,
          history: state.history.slice(0, -1),
        });
      },
      
      // Statistics actions
      addPoints: (team, playerIndex, points, type) => {
        get().saveStateForUndo();
        
        const statsKey = team === 'home' ? 'homePlayerStats' : 'awayPlayerStats';
        const scoreKey = team === 'home' ? 'homeScore' : 'awayScore';
        
        set((state) => {
          const newStats = [...state[statsKey]];
          const player = newStats[playerIndex];
          
          player.points += points;
          
          if (type === '2pt') {
            player.fg2Attempted += 1;
            player.fg2Made += 1;
          } else if (type === '3pt') {
            player.fg3Attempted += 1;
            player.fg3Made += 1;
          } else if (type === '1pt') {
            player.ftAttempted += 1;
            player.ftMade += 1;
          }
          
          // Update play by play
          const teamName = team === 'home' ? state.homeTeam.name : state.awayTeam.name;
          const playText = `${teamName} - ${player.name}: +${points} puntos (${type})`;
          const newPlay = {
            id: Date.now(),
            quarter: state.currentQuarter,
            time: state.timeElapsed,
            team,
            player: playerIndex,
            action: 'points',
            details: { points, type },
            text: playText,
          };
          
          return {
            [statsKey]: newStats,
            [scoreKey]: state[scoreKey] + points,
            playByPlay: [newPlay, ...state.playByPlay],
          };
        });
      },
      
      addMissedShot: (team, playerIndex, type) => {
        get().saveStateForUndo();
        
        const statsKey = team === 'home' ? 'homePlayerStats' : 'awayPlayerStats';
        
        set((state) => {
          const newStats = [...state[statsKey]];
          const player = newStats[playerIndex];
          
          if (type === '2pt') {
            player.fg2Attempted += 1;
          } else if (type === '3pt') {
            player.fg3Attempted += 1;
          } else if (type === '1pt') {
            player.ftAttempted += 1;
          }
          
          const teamName = team === 'home' ? state.homeTeam.name : state.awayTeam.name;
          const playText = `${teamName} - ${player.name}: Fallo (${type})`;
          const newPlay = {
            id: Date.now(),
            quarter: state.currentQuarter,
            time: state.timeElapsed,
            team,
            player: playerIndex,
            action: 'missed',
            details: { type },
            text: playText,
          };
          
          return {
            [statsKey]: newStats,
            playByPlay: [newPlay, ...state.playByPlay],
          };
        });
      },
      
      addRebound: (team, playerIndex, type) => {
        get().saveStateForUndo();
        
        const statsKey = team === 'home' ? 'homePlayerStats' : 'awayPlayerStats';
        
        set((state) => {
          const newStats = [...state[statsKey]];
          const player = newStats[playerIndex];
          
          player.rebounds += 1;
          if (type === 'offensive') {
            player.reboundsOffensive += 1;
          } else {
            player.reboundsDefensive += 1;
          }
          
          const teamName = team === 'home' ? state.homeTeam.name : state.awayTeam.name;
          const rebType = type === 'offensive' ? 'Ofensivo' : 'Defensivo';
          const playText = `${teamName} - ${player.name}: Rebote ${rebType}`;
          const newPlay = {
            id: Date.now(),
            quarter: state.currentQuarter,
            time: state.timeElapsed,
            team,
            player: playerIndex,
            action: 'rebound',
            details: { type },
            text: playText,
          };
          
          return {
            [statsKey]: newStats,
            playByPlay: [newPlay, ...state.playByPlay],
          };
        });
      },
      
      addAssist: (team, playerIndex) => {
        const statsKey = team === 'home' ? 'homePlayerStats' : 'awayPlayerStats';
        
        set((state) => {
          const newStats = [...state[statsKey]];
          newStats[playerIndex].assists += 1;
          
          const teamName = team === 'home' ? state.homeTeam.name : state.awayTeam.name;
          const playerName = newStats[playerIndex].name;
          const playText = `${teamName} - ${playerName}: Asistencia`;
          const newPlay = {
            id: Date.now(),
            quarter: state.currentQuarter,
            time: state.timeElapsed,
            team,
            player: playerIndex,
            action: 'assist',
            details: {},
            text: playText,
          };
          
          return {
            [statsKey]: newStats,
            playByPlay: [newPlay, ...state.playByPlay],
          };
        });
      },
      
      addSteal: (team, playerIndex) => {
        get().saveStateForUndo();
        
        const statsKey = team === 'home' ? 'homePlayerStats' : 'awayPlayerStats';
        
        set((state) => {
          const newStats = [...state[statsKey]];
          newStats[playerIndex].steals += 1;
          
          const teamName = team === 'home' ? state.homeTeam.name : state.awayTeam.name;
          const playerName = newStats[playerIndex].name;
          const playText = `${teamName} - ${playerName}: Robo`;
          const newPlay = {
            id: Date.now(),
            quarter: state.currentQuarter,
            time: state.timeElapsed,
            team,
            player: playerIndex,
            action: 'steal',
            details: {},
            text: playText,
          };
          
          return {
            [statsKey]: newStats,
            playByPlay: [newPlay, ...state.playByPlay],
          };
        });
      },
      
      addTurnover: (team, playerIndex) => {
        get().saveStateForUndo();
        
        const statsKey = team === 'home' ? 'homePlayerStats' : 'awayPlayerStats';
        
        set((state) => {
          const newStats = [...state[statsKey]];
          newStats[playerIndex].turnovers += 1;
          
          const teamName = team === 'home' ? state.homeTeam.name : state.awayTeam.name;
          const playerName = newStats[playerIndex].name;
          const playText = `${teamName} - ${playerName}: Pérdida`;
          const newPlay = {
            id: Date.now(),
            quarter: state.currentQuarter,
            time: state.timeElapsed,
            team,
            player: playerIndex,
            action: 'turnover',
            details: {},
            text: playText,
          };
          
          return {
            [statsKey]: newStats,
            playByPlay: [newPlay, ...state.playByPlay],
          };
        });
      },
      
      addBlock: (team, playerIndex) => {
        get().saveStateForUndo();
        
        const statsKey = team === 'home' ? 'homePlayerStats' : 'awayPlayerStats';
        
        set((state) => {
          const newStats = [...state[statsKey]];
          newStats[playerIndex].blocks += 1;
          
          const teamName = team === 'home' ? state.homeTeam.name : state.awayTeam.name;
          const playerName = newStats[playerIndex].name;
          const playText = `${teamName} - ${playerName}: Tapón`;
          const newPlay = {
            id: Date.now(),
            quarter: state.currentQuarter,
            time: state.timeElapsed,
            team,
            player: playerIndex,
            action: 'block',
            details: {},
            text: playText,
          };
          
          return {
            [statsKey]: newStats,
            playByPlay: [newPlay, ...state.playByPlay],
          };
        });
      },
      
      addBlockReceived: (team, playerIndex) => {
        const statsKey = team === 'home' ? 'homePlayerStats' : 'awayPlayerStats';
        
        set((state) => {
          const newStats = [...state[statsKey]];
          newStats[playerIndex].blocksReceived += 1;
          return { [statsKey]: newStats };
        });
      },
      
      addFoul: (team, playerIndex, foulType) => {
        get().saveStateForUndo();
        
        const statsKey = team === 'home' ? 'homePlayerStats' : 'awayPlayerStats';
        
        set((state) => {
          const newStats = [...state[statsKey]];
          newStats[playerIndex].foulsCommitted += 1;
          
          const teamName = team === 'home' ? state.homeTeam.name : state.awayTeam.name;
          const playerName = newStats[playerIndex].name;
          const foulTypeText = {
            personal: 'Personal',
            technical: 'Técnica',
            unsportsmanlike: 'Antideportiva',
            disqualifying: 'Descalificante',
          }[foulType] || 'Personal';
          const playText = `${teamName} - ${playerName}: Falta ${foulTypeText}`;
          const newPlay = {
            id: Date.now(),
            quarter: state.currentQuarter,
            time: state.timeElapsed,
            team,
            player: playerIndex,
            action: 'foul',
            details: { foulType },
            text: playText,
          };
          
          return {
            [statsKey]: newStats,
            playByPlay: [newPlay, ...state.playByPlay],
          };
        });
      },
      
      addFoulReceived: (team, playerIndex) => {
        const statsKey = team === 'home' ? 'homePlayerStats' : 'awayPlayerStats';
        
        set((state) => {
          const newStats = [...state[statsKey]];
          newStats[playerIndex].foulsReceived += 1;
          return { [statsKey]: newStats };
        });
      },
      
      // Reset game
      resetGame: () => set(initialState),
      
      // Export data
      getGameData: () => {
        const state = get();
        return {
          homeTeam: state.homeTeam,
          awayTeam: state.awayTeam,
          homeScore: state.homeScore,
          awayScore: state.awayScore,
          currentQuarter: state.currentQuarter,
          quarterDuration: state.quarterDuration,
          homePlayerStats: state.homePlayerStats,
          awayPlayerStats: state.awayPlayerStats,
          playByPlay: state.playByPlay,
        };
      },
    }),
    {
      name: STORAGE_KEY,
      partialUpdate: true,
    }
  )
);
