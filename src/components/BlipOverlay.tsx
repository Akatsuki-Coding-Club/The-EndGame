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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#383838]/95 backdrop-blur-md p-6">
      <div className="w-full max-w-lg bg-[#5a5a5a] border-t-4 border-red-500 rounded-lg p-8 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">
            System Breach
          </h2>
          <span className="text-red-500 font-mono font-bold text-xl">{timeLeft}s</span>
        </div>

        <div className="bg-black/30 p-6 rounded-md mb-6 border border-white/10">
          <p className="text-xs text-red-400 font-bold uppercase mb-2">
            Decryption Required
          </p>
          <p className="text-sm text-white leading-relaxed">
            {blipPuzzleQuestion ?? "Loading puzzle..."}
          </p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await submitBlipAnswer(answer);
            if (ok) setAnswer("");
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            autoFocus
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="INPUT CODE..."
            className="flex-1 bg-black/40 border border-red-500/50 px-4 py-3 text-white outline-none focus:border-red-500 transition-all font-mono"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 text-white font-bold uppercase text-xs hover:bg-red-700 transition-colors"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default BlipOverlay;
