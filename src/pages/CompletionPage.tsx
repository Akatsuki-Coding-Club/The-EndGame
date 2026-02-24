import React, { useEffect, useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";

type CompletionSummary = {
  teamName: string;
  score: number;
  rank: number | null;
  stones: string[];
};

const CompletionPage: React.FC = () => {
  const { score, stones, allTeamsState } = useGame();
  const { team } = useAuth();

  const rank = useMemo(() => {
    if (!team) return null;
    const sorted = [...allTeamsState].sort((a, b) => b.score - a.score);
    const index = sorted.findIndex(t => t.teamId === team.id);
    return index !== -1 ? index + 1 : null;
  }, [allTeamsState, team]);

  const summary: CompletionSummary = {
    teamName: team?.name || "Your Squad",
    score: score || 0,
    rank: rank,
    stones: stones?.ownedStones || [],
  };

  // Celebration confetti on mount
  useEffect(() => {
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 35,
      spread: 80,
      ticks: 60,
      zIndex: 60,
    };

    const colors = ["#e62429", "#22c55e", "#38bdf8", "#facc15"];

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = Math.round(30 * (timeLeft / duration));

      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: 0 },
        colors,
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const formatRank = (rank: number | null) => {
    if (!rank || rank < 1) return "—";
    const rem10 = rank % 10;
    const rem100 = rank % 100;
    if (rem10 === 1 && rem100 !== 11) return `${rank}st`;
    if (rem10 === 2 && rem100 !== 12) return `${rank}nd`;
    if (rem10 === 3 && rem100 !== 13) return `${rank}rd`;
    return `${rank}th`;
  };

  const stonesDisplay =
    summary?.stones && summary.stones.length > 0 ? summary.stones : ["No stones earned"];

  return (
    <div className="relative h-screen w-full flex flex-col items-center bg-[#050505] font-sans overflow-hidden">
      {/* BACKGROUND (mirrors RulesPage theme) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,0.95)_100%)]" />
        <div className="absolute inset-0 bg-red-950/10 mix-blend-color" />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 w-full max-w-4xl px-4 md:px-6 flex-1 flex flex-col justify-center items-center py-6">
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] px-6 md:px-10 py-8 md:py-10">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <p className="text-[10px] tracking-[0.5em] text-red-500 font-black uppercase mb-2">
              Mission Complete
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
              Endgame <span className="text-[#e62429]">Results</span>
            </h1>
            <div className="h-[2px] w-24 md:w-40 bg-gradient-to-r from-transparent via-red-600 to-transparent mt-3 opacity-60 mx-auto" />
          </div>

          {/* Team name */}
          <div className="text-center mb-6">
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400 mb-1">
              Team
            </p>
            <p className="text-xl md:text-2xl font-black uppercase tracking-wide text-white">
              {summary?.teamName || team?.name || "Your Squad"}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 mb-1">
                Final Score
              </p>
              <p className="text-2xl md:text-3xl font-black text-cyan-400">
                {summary ? summary.score : "—"}
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 mb-1">
                Global Rank
              </p>
              <p className="text-2xl md:text-3xl font-black text-amber-300">
                {formatRank(summary?.rank ?? null)}
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 mb-1">
                Stones Earned
              </p>
              <p className="text-xs md:text-sm font-semibold text-slate-100 uppercase tracking-widest">
                {stonesDisplay.join(" • ")}
              </p>
            </div>
          </div>

          {/* Footer text */}
          <div className="text-center text-[11px] md:text-xs text-slate-400 uppercase tracking-[0.25em]">
            Thank you for entering the{" "}
            <span className="text-red-500 font-bold">Endgame Protocol</span>.
          </div>
        </div>
      </div>

      {/* Subtle scanlines overlay to match theme */}
      <div className="pointer-events-none fixed inset-0 z-20 opacity-[0.06] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
    </div>
  );
};

export default CompletionPage;

