import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { blipPuzzle } from "@/services/mockData";
import { Snowflake, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const BlipOverlay = () => {
  const { solveBlipPuzzle, blipPuzzleSolved, frozenUntil, setIsFrozen } = useGame();
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [showPuzzle, setShowPuzzle] = useState(false); 

  useEffect(() => {
    // 5-second delay before showing the interactive puzzle
    const delayTimer = setTimeout(() => setShowPuzzle(true), 5000);

    const timer = setInterval(() => {
      if (!frozenUntil) return;
      const remaining = Math.max(0, Math.floor((frozenUntil - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        setIsFrozen(false);
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(timer);
    };
  }, [frozenUntil, setIsFrozen]);

  if (!showPuzzle || blipPuzzleSolved) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md animate-scale-in">
      <div className="w-full max-w-lg p-8 glass-card border-t-4 border-blue-500 shadow-[0_0_50px_rgba(14,165,233,0.3)] relative overflow-hidden">
        {/* Scanner effect line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/50 animate-pulse" />
        
        <div className="text-center mb-8">
          <Snowflake className="mx-auto text-blue-400 animate-pulse mb-4" size={48} />
          <h2 className="text-2xl font-bold text-blue-400 tracking-tighter uppercase neon-text">
            BYPASS PROTOCOL
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="text-[10px] text-red-500 font-mono font-bold uppercase tracking-widest">
              Lockdown Active: {timeLeft}s
            </span>
          </div>
        </div>

        <div className="bg-blue-950/20 border border-blue-500/30 p-6 mb-6">
          <p className="text-[10px] text-blue-400 uppercase font-bold mb-2 tracking-widest">Decryption Key Required</p>
          <p className="text-sm text-white font-body leading-relaxed">{blipPuzzle.question}</p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (answer.trim().toUpperCase() === blipPuzzle.answer.toUpperCase()) {
            solveBlipPuzzle(); 
          } else {
            toast.error("INVALID BYPASS CODE", {
              className: "bg-slate-900 border-red-500 text-red-500 text-[10px]"
            });
          }
        }} className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="INPUT CODE..."
            className="flex-1 bg-black/40 border-b border-blue-500/50 px-4 py-3 text-white font-mono text-sm focus:border-blue-400 outline-none transition-all"
          />
          <button type="submit" className="px-6 py-3 bg-blue-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BlipOverlay;