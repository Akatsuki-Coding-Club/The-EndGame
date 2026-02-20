import React from "react";
import { Globe, Shield, Zap, Skull, ChevronRight, Lock } from "lucide-react";
import { TimelineName, enterTimeline } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PortalProps {
  data: any;
  onRefresh: () => void;
}

const TIMELINE_META: Record<string, any> = {
  newyork: { 
    label: "Battle of New York", 
    stone: "Space", 
    color: "#60a5fa", 
    icon: <Globe size={24}/>, 
    desc: "Navigate the 2012 invasion and retrieve the Tesseract before S.H.I.E.L.D. loses control." 
  },
  morag: { 
    label: "Temple of Morag", 
    stone: "Power", 
    color: "#c084fc", 
    icon: <Zap size={24}/>, 
    desc: "Infiltrate the abandoned celestial temple. Secure the Orb before the Ravagers arrive." 
  },
  asgard: { 
    label: "Palace of Asgard", 
    stone: "Reality", 
    color: "#f87171", 
    icon: <Shield size={24}/>, 
    desc: "Extraction mission: Locate the Aether during the convergence of the Nine Realms." 
  },
  vormir: { 
    label: "Domain of Vormir", 
    stone: "Soul", 
    color: "#fb923c", 
    icon: <Skull size={24}/>, 
    desc: "Journey to the center of the universe. Be prepared for the ultimate sacrifice." 
  },
};

const TimelinePortal = ({ data, onRefresh }: PortalProps) => {
  const navigate = useNavigate();
  const { me, timelines } = data;

  const handleJump = async (id: TimelineName) => {
    const jumpToast = toast.loading("Calculating Quantum Warp Coordinates...");
    try {
      await enterTimeline(id);
      toast.success(`WARP SUCCESSFUL: Destination ${id.toUpperCase()}`, { id: jumpToast });
      onRefresh(); 
      navigate(`/mission/${id}`);
    } catch (e: any) {
      toast.error(e.message || "Warp Drive Failure: Coordinates Invalid", { id: jumpToast });
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="mb-12 flex items-end justify-between border-b border-white/5 pb-8">
        <div className="space-y-1">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Quantum Portal Interface
          </h2>
          <p className="text-[10px] text-cyan-500 uppercase tracking-[0.4em] font-mono"> Neural_Link_Active // Select_Destination_Coordinates</p>
        </div>
        <div className="flex gap-1">
           {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-6 bg-cyan-500/20 rounded-full" />)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {timelines.map((id: string) => {
          const meta = TIMELINE_META[id] || { label: id, stone: 'Unknown', color: '#fff', icon: <Lock/>, desc: 'Classified info.' };
          const isDone = me.completedTimelines.includes(id);
          const isActive = me.currentTimeline === id;

          return (
            <div 
              key={id} 
              className={`group relative p-8 border rounded-2xl transition-all duration-500 overflow-hidden ${
                isDone 
                  ? 'border-green-500/30 bg-green-500/5 cursor-default' 
                  : 'border-white/10 bg-white/[0.02] hover:border-cyan-500/50 hover:bg-cyan-500/[0.04] cursor-pointer'
              }`}
              onClick={() => !isDone && handleJump(id as TimelineName)}
            >
              {/* Background HUD Decor */}
              <div className="absolute -right-6 -top-6 opacity-[0.03] rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                {React.cloneElement(meta.icon as React.ReactElement, { size: 180 })}
              </div>

              <div className="flex justify-between items-start mb-10 relative z-10">
                <div 
                  className="p-4 rounded-2xl transition-all duration-500 group-hover:shadow-[0_0_20px_-5px_currentColor]" 
                  style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                >
                  {meta.icon}
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border tracking-[0.2em] bg-black/60 shadow-xl ${isDone ? 'border-green-500/40 text-green-400' : 'border-white/10 text-white/40'}`}>
                    {isDone ? "Secured" : `${meta.stone} Stone`}
                  </span>
                  <p className="text-[8px] text-white/10 uppercase tracking-tighter mt-3 font-mono">COORD: QR-{id.toUpperCase()}-001</p>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase text-white mb-3 tracking-tight group-hover:text-cyan-400 transition-colors">
                  {meta.label}
                </h3>
                <p className="text-xs text-white/30 leading-relaxed max-w-[85%] font-medium">
                  {meta.desc}
                </p>
              </div>
              
              <div className="mt-10 flex items-center justify-between relative z-10">
                {isDone ? (
                  <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Shield size={14} className="animate-pulse"/> Timeline Stabilized
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-cyan-500 text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                    {isActive ? "Return to Mission" : "Initiate Warp Jump"} <ChevronRight size={16}/>
                  </div>
                )}
              </div>

              {/* HUD Frame Corner Decorations */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/5 rounded-tr-2xl group-hover:border-cyan-500/40 transition-colors" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/5 rounded-bl-2xl group-hover:border-cyan-500/40 transition-colors" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelinePortal;