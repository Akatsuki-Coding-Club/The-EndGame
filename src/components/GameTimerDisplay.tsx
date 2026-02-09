import React from "react";
import { useTimer } from "@/context/TimerContext";
import { Clock } from "lucide-react";
import { useGame } from "@/context/GameContext";

const GameTimerDisplay = () => {
  const { formatted, remainingSeconds, isRunning } = useTimer();
  const { gameStarted } = useGame();

  if (!gameStarted) return null;

  const isLow = remainingSeconds < 20 * 60; // last 20 minutes

  return (
    <div className={`flex items-center gap-2 font-display font-bold text-sm tracking-wider ${
      isLow ? "text-destructive animate-neon-pulse" : "text-primary"
    }`}>
      <Clock size={16} />
      <span>{formatted}</span>
      {isLow && <span className="text-xs text-destructive">(FINAL)</span>}
    </div>
  );
};

export default GameTimerDisplay;
