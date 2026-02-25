import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Scan, Fingerprint, Activity, Lock, Globe, Zap, Database, ChevronRight } from "lucide-react";

const AdminLoginPage = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  // HUD Scan Animation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulated Authentication Protocol
    await new Promise(r => setTimeout(r, 1200));

    const ok = await adminLogin(adminId, password);
    if (ok) {
      navigate("/admin/dashboard");
    } else {
      setError("UNAUTHORIZED ACCESS DETECTED");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-cyan-500 font-sans overflow-hidden relative selection:bg-cyan-500/30 selection:text-white">

      {/* ════════════ BACKGROUND LAYERS ════════════ */}

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_60%)] pointer-events-none" />

      {/* Rotating HUD Rings (Background) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-100 pointer-events-none">
        <div className="absolute inset-0 border border-cyan-500/50 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute inset-[10%] border border-cyan-500/30 rounded-full border-dashed animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute inset-[30%] border-[2px] border-t-transparent border-r-cyan-500/60 border-b-transparent border-l-cyan-500/60 rounded-full animate-[spin_20s_linear_infinite]" />
      </div>

      {/* ════════════ HUD INTERFACE ELEMENTS ════════════ */}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
        <div className="flex items-center gap-4">
          <img src="/akatsukilogo.png" alt="Akatsuki Logo" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
          <div className="flex flex-col">
            <h1 className="text-xl  tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] uppercase">
              AKATSUKI CODING CLUB
            </h1>
            <div className="flex items-center gap-2 text-[10px] mt-1 text-cyan-400">
              <Globe size={12} className="animate-pulse" />
              <span>SECURE SERVER: ACTIVE</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs  tracking-widest text-cyan-300 mb-1">SYSTEM STATUS</div>
          <div className="flex items-center justify-end gap-2 text-[10px] text-green-400">
            <Activity size={12} />
            <span>OPTIMAL</span>
          </div>
        </div>
      </div>

      {/* Corner Data Blocks */}
      <div className="absolute bottom-10 left-10 text-[8px] text-cyan-800 space-y-1  tracking-widest pointer-events-none hidden md:block">
        <div>MEMORY: 64TB / 128TB</div>
        <div>CPU: 12% LOAD</div>
        <div>NET: 10GBPS (ENCRYPTED)</div>
      </div>

      <div className="absolute bottom-10 right-10 text-[8px] text-cyan-800 space-y-1  tracking-widest pointer-events-none text-right hidden md:block">
        <div>LAT: 40.7128° N</div>
        <div>LNG: 74.0060° W</div>
        <div>ALT: 350M</div>
      </div>

      {/* ════════════ CENTER LOGIN MODULE ════════════ */}

      <div className="relative z-20 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-[480px] perspective-1000">
          <div className="relative bg-black/60 backdrop-blur-md border-x border-cyan-500/30 p-1">

            {/* Scanning Line */}
            <div
              className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_cyan] pointer-events-none opacity-50 z-30"
              style={{ top: `${scanLine}%`, transition: 'top 0.1s linear' }}
            />

            {/* Top Decoration */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-1" />

            <div className="p-10 relative overflow-hidden group">

              {/* Inner Corners */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-500" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />

              {/* Header */}
              <div className="text-center mb-10 relative">
                <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-spin-slow" />
                  <div className="absolute inset-1 border border-cyan-400/50 rounded-full border-dashed animate-reverse-spin" />
                  <div className="absolute inset-0 rounded-full bg-cyan-500/5 animate-pulse" />
                  <Fingerprint size={48} className={`text-cyan-400 ${loading ? "animate-pulse" : ""}`} />
                </div>

                <h2 className="text-xl  tracking-[0.3em] text-white mb-2">
                  J.A.R.V.I.S
                </h2>
                <p className="text-[9px] uppercase tracking-[0.4em] text-cyan-600">
                  Authentication Protocol V.9
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-cyan-600 flex items-center justify-between">
                    <span>Operative ID</span>
                    <span className="text-[8px] text-cyan-800">REQ-ALPHA-1</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-4 w-[2px] bg-cyan-700 group-focus-within:bg-cyan-400 transition-colors" />
                    <input
                      type="text"
                      value={adminId}
                      onChange={e => setAdminId(e.target.value)}
                      className="w-full bg-cyan-950/10 border-b border-cyan-900/50 py-3 px-4 text-sm text-cyan-100 placeholder-cyan-900/30 focus:border-cyan-400/80 focus:bg-cyan-900/10 outline-none transition-all "
                      placeholder="ENTER ID..."
                    />
                    <div className="absolute right-0 bottom-0 w-2 h-2 border-b border-r border-cyan-700/50 group-focus-within:border-cyan-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-cyan-600 flex items-center justify-between">
                    <span>Passcode</span>
                    <Lock size={10} />
                  </label>
                  <div className="relative group">
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-4 w-[2px] bg-cyan-700 group-focus-within:bg-cyan-400 transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-cyan-950/10 border-b border-cyan-900/50 py-3 px-4 text-sm text-cyan-100 placeholder-cyan-900/30 focus:border-cyan-400/80 focus:bg-cyan-900/10 outline-none transition-all "
                      placeholder="••••••••"
                    />
                    <div className="absolute right-0 bottom-0 w-2 h-2 border-b border-r border-cyan-700/50 group-focus-within:border-cyan-400" />
                  </div>
                </div>

                {/* Error Display */}
                <div className="h-10 flex items-center justify-center">
                  {error ? (
                    <div className="w-full bg-red-950/20 border-l-2 border-red-500 p-2 flex items-center gap-3 animate-shake">
                      <Zap size={14} className="text-red-500" />
                      <span className="text-[10px] text-red-400  uppercase tracking-wider">{error}</span>
                    </div>
                  ) : (
                    <div className="flex gap-1 opacity-30">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-10 h-1 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative overflow-hidden bg-cyan-900/20 border border-cyan-500/30 text-cyan-400 py-4 transition-all hover:bg-cyan-500 hover:text-black mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="w-full h-full bg-cyan-400 blur-xl opacity-20" />
                  </div>

                  <span className="relative z-10 flex items-center justify-center gap-3  text-xs uppercase tracking-[0.3em]">
                    {loading ? "VERIFYING IDENTITY..." : (
                      <>
                        <Scan size={16} /> INITIATE ACCESS
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>

            {/* Bottom Decoration */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-1" />

            <div className="flex justify-between px-4 py-2 bg-cyan-950/30 text-[8px] text-cyan-600 uppercase tracking-widest ">
              <span>ENCRYPTION: QUANTUM-256</span>
              <span>BIOMETRICS: ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
