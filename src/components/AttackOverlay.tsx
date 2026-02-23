import { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import * as api from "@/services/api";
import { toast } from "sonner";

const AttackOverlay = () => {
  const { isBlocked, stones, blockPuzzleQuestion, setIsBlocked } = useGame();

  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  const blockedUntil = stones.blockedUntil;

  useEffect(() => {
    if (!isBlocked || !blockedUntil) return;

    const interval = setInterval(() => {
      const remaining = blockedUntil - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlocked, blockedUntil]);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error("Please enter an answer");
      return;
    }

    try {
      setLoading(true);
      const res = await api.submitBlockUnlock(answer);

      if (res.success) {
        toast.success("ACCESS_RESTORED");
        setIsBlocked?.(false);
        setAnswer("");
      }
    } catch (err: any) {
      // Wrong answer - show error but keep overlay visible
      toast.error("Wrong answer. Try again.");
      setAnswer("");
    } finally {
      setLoading(false);
    }
  };

  if (!isBlocked) return null;

  return (
    <div className="fixed inset-0 z-50 bg-cyan-950/80 backdrop-blur-md flex flex-col items-center justify-center text-cyan-50 overflow-hidden">
      {/* Decorative Ice elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 via-transparent to-cyan-500/10 pointer-events-none" />

      <div className="relative w-[500px] p-8 bg-cyan-900/30 backdrop-blur-xl rounded-2xl border border-cyan-300/40 shadow-[0_0_50px_rgba(6,182,212,0.2)] z-10 transform transition-all">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-400/20 blur-3xl rounded-full pointer-events-none" />

        <h1 className="text-3xl font-black text-white mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] text-center tracking-widest uppercase">
          ❄ SYSTEM FROZEN ❄
        </h1>

        <p className="mb-8 text-cyan-200/80 text-center font-mono text-xs uppercase tracking-widest leading-relaxed">
          A Power Surge has frozen your interface. Input valid decryption sequence to initiate core thaw.
        </p>

        <div className="bg-cyan-950/50 p-6 rounded-xl border border-cyan-400/20 mb-6 shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1)_0%,transparent_100%)] pointer-events-none" />
          <p className="text-lg font-bold text-cyan-100 font-mono tracking-wider text-center relative z-10 selection:bg-cyan-500/30">
            {blockPuzzleQuestion || "Awaiting decryption parameters..."}
          </p>
        </div>

        <input
          type="text"
          className="w-full p-4 rounded-xl bg-cyan-950/80 border border-cyan-400/40 mb-6 text-white text-center text-lg font-mono font-bold tracking-widest placeholder-cyan-800 outline-none focus:border-cyan-300 focus:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all"
          placeholder="ENTER SEQUENCE..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all disabled:opacity-50 disabled:grayscale"
        >
          {loading ? "Verifying..." : "Initialize Thaw"}
        </button>

        <div className="mt-6 text-center text-xs font-mono font-bold uppercase tracking-widest text-cyan-400/60 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
          Time Until Auto-Thaw: <span className="text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]">{timeLeft}S</span>
        </div>
      </div>
    </div>
  );
};

export default AttackOverlay;
