import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentQuestion, submitAnswer } from "@/services/api";
import { toast } from "sonner";
import { Terminal, Send, Loader2, Target, Zap } from "lucide-react";

const MissionInterface = () => {
  const { timelineId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [answer, setAnswer] = useState("");

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await getCurrentQuestion(); // Fetch one question at a time
      if (res.completed) {
        toast.success("MISSION_COMPLETE: Timeline Stabilized");
        navigate("/dashboard");
        return;
      }
      setCurrentTask(res);
    } catch (e) {
      toast.error("Signal lost. Reconnecting to timeline...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProgress(); }, [timelineId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !currentTask?.question?._id) return;

    try {
      setSubmitting(true);
      const res = await submitAnswer(currentTask.question._id, answer);

      if (res.isCorrect) {
        toast.success(`KEY_ACCEPTED: +${res.points} Strategic Points`);
        setAnswer("");
        if (res.completed) {
          navigate("/dashboard");
        } else {
          await fetchProgress(); // Load next question in sequence
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

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center font-mono text-cyan-500">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p className="tracking-[0.4em] text-[10px]">DECRYPTING_OBJECTIVES...</p>
    </div>
  );

  const activeMission = currentTask?.question;

  return (
    <div className="h-screen bg-[#05050c] flex flex-col font-mono text-slate-300 overflow-hidden">
      <header className="px-8 py-4 border-b border-white/10 bg-black/60 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Terminal size={20} className="text-cyan-500" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-white">Neural Interface</h2>
        </div>
        <div className="text-right">
          <span className="text-[8px] text-white/40 block uppercase tracking-widest">Stability Status</span>
          <span className="text-sm font-bold text-cyan-400">
            Progress: {currentTask?.answeredCount + 1} / {currentTask?.totalQuestions}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-8 overflow-hidden max-w-5xl mx-auto w-full">
        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col relative overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between bg-black/20">
             <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
               <Zap size={12}/> Objective_{currentTask?.answeredCount + 1}
             </span>
             <span className="text-[10px] text-white/40 uppercase">
               Priority: <span className="text-cyan-400">{activeMission?.points} PTS</span>
             </span>
          </div>

          <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-8 border-l-4 border-cyan-500 pl-6">
              {activeMission?.title}
            </h3>
            
            <div className="bg-black/60 border border-white/10 p-10 rounded-xl relative shadow-2xl">
              <p className="text-xl leading-relaxed text-cyan-100/90 whitespace-pre-wrap">
                {activeMission?.question}
              </p>
              <div className="absolute top-2 right-4 text-[7px] text-white/10 uppercase tracking-widest">S.H.I.E.L.D. Secure Intel</div>
            </div>
          </div>

          <div className="p-10 bg-black/80 border-t border-white/10">
            <form onSubmit={handleSubmit} className="flex gap-4 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <input 
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter Access Key..."
                  className="w-full bg-black border border-white/20 rounded-lg px-6 py-5 focus:border-cyan-500/50 outline-none text-white font-mono placeholder:text-white/10"
                  autoFocus
                />
                <Target className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5" size={20} />
              </div>
              <button 
                type="submit" 
                disabled={submitting || !answer.trim()}
                className="px-12 bg-cyan-600 hover:bg-cyan-400 disabled:opacity-20 text-black font-black uppercase text-xs tracking-widest rounded-lg transition-all"
              >
                {submitting ? "Transmitting..." : "Execute"}
              </button>
            </form>
          </div>
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
      </main>
    </div>
  );
};

export default MissionInterface;