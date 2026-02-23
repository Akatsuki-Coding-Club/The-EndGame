import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { useGame } from "./GameContext";

interface TimerState {
  totalSeconds: number; // counts up from 0
  remainingSeconds: number; // counts down from 7200
  isRunning: boolean;
  formatted: string;
  minutesElapsed: number;
}

const TimerContext = createContext<TimerState | null>(null);

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const { gameStarted, gameDuration, gameEndTime } = useGame();
  const [remainingSeconds, setRemainingSeconds] = useState(gameDuration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (gameStarted && gameEndTime) {
      const updateTimer = () => {
        const diff = Math.max(0, Math.floor((gameEndTime - Date.now()) / 1000));
        setRemainingSeconds(diff);
        if (diff <= 0 && intervalRef.current) clearInterval(intervalRef.current);
      };

      updateTimer(); // Initial sync
      intervalRef.current = setInterval(updateTimer, 1000);
    } else {
      setRemainingSeconds(gameStarted ? gameDuration : gameDuration);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [gameStarted, gameEndTime, gameDuration]);

  const totalSeconds = Math.max(0, gameDuration - remainingSeconds);
  const minutesElapsed = Math.floor(totalSeconds / 60);

  return (
    <TimerContext.Provider value={{
      totalSeconds,
      remainingSeconds,
      isRunning: gameStarted && remainingSeconds > 0,
      formatted: formatTime(remainingSeconds),
      minutesElapsed,
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
};
