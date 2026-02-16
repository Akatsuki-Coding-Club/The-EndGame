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
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center text-white">
      <div className="w-[500px] p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-red-500/30 shadow-2xl">
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          ⚠ SYSTEM LOCKED
        </h1>

        <p className="mb-6 text-gray-300">
          A Power Surge has locked your systems. Solve the unlock protocol to regain control.
        </p>

        <div className="bg-black/40 p-4 rounded-lg mb-4">
          <p className="text-lg font-semibold">
            {blockPuzzleQuestion || "Solve the unlock puzzle"}
          </p>
        </div>

        <input
          type="text"
          className="w-full p-3 rounded-lg bg-black/50 border border-white/20 mb-4 text-white"
          placeholder="Enter answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 transition"
        >
          {loading ? "Verifying..." : "Submit Answer"}
        </button>

        <div className="mt-6 text-center text-sm text-gray-400">
          Time remaining: {timeLeft}s
        </div>
      </div>
    </div>
  );
};

export default AttackOverlay;
