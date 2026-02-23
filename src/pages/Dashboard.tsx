import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Skull, Globe, Trophy, Swords, Sparkles, Flame, ChevronRight, X, AlertTriangle, Target, Clock } from "lucide-react";
import { getDashboardData, DashboardData, useSpaceStone, useSnap, usePowerStone } from "@/services/api";
import { toast } from "sonner";
import TimelinePortal from "./TimelinePortal";
import HeroManager from "@/components/HeroManager";
import { useGame } from "@/context/GameContext";
import { SnapSequence } from "@/components/SnapSequence";
import Navbar from "@/components/Navbar";
import { STONE_PROPERTIES } from "@/lib/stoneConfig";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}


const DASHBOARD_TIMELINE_META: Record<string, { label: string; color: string; bgImage: string }> = {
  newyork: {
    label: "Battle of New York",
    color: "#60a5fa",
    bgImage: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1000&auto=format&fit=crop",
  },
  nyc: {
    label: "Battle of New York",
    color: "#60a5fa",
    bgImage: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1000&auto=format&fit=crop",
  },
  morag: {
    label: "Temple of Morag",
    color: "#c084fc",
    bgImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop",
  },
  asgard: {
    label: "Palace of Asgard",
    color: "#f87171",
    bgImage: "https://wallpaperaccess.com/full/1135531.jpg",
  },
  vormir: {
    label: "Domain of Vormir",
    color: "#fb923c",
    bgImage: "https://wallpaperaccess.com/full/6366684.jpg",
  },
};

const Dashboard = () => {
  const { logout } = useAuth();
  const { allTeamsState, isFrozen } = useGame();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [spaceStoneTarget, setSpaceStoneTarget] = useState<string | null>(null);
  const [spaceStoneLoading, setSpaceStoneLoading] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [targetTeam, setTargetTeam] = useState("");
  const [confirmStone, setConfirmStone] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");

  useEffect(() => {
    if (!data?.gameState?.endTime) return;
    const interval = setInterval(() => {
      const end = new Date(data.gameState.endTime!).getTime();
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(interval);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [data?.gameState?.endTime]);

  const handleStoneClick = (stoneId: string) => {
    const isCooldown = data?.me?.cooldownUntil ? new Date(data.me.cooldownUntil).getTime() > Date.now() : false;
    if (isCooldown && stoneId !== "space") {
      toast.error("COOLDOWN_ACTIVE", { description: "Quantum systems are currently unstable." });
      return;
    }

    if (stoneId === "space") {
      handleSidebarSpaceStone();
    } else if (stoneId === "power") {
      setConfirmStone("power");
    }
  };

  const executePower = async () => {
    if (!targetTeam) return;
    const t = toast.loading("Power Stone: Priming orbital cannon...");
    try {
      await usePowerStone(targetTeam);
      toast.success("POWER STONE ACTIVE: Orbital Strike Launched", { id: t });
      setShowPowerModal(false);
      setTargetTeam("");
      loadTacticalData();
    } catch (e: any) {
      toast.error(e.message || "Power Stone activation failed", { id: t });
    }
  };

  const handleConfirmAction = () => {
    if (!confirmStone) return;
    if (confirmStone === "power") {
      setShowPowerModal(true);
      setConfirmStone(null);
    }
  };

  const handleSidebarSpaceStone = async () => {
    // Collect eligible escaped timelines
    const escaped: string[] = (data?.me?.escapedTimelines ?? []).filter(
      (id: string) => !(data?.me?.completedTimelines ?? []).includes(id)
    );
    if (escaped.length === 0) {
      toast.error("NO_ELIGIBLE_TIMELINES", { description: "Escape a timeline first to use the Space Stone for re-entry." });
      return;
    }
    // Use first escaped timeline (or extend later for picker)
    const target = escaped[0];
    setSpaceStoneLoading(true);
    const t = toast.loading("Initiating Tesseract Protocol...");
    try {
      await useSpaceStone(target);
      toast.success(`SPACE_STONE_ACTIVATED: Re-entering ${target.toUpperCase()}`, { id: t, description: "Quantum warp recalculated." });
      navigate(`/mission/${target}`);
    } catch (e: any) {
      toast.error(e.message || "Tesseract Protocol Failed", { id: t });
    } finally {
      setSpaceStoneLoading(false);
    }
  };

  const handleActivateSnap = async () => {
    try {
      setIsSnapping(true);
      const toastId = toast.loading("Executing Supreme Snap...");
      await useSnap();
      toast.success("Reality rewritten!", { id: toastId });
      loadTacticalData();
    } catch (e: any) {
      toast.error(e.message || "Failed to activate snap");
    } finally {
      setIsSnapping(false);
    }
  };

  const loadTacticalData = async () => {
    try {
      const res = await getDashboardData();
      setData(res);
    } catch (e) {
      toast.error("Neural link unstable. Reconnecting...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTacticalData();
    const tacticalInterval = setInterval(loadTacticalData, 15000);
    return () => clearInterval(tacticalInterval);
  }, []);

  if (loading || !data) {
    return (
      <div className="h-screen bg-[#05050c] flex flex-col items-center justify-center font-mono text-cyan-500">
        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="animate-pulse uppercase tracking-[0.4em] text-[10px]">Syncing Heist Progress...</p>
      </div>
    );
  }

  // Defensive assignments
  const me = data.me;
  const timelines = Array.isArray(data.timelines) ? data.timelines : [];

  // Use real-time state for ranking
  const leaderboard = [...allTeamsState].sort((a, b) => b.score - a.score);

  // Safely calculate rank to prevent crashes
  const myRankIndex = leaderboard.findIndex(t => t.teamId === me?._id);
  const displayRank = myRankIndex !== -1 ? myRankIndex + 1 : "—";

  const requiredStones = ["space", "power", "reality", "soul", "time", "mind"];
  const hasAllStones = requiredStones.every((s) => (me?.stones || []).includes(s));
  const isSnapActive = me?.snapActivated || isSnapping;
  const showSnapCenter = hasAllStones && !me?.currentTimeline;

  const timelineMeta = me?.currentTimeline ? (DASHBOARD_TIMELINE_META[me.currentTimeline] || {
    label: me.currentTimeline.toUpperCase(),
    color: "#06b6d4",
    bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format"
  }) : null;

  return (
    <div className="h-screen flex flex-col bg-[#05050c] text-slate-200 font-sans overflow-hidden select-none">
      <HeroManager />
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* ─── DYNAMIC MISSION AREA ─── */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)]">
          {showSnapCenter ? (
            <div className="h-full flex flex-col items-center justify-center p-12 relative overflow-hidden bg-[#020205]">
              {/* Cosmic Void Background */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-yellow-500/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
              </div>

              {/* Central 3D Visualizer */}
              <div className="w-full max-w-2xl h-[450px] relative mb-16 animate-in zoom-in duration-1500">
                <div className="absolute -inset-10 bg-yellow-500/5 blur-[80px] rounded-full animate-pulse" />
                <model-viewer
                  src={isSnapActive ? "/model/QWERT.glb" : "/model/G.glb"}
                  auto-rotate
                  camera-controls
                  disable-zoom
                  environment-image="neutral"
                  exposure="1.4"
                  auto-rotate-delay="0"
                  rotation-per-second="15deg"
                  style={{ width: '100%', height: '100%', outline: 'none' }}
                />

                {/* HUD Overlay for Model */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-30 font-mono text-[8px] tracking-[0.2em] uppercase">
                  <span>Rotation: Synchronized</span>
                  <span className="w-1 h-1 bg-yellow-500 rounded-full animate-ping" />
                  <span>Resonance: Maximum</span>
                </div>
              </div>

              {/* Interaction / Status */}
              <div className="relative z-10 w-full max-w-md">
                {!isSnapActive ? (
                  <div className="space-y-8">
                    <div className="text-center space-y-2">
                      <p className="text-yellow-500 font-mono text-[10px] tracking-[0.6em] uppercase animate-pulse">Artifact Synergy 100%</p>
                      <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Supreme Snap Ready</h2>
                    </div>

                    <button
                      onClick={handleActivateSnap}
                      disabled={isSnapping}
                      className="w-full group relative px-12 py-8 bg-black/40 backdrop-blur-md border border-yellow-500/30 rounded-full transition-all active:scale-95 shadow-[0_0_50px_rgba(234,179,8,0.2)] hover:shadow-[0_0_80px_rgba(234,179,8,0.4)] hover:border-yellow-500 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-yellow-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <div className="relative z-10 flex items-center justify-center gap-6">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/40 group-hover:scale-110 transition-transform">
                          <Flame size={24} className="text-yellow-500 fill-current animate-pulse" />
                        </div>
                        <span className="text-2xl font-black tracking-[0.3em] text-yellow-500 uppercase">
                          {isSnapping ? "Rewriting..." : "Execute Snap"}
                        </span>
                      </div>
                    </button>

                    <p className="text-center text-white/40 font-mono text-[9px] tracking-widest uppercase mt-4">Warning: Reality reconfiguration is irreversible</p>
                  </div>
                ) : (
                  <div className="text-center space-y-6 animate-in slide-in-from-bottom-5 duration-1000 relative">
                    <div className="absolute -inset-16 bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
                    <h2 className="text-6xl font-black tracking-tighter text-yellow-500 [text-shadow:0_0_40px_rgba(234,179,8,0.6)] relative uppercase">Reality Rewritten</h2>
                    <div className="inline-flex items-center gap-4 bg-yellow-500/10 px-10 py-4 rounded-full border border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.2)] backdrop-blur-xl">
                      <Sparkles className="text-yellow-400 animate-pulse" size={20} />
                      <p className="text-yellow-400 font-mono tracking-[0.4em] font-black uppercase text-sm">
                        Eternal Harmony Established
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* HUD Perimeter */}
              <div className="absolute inset-12 border border-white/5 pointer-events-none rounded-[40px]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1 bg-[#020205] border border-white/10 rounded-full">
                  <span className="text-[8px] font-mono text-white/30 tracking-[0.5em] uppercase">Singularity Point</span>
                </div>
              </div>
            </div>
          ) : !me?.currentTimeline ? (
            <TimelinePortal data={{ ...data, timelines, leaderboard }} onRefresh={loadTacticalData} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 relative overflow-hidden group/heist">
              {/* Timeline Background Image */}
              <div className="absolute inset-0 pointer-events-none">
                {timelineMeta && (
                  <>
                    <img
                      src={timelineMeta.bgImage}
                      alt={timelineMeta.label}
                      className="w-full h-full object-cover opacity-30 group-hover/heist:scale-110 transition-transform duration-[15s] ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#05050c] via-transparent to-[#05050c]" />
                    <div className="absolute inset-0 bg-black/40" />
                  </>
                )}
              </div>

              <div className="text-center space-y-10 animate-in fade-in zoom-in-95 duration-1000 relative z-10 w-full max-w-4xl">
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <p className="font-mono text-[10px] tracking-[0.6em] uppercase animate-pulse" style={{ color: timelineMeta?.color }}>
                      Temporal Link Active
                    </p>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      Active <span style={{ color: timelineMeta?.color }}>Heist</span>
                    </h2>
                    <div className="flex items-center justify-center gap-3 bg-black/40 border py-2 px-6 rounded-full w-fit mx-auto backdrop-blur-md" style={{ borderColor: `${timelineMeta?.color}30` }}>
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: timelineMeta?.color }} />
                      <p className="font-mono text-[10px] tracking-[0.3em] font-bold uppercase text-white/80">
                        LOCATION: {timelineMeta?.label}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-8">
                  <button
                    onClick={() => navigate(`/mission/${me.currentTimeline}`)}
                    className="group relative px-6 py-2 bg-white/5 border rounded-full transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 overflow-hidden"
                    style={{ borderColor: `${timelineMeta?.color}40` }}
                  >
                    <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ backgroundColor: `${timelineMeta?.color}20` }} />
                    <span className="relative z-10 text-white font-black uppercase tracking-[0.4em] text-[11px] flex items-center gap-3">
                      <ChevronRight size={14} style={{ color: timelineMeta?.color }} />
                      Enter Interface
                    </span>
                  </button>
                </div>
              </div>

              {/* HUD Corner Accents */}
              <div className="absolute top-12 left-12 w-12 h-12 border-t border-l opacity-20" style={{ borderColor: timelineMeta?.color }} />
              <div className="absolute top-12 right-12 w-12 h-12 border-t border-r opacity-20" style={{ borderColor: timelineMeta?.color }} />
              <div className="absolute bottom-12 left-12 w-12 h-12 border-b border-l opacity-20" style={{ borderColor: timelineMeta?.color }} />
              <div className="absolute bottom-12 right-12 w-12 h-12 border-b border-r opacity-20" style={{ borderColor: timelineMeta?.color }} />
            </div>
          )}


        </main>

        {/* ─── TACTICAL SIDEBAR ─── */}
        <aside className="w-80 border-l border-white/5 bg-black/40 custom-scrollbar backdrop-blur-md p-6 flex flex-col gap-8 shadow-[-10px_0_30_px_rgba(0,0,0,0.5)]">
          <section className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl relative overflow-hidden">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-cyan-500 mb-4 flex items-center gap-2">
              <Swords size={14} /> Collected Artifacts
            </h3>

            {/* 3D Infinity Gauntlet Model */}
            <div className="w-full h-48 mb-6 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center relative shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] group">
              <model-viewer
                src="/model/G.glb"
                auto-rotate
                camera-controls
                disable-zoom
                environment-image="neutral"
                exposure="1"
                auto-rotate-delay="0"
                rotation-per-second="25deg"
                style={{ width: '100%', height: '100%', outline: 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-yellow-500/10 pointer-events-none rounded-xl" />
              <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                <span className="text-[7px] text-white/50 font-mono uppercase tracking-widest">3D Preview</span>
              </div>
            </div>

            {/* Dynamic stone list — only shows stones team actually owns */}
            {(me?.stones?.length ?? 0) === 0 ? (
              <p className="text-[9px] text-white/20 custom-scrollbar font-mono uppercase tracking-widest text-center py-4">
                No artifacts acquired yet
              </p>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {(me?.stones ?? []).map((s: string) => {
                  const meta = STONE_PROPERTIES[s] ?? { label: s, color: "#fff", glow: "rgba(255,255,255,0.3)", image: "", icon: <Sparkles size={16} />, desc: "Unknown artifact resonance." };
                  const isSpace = s === "space";
                  const hasEscaped = (me?.escapedTimelines?.length ?? 0) > 0;
                  return (
                    <div
                      key={s}
                      onClick={() => handleStoneClick(s)}
                      className={`group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${isSpace
                        ? "border-blue-500/30 bg-blue-500/[0.06] cursor-pointer hover:border-blue-400/80 hover:bg-blue-500/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-95"
                        : "border-white/[0.06] bg-black/40 hover:border-white/10 cursor-pointer"
                        }`}
                      style={!isSpace ? { borderColor: `${meta.color}18` } : {}}
                    >
                      {/* Background Aura */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                        style={{ backgroundColor: meta.color }}
                      />

                      {/* Stone gem icon */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg relative z-10 overflow-hidden"
                        style={{
                          backgroundColor: `${meta.color}20`,
                          color: meta.color,
                          boxShadow: `0 0 15px ${meta.glow}`,
                        }}
                      >
                        {meta.image ? (
                          <img src={meta.image} alt={meta.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" style={{ filter: `drop-shadow(0 0 8px ${meta.color})` }} />
                        ) : (
                          meta.icon
                        )}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-black uppercase tracking-widest leading-none" style={{ color: meta.color }}>
                            {meta.label}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                        </div>
                        {isSpace && (
                          <p className="text-[8px] font-mono text-blue-400/60 uppercase tracking-widest mt-1 group-hover:text-blue-300 transition-colors">
                            {hasEscaped ? "Initiate Tesseract" : "Coordinates Locked"}
                          </p>
                        )}
                      </div>

                      {/* Active Status Indicator */}
                      <div className="flex flex-col items-end gap-1 relative z-10">
                        <div
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ backgroundColor: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
                        />
                        {isSpace && hasEscaped && (
                          <Sparkles size={10} className="text-blue-400 animate-bounce" />
                        )}
                      </div>

                      {/* Hover Tooltip */}
                      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-48 bg-black/95 border-r-2 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] shadow-2xl" style={{ borderRightColor: meta.color }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: meta.color }}>{meta.label} Stone</p>
                        <p className="text-[8px] text-white/60 font-mono uppercase tracking-wider leading-relaxed">{meta.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="absolute top-0 left-0 w-full h-px bg-cyan-500/20 animate-scan" />
          </section>
        </aside>
      </div>

      {/* ─── CONFIRMATION DIALOG ─── */}
      {
        confirmStone && (() => {
          const cfg = STONE_PROPERTIES[confirmStone];
          if (!cfg) return null;
          return (
            <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div
                className="bg-[#08080f] w-full max-w-sm p-7 rounded-2xl shadow-2xl relative overflow-hidden border border-white/10"
                style={{ borderTop: `2px solid ${cfg.color}` }}
              >
                <div className="absolute top-0 left-0 right-0 h-px transition-all" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />

                <button onClick={() => setConfirmStone(null)} className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors">
                  <X size={16} />
                </button>

                <div className="flex flex-col items-center text-center gap-5">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ boxShadow: `0 0 30px ${cfg.glow}` }}
                  >
                    <img src={cfg.image} alt={cfg.label} className="w-full h-full object-cover rounded-full shadow-2xl" style={{ filter: `drop-shadow(0 0 10px ${cfg.color})` }} />
                  </div>

                  <div>
                    <p className="text-[8px] font-mono tracking-[0.4em] mb-1" style={{ color: `${cfg.color}80` }}>RESTRICTED ARTIFACT</p>
                    <h3 className="text-xl font-black uppercase tracking-widest text-white">{cfg.label} Stone</h3>
                  </div>

                  <p className="text-xs text-white/50 leading-relaxed font-mono">{cfg.desc}</p>

                  <div className="flex items-center gap-2 text-[9px] bg-red-500/10 text-red-400 px-3 py-2 rounded-xl border border-red-500/20 w-full justify-center">
                    <AlertTriangle size={10} />
                    <span>Initiation will trigger a global cooldown protocol.</span>
                  </div>

                  <div className="flex gap-3 w-full">
                    <button onClick={() => setConfirmStone(null)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60">Abort</button>
                    <button
                      onClick={handleConfirmAction}
                      className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-black shadow-lg"
                      style={{ backgroundColor: cfg.color }}
                    >
                      Authorize
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
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0a0a12] border border-purple-500/30 w-full max-w-lg p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              <button onClick={() => setShowPowerModal(false)} className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors"><X size={16} /></button>

              <h3 className="text-purple-400 font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-base">
                <Flame size={18} /> Targeting Matrix
              </h3>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar mb-8 pr-2 text-left">
                {leaderboard.filter(t => t.teamId !== me?._id && t.role !== "admin").length === 0 && (
                  <p className="text-white/30 text-center py-4 text-xs font-mono">NO_VALID_TARGET_SIGNATURES</p>
                )}
                {leaderboard
                  .filter(t => t.teamId !== me?._id && t.role !== "admin")
                  .map(target => (
                    <button
                      key={target.teamId}
                      onClick={() => setTargetTeam(target.teamId)}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex justify-between items-center ${targetTeam === target.teamId
                        ? "bg-purple-900/20 border-purple-500/50 text-white"
                        : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10"
                        }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold tracking-wider text-sm uppercase">{target.teamName}</span>
                        <span className="text-[9px] text-white/30 font-mono">CURRENT_SCORE: {target.score}</span>
                      </div>
                      {targetTeam === target.teamId && <Target size={16} className="text-purple-400" />}
                    </button>
                  ))}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowPowerModal(false)} className="flex-1 py-4 bg-white/5 rounded-xl border border-white/10 text-white/60 font-black uppercase tracking-widest text-xs">Abort</button>
                <button
                  disabled={!targetTeam}
                  onClick={executePower}
                  className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl disabled:opacity-30 uppercase tracking-widest text-xs transition-all shadow-lg shadow-purple-900/40"
                >
                  Confirm Strike
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default Dashboard;