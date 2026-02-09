import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { useTimer } from "@/context/TimerContext";
import { useAuth } from "@/context/AuthContext";
import LevelMap from "@/components/LevelMap";
import PowerStonesPanel from "@/components/PowerStonesPanel";
import LevelView from "@/components/LevelView";
import GameTimerDisplay from "@/components/GameTimerDisplay";
import BlipOverlay from "@/components/BlipOverlay";
import { Play, LogOut, Menu, X } from "lucide-react";

const Dashboard = () => {
  const { gameStarted, startGame, currentLevel, score, isFrozen } = useGame();
  const { formatted } = useTimer();
  const { team, logout } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Freeze overlay */}
      {isFrozen && <BlipOverlay />}

      {/* Top bar */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-muted-foreground hover:text-primary transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-display font-bold text-primary neon-text text-lg tracking-wider">BLIP PROTOCOL</h1>
        </div>
        <div className="flex items-center gap-4">
          <GameTimerDisplay />
          <div className="hidden sm:flex items-center gap-2 text-sm font-body">
            <span className="text-muted-foreground">{team?.name}</span>
            <span className="text-primary font-semibold">{score} pts</span>
          </div>
          <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex relative">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:sticky top-[57px] left-0 z-30 h-[calc(100vh-57px)] w-72 glass-card border-r border-border/50 overflow-y-auto scrollbar-thin transition-transform duration-300`}>
          <div className="p-4 space-y-6">
            {/* Score & Level */}
            <div className="glass-card p-4 space-y-2">
              <p className="text-xs font-body uppercase tracking-wider text-muted-foreground">Current Level</p>
              <p className="text-3xl font-display font-bold text-primary neon-text">{currentLevel}</p>
              <p className="text-xs font-body uppercase tracking-wider text-muted-foreground mt-3">Score</p>
              <p className="text-2xl font-display font-bold text-accent neon-text-cyan">{score}</p>
            </div>
            <PowerStonesPanel />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 min-h-[calc(100vh-57px)]">
          {!gameStarted ? (
            /* Start screen */
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] animate-fade-in">
              <div className="glass-card-glow p-12 text-center max-w-lg">
                <h2 className="text-4xl font-display font-bold text-primary neon-text mb-4 tracking-wider">
                  READY?
                </h2>
                <p className="text-muted-foreground font-body mb-8">
                  15 levels. 2 hours. Power Stones. Blip events. Only the best survive.
                </p>
                <button
                  onClick={startGame}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-display font-bold text-lg uppercase tracking-widest neon-glow-btn hover:bg-primary/90 transition-all"
                >
                  <Play size={24} />
                  START GAME
                </button>
              </div>
            </div>
          ) : selectedLevel !== null ? (
            <LevelView levelId={selectedLevel} onBack={() => setSelectedLevel(null)} />
          ) : (
            <LevelMap onSelectLevel={setSelectedLevel} />
          )}
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;
