import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Shield, Zap, Loader2 } from "lucide-react";
import * as api from "@/services/api";

const BlipOverlay = () => {
  const { submitBlipAnswer, frozenUntil, setIsFrozen, blipPuzzleQuestion } = useGame();
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [fetchedQuestion, setFetchedQuestion] = useState<string | null>(null);

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

  useEffect(() => {
    if (blipPuzzleQuestion) {
      setFetchedQuestion(blipPuzzleQuestion);
    } else if (frozenUntil) {
      api.getBlipPuzzle().then((res) => {
        if (res?.question) setFetchedQuestion(res.question);
      }).catch(() => { });
    }
  }, [blipPuzzleQuestion, frozenUntil]);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6">

      {/* Background Chain Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20L0 0M20 20L40 0M20 20L0 40M20 20L40 40' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative w-full max-w-xl group">

        {/* Hex-Cut Liquid Glass Panel */}
        <div className="relative bg-black/95 backdrop-blur-2xl border border-red-900/40 shadow-2xl p-10 
                      [clip-path:polygon(8%_0,92%_0,100%_12%,100%_88%,92%_100%,8%_100%,0_88%,0_12%)]">

          {/* Internal Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 bg-red-600 rounded shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                <Shield className="text-white" size={20} />
              </div>
              <h2 className="text-white text-2xl font-black uppercase tracking-tighter">
                System Lock
              </h2>
            </div>

            {/* Timer */}
            <div className="text-amber-500 font-bold text-xl mb-8 font-sans">
              {timeLeft}s
            </div>

            {/* Question Display - Fixed Fetching Logic */}
            <div className="w-full bg-black/40 border-y border-white/10 min-h-[140px] flex items-center justify-center px-6 mb-8">
              {fetchedQuestion ? (
                <p className="text-xl text-white font-medium leading-relaxed">
                  {fetchedQuestion}
                </p>
              ) : (
                <div className="flex flex-col items-center gap-3 text-white/40">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="text-xs uppercase tracking-widest font-bold">Fetching Challenge...</span>
                </div>
              )}
            </div>

            {/* Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!answer.trim()) return;
                const ok = await submitBlipAnswer(answer);
                if (ok) setAnswer("");
              }}
              className="w-full space-y-4"
            >
              <input
                type="text"
                autoFocus
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter Code"
                className="w-full bg-black/20 border border-white/10 focus:border-red-500 px-6 py-4 text-white text-center text-xl outline-none transition-all placeholder:text-white/10 rounded-lg"
              />

              <button
                type="submit"
                disabled={!answer.trim() || !fetchedQuestion}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] transition-all 
                         disabled:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-3 rounded-lg shadow-lg"
              >
                Execute <Zap size={18} fill="currentColor" />
              </button>
            </form>
          </div>
        </div>

        {/* Outer Brackets */}
        <div className="absolute -top-3 -left-3 w-10 h-10 border-t-2 border-l-2 border-red-600 opacity-50" />
        <div className="absolute -top-3 -right-3 w-10 h-10 border-t-2 border-r-2 border-red-600 opacity-50" />
        <div className="absolute -bottom-3 -left-3 w-10 h-10 border-b-2 border-l-2 border-red-600 opacity-50" />
        <div className="absolute -bottom-3 -right-3 w-10 h-10 border-b-2 border-r-2 border-red-600 opacity-50" />
      </div>
    </div>
  );
};

export default BlipOverlay;