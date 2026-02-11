import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { toast } from "sonner";
import { Shield, Users, Play, Database, Zap, PlusCircle, LayoutList, Activity, Unlock, Lock, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
const AdminDashboard = () => {
    const navigate = useNavigate();
    const {
        puzzles,
        startGame,
        gameStarted,
        allTeamsState,
        freezeTeam,
        triggerBlip,
        unfreezeTeam,
        setGameDuration,
        gameDuration,
    } = useGame();
    const maxLevel = puzzles.length || 15;
    const [activeTab, setActiveTab] = useState("orchestration");
    const [duration, setDuration] = useState(120);
    const [localDuration, setLocalDuration] = useState(gameDuration / 60);

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const mins = Number(e.target.value);
        setLocalDuration(mins);
        setGameDuration(mins); // Updates the global timer state immediately
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-mono">
            <div className="flex h-screen">
                <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 space-y-2">
                    <div className="px-4 py-6">
                        <h2 className="text-[10px] tracking-[0.5em] text-blue-500 font-bold uppercase">
                            S.H.I.E.L.D. OS
                        </h2>
                        <p className="text-[8px] text-slate-500">
                            LEVEL 7 CLEARANCE GRANTED
                        </p>
                    </div>

                    {[
                        { id: "orchestration", label: "Orchestration", icon: <Database size={16} /> },
                        { id: "game", label: "Game Management", icon: <PlusCircle size={16} /> },
                        { id: "questions", label: "Intel Repository", icon: <LayoutList size={16} /> },
                        { id: "teams", label: "Active Units", icon: <Users size={16} /> },
                        { id: "live", label: "Live Operations", icon: <Zap size={16} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? "bg-blue-600/10 border-r-2 border-blue-500 text-blue-400"
                                : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                    <div className="pt-4 border-t border-slate-800">
                        <button
                            onClick={() => navigate("/leaderboard")}
                            className="w-full flex items-center justify-between px-4 py-4 bg-blue-600 hover:bg-blue-500 text-white transition-all group shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                        >
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Live Leaderboard</span>
                            </div>
                            <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </aside>

                <main className="flex-1 p-10 overflow-y-auto">
                    {activeTab === "orchestration" && (
                        <div className="max-w-4xl space-y-8 animate-fade-in">
                            <section className="glass-card p-8 border-l-4 border-blue-500">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Shield className="text-blue-500" /> MISSION INITIALIZATION
                                </h3>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase text-slate-500 font-bold">
                                            Round Duration (Minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={localDuration}
                                            disabled={gameStarted} 
                                            onChange={handleDurationChange}
                                            className="w-full bg-slate-950 border border-slate-800 p-3 text-blue-400 focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase text-slate-500 font-bold">
                                            Global Status
                                        </label>
                                        <div
                                            className={`p-3 border ${gameStarted
                                                ? "border-green-500/50 text-green-500"
                                                : "border-red-500/50 text-red-500"
                                                }`}
                                        >
                                            {gameStarted ? "ACTIVE_OPERATIONS" : "STANDBY_MODE"}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10">
                                    <button
                                        onClick={() => {
                                            startGame();
                                            toast.success("SYSTEM_ONLINE", {
                                                description: "Mission clock started."
                                            });
                                        }}
                                        disabled={gameStarted}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white px-8 py-4 font-bold uppercase text-xs tracking-[0.3em] transition-all"
                                    >
                                        <Play size={16} /> Initiate Global Protocol
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === "game" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                            <div className="glass-card p-6 border border-slate-800">
                                <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">
                                    Create Game Instance
                                </h3>
                                <input
                                    className="w-full bg-slate-950 border border-slate-800 p-3 text-sm mb-4 outline-none focus:border-blue-500"
                                    placeholder="Game Name (e.g., Fest Final Round)"
                                />
                                <button className="w-full bg-slate-800 py-2 text-[10px] uppercase font-bold hover:bg-slate-700 transition-colors">
                                    Initialize Instance
                                </button>
                            </div>

                            <div className="glass-card p-6 border border-slate-800">
                                <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">
                                    Instance Configuration
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase text-slate-600 mb-1 block">
                                            Attach Teams
                                        </label>
                                        <select className="w-full bg-slate-950 border border-slate-800 p-2 text-xs outline-none focus:border-blue-500">
                                            <option>Select Batch (Team 1-15)</option>
                                            <option>Select All Registered</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase text-slate-600 mb-1 block">
                                            Assign Missions
                                        </label>
                                        <select
                                            multiple
                                            className="w-full bg-slate-950 border border-slate-800 p-2 text-xs h-32 outline-none focus:border-blue-500"
                                        >
                                            {puzzles.map(p => (
                                                <option
                                                    key={p.id}
                                                    value={p.id}
                                                    className="p-1 uppercase tracking-tighter"
                                                >
                                                    {p.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* SECTION 4: INTEL REPOSITORY (QUESTIONS) */}
                    {activeTab === "questions" && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex gap-4 border-b border-slate-800 pb-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500">Intel Creation Module</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Form Area */}
                                <div className="lg:col-span-1 glass-card p-6 border border-slate-800 h-fit sticky top-0">
                                    <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-4 tracking-widest">Initialization Form</h4>
                                    <div className="space-y-4">
                                        <select className="w-full bg-slate-950 border border-slate-800 p-3 text-xs outline-none focus:border-blue-500">
                                            <option>Standard Mission</option>
                                            <option>Blip Puzzle</option>
                                        </select>
                                        <input className="w-full bg-slate-950 border border-slate-800 p-3 text-sm outline-none focus:border-blue-500" placeholder="Intel ID / Title..." />
                                        <textarea className="w-full bg-slate-950 border border-slate-800 p-3 text-sm h-24 outline-none focus:border-blue-500" placeholder="Encrypted Question Data..." />
                                        <input className="w-full bg-slate-950 border border-slate-800 p-3 text-sm outline-none focus:border-blue-500" placeholder="Decryption Key (Answer)..." />
                                        <input type="number" className="w-full bg-slate-950 border border-slate-800 p-3 text-sm outline-none focus:border-blue-500" placeholder="Point Allocation..." />

                                        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                                            <PlusCircle size={14} /> Save to Repository
                                        </button>
                                    </div>
                                </div>

                                {/* List Area */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-4 tracking-widest px-2">Active Mission Intel</h4>
                                    <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
                                        {puzzles.map((p) => (
                                            <div key={p.id} className="bg-slate-900/50 border border-slate-800 p-4 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[8px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 border border-blue-500/20 font-bold uppercase">M-{p.id.toString().padStart(2, '0')}</span>
                                                        <h5 className="font-bold text-sm text-slate-200">{p.title}</h5>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 italic max-w-md truncate">{p.question}</p>
                                                </div>
                                                <div className="text-right flex items-center gap-4">
                                                    <div className="text-[10px] font-mono text-blue-500 font-bold">{p.points} P</div>
                                                    <button className="text-slate-600 hover:text-red-500 transition-colors">
                                                        <Zap size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* SECTION 5: LIVE OPERATIONS */}
                    {activeTab === "live" && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Master Alert Header */}
                            <div className="bg-red-950/20 border-l-4 border-red-500 p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-red-500 tracking-tighter uppercase">Live System Override</h3>
                                    <p className="text-[10px] text-red-700 font-bold uppercase tracking-[0.2em]">Priority Alpha Level Clearance Required</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-xs font-mono text-red-500">SYSTEM_LIVE</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Blip Control Module */}
                                <div className="glass-card p-8 border border-slate-800">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Zap className="text-blue-500" size={20} />
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200">Global Blip Protocol</h4>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <button
                                            onClick={() => triggerBlip(1)}
                                            className="group relative flex items-center justify-between p-6 bg-slate-900 border border-blue-900/50 hover:bg-blue-900/20 transition-all overflow-hidden"
                                        >
                                            <div className="text-left z-10">
                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Phase 01</span>
                                                <h5 className="text-lg font-bold text-white uppercase italic">Initiate First Blip</h5>
                                                <p className="text-[8px] text-slate-500 uppercase mt-1">Randomized targeting: 15 units</p>
                                            </div>
                                            <Zap className="text-blue-500 group-hover:scale-125 transition-transform" size={32} />
                                        </button>

                                        <button
                                            onClick={() => triggerBlip(2)}
                                            className="group relative flex items-center justify-between p-6 bg-slate-900 border border-purple-900/50 hover:bg-purple-900/20 transition-all overflow-hidden"
                                        >
                                            <div className="text-left z-10">
                                                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Phase 02</span>
                                                <h5 className="text-lg font-bold text-white uppercase italic">Initiate Second Blip</h5>
                                                <p className="text-[8px] text-slate-500 uppercase mt-1">Targeting: Remaining units</p>
                                            </div>
                                            <Zap className="text-purple-500 group-hover:scale-125 transition-transform" size={32} />
                                        </button>
                                    </div>
                                </div>

                                {/* Live Deployment Monitor */}
                                <div className="glass-card p-8 border border-slate-800 flex flex-col">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Activity size={20} className="text-blue-500" />
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-200">Tactical Unit Status</h4>
                                    </div>

                                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] scrollbar-thin pr-2">
                                        {allTeamsState.map(t => (
                                            <div key={t.teamId} className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800/50">
                                                <div>
                                                    <span className="text-xs font-bold text-slate-300 uppercase">{t.teamName}</span>
                                                    <div className="flex gap-2 mt-1">
                                                        {t.isFrozen && <span className="text-[8px] font-bold text-blue-500 uppercase">[Frozen]</span>}
                                                        {t.isBlocked && <span className="text-[8px] font-bold text-red-500 uppercase">[Blocked]</span>}
                                                        {!t.isFrozen && !t.isBlocked && <span className="text-[8px] font-bold text-green-500 uppercase">[Active]</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {t.isFrozen ? (
                                                        <button onClick={() => unfreezeTeam(t.teamId)} className="p-2 border border-blue-500/30 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                                                            <Unlock size={14} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => freezeTeam(t.teamId)} className="p-2 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                            <Lock size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === "teams" && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold uppercase tracking-tighter">
                                    Registered Strike Teams
                                </h3>
                                <button className="text-[10px] border border-slate-700 px-4 py-2 hover:bg-slate-800 uppercase font-bold transition-colors">
                                    Import CSV
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allTeamsState.map(t => (
                                    <div
                                        key={t.teamId}
                                        className="bg-slate-900 border border-slate-800 p-4 relative group overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-2 text-[8px] text-slate-600 font-mono">
                                            UID: {t.teamId}
                                        </div>

                                        <h4 className="font-bold text-blue-400 mb-1 uppercase tracking-tighter">
                                            {t.teamName}
                                        </h4>

                                        <p className="text-[10px] text-slate-500 uppercase">
                                            Current Mission: M-{t.currentLevel.toString().padStart(2, "0")}
                                        </p>

                                        <div className="mt-4">
                                            <div className="flex justify-between text-[8px] uppercase text-slate-500 mb-1 font-bold">
                                                <span>Mission Progress</span>
                                                <span>{maxLevel ? Math.round((t.currentLevel / maxLevel) * 100) : 0}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-800">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-500"
                                                    style={{ width: `${maxLevel ? (t.currentLevel / maxLevel) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
