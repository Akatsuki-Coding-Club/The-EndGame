import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import * as api from "@/services/api";

/** UI puzzle shape (id is 1-based level index; missionId for API submit) */
export interface Puzzle {
  id: number;
  title: string;
  description: string;
  question: string;
  answer: string;
  points: number;
  hint?: string;
  missionId?: string;
}

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
  puzzles: Puzzle[];
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
  notifications: { id: string; message: string; type: "attack" | "success" | "system"; timestamp: string }[];
  allTeamsState: TeamGameState[];
  startGame: () => void;
  submitAnswer: (levelId: number, answer: string) => Promise<boolean>;
  activateShield: () => void;
  deactivateShield: () => void;
  blockTeam: (targetTeamId: string) => void;
  setIsFrozen: (frozen: boolean) => void;
  setIsBlocked: (blocked: boolean) => void;
  setFrozen: (frozen: boolean, until?: number) => void;
  submitBlipAnswer: (answer: string) => Promise<boolean>;
  solveBlipPuzzle: () => void;
  triggerBlip: (blipNumber: 1 | 2) => void;
  freezeTeam: (teamId: string) => void;
  unfreezeTeam: (teamId: string) => void;
  refreshTeams: () => Promise<void>;
  gameLoading: boolean;
  resetBlipState: () => void;
  pendingStoneCount: number;
  selectStoneType: (stoneType: "block" | "shield") => Promise<void>;
}

const GameContext = createContext<GameState | null>(null);

function missionToPuzzle(m: api.Mission, index: number): Puzzle {
  return {
    id: index + 1,
    title: m.title,
    description: m.description,
    question: m.description,
    answer: m.answer || "",
    points: m.points || 0,
    missionId: m._id,
  };
}

function teamToGameState(t: {
  _id: string;
  teamName: string;
  score?: number;
  frozenUntil?: string | null;
  blockedUntil?: string | null;
  missionsCompleted?: number;
}): TeamGameState {
  const now = Date.now();
  const frozenUntil = t.frozenUntil ? new Date(t.frozenUntil).getTime() : null;
  const blockedUntil = t.blockedUntil ? new Date(t.blockedUntil).getTime() : null;
  return {
    teamId: t._id,
    teamName: t.teamName,
    score: t.score ?? 0,
    currentLevel: t.missionsCompleted ?? 0,
    isFrozen: !!(frozenUntil && now < frozenUntil),
    isBlocked: !!(blockedUntil && now < blockedUntil),
  };
}

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { team, isAdmin } = useAuth();
  const [gameDuration, setGameDurationState] = useState(7200);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenUntil, setFrozenUntil] = useState<number | null>(null);
  const [blipPuzzleSolved, setBlipPuzzleSolved] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [powersDisabled, setPowersDisabled] = useState(false);
  const [gameLoading, setGameLoading] = useState(true);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "attack" | "success" | "system"; timestamp: string }[]>([]);
  const [stones, setStones] = useState<StoneState>({
    shieldCount: 0,
    blockCount: 0,
    shieldActive: false,
    blockedUntil: null,
  });
  const [pendingStoneCount, setPendingStoneCount] = useState(0);
  const [allTeamsState, setAllTeamsState] = useState<TeamGameState[]>([]);

  const setGameDuration = useCallback((minutes: number) => {
    setGameDurationState(minutes * 60);
  }, []);

  const resetBlipState = useCallback(() => {
    setBlipPuzzleSolved(false);
  }, []);

  const addNotification = useCallback((message: string, type: "attack" | "success" | "system") => {
    setNotifications((prev) => [
      { id: Math.random().toString(36).slice(2, 11), message, type, timestamp: new Date().toLocaleTimeString() },
      ...prev,
    ].slice(0, 20));
  }, []);

  const refreshTeams = useCallback(async () => {
    try {
      const list = await api.getAllTeams();
      setAllTeamsState(list.map(teamToGameState));
    } catch {
      setAllTeamsState([]);
    }
  }, []);

  // Sync my state from API (me + stone status + game state)
  const syncMyState = useCallback(async () => {
    if (!api.getToken()) return;
    try {
      const [me, stoneStatus, gameState] = await Promise.all([
        api.getMe(),
        api.getStoneStatus().catch(() => null),
        api.getGameState().catch(() => null),
      ]);

      setScore(me.score ?? 0);
      const fUntil = me.frozenUntil ? new Date(me.frozenUntil).getTime() : null;
      const bUntil = me.blockedUntil ? new Date(me.blockedUntil).getTime() : null;
      setIsFrozen(!!(fUntil && Date.now() < fUntil));
      setIsBlocked(!!(bUntil && Date.now() < bUntil));
      setFrozenUntil(fUntil && Date.now() < fUntil ? fUntil : null);

      if (gameState) {
        setGameStarted(gameState.phase === "running");
        setPowersDisabled(gameState.lockdown ?? false);
      }

      if (stoneStatus) {
        const st = stoneStatus.stoneType || {};
        setStones({
          shieldCount: st.shield ?? 0,
          blockCount: st.block ?? 0,
          shieldActive: stoneStatus.shieldActive ?? false,
          blockedUntil: stoneStatus.blockedUntil ? new Date(stoneStatus.blockedUntil).getTime() : null,
        });
        setPendingStoneCount(stoneStatus.pendingStoneCount ?? 0);
      }
    } catch {
      // ignore
    }
  }, []);

  // Load missions (puzzles) and teams
  useEffect(() => {
    if (!team) {
      setGameLoading(false);
      setPuzzles([]);
      setAllTeamsState([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setGameLoading(true);
      try {
        const [missionsList, gameState] = await Promise.all([
          api.getMissions(),
          api.getGameState().catch(() => null),
        ]);

        if (cancelled) return;
        if (missionsList.length) {
          setPuzzles(missionsList.map((m, i) => missionToPuzzle(m, i)));
        }
        if (gameState) {
          setGameStarted(gameState.phase === "running");
          setPowersDisabled(gameState.lockdown ?? false);
        }

        await refreshTeams();
        await syncMyState();
      } catch {
        if (!cancelled) setPuzzles([]);
      } finally {
        if (!cancelled) setGameLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [team?.id, isAdmin, refreshTeams, syncMyState]);

  // Poll to sync state (blip/freeze/block updates from backend)
  useEffect(() => {
    if (!team || isAdmin) return;
    const interval = setInterval(syncMyState, 15000);
    return () => clearInterval(interval);
  }, [team?.id, isAdmin, syncMyState]);

  useEffect(() => {
    if (isBlocked && stones.shieldActive) {
      setIsBlocked(false);
      setStones((prev) => ({ ...prev, shieldActive: false }));
      toast.success("SHIELD_DEFLECTED_ATTACK", {
        description: "Incoming Power Surge negated by Shield Matrix.",
        className: "h-12 border-l-4 border-blue-400 bg-slate-950 text-white font-display text-[10px]",
      });
    } else if (isBlocked) {
      toast.error("CRITICAL_SYSTEM_BREACH", {
        description: "Incoming Power Surge detected. System locked.",
        className: "h-12 border-l-4 border-red-600 bg-slate-950 text-white font-display text-[10px]",
      });
    }
  }, [isBlocked, stones.shieldActive]);

  const startGame = useCallback(async () => {
    try {
      await api.startGame();
      setGameStarted(true);
      toast.success("GAME_START", { description: "Mission parameters initialized." });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, []);

  const submitAnswer = useCallback(
    async (levelId: number, answer: string): Promise<boolean> => {
      const puzzle = puzzles.find((p) => p.id === levelId);
      if (!puzzle?.missionId) {
        toast.error("DECRYPTION_FAILED");
        return false;
      }
      try {
        const result = await api.submitMission(puzzle.missionId, answer);
        if (result.correct) {
          setCompletedLevels((prev) => (prev.includes(levelId) ? prev : [...prev, levelId]));
          setScore((prev) => prev + result.points);
          if (levelId < puzzles.length) setCurrentLevel(levelId + 1);
          addNotification(`${team?.name} SOLVED MISSION ${levelId}`, "success");
          toast.success(`MISSION_${levelId}_COMPLETE`, { description: `+${result.points} units added.` });
          await syncMyState();
          await refreshTeams();
          return true;
        }
      } catch (e) {
        toast.error((e as Error).message);
      }
      toast.error("DECRYPTION_FAILED");
      return false;
    },
    [puzzles, team?.name, syncMyState, refreshTeams, addNotification]
  );

  const activateShield = useCallback(async () => {
    if (powersDisabled || stones.shieldCount <= 0) return;
    try {
      await api.useStone("shield");
      setStones((prev) => ({ ...prev, shieldActive: true, shieldCount: prev.shieldCount - 1 }));
      toast.success("SHIELD_ACTIVE", { description: "Defense matrix online." });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [stones.shieldCount, powersDisabled]);

  const deactivateShield = useCallback(() => {
    setStones((prev) => ({ ...prev, shieldActive: false }));
    toast.info("SHIELD_OFFLINE");
  }, []);

  const blockTeam = useCallback(
    async (targetTeamId: string) => {
      if (powersDisabled || stones.blockCount <= 0) return;
      try {
        await api.useBlock(targetTeamId);
        addNotification(`${team?.name} BLOCKED ${targetTeamId}`, "attack");
        setStones((prev) => ({ ...prev, blockCount: prev.blockCount - 1 }));
        await refreshTeams();
        toast.success("POWER_SURGE_SENT", { description: `Targeting unit ${targetTeamId}.` });
      } catch (e) {
        toast.info("TARGET_SHIELDED", { description: (e as Error).message });
      }
    },
    [stones.blockCount, powersDisabled, team?.name, refreshTeams, addNotification]
  );

  const setFrozenState = useCallback((frozen: boolean, until?: number) => {
    setIsFrozen(frozen);
    setFrozenUntil(until ?? null);
  }, []);

  const submitBlipAnswer = useCallback(
    async (answer: string): Promise<boolean> => {
      try {
        const result = await api.submitBlipPuzzle(answer);
        if (result.correct) {
          addNotification(`${team?.name} BYPASSED BLIP PROTOCOL`, "success");
          setIsFrozen(false);
          setFrozenUntil(null);
          setScore((prev) => prev + (result.points || 0));
          setBlipPuzzleSolved(false);
          toast.success("BLIP_BYPASS_SUCCESS");
          await syncMyState();
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    },
    [team?.name, syncMyState, addNotification]
  );

  const solveBlipPuzzle = useCallback(() => {
    setBlipPuzzleSolved(false);
    setIsFrozen(false);
    setFrozenUntil(null);
  }, []);

  const triggerBlip = useCallback(
    async (blipNumber: 1 | 2) => {
      try {
        await api.triggerBlip(blipNumber);
        await refreshTeams();
        const me = await api.getMe();
        const fUntil = me.frozenUntil ? new Date(me.frozenUntil).getTime() : null;
        if (fUntil && Date.now() < fUntil && team) {
          setFrozenState(true, fUntil);
        }
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [team, setFrozenState, refreshTeams]
  );

  const freezeTeam = useCallback(
    (teamId: string) => {
      setAllTeamsState((prev) =>
        prev.map((t) => (t.teamId === teamId ? { ...t, isFrozen: true } : t))
      );
      if (team?.id === teamId) setFrozenState(true, Date.now() + 5 * 60 * 1000);
    },
    [team, setFrozenState]
  );

  const unfreezeTeam = useCallback(
    (teamId: string) => {
      setAllTeamsState((prev) =>
        prev.map((t) => (t.teamId === teamId ? { ...t, isFrozen: false } : t))
      );
      if (team?.id === teamId) setFrozenState(false);
    },
    [team, setFrozenState]
  );

  const selectStoneType = useCallback(
    async (stoneType: "block" | "shield") => {
      try {
        await api.selectStoneType(stoneType);
        toast.success(stoneType === "shield" ? "Shield Matrix acquired!" : "Power Surge acquired!");
        await syncMyState();
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [syncMyState]
  );

  return (
    <GameContext.Provider
      value={{
        puzzles,
        currentLevel,
        completedLevels,
        score,
        stones,
        gameStarted,
        isFrozen,
        frozenUntil,
        blipPuzzleSolved,
        isBlocked,
        powersDisabled,
        allTeamsState,
        startGame,
        submitAnswer,
        activateShield,
        deactivateShield,
        blockTeam,
        setIsFrozen,
        setIsBlocked,
        setFrozen: setFrozenState,
        notifications,
        submitBlipAnswer,
        solveBlipPuzzle,
        triggerBlip,
        freezeTeam,
        unfreezeTeam,
        gameDuration,
        setGameDuration,
        refreshTeams,
        gameLoading,
        resetBlipState,
        pendingStoneCount,
        selectStoneType,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};
