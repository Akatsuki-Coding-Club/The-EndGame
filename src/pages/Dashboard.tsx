import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { puzzles } from "@/services/mockData";
import PowerStonesPanel from "@/components/PowerStonesPanel";
import { CheckCircle2, Circle, Send, Terminal, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import BlipOverlay from "@/components/BlipOverlay";
import { toast } from "sonner";

const Dashboard = () => {
  const {
    currentLevel,
    completedLevels,
    submitAnswer,
    isFrozen,
    setFrozen,
    stones,
    isBlocked,
    setIsBlocked,
    deactivateShield,
    blipPuzzleSolved 
  } = useGame();

  const [selectedLevel, setSelectedLevel] = useState(currentLevel);
  const [answer, setAnswer] = useState("");
  const [isInitialFreeze, setIsInitialFreeze] = useState(false);

  const activePuzzle = puzzles.find((p) => p.id === selectedLevel) || puzzles[0];
  const isSolved = completedLevels.includes(selectedLevel);

  useEffect(() => {
    if (isFrozen && !blipPuzzleSolved) {
      setIsInitialFreeze(true);
      const timer = setTimeout(() => {
        setIsInitialFreeze(false);
      }, 5000); // Matches the 5s delay in BlipOverlay
      return () => clearTimeout(timer);
    } else {
      setIsInitialFreeze(false);
    }
  }, [isFrozen, blipPuzzleSolved]);

  useEffect(() => {
    if (isBlocked) {
      if (stones.shieldActive) {
        deactivateShield();
        setIsBlocked(false);
        toast.success("SHIELD MATRIX DEPLETED", {
          description: "Incoming block attack negated.",
          className: "h-12 border-l-4 border-blue-500 bg-slate-950 text-white font-display text-[10px]"
        });
      } else {
        setIsBlocked(false); 
        setFrozen(true, Date.now() + 120000); 

        toast.error("SYSTEM COMPROMISED", {
          description: "Incoming Power Surge detected. System locked.",
          className: "h-12 border-l-4 border-red-600 bg-slate-950 text-white font-display text-[10px]"
        });
      }
    }
  }, [isBlocked, stones.shieldActive, deactivateShield, setIsBlocked, setFrozen]);

  const handleLevelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitAnswer(selectedLevel, answer)) {
      setAnswer("");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background text-foreground flex overflow-hidden font-display relative">
        {/* The high-priority puzzle overlay */}
        {isFrozen && <BlipOverlay />}

        <aside className="w-64 border-r border-primary/20 bg-black/40 backdrop-blur-xl flex flex-col">
          <div className="p-6 border-b border-primary/20">
            <h2 className="text-[10px] tracking-[0.3em] text-primary font-bold uppercase">Mission Log</h2>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
            {puzzles.map((p) => {
              const solved = completedLevels.includes(p.id);
              const locked = p.id > currentLevel;
              return (
                <button
                  key={p.id}
                  disabled={locked}
                  onClick={() => setSelectedLevel(p.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 transition-all duration-300 border",
                    selectedLevel === p.id ? "bg-primary/10 border-primary shadow-[0_0_10px_rgba(255,0,0,0.2)]" : "border-transparent hover:border-primary/30",
                    locked ? "opacity-20 cursor-not-allowed" : "opacity-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {solved ? <CheckCircle2 size={14} className="text-primary" /> : <Circle size={14} className="text-primary/40" />}
                    <span className="text-xs font-bold tracking-widest uppercase">M-{p.id.toString().padStart(2, '0')}</span>
                  </div>
                  {!locked && <span className="text-[8px] text-primary/60 font-mono">{p.points}P</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 relative flex flex-col p-8 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-from)_0%,_transparent_50%)] from-red-900/10">
          {isInitialFreeze && (
            <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-pulse">
              <div className="text-center">
                <ShieldAlert size={64} className="text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-primary neon-text uppercase tracking-tighter">System Frozen</h1>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-[0.5em]">
                  Initiating Blip Decryption Protocol...
                </p>
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto w-full flex flex-col h-full">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Terminal size={16} className="text-primary" />
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Encrypted Mission Data</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white uppercase">{activePuzzle.title}</h2>
            </div>

            <div className="flex-1 glass-card p-10 border-t-4 border-primary/50 relative mb-8">
              <div className="absolute top-4 right-4 text-[8px] text-primary/30 font-mono uppercase">Reference: STARK_INTEL_{activePuzzle.id}</div>
              <p className="text-lg leading-relaxed text-foreground/90 font-body first-letter:text-4xl first-letter:text-primary">
                {activePuzzle.question}
              </p>
            </div>

            <form onSubmit={handleLevelSubmit} className="flex gap-4 items-end bg-black/40 p-6 border border-white/5 rounded-none">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] text-primary/70 uppercase tracking-widest font-bold">Input Decryption Key</label>
                <input
                  type="text"
                  disabled={isSolved}
                  value={isSolved ? "MISSION COMPLETE" : answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-primary/20 py-2 text-xl font-bold focus:border-primary outline-none transition-all placeholder:text-white/5"
                  placeholder="TYPE ANSWER HERE..."
                />
              </div>
              <button
                type="submit"
                disabled={isSolved}
                className="px-8 py-4 bg-primary text-white font-bold text-xs uppercase tracking-[0.3em] hover:bg-red-700 transition-all disabled:opacity-20"
              >
                <div className="flex items-center gap-2">
                  <Send size={16} /> Submit
                </div>
              </button>
            </form>
          </div>
        </main>

        <aside className="w-80 border-l border-primary/20 bg-black/40 backdrop-blur-xl p-6 overflow-y-auto">
          <PowerStonesPanel />
        </aside>

        <button
          onClick={() => setFrozen(true, Date.now() + 60000)}
          className="fixed bottom-4 left-4 p-2 bg-red-900 text-white text-[8px] opacity-20 hover:opacity-100 transition-opacity"
        >
          DEBUG: TRIGGER BLIP
        </button>
        <button
          onClick={() => setIsBlocked(true)}
          className="fixed bottom-14 left-4 p-2 bg-orange-600 text-white text-[8px] opacity-20 hover:opacity-100 transition-opacity"
        >
          DEBUG: RECEIVE POWER STONE ATTACK
        </button>
      </div>
    </>
  );
};

export default Dashboard;