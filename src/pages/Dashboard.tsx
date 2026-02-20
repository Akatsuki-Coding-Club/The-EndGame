import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Skull, Globe, Trophy, Timer, Swords } from "lucide-react";
import { getDashboardData, DashboardData, TimelineName } from "@/services/api";
import { toast } from "sonner";
import TimelinePortal from "./TimelinePortal"; 
import HeroManager from "@/components/HeroManager";
import AttackOverlay from "@/components/AttackOverlay";
import BlipOverlay from "@/components/BlipOverlay";

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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
  const leaderboard = Array.isArray(data.leaderboard) ? data.leaderboard : [];
  const timelines = Array.isArray(data.timelines) ? data.timelines : [];

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
            <span className="text-[8px] uppercase text-white/30 block tracking-widest">Global Rank</span>
            <span className="text-lg font-bold text-yellow-500 italic">#{displayRank}</span>
          </div>
          <div className="text-right">
            <span className="text-[8px] uppercase text-white/30 block tracking-widest">Strategic Points</span>
            <span className="text-lg font-bold text-cyan-400">{me?.score ?? 0}</span>
          </div>
          <button onClick={logout} className="group flex items-center gap-2 text-[9px] border border-red-500/20 text-red-500/60 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition-all uppercase font-bold tracking-widest">
            <Zap size={12} className="group-hover:fill-current"/> Abort
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
        </main>

        {/* ─── TACTICAL SIDEBAR ─── */}
        <aside className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-md p-6 flex flex-col gap-8 shadow-[-10px_0_30_px_rgba(0,0,0,0.5)]">
          <section className="flex-1 flex flex-col min-h-0">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40 mb-5 flex items-center gap-2">
              <Trophy size={14} className="text-yellow-600"/> Tactical Leaderboard
            </h3>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
              {leaderboard.map((entry, i) => (
                <div key={entry.teamId} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${entry.teamId === me?._id ? 'border-cyan-500/40 bg-cyan-500/10 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]' : 'border-white/5 bg-white/[0.02]'}`}>
                  <span className="text-[10px] font-bold text-white/70 truncate">
                    <span className="text-white/20 mr-2 font-mono">{String(i+1).padStart(2,'0')}</span> {entry.teamName}
                  </span>
                  <span className="text-xs font-black text-cyan-500/80 font-mono">{entry.score}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl relative overflow-hidden group">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-cyan-500 mb-5 flex items-center gap-2">
              <Swords size={14}/> Collected Artifacts
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {["space", "power", "reality", "soul", "time", "mind"].map(s => {
                const hasStone = me?.stones?.includes(s);
                return (
                  <div key={s} className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all ${hasStone ? 'shadow-[0_0_10px_-2px_white]' : 'opacity-10 scale-90 grayscale'}`}>
                    <div className="w-2 h-2 rounded-full bg-current mb-1" />
                    <span className="text-[6px] uppercase font-black">{s}</span>
                  </div>
                );
              })}
            </div>
            <div className="absolute top-0 left-0 w-full h-px bg-cyan-500/20 animate-scan" />
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;