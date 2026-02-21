import React from "react";
import { useGame } from "@/context/GameContext";
import { Trophy, Activity, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const LeaderboardPage = () => {
  const { allTeamsState, notifications, puzzles } = useGame();
  const sortedTeams = [...allTeamsState].sort((a, b) => b.score - a.score);
  const maxLevel = puzzles.length || 15;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8 flex gap-8 font-mono overflow-hidden">
      {/* LEFT: RANKINGS AREA */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-6 mb-10 border-b border-slate-800 pb-6">
          <Trophy className="text-yellow-500 animate-bounce" size={48} />
          <div>
            <h1 className="text-5xl font-bold tracking-tighter uppercase italic">Live Standings</h1>
            <p className="text-blue-500 text-xs tracking-[0.5em]">MISSION_SYNC_ACTIVE</p>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto pr-4 scrollbar-none">
          {sortedTeams.map((team, index) => (
            <div
              key={team.teamId}
              className={cn(
                "flex items-center bg-slate-900/40 border border-slate-800/50 p-5 transition-all duration-500 hover:border-blue-500/50 group",
                index < 3 ? "bg-blue-900/10 border-blue-500/20" : ""
              )}
            >
              <div className={cn(
                "w-16 text-3xl font-black italic",
                index === 0 ? "text-yellow-500" : index === 1 ? "text-slate-300" : index === 2 ? "text-orange-500" : "text-slate-600"
              )}>
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="flex-1">
                <div className="text-xl font-bold tracking-tight group-hover:text-blue-400 transition-colors uppercase">
                  {team.teamName}
                </div>
                <div className="flex gap-4 mt-1">
                  <span className="text-[10px] text-slate-500 uppercase">LVL: {team.currentLevel} / {maxLevel}</span>
                  {team.currentTimeline && <span className="text-[10px] text-cyan-500 uppercase">TIMELINE: {team.currentTimeline}</span>}
                  {team.isFrozen && <span className="text-[10px] text-blue-500 animate-pulse font-bold">[FROZEN]</span>}
                  {team.isBlocked && <span className="text-[10px] text-red-500 animate-pulse font-bold">[BLOCKED]</span>}
                </div>
                <div className="flex gap-1 mt-2 items-center">
                  <span className="text-[10px] text-slate-500 uppercase mr-2">STONES:</span>
                  {team.stones && team.stones.length > 0 ? (
                    team.stones.map(stone => {
                      const colors: Record<string, string> = {
                        space: "bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]",
                        mind: "bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]",
                        reality: "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]",
                        power: "bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.8)]",
                        time: "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]",
                        soul: "bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]",
                      };
                      return (
                        <div key={stone} className={`w-3 h-3 rounded-full ${colors[stone] || "bg-white"}`} title={stone} />
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-slate-600">NONE</span>
                  )}
                </div>
              </div>

              <div className="text-4xl font-black text-white tabular-nums tracking-tighter">
                {team.score.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: SYSTEM LOGS / NOTIFICATIONS */}
      <div className="w-[400px] flex flex-col gap-6">
        <div className="bg-slate-900/80 border border-slate-800 p-6 flex-1 flex flex-col rounded-none relative">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <Terminal size={20} className="text-blue-500" />
            <h2 className="text-xs font-bold uppercase tracking-[0.3em]">System Comms</h2>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto scrollbar-none">
            {(notifications?.length || 0) === 0 ? (
              <p className="text-[10px] text-slate-600 uppercase italic">Awaiting neural link signals...</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "p-3 border-l-2 text-[10px] animate-in slide-in-from-right duration-500",
                    notif.type === 'attack' ? "bg-red-500/5 border-red-500" :
                      notif.type === 'success' ? "bg-blue-500/5 border-blue-500" :
                        "bg-slate-500/5 border-slate-500"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-black uppercase tracking-widest">{notif.type}</span>
                    <span className="text-slate-600 font-mono">{notif.timestamp}</span>
                  </div>
                  <p className="text-slate-300 font-bold leading-tight">{notif.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;