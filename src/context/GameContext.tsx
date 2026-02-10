import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { puzzles, teams } from "@/services/mockData";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface StoneState {
  shieldCount: number;
  blockCount: number;
  shieldActive: boolean;
  blockedUntil: number | null;
}

export interface TeamGameState {
  teamId: string;
  teamName: string;
  score: number;
  currentLevel: number;
  isFrozen: boolean;
  isBlocked: boolean;
  isShielded?: boolean;
}

export interface GameState {
  currentLevel: number;
  completedLevels: number[];
  score: number;
  stones: StoneState;
  gameStarted: boolean;
  isFrozen: boolean;
  isBlocked: boolean;
  frozenUntil: number | null;
  blipPuzzleSolved: boolean;
  powersDisabled: boolean;
  gameDuration: number;
  setGameDuration: (seconds: number) => void;
  notifications: { id: string; message: string; type: 'attack' | 'success' | 'system'; timestamp: string }[];
  allTeamsState: TeamGameState[];
  startGame: () => void;
  submitAnswer: (levelId: number, answer: string) => boolean;
  activateShield: () => void;
  deactivateShield: () => void;
  blockTeam: (targetTeamId: string) => void;
  setIsFrozen: (frozen: boolean) => void;
  setIsBlocked: (blocked: boolean) => void;
  setFrozen: (frozen: boolean, until?: number) => void;
  solveBlipPuzzle: () => void;
  triggerBlip: (blipNumber: 1 | 2) => void;
  freezeTeam: (teamId: string) => void;
  unfreezeTeam: (teamId: string) => void;
}

const GameContext = createContext<GameState | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { team } = useAuth();
  const [gameDuration, setGameDurationState] = useState(7200);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(true);
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenUntil, setFrozenUntil] = useState<number | null>(null);
  const [blipPuzzleSolved, setBlipPuzzleSolved] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [powersDisabled, setPowersDisabled] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const setGameDuration = useCallback((minutes: number) => {
    setGameDurationState(minutes * 60);
  }, []);
  const resetBlipState = () => {
    setBlipPuzzleSolved(false);
  };
  const addNotification = useCallback((message: string, type: 'attack' | 'success' | 'system') => {
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 20)); // Keep last 20
  }, []);
  const [stones, setStones] = useState<StoneState>({
    shieldCount: 1,
    blockCount: 1,
    shieldActive: false,
    blockedUntil: null,
  });

  const [allTeamsState, setAllTeamsState] = useState<TeamGameState[]>(
    teams.map(t => ({
      teamId: t.id,
      teamName: t.name,
      score: Math.floor(Math.random() * 2000),
      currentLevel: Math.floor(Math.random() * 10) + 1,
      isFrozen: false,
      isBlocked: false,
      isShielded: false
    }))
  );

  useEffect(() => {
    if (isBlocked) {
      if (stones.shieldActive) {
        setIsBlocked(false);
        setStones(prev => ({ ...prev, shieldActive: false }));
        toast.success("SHIELD_DEFLECTED_ATTACK", {
          description: "Incoming Power Surge negated by Shield Matrix.",
          className: "h-12 border-l-4 border-blue-400 bg-slate-950 text-white font-display text-[10px]"
        });
      } else {
        toast.error("CRITICAL_SYSTEM_BREACH", {
          description: "Incoming Power Surge detected. System locked.",
          className: "h-12 border-l-4 border-red-600 bg-slate-950 text-white font-display text-[10px]"
        });
      }
    }
  }, [isBlocked, stones.shieldActive]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    toast.success("GAME_START", { description: "Mission parameters initialized." });
  }, []);

  const submitAnswer = useCallback((levelId: number, answer: string): boolean => {
    const puzzle = puzzles.find(p => p.id === levelId);
    if (!puzzle) return false;

    if (answer.trim().toUpperCase() === puzzle.answer.toUpperCase()) {
      setCompletedLevels(prev => [...prev, levelId]);
      setScore(prev => prev + puzzle.points);
      if (levelId < 15) setCurrentLevel(levelId + 1);

      if (levelId === 4 || levelId === 8) {
        setStones(prev => ({
          ...prev,
          shieldCount: prev.shieldCount + 1,
          blockCount: prev.blockCount + 1
        }));
        addNotification(`${team?.name} SOLVED MISSION ${levelId}`, 'success');
        toast.success("TECH_UPGRADE", { description: "Infinity Stones synthesized." });
      }
      toast.success(`MISSION_${levelId}_COMPLETE`, { description: `+${puzzle.points} units added.` });
      return true;
    }
    toast.error("DECRYPTION_FAILED");
    return false;
  }, []);

  const activateShield = useCallback(() => {
    if (powersDisabled) return;
    if (stones.shieldCount <= 0) return;
    setStones(prev => ({ ...prev, shieldActive: true, shieldCount: prev.shieldCount - 1 }));
    toast.success("SHIELD_ACTIVE", { description: "Defense matrix online." });
  }, [stones.shieldCount, powersDisabled]);

  const deactivateShield = useCallback(() => {
    setStones(prev => ({ ...prev, shieldActive: false }));
    toast.info("SHIELD_OFFLINE");
  }, []);

  const blockTeam = useCallback((targetTeamId: string) => {
    if (powersDisabled || stones.blockCount <= 0) return;
    addNotification(`${team?.name} BLOCKED ${targetTeamId}`, 'attack');
    setStones(prev => ({ ...prev, blockCount: prev.blockCount - 1 }));
    setAllTeamsState(prev => prev.map(t => {
      if (t.teamId === targetTeamId) {
        if (t.isShielded) {
          toast.info("TARGET_SHIELDED", { description: `Attack on ${targetTeamId} failed.` });
          return t;
        }
        return { ...t, isBlocked: true };
      }
      return t;
    }));
    toast.success("POWER_SURGE_SENT", { description: `Targeting unit ${targetTeamId}.` });
  }, [stones.blockCount, powersDisabled]);

  const setFrozenState = useCallback((frozen: boolean, until?: number) => {
    setIsFrozen(frozen);
    setFrozenUntil(until || null);
  }, []);

  const solveBlipPuzzle = useCallback(() => {
    addNotification(`${team?.name} BYPASSED BLIP PROTOCOL`, 'success');
    setIsFrozen(false);
    setFrozenUntil(null);
    setScore(prev => prev + 200);
    toast.success("BLIP_BYPASS_SUCCESS");

    // IMPORTANT: Reset the solved flag so the next attack can trigger the overlay 
    setBlipPuzzleSolved(false);
  }, [team, setIsFrozen, setFrozenUntil, setScore, setBlipPuzzleSolved]);

  const triggerBlip = useCallback((blipNumber: 1 | 2) => {
    const toFreeze = [...allTeamsState]
      .filter(t => !t.isFrozen)
      .sort(() => Math.random() - 0.5)
      .slice(0, 15);

    setAllTeamsState(prev => prev.map(t =>
      toFreeze.find(f => f.teamId === t.teamId) ? { ...t, isFrozen: true } : t
    ));

    if (team && toFreeze.find(f => f.teamId === team.id)) {
      setFrozenState(true, Date.now() + 5 * 60 * 1000);
    }
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
      isFrozen, frozenUntil, blipPuzzleSolved, isBlocked, powersDisabled,
      allTeamsState, startGame, submitAnswer, activateShield, deactivateShield,
      blockTeam, setIsFrozen, setIsBlocked, setFrozen: setFrozenState, notifications, solveBlipPuzzle,
      triggerBlip, freezeTeam, unfreezeTeam, gameDuration,
      setGameDuration, resetBlipState
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