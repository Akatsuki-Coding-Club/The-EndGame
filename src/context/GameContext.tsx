import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { puzzles, teams } from "@/services/mockData";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface StoneState {
  shieldCount: number;
  blockCount: number;
  shieldActive: boolean;
  blockedUntil: number | null; // timestamp
}

export interface GameState {
  currentLevel: number;
  completedLevels: number[];
  score: number;
  stones: StoneState;
  gameStarted: boolean;
  isFrozen: boolean;
  frozenUntil: number | null;
  blipPuzzleSolved: boolean;
  startGame: () => void;
  submitAnswer: (levelId: number, answer: string) => boolean;
  activateShield: () => void;
  deactivateShield: () => void;
  blockTeam: (targetTeamId: string) => void;
  setFrozen: (frozen: boolean, until?: number) => void;
  solveBlipPuzzle: () => void;
  powersDisabled: boolean;
  /* Admin: all teams state */
  allTeamsState: TeamGameState[];
  triggerBlip: (blipNumber: 1 | 2) => void;
  freezeTeam: (teamId: string) => void;
  unfreezeTeam: (teamId: string) => void;
}

export interface TeamGameState {
  teamId: string;
  teamName: string;
  score: number;
  currentLevel: number;
  isFrozen: boolean;
  isBlocked: boolean;
}

const GameContext = createContext<GameState | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { team } = useAuth();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenUntil, setFrozenUntil] = useState<number | null>(null);
  const [blipPuzzleSolved, setBlipPuzzleSolved] = useState(false);
  const [stones, setStones] = useState<StoneState>({
    shieldCount: 0, blockCount: 0, shieldActive: false, blockedUntil: null,
  });
  const [powersDisabled, setPowersDisabled] = useState(false);

  // Mock all teams state for admin
  const [allTeamsState, setAllTeamsState] = useState<TeamGameState[]>(
    teams.map(t => ({
      teamId: t.id, teamName: t.name, score: Math.floor(Math.random() * 2000),
      currentLevel: Math.floor(Math.random() * 10) + 1, isFrozen: false, isBlocked: false,
    }))
  );

  const startGame = useCallback(() => {
    setGameStarted(true);
    toast.success("Game started! You have 2 hours.", { className: "neon-border" });
  }, []);

  const submitAnswer = useCallback((levelId: number, answer: string): boolean => {
    if (stones.blockedUntil && Date.now() < stones.blockedUntil) {
      toast.error("You are BLOCKED! Wait for the effect to expire.");
      return false;
    }
    const puzzle = puzzles.find(p => p.id === levelId);
    if (!puzzle) return false;
    if (answer.trim().toUpperCase() === puzzle.answer.toUpperCase()) {
      setCompletedLevels(prev => [...prev, levelId]);
      setScore(prev => prev + puzzle.points);
      if (levelId < 15) setCurrentLevel(levelId + 1);
      // Award stones after level 4 and 8
      if (levelId === 4) {
        setStones(prev => ({ ...prev, shieldCount: prev.shieldCount + 1, blockCount: prev.blockCount + 1 }));
        toast.success("🔮 Power Stone earned! You got a Shield and a Block stone!", { duration: 4000 });
      }
      if (levelId === 8) {
        setStones(prev => ({ ...prev, shieldCount: prev.shieldCount + 1, blockCount: prev.blockCount + 1 }));
        toast.success("🔮 Power Stone earned! Another Shield and Block stone!", { duration: 4000 });
      }
      toast.success(`Level ${levelId} complete! +${puzzle.points} points`);
      return true;
    }
    toast.error("Incorrect answer. Try again!");
    return false;
  }, [stones.blockedUntil]);

  const activateShield = useCallback(() => {
    if (powersDisabled) { toast.error("Powers are disabled in the last 20 minutes!"); return; }
    if (stones.shieldCount <= 0) { toast.error("No Shield stones available!"); return; }
    setStones(prev => ({ ...prev, shieldActive: true, shieldCount: prev.shieldCount - 1 }));
    toast.success("🛡️ Shield activated!");
  }, [stones.shieldCount, powersDisabled]);

  const deactivateShield = useCallback(() => {
    setStones(prev => ({ ...prev, shieldActive: false }));
    toast.info("Shield deactivated.");
  }, []);

  const blockTeam = useCallback((targetTeamId: string) => {
    if (powersDisabled) { toast.error("Powers are disabled in the last 20 minutes!"); return; }
    if (stones.blockCount <= 0) { toast.error("No Block stones available!"); return; }
    setStones(prev => ({ ...prev, blockCount: prev.blockCount - 1 }));
    // Simulate blocking effect on target
    setAllTeamsState(prev => prev.map(t =>
      t.teamId === targetTeamId ? { ...t, isBlocked: true } : t
    ));
    // Auto-unblock after 2 minutes
    setTimeout(() => {
      setAllTeamsState(prev => prev.map(t =>
        t.teamId === targetTeamId ? { ...t, isBlocked: false } : t
      ));
    }, 120_000);
    toast.success(`⚡ Block stone used on ${targetTeamId}!`);
  }, [stones.blockCount, powersDisabled]);

  const setFrozenState = useCallback((frozen: boolean, until?: number) => {
    setIsFrozen(frozen);
    setFrozenUntil(until || null);
    if (frozen) toast.error("❄️ You have been FROZEN by the Blip Protocol!");
    else toast.success("🔥 You are unfrozen! Keep going!");
  }, []);

  const solveBlipPuzzle = useCallback(() => {
    setBlipPuzzleSolved(true);
    setIsFrozen(false);
    setFrozenUntil(null);
    setScore(prev => prev + 200);
    toast.success("🎉 Blip puzzle solved! You're free + 200 bonus points!");
  }, []);

  /* Admin controls */
  const triggerBlip = useCallback((blipNumber: 1 | 2) => {
    const teamsCopy = [...allTeamsState];
    const unfrozen = teamsCopy.filter(t => !t.isFrozen);
    const toFreeze = unfrozen.sort(() => Math.random() - 0.5).slice(0, 15);
    setAllTeamsState(prev => prev.map(t =>
      toFreeze.find(f => f.teamId === t.teamId) ? { ...t, isFrozen: true } : t
    ));
    // If current team is in the freeze list
    if (team && toFreeze.find(f => f.teamId === team.id)) {
      setFrozenState(true, Date.now() + 5 * 60 * 1000);
    }
    toast.info(`Blip ${blipNumber} triggered! 15 teams frozen.`);
  }, [allTeamsState, team, setFrozenState]);

  const freezeTeam = useCallback((teamId: string) => {
    setAllTeamsState(prev => prev.map(t => t.teamId === teamId ? { ...t, isFrozen: true } : t));
    if (team && team.id === teamId) setFrozenState(true, Date.now() + 5 * 60 * 1000);
  }, [team, setFrozenState]);

  const unfreezeTeam = useCallback((teamId: string) => {
    setAllTeamsState(prev => prev.map(t => t.teamId === teamId ? { ...t, isFrozen: false } : t));
    if (team && team.id === teamId) setFrozenState(false);
  }, [team, setFrozenState]);

  return (
    <GameContext.Provider value={{
      currentLevel, completedLevels, score, stones, gameStarted,
      isFrozen, frozenUntil, blipPuzzleSolved,
      startGame, submitAnswer, activateShield, deactivateShield,
      blockTeam, setFrozen: setFrozenState, solveBlipPuzzle, powersDisabled,
      allTeamsState, triggerBlip, freezeTeam, unfreezeTeam,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};
