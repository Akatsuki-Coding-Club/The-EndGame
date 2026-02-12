import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, Lock, User } from "lucide-react";

const TeamLoginPage = () => {
  const [teamId, setTeamId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth(); 
  const navigate = useNavigate(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(teamId, password);
    if (ok) {
      navigate("/rules", { replace: true });
    } else {
      setError("ACCESS DENIED: INVALID CREDENTIALS");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e293b] p-4 relative overflow-hidden font-sans">

      <div className="absolute inset-0 z-0 bg-[#272227]">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover opacity-50"
                >
                    <source
                        src="https://motionbgs.com/media/2871/avengers-heroes-united.960x540.mp4"
                        type="video/mp4"
                    />
                </video>
                {/* Subtle gradient to blend video edges and ensure text clarity */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#272227]/60 via-transparent to-[#272227]/80" />
            </div>
      
      {/* Animated Border Container */}
      <div className="relative w-full max-w-md p-[2px] overflow-hidden rounded-xl bg-transparent group">
        {/* The Rotating Animation Layer */}
        <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#EF4444_50%,#E2E8F0_100%)] opacity-10 group-hover:opacity-0 transition-opacity duration-500" />

        {/* The Card Body */}
        <div className="relative z-10 w-full h-full bg-[#26242a]/80 rounded-[10px] p-10">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-red-600 mb-6 bg-red-600/5 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-[0.2em] uppercase mb-2 italic">
              TEAM <span className="text-red-600">LOGIN</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-red-500 uppercase tracking-widest block font-bold ml-1">
                Team Identifier
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="text"
                  value={teamId}
                  onChange={e => setTeamId(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-md py-3 pl-10 pr-4 text-white placeholder:text-white/20 outline-none focus:border-red-600 transition-all text-sm"
                  placeholder="ENTER ID"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-red-500 uppercase tracking-widest block font-bold ml-1">
                Access Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-md py-3 pl-10 pr-4 text-white placeholder:text-white/10 outline-none focus:border-red-600 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold justify-center animate-pulse border border-red-500/20 py-2 rounded bg-red-500/5">
                <ShieldAlert size={14} /> {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-red-600 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-red-700 transition-all duration-300 rounded-md shadow-[0_0_20px_rgba(220,38,38,0.2)] active:scale-95"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamLoginPage;