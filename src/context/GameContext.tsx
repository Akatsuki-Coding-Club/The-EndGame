import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo, useRef } from "react";
import ShieldDefendModal from "@/components/ShieldDefendModal";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import * as api from "@/services/api";
import { io, Socket } from "socket.io-client";
import { API_BASE } from "../services/api";
import { useNavigate } from "react-router-dom";
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
  ownedStones: string[];
}

export interface TeamGameState {
  teamId: string;
  teamName: string;
  score: number;
  currentLevel: number;
  isFrozen: boolean;
  role?: string;
  isBlocked: boolean;
  isShielded?: boolean;
  cooldownUntil?: string | null;
  stones: string[];
  completedTimelines: string[];
  snapActivated: boolean;
  currentTimeline?: string | null;
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
  blipPuzzleQuestion?: string | null;
  blockPuzzleQuestion?: string | null;
  powersDisabled: boolean;
  gameDuration: number;
  gameEndTime: number | null;
  setGameDuration: (seconds: number) => void;
  notifications: { id: string; message: string; type: "attack" | "success" | "system"; timestamp: string }[];
  allTeamsState: TeamGameState[];
  startGame: (gameId?: string) => void;
  submitAnswer: (levelId: number, answer: string) => Promise<boolean>;
  activateShield: () => void;
  deactivateShield: () => void;
  blockTeam: (targetTeamId: string) => void;
  setIsFrozen: (frozen: boolean) => void;
  setIsBlocked: (blocked: boolean) => void;
  setBlockPuzzleQuestion?: (q: string | null) => void;
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
  showShieldOffer?: boolean;
  pendingAttackerId?: string | null;
  respondToAttack?: (attackerId: string, action: "useShield" | "continue") => Promise<void>;
  isSnapReady: boolean;
  isSnapping: boolean;
  snapWinner: TeamGameState | null;
  initiateSupremeSnap: () => Promise<void>;
  isSocketConnected: boolean;
  showToast: (message: string, type?: "success" | "error" | "info", description?: string) => void;
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
  role?: string;
  stones?: string[];
  completedTimelines?: string[];
  cooldownUntil?: string | null;
  snapActivated?: boolean;
  currentTimeline?: string | null;
}): TeamGameState {
  const now = Date.now();
  const frozenUntil = t.frozenUntil ? new Date(t.frozenUntil).getTime() : null;
  const blockedUntil = t.blockedUntil ? new Date(t.blockedUntil).getTime() : null;
  return {
    teamId: t._id,
    teamName: t.teamName,
    score: t.score ?? 0,
    currentLevel: (t.missionsCompleted ?? 0) + 1,
    isFrozen: !!(frozenUntil && now < frozenUntil),
    isBlocked: !!(blockedUntil && now < blockedUntil),
    role: t.role || "team",
    cooldownUntil: t.cooldownUntil || null,
    stones: t.stones || [],
    completedTimelines: t.completedTimelines || [],
    snapActivated: t.snapActivated || false,
    currentTimeline: t.currentTimeline || null,
  };
}

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { team, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [gameDuration, setGameDurationState] = useState(7200);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenUntil, setFrozenUntil] = useState<number | null>(null);
  const [blipPuzzleSolved, setBlipPuzzleSolved] = useState(false);
  const [blipPuzzleQuestion, setBlipPuzzleQuestion] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [blockPuzzleQuestion, setBlockPuzzleQuestion] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showShieldOffer, setShowShieldOffer] = useState(false);
  const [pendingAttackerId, setPendingAttackerId] = useState<string | null>(null);

  // Supreme Snap State
  const [isSnapping, setIsSnapping] = useState(false);
  const [snapWinner, setSnapWinner] = useState<TeamGameState | null>(null);

  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const [powersDisabled, setPowersDisabled] = useState(false);
  const [gameLoading, setGameLoading] = useState(true);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "attack" | "success" | "system"; timestamp: string; fullTime?: string }[]>(() => {
    try {
      const stored = localStorage.getItem("systemLogs");
      if (stored) return JSON.parse(stored);
    } catch { }
    return [];
  });
  const [stones, setStones] = useState<StoneState>({
    shieldCount: 0,
    blockCount: 0,
    shieldActive: false,
    blockedUntil: null,
    ownedStones: [],
  });
  const [pendingStoneCount, setPendingStoneCount] = useState(0);
  const [allTeamsState, setAllTeamsState] = useState<TeamGameState[]>([]);
  const lastStateFetchRef = useRef<number>(0);
  const isInitialFetchDoneRef = useRef(false);

  const setGameDuration = useCallback((minutes: number) => {
    setGameDurationState(minutes * 60);
  }, []);

  const resetBlipState = useCallback(() => {
    setBlipPuzzleSolved(false);
  }, []);

  const addNotification = useCallback((message: string, type: "attack" | "success" | "system") => {
    setNotifications((prev) => {
      const updated = [
        { id: Math.random().toString(36).slice(2, 11), message, type, timestamp: new Date().toLocaleTimeString(), fullTime: new Date().toISOString() },
        ...prev,
      ].slice(0, 50);
      localStorage.setItem("systemLogs", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info", description?: string) => {
    toast.dismiss();
    const options = {
      description,
      duration: 1500,
    };
    if (type === "success") toast.success(message, options);
    else if (type === "error") toast.error(message, options);
    else toast(message, options);
  }, []);

  const refreshTeams = useCallback(async () => {
    // Throttle refreshes to once every 20 seconds to reduce server load
    const now = Date.now();
    if (now - lastStateFetchRef.current < 20000) return;
    lastStateFetchRef.current = now;

    try {
      const list = await api.getAllTeams();
      setAllTeamsState(list.map(teamToGameState));
    } catch {
      setAllTeamsState([]);
    }
  }, []);

  const isSnapReady = stones.ownedStones.length === 6 && !isSnapping && !snapWinner;

  const syncMyState = useCallback(async (existingGameState?: any) => {
    if (!api.getToken() || !team) return;
    try {
      const [me, stoneStatus, gameState] = await Promise.all([
        api.getMe(),
        api.getStoneStatus().catch(() => null),
        existingGameState ? Promise.resolve(existingGameState) : api.getGameState(team.id).catch(() => null),
      ]);

      setScore(me.score ?? 0);
      const completedCount = me.missionsCompleted ?? 0;
      setCurrentLevel(completedCount + 1);

      const alreadyCompleted = Array.from({ length: completedCount }, (_, i) => i + 1);
      setCompletedLevels(alreadyCompleted);

      const fUntil = me.frozenUntil ? new Date(me.frozenUntil).getTime() : null;
      const bUntil = me.blockedUntil ? new Date(me.blockedUntil).getTime() : null;
      setIsFrozen(!!(fUntil && Date.now() < fUntil));
      setIsBlocked(!!(bUntil && Date.now() < bUntil));
      setFrozenUntil(fUntil && Date.now() < fUntil ? fUntil : null);

      if (gameState) {
        setGameStarted(gameState.status === "active");
        setPowersDisabled(gameState.lockdown ?? false);
        setGameEndTime(gameState.endTime ? new Date(gameState.endTime).getTime() : null);
        if (gameState.status === "ended" && team && !isAdmin && window.location.pathname !== "/completion") {
          navigate("/completion");
        }
      }

      if (stoneStatus) {
        const st = stoneStatus.stoneType || {};
        setStones({
          shieldCount: st.shield ?? 0,
          blockCount: st.block ?? 0,
          shieldActive: stoneStatus.shieldActive ?? false,
          blockedUntil: stoneStatus.blockedUntil ? new Date(stoneStatus.blockedUntil).getTime() : null,
          ownedStones: me.stones || [],
        });
        setPendingStoneCount(stoneStatus.pendingStoneCount ?? 0);
      }
    } catch (e) {
      console.error("Sync Error", e);
    }
  }, [team]);

  useEffect(() => {
    if (!team) {
      setGameLoading(false);
      setPuzzles([]);
      setAllTeamsState([]);
      // Still fetch game state for unauthenticated users on /rules
      // so the lock/unlock UI reflects reality on page load
      // Still fetch game state for unauthenticated users on /rules
      // so the lock/unlock UI reflects reality on page load
      if (!isInitialFetchDoneRef.current) {
        api.getGameState().then((gs) => {
          if (gs) {
            setGameStarted(gs.status === "active");
            isInitialFetchDoneRef.current = true;
          }
        }).catch(() => { });
        // Also fetch teams once for the leaderboard on Rules/Landing
        refreshTeams();
      }
      return;
    }

    let cancelled = false;

    (async () => {
      setGameLoading(true);
      try {
        const [missionsList, gameState] = await Promise.all([
          api.getMissions(),
          api.getGameState(team.id).catch(() => null),
        ]);

        if (cancelled) return;
        if (missionsList.length) {
          setPuzzles(missionsList.map((m, i) => missionToPuzzle(m, i)));
        }
        if (gameState) {
          setGameStarted(gameState.status === "active");
          setPowersDisabled(gameState.lockdown ?? false);
          setGameEndTime(gameState.endTime ? new Date(gameState.endTime).getTime() : null);
          if (!cancelled && gameState.status === "ended" && team && !isAdmin && window.location.pathname !== "/completion") {
            navigate("/completion");
          }
        }

        await refreshTeams();
        await syncMyState(gameState);
      } catch {
        if (!cancelled) setPuzzles([]);
      } finally {
        if (!cancelled) setGameLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [team?.id, isAdmin, refreshTeams, syncMyState]);


  useEffect(() => {
    // Always connect, but join different rooms based on role
    const s = io(API_BASE, { transports: ["websocket"] });

    const onConnect = () => {
      console.log("✅ Socket connected:", s.id);
      setIsSocketConnected(true);

      // Everybody joins dashboard to listen for global events (SCORE_UPDATE, etc)
      s.emit("JOIN_DASHBOARD");

      if (team && !isAdmin) {
        s.emit("JOIN_TEAM", team.id);
      }
      if (isAdmin) {
        s.emit("JOIN_ADMIN");
      }
    };

    s.on("connect", onConnect);
    s.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    // Dashboard Events (Admin & Leaderboard)
    const handleScoreUpdate = (data: any) => {
      refreshTeams();
      if (data?.endTime) {
        setGameEndTime(new Date(data.endTime).getTime());
      }
    };
    const handleTeamUpdate = () => {
      refreshTeams();
    };

    s.on("SCORE_UPDATE", handleScoreUpdate);
    s.on("STONE_USAGE_UPDATE", handleTeamUpdate);
    s.on("STONE_SELECTION_UPDATE", handleTeamUpdate);
    s.on("BLIP_PUZZLE_LEADERBOARD", handleTeamUpdate);
    s.on("BLOCK_RELEASED_EARLY", handleTeamUpdate);
    s.on("GAME_ENDED", () => {
      setGameStarted(false);
      setGameEnded(true);
    });

    s.on("NEW_EVENT_LOG", (log: any) => {
      setNotifications((prev) => {
        const updated = [log, ...prev].slice(0, 50);
        localStorage.setItem("systemLogs", JSON.stringify(updated));
        return updated;
      });
      refreshTeams();
    });

    s.on("SNAP_ACTIVATED", (data: any) => {
      setSnapWinner({ teamId: data.teamId, teamName: data.teamName, score: 0, currentLevel: 0, isFrozen: false, isBlocked: false, stones: [], completedTimelines: [], snapActivated: true });
      setPowersDisabled(true);
      setGameEnded(true);
      showToast("[TIMELINE_FINALIZED]", "error", data.message || `${data.teamName} has won the game.`);
      if (team?.id === data.teamId) {
        navigate("/dashboard");
      }
    });

    s.on("GAME_STARTED", async () => {
      setGameStarted(true);
      showToast("[GAME_STARTED]", "success", "Game has started. Entering mission area.");
      if (team && !isAdmin) {
        navigate("/dashboard");
      }
    });

    if (team && !isAdmin) {
      s.on("TEAM_BLOCKED", (data: { blockedUntil: string; puzzleQuestion?: string }) => {
        const until = data?.blockedUntil ? new Date(data.blockedUntil).getTime() : null;
        if (!until) return;
        setIsBlocked(true);
        setBlockedUntil(until);
        setBlockPuzzleQuestion(data.puzzleQuestion || null);
        setStones((prev) => ({ ...prev, blockedUntil: until }));
        addNotification(`You are under Power Surge attack!`, "attack");
        showToast("[SYSTEM_LOCKED]", "error", "Answer the challenge puzzle to unlock your system.");
      });

      s.on("STONE_ATTACK_BLOCKED", (data?: any) => {
        // Shield blocked the incoming Power Surge
        setIsBlocked(false);
        setStones((prev) => ({ ...prev, shieldActive: false }));
        showToast("[DEFENSE_SUCCESSFUL]", "success", "Shield blocked the incoming attack.");
      });

      s.on("ATTACK_OFFER_SHIELD", (data: { attackerId: string; attackerName?: string; message?: string }) => {
        setPendingAttackerId(data?.attackerId || null);
        setShowShieldOffer(true);
        addNotification(`Incoming attack from ${data?.attackerName || "an opponent"}`, "attack");
        showToast("INCOMING_ATTACK", "info", (data?.message) || "Incoming attack - choose defend or continue");
      });

      // BLIP puzzle delivered directly to team
      s.on("BLIP_PUZZLE", (puzzle: { question?: string; answer?: string; freezeDurationSec?: number }) => {
        setBlipPuzzleSolved(false);
        setIsFrozen(true);
        const duration = puzzle?.freezeDurationSec || 120;
        setFrozenUntil(Date.now() + duration * 1000);
        setBlipPuzzleQuestion(puzzle?.question || null);
        if (puzzle && puzzle.question) {
          addNotification(`Blip puzzle: ${puzzle.question}`, "system");
        }
      });

      s.on("BLIP_ENDED", () => {
        setIsFrozen(false);
        setFrozenUntil(null);
        setBlipPuzzleSolved(false);
        showToast("[DECRYPTION_SUCCESS]", "success", "Security challenge resolved. Systems online.");
      });

      s.on("BLOCK_RELEASED", () => {
        setIsBlocked(false);
        setBlockedUntil(null);
        setBlockPuzzleQuestion(null);
        setStones((prev) => ({ ...prev, blockedUntil: null }));
        showToast("[SYSTEM_RESTORED]", "success", "Lockout removed. System fully operational.");
      });

      s.on("SHIELD_CONSUMED", () => {
        setStones((prev) => ({ ...prev, shieldActive: false, shieldCount: 0 }));
        showToast("[DEFENSE_SUCCESSFUL]", "success", "Shield blocked incoming attack.");
      });
    }

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [team?.id, isAdmin, navigate]);

  // Failsafe Polling: Only run every 2 minutes as backup to socket events
  useEffect(() => {
    if (!team || isAdmin || gameEnded) return;

    const interval = setInterval(() => {
      api.getGameState(team.id).then((gs) => {
        if (gs.status === "ended") {
          setGameStarted(false);
          setGameEnded(true);
        }
      }).catch(() => { });
    }, 120000);

    return () => clearInterval(interval);
  }, [team?.id, isAdmin, gameEnded]);

  // 🎬 Real-time redirection when game ends
  useEffect(() => {
    if (gameEnded && !isAdmin) {
      // Give a brief moment for socket event processing and refreshTeams to complete
      const timer = setTimeout(() => {
        navigate("/concluded", { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameEnded, isAdmin, navigate]);


  useEffect(() => {
    if (!blockedUntil) return;

    const interval = setInterval(() => {
      if (Date.now() > blockedUntil) {
        setIsBlocked(false);
        setBlockedUntil(null);
        setStones((prev) => ({
          ...prev,
          blockedUntil: null,
        }));
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [blockedUntil]);

  const startGame = useCallback(async (gameId?: string) => {
    try {
      if (!gameId) throw new Error("Game ID required to start");
      await api.startGame(gameId);
      setGameStarted(true);
      toast.success("GAME_START");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, []);

  const submitAnswer = useCallback(
    async (levelId: number, answer: string): Promise<boolean> => {
      if (isBlocked) {
        toast.error("SYSTEM_LOCKED");
        return false;
      }
      const puzzle = puzzles.find((p) => p.id === levelId);
      if (!puzzle?.missionId) {
        toast.error("DECRYPTION_FAILED");
        return false;
      }
      try {
        const result = await api.submitMission(puzzle.missionId, answer);
        // Supports legacy 'correct' and new 'isCorrect'
        const success = (result as any).correct ?? result.isCorrect;

        if (success) {
          setCompletedLevels((prev) => (prev.includes(levelId) ? prev : [...prev, levelId]));
          setScore((prev) => prev + result.points);
          if (levelId < puzzles.length) setCurrentLevel(levelId + 1);
          addNotification(`${team?.name} SOLVED MISSION ${levelId}`, "success");
          toast.success(`MISSION_${levelId}_COMPLETE`);
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
    [puzzles, team?.name, syncMyState, refreshTeams, addNotification, isBlocked]
  );

  const activateShield = useCallback(async () => {
    if (powersDisabled || stones.shieldCount <= 0) return;
    try {
      await api.useStone("shield");
      setStones((prev) => ({ ...prev, shieldActive: true, shieldCount: prev.shieldCount - 1 }));
      toast.success("SHIELD_ACTIVE");
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
      if (powersDisabled || !stones.ownedStones.includes('power')) return;
      try {
        const result = await api.usePowerStone(targetTeamId);

        if (result.message.includes("Shield broke")) {
          toast.info("ATTACK DEFLECTED", {
            description: "The rival team's Shield Stone neutralized your Power Surge."
          });
        } else {
          toast.success("POWER_SURGE_SENT", {
            description: "Rival systems have been compromised for 120 seconds."
          });
        }

        // Sync local counts with DB immediately
        await syncMyState();
        await refreshTeams();
      } catch (e: any) {
        toast.error("SYSTEM ERROR", { description: e.message });
      }
    },
    [stones.ownedStones, powersDisabled, syncMyState, refreshTeams]
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
          setBlipPuzzleQuestion(null);
          setScore((prev) => prev + (result.points || 0));
          setBlipPuzzleSolved(false);
          toast.success("BLIP_BYPASS_SUCCESS");
          await syncMyState();
          return true;
        }
      } catch { }
      return false;
    },
    [team?.name, syncMyState, addNotification]
  );

  const solveBlipPuzzle = useCallback(() => {
    setBlipPuzzleSolved(false);
    setBlipPuzzleQuestion(null);
    setIsFrozen(false);
    setFrozenUntil(null);
  }, []);

  const triggerBlip = useCallback(
    async (blipNumber: 1 | 2) => {
      try {
        const res = await api.triggerBlip(blipNumber);
        await refreshTeams();

        toast.success(res.message || `Blip ${blipNumber} triggered`);

        // If the user calling this is a team, we can check their own state
        if (team) {
          try {
            const me = await api.getMe();
            const fUntil = me.frozenUntil ? new Date(me.frozenUntil).getTime() : null;
            if (fUntil && Date.now() < fUntil) {
              setFrozenState(true, fUntil);
            }
          } catch (e) {
            console.error("Failed to read own state post-blip", e)
          }
        }
      } catch (e) {
        toast.error((e as Error).message);
      }
    },
    [team, setFrozenState, refreshTeams]
  );

  const freezeTeam = useCallback(
    async (teamId: string) => {
      try {
        await api.freezeTeamHandler(teamId);
        setAllTeamsState((prev) =>
          prev.map((t) => (t.teamId === teamId ? { ...t, isFrozen: true } : t))
        );
        if (team?.id === teamId) setFrozenState(true, Date.now() + 5 * 60 * 1000);
        toast.success("UNIT FROZEN SUCCESSFULLY");
      } catch (e: any) {
        toast.error("FREEZE FAILED: " + e.message);
      }
    },
    [team, setFrozenState]
  );

  const unfreezeTeam = useCallback(
    async (teamId: string) => {
      try {
        await api.unfreezeTeamHandler(teamId);
        setAllTeamsState((prev) =>
          prev.map((t) => (t.teamId === teamId ? { ...t, isFrozen: false } : t))
        );
        if (team?.id === teamId) setFrozenState(false);
        toast.success("UNIT UNFROZEN SUCCESSFULLY");
      } catch (e: any) {
        toast.error("UNFREEZE FAILED: " + e.message);
      }
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

  const respondToAttack = useCallback(
    async (attackerId: string, action: "useShield" | "continue") => {
      if (!attackerId) return;
      try {
        const res = await api.defendAttack(attackerId, action);
        setShowShieldOffer(false);
        setPendingAttackerId(null);
        if (action === "useShield") {
          setStones((prev) => ({ ...prev, shieldCount: Math.max(0, (prev.shieldCount || 0) - 1), shieldActive: false }));
          showToast("[DEFENSE_SUCCESSFUL]", "success", res.message || "Shield used to defend.");
        } else {
          showToast("[ACTION_CONFIRMED]", "info", res.message || "Continuing with attack protocol.");
        }
        await syncMyState();
        await refreshTeams();
      } catch (e: any) {
        showToast("[ERROR]", "error", e.message);
      }
    },
    [syncMyState, refreshTeams, showToast]
  );

  const initiateSupremeSnap = useCallback(async () => {
    if (!isSnapReady) return;
    try {
      setIsSnapping(true);
      await api.useSnap();
      toast.success("SUPREME_SNAP_EXECUTED", { description: "You have restored the timeline." });
      await syncMyState();
      await refreshTeams();
    } catch (e: any) {
      setIsSnapping(false);
      toast.error("SNAP_FAILED", { description: e.message });
    }
  }, [isSnapReady, syncMyState, refreshTeams]);

  const gameContextValue = useMemo(() => ({
    puzzles,
    currentLevel,
    completedLevels,
    score,
    stones,
    gameStarted,
    gameEnded,
    isFrozen,
    frozenUntil,
    blipPuzzleSolved,
    blipPuzzleQuestion,
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
    gameEndTime,
    setGameDuration,
    refreshTeams,
    gameLoading,
    resetBlipState,
    blockPuzzleQuestion,
    setBlockPuzzleQuestion,
    showShieldOffer,
    pendingAttackerId,
    respondToAttack,
    pendingStoneCount,
    selectStoneType,
    isSnapReady,
    isSnapping,
    snapWinner,
    initiateSupremeSnap,
    isSocketConnected,
    showToast,
  }), [
    puzzles, currentLevel, completedLevels, score, stones, gameStarted, gameEnded, isFrozen,
    frozenUntil, blipPuzzleSolved, blipPuzzleQuestion, isBlocked, powersDisabled, allTeamsState,
    startGame, submitAnswer, activateShield, deactivateShield, blockTeam, setIsFrozen,
    setIsBlocked, setFrozenState, notifications, submitBlipAnswer, solveBlipPuzzle, triggerBlip,
    freezeTeam, unfreezeTeam, gameDuration, gameEndTime, setGameDuration, refreshTeams,
    gameLoading, resetBlipState, blockPuzzleQuestion, setBlockPuzzleQuestion, showShieldOffer,
    pendingAttackerId, respondToAttack, pendingStoneCount, selectStoneType, isSnapReady,
    isSnapping, snapWinner, initiateSupremeSnap, isSocketConnected, showToast
  ]);

  return (
    <GameContext.Provider value={gameContextValue}>
      <ShieldDefendModal />
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};