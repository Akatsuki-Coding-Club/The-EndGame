import { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import * as api from "@/services/api";
import { toast } from "sonner";
import { ShieldAlert, Terminal, Zap, Loader2, Clock, ShieldX, Cpu } from "lucide-react";

const AttackOverlay = () => {
  const { isBlocked, stones, blockPuzzleQuestion, setIsBlocked } = useGame();

  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  const blockedUntil = stones.blockedUntil;

  // ⏱ Countdown logic
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
      toast.error("DECRYPTION ERROR: No sequence provided.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.submitBlockUnlock(answer);

      if (res.success) {
        toast.success("SYSTEMS_THAWED: Access restored.");
        setIsBlocked?.(false);
        setAnswer("");
      }
    } catch (err: any) {
      toast.error("DECRYPTION FAILED: Invalid sequence signature.");
      setAnswer("");
    } finally {
      setLoading(false);
    }
  };

  if (!isBlocked) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-[#020617]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-cyan-50 overflow-hidden">
      {/* Background Cinematic Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent animate-scan" />
      </div>

      <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-500">
        {/* Top Header Section */}
        <div className="text-center mb-8 relative">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full scale-110 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative bg-black/40 border border-cyan-500/30 w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                <ShieldX size={48} className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-[0.3em] uppercase mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-cyan-400 animate-pulse">
            Power Surge
          </h1>
          <div className="flex items-center justify-center gap-3">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-500/50" />
            <p className="text-[10px] font-mono tracking-[0.5em] text-cyan-400/80 uppercase">Warning: System Compromised</p>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-500/50" />
          </div>
        </div>

        {/* Decryption Puzzle Box */}
        <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="absolute inset-0 bg-cyan-500/[0.02] pointer-events-none" />

          <div className="flex items-center gap-2 mb-4">
            <Terminal size={12} className="text-cyan-500/50" />
            <span className="text-[8px] font-mono tracking-[0.4em] text-white/30 uppercase">Neural Decryption Puzzle</span>
          </div>

          <p className="text-xl font-bold text-center text-white/90 selection:bg-cyan-500/40 font-mono tracking-tight leading-relaxed">
            {blockPuzzleQuestion || "CALIBRATING_PARAMETERS..."}
          </p>
        </div>

        {/* Input Controls */}
        <div className="space-y-4">
          <div className="relative group">
            <input
              type="text"
              autoFocus
              className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 px-6 text-white text-center text-xl font-mono tracking-[0.2em] outline-none focus:border-cyan-500/50 focus:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all placeholder:text-white/10"
              placeholder="_ _ _ _ _ _"
              value={answer}
              onChange={(e) => setAnswer(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <div className="absolute inset-0 rounded-2xl border border-cyan-500/0 group-focus-within:border-cyan-500/20 pointer-events-none transition-all" />
          </div>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="w-full relative group overflow-hidden py-5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <div className="absolute inset-0 bg-cyan-500 animate-pulse" />
            <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10 flex items-center justify-center gap-4 text-white font-black uppercase tracking-[0.3em] text-sm">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Verifying Sequence</span>
                </>
              ) : (
                <>
                  <Zap size={18} className="group-hover:animate-bounce" />
                  <span>Execute Thaw</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Footer HUD */}
        <div className="mt-10 flex items-center justify-between px-2 opacity-50">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1 h-3 bg-cyan-500/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <span className="text-[8px] font-mono tracking-[0.3em] uppercase text-cyan-400">Node: Lockdown_Active</span>
          </div>

          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <Clock size={12} className="text-cyan-500" />
            <span className="text-[10px] font-mono font-black text-cyan-400">{timeLeft}S</span>
            <span className="text-[8px] font-mono uppercase tracking-widest text-white/20">Until Auto_Override</span>
          </div>
        </div>
      </div>

      {/* Side Decorative HUD elements */}
      <div className="fixed top-0 left-0 w-32 h-full pointer-events-none border-r border-white/5 opacity-20">
        <div className="absolute top-1/2 -rotate-90 text-[8px] font-mono tracking-[2em] uppercase text-white/40 whitespace-nowrap">EXT_PROC_INTERFERENCE</div>
      </div>
      <div className="fixed top-0 right-0 w-32 h-full pointer-events-none border-l border-white/5 opacity-20">
        <div className="absolute top-1/2 rotate-90 text-[8px] font-mono tracking-[2em] uppercase text-white/40 whitespace-nowrap">CORE_THERMAL_BLOCK</div>
      </div>
    </div>
  );
};

export default AttackOverlay;
