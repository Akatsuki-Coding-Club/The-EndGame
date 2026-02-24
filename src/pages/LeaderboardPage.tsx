import React, { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import { getEventLogs } from "@/services/api";
import { Trophy, Activity, Terminal, Shield, Sparkles, Orbit, Radio, Cpu, Globe, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const STONE_IMAGES: Record<string, string> = {
  space: "/space-stone.png",
  mind: "/mind_stone.png",
  reality: "/reality-stone.png",
  power: "/power-stone.png",
  time: "/time-stone.png",
  soul: "/soul_stone.jpg",
};

const LeaderboardPage = () => {
  const { allTeamsState, notifications, puzzles, isSocketConnected, refreshTeams } = useGame();
  const sortedTeams = [...allTeamsState].sort((a, b) => b.score - a.score);
  const maxLevel = puzzles.length || 15;
  const topScore = sortedTeams[0]?.score || 0;

  const [dbLogs, setDbLogs] = useState<any[]>([]);

  useEffect(() => {
    refreshTeams();
    getEventLogs().then(res => setDbLogs(res.logs || [])).catch(console.error);
    const interval = setInterval(() => {
      refreshTeams();
      getEventLogs().then(res => setDbLogs(res.logs || [])).catch(console.error);
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshTeams]);

  const mergedLogs = [...notifications, ...dbLogs]
    .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
    .sort((a, b) => {
      const tA = a.fullTime ? new Date(a.fullTime).getTime() : new Date(a.createdAt || a.timestamp).getTime() || 0;
      const tB = b.fullTime ? new Date(b.fullTime).getTime() : new Date(b.createdAt || b.timestamp).getTime() || 0;
      return tB - tA;
    })
    .slice(0, 30);

  const top3 = sortedTeams.slice(0, 3);
  const others = sortedTeams.slice(3);

  // Reorder top3 for podium: 2, 1, 3
  const podium = [];
  if (top3[1]) podium.push({ ...top3[1], rank: 2 });
  if (top3[0]) podium.push({ ...top3[0], rank: 1 });
  if (top3[2]) podium.push({ ...top3[2], rank: 3 });

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-200 p-6 md:p-10 flex flex-col gap-8 font-sans overflow-hidden relative selection:bg-cyan-500/30">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.02)_0%,transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5 relative z-10">
        <div className="absolute -bottom-px left-0 w-1/3 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.8)]" />

        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors" />
            <Trophy className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500">LEADERBOARD</h1>
            <div className={cn("flex items-center gap-3 mt-1", isSocketConnected ? "text-green-500" : "text-red-500")}>
              <span className="relative flex h-2 w-2">
                {isSocketConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                <span className={cn("relative inline-flex rounded-full h-2 w-2", isSocketConnected ? "bg-green-500" : "bg-red-500")}></span>
              </span>
              <p className="text-[8px] md:text-[10px] tracking-[0.4em] font-mono font-bold uppercase">
                {isSocketConnected ? "UPLINK_ACTIVE" : "UPLINK_OFFLINE"}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end text-right">
          <Cpu className="text-slate-600 mb-2" size={24} />
          <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Target Profiles: <span className="text-white font-bold">{sortedTeams.length}</span></p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 relative z-10 overflow-hidden">

        {/* LEFT COLUMN: PODIUM & LIST */}
        <div className="flex-1 flex flex-col gap-8 min-w-0 overflow-y-auto custom-scrollbar pr-2 pb-10">

          {/* PODIUM SECTION */}
          {podium.length > 0 && (
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6 mt-8 md:mt-12 px-4">
              <AnimatePresence mode="popLayout">
                {podium.map((team) => {
                  const isFirst = team.rank === 1;
                  const rankLabels = { 1: "1ST", 2: "2ND", 3: "3RD" };
                  const rankStyles = {
                    1: "from-cyan-600/30 to-cyan-900/10 border-cyan-500/60 shadow-[0_0_40px_rgba(6,182,212,0.3)] h-64 md:h-72 ring-2 ring-cyan-500/50 scale-110 md:scale-105 z-20",
                    2: "from-blue-400/20 to-blue-800/10 border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] h-56 md:h-60 z-10",
                    3: "from-slate-700/20 to-slate-900/10 border-slate-500/50 shadow-[0_0_30px_rgba(100,116,139,0.2)] h-48 md:h-52 z-10"
                  };
                  const iconColors = {
                    1: "text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.8)]",
                    2: "text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,0.8)]",
                    3: "text-slate-400 drop-shadow-[0_0_10px_rgba(148,163,184,0.8)]"
                  };

                  return (
                    <motion.div
                      layout
                      key={team.teamId}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className={cn(
                        "flex-1 w-full bg-gradient-to-t rounded-t-2xl border-t border-x relative flex flex-col items-center justify-start p-6 overflow-hidden backdrop-blur-md transition-all duration-500 hover:-translate-y-2 group",
                        rankStyles[team.rank as keyof typeof rankStyles]
                      )}
                    >
                      <div className="absolute top-0 inset-x-0 h-1/2 bg-white/5 mask-image:linear-gradient(to_bottom,white,transparent)" />

                      {isFirst && <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-500/20 blur-2xl rounded-full pointer-events-none animate-pulse" />}

                      <Medal className={cn("mb-4 w-12 h-12 md:w-16 md:h-16 transform group-hover:scale-110 transition-transform", iconColors[team.rank as keyof typeof iconColors])} />

                      <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white mb-2 text-center break-words w-full px-2">
                        {team.teamName}
                      </h3>

                      <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter mb-4">
                        {team.score.toLocaleString()}
                      </div>

                      <div className="flex gap-1.5 mt-auto bg-black/40 p-2 rounded-full border border-white/10 z-10">
                        {Object.entries(STONE_IMAGES).map(([key, src]) => {
                          const hasStone = team.stones?.includes(key);
                          if (!hasStone) return null;
                          return (
                            <div key={key} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/10 shadow-[inset_0_0_5px_rgba(255,255,255,0.2)]">
                              <img src={src} alt={key} className="w-full h-full object-cover rounded-full p-0.5" />
                            </div>
                          )
                        })}
                      </div>

                      <div className="absolute bottom-4 opacity-[0.05] font-black text-7xl md:text-8xl tracking-tighter scale-150 pointer-events-none">
                        {rankLabels[team.rank as keyof typeof rankLabels]}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}

          {/* OTHERS LIST */}
          <motion.div layout className="flex flex-col gap-3 mt-4 md:mt-8">
            <AnimatePresence mode="popLayout">
              {others.map((team, index) => {
                const actualRank = index + 4;
                const scorePercent = Math.max(0, Math.min(100, (team.score / topScore) * 100));

                return (
                  <motion.div
                    layout
                    key={team.teamId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative flex items-stretch rounded-xl overflow-hidden transition-all duration-300 group bg-slate-900/40 border border-white/5 hover:border-cyan-500/30"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-white/[0.03] transition-all duration-1000 z-0 pointer-events-none"
                      style={{ width: `${scorePercent}%` }}
                    />

                    <div className="w-16 shrink-0 flex items-center justify-center border-r border-white/5 bg-black/20 relative z-10">
                      <span className="text-2xl font-black italic tracking-tighter text-slate-500 group-hover:text-cyan-400 transition-colors">
                        {String(actualRank).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold uppercase tracking-tight truncate text-slate-200 group-hover:text-cyan-400 transition-colors">
                            {team.teamName}
                          </h3>
                          {team.snapActivated && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 animate-pulse">Snap Active</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1.5">
                          <span className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1">
                            <Activity size={8} className="text-cyan-500" /> LVL {team.currentLevel}/{maxLevel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <div className="flex items-center gap-1">
                          {Object.entries(STONE_IMAGES).map(([key, src]) => {
                            const hasStone = team.stones?.includes(key);
                            return (
                              <div key={key} className={cn(
                                "w-5 h-5 rounded-full border border-white/10 flex items-center justify-center",
                                hasStone ? "bg-white/10 shadow-[inset_0_0_5px_rgba(255,255,255,0.2)]" : "bg-black/80 opacity-20 grayscale"
                              )}>
                                <img src={src} alt={key} className={cn("w-full h-full object-cover rounded-full p-0.5", hasStone ? "" : "opacity-30")} />
                              </div>
                            )
                          })}
                        </div>
                        <div className="text-xl md:text-2xl font-black text-white tabular-nums tracking-tighter w-20 text-right">
                          {team.score.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: LOGS */}
        <div className="w-full lg:w-[350px] xl:w-[400px] flex-col relative shrink-0 h-[600px] lg:h-auto flex">
          <div className="bg-[#050914] border border-cyan-900/40 rounded-2xl flex-1 flex flex-col relative overflow-hidden shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="p-5 border-b border-cyan-900/40 bg-cyan-950/20 relative">
              <div className="absolute top-0 right-6 w-16 h-1 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]" />
              <div className="flex items-center gap-3">
                <Terminal size={18} className="text-cyan-400" />
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-50">J.A.R.V.I.S. Feed</h2>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 relative z-10">
              <AnimatePresence mode="popLayout" initial={false}>
                {mergedLogs.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60"
                  >
                    <Radio size={32} className="text-cyan-500 mb-4 animate-[ping_3s_infinite]" />
                    <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest leading-loose">Monitoring regional sectors...<br />Awaiting tactical feedback.</p>
                  </motion.div>
                ) : (
                  mergedLogs.map((notif) => (
                    <motion.div
                      layout
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className={cn(
                        "p-3.5 rounded-xl text-[10px] font-mono flex flex-col gap-2 relative overflow-hidden group border",
                        notif.type === 'attack' ? "bg-red-950/20 border-red-900/40" :
                          notif.type === 'success' ? "bg-cyan-950/20 border-cyan-500/30" :
                            "bg-cyan-950/5 border-cyan-900/20"
                      )}
                    >
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        notif.type === 'attack' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" :
                          notif.type === 'success' ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" :
                            "bg-cyan-700"
                      )} />
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "font-black uppercase tracking-widest",
                          notif.type === 'attack' ? "text-red-400" :
                            notif.type === 'success' ? "text-cyan-400" :
                              "text-cyan-600"
                        )}>{notif.type}</span>
                        <span className="text-cyan-600 font-mono tracking-wider">{notif.timestamp}</span>
                      </div>
                      <p className="text-cyan-100/90 font-bold leading-relaxed">{notif.message}</p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
            <div className="p-3 bg-cyan-950/20 border-t border-cyan-900/40 text-center relative pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none" />
              <p className="text-[9px] text-cyan-600 font-mono uppercase tracking-widest flex items-center justify-center gap-2 relative z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" /> TONY STARK NETWORK
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeaderboardPage;