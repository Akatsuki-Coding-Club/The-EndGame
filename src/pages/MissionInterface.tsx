import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import RulesSidebar from "@/components/RulesSidebar";
import {
  getCurrentQuestion,
  submitAnswer,
  getStoneStatus,
  getMe,
  getAllTeams,
  useTimeStone,
  useMindStone,
  usePowerStone,
  useRealityStone,
  useSoulStone,
  StoneStatus
} from "@/services/api";
import {
  Terminal, Loader2, Target, Zap, Clock, Brain, Globe, Flame, Eye, Skull,
  ChevronUp, ChevronDown, AlertTriangle, Sparkles, Shield, X,
  Info
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { STONE_PROPERTIES } from "@/lib/stoneConfig";
import HeroManager from "@/components/HeroManager";

/* ─── Stone config: single source of truth for colors / icons / labels ─── */

/* ─── Define the specific type for a Timeline Theme ─── */
// This fixes the TypeScript error by ensuring all properties are accounted for.
interface TimelineTheme {
  name: string;
  primary: string;
  secondary: string;
  font: string;
  glow: string;
  videoBg: string;
  shadow: string;       // Added to fix TS Error
  animation: string;    // Added to fix TS Error
}

const TIMELINE_THEMES: Record<string, TimelineTheme> = {
  morag: {
    name: "MORAG",
    primary: "text-blue-400",
    secondary: "bg-blue-600 hover:bg-blue-500",
    font: "font-sans tracking-normal",
    glow: "shadow-[0_0_50px_rgba(29,78,216,0.15)]",
    videoBg: "https://res.cloudinary.com/dhavg3hov/video/upload/v1771871022/morag_ejxr9z.mp4",
    shadow: "shadow-[0_0_30px_rgba(29,78,216,0.1)]", // Added missing property
    animation: "animate-in slide-in-from-bottom-4 duration-500" // Added missing property
  },
  asgard: {
    name: "ASGARD",
    primary: "text-amber-400",
    secondary: "bg-amber-500 hover:bg-amber-400",
    font: "font-sans tracking-normal uppercase",
    glow: "shadow-[0_0_50px_rgba(245,158,11,0.15)]",
    videoBg: "https://res.cloudinary.com/dhavg3hov/video/upload/v1771870884/asgard_gd52ji.mp4",
    shadow: "shadow-[0_0_30px_rgba(245,158,11,0.1)]", // Added missing property
    animation: "animate-in slide-in-from-bottom-4 duration-500" // Added missing property
  },
  vormir: {
    name: "DOMAIN OF VORMIR",
    primary: "text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]",
    secondary: "bg-orange-700 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(194,65,12,0.5)] transition-all duration-300",
    font: "font-sans tracking-normal",
    glow: "shadow-[0_0_80px_rgba(234,88,12,0.15)] border border-orange-900/40",
    videoBg: "https://res.cloudinary.com/dhavg3hov/video/upload/v1771870962/vormir_uqk02g.mp4",
    shadow: "shadow-[0_0_40px_rgba(234,88,12,0.1)]", // Added missing property
    animation: "animate-in fade-in duration-700" // Custom animation for Vormir
  },
  nyc: {
    name: "NEW YORK CITY",
    primary: "text-cyan-400",
    secondary: "bg-cyan-600 hover:bg-cyan-500",
    font: "font-sans tracking-normal",
    glow: "shadow-[0_0_50px_rgba(6,182,212,0.15)]",
    // IF YOU HAVE A VIDEO, PUT THE URL HERE:
    videoBg: "https://res.cloudinary.com/dhavg3hov/video/upload/v1771871346/grok-video-2a30ee02-773c-4f57-8d26-d68965ddcbd9_zqvf7w.mp4",
    shadow: "shadow-[0_0_30px_rgba(6,182,212,0.1)]",
    animation: "animate-in slide-in-from-bottom-4 duration-500"
  }
};

const ALL_STONES = ["time", "mind", "space", "power", "reality", "soul"];

const MissionInterface = () => {
  const { timelineId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [answer, setAnswer] = useState("");

  const [myStones, setMyStones] = useState<string[]>([]);
  const [stoneStatus, setStoneStatus] = useState<StoneStatus | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [showStonePanel, setShowStonePanel] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [realityActive, setRealityActive] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  // Power/Soul Selection State
  const [targetTeam, setTargetTeam] = useState("");
  const [sacrificeStone, setSacrificeStone] = useState("");
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showSoulModal, setShowSoulModal] = useState(false);

  // Confirmation State
  const [confirmStone, setConfirmStone] = useState<string | null>(null);
  const [acquiredStone, setAcquiredStone] = useState<string | null>(null);

  const { snapWinner, isSnapping, initiateSupremeSnap, isFrozen, showToast } = useGame();

  // Cooldown Timer State
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Fallback to NYC if the ID doesn't match
  const theme = TIMELINE_THEMES[timelineId as string] || TIMELINE_THEMES.nyc;

  /* ─── Fetch Logic ─── */
  const fetchProgress = async () => {
    try {
      const res = await getCurrentQuestion();
      if (res.completed) {
        showToast("MISSION_COMPLETE", "success", "Timeline Stabilized");
        navigate("/dashboard");
        return;
      }
      if (currentTask?.question?._id !== res.question?._id) {
        setActiveHint(null);
      }
      setCurrentTask(res);
    } catch {
      showToast("Signal lost", "error", "Reconnecting to timeline...");
    }
  };

  const fetchStones = async () => {
    try {
      const [status, me] = await Promise.all([
        getStoneStatus().catch(() => null),
        getMe().catch(() => null),
      ]);
      if (status) {
        setStoneStatus(status);
        window.dispatchEvent(new Event('stoneUpdate'));
      }
      // ✅ Pull stone list directly from the team's actual 'stones' string array
      if (me && Array.isArray(me.stones)) {
        setMyStones(me.stones.map((s: string) => s.toLowerCase()));
      }
    } catch {
      console.error("Failed to fetch stone status");
    }
  };

  const fetchTeams = async () => {
    try {
      const allTeams = await getAllTeams();
      setTeams(allTeams);
    } catch {
      console.error("Failed to fetch teams");
    }
  };

  /* ─── Snap Protection & Ending Sequence ─── */
  const { team } = useAuth();
  useEffect(() => {
    // Only force return to dashboard if WE are the ones who snapped
    if (team?.snapActivated) {
      navigate("/dashboard");
    }
  }, [team?.snapActivated, navigate]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProgress(), fetchStones(), fetchTeams()]);
      setLoading(false);
    };
    init();
  }, [timelineId]);

  /* ─── Cooldown Timer ─── */
  useEffect(() => {
    if (!stoneStatus?.cooldownUntil) { setTimeLeft(0); return; }
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(stoneStatus.cooldownUntil!).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [stoneStatus]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* ─── helpers ─── */
  // ✅ FIXED: checks the actual stones string array, no hardcoding
  const hasStone = (stone: string) => myStones.includes(stone);
  const isCooldown = timeLeft > 0;

  /* ─── Submit ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !currentTask?.question?._id) return;
    try {
      setSubmitting(true);
      const res = await submitAnswer(currentTask.question._id, answer);
      if (res.isCorrect) {
        showToast("KEY_ACCEPTED", "success", `+${res.points} Strategic Points`);
        setAnswer("");
        setRealityActive(false);
        if (res.earnedStone) {
          setAcquiredStone(res.earnedStone);
        } else if (res.completed) {
          navigate("/dashboard");
        } else {
          await fetchProgress();
        }
      } else {
        showToast("KEY_REJECTED", "error", "Unauthorized decryption code");
        setAnswer("");
      }
    } catch {
      showToast("Error", "error", "Transmission interruption detected.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Stone Execution Handlers ─── */
  const executeTime = async () => {
    try {
      await useTimeStone();
      showToast("TIME STONE ACTIVATED", "success", "Temporal Shift Initiated");
      navigate("/dashboard");
    } catch (e: any) { showToast("Failed to activate Time Stone", "error", e.message); }
  };

  const executeMind = async () => {
    try {
      const res = await useMindStone();
      setActiveHint(res.hint);
      showToast("MIND STONE ACTIVE", "success", "Neural Pathway Illuminated");
      fetchStones();
    } catch (e: any) { showToast("Mind Stone activation failed", "error", e.message); }
  };

  const executePower = async () => {
    if (!targetTeam) return;
    try {
      await usePowerStone(targetTeam);
      showToast("POWER STONE ACTIVE", "success", "Orbital Strike Launched");
      setShowPowerModal(false);
      setTargetTeam("");
      fetchStones();
    } catch (e: any) { showToast("Power Stone activation failed", "error", e.message); }
  };

  const executeReality = async () => {
    showToast("REALITY STONE", "info", "Rewriting physics engine...");
    try {
      await useRealityStone();
      // ✅ Only activate the visual state AFTER the backend confirms success
      setRealityActive(true);
      showToast("REALITY STONE ACTIVE", "success", "Physics Engine Rewritten. Your next answer will be accepted regardless of correctness.");
      fetchStones(); // refresh cooldown state
    } catch (e: any) {
      showToast("Reality Stone activation failed", "error", e.message);
      // Do NOT set realityActive — the backend rejected the activation
    }
  };

  const executeSoul = async () => {
    if (!sacrificeStone) return;
    try {
      await useSoulStone(sacrificeStone);
      showToast("SOUL STONE ACTIVE", "success", "Equivalent Exchange Complete");
      setShowSoulModal(false);
      setSacrificeStone("");
      fetchStones();
    } catch (e: any) { showToast("Soul Stone activation failed", "error", e.message); }
  };

  const handleConfirmAction = () => {
    if (!confirmStone) return;
    if (confirmStone === "power") { setShowPowerModal(true); setConfirmStone(null); return; }
    if (confirmStone === "soul") { setShowSoulModal(true); setConfirmStone(null); return; }
    if (confirmStone === "time") executeTime();
    if (confirmStone === "mind") executeMind();
    if (confirmStone === "reality") executeReality();
    setConfirmStone(null);
  };

  /* ─── Loading Screen ─── */
  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center font-sans text-cyan-500">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p className="tracking-[0.4em] text-[10px] animate-in fade-in">DECRYPTING_OBJECTIVES...</p>
    </div>
  );

  const activeMission = currentTask?.question;

  /* ─── Premium Stone Card ─── */
  const StoneCard = ({ stoneKey }: { stoneKey: string }) => {
    const cfg = STONE_PROPERTIES[stoneKey];
    const owned = hasStone(stoneKey);
    const isSpace = stoneKey === "space";
    const { isBlocked } = useGame();
    // Space stone is always disabled in mission (dashboard only)
    const isDisabled = isSpace || isCooldown || !owned || isBlocked;
    const canActivate = owned && !isSpace && !isCooldown && !isBlocked;

    const handleClick = () => {
      if (!canActivate) return;
      setConfirmStone(stoneKey);
    };

    return (
      <div
        onClick={handleClick}
        className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 select-none group
          ${owned
            ? isDisabled
              ? "border-white/5 bg-black/30 opacity-40 cursor-not-allowed"
              : "border-white/10 bg-black/40 hover:bg-white/[0.06] hover:scale-105 hover:-translate-y-1 cursor-pointer"
            : "border-white/[0.03] bg-transparent opacity-20 cursor-not-allowed grayscale"
          }
        `}
      >
        {/* Glow aura for owned active stones */}
        {owned && !isDisabled && (
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ boxShadow: `inset 0 0 20px ${cfg.glow}` }}
          />
        )}

        {/* Gem image container */}
        <div
          className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-[2000ms] ease-in-out ${owned && !isDisabled ? "group-hover:scale-125" : ""}`}
          style={{
            perspective: "1000px"
          }}
        >
          {owned ? (
            <div className={`relative w-full h-full flex items-center justify-center ${!isDisabled ? 'animate-[float_3s_ease-in-out_infinite]' : ''}`}
              style={{ transformStyle: 'preserve-3d' }}>
              <img
                src={cfg.image}
                alt={`${cfg.label} Stone`}
                className={`w-full h-full object-cover rounded-full shadow-2xl transition-all duration-500`}
                style={{
                  boxShadow: isDisabled ? "none" : `0 0 20px ${cfg.glow}, inset 0 0 15px ${cfg.glow}`,
                  filter: isDisabled ? "grayscale(80%) opacity(0.5)" : `drop-shadow(0 0 10px ${cfg.color})`
                }}
              />
              {!isDisabled && (
                <div
                  className="absolute inset-0 rounded-full animate-[spin_6s_linear_infinite] opacity-60"
                  style={{
                    border: `1px solid ${cfg.color}`,
                    boxShadow: `0 0 10px ${cfg.glow}, inset 0 0 10px ${cfg.glow}`
                  }}
                />
              )}
            </div>
          ) : (
            <div
              className="w-full h-full rounded-full flex items-center justify-center opacity-20 bg-black/50 border border-white/10"
              style={{ filter: "grayscale(100%)" }}
            >
              {cfg.icon}
            </div>
          )}
        </div>

        {/* Label */}
        <span
          className="text-[9px] font-black uppercase tracking-[0.25em] transition-colors"
          style={{ color: owned && !isDisabled ? cfg.color : "#555" }}
        >
          {cfg.label}
        </span>

        {/* Cooldown overlay badge */}


        {/* Space badge */}
        {isSpace && owned && (
          <div className="absolute -top-1.5 -right-1.5">
            <span className="text-[7px] bg-blue-500/20 border border-blue-500/40 text-blue-300 px-1.5 py-0.5 rounded-full font-black tracking-wider uppercase">DB</span>
          </div>
        )}

        {/* Not acquired badge */}
        {!owned && (
          <div className="absolute inset-0 rounded-2xl flex items-end justify-center pb-2">
            <span className="text-[7px] text-white/20 uppercase tracking-widest ">Locked</span>
          </div>
        )}

        {/* Hover tooltip */}
        {owned && (
          <div className="absolute bottom-[calc(100%+0.75rem)] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50 w-64">
            <div className="bg-[#08080f] border border-white/10 border-b-2 rounded-xl p-4 text-center shadow-[0_20px_50px_rgba(0,0,0,1)]" style={{ borderBottomColor: cfg.color }}>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: cfg.color }}>{cfg.label} Stone</p>
              <p className="text-[10px] text-slate-300 font-sans uppercase tracking-widest leading-relaxed">
                {isDisabled ? (isSpace ? "Use from Dashboard to re-enter timelines." : "Symmetry unstable. Cooldown phase active.") : cfg.desc}
              </p>
            </div>
            <div className="w-3 h-3 bg-[#08080f] border-b border-r border-white/10 rotate-45 -mt-1.5 mx-auto" />
          </div>
        )}
      </div>
    );
  };

  /* ─── Render ─── */
  return (
    <div className="h-screen bg-[#05050c] flex flex-col font-sans text-slate-300 overflow-hidden relative">
      <HeroManager />
      <Navbar />
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate3d(1, 1, 0, 0deg); }
            50% { transform: translateY(-5px) rotate3d(1, 1, 0, 10deg); }
          }
        `}
      </style>

      {/* --- LIVE WALLPAPER LAYER --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {theme.videoBg.endsWith(".mp4") ? (
          <video
            key={theme.videoBg} // Force re-render when URL changes
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30 grayscale-[0.3] scale-110"
          >
            <source src={theme.videoBg} type="video/mp4" />
          </video>
        ) : (
          <img
            key={theme.videoBg}
            src={theme.videoBg}
            alt="Background"
            className="w-full h-full object-cover opacity-30 grayscale-[0.3] scale-110"
          />
        )}

        {/* Darkening Overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>


      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col overflow-hidden pb-2 relative z-10">
        <main className={`flex-1 flex flex-col p-4 lg:p-8 overflow-hidden max-w-6xl mx-auto w-full relative z-0 pb-12 ${theme.animation}`}>
          <div className={`flex-1 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-sm shadow-2xl ${theme.shadow}`}>
            {/* Question Header */}
            <div className="p-3 border-b border-white/5 flex justify-between bg-black/20">
              <span className={`text-[10px]  uppercase tracking-widest flex items-center gap-2 ${theme.primary}`}>
                <Zap size={12} /> {activeMission?.difficulty || "UNKNOWN"} // {theme.name}_PROTOCOL
              </span>
              <span className="text-[10px] text-white/40 uppercase animate-in fade-in">
                Priority: <span className={theme.primary}>{activeMission?.points || 0} PTS</span>
              </span>
            </div>

            {/* Question Body */}
            <div className="flex-1 p-2 lg:p-3 overflow-y-auto custom-scrollbar relative">
              <div className={`bg-black/60 border border-white/10 p-5 rounded-xl relative shadow-2xl group transition-colors hover:border-white/20`}>
                <p className={`text-lg lg:text-xl leading-relaxed whitespace-pre-wrap ${theme.font} ${theme.primary.replace('text-', 'text-opacity-90 ')}`}>
                  {activeMission?.question}
                </p>
                {/* Hint Display */}
                {activeHint && (
                  <div className="mt-6 pt-4 border-t border-yellow-500/20 animate-in fade-in zoom-in duration-300">
                    <p className="text-yellow-400/80 text-sm font-sans flex items-start gap-2">
                      <Brain size={14} className="mt-1 shrink-0" />
                      <span className="uppercase tracking-widest text-[10px] text-yellow-500/50 mr-2">Hint Decrypted:</span>
                      {activeHint}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-black/80 border-t border-white/10 relative z-10">
              <form onSubmit={handleSubmit} className="flex gap-4 max-w-3xl mx-auto">
                <div className="flex-1 relative group">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={realityActive ? "REALITY REWRITE ACTIVE..." : "Enter Access Key..."}
                    className={`w-full bg-black/50 border border-white/10 rounded-lg px-5 py-3 outline-none focus:ring-1 ${realityActive ? "border-red-500 shadow-red-500/20" : `focus:border-white/30`}`}
                    autoFocus
                  />
                  <Target className={`absolute right-4 top-1/2 -translate-y-1/2 ${realityActive ? "text-red-500/50" : "text-white/5"} group-focus-within:text-cyan-500/50 transition-colors`} size={18} />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !answer.trim()}
                  className={`px-8 ${realityActive ? "bg-red-600" : theme.secondary} text-black font-black uppercase text-[10px] tracking-widest rounded-lg transition-all active:scale-95`}
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : "Execute"}
                </button>
              </form>
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>
        </main>
      </div>

      {/* ─── INFINITY STONES PANEL ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        {/* The Handle - Always visible, pointer-events enabled */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-72 bg-[#0a0a1a] border-t border-x border-cyan-500/40 rounded-t-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-500/10 transition-all group shadow-[0_-10px_25px_rgba(0,0,0,0.8)] pointer-events-auto
            ${showStonePanel ? "bottom-[calc(100%-1px)] h-12" : "bottom-0 h-8"} 
          `}
          onClick={() => setShowStonePanel(!showStonePanel)}
        >
          <div className="flex flex-col items-center -space-y-1">
            <ChevronUp
              size={14}
              className={`text-cyan-400 transition-transform duration-500 ${showStonePanel ? "rotate-180" : "animate-bounce"}`}
            />
            <span className="text-[12px] font-black uppercase tracking-[0.3em] text-cyan-400 group-hover:text-white transition-colors">
              Infinity Stones
            </span>
          </div>
        </div>

        {/* The Content Drawer */}
        <div
          className={`w-full border-t border-cyan-500/20 backdrop-blur-xl transition-all duration-500 ease-in-out pointer-events-auto overflow-visible
            ${showStonePanel
              ? "h-[12rem] bg-[#05050c]/98 opacity-100 translate-y-0 shadow-[0_-20px_60px_rgba(0,0,0,0.9)]"
              : "h-0 opacity-0 translate-y-10"
            }`}
        >
          {/* Internal Content (Only visible when height > 0) */}
          <div className={`${showStonePanel ? "block" : "hidden"} p-3`}>
            {/* Panel Header */}
            <div className="flex items-center justify-between px-2 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-cyan-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">Infinity Gauntlet</span>
              </div>
            </div>

            {/* Stone Cards Grid */}
            <div className="py-6 min-h-[160px] flex justify-center items-center relative">
              {isCooldown ? (
                <div className="flex flex-col items-center justify-center animate-in zoom-in duration-500">
                  <div className="text-xl md:text-2xl font-sans  text-red-400 tracking-widest bg-red-900/20 px-6 py-3 rounded-xl border border-red-500/30 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)] flex items-center gap-3">
                    <span className="uppercase text-red-500/80 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">Cooldown:</span>
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                  <p className="mt-4 text-[9px] text-red-500/50 uppercase tracking-widest font-sans">All stones are currently unstable</p>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-3 max-w-2xl mx-auto w-full">
                  {ALL_STONES.map(s => <StoneCard key={s} stoneKey={s} />)}
                </div>
              )}
            </div>

            {/* Supreme Snap Logic */}
            {myStones.length === 6 && !isSnapping && !snapWinner && (
              <div className="pb-4 flex justify-center">
                <button
                  onClick={initiateSupremeSnap}
                  className="px-10 py-3 bg-black border border-yellow-500/50 rounded-full flex items-center gap-3 hover:scale-105 transition-all text-yellow-500 font-black text-[10px] tracking-widest"
                >
                  <Flame size={14} /> EXECUTE SUPREME SNAP
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── CONFIRMATION DIALOG ─── */}
      {
        confirmStone && (() => {
          const cfg = STONE_PROPERTIES[confirmStone];
          return (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div
                className="bg-[#08080f] w-full max-w-sm p-7 rounded-2xl shadow-2xl relative overflow-hidden border"
                style={{ borderColor: `${cfg.color}30` }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />

                <button onClick={() => setConfirmStone(null)} className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors">
                  <X size={16} />
                </button>

                <div className="flex flex-col items-center text-center gap-5">
                  {/* Stone icon */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center animate-[float_3s_ease-in-out_infinite]"
                    style={{ boxShadow: `0 0 30px ${cfg.glow}` }}
                  >
                    <img src={cfg.image} alt={cfg.label} className="w-full h-full object-cover rounded-full shadow-2xl" style={{ filter: `drop-shadow(0 0 10px ${cfg.color})` }} />
                  </div>

                  <div>
                    <p className="text-[8px] font-sans tracking-[0.4em] mb-1" style={{ color: `${cfg.color}80` }}>INFINITY STONE</p>
                    <h3 className="text-xl font-black uppercase tracking-widest text-white">{cfg.label} Stone</h3>
                  </div>

                  <p className="text-xs text-white/50 leading-relaxed font-sans">{cfg.desc}</p>

                  <div className="flex items-center gap-2 text-[9px] bg-red-500/10 text-red-400 px-3 py-2 rounded-xl border border-red-500/20 w-full justify-center">
                    <AlertTriangle size={10} />
                    <span>Triggers a 20-minute global cooldown on all stones.</span>
                  </div>

                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setConfirmStone(null)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 transition-colors"
                    >
                      Abort
                    </button>
                    <button
                      onClick={handleConfirmAction}
                      className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 text-black shadow-lg"
                      style={{ backgroundColor: cfg.color, boxShadow: `0 0 20px ${cfg.glow}` }}
                    >
                      Activate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      }

      {/* ─── POWER STONE MODAL ─── */}
      {
        showPowerModal && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0a0a12] border border-purple-500/30 w-full max-w-lg p-8 rounded-2xl shadow-[0_0_100px_rgba(192,132,252,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              <button onClick={() => setShowPowerModal(false)} className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors"><X size={16} /></button>

              <h3 className="text-purple-400 font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-base">
                <Flame size={18} /> Select Target For Destruction
              </h3>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar mb-8 pr-2">
                {teams.length === 0 && <p className="text-white/30 text-center py-4 text-xs">Scanning for targets...</p>}
                {teams.map(team => (
                  <button
                    key={team._id}
                    onClick={() => setTargetTeam(team._id)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex justify-between items-center group ${targetTeam === team._id
                      ? "bg-purple-900/20 border-purple-500/50 text-white shadow-[0_0_20px_rgba(192,132,252,0.1)]"
                      : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <span className=" tracking-wider text-sm">{team.teamName}</span>
                    {targetTeam === team._id && <Target size={16} className="text-purple-400" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowPowerModal(false)} className="flex-1 py-4 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:bg-white/10 font-black uppercase tracking-widest text-xs transition-colors">Abort</button>
                <button disabled={!targetTeam} onClick={executePower} className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl disabled:opacity-30 uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(192,132,252,0.4)] transition-all">
                  Launch Strike
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ─── SOUL STONE MODAL ─── */}
      {
        showSoulModal && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0a0a12] border border-orange-500/30 w-full max-w-lg p-8 rounded-2xl shadow-[0_0_100px_rgba(251,146,60,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
              <button onClick={() => setShowSoulModal(false)} className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors"><X size={16} /></button>

              <h3 className="text-orange-400 font-black uppercase tracking-widest mb-3 flex items-center gap-3 text-base">
                <Skull size={18} /> Select Sacrifice
              </h3>
              <p className="text-white/40 text-[10px] mb-6 font-sans border-l-2 border-orange-500/50 pl-3 uppercase tracking-wider leading-relaxed">
                Warning: Sacrificed stones are permanently lost. You will receive bonus points immediately.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {["space", "power", "reality"].map(stone => {
                  if (!hasStone(stone)) return null;
                  const cfg = STONE_PROPERTIES[stone];
                  return (
                    <button
                      key={stone}
                      onClick={() => setSacrificeStone(stone)}
                      className={`p-5 rounded-xl border flex flex-col items-center gap-3 transition-all ${sacrificeStone === stone
                        ? "border-orange-500/50 bg-orange-900/20"
                        : "border-white/5 bg-white/[0.03] opacity-60 hover:opacity-100 hover:bg-white/[0.06]"
                        }`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110" style={{ boxShadow: `0 0 10px ${cfg.glow}` }}>
                        <img src={cfg.image} alt={cfg.label} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <span className="uppercase text-[10px] font-black tracking-widest text-white/80">{cfg.label}</span>
                    </button>
                  );
                })}
                {!hasStone("space") && !hasStone("power") && !hasStone("reality") && (
                  <div className="col-span-3 text-center py-6 text-white/30 text-xs font-sans">
                    No sacrificial stones available.
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowSoulModal(false)} className="flex-1 py-4 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:bg-white/10 font-black uppercase tracking-widest text-xs transition-colors">Cancel</button>
                <button disabled={!sacrificeStone} onClick={executeSoul} className="flex-1 py-4 bg-orange-500 hover:bg-orange-400 text-black font-black rounded-xl disabled:opacity-30 uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(251,146,60,0.4)] transition-all">
                  Sacrifice
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ─── STONE ACQUIRED SCREEN ─── */}
      {
        acquiredStone && (() => {
          const cfg = STONE_PROPERTIES[acquiredStone] || { color: "#fff", glow: "rgba(255,255,255,0.3)", icon: <Sparkles size={80} />, label: acquiredStone, image: "" };
          return (
            <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8 animate-in zoom-in duration-700">
              <div className="relative">
                <div className="absolute inset-0 blur-[120px] opacity-40 rounded-full" style={{ backgroundColor: cfg.color }} />
                <div
                  className="relative z-10 w-72 h-72 md:w-96 md:h-96 mb-8 animate-[float_4s_ease-in-out_infinite]"
                >
                  {cfg.image ? (
                    <img src={cfg.image} alt={cfg.label} className="w-full h-full object-contain" style={{ filter: `drop-shadow(0 0 50px ${cfg.color}) drop-shadow(0 0 100px ${cfg.glow})` }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center rounded-full bg-black/50 border border-white/30 shadow-2xl" style={{ color: cfg.color, filter: `drop-shadow(0 0 30px ${cfg.color})`, boxShadow: `0 0 100px ${cfg.glow}, inset 0 0 40px ${cfg.glow}` }}>
                      {React.cloneElement(cfg.icon as React.ReactElement, { size: 80 })}
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-[0.2em] text-white mb-3 text-center animate-in slide-in-from-bottom-5 duration-700 delay-100"
                style={{ textShadow: `0 0 40px ${cfg.color}` }}>
                {cfg.label} Stone
              </h1>
              <h2 className="text-lg text-white/40 uppercase tracking-[0.5em] mb-12 animate-in slide-in-from-bottom-5 duration-700 delay-200">
                Acquired
              </h2>

              <button
                onClick={() => navigate("/dashboard")}
                className="px-14 py-4 font-black text-sm uppercase tracking-[0.3em] rounded-xl transition-all shadow-2xl animate-in slide-in-from-bottom-5 duration-700 delay-300 hover:scale-105 active:scale-95 text-black"
                style={{ backgroundColor: cfg.color, boxShadow: `0 0 40px ${cfg.glow}` }}
              >
                Proceed to Dashboard
              </button>

              <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>
          );
        })()
      }
      <RulesSidebar
        isOpen={isRulesOpen}
        setIsOpen={setIsRulesOpen}
      />

    </div >
  );
};

export default MissionInterface;
