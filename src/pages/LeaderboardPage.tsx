import React, { useEffect, useState } from "react";
import { useGame, TeamGameState } from "@/context/GameContext";
import { Trophy, Activity, Terminal, Radio, Cpu, Medal, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { io } from "socket.io-client";
import { API_BASE } from "@/services/api";

const STONE_IMAGES: Record<string, string> = {
  space: "/space-stone.png",
  mind: "/mind_stone.png",
  reality: "/reality-stone.png",
  power: "/power-stone.png",
  time: "/time-stone.png",
  soul: "/soul_stone.jpg",
};

// --- ANIMATED COUNTER COMPONENT ---
const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};

// --- PODIUM CARD COMPONENT ---
const PodiumCard = ({ team }: { team: TeamGameState & { rank: number } }) => {
  const isFirst = team.rank === 1;
  const rankLabels = { 1: "1ST", 2: "2ND", 3: "3RD" };
  const rankStyles = {
    1: "bg-cyan-900/10 border-cyan-400/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] h-[12rem] md:h-[15rem] ring-1 ring-cyan-400/50 z-20",
    2: "bg-blue-900/10 border-blue-400/40 shadow-[0_0_30px_rgba(59,130,246,0.2)] h-[9.5rem] md:h-[12rem] z-10",
    3: "bg-slate-800/20 border-slate-500/40 shadow-[0_0_30px_rgba(100,116,139,0.2)] h-[9rem] md:h-[11rem] z-10"
  };
  const iconColors = {
    1: "text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,1)]",
    2: "text-blue-300 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]",
    3: "text-slate-300 drop-shadow-[0_0_15px_rgba(148,163,184,0.8)]"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 150 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: isFirst ? 150 : 100,
        damping: isFirst ? 12 : 20,
        mass: 1.2
      }}
      className={cn(
        "flex-1 w-full rounded-t-3xl border-t border-x relative flex flex-col items-center justify-start p-6 overflow-hidden backdrop-blur-xl group",
        rankStyles[team.rank as keyof typeof rankStyles]
      )}
    >
      {/* Floating / Sweeping light glare effect */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: team.rank * 0.5 }}
        className="absolute inset-0 flex flex-col items-center justify-start pt-6 w-full h-full"
      >
        <div className="absolute top-0 inset-x-0 h-full w-[200%] -left-[50%] bg-gradient-to-r from-transparent via-white/5 to-transparent -rotate-45 translate-y-[-100%] group-hover:translate-y-[200%] transition-transform duration-1000 pointer-events-none" />

        {isFirst && <div className="absolute top-10 w-32 h-32 bg-cyan-500/30 blur-[50px] rounded-full pointer-events-none animate-pulse" />}

        <Medal className={cn("mb-2 w-10 h-10 md:w-16 md:h-16 transform group-hover:scale-110 transition-transform duration-500", iconColors[team.rank as keyof typeof iconColors])} />

        <h3 className="text-lg md:text-2xl font-black uppercase tracking-tight text-white mb-1 text-center break-words w-full px-2 drop-shadow-md">
          {team.teamName}
        </h3>

        <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tighter mb-2 drop-shadow-lg">
          <AnimatedNumber value={team.score} />
        </div>

        {/* Ethereal Gem Stones */}
        <div className="flex gap-1 md:gap-2 mt-auto bg-black/50 p-2 md:p-2.5 rounded-full border border-white/10 z-10 backdrop-blur-md shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
          {Object.entries(STONE_IMAGES).map(([key, src]) => {
            const hasStone = team.stones?.includes(key);
            if (!hasStone) return null;
            return (
              <motion.div
                key={key}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 + Math.random() }}
                className="w-6 h-6 md:w-8 md:h-8 rounded-full shadow-[inset_0_0_12px_rgba(255,255,255,0.8),0_0_10px_rgba(255,255,255,0.3)] relative"
              >
                <img src={src} alt={key} className="w-full h-full object-cover rounded-full p-[1px] brightness-125" />
              </motion.div>
            )
          })}
        </div>

        {/* Hollow Outline Watermark */}
        <div className="absolute -bottom-6 md:-bottom-8 font-black text-6xl md:text-[8rem] tracking-tighter pointer-events-none text-transparent opacity-30 select-none"
          style={{ WebkitTextStroke: `2px ${isFirst ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.2)'}` }}>
          {rankLabels[team.rank as keyof typeof rankLabels]}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- LIST ROW COMPONENT ---
const ListRow = ({ team, index, maxLevel, topScore }: { team: TeamGameState, index: number, maxLevel: number, topScore: number }) => {
  const actualRank = index + 4;
  const scorePercent = Math.max(0, Math.min(100, (team.score / topScore) * 100));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative flex items-stretch rounded-xl overflow-hidden transition-all duration-300 group bg-slate-900/40 border border-white/5 hover:border-cyan-400/50 hover:bg-cyan-900/20 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-sm"
    >
      {/* Progress Bar Background */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500/10 to-transparent transition-all duration-1000 z-0 pointer-events-none"
        style={{ width: `${scorePercent}%` }}
      />

      <div className="w-12 sm:w-16 shrink-0 flex items-center justify-center border-r border-white/5 bg-black/40 relative z-10 group-hover:bg-cyan-950/50 transition-colors">
        <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-slate-500 group-hover:text-cyan-400 transition-colors drop-shadow-md">
          {String(actualRank).padStart(2, '0')}
        </span>
      </div>

      <div className="flex-1 p-2 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <h3 className="text-base sm:text-lg  uppercase tracking-tight truncate text-slate-200 group-hover:text-white transition-colors">
              {team.teamName}
            </h3>
            {team.snapActivated && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 animate-pulse">Snap Active</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-1.5">
            <span className="text-[10px] font-sans text-slate-400 uppercase flex items-center gap-1.5">
              <Activity size={10} className="text-cyan-500 group-hover:animate-pulse" /> LVL {team.currentLevel}/{maxLevel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="flex items-center gap-1.5">
            {Object.entries(STONE_IMAGES).map(([key, src]) => {
              const hasStone = team.stones?.includes(key);
              return (
                <div key={key} className={cn(
                  "w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300",
                  hasStone ? "border-white/20 shadow-[inset_0_0_8px_rgba(255,255,255,0.5)] scale-110" : "border-white/5 bg-black/80 opacity-20 grayscale"
                )}>
                  <img src={src} alt={key} className={cn("w-full h-full object-cover rounded-full p-0.5", hasStone ? "brightness-110" : "opacity-30")} />
                </div>
              )
            })}
          </div>
          <div className="text-2xl md:text-3xl font-black text-white tabular-nums tracking-tighter w-24 text-right drop-shadow-md group-hover:text-cyan-100">
            <AnimatedNumber value={team.score} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN LEADERBOARD LAYOUT ---
const LeaderboardPage = () => {
  const { allTeamsState, notifications, puzzles, isSocketConnected, refreshTeams } = useGame();

  // Local state for toggling the JARVIS feed
  const [isFeedVisible, setIsFeedVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [socketLeaderboard, setSocketLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const s = io(API_BASE, { transports: ["websocket"] });
    s.on("connect", () => {
      s.emit("JOIN_DASHBOARD");
    });
    s.on("TIME_UPDATE", (data: any) => {
      setRemainingTime(data.remainingTime);
      if (data.activeLeaderboard) {
        setSocketLeaderboard(data.activeLeaderboard);
      }
    });
    return () => {
      s.disconnect();
    };
  }, []);

  const formatTime = (timeInSeconds: number | null) => {
    if (timeInSeconds === null) return "00:00:00";
    const h = Math.floor(timeInSeconds / 3600);
    const m = Math.floor((timeInSeconds % 3600) / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const sortedTeams = socketLeaderboard.length > 0
    ? socketLeaderboard
    : [...allTeamsState]
      .filter(t => t.gameStarted && t.role !== "admin")
      .sort((a, b) => b.score - a.score);
  const maxLevel = puzzles.length || 15;
  const topScore = sortedTeams[0]?.score || 0;

  useEffect(() => {
    // Keep socket heartbeat if necessary, removed the GET request for logs
    const interval = setInterval(() => {
      refreshTeams();
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshTeams]);

  // Only rely on socket notifications now
  const activeLogs = [...notifications]
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
    <div className="h-screen bg-[#02040a] text-slate-200 p-4 md:p-6 flex flex-col gap-4 md:gap-6 font-sans overflow-hidden relative selection:bg-cyan-500/30">

      {/* High-Tech Animated Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-cyan-900/10 via-blue-900/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_100%)] pointer-events-none" />
      <motion.div
        animate={{ backgroundPosition: ["0px 0px", "100px 100px"] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute inset-0 opacity-[0.04] mix-blend-screen pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 relative z-10 backdrop-blur-sm shrink-0 px-2 md:px-0 max-w-6xl mx-auto w-full">
        <div className="absolute -bottom-px left-0 w-1/3 h-[2px] bg-gradient-to-r from-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,1)]" />

        <div className="flex items-center gap-3 md:gap-4">
          <img src="https://i.ibb.co/LXwJLXBp/akatsukilogo-removebg-preview.png" alt="Akatsuki" className="h-20 md:h-24 object-contain" />
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Leaderboard
          </h1>
          {remainingTime !== null && (
            <div className="text-xl font-bold text-cyan-400 bg-cyan-900/30 px-3 py-1 rounded ml-4 border border-cyan-500/50">
              {formatTime(remainingTime)}
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-6 text-right">
          {/* Feed Toggle Button */}
          <button
            onClick={() => setIsFeedVisible(!isFeedVisible)}
            className="ml-4 h-12 px-4 rounded-xl border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/50 hover:border-cyan-400/60 transition-all duration-300 flex items-center gap-2 group shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md"
          >
            {isFeedVisible ? <EyeOff size={18} className="text-cyan-400" /> : <Eye size={18} className="text-cyan-400" />}
            <span className="text-xs font-sans  text-cyan-300 uppercase tracking-wider">
              {isFeedVisible ? "Hide J.A.R.V.I.S." : "Show J.A.R.V.I.S."}
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8 flex-1 relative z-10 overflow-hidden">

        {/* LEFT COLUMN: PODIUM & LIST */}
        <motion.div
          layout
          className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto custom-scrollbar pr-2 pb-4 md:pb-8"
        >
          {/* PODIUM SECTION */}
          {podium.length > 0 && (
            <div className="flex flex-col md:flex-row items-end justify-center gap-3 md:gap-6 mt-4 md:mt-6 px-2 md:px-0 max-w-6xl mx-auto w-full shrink-0">
              <AnimatePresence mode="popLayout">
                {podium.map((team) => (
                  <PodiumCard key={team.teamId} team={team} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* OTHERS LIST */}
          <motion.div layout className="flex flex-col gap-2 md:gap-3 mt-2 md:mt-4 px-2 md:px-0 max-w-6xl mx-auto w-full">
            <AnimatePresence mode="popLayout">
              {others.map((team, index) => (
                <ListRow key={team.teamId} team={team} index={index} maxLevel={maxLevel} topScore={topScore} />
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN: J.A.R.V.I.S. FEED (TOGGLEABLE) */}
        <AnimatePresence>
          {isFeedVisible && (
            <motion.div
              initial={{ opacity: 0, x: 100, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: 100, width: 0, transition: { duration: 0.3 } }}
              className="w-full lg:w-[350px] xl:w-[400px] flex-col relative shrink-0 h-[600px] lg:h-auto flex"
            >
              <div className="bg-[#030914]/80 border border-cyan-500/20 rounded-2xl flex-1 flex flex-col relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.1)] backdrop-blur-2xl">

                {/* Header */}
                <div className="p-5 border-b border-cyan-500/20 bg-cyan-950/40 relative">
                  <div className="absolute top-0 right-6 w-16 h-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]" />
                  <div className="flex items-center gap-3">
                    <Terminal size={18} className="text-cyan-300 animate-pulse" />
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-100 drop-shadow-md">J.A.R.V.I.S. Feed</h2>
                  </div>
                </div>

                {/* Feed Content */}
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 relative z-10">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {activeLogs.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60"
                      >
                        <Radio size={36} className="text-cyan-500 mb-4 animate-[ping_3s_infinite]" />
                        <p className="text-[10px] text-cyan-400 font-sans uppercase tracking-widest leading-loose">Monitoring live sockets...<br />Awaiting tactical feedback.</p>
                      </motion.div>
                    ) : (
                      activeLogs.map((notif, i) => (
                        <motion.div
                          layout
                          key={notif.id || i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className={cn(
                            "p-3.5 rounded-xl text-[10px] font-sans flex flex-col gap-2 relative overflow-hidden group border backdrop-blur-sm",
                            notif.type === 'attack' ? "bg-red-950/30 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]" :
                              notif.type === 'success' ? "bg-cyan-950/40 border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.1)]" :
                                "bg-slate-900/40 border-slate-700/50"
                          )}
                        >
                          <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1.5",
                            notif.type === 'attack' ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]" :
                              notif.type === 'success' ? "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]" :
                                "bg-slate-500"
                          )} />
                          <div className="flex justify-between items-start pl-2">
                            <span className={cn(
                              "font-black uppercase tracking-widest drop-shadow-sm",
                              notif.type === 'attack' ? "text-red-400" :
                                notif.type === 'success' ? "text-cyan-300" :
                                  "text-slate-300"
                            )}>{notif.type}</span>
                            <span className="text-cyan-600/80 font-sans tracking-wider">{notif.timestamp}</span>
                          </div>
                          <p className="text-slate-200  leading-relaxed pl-2">{notif.message}</p>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-3 bg-cyan-950/30 border-t border-cyan-500/20 text-center relative pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none" />
                  <p className="text-[9px] text-cyan-500 font-sans uppercase tracking-widest flex items-center justify-center gap-2 relative z-10 drop-shadow-md">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" /> TONY STARK NETWORK
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default LeaderboardPage;
