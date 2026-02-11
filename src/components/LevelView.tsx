import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { ArrowLeft, Send, Lightbulb, CheckCircle } from "lucide-react";

interface Props {
  levelId: number;
  onBack: () => void;
}

const LevelView = ({ levelId, onBack }: Props) => {
  const { puzzles, submitAnswer, completedLevels } = useGame();
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const puzzle = puzzles.find((p) => p.id === levelId);
  const isCompleted = completedLevels.includes(levelId);

  if (!puzzle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted) return;
    const correct = await submitAnswer(levelId, answer);
    setFeedback(correct ? "correct" : "incorrect");
    if (correct) {
      setTimeout(() => onBack(), 1500);
    } else {
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-body">
        <ArrowLeft size={18} /> Back to Level Map
      </button>

      <div className="glass-card-glow p-6 lg:p-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-display uppercase tracking-widest text-muted-foreground">Level {puzzle.id}</span>
          <span className="text-xs font-body text-accent">{puzzle.points} pts</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-primary neon-text mb-2 tracking-wider">{puzzle.title}</h2>
        <p className="text-sm font-body text-muted-foreground mb-6">{puzzle.description}</p>

        <div className="glass-card p-5 mb-6">
          <p className="font-body text-foreground text-lg leading-relaxed">{puzzle.question}</p>
        </div>

        {isCompleted ? (
          <div className="flex items-center gap-3 text-accent font-display font-bold text-lg animate-scale-in">
            <CheckCircle size={24} /> COMPLETED
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className={`w-full bg-muted/50 border rounded-md px-4 py-3 text-foreground font-body placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
                  feedback === "correct"
                    ? "border-accent ring-accent/30"
                    : feedback === "incorrect"
                    ? "border-destructive ring-destructive/30"
                    : "border-border focus:ring-primary/50 focus:border-primary/50"
                }`}
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-display font-bold text-sm uppercase tracking-widest neon-glow-btn hover:bg-primary/90 transition-all"
              >
                <Send size={16} /> SUBMIT
              </button>
              {puzzle.hint && (
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-2 px-4 py-3 rounded-md bg-muted text-muted-foreground hover:text-foreground font-body text-sm transition-colors"
                >
                  <Lightbulb size={16} /> Hint
                </button>
              )}
            </div>

            {showHint && puzzle.hint && (
              <p className="text-sm font-body text-secondary animate-fade-in italic">💡 {puzzle.hint}</p>
            )}

            {feedback === "incorrect" && (
              <p className="text-destructive font-body text-sm animate-fade-in">❌ Incorrect. Try again!</p>
            )}
            {feedback === "correct" && (
              <p className="text-accent font-body text-sm animate-fade-in">✅ Correct! Well done!</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default LevelView;
