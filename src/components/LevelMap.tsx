import React from "react";
import { useGame } from "@/context/GameContext";
import { Lock, CheckCircle, ChevronRight } from "lucide-react";

interface Props {
  onSelectLevel: (level: number) => void;
}

const LevelMap = ({ onSelectLevel }: Props) => {
  const { puzzles, currentLevel, completedLevels } = useGame();

  return (
    <div className="animate-fade-in">
      <h2 className="font-display font-bold text-2xl text-primary neon-text mb-6 tracking-wider">LEVEL MAP</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {puzzles.map(puzzle => {
          const isCompleted = completedLevels.includes(puzzle.id);
          const isUnlocked = puzzle.id <= currentLevel;
          const isCurrent = puzzle.id === currentLevel;

          return (
            <button
              key={puzzle.id}
              onClick={() => isUnlocked && onSelectLevel(puzzle.id)}
              disabled={!isUnlocked}
              className={`glass-card p-5 text-left transition-all duration-300 group ${
                isCompleted
                  ? "border-accent/40 hover:border-accent/60"
                  : isCurrent
                  ? "glass-card-glow border-primary/50 hover:border-primary"
                  : isUnlocked
                  ? "hover:border-primary/30"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">
                  Level {puzzle.id}
                </span>
                {isCompleted ? (
                  <CheckCircle className="text-accent" size={18} />
                ) : !isUnlocked ? (
                  <Lock className="text-muted-foreground" size={18} />
                ) : (
                  <ChevronRight className="text-primary group-hover:translate-x-1 transition-transform" size={18} />
                )}
              </div>
              <h3 className={`font-display font-bold text-lg mb-1 ${
                isCompleted ? "text-accent" : isCurrent ? "text-primary" : "text-foreground"
              }`}>
                {puzzle.title}
              </h3>
              <p className="text-xs font-body text-muted-foreground">{puzzle.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-body text-muted-foreground">{puzzle.points} pts</span>
                {isCurrent && !isCompleted && (
                  <span className="text-xs font-display text-primary animate-neon-pulse uppercase tracking-wider">Current</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LevelMap;
