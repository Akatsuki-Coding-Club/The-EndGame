import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/services/api";
import { Navigate } from "react-router-dom";

// Standardized IDs to match backend stones array
const ALL_STONES = [
  { id: "space", name: "Space", color: "#3498db" },
  { id: "mind", name: "Mind", color: "#9c27b0" },
  { id: "reality", name: "Reality", color: "#00ff00" },
  { id: "power", name: "Power", color: "#e74c3c" },
  { id: "time", name: "Time", color: "#f39c12" },
  { id: "soul", name: "Soul", color: "#e91e63" },
];

interface TeamRank {
  rank: number;
  teamName: string;
  score: number;
}

const GameCompletion: React.FC = () => {
  const { score, allTeamsState, stones } = useGame();
  const { team, isLoggedIn } = useAuth();
  const [teamRank, setTeamRank] = useState<TeamRank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasRunRef = React.useRef(false);

  useEffect(() => {
    if (!isLoggedIn || !team || hasRunRef.current) return;
    hasRunRef.current = true;

    const fetchFinalData = async () => {
      try {
        setIsLoading(true);
        // Fetch final data from API directly (one-time)
        const [finalTeams, finalMe] = await Promise.all([
          api.getAllTeams().catch(() => []),
          api.getMe().catch(() => null),
        ]);

        const myScore = finalMe?.score ?? score;
        const sortedTeams = finalTeams.sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0));
        const myRankIndex = sortedTeams.findIndex((t: any) => t._id === team.id);
        const myRank = myRankIndex >= 0 ? myRankIndex + 1 : sortedTeams.length + 1;

        setTeamRank({
          rank: myRank,
          teamName: team.name || "Your Team",
          score: myScore,
        });
      } catch (e) {
        console.error("Error fetching final data:", e);
        // Fallback to using context data
        const sortedTeams = [...allTeamsState].sort((a, b) => b.score - a.score);
        const myRankIndex = sortedTeams.findIndex((t) => t.teamId === team.id);
        const myRank = myRankIndex >= 0 ? myRankIndex + 1 : sortedTeams.length + 1;

        setTeamRank({
          rank: myRank,
          teamName: team.name || "Your Team",
          score: score,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinalData();
  }, []);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // Fixed Variants with Explicit Types
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  const stoneVariants: Variants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
        delay: 0.5 + i * 0.1,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Liquid Background Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
      </div>

      <motion.div
        className="relative z-10 max-w-5xl w-full px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
            MISSION COMPLETE
          </h1>
        </motion.div>

        {/* Stats Section */}
        {!isLoading && teamRank && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <motion.div 
                variants={itemVariants}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
              <p className="text-xs text-slate-400 mb-1 uppercase tracking-widest">Final Integrity Score</p>
              <p className="text-5xl  text-white tracking-tighter">{teamRank.score.toLocaleString()}</p>
            </motion.div>

            <motion.div 
                variants={itemVariants}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
              <p className="text-xs text-slate-400 mb-1 uppercase tracking-widest">Global Ranking</p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl  text-white tracking-tighter">#{teamRank.rank}</p>
                <p className="text-slate-500">/ {allTeamsState.length}</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Infinity Stones - Liquid Glass Style */}
        <motion.div variants={itemVariants} className="space-y-8">
          <h2 className="text-center text-xs tracking-[0.5em] text-slate-500 uppercase">Stones in Possession</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {ALL_STONES.map((stone, i) => {
              const isOwned = stones.ownedStones.includes(stone.id);
              return (
                <motion.div
                  key={stone.id}
                  custom={i}
                  variants={stoneVariants}
                  className="flex flex-col items-center gap-4"
                >
                  <div 
                    className={`relative w-20 h-20 rounded-2xl flex items-center justify-center border transition-all duration-700 ${
                        isOwned 
                        ? "bg-slate-900/50 border-white/20 shadow-[0_0_30px_-5px] shadow-current" 
                        : "bg-white/5 border-white/5 grayscale opacity-20"
                    }`}
                    style={{ color: isOwned ? stone.color : 'transparent' }}
                  >
                    {/* Inner Shine for Liquid Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-2xl" />
                    
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isOwned ? 'text-white' : 'text-slate-600'}`}>
                        {stone.name}
                    </span>
                    
                    {isOwned && (
                        <motion.div 
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-2xl blur-md bg-current opacity-20"
                        />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameCompletion;
