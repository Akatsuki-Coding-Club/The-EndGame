import React, { useState } from "react";
import { Globe, Shield, Zap, Skull, ChevronRight, Lock, Sparkles, X, RotateCcw, AlertTriangle } from "lucide-react";
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
    color: "#60a5fa",
    icon: <Globe size={24} />,
    desc: "Navigate the 2012 invasion and retrieve the Tesseract before S.H.I.E.L.D. loses control.",
  },
  morag: {
    label: "Temple of Morag",
    stone: "Power",
    color: "#c084fc",
    icon: <Zap size={24} />,
    desc: "Infiltrate the abandoned celestial temple. Secure the Orb before the Ravagers arrive.",
  },
  asgard: {
    label: "Palace of Asgard",
    stone: "Reality",
    color: "#f87171",
    icon: <Shield size={24} />,
    desc: "Extraction mission: Locate the Aether during the convergence of the Nine Realms.",
  },
  vormir: {
    label: "Domain of Vormir",
    stone: "Soul",
    color: "#fb923c",
    icon: <Skull size={24} />,
    desc: "Journey to the center of the universe. Be prepared for the ultimate sacrifice.",
  },
};

/* ─── Space Stone Picker — choose which escaped timeline to re-enter ─── */
interface SpaceStonePickerProps {
  escapedTimelines: string[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

const SpaceStonePicker = ({ escapedTimelines, onSelect, onClose }: SpaceStonePickerProps) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
    <div className="relative w-full max-w-sm mx-6 animate-in zoom-in-95 duration-400">
      <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
      <div className="bg-[#05050c] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(96,165,250,0.1)]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Sparkles size={14} className="text-blue-400" />
            </div>
            <div>
              <p className="text-[8px] font-mono tracking-[0.3em] text-blue-400/60 uppercase">Tesseract Protocol</p>
              <h3 className="text-sm font-black uppercase text-white tracking-tight">Select Destination</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/60 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-3 px-2">Choose timeline to re-enter via Space Stone</p>
          {escapedTimelines.map(id => {
            const meta = TIMELINE_META[id] || { label: id, color: "#60a5fa", icon: <Globe size={16} /> };
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-blue-400/50 bg-white/[0.02] hover:bg-blue-500/[0.08] transition-all group text-left"
              >
                <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
                  {React.cloneElement(meta.icon as React.ReactElement, { size: 16 })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase text-white tracking-tight truncate">{meta.label}</p>
                  <p className="text-[8px] font-mono mt-0.5 uppercase tracking-wider" style={{ color: `${meta.color}70` }}>COORD: QR-{id.toUpperCase()}-001</p>
                </div>
                <ChevronRight size={14} className="text-white/20 group-hover:text-blue-400 transition-colors shrink-0" />
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
    /* Full-screen backdrop — blocks all other interaction */
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Animated background energy rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-blue-500/10 animate-[spin_20s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-cyan-500/15 animate-[spin_15s_linear_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-blue-400/20 animate-[spin_8s_linear_infinite]" />
      </div>

      {/* Modal panel */}
      <div className="relative w-full max-w-md mx-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        {/* Glowing top accent */}
        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-blue-500/20 blur-2xl rounded-full" />

        <div className="bg-[#05050c] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(96,165,250,0.15)]">
          {/* Header */}
          <div className="relative p-8 pb-6 border-b border-white/5">
            <button
              onClick={onCancel}
              disabled={loading}
              className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors disabled:opacity-30"
            >
              <X size={16} />
            </button>

            {/* Space Stone icon + pulse */}
            <div className="flex items-center gap-5 mb-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(96,165,250,0.2)]">
                  <Sparkles size={28} className="text-blue-400" />
                </div>
                <div className="absolute -inset-1 rounded-3xl border border-blue-400/20 animate-ping" style={{ animationDuration: "2s" }} />
              </div>
              <div>
                <p className="text-[9px] font-mono tracking-[0.4em] text-blue-400/70 uppercase mb-1">Infinity Stone · Class-S</p>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">Space Stone</h2>
                <p className="text-[9px] text-white/30 font-mono mt-1 tracking-wider">TESSERACT_PROTOCOL_ENGAGED</p>
              </div>
            </div>

            <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-xl p-4">
              <p className="text-[10px] font-mono text-blue-300/80 uppercase tracking-[0.2em] leading-relaxed">
                Temporal re-entry detected. Your Space Stone will allow you to warp back into an escaped timeline.
              </p>
            </div>
          </div>

          {/* Target Timeline */}
          <div className="p-8 pt-6 space-y-6">
            <div>
              <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-white/30 mb-3">Target Coordinates</p>
              <div
                className="flex items-center gap-4 p-4 rounded-xl border"
                style={{ borderColor: `${meta.color}30`, backgroundColor: `${meta.color}08` }}
              >
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                >
                  {React.cloneElement(meta.icon as React.ReactElement, { size: 20 })}
                </div>
                <div>
                  <p className="text-sm font-black uppercase text-white tracking-tight">{meta.label}</p>
                  <p className="text-[9px] font-mono mt-0.5" style={{ color: `${meta.color}80` }}>
                    COORD: QR-{timeline.toUpperCase()}-001 // RE-ENTRY
                  </p>
                </div>
                <div className="ml-auto">
                  <RotateCcw size={16} style={{ color: meta.color }} className="opacity-60" />
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/[0.05] border border-yellow-500/20">
              <AlertTriangle size={14} className="text-yellow-500/70 mt-0.5 shrink-0" />
              <p className="text-[9px] font-mono text-yellow-400/60 leading-relaxed uppercase tracking-wider">
                The Space Stone will be consumed. You can only use this stone once per cooldown window.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 border border-white/10 rounded-xl hover:border-white/20 hover:text-white/60 transition-all disabled:opacity-30"
              >
                Abort
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-white rounded-xl transition-all relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                  boxShadow: loading ? "none" : "0 0 20px rgba(59,130,246,0.4)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                    Warping...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={12} />
                    Activate Stone
                  </span>
                )}
                {!loading && (
                  <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom glow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-blue-500/20 blur-2xl rounded-full" />
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const TimelinePortal = ({ data, onRefresh }: PortalProps) => {
  const navigate = useNavigate();
  const { me, timelines } = data;

  const [spaceStoneTarget, setSpaceStoneTarget] = useState<string | null>(null);
  const [spaceStoneLoading, setSpaceStoneLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Check if team has the Space Stone
  const hasSpaceStone = Array.isArray(me?.stones) && me.stones.includes("space");
  // Timelines the team has escaped and NOT completed (eligible for Space Stone re-entry)
  const escapedTimelines: string[] = (Array.isArray(me?.escapedTimelines) ? me.escapedTimelines : []).filter(
    (id: string) => !((me?.completedTimelines ?? []).includes(id))
  );

  // Handler for "Space Stone Ready" button click
  const handleSpaceStoneButtonClick = () => {
    if (!hasSpaceStone) return;
    if (escapedTimelines.length === 0) {
      toast.error("NO_ELIGIBLE_TIMELINES", { description: "Escape a timeline first to use the Space Stone for re-entry." });
      return;
    }
    if (escapedTimelines.length === 1) {
      // Only one option — go straight to confirmation modal
      setSpaceStoneTarget(escapedTimelines[0]);
      return;
    }
    // Multiple options — show picker
    setShowPicker(true);
  };

  const handlePickerSelect = (id: string) => {
    setShowPicker(false);
    setSpaceStoneTarget(id);
  };

  const handleCardClick = (id: string) => {
    const isDone = me.completedTimelines.includes(id);
    if (isDone) return;

    const isEscaped = escapedTimelines.includes(id);

    // If team escaped this timeline AND owns the Space Stone → show Space Stone modal
    if (isEscaped && hasSpaceStone) {
      setSpaceStoneTarget(id);
      return;
    }

    // Normal warp jump
    handleJump(id as TimelineName);
  };

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

  return (
    <>
      {/* Space Stone Timeline Picker */}
      {showPicker && !spaceStoneTarget && (
        <SpaceStonePicker
          escapedTimelines={escapedTimelines}
          onSelect={handlePickerSelect}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Space Stone Confirmation Modal — rendered above everything, locks all interaction */}
      {spaceStoneTarget && (
        <SpaceStoneModal
          timeline={spaceStoneTarget}
          onConfirm={handleSpaceStoneConfirm}
          onCancel={() => !spaceStoneLoading && setSpaceStoneTarget(null)}
          loading={spaceStoneLoading}
        />
      )}

      <div className="p-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="mb-12 flex items-end justify-between border-b border-white/5 pb-8">
          <div className="space-y-1">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Quantum Portal Interface
            </h2>
            <p className="text-[10px] text-cyan-500 uppercase tracking-[0.4em] font-mono">
              Neural_Link_Active // Select_Destination_Coordinates
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Space Stone — clickable button */}
            {hasSpaceStone && (
              <button
                onClick={handleSpaceStoneButtonClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/40 bg-blue-500/10 shadow-[0_0_15px_rgba(96,165,250,0.15)] hover:bg-blue-500/20 hover:border-blue-400/70 hover:shadow-[0_0_25px_rgba(96,165,250,0.3)] transition-all active:scale-95 cursor-pointer group"
              >
                <Sparkles size={12} className="text-blue-400 animate-pulse group-hover:animate-none" />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-300 group-hover:text-blue-200 transition-colors">
                  Space Stone Ready
                </span>
                {escapedTimelines.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-[8px] font-black text-white flex items-center justify-center">
                    {escapedTimelines.length}
                  </span>
                )}
              </button>
            )}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-1.5 h-6 bg-cyan-500/20 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Space Stone hint banner */}
        {hasSpaceStone && escapedTimelines.length > 0 && (
          <div className="mb-8 flex items-center gap-3 px-6 py-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.05]">
            <Sparkles size={16} className="text-blue-400 shrink-0" />
            <p className="text-[10px] font-mono text-blue-300/70 uppercase tracking-wider leading-relaxed">
              You possess the <span className="text-blue-400 font-black">Space Stone</span>.
              Timelines marked with a warp indicator can be re-entered — click them to activate Tesseract Protocol.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {timelines.map((id: string) => {
            const meta = TIMELINE_META[id] || {
              label: id,
              stone: "Unknown",
              color: "#fff",
              icon: <Lock />,
              desc: "Classified info.",
            };
            const isDone = me.completedTimelines.includes(id);
            const isActive = me.currentTimeline === id;
            const isEscaped = escapedTimelines.includes(id);
            const canUseSpaceStone = isEscaped && hasSpaceStone && !isDone;

            return (
              <div
                key={id}
                className={`group relative p-8 border rounded-2xl transition-all duration-500 overflow-hidden ${isDone
                  ? "border-green-500/30 bg-green-500/5 cursor-default"
                  : canUseSpaceStone
                    ? "border-blue-500/40 bg-blue-500/[0.04] hover:border-blue-400/70 hover:bg-blue-500/[0.08] cursor-pointer shadow-[0_0_20px_rgba(96,165,250,0.08)] hover:shadow-[0_0_30px_rgba(96,165,250,0.2)]"
                    : "border-white/10 bg-white/[0.02] hover:border-cyan-500/50 hover:bg-cyan-500/[0.04] cursor-pointer"
                  }`}
                onClick={() => handleCardClick(id)}
              >
                {/* Background HUD Decor */}
                <div className="absolute -right-6 -top-6 opacity-[0.03] rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                  {React.cloneElement(meta.icon as React.ReactElement, { size: 180 })}
                </div>

                {/* Space Stone warp shimmer for eligible timelines */}
                {canUseSpaceStone && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
                )}

                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div
                    className="p-4 rounded-2xl transition-all duration-500 group-hover:shadow-[0_0_20px_-5px_currentColor]"
                    style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                  >
                    {meta.icon}
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span
                      className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border tracking-[0.2em] bg-black/60 shadow-xl ${isDone
                        ? "border-green-500/40 text-green-400"
                        : "border-white/10 text-white/40"
                        }`}
                    >
                      {isDone ? "Secured" : `${meta.stone} Stone`}
                    </span>

                    {/* Space Stone re-entry badge */}
                    {canUseSpaceStone && (
                      <span className="text-[8px] font-black uppercase px-3 py-1 rounded-full border border-blue-400/40 bg-blue-500/15 text-blue-300 tracking-[0.2em] flex items-center gap-1.5 shadow-[0_0_10px_rgba(96,165,250,0.2)]">
                        <Sparkles size={8} className="animate-pulse" />
                        Space Stone
                      </span>
                    )}

                    {/* Escaped badge */}
                    {isEscaped && !hasSpaceStone && !isDone && (
                      <span className="text-[8px] font-black uppercase px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400/70 tracking-[0.2em]">
                        Escaped
                      </span>
                    )}

                    <p className="text-[8px] text-white/10 uppercase tracking-tighter font-mono">
                      COORD: QR-{id.toUpperCase()}-001
                    </p>
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-black uppercase text-white mb-3 tracking-tight group-hover:text-cyan-400 transition-colors">
                    {meta.label}
                  </h3>
                  <p className="text-xs text-white/30 leading-relaxed max-w-[85%] font-medium">{meta.desc}</p>
                </div>

                <div className="mt-10 flex items-center justify-between relative z-10">
                  {isDone ? (
                    <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-[0.2em]">
                      <Shield size={14} className="animate-pulse" /> Timeline Stabilized
                    </div>
                  ) : canUseSpaceStone ? (
                    <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                      <Sparkles size={14} className="animate-pulse" /> Tesseract Re-Entry <ChevronRight size={16} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-cyan-500 text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                      {isActive ? "Return to Mission" : "Initiate Warp Jump"} <ChevronRight size={16} />
                    </div>
                  )}
                </div>

                {/* HUD Frame Corner Decorations */}
                <div
                  className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-2xl transition-colors ${canUseSpaceStone
                    ? "border-blue-500/20 group-hover:border-blue-400/60"
                    : "border-white/5 group-hover:border-cyan-500/40"
                    }`}
                />
                <div
                  className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-2xl transition-colors ${canUseSpaceStone
                    ? "border-blue-500/20 group-hover:border-blue-400/60"
                    : "border-white/5 group-hover:border-cyan-500/40"
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