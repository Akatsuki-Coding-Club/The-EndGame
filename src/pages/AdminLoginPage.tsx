import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Terminal, AlertTriangle } from "lucide-react";

const AdminLoginPage = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { adminLogin } = useAuth(); // 
  const navigate = useNavigate(); // [cite: 149]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await adminLogin(adminId, password);
    if (ok) {
      navigate("/admin");
    } else {
      setError("CLEARANCE DENIED: ACCESS ATTEMPT LOGGED");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative font-mono">
      {/* Background S.H.I.E.L.D. Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #ff0000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="w-full max-w-md bg-black border border-red-900 shadow-[0_0_50px_rgba(127,29,29,0.2)] p-8 relative">
        {/* Clearance Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-red-900 pb-6">
          <div className="p-3 bg-red-950/30 border border-red-500/50">
            <ShieldCheck className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-red-500 tracking-tighter">RESTRICTED TERMINAL</h1>
            <p className="text-[10px] text-red-700 uppercase font-bold">Priority Level 7 Authorization</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[10px] text-red-500 uppercase font-bold tracking-widest flex items-center gap-2">
                <Terminal size={12} /> Personnel ID
              </label>
            </div>
            <input
              type="text"
              value={adminId}
              onChange={e => setAdminId(e.target.value)}
              className="w-full bg-red-950/10 border-b border-red-900/50 px-0 py-2 text-red-100 focus:border-red-500 transition-all outline-none placeholder:text-red-900"
              placeholder="DIRECTOR-01"
              required
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[10px] text-red-500 uppercase font-bold tracking-widest flex items-center gap-2">
                <Terminal size={12} /> Encryption Key
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-red-950/10 border-b border-red-900/50 px-0 py-2 text-red-100 focus:border-red-500 transition-all outline-none placeholder:text-red-900"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-950/20 border border-red-500/50 p-3 flex items-center gap-3 text-red-500 text-[10px] font-bold animate-pulse">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            className="group w-full py-3 border border-red-500 text-red-500 font-bold text-xs uppercase tracking-[.4em] hover:bg-red-500 hover:text-black transition-all duration-300 relative overflow-hidden"
          >
            <span className="relative z-10">Access Console</span>
            <div className="absolute inset-0 bg-red-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          </button>
        </form>

        {/* System Footer */}
        <div className="mt-8 pt-4 border-t border-red-900/30 flex justify-between text-[8px] text-red-900 font-bold tracking-widest">
          <span>SRC: STARK-OS-V.8.5</span>
          <span>SYSLOG: ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;