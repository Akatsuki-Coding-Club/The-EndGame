import { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import * as api from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Zap, Lock, RefreshCcw } from "lucide-react";

const AttackOverlay = () => {
  const { isBlocked, stones, blockPuzzleQuestion, setIsBlocked, showToast } = useGame();

  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const blockedUntil = stones.blockedUntil;

  // ⏱ Countdown logic
  useEffect(() => {
    if (!isBlocked || !blockedUntil) return;

    const interval = setInterval(() => {
      const remaining = blockedUntil - Date.now();
      if (remaining <= 0) {
        setIsBlocked?.(false);
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlocked, blockedUntil]);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      showToast("Please enter an answer", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await api.submitBlockUnlock(answer);

      if (res.success) {
        showToast("Access Restored", "success");
        setIsBlocked?.(false);
        setAnswer("");
      }
    } catch (err: any) {
      // Wrong answer - show error but keep overlay visible
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
      showToast("DECRYPTION_FAILED", "error", "Incompatible sequence detected. Rearming security protocol.");
      setAnswer("");
    } finally {
      setLoading(false);
    }
  };

  if (!isBlocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          backgroundColor: isError ? "rgba(127, 29, 29, 0.98)" : "rgba(5, 5, 16, 0.95)"
        }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 backdrop-blur-xl transition-colors duration-200"
      />

      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Top Left Decoration */}
        <motion.svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          className="absolute -top-10 -left-10 text-white/20"
          initial={{ scale: 0, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <path
            d="M0 0 L400 0 M400 0 L0 400 M0 0 L0 400 M50 0 L0 50 M100 0 L0 100 M150 0 L0 150 M200 0 L0 200 M250 0 L0 250 M300 0 L0 300 M350 0 L0 350"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          {[50, 100, 150, 200, 250, 300, 350].map((r, i) => (
            <path
              key={i}
              d={`M ${r} 0 Q ${r * 0.7} ${r * 0.7} 0 ${r}`}
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
          ))}
        </motion.svg>

        {/* Bottom Right Decoration */}
        <motion.svg
          width="500"
          height="500"
          viewBox="0 0 500 500"
          className="absolute -bottom-20 -right-20 text-white/15 rotate-180"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        >
          {[0, 30, 60, 90].map((angle, i) => (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={500 * Math.cos((angle * Math.PI) / 180)}
              y2={500 * Math.sin((angle * Math.PI) / 180)}
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
          {[100, 200, 300, 400, 500].map((r, i) => (
            <circle
              key={i}
              cx="0"
              cy="0"
              r={r}
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              strokeDasharray="10 5"
            />
          ))}
        </motion.svg>

        {/* Dynamic Accents appearing on Block */}
        <motion.div
          className="absolute inset-0"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.3
              }
            }
          }}
        >
          {[...Array(6)].map((_, i) => (
            <DecorationSVG key={i} index={i} />
          ))}
        </motion.div>
      </div>

      {/* Main HUD Card - Increased width to max-w-lg */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
          x: isError ? [0, -10, 10, -10, 10, 0] : 0,
          borderColor: isError ? "rgba(239, 68, 68, 0.8)" : "rgba(239, 68, 68, 0.2)"
        }}
        transition={{
          x: { duration: 0.4, ease: "easeInOut" },
          borderColor: { duration: 0.2 }
        }}
        className="relative w-full max-w-lg z-10 px-4"
      >
        <div className={`bg-[#0a0a14]/90 backdrop-blur-xl rounded-2xl border transition-all duration-200 ${isError ? 'border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.4)]' : 'border-red-500/20 shadow-[0_0_40px_rgba(220,38,38,0.1)]'} overflow-hidden`}>
          {/* HUD Top Bar */}
          <div className="bg-red-600/10 border-b border-red-500/20 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">System_Lock.protocol</span>
            </div>
            <ShieldAlert size={14} className="text-red-500" />
          </div>

          <div className="px-6 py-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 relative">
                <Lock size={20} className="text-red-500" />
                <div className="absolute inset-0 bg-red-500/10 blur-lg rounded-full animate-pulse" />
              </div>

              <h1 className="text-xl font-black text-white uppercase tracking-tighter mb-1">
                System <span className="text-red-500">Locked</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight opacity-70">
                A Strategic Block Has Been Initiated.
              </p>
            </div>

            {/* Question Display */}
            <div className="relative mb-6">
              <div className="relative bg-black/60 border border-white/10 rounded-xl p-5 backdrop-blur-sm max-h-48 overflow-y-auto">
                <div className="flex items-center gap-2 mb-3 shrink-0">
                  {/* <Zap size={10} className="text-red-500 fill-current" /> */}
                  {/* <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Security Protocol</span> */}
                </div>
                <p className="text-sm font-bold text-white tracking-wide text-center selection:bg-red-500/30">
                  {blockPuzzleQuestion || "ANALYZING_SECURITY_PATTERN..."}
                </p>
              </div>
            </div>

            {/* Input Area */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-center text-white font-bold tracking-[0.2em] placeholder:text-slate-800 outline-none focus:border-red-500/50 transition-all text-sm"
                  placeholder="SOLVE PATTERN"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              <button
                disabled={loading}
                onClick={handleSubmit}
                className="w-full h-12 bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-95 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <RefreshCcw size={14} className="animate-spin" />
                ) : (
                  <>
                    Unlock Access
                    <Zap size={14} className="group-hover:fill-current" />
                  </>
                )}
              </button>
            </div>

            {/* Timer HUD */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] text-slate-500 font-bold tracking-[0.2em] uppercase">
                  Time Remaining
                </span>
                <div className="h-9 w-28 bg-red-950/20 border border-red-500/20 rounded-full flex items-center justify-center relative shadow-inner">
                  <span className="text-base font-black text-red-500 tracking-[0.1em]">
                    {timeLeft}s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* HUD Bottom Accents */}
          <div className="h-1 bg-gradient-to-r from-red-600/0 via-red-600/50 to-red-600/0" />
        </div>
      </motion.div>
    </div>
  );
};

/* Helper Component for Animated Background Elements */
const DecorationSVG = ({ index }: { index: number }) => {
  const positions = [
    { top: '10%', left: '5%' },
    { top: '5%', right: '10%' },
    { bottom: '15%', left: '8%' },
    { bottom: '10%', right: '5%' },
    { top: '50%', left: '-5%', rotate: 90 },
    { top: '40%', right: '-5%', rotate: -90 },
  ];
  const pos = positions[index % positions.length];

  return (
    <motion.svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      style={{
        position: 'absolute',
        ...pos,
        color: index % 2 === 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(37, 99, 235, 0.2)'
      }}
      variants={{
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1.2, opacity: 1 }
      }}
      transition={{ type: 'spring', damping: 12, stiffness: 100 }}
    >
      <circle cx="0" cy="0" r="10" fill="currentColor" />
      {[0, 20, 40, 60, 80].map((angle) => (
        <line
          key={angle}
          x1="0"
          y1="0"
          x2={200 * Math.cos((angle * Math.PI) / 180)}
          y2={200 * Math.sin((angle * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="0.5"
        />
      ))}
      {[40, 80, 120, 160, 200].map((r) => (
        <path
          key={r}
          d={`M ${r} 0 A ${r} ${r} 0 0 1 ${r * Math.cos(Math.PI / 2)} ${r * Math.sin(Math.PI / 2)}`}
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
      ))}
    </motion.svg>
  );
}

export default AttackOverlay;