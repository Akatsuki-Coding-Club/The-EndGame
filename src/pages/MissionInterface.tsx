import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCurrentQuestion,
  submitAnswer,
  getStoneStatus,
  getAllTeams,
  useTimeStone,
  useMindStone,
  usePowerStone,
  useRealityStone,
  useSoulStone,
  StoneStatus
} from "@/services/api";
import { toast } from "sonner";
import {
  Terminal, Loader2, Target, Zap, Clock, Brain, Box, Flame, Eye, Skull, ChevronUp, ChevronDown, AlertTriangle
} from "lucide-react";

const MissionInterface = () => {
  const { timelineId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [answer, setAnswer] = useState("");

  // Stone State
  const [stoneStatus, setStoneStatus] = useState<StoneStatus | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [showStonePanel, setShowStonePanel] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [realityActive, setRealityActive] = useState(false);

  // Power/Soul Selection State
  const [targetTeam, setTargetTeam] = useState("");
  const [sacrificeStone, setSacrificeStone] = useState("");
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showSoulModal, setShowSoulModal] = useState(false);

  // Confirmation State
  const [confirmStone, setConfirmStone] = useState<string | null>(null);
  const [acquiredStone, setAcquiredStone] = useState<string | null>(null);

  // Cooldown Timer State
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Fetch Logic
  const fetchProgress = async () => {
    try {
      const res = await getCurrentQuestion();
      if (res.completed) {
        toast.success("MISSION_COMPLETE: Timeline Stabilized");
        navigate("/dashboard");
        return;
      }
      setCurrentTask(res);
    } catch (e) {
      toast.error("Signal lost. Reconnecting to timeline...");
    }
  };

  const fetchStones = async () => {
    try {
      const status = await getStoneStatus();
      setStoneStatus(status);
    } catch (e) {
      console.error("Failed to fetch stone status");
    }
  };

  const fetchTeams = async () => {
    try {
      const allTeams = await getAllTeams();
      setTeams(allTeams);
    } catch (e) {
      console.error("Failed to fetch teams");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProgress(), fetchStones(), fetchTeams()]);
      setLoading(false);
    };
    init();
  }, [timelineId]);

  // Timer Effect
  useEffect(() => {
    if (!stoneStatus?.cooldownUntil) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(stoneStatus.cooldownUntil!);
      const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));

      setTimeLeft(diff);

      if (diff <= 0) {
        clearInterval(interval);
        // Optionally refresher to clear state properly or just rely on local 0
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stoneStatus]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !currentTask?.question?._id) return;

    try {
      setSubmitting(true);
      const res = await submitAnswer(currentTask.question._id, answer);

      if (res.isCorrect) {
        toast.success(`KEY_ACCEPTED: +${res.points} Strategic Points`);
        setAnswer("");
        setRealityActive(false); // Reset reality effect if it was active

        if (res.earnedStone) {
          setAcquiredStone(res.earnedStone);
          // Do not navigate yet, wait for user to click button on stone screen
        } else if (res.completed) {
          navigate("/dashboard");
        } else {
          await fetchProgress();
        }
      } else {
        toast.error("KEY_REJECTED: Unauthorized decryption code");
        setAnswer("");
      }
    } catch (e) {
      toast.error("Transmission interruption detected.");
    } finally {
      setSubmitting(false);
    }
  };

  // Execution Handlers (Called after confirmation)
  const executeTime = async () => {
    try {
      await useTimeStone();
      toast.success("TIME STONE ACTIVATED: Temporal Shift Initiated");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Failed to activate Time Stone");
    }
  };

  const executeMind = async () => {
    try {
      const res = await useMindStone();
      setActiveHint(res.hint);
      toast.success("MIND STONE ACTIVE: Neural Pathway Illuminated");
      fetchStones(); // Refresh cooldown
    } catch (e: any) {
      toast.error(e.message || "Mind Stone activation failed");
    }
  };

  const executePower = async () => {
    if (!targetTeam) return;
    try {
      await usePowerStone(targetTeam);
      toast.success("POWER STONE ACTIVE: Orbital Strike Launched");
      setShowPowerModal(false);
      setTargetTeam("");
      fetchStones();
    } catch (e: any) {
      toast.error(e.message || "Power Stone activation failed");
    }
  };

  const executeReality = async () => {
    try {
      await useRealityStone();
      setRealityActive(true);
      toast.success("REALITY STONE ACTIVE: Physics Engine Rewritten");
      fetchStones();
    } catch (e: any) {
      toast.error(e.message || "Reality Stone activation failed");
    }
  };

  const executeSoul = async () => {
    if (!sacrificeStone) return;
    try {
      await useSoulStone(sacrificeStone);
      toast.success("SOUL STONE ACTIVE: Equivalent Exchange Complete");
      setShowSoulModal(false);
      setSacrificeStone("");
      fetchStones();
    } catch (e: any) {
      toast.error(e.message || "Soul Stone activation failed");
    }
  };

  const handleConfirmAction = () => {
    if (!confirmStone) return;

    // For Power and Soul, confirmation just moves to the selection modal
    if (confirmStone === 'power') {
      setShowPowerModal(true);
      setConfirmStone(null);
      return;
    }
    if (confirmStone === 'soul') {
      setShowSoulModal(true);
      setConfirmStone(null);
      return;
    }

    // For others, execute directly
    if (confirmStone === 'time') executeTime();
    if (confirmStone === 'mind') executeMind();
    if (confirmStone === 'reality') executeReality();

    setConfirmStone(null);
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center font-mono text-cyan-500">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p className="tracking-[0.4em] text-[10px]">DECRYPTING_OBJECTIVES...</p>
    </div>
  );

  const activeMission = currentTask?.question;
  const isCooldown = timeLeft > 0;

  // Helper for Stone Check
  const hasStone = (stone: string) => {
    if (!stoneStatus) return false;
    return (stoneStatus.stoneType && stoneStatus.stoneType[stone] > 0) || (stone === 'time' || stone === 'mind');
  }

  const getStoneColor = (stone: string) => {
    const map: any = { time: "green", mind: "yellow", space: "blue", power: "purple", reality: "red", soul: "orange" };
    return map[stone] || "gray";
  }

  const bgClasses: any = {
    green: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]",
    yellow: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]",
    blue: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]",
    purple: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]",
    red: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]",
    orange: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
  };

  const stoneDescriptions: any = {
    time: "Instantly escape this timeline. Progress is saved but the timeline will be LOCKED until re-entered with Space Stone.",
    mind: "Decrypts a substantial hint for the current objective.",
    space: "Dimensional portal access (Inactive in timeline).",
    power: "Launch an orbital strike on a rival team to impede their progress.",
    reality: "Rewrite the laws of physics. Your next answer will be accepted as correct, regardless of validity.",
    soul: "Sacrifice one of your earned stones to gain a massive point boost."
  };

  const StoneButton = ({ icon: Icon, label, color, stoneKey, onClick, desc, disabledOverride }: any) => {
    const active = hasStone(stoneKey);
    const locked = isCooldown || disabledOverride;

    const colorClasses: any = {
      green: "text-green-500 shadow-green-500/50",
      yellow: "text-yellow-400 shadow-yellow-400/50",
      blue: "text-blue-500 shadow-blue-500/50",
      purple: "text-purple-500 shadow-purple-500/50",
      red: "text-red-500 shadow-red-500/50",
      orange: "text-orange-500 shadow-orange-500/50"
    };

    return (
      <button
        onClick={(active && !locked) ? onClick : undefined}
        className={`relative group flex flex-col items-center justify-center gap-2 p-3 lg:p-4 rounded-xl border transition-all duration-300 w-20 lg:w-28
          ${active
            ? locked
              ? "bg-black/40 border-white/5 opacity-50 cursor-not-allowed grayscale"
              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:-translate-y-1 cursor-pointer"
            : "bg-transparent border-transparent opacity-20 cursor-not-allowed grayscale"
          }
        `}
      >
        <div className={`p-3 rounded-full bg-black/80 border border-white/5 shadow-lg ${active ? colorClasses[color] : "text-white"}`}>
          <Icon size={24} />
        </div>
        <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-white/80">{label}</span>

        {/* Cooldown Overlay */}
        {active && isCooldown && !disabledOverride && (
          <div className="absolute top-1 right-1 flex items-center gap-1 bg-black/60 px-1 rounded">
            <Clock size={8} className="text-red-500 animate-pulse" />
            <span className="text-[8px] font-mono text-red-500">{formatTime(timeLeft)}</span>
          </div>
        )}

        {/* Tooltip */}
        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-3 py-2 rounded text-[10px] uppercase tracking-widest whitespace-nowrap pointer-events-none z-50">
          {active ? (locked ? "Unavailable / Cooldown" : desc) : "Not Acquired"}
        </div>
      </button>
    )
  }

  return (
    <div className={`h-screen bg-[#05050c] flex flex-col font-mono text-slate-300 overflow-hidden transition-all duration-1000 ${realityActive ? "hue-rotate-90 saturate-200 contrast-125 box-border border-[20px] border-red-500/10" : ""}`}>
      {/* Header */}
      <header className="px-8 py-4 border-b border-white/10 bg-black/60 flex justify-between items-center shrink-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Terminal size={20} className="text-cyan-500" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-white">Neural Interface // {timelineId?.toUpperCase()}</h2>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div className="flex gap-1.5">
            {/* Stones Indicator (Mini) */}
            {stoneStatus && ["time", "mind", "space", "power", "reality", "soul"].map(stone => {
              const color = getStoneColor(stone);
              return (
                <div key={stone} className={`w-1.5 h-1.5 rounded-full transition-all ${hasStone(stone) ? bgClasses[color] : "bg-white/5"}`} />
              )
            })}
          </div>
          <div>
            <span className="text-[8px] text-white/40 block uppercase tracking-widest">Stability Status</span>
            <span className="text-sm font-bold text-cyan-400">
              Progress: {currentTask?.answeredCount !== undefined ? currentTask.answeredCount + 1 : 0} / {currentTask?.totalQuestions || "?"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 lg:p-8 overflow-hidden max-w-6xl mx-auto w-full relative z-0 pb-20">
        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-sm shadow-2xl">
          {/* Question Header */}
          <div className="p-4 border-b border-white/5 flex justify-between bg-black/20">
            <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
              <Zap size={12} /> {activeMission?.difficulty || "UNKNOWN"} // Objective_{currentTask?.answeredCount !== undefined ? currentTask.answeredCount + 1 : 1}
            </span>
            <span className="text-[10px] text-white/40 uppercase animate-pulse">
              Priority: <span className="text-cyan-400">{activeMission?.points || 0} PTS</span>
            </span>
          </div>

          {/* Question Body */}
          <div className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar relative">
            <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-white mb-8 border-l-4 border-cyan-500 pl-6 animate-in slide-in-from-left-4 duration-500">
              {activeMission?.title || "Classified Intel"}
            </h3>

            <div className="bg-black/60 border border-white/10 p-8 rounded-xl relative shadow-2xl group hover:border-cyan-500/30 transition-colors">
              <p className="text-lg lg:text-xl leading-relaxed text-cyan-100/90 whitespace-pre-wrap">
                {activeMission?.question}
              </p>
              <div className="absolute top-2 right-4 text-[7px] text-white/10 uppercase tracking-widest group-hover:text-cyan-500/50 transition-colors">S.H.I.E.L.D. Secure Intel</div>

              {/* Hint Display */}
              {activeHint && (
                <div className="mt-6 pt-4 border-t border-yellow-500/20 animate-in fade-in zoom-in duration-300">
                  <p className="text-yellow-400/80 text-sm font-mono flex items-start gap-2">
                    <Brain size={14} className="mt-1 shrink-0" />
                    <span className="uppercase tracking-widest text-[10px] text-yellow-500/50 mr-2">Hint Decrypted:</span>
                    {activeHint}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-8 bg-black/80 border-t border-white/10 relative z-10">
            <form onSubmit={handleSubmit} className="flex gap-4 max-w-4xl mx-auto">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={realityActive ? "REALITY REWRITE ACTIVE..." : "Enter Access Key..."}
                  className={`w-full bg-black border ${realityActive ? "border-red-500/50 text-red-100 placeholder:text-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]" : "border-white/20 text-white placeholder:text-white/10"} rounded-lg px-6 py-5 focus:border-cyan-500/50 outline-none font-mono transition-all`}
                  autoFocus
                />
                <Target className={`absolute right-4 top-1/2 -translate-y-1/2 ${realityActive ? "text-red-500/50" : "text-white/5"} group-focus-within:text-cyan-500/50 transition-colors`} size={20} />
              </div>
              <button
                type="submit"
                disabled={submitting || !answer.trim()}
                className={`px-10 ${realityActive ? "bg-red-600 hover:bg-red-500 shadow-red-500/20" : "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20"} disabled:opacity-20 text-black font-black uppercase text-xs tracking-widest rounded-lg transition-all shadow-lg active:scale-95`}
              >
                {submitting ? <Loader2 className="animate-spin" /> : "Execute"}
              </button>
            </form>
          </div>
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
      </main>

      {/* INFINITY STONES PANEL */}
      <div
        className={`fixed left-0 right-0 border-t border-white/10 backdrop-blur-xl transition-all duration-500 z-50 ease-in-out
          ${showStonePanel ? "bottom-0 bg-black/95 py-6 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]" : "-bottom-24 hover:-bottom-22 bg-black/80 py-2"}
        `}
      >

        {/* Toggle Handle */}
        <div
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-6 bg-[#05050c] border-t border-x border-white/10 rounded-t-xl flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]"
          onClick={() => setShowStonePanel(!showStonePanel)}
        >
          <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-cyan-500/60 group-hover:text-cyan-400">
            {showStonePanel ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            {showStonePanel ? "Close Gauntlet" : "Access Infinity Stones"}
          </div>
        </div>

        {/* Stones Grid */}
        <div className={`max-w-6xl mx-auto px-8 flex justify-center gap-3 lg:gap-6 items-center transition-all duration-300 ${showStonePanel ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          {isCooldown ? (
            <div className="flex flex-col items-center justify-center py-2 animate-in fade-in zoom-in duration-500">
              <div className="flex items-center gap-4 text-red-500 mb-2">
                <AlertTriangle size={24} className="animate-pulse" />
                <span className="text-xl font-black tracking-[0.2em] uppercase">System Overload</span>
                <AlertTriangle size={24} className="animate-pulse" />
              </div>
              <div className="text-4xl lg:text-6xl font-mono font-bold text-white tabular-nums tracking-widest bg-black/50 px-8 py-2 rounded-xl border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                {formatTime(timeLeft)}
              </div>
              <span className="text-[10px] text-white/40 uppercase tracking-widest mt-3 animate-pulse">Recharging Infinity Stones...</span>
            </div>
          ) : (
            <>
              {/* TIME */}
              <StoneButton
                icon={Clock} label="Time" color="green" stoneKey="time"
                onClick={() => setConfirmStone('time')}
                desc="Escape Timeline"
              />

              {/* MIND */}
              <StoneButton
                icon={Brain} label="Mind" color="yellow" stoneKey="mind"
                onClick={() => setConfirmStone('mind')}
                desc="Reveal Hint"
              />

              {/* SPACE */}
              <StoneButton
                icon={Box} label="Space" color="blue" stoneKey="space"
                onClick={() => { }}
                disabledOverride={true}
                desc="Dashboard Only"
              />

              {/* POWER */}
              <StoneButton
                icon={Flame} label="Power" color="purple" stoneKey="power"
                onClick={() => setConfirmStone('power')}
                desc="Attack Team"
              />

              {/* REALITY */}
              <StoneButton
                icon={Eye} label="Reality" color="red" stoneKey="reality"
                onClick={() => setConfirmStone('reality')}
                desc="Rewrite Answer"
              />

              {/* SOUL */}
              <StoneButton
                icon={Skull} label="Soul" color="orange" stoneKey="soul"
                onClick={() => setConfirmStone('soul')}
                desc="Sacrifice Stone"
              />
            </>
          )}
        </div>
      </div>

      {/* CONFIRMATION DIALOG (New) */}
      {confirmStone && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`bg-[#0a0a12] border w-full max-w-sm p-6 rounded-xl shadow-2xl relative overflow-hidden transition-all ${confirmStone === 'time' ? 'border-green-500/30' :
            confirmStone === 'mind' ? 'border-yellow-500/30' :
              confirmStone === 'power' ? 'border-purple-500/30' :
                confirmStone === 'reality' ? 'border-red-500/30' :
                  'border-orange-500/30'
            }`}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-2">
                {confirmStone === 'time' && <Clock size={32} className="text-green-500" />}
                {confirmStone === 'mind' && <Brain size={32} className="text-yellow-500" />}
                {confirmStone === 'power' && <Flame size={32} className="text-purple-500" />}
                {confirmStone === 'reality' && <Eye size={32} className="text-red-500" />}
                {confirmStone === 'soul' && <Skull size={32} className="text-orange-500" />}
              </div>

              <h3 className="text-xl font-bold uppercase tracking-widest text-white">
                Activate {confirmStone} Stone?
              </h3>

              <p className="text-sm text-cyan-100/70 leading-relaxed font-mono">
                {stoneDescriptions[confirmStone]}
              </p>

              <div className="flex items-center gap-2 text-[10px] bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/20">
                <AlertTriangle size={10} />
                <span>Initiating this action triggers a 20m Global Cooldown.</span>
              </div>

              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setConfirmStone(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-white/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`flex-1 py-3 border rounded-lg text-xs font-bold uppercase tracking-widest text-black transition-all shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:scale-[1.02] active:scale-95 ${confirmStone === 'time' ? 'bg-green-500 hover:bg-green-400 border-green-500' :
                    confirmStone === 'mind' ? 'bg-yellow-500 hover:bg-yellow-400 border-yellow-500' :
                      confirmStone === 'power' ? 'bg-purple-600 hover:bg-purple-500 border-purple-600 text-white' :
                        confirmStone === 'reality' ? 'bg-red-600 hover:bg-red-500 border-red-600 text-white' :
                          'bg-orange-500 hover:bg-orange-400 border-orange-500'
                    }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* Power Stone Modal */}
      {showPowerModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0a12] border border-purple-500/30 w-full max-w-lg p-8 rounded-2xl shadow-[0_0_100px_rgba(168,85,247,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

            <h3 className="text-purple-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-3 text-lg">
              <Flame size={20} /> Select Target For Destruction
            </h3>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar mb-8 pr-2">
              {teams.filter(t => t.teamName).length === 0 && <p className="text-white/30 text-center py-4">Scanning for targets...</p>}
              {teams.map(team => (
                <button
                  key={team._id}
                  onClick={() => setTargetTeam(team._id)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex justify-between items-center group ${targetTeam === team._id ? "bg-purple-900/20 border-purple-500/50 text-white shadow-[0_0_20px_rgba(168,85,247,0.1)]" : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white"}`}
                >
                  <span className="font-bold tracking-wider">{team.teamName}</span>
                  {targetTeam === team._id && <Target size={16} className="text-purple-400" />}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowPowerModal(false)} className="flex-1 py-4 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:bg-white/10 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors">Abort</button>
              <button disabled={!targetTeam} onClick={executePower} className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all">Launch Strike</button>
            </div>
          </div>
        </div>
      )}

      {/* Soul Stone Modal */}
      {showSoulModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0a12] border border-orange-500/30 w-full max-w-lg p-8 rounded-2xl shadow-[0_0_100px_rgba(249,115,22,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

            <h3 className="text-orange-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-3 text-lg">
              <Skull size={20} /> Select Sacrifice
            </h3>

            <p className="text-white/40 text-xs mb-6 font-mono border-l-2 border-orange-500/50 pl-3">
              WARNING: Sacrificed stones are permanently lost. You will receive bonus points immediately.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {["space", "power", "reality"].map(stone => { // Rules: Can sacrifice Space, Power, Reality (Time/Mind can't be sacrificed?)
                // "Sacrifice one earned stone (except Time & Mind)." logic from prompt.
                const has = hasStone(stone);
                if (!has) return null;
                return (
                  <button
                    key={stone}
                    onClick={() => setSacrificeStone(stone)}
                    className={`p-6 rounded-xl border flex flex-col items-center gap-3 transition-all ${sacrificeStone === stone ? `bg-orange-900/20 border-orange-500/50` : "bg-white/5 border-white/5 opacity-60 hover:opacity-100 hover:bg-white/10"}`}
                  >
                    <div className={`w-4 h-4 rounded-full ${bgClasses[getStoneColor(stone)]}`} />
                    <span className="uppercase text-xs font-bold tracking-widest">{stone}</span>
                  </button>
                );
              })}
              {!hasStone("space") && !hasStone("power") && !hasStone("reality") && (
                <div className="col-span-2 text-center py-4 text-white/30 text-xs italic">
                  No sacrificial stones available.
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowSoulModal(false)} className="flex-1 py-4 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:bg-white/10 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors">Cancel</button>
              <button disabled={!sacrificeStone} onClick={executeSoul} className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-black font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all">Sacrifice</button>
            </div>
          </div>
        </div>
      )}

      {/* STONE ACQUIRED SCREEN */}
      {acquiredStone && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8 animate-in zoom-in duration-700">
          <div className="relative group">
            <div className={`absolute inset-0 blur-[100px] opacity-50 ${acquiredStone === 'time' ? 'bg-green-500' :
                acquiredStone === 'mind' ? 'bg-yellow-500' :
                  acquiredStone === 'space' ? 'bg-blue-500' :
                    acquiredStone === 'power' ? 'bg-purple-500' :
                      acquiredStone === 'reality' ? 'bg-red-500' :
                        'bg-orange-500'
              }`} />

            <div className="relative z-10 p-12 rounded-full bg-black/50 border border-white/10 shadow-2xl mb-8 animate-bounce-slow">
              {(() => {
                const icons: any = { time: Clock, mind: Brain, space: Box, power: Flame, reality: Eye, soul: Skull };
                const Icon = icons[acquiredStone] || Box;
                // Dynamic color class application needs safe list, usually passed as prop or style. 
                // Using inline color style for guaranteed render
                const colors: any = { time: "#22c55e", mind: "#eab308", space: "#3b82f6", power: "#a855f7", reality: "#ef4444", soul: "#f97316" };
                return <Icon size={80} color={colors[acquiredStone]} style={{ filter: `drop-shadow(0 0 20px ${colors[acquiredStone]})` }} />;
              })()}
            </div>
          </div>

          <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-[0.2em] text-white mb-4 text-center animate-in slide-in-from-bottom-5 duration-700 delay-100">
            {acquiredStone} Stone
          </h1>

          <h2 className="text-xl text-white/50 uppercase tracking-widest mb-12 animate-in slide-in-from-bottom-5 duration-700 delay-200">
            Acquired
          </h2>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-12 py-4 bg-white text-black font-black text-sm uppercase tracking-[0.2em] hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] animate-in slide-in-from-bottom-5 duration-700 delay-300 rounded-lg"
          >
            Proceed to Dashboard
          </button>

          <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      )}
    </div>
  );
};

export default MissionInterface;