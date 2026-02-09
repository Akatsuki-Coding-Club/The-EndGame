import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { blipPuzzle } from "@/services/mockData";
import { Snowflake, Send } from "lucide-react";

const BlipOverlay = () => {
  const { solveBlipPuzzle, blipPuzzleSolved } = useGame();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().toUpperCase() === blipPuzzle.answer.toUpperCase()) {
      solveBlipPuzzle();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  if (blipPuzzleSolved) return null;

  return (
    <div className="freeze-overlay">
      <div className="glass-card-glow p-8 max-w-lg w-full mx-4 animate-scale-in text-center">
        <Snowflake className="mx-auto text-accent mb-4 animate-glow-rotate" size={48} />
        <h2 className="font-display font-bold text-2xl text-accent neon-text-cyan mb-2 tracking-wider">
          BLIP PROTOCOL ACTIVE
        </h2>
        <p className="font-body text-muted-foreground mb-6">
          You've been frozen! Solve this puzzle for early release + bonus points.
        </p>

        <div className="glass-card p-4 mb-6 text-left">
          <p className="font-body text-foreground">{blipPuzzle.question}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Your answer..."
            className={`flex-1 bg-muted/50 border rounded-md px-4 py-3 text-foreground font-body placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
              error ? "border-destructive ring-destructive/30" : "border-border focus:ring-accent/50"
            }`}
          />
          <button type="submit" className="px-4 py-3 rounded-md bg-accent text-accent-foreground font-display font-bold neon-glow-btn">
            <Send size={18} />
          </button>
        </form>

        {error && <p className="text-destructive text-sm font-body mt-3 animate-fade-in">Incorrect. Try again!</p>}
      </div>
    </div>
  );
};

export default BlipOverlay;
