import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Skull, Lock, Info, Target, ChevronRight, Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/services/api";

const RulesPage = () => {
    const navigate = useNavigate();
    const { gameStarted } = useGame();
    const { team } = useAuth();
    const [registeredTeams, setRegisteredTeams] = useState<string[]>([]);

    useEffect(() => {
        const fetchRegisteredTeams = async () => {
            try {
                const teams = await api.getRegisteredTeams();
                if (Array.isArray(teams)) setRegisteredTeams(teams);
            } catch (error) {
                console.error("Failed to fetch registered teams:", error);
            }
        };
        fetchRegisteredTeams();
    }, []);

    const handleEnterWarzone = () => {
        if (!gameStarted) {
            toast.error("SYSTEM ENCRYPTION ACTIVE", {
                description: "The Quantum Tunnel is not yet powered. Await Steve's signal.",
            });
            return;
        }

        const teamRegistered = team && Array.isArray(registeredTeams) && registeredTeams.includes(team.id);
        
        if (!teamRegistered) {
            toast.error("ACCESS DENIED", {
                description: "Your biometric signature isn't in the Avengers database.",
            });
            return;
        }

        toast.success("BIOMETRICS VERIFIED", {
            description: "Initiating Time Heist sequence...",
        });
        navigate("/dashboard");
    };

    const rules = [
        { id: "01", title: "Mission Critical", desc: "Solve missions to earn points. Each objective is a unique timeline—one submission only.", icon: <Target className="text-cyan-400" size={22} /> },
        { id: "02", title: "Infinity Stones", desc: "Unlock at 300/600 points. Maximum 2 stones per team. Use them wisely, Thanos won't wait.", icon: <Zap className="text-amber-400" size={22} /> },
        { id: "03", title: "Power Stone Interference", desc: "Hostile teams can lock your terminal for 120s. Solve the bypass puzzle to regain control.", icon: <Lock className="text-purple-500" size={22} /> },
        { id: "04", title: "Vibranium Shield", desc: "One-time protection against stone-based attacks. Consumed upon impact.", icon: <Shield className="text-slate-300" size={22} /> },
        { id: "05", title: "The Blip", desc: "Two-phase global freeze. Only the 'Nano Gauntlet' puzzle can restore your timeline.", icon: <Skull className="text-emerald-400" size={22} /> },
        { id: "06", title: "Endgame Phase", desc: "Final 15 mins: Stones are disabled. Pure mission execution determines the fate of the universe.", icon: <Activity className="text-red-500" size={22} /> },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30">
            <Navbar />
            
            {/* Background Narrative Layer */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0)_0%,rgba(2,6,23,1)_100%)]" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20">
                {/* Briefing Header */}
                <div className="mb-16 space-y-2 border-l-4 border-cyan-500 pl-6">
                    <p className="text-xs font-mono tracking-[0.5em] text-cyan-500 uppercase animate-pulse">
                        Briefing Room // Sector 7G
                    </p>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
                        Whatever it <span className="text-cyan-500">Takes</span>
                    </h1>
                    <p className="text-slate-400 max-w-xl text-sm font-medium tracking-wide">
                        The stones are scattered through time. Follow the protocols below to secure the timeline and complete the heist.
                    </p>
                </div>

                {/* Tactical Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                    {rules.map((rule, idx) => (
                        <div 
                            key={rule.id}
                            className="group relative bg-slate-900/40 border border-slate-800 p-8 hover:bg-slate-800/60 transition-all duration-500 overflow-hidden"
                        >
                            {/* Scanning Line Effect */}
                            <div className="absolute inset-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent -translate-y-full group-hover:animate-scan" />
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-slate-950 border border-slate-700 rounded-sm">
                                        {rule.icon}
                                    </div>
                                    <span className="font-mono text-[10px] text-slate-500 tracking-tighter italic">
                                        PROTOCOL_{rule.id}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3 tracking-tight uppercase group-hover:text-cyan-400 transition-colors">
                                    {rule.title}
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed font-light">
                                    {rule.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Engagement */}
                <div className="mt-20 flex flex-col items-center">
                    {!gameStarted && (
                        <div className="mb-8 px-6 py-2 bg-red-950/20 border border-red-900/50 rounded-full flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                            <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase">
                                Quantum Tunnel: Disconnected - Awaiting Power-Up
                            </span>
                        </div>
                    )}

                    <button
                        onClick={handleEnterWarzone}
                        disabled={!gameStarted}
                        className={`
                            relative px-16 py-5 overflow-hidden transition-all duration-300
                            ${gameStarted 
                                ? "bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_30px_rgba(8,145,178,0.3)]" 
                                : "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed"}
                        `}
                    >
                        <div className="relative z-10 flex items-center gap-4 font-black uppercase tracking-[0.3em] text-sm">
                            {gameStarted ? "Initiate Heist" : "System Locked"}
                            {gameStarted && <ChevronRight size={18} className="animate-bounce-x" />}
                        </div>
                        
                        {/* Button Glow Effect */}
                        {gameStarted && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-shimmer" />
                        )}
                    </button>
                </div>
            </main>

            {/* Corner Decorative HUD */}
            <div className="fixed bottom-6 left-6 flex items-center gap-4 text-[10px] font-mono text-slate-600">
                <div className="h-px w-12 bg-slate-800" />
                AVNG_OPERATIONS_MANUAL
            </div>
        </div>
    );
};

export default RulesPage;