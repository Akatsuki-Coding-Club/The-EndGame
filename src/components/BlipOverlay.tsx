import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Skull, AlertTriangle, Terminal, Zap, ShieldAlert, Cpu, Activity } from "lucide-react";

const BlipOverlay = () => {
  const { submitBlipAnswer, frozenUntil, setIsFrozen, blipPuzzleQuestion } = useGame();
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!frozenUntil) return;
      const remaining = Math.max(0, Math.floor((frozenUntil - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setIsFrozen(false);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [frozenUntil, setIsFrozen]);

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6 overflow-hidden">
      {/* Glitch Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-red-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-500/20 to-transparent" />
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.1)_0%,transparent_100%)]" />
      </div>

      <div className="w-full max-w-xl relative flex flex-col gap-8 animate-in slide-in-from-bottom-10 duration-700">
        {/* Warning Badge Container */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-600/30 blur-3xl animate-pulse scale-150" />
            <div className="relative w-20 h-20 bg-black border-2 border-red-500 rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden">
              <div className="absolute inset-0 bg-red-600/10 animate-pulse" />
              <Skull size={32} className="text-red-500 -rotate-45 animate-bounce" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic [text-shadow:4px_4px_0px_#ef444466]">
              System Breach
            </h2>
            <div className="flex items-center justify-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <p className="text-[10px] font-mono tracking-[0.5em] text-red-500 uppercase font-black">Temporal Instability: Critical</p>
            </div>
          </div>
        </div>

        {/* Puzzle Terminal */}
        <div className="relative group">
          <div className="absolute inset-0 bg-red-600/5 blur-xl group-hover:bg-red-600/10 transition-colors" />
          <div className="relative bg-[#080808] border border-red-500/20 rounded-[2.5rem] p-10 overflow-hidden shadow-2xl">
            {/* HUD Corner Elements */}
            <div className="absolute top-0 right-0 p-6 opacity-30">
              <Activity size={16} className="text-red-500 animate-pulse" />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center bg-red-500/5 border border-red-500/10 px-6 py-3 rounded-full">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-red-500" />
                  <span className="text-[9px] font-mono tracking-widest text-red-400 uppercase">Input Payload Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-mono font-black text-red-500">{timeLeft}s</span>
                  <span className="text-[8px] font-mono text-red-500/40 uppercase">Remaining</span>
                </div>
              </div>

              <div className="bg-black/40 rounded-3xl p-8 border border-white/5 relative group">
                <div className="absolute -top-3 left-6 px-3 bg-[#080808] text-[8px] font-mono text-white/20 uppercase tracking-widest border border-white/5 rounded-full">Primary Question</div>
                <p className="text-lg md:text-xl font-bold text-white leading-relaxed text-center font-mono tracking-tight selection:bg-red-500/30">
                  {blipPuzzleQuestion ?? "AWAITING_RELAY_SIGNATURE..."}
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const ok = await submitBlipAnswer(answer);
                  if (ok) setAnswer("");
                }}
                className="flex flex-col gap-4"
              >
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="ENTER DECRYPTION KEY..."
                    className="w-full bg-black border-2 border-red-900/40 focus:border-red-600/50 rounded-2xl px-6 py-6 text-white text-center text-xl font-mono tracking-[0.2em] outline-none transition-all placeholder:text-red-900/30 shadow-[inset_0_0_20px_rgba(0,0,0,1)]"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                    <Zap size={20} className="text-red-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="group relative w-full overflow-hidden bg-red-600 hover:bg-red-500 text-white py-6 rounded-2xl transition-all active:scale-[0.98] shadow-[0_10px_40px_rgba(220,38,38,0.3)] hover:shadow-[0_15px_50px_rgba(220,38,38,0.5)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="relative flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.4em]">
                    <ShieldAlert size={20} className="animate-pulse" />
                    Bypass Protocol
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* System Logs HUD */}
        <div className="grid grid-cols-2 gap-4 px-6 opacity-30">
          <div className="flex items-center gap-3">
            <Cpu size={14} className="text-red-500" />
            <span className="text-[8px] font-mono tracking-widest text-white uppercase">CPU_USAGE: MAX</span>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <Activity size={14} className="text-orange-500" />
            <span className="text-[8px] font-mono tracking-widest text-white uppercase">REDUNDANCY: 0%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlipOverlay;
