import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";

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
    <div className="fixed inset-0 z-[9999] bg-red-950/90 backdrop-blur-xl flex flex-col items-center justify-center text-red-50 overflow-hidden">
      {/* Glitch & Noise Decorative overlays */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-red-900/20 pointer-events-none" />

      {/* Abstract Red glowing background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none animate-pulse" />

      <div className="relative w-full max-w-lg p-10 bg-black/60 backdrop-blur-2xl rounded-3xl border border-red-500/40 shadow-[0_0_80px_rgba(220,38,38,0.3)] z-10 transform transition-all">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />

        {/* Warning Header */}
        <div className="flex flex-col items-center justify-center mb-8 relative">
          <div className="absolute -inset-4 bg-red-500/10 blur-xl rounded-full" />
          <h1 className="text-4xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] text-center tracking-[0.3em] uppercase mb-2 animate-pulse">
            System Breach
          </h1>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <p className="text-xs font-mono text-red-400/80 uppercase tracking-[0.4em]">
              Blip Protocol Active
            </p>
          </div>
        </div>

        {/* Puzzle Board */}
        <div className="bg-[#0a0505] p-8 rounded-2xl border border-red-500/20 mb-8 shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.05)_0%,transparent_100%)] pointer-events-none" />

          <div className="flex items-center justify-between mb-4 border-b border-red-500/20 pb-4">
            <p className="text-[10px] text-red-500/70 font-black uppercase tracking-widest flex items-center gap-2">
              Decryption Required
            </p>
            <span className="text-red-500 text-sm font-mono font-black drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
              {timeLeft}S REMAINING
            </span>
          </div>

          <p className="text-lg text-white font-mono tracking-wide text-center relative z-10 leading-relaxed min-h-[60px] flex items-center justify-center">
            {blipPuzzleQuestion ?? "Awaiting decryption sequence..."}
          </p>
        </div>

        {/* Input Form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await submitBlipAnswer(answer);
            if (ok) setAnswer("");
          }}
          className="space-y-4"
        >
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="ENTER OVERRIDE CODE..."
              className="w-full bg-[#0a0505] border border-red-500/40 rounded-xl px-6 py-5 text-white text-center text-lg font-mono font-black tracking-widest outline-none focus:border-red-400 focus:shadow-[0_0_30px_rgba(239,68,68,0.3)] placeholder-red-900/50 transition-all z-20 relative"
            />
          </div>

          <button
            type="submit"
            disabled={!answer.trim()}
            className="w-full py-5 rounded-xl bg-red-600/90 hover:bg-red-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] border border-red-400/50 text-white font-black uppercase tracking-[0.4em] text-sm transition-all disabled:opacity-40 disabled:hover:shadow-none disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10">Execute Override</span>
          </button>
        </form>

        {/* Framing Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-500/50 rounded-tl-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-500/50 rounded-tr-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-500/50 rounded-bl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-500/50 rounded-br-3xl pointer-events-none" />
      </div>
    </div>
  );
};

export default BlipOverlay;
