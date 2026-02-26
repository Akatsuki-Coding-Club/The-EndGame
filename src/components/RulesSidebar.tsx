import React from "react";
import { X, Shield, Zap, Skull, Lock, Target, Activity, ChevronRight, Clock, Globe, Flame, Brain, Eye } from "lucide-react";

interface RulesSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const RULES = [
  { title: "Time Stone", desc: "Leave your current challenge without losing it. You can return later.", icon: <Clock className="text-[#34d399]" size={18} /> },
  { title: "Space Stone", desc: "Use this to go back to challenges you left using the Time Stone.", icon: <Globe className="text-[#60a5fa]" size={18} /> },
  { title: "Power Stone", desc: "Attack another team and freeze their screen to slow them down.", icon: <Flame className="text-[#c084fc]" size={18} /> },
  { title: "Mind Stone", desc: "Get a very helpful hint for the problem you are working on.", icon: <Brain className="text-[#fbbf24]" size={18} /> },
  { title: "Reality Stone", desc: "Skip a problem. Your next answer will automatically be marked correct.", icon: <Eye className="text-[#f87171]" size={18} /> },
  { title: "Soul Stone", desc: "Give up one of your other stones to get a huge amount of points.", icon: <Skull className="text-[#fb923c]" size={18} /> },
];

const RulesSidebar: React.FC<RulesSidebarProps> = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Tab Trigger (Visible when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-0 top-32 z-[55] flex items-center gap-2 px-1.5 py-5 bg-[#0a0a1a]/90 backdrop-blur-md border-y border-r border-cyan-400/50 rounded-r-xl group hover:bg-cyan-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:border-cyan-300"
        >
          <span className="[writing-mode:vertical-lr] rotate-180 text-[12px] font-black uppercase tracking-[0.5em] text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] group-hover:text-cyan-100 group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,1)] transition-all duration-300">
            Rules_Protocol
          </span>
          <ChevronRight size={16} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] group-hover:text-cyan-100 group-hover:translate-x-0.5 transition-all duration-300" />
        </button>
      )}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-[400px] bg-[#05050c]/98 border-r border-cyan-500/20 z-[70] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-[20px_0_80px_rgba(0,0,0,0.8)] ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Top Internal Glow */}
        <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-cyan-500/0 via-cyan-500/40 to-cyan-500/0" />

        <div className="flex flex-col h-full font-sans">
          {/* Header */}
          <div className="p-6 pt-10 border-b border-white/5 flex justify-between items-center bg-black/40">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Engage_Rules</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">S.H.I.E.L.D. Secure File</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Rules List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {RULES.map((rule, idx) => (
              <div key={idx} className="group flex items-start gap-4 p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                <div className="mt-1 p-2 rounded-md bg-black border border-white/5 group-hover:border-cyan-500/30 transition-colors shadow-inner">
                  {rule.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-cyan-400 transition-colors">
                    {rule.title}
                  </h4>
                  <p className="text-[11px] font-semibold leading-relaxed text-slate-400 group-hover:text-slate-200 transition-colors">
                    {rule.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* System Footer */}
          <div className="p-6 bg-black/40 border-t border-white/5 text-center">
            <div className="text-[7px] text-cyan-900 uppercase tracking-[0.5em] animate-pulse">
              Timeline Integrity: 100%
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RulesSidebar;