import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, Zap, Lock } from "lucide-react";

const TeamLoginPage = () => {
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth(); 
  const navigate = useNavigate(); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(teamId, password)) { // [cite: 209, 212]
      navigate("/rules"); // [cite: 152]
    } else {
      setError("ACCESS DENIED: INVALID CREDENTIALS");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden font-display">
      {/* Cinematic Background Pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-red-900/20 to-transparent pointer-events-none" />
      
      <div className="glass-card-glow w-full max-w-md p-10 border-t-2 border-primary/50 relative overflow-hidden animate-scale-in">
        <div className="scanner-line" />
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/5 border border-primary/20 mb-6 shadow-[0_0_30px_rgba(255,0,0,0.1)]">
            <Zap className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-primary tracking-[0.2em] uppercase neon-text mb-2">
            PROTOCOL: REDLINE
          </h1>
          <p className="text-muted-foreground font-body text-xs tracking-widest uppercase">
            Final Phase — System Authorization Required
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block font-bold">
              Team Identifier
            </label>
            <input
              type="text"
              value={teamId}
              onChange={e => setTeamId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-3 text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
              placeholder="TEAM-00"
              required
            />
          </div>

          <div className="relative group">
            <label className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 block font-bold">
              Authorization Key
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-none px-4 py-3 text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-primary text-[10px] font-bold justify-center animate-bounce">
              <ShieldAlert size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-primary/10 border border-primary text-primary font-bold text-xs uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all duration-500 shadow-[0_0_15px_rgba(255,0,0,0.2)]"
          >
            Initiate Sequence
          </button>
        </form>

        <div className="mt-8 flex justify-between items-center opacity-30">
          <div className="h-[1px] bg-primary/50 flex-1" />
          <Lock className="mx-4 text-primary" size={14} />
          <div className="h-[1px] bg-primary/50 flex-1" />
        </div>
      </div>
    </div>
  );
};

export default TeamLoginPage;