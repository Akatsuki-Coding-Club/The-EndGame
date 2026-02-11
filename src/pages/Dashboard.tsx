import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Send, Shield, Zap, Skull, Target, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import BlipOverlay from "@/components/BlipOverlay";
import confetti from "canvas-confetti";

const Dashboard = () => {
  const {
    puzzles,
    currentLevel,
    completedLevels,
    submitAnswer,
    stones,
    activateShield,
    blockTeam,
    triggerBlip,
    isFrozen,
    allTeamsState,
    gameLoading,
  } = useGame();

  const [answer, setAnswer] = useState("");
  const [showPowerSurgeMenu, setShowPowerSurgeMenu] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");

  useEffect(() => {
    const lockStack = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", lockStack);
    const blockMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", blockMenu);

    return () => {
      window.removeEventListener("popstate", lockStack);
      window.removeEventListener("contextmenu", blockMenu);
    };
  }, []);

  useEffect(() => {
    if (completedLevels.length > 0) {
      const end = Date.now() + 1 * 1000;
      const frame = () => {
        const colors = ['#ffffff', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
        confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [completedLevels.length]);

  const activePuzzle = puzzles.find((p) => p.id === currentLevel) || puzzles[0];
  const isSolved = completedLevels.includes(currentLevel);

  if (gameLoading && puzzles.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e293b] text-white">
        <p className="text-sm uppercase tracking-widest">Loading missions...</p>
      </div>
    );
  }
  if (puzzles.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e293b] text-white">
        <p className="text-sm uppercase tracking-widest">No missions available.</p>
      </div>
    );
  }

  const currentSetIndex = Math.floor((currentLevel - 1) / 5);
  const beadsInSet = Array.from({ length: 5 }, (_, i) => {
    const questionId = currentSetIndex * 5 + (i + 1);
    return completedLevels.includes(questionId);
  });

  const StoneCard = ({
    title,
    desc,
    icon,
    onUse = () => { },
    count = 0,
    variant = "stone",
    isPowerSurge = false
  }: {
    title: string;
    desc: string;
    icon: React.ReactNode;
    onUse?: () => void;
    count?: number;
    variant?: string;
    isPowerSurge?: boolean;
  }) => (
    <div className={`bg-[#5a5a5a]/90 backdrop-blur-sm border ${variant === "stone" ? "border-white/20" : "border-red-500/30"} p-4 rounded-lg mb-4 text-white shrink-0`}>
      <div className="flex items-center gap-4 mb-2">
        <div className={`w-10 h-10 ${variant === "stone" ? "bg-white/10" : "bg-red-500/10"} rounded flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="font-bold text-sm uppercase tracking-tighter">{title}</h3>
      </div>
      <p className="text-[10px] mb-3 text-gray-300 leading-tight">{desc}</p>

      {!showPowerSurgeMenu || !isPowerSurge ? (
        <button
          onClick={isPowerSurge ? () => setShowPowerSurgeMenu(true) : onUse}
          disabled={(variant === "stone" && count <= 0) || isFrozen}
          className={`w-full py-2 ${variant === "stone" ? "bg-white text-[#484848]" : "bg-red-600 text-white"} text-[10px] font-bold rounded hover:opacity-90 disabled:opacity-30 transition-all`}
        >
          {variant === "stone" ? `USE STONE (${count})` : "INITIATE ATTACK"}
        </button>
      ) : (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
          <div className="relative">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded px-2 py-2 text-[10px] outline-none appearance-none"
            >
              <option value="">Select Team...</option>
              {allTeamsState?.filter(t => t.teamId !== 'current').map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-2.5 opacity-50 pointer-events-none" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (selectedTeam) {
                  blockTeam(selectedTeam);
                  setShowPowerSurgeMenu(false);
                  setSelectedTeam("");
                }
              }}
              disabled={!selectedTeam}
              className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold rounded hover:bg-red-700 disabled:opacity-30"
            >
              LOCK TEAM
            </button>
            <button
              onClick={() => setShowPowerSurgeMenu(false)}
              className="px-2 py-2 border border-white/10 rounded text-[10px] hover:bg-white/5"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="h-screen max-h-screen flex flex-col overflow-hidden bg-cover bg-center bg-no-repeat text-white font-sans relative"
      style={{ backgroundImage: `url('https://t4.ftcdn.net/jpg/07/40/54/65/360_F_740546589_eVog5QiPu5WxsTV9IsDdLL5d2B3TQ4nD.webp')` }}
    >
      {/* Dark overlay to ensure readability against the bright comic background */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col h-full">
        <Navbar />
        {isFrozen && <BlipOverlay />}

        <div className="flex flex-1 overflow-hidden p-6 gap-6">
          <aside className="w-72 flex flex-col overflow-hidden bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
            <div className="p-4 border-b border-white/10 bg-black/20">
              <h2 className="text-[10px] font-bold uppercase tracking-widest opacity-80">System Controls</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <StoneCard title="Shield Matrix" desc="Automatically blocks incoming system attacks." icon={<Shield size={18} />} onUse={activateShield} count={stones.shieldCount} />

              <StoneCard
                title="Power Surge"
                desc="Temporarily disable a rival team's console."
                icon={<Zap size={18} />}
                isPowerSurge={true}
                count={stones.blockCount}
              />

              <div className="mt-2 pt-4 border-t border-white/10">
                <StoneCard variant="attack" title="Blip Protocol" desc="Freeze random units across the network." icon={<Skull size={18} className="text-red-400" />} onUse={() => triggerBlip(1)} />
                <StoneCard variant="attack" title="Direct Strike" desc="Target a specific unit for lockdown." icon={<Target size={18} className="text-red-400" />} onUse={() => { }} />
              </div>
            </div>
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="flex justify-center gap-6  items-center  py-3 rounded-xl ">
              {/* Neural Progress Link - Seamless Connection */}
              <div className="flex justify-center  items-center bg-black/40 py-2 rounded-xl shrink-0 border border-white/10 px-10">
                {beadsInSet.map((isFilled, idx) => (
                  <div key={idx} className="flex items-center">
                    {/* The Bead */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-700 z-10 
          ${isFilled
                          ? "bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                          : "bg-[#1b2535] border-white/20"
                        }`}
                    />

                    {/* The Connector - Only show if not the last bead */}
                    {idx < 4 && (
                      <div
                        className={`w-12 h-1 -mx-0.5 transition-colors duration-700 
            ${isFilled && beadsInSet[idx + 1]
                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                            : "bg-white/10"
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 rounded-xl mb-6 custom-scrollbar bg-black/30 backdrop-blur-sm border border-white/5">
              <h2 className="text-white/60 text-[10px] font-bold uppercase mb-4 tracking-[0.3em]">Neural Objective {activePuzzle.id}</h2>
              <div className="text-xl leading-relaxed whitespace-pre-wrap font-medium drop-shadow-lg">{activePuzzle.question}</div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await submitAnswer(currentLevel, answer);
                if (ok) setAnswer("");
              }}
              className="flex gap-3 h-11 shrink-0"
            >
              <input
                type="text"
                value={isSolved ? "MISSION CLEARED" : (isFrozen ? "SYSTEM LOCKED" : answer)}
                disabled={isSolved || isFrozen}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="ENTER DECRYPTION KEY..."
                className="flex-1 bg-black/60 backdrop-blur-md border border-white/20 px-4 rounded-md text-sm outline-none focus:border-white/50 transition-all placeholder:text-white/40"
              />
              <button
                type="submit"
                disabled={isSolved || !answer || isFrozen}
                className="px-8 bg-white text-[#1b2535] text-xs font-black uppercase rounded-md hover:bg-gray-200 disabled:opacity-40 transition-all shadow-lg"
              >
                Submit
              </button>
            </form>
          </main>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }
      `}</style>
    </div>
  );
};

export default Dashboard;