import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Shield, Zap, Skull, Target, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import BlipOverlay from "@/components/BlipOverlay";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import HeroManager from "@/components/HeroManager";
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
    isBlocked,
    gameLoading,
  } = useGame();

  const [answer, setAnswer] = useState("");
  const [showPowerSurgeMenu, setShowPowerSurgeMenu] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const {team, isAdmin} = useAuth();
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
        confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
        confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [completedLevels.length]);

  if (gameLoading && puzzles.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e293b] text-white">
        <p className="text-sm uppercase tracking-widest font-sans">Loading your game...</p>
      </div>
    );
  }

  const solvedCount = completedLevels.length;
  let windowOffset = 0;
  if (solvedCount >= 5) {
    windowOffset = Math.min(solvedCount - 4, 10);
  }

  const visibleBeads = Array.from({ length: 10 }, (_, i) => {
    const questionNum = windowOffset + i + 1;
    return {
      num: questionNum,
      isFilled: completedLevels.includes(questionNum),
      isActive: questionNum === currentLevel
    };
  });

  const activePuzzle = puzzles.find((p) => p.id === currentLevel) || puzzles[0];
  const isSolved = completedLevels.includes(currentLevel);

  const StoneCard = ({ title, desc, icon, onUse = () => { }, count = 0, variant = "stone", isPowerSurge = false }: any) => (
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
              {allTeamsState
                ?.filter((t) => {
                  const isNotMe = t.teamId !== team?.id;
                  const isNotAdmin = t.role !== "admin";

                  return isNotMe && isNotAdmin;
                })
                .map((target) => (
                  <option key={target.teamId} value={target.teamId}>
                    {target.teamName}
                  </option>
                ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-2.5 opacity-50 pointer-events-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { if (selectedTeam) { blockTeam(selectedTeam); setShowPowerSurgeMenu(false); setSelectedTeam(""); } }} className="flex-1 py-2 bg-red-600 text-white text-[10px] font-bold rounded">LOCK TEAM</button>
            <button onClick={() => setShowPowerSurgeMenu(false)} className="px-2 py-2 border border-white/10 rounded text-[10px]">CANCEL</button>
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
      <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col h-full">
        <Navbar />

        <HeroManager />


        {isFrozen && <BlipOverlay />}

        <div className="flex flex-1 overflow-hidden p-6 gap-6">
          <aside className="w-72 flex flex-col overflow-hidden bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
            <div className="p-4 border-b border-white/10 bg-black/20 text-center">
              <h2 className="text-[10px] font-bold uppercase tracking-widest opacity-80">System Controls</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <StoneCard title="Shield Matrix" desc="Blocks incoming system attacks." icon={<Shield size={18} />} onUse={activateShield} count={stones.shieldCount} />
              <StoneCard title="Power Surge" desc="Disable a rival team's console." icon={<Zap size={18} />} isPowerSurge={true} count={stones.blockCount} />
              <div className="mt-2 pt-4 border-t border-white/10">
                <StoneCard variant="attack" title="Blip Protocol" desc="Freeze units across network." icon={<Skull size={18} className="text-red-400" />} onUse={() => triggerBlip(1)} />
                <StoneCard variant="attack" title="Direct Strike" desc="Target unit for lockdown." icon={<Target size={18} className="text-red-400" />} onUse={() => { }} />
              </div>
            </div>
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* CONNECTED BEADS SECTION */}
            <div className="flex justify-center items-center py-3 rounded-xl mb-2 overflow-hidden">
              <div className="flex w-[90%] justify-center items-center bg-black/60 py-4 rounded-xl shrink-0 border border-white/10 px-10 shadow-2xl overflow-hidden relative">
                {/* Inner wrapper must be w-full to let flex-1 lines expand */}
                <div className="flex items-center w-full bead-window-transition">
                  {visibleBeads.map((bead, idx) => (
                    <React.Fragment key={bead.num}>
                      {/* The Bead - shrink-0 prevents it from becoming an oval */}
                      <div
                        className={`w-10 h-8 rounded-full border-2 transition-all duration-700 z-10 flex items-center justify-center text-[10px] font-bold shadow-inner shrink-0
              ${bead.isFilled
                            ? "bg-green-500 border-green-400 text-white bead-glow"
                            : bead.isActive
                              ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110"
                              : "bg-[#1b2535] border-white/20 text-white/40"
                          }`}
                      >
                        {bead.num}
                      </div>

                      {/* The Connector - flex-1 stretches it to fill available space */}
                      {idx < visibleBeads.length - 1 && (
                        <div
                          className={`flex-1 h-1 -mx-0.5 transition-all duration-700 
                ${bead.isFilled && visibleBeads[idx + 1].isFilled
                              ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                              : "bg-white/10"
                            }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 rounded-xl mb-6 custom-scrollbar bg-black/30 backdrop-blur-sm border border-white/5">
              <h2 className="text-white/60 text-[10px] font-bold uppercase mb-4 tracking-[0.3em]">Mission {activePuzzle.id}</h2>
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

        .bead-window-transition {
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes energy-pulse {
          0% { box-shadow: 0 0 30px rgba(34,197,94,0.4), inset 0 0 5px rgba(34,197,94,0.2); }
          50% { box-shadow: 0 0 30px rgba(34,197,94,0.8), inset 0 0 10px rgba(34,197,94,0.4); }
          100% { box-shadow: 0 0 30px rgba(34,197,94,0.4), inset 0 0 5px rgba(34,197,94,0.2); }
        }

        .bead-glow {
          animation: energy-pulse 2s infinite ease-in-out;
        }

        // spiderman

        .spidey-loop {
          /* Total cycle time 10 seconds */
          animation: spidey-swing 10s ease-in-out infinite;
        }

        @keyframes spidey-swing {
          /* 0% to 10%: Swings Down into view */
          0% { 
            transform: translateY(-300%); 
            opacity: 0; 
          }
          10% { 
            transform: translateY(0); 
            opacity: 1; 
          }

          /* 10% to 40%: Hangs there (visible for ~3 seconds) */
          40% { 
            transform: translateY(0); 
            opacity: 1; 
          }

          /* 40% to 50%: Swings back UP out of view */
          50% { 
            transform: translateY(-300%); 
            opacity: 0; 
          }

          /* 50% to 100%: Stays invisible (Waiting for next loop) */
          100% { 
            transform: translateY(-300%); 
            opacity: 0; 
          }

          /* 1. Fly Up (Iron Man) */
          .fly-up {
            animation: flyUpAnim 3s linear forwards;
          }
          @keyframes flyUpAnim {
            0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(-100vh) scale(0.5); opacity: 1; }
          }

          /* 2. Fly Across (Iron Man Blast) */
          .fly-across {
            animation: flyAcrossAnim 5s ease-in-out forwards;
          }
          @keyframes flyAcrossAnim {
            0% { transform: translateX(-100vw); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(100vw); opacity: 0; }
          }

          /* 3. Drop Swing (Spidey) */
          .drop-swing {
            transform-origin: top center;
            animation: swingAnim 6s ease-in-out forwards;
          }
          @keyframes swingAnim {
            0% { transform: translateY(-300px) rotate(-10deg); }
            20% { transform: translateY(50px) rotate(5deg); }
            40% { transform: translateY(0px) rotate(-3deg); }
            60% { transform: translateY(10px) rotate(2deg); opacity: 1; }
            100% { transform: translateY(-300px) rotate(0deg); opacity: 0; }
          }

          /* 4. Fade Float (Dr Strange) */
          .fade-float {
            animation: floatAnim 8s ease-in-out forwards;
          }
          @keyframes floatAnim {
            0% { opacity: 0; transform: scale(0.8); }
            20% { opacity: 0.9; transform: scale(1) translateY(0px); }
            50% { transform: scale(1.05) translateY(-20px); }
            80% { opacity: 0.9; transform: scale(1) translateY(0px); }
            100% { opacity: 0; transform: scale(0.8); }
          }

          /* 5. Thunder Strike (Thor) */
          .thunder-strike {
            animation: strikeAnim 4s ease-out forwards;
          }
          @keyframes strikeAnim {
            0% { opacity: 0; transform: translateY(-50px) scale(1.5); filter: brightness(3); }
            10% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1); }
            80% { opacity: 1; filter: brightness(1); }
            100% { opacity: 0; filter: brightness(0); }
          }
                    /* 1. Left to Right (Clockwise) */
          .roll-left-to-right {
            position: absolute;
            animation: rollL2R 4s linear forwards;
          }
          @keyframes rollL2R {
            0% { left: -200px; transform: rotate(0deg); }
            100% { left: 100vw; transform: rotate(1440deg); } /* Spin Clockwise */
          }

          /* 2. Right to Left (Counter-Clockwise) */
          .roll-right-to-left {
            position: absolute;
            animation: rollR2L 4s linear forwards;
          }
          @keyframes rollR2L {
            0% { left: 100vw; transform: rotate(0deg); } /* Start at Right Edge */
            100% { left: -200px; transform: rotate(-1440deg); } /* Spin Counter-Clockwise */
          }
          .corner-drop {
            animation: cornerDropAnim 5s ease-in-out forwards;
            transform-origin: top center;
          }

          @keyframes cornerDropAnim {
            0% { 
              transform: translateY(-200px); 
              opacity: 0; 
            }
            15% { 
              transform: translateY(0); 
              opacity: 1; 
            }
            85% { 
              transform: translateY(0); 
              opacity: 1; 
            }
            100% { 
              transform: translateY(-200px); 
              opacity: 0; 
            }
          }
}
      `}</style>
    </div>
  );
};

export default Dashboard;