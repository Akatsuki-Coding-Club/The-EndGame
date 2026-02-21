import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Skull, Globe, Trophy, Swords, Sparkles } from "lucide-react";
import { getDashboardData, DashboardData, useSpaceStone } from "@/services/api";
import { toast } from "sonner";
import TimelinePortal from "./TimelinePortal";
import HeroManager from "@/components/HeroManager";
import AttackOverlay from "@/components/AttackOverlay";
import BlipOverlay from "@/components/BlipOverlay";
import { useGame } from "@/context/GameContext";
import { SnapSequence } from "@/components/SnapSequence";
import { Flame } from "lucide-react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

const STONE_META: Record<string, { label: string; color: string; glow: string; icon: React.ReactNode }> = {
  space: { label: "Space", color: "#60a5fa", glow: "rgba(96,165,250,0.4)", icon: <Globe size={16} /> },
  power: { label: "Power", color: "#c084fc", glow: "rgba(192,132,252,0.4)", icon: <Zap size={16} /> },
  reality: { label: "Reality", color: "#f87171", glow: "rgba(248,113,113,0.4)", icon: <Shield size={16} /> },
  soul: { label: "Soul", color: "#fb923c", glow: "rgba(251,146,60,0.4)", icon: <Skull size={16} /> },
  time: { label: "Time", color: "#34d399", glow: "rgba(52,211,153,0.4)", icon: <Sparkles size={16} /> },
  mind: { label: "Mind", color: "#fbbf24", glow: "rgba(251,191,36,0.4)", icon: <Trophy size={16} /> },
};

const Dashboard = () => {
  const { logout } = useAuth();
  const { isSnapReady, initiateSupremeSnap, isSnapping, allTeamsState } = useGame();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [spaceStoneTarget, setSpaceStoneTarget] = useState<string | null>(null);
  const [spaceStoneLoading, setSpaceStoneLoading] = useState(false);
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

  return (
    <div className="h-screen flex flex-col bg-[#05050c] text-slate-200 font-sans overflow-hidden select-none">
      <HeroManager />
      <AttackOverlay />
      {me?.isFrozen && <BlipOverlay />}

      {/* ─── HUD HEADER ─── */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]">A</div>
          <div>
            <h1 className="text-sm font-bold tracking-widest uppercase text-white/80">{me?.teamName || "UNIT_UNKNOWN"}</h1>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${me?.isFrozen ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              <p className="text-[9px] font-mono text-cyan-500 uppercase tracking-widest">
                {me?.isFrozen ? "System_Locked" : "Neural_Link_Stable"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-10 items-center">
          <div className="text-right">
            <span className="text-[8px] uppercase text-white/30 block tracking-widest">Remaining Time</span>
            <span className="text-lg font-bold text-red-500 italic font-mono">{timeLeft}</span>
          </div>
          <div className="text-right">
            <span className="text-[8px] uppercase text-white/30 block tracking-widest">Global Rank</span>
            <span className="text-lg font-bold text-yellow-500 italic">#{displayRank}</span>
          </div>
          <div className="text-right">
            <span className="text-[8px] uppercase text-white/30 block tracking-widest">Strategic Points</span>
            <span className="text-lg font-bold text-cyan-400">{me?.score ?? 0}</span>
          </div>
          <button onClick={logout} className="group flex items-center gap-2 text-[9px] border border-red-500/20 text-red-500/60 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition-all uppercase font-bold tracking-widest">
            <Zap size={12} className="group-hover:fill-current" /> Abort
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── DYNAMIC MISSION AREA ─── */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)]">
          {!me?.currentTimeline ? (
            <TimelinePortal data={{ ...data, timelines, leaderboard }} onRefresh={loadTacticalData} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12">
              <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="relative inline-block">
                  <Globe className="text-cyan-500 animate-[spin_10s_linear_infinite]" size={80} />
                  <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white">Active Heist</h2>
                  <p className="text-cyan-400 font-mono text-sm tracking-[0.2em]">LOCATION: {me.currentTimeline.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => navigate(`/mission/${me.currentTimeline}`)}
                  className="px-16 py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-xs rounded-sm hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all active:scale-95"
                >
                  Enter Neural Interface
                </button>
              </div>
            </div>
          )}

          {/* ⚡ SUPREME SNAP ACTIVATOR ⚡ */}
          {isSnapReady && !me.currentTimeline && (
            <div className="absolute inset-x-0 bottom-12 flex justify-center animate-in slide-in-from-bottom-12 duration-1000">
              <div className="relative group">
                {/* Golden Arc Border */}
                <div className="absolute -inset-1 gold-arc-gradient rounded-full blur-sm opacity-75 animate-pulse" />
                <button
                  onClick={initiateSupremeSnap}
                  disabled={isSnapping}
                  className="relative px-12 py-6 bg-black border-2 border-yellow-500 rounded-full flex items-center gap-4 transition-all active:scale-90 snap-button-pulse group"
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/50">
                    <Flame size={20} className="text-yellow-500 fill-current animate-pulse" />
                  </div>
                  <span className="text-xl font-black italic tracking-[0.2em] text-yellow-500 uppercase font-[Orbitron]">
                    {isSnapping ? "REWRITING REALITY..." : "EXECUTE SUPREME SNAP"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ─── TACTICAL SIDEBAR ─── */}
        <aside className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-md p-6 flex flex-col gap-8 shadow-[-10px_0_30_px_rgba(0,0,0,0.5)]">
          <section className="flex-1 flex flex-col min-h-0">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40 mb-5 flex items-center gap-2">
              <Trophy size={14} className="text-yellow-600" /> Tactical Leaderboard
            </h3>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
              {leaderboard.map((entry, i) => (
                <div key={entry.teamId} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${entry.teamId === me?._id ? 'border-cyan-500/40 bg-cyan-500/10 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]' : 'border-white/5 bg-white/[0.02]'}`}>
                  <span className="text-[10px] font-bold text-white/70 truncate">
                    <span className="text-white/20 mr-2 font-mono">{String(i + 1).padStart(2, '0')}</span> {entry.teamName}
                  </span>
                  <span className="text-xs font-black text-cyan-500/80 font-mono">{entry.score}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl relative overflow-hidden">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-cyan-500 mb-4 flex items-center gap-2">
              <Swords size={14} /> Collected Artifacts
            </h3>

            {/* 3D Infinity Gauntlet Model */}
            <div className="w-full h-48 mb-6 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center relative shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] group">
              <model-viewer
                src="/model/QWERT.glb"
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
              <p className="text-[9px] text-white/20 font-mono uppercase tracking-widest text-center py-4">
                No artifacts acquired yet
              </p>
            ) : (
              <div className="space-y-2">
                {(me?.stones ?? []).map((s: string) => {
                  const meta = STONE_META[s] ?? { label: s, color: "#fff", glow: "rgba(255,255,255,0.3)", icon: <Sparkles size={16} /> };
                  const isSpace = s === "space";
                  const hasEscaped = (me?.escapedTimelines?.length ?? 0) > 0;
                  return (
                    <div
                      key={s}
                      onClick={isSpace ? handleSidebarSpaceStone : undefined}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isSpace
                        ? "border-blue-500/30 bg-blue-500/[0.06] cursor-pointer hover:border-blue-400/60 hover:bg-blue-500/[0.12] hover:shadow-[0_0_15px_rgba(96,165,250,0.15)] active:scale-95"
                        : "border-white/[0.06] bg-white/[0.02]"
                        }`}
                      style={isSpace ? {} : { borderColor: `${meta.color}18` }}
                    >
                      {/* Stone gem icon */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                        style={{
                          backgroundColor: `${meta.color}15`,
                          color: meta.color,
                          boxShadow: `0 0 12px ${meta.glow}`,
                        }}
                      >
                        {meta.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: meta.color }}>
                          {meta.label} Stone
                        </p>
                        {isSpace && (
                          <p className="text-[8px] font-mono text-blue-400/60 uppercase tracking-wider mt-0.5">
                            {hasEscaped ? "Click to re-enter timeline" : "Escape a timeline first"}
                          </p>
                        )}
                      </div>

                      {/* Active glow dot */}
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                        style={{ backgroundColor: meta.color, boxShadow: `0 0 6px ${meta.glow}` }}
                      />

                      {isSpace && hasEscaped && (
                        <Sparkles size={12} className="text-blue-400 shrink-0 animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="absolute top-0 left-0 w-full h-px bg-cyan-500/20 animate-scan" />
          </section>
        </aside>
      </div>
      <SnapSequence />
    </div>
  );
};

export default Dashboard;