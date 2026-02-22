import React, { useState } from "react";
import { Globe, Shield, Zap, Skull, ChevronRight, Lock, Sparkles, X, RotateCcw, AlertTriangle, Crosshair, Fingerprint } from "lucide-react";
import { TimelineName, enterTimeline, useSpaceStone } from "@/services/api";
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
    color: "#60a5fa", // Blue
    icon: <Globe size={24} />,
    desc: "Navigate the 2012 invasion and retrieve the Tesseract before S.H.I.E.L.D. loses control.",
  },
  morag: {
    label: "Temple of Morag",
    stone: "Power",
    color: "#c084fc", // Purple
    icon: <Zap size={24} />,
    desc: "Infiltrate the abandoned celestial temple. Secure the Orb before the Ravagers arrive.",
  },
  asgard: {
    label: "Palace of Asgard",
    stone: "Reality",
    color: "#f87171", // Red
    icon: <Shield size={24} />,
    desc: "Extraction mission: Locate the Aether during the convergence of the Nine Realms.",
  },
  vormir: {
    label: "Domain of Vormir",
    stone: "Soul",
    color: "#fb923c", // Orange
    icon: <Skull size={24} />,
    desc: "Journey to the center of the universe. Be prepared for the ultimate sacrifice.",
  },
};

/* ─── Space Stone Picker ─── */
interface SpaceStonePickerProps {
  escapedTimelines: string[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

const SpaceStonePicker = ({ escapedTimelines, onSelect, onClose }: SpaceStonePickerProps) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
    <div className="relative w-full max-w-md mx-6 animate-in zoom-in-95 duration-500">
      <div className="absolute -top-px left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
      <div className="bg-slate-950/90 border border-blue-500/20 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.15)]">
        <div className="p-6 border-b border-blue-500/10 flex items-center justify-between bg-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center shadow-[inset_0_0_15px_rgba(59,130,246,0.4)]">
              <Sparkles size={18} className="text-blue-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-mono tracking-[0.4em] text-blue-400 uppercase">Tesseract Protocol</p>
              <h3 className="text-lg font-black uppercase italic text-white tracking-tight">Select Target</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Crosshair size={12} className="text-blue-500" /> Choose escape vector to re-enter
          </p>
          {escapedTimelines.map(id => {
            const meta = TIMELINE_META[id] || { label: id, color: "#60a5fa", icon: <Globe size={16} /> };
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className="w-full flex items-center gap-5 p-4 rounded-xl border border-white/5 hover:border-blue-500/50 bg-white/[0.02] hover:bg-blue-500/[0.1] transition-all duration-300 group text-left relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-3 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_currentColor]" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
                  {React.cloneElement(meta.icon as React.ReactElement, { size: 18 })}
                </div>
                <div className="flex-1 min-w-0 relative z-10">
                  <p className="text-sm font-black uppercase text-white tracking-widest truncate group-hover:text-blue-100 transition-colors">{meta.label}</p>
                  <p className="text-[9px] font-mono mt-1 uppercase tracking-[0.2em]" style={{ color: `${meta.color}80` }}>COORD: QR-{id.toUpperCase()}</p>
                </div>
                <ChevronRight size={18} className="text-white/10 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 relative z-10" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

/* ─── Space Stone Modal ─── */
interface SpaceStoneModalProps {
  timeline: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const SpaceStoneModal = ({ timeline, onConfirm, onCancel, loading }: SpaceStoneModalProps) => {
  const meta = TIMELINE_META[timeline] || { label: timeline, color: "#60a5fa", icon: <Globe size={32} /> };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Immersive Portal Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-60">
        <div className="absolute w-[800px] h-[800px] rounded-full border border-blue-500/10 animate-[spin_15s_linear_infinite]" />
        <div className="absolute w-[600px] h-[600px] rounded-full border-t border-r border-cyan-400/20 animate-[spin_10s_linear_infinite_reverse]" />
        <div className="absolute w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full animate-pulse" />
      </div>

      <div className="relative w-full max-w-lg mx-6 animate-in zoom-in-95 slide-in-from-bottom-8 duration-700">
        <div className="absolute -top-px left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_30px_rgba(34,211,238,1)]" />
        
        <div className="bg-slate-950/80 backdrop-blur-2xl border border-blue-500/20 rounded-3xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
          <div className="relative p-10 pb-8 border-b border-white/5">
            <button onClick={onCancel} disabled={loading} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors disabled:opacity-30">
              <X size={20} />
            </button>

            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-blue-500/20 border border-blue-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <Sparkles size={34} className="text-cyan-300" />
                </div>
                <div className="absolute -inset-2 rounded-3xl border border-cyan-400/30 animate-ping" style={{ animationDuration: "2.5s" }} />
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-[0.5em] text-cyan-400/80 uppercase mb-1">Class-S Artifact</p>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Space Stone</h2>
                <p className="text-[10px] text-blue-300/50 font-mono mt-1 tracking-widest animate-pulse">TESSERACT_PROTOCOL_READY</p>
              </div>
            </div>

            <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <p className="text-[11px] font-mono text-blue-200/90 uppercase tracking-[0.2em] leading-relaxed pl-2">
                Temporal re-entry sequence initiated. The Space Stone will fold reality to return your unit to previously escaped coordinates.
              </p>
            </div>
          </div>

          <div className="p-10 pt-8 space-y-8 bg-black/40">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-cyan-500/50 mb-3 flex items-center gap-2">
                <RotateCcw size={12} /> Target Coordinates Locked
              </p>
              <div className="flex items-center gap-5 p-5 rounded-2xl border" style={{ borderColor: `${meta.color}40`, backgroundColor: `${meta.color}10` }}>
                <div className="p-4 rounded-xl" style={{ backgroundColor: `${meta.color}20`, color: meta.color, boxShadow: `0 0 20px ${meta.color}40` }}>
                  {React.cloneElement(meta.icon as React.ReactElement, { size: 24 })}
                </div>
                <div>
                  <p className="text-lg font-black uppercase text-white tracking-widest">{meta.label}</p>
                  <p className="text-[10px] font-mono mt-1 tracking-[0.2em]" style={{ color: `${meta.color}90` }}>
                    QR-{timeline.toUpperCase()} // OVERRIDE
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-red-950/30 border border-red-500/30">
              <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0 animate-pulse" />
              <p className="text-[10px] font-mono text-red-400/80 leading-relaxed uppercase tracking-widest">
                WARNING: The Space Stone will be consumed upon activation. This action is irreversible during the current phase.
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={onCancel} disabled={loading} className="w-1/3 py-4 text-xs font-black uppercase tracking-[0.3em] text-white/30 border border-white/10 rounded-xl hover:border-white/30 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30">
                Abort
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-4 text-xs font-black uppercase tracking-[0.4em] text-white rounded-xl transition-all relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #3b82f6)", boxShadow: loading ? "none" : "0 0 30px rgba(14,165,233,0.4)" }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Warping...
                    </>
                  ) : (
                    <>
                      <Globe size={16} className="group-hover:animate-spin" style={{ animationDuration: '3s' }} />
                      Execute Jump
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const TimelinePortal = ({ data, onRefresh }: PortalProps) => {
  const navigate = useNavigate();
  const { me, timelines = [] } = data; 

  const [spaceStoneTarget, setSpaceStoneTarget] = useState<string | null>(null);
  const [spaceStoneLoading, setSpaceStoneLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const hasSpaceStone = Array.isArray(me?.stones) && me.stones.includes("space");
  
  const completedTimelines = Array.isArray(me?.completedTimelines) ? me.completedTimelines : [];
  const escapedTimelines = Array.isArray(me?.escapedTimelines) ? me.escapedTimelines : [];
  
  const eligibleEscapedTimelines = escapedTimelines.filter((id: string) => !completedTimelines.includes(id));

  const handleSpaceStoneButtonClick = () => {
    if (!hasSpaceStone) return;
    if (eligibleEscapedTimelines.length === 0) {
      toast.error("NO_ELIGIBLE_TIMELINES", { description: "Escape a timeline first to use the Space Stone for re-entry." });
      return;
    }
    if (eligibleEscapedTimelines.length === 1) {
      setSpaceStoneTarget(eligibleEscapedTimelines[0]);
      return;
    }
    setShowPicker(true);
  };

  const handlePickerSelect = (id: string) => {
    setShowPicker(false);
    setSpaceStoneTarget(id);
  };

  const handleCardClick = (id: string) => {
    const isDone = completedTimelines.includes(id);
    if (isDone) return;

    const isEscaped = escapedTimelines.includes(id);

    if (isEscaped && hasSpaceStone) {
      setSpaceStoneTarget(id);
      return;
    }

    handleJump(id as TimelineName);
  };

  const handleJump = async (id: TimelineName) => {
    const jumpToast = toast.loading("Calculating Quantum Coordinates...");
    try {
      await enterTimeline(id);
      toast.success(`WARP SUCCESSFUL: Destination ${id.toUpperCase()}`, { id: jumpToast });
      onRefresh();
      navigate(`/mission/${id}`);
    } catch (e: any) {
      toast.error(e.message || "Warp Drive Failure: Coordinates Invalid", { id: jumpToast });
    }
  };

  const handleSpaceStoneConfirm = async () => {
    if (!spaceStoneTarget) return;
    setSpaceStoneLoading(true);
    const jumpToast = toast.loading("Initiating Tesseract Protocol...");
    try {
      await useSpaceStone(spaceStoneTarget);
      toast.success(`SPACE_STONE_ACTIVATED: Re-entering ${spaceStoneTarget.toUpperCase()}`, {
        id: jumpToast,
        description: "Quantum warp coordinates recalculated.",
      });
      setSpaceStoneTarget(null);
      onRefresh();
      navigate(`/mission/${spaceStoneTarget}`);
    } catch (e: any) {
      toast.error(e.message || "Tesseract Protocol Failed", {
        id: jumpToast,
        description: "Space Stone energy depleted or cooldown active.",
      });
    } finally {
      setSpaceStoneLoading(false);
    }
  };

  const displayTimelines = timelines.length > 0 ? timelines : Object.keys(TIMELINE_META);

  return (
    <>
      {showPicker && !spaceStoneTarget && (
        <SpaceStonePicker escapedTimelines={eligibleEscapedTimelines} onSelect={handlePickerSelect} onClose={() => setShowPicker(false)} />
      )}

      {spaceStoneTarget && (
        <SpaceStoneModal timeline={spaceStoneTarget} onConfirm={handleSpaceStoneConfirm} onCancel={() => !spaceStoneLoading && setSpaceStoneTarget(null)} loading={spaceStoneLoading} />
      )}

      <div className="p-8 md:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header Section */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 gap-6">
          <div className="space-y-2 relative">
            {/* Ambient Title Glow */}
            <div className="absolute -inset-4 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Quantum <span className="text-cyan-400">Portal</span>
            </h2>
            <p className="text-[10px] md:text-xs text-cyan-500/80 uppercase tracking-[0.5em] font-mono flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Nexus Interface // Select Coordinate
            </p>
          </div>

          <div className="flex items-center gap-6">
            {hasSpaceStone && (
              <button
                onClick={handleSpaceStoneButtonClick}
                className="flex items-center gap-3 px-5 py-3 rounded-xl border border-blue-400/40 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:bg-blue-500/20 hover:border-blue-300/80 hover:shadow-[0_0_35px_rgba(59,130,246,0.4)] transition-all active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Sparkles size={16} className="text-blue-300 animate-pulse group-hover:animate-none relative z-10" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 group-hover:text-white transition-colors relative z-10">
                  Space Stone Ready
                </span>
                {eligibleEscapedTimelines.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-[10px] font-black text-white flex items-center justify-center relative z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                    {eligibleEscapedTimelines.length}
                  </span>
                )}
              </button>
            )}
            <div className="hidden md:flex gap-1.5 opacity-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`w-1.5 h-8 rounded-full ${i % 2 === 0 ? 'bg-cyan-500/40 animate-pulse' : 'bg-white/20'}`} style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          </div>
        </div>

        {hasSpaceStone && eligibleEscapedTimelines.length > 0 && (
          <div className="mb-10 flex items-center gap-4 px-6 py-5 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-transparent relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]" />
            <Sparkles size={20} className="text-blue-400 shrink-0 animate-pulse" />
            <p className="text-[11px] font-mono text-blue-200/80 uppercase tracking-widest leading-relaxed">
              <strong className="text-blue-300 font-black">Tesseract Available:</strong> Timelines marked with <RotateCcw size={10} className="inline mx-1 mb-0.5" /> can be re-entered. Click to engage.
            </p>
          </div>
        )}

        {/* Timelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayTimelines.map((id: string) => {
            const meta = TIMELINE_META[id] || { label: id, stone: "Unknown", color: "#fff", icon: <Lock />, desc: "Classified info." };
            
            const isDone = completedTimelines.includes(id);
            const isActive = me?.currentTimeline === id;
            const isEscaped = escapedTimelines.includes(id);
            const canUseSpaceStone = isEscaped && hasSpaceStone && !isDone;

            return (
              <div
                key={id}
                className={`group relative p-8 backdrop-blur-xl border rounded-3xl transition-all duration-700 overflow-hidden ${
                  isDone
                    ? "border-green-500/20 bg-green-950/10 cursor-not-allowed opacity-80"
                    : canUseSpaceStone
                      ? "border-blue-500/30 bg-blue-950/20 hover:border-blue-400/80 cursor-pointer hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)]"
                      : "border-white/10 bg-white/[0.02] hover:border-cyan-500/50 hover:bg-cyan-950/30 cursor-pointer hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(34,211,238,0.1)]"
                }`}
                onClick={() => handleCardClick(id)}
              >
                {/* Cinematic Background Glow on Hover */}
                {!isDone && (
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-screen"
                    style={{ background: `radial-gradient(circle at 80% 20%, ${meta.color}20, transparent 60%)` }}
                  />
                )}

                {/* Background Giant Icon */}
                <div className="absolute -right-8 -top-8 opacity-[0.02] rotate-12 group-hover:-rotate-12 group-hover:scale-125 transition-all duration-1000 pointer-events-none text-white mix-blend-overlay">
                  {React.cloneElement(meta.icon as React.ReactElement, { size: 220 })}
                </div>

                <div className="flex justify-between items-start mb-12 relative z-10">
                  <div
                    className="p-5 rounded-2xl transition-all duration-500 group-hover:shadow-[0_0_25px_-5px_currentColor] border border-white/5"
                    style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                  >
                    {React.cloneElement(meta.icon as React.ReactElement, { size: 28 })}
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                       {isEscaped && !hasSpaceStone && !isDone && (
                        <span className="text-[9px] font-black uppercase px-3 py-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-400 tracking-[0.2em] shadow-[0_0_15px_rgba(249,115,22,0.15)] backdrop-blur-md">
                          Escaped
                        </span>
                      )}
                      
                      <span
                        className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border tracking-[0.25em] shadow-xl backdrop-blur-md ${
                          isDone ? "border-green-500/50 bg-green-500/10 text-green-400" : "border-white/10 bg-black/40 text-white/50 group-hover:border-white/20 group-hover:text-white/80 transition-colors"
                        }`}
                      >
                        {isDone ? "Secured" : `${meta.stone} Stone`}
                      </span>
                    </div>

                    {canUseSpaceStone && (
                      <span className="text-[9px] font-black uppercase px-3 py-1.5 rounded-full border border-blue-400/50 bg-blue-500/20 text-blue-200 tracking-[0.2em] flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-md">
                        <Sparkles size={10} className="animate-pulse" />
                        Space Stone Route
                      </span>
                    )}

                    <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-mono mt-1 opacity-70">
                      QR-{id.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 
                    className="text-3xl font-black uppercase tracking-tight text-white mb-4 transition-colors duration-300"
                    style={{ textShadow: `0 2px 10px rgba(0,0,0,0.5)` }}
                  >
                    {meta.label}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed font-medium max-w-[90%] group-hover:text-white/60 transition-colors">
                    {meta.desc}
                  </p>
                </div>

                {/* Footer Action Area */}
                <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                  {isDone ? (
                    <div className="flex items-center gap-3 text-green-500/70 text-[11px] font-black uppercase tracking-[0.2em]">
                      <Shield size={16} /> Timeline Stabilized
                    </div>
                  ) : canUseSpaceStone ? (
                    <div className="flex items-center gap-3 text-blue-400 text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-blue-300 group-hover:translate-x-2 transition-all">
                      <Sparkles size={16} className="animate-pulse" /> Engage Tesseract <ChevronRight size={18} className="opacity-50" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-cyan-600 text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-cyan-400 group-hover:translate-x-2 transition-all">
                      <Fingerprint size={16} className="opacity-70 group-hover:opacity-100 group-hover:animate-pulse" /> 
                      {isActive ? "Return to Mission" : "Initiate Warp Jump"} 
                      <ChevronRight size={18} className="opacity-50" />
                    </div>
                  )}
                </div>

                {/* HUD Corner Accents */}
                <div className={`absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 rounded-tr-3xl transition-colors duration-500 pointer-events-none ${
                    isDone ? "border-green-500/10" : canUseSpaceStone ? "border-blue-500/20 group-hover:border-blue-400/80" : "border-white/5 group-hover:border-cyan-400/50"
                  }`}
                />
                <div className={`absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 rounded-bl-3xl transition-colors duration-500 pointer-events-none ${
                    isDone ? "border-green-500/10" : canUseSpaceStone ? "border-blue-500/20 group-hover:border-blue-400/80" : "border-white/5 group-hover:border-cyan-400/50"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default TimelinePortal;