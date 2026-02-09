import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Zap } from "lucide-react";

const LoginPage = () => {
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isAdmin) {
      if (adminLogin(teamId, password)) { navigate("/admin"); return; }
    } else {
      if (login(teamId, password)) { navigate("/dashboard"); return; }
    }
    setError("Invalid credentials. Try again.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="glass-card-glow w-full max-w-md p-8 animate-scale-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Zap className="w-8 h-8 text-primary animate-neon-pulse" />
          </div>
          <h1 className="text-3xl font-display font-bold text-primary neon-text tracking-wider">
            BLIP PROTOCOL
          </h1>
          <p className="text-muted-foreground font-body mt-2 text-sm tracking-wide">
            THE END GAME
          </p>
        </div>

        {/* Toggle admin/team */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsAdmin(false)}
            className={`flex-1 py-2 rounded-md text-sm font-body font-semibold transition-all ${
              !isAdmin ? "bg-primary text-primary-foreground neon-glow-btn" : "bg-muted text-muted-foreground"
            }`}
          >
            Team Login
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`flex-1 py-2 rounded-md text-sm font-body font-semibold transition-all ${
              isAdmin ? "bg-secondary text-secondary-foreground neon-glow-btn" : "bg-muted text-muted-foreground"
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {isAdmin ? "Admin ID" : "Team ID"}
            </label>
            <input
              type="text"
              value={teamId}
              onChange={e => setTeamId(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-md px-4 py-3 text-foreground font-body placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder={isAdmin ? "admin" : "team1"}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-md px-4 py-3 text-foreground font-body placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-destructive text-sm font-body text-center animate-fade-in">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-display font-bold text-sm uppercase tracking-widest neon-glow-btn hover:bg-primary/90 transition-all"
          >
            {isAdmin ? "ACCESS ADMIN" : "ENTER THE GAME"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground font-body mt-6">
          {isAdmin ? "Use admin / admin123" : "Use team1 / password1 (up to team30)"}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
