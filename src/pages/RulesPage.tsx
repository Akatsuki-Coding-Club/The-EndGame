import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Skull, Lock, Info, Play, Terminal, ShieldAlert } from "lucide-react";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/services/api";

const RulesPage = () => {
    const navigate = useNavigate();
    const { gameStarted } = useGame(); 
    const { team } = useAuth();
    const [registeredTeams, setRegisteredTeams] = useState<string[]>([]);
    const [bgImageUrl, setBgImageUrl] = useState("");
    const [showSecurityAlert, setShowSecurityAlert] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const savedBg = localStorage.getItem("team_session_bg");
        setBgImageUrl(savedBg || "https://i.ibb.co/0p6SgpVW/44aa5903-5c27-4602-ad23-0ec051b8276a.jpg");

        const fetchRegisteredTeams = async () => {
            try {
                const teams = await api.getRegisteredTeams();
                if (Array.isArray(teams)) setRegisteredTeams(teams);
            } catch (error) {
                console.error("Failed to fetch teams:", error);
            }
        };
        fetchRegisteredTeams();

        audioRef.current = new Audio("/alert.mp3");
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setShowSecurityAlert(true);
                audioRef.current?.play().catch(() => { });
            } else {
                setShowSecurityAlert(false);
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    const handleEnterWarzone = () => {
        if (!gameStarted) {
            toast.error("SYSTEM OFFLINE", { description: "Awaiting Commander's signal." });
            return;
        }
        if (!team) {
            toast.error("INITIALIZATION_REQUIRED", { description: "Please log in to your unit first." });
            return;
        }

        const teamRegistered = registeredTeams.includes(team.id || (team as any)._id);
        if (!teamRegistered && registeredTeams.length > 0) {
            toast.error("TEAM_NOT_REGISTERED", { description: "Contact the administrator." });
            return;
        }
        navigate("/dashboard");
    };

    const rules = [
        { id: "01", title: "Mission First", desc: "Solve missions to earn points — each submission is final.", icon: <Info className="text-red-500" /> },
        { id: "02", title: "Infinity Stones", desc: "Unlock at 300/600 points; max two stones per team.", icon: <Zap className="text-red-500" /> },
        { id: "03", title: "Power Block", desc: "Enemies can freeze your editor for 120s via puzzles.", icon: <Lock className="text-red-500" /> },
        { id: "04", title: "Shield Protocol", desc: "Blocks one stone attack automatically, then dissolves.", icon: <Shield className="text-red-500" /> },
        { id: "05", title: "The Blip", desc: "Global freeze phase; only Blip puzzles can be solved.", icon: <Skull className="text-red-500" /> },
        { id: "06", title: "Endgame Phase", desc: "Last 15m disable all stones — pure skill remains.", icon: <Play className="text-red-500" /> },
    ];

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center bg-[#050505] font-sans overflow-x-hidden">
            
            {/* FIXED: Called without props to resolve TS error */}
            <Navbar />

            <div className="absolute inset-0 z-0">
                <div
                    className="h-full w-full bg-cover bg-center opacity-30 blur-[2px] scale-105 transition-all duration-1000"
                    style={{ backgroundImage: `url('${bgImageUrl}')` }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,0.95)_100%)]" />
                <div className="absolute inset-0 bg-red-950/10 mix-blend-color" />
            </div>

            <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${showSecurityAlert ? "translate-y-0 opacity-100" : "-translate-y-40 opacity-0"}`}>
                <div className="bg-[#e62429] border border-white/20 text-white px-8 py-4 rounded-xl shadow-[0_0_50px_rgba(230,36,41,0.6)] flex items-center gap-6 animate-pulse">
                    <ShieldAlert size={30} />
                    <p className="text-xs font-black uppercase tracking-widest">Security Protocol Breached: Restore Fullscreen</p>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-5xl px-6 py-20 flex flex-col items-center">
                <div className="w-full mb-12 flex flex-col items-center text-center">
                    <h2 className="text-[10px] tracking-[0.6em] text-red-600 font-black uppercase mb-2">Neural Link Established</h2>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white italic uppercase">
                        Engagement <span className="text-[#e62429]">Rules</span>
                    </h1>
                    <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-red-600 to-transparent mt-4 opacity-50" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-16">
                    {rules.map((rule, index) => (
                        <div
                            key={rule.id}
                            className="group backdrop-blur-xl bg-white/[0.03] border border-white/10 p-8 rounded-3xl hover:border-red-600/50 transition-all duration-500 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 shadow-2xl"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20 group-hover:bg-red-600 transition-colors duration-500">
                                        {React.cloneElement(rule.icon as React.ReactElement, { size: 24, className: "group-hover:text-white transition-colors" })}
                                    </div>
                                    <span className="text-[10px] font-black text-white/20 tracking-widest">{rule.id}</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-black tracking-tight text-white uppercase italic">{rule.title}</h3>
                                    <p className="text-xs text-white/50 leading-relaxed font-medium uppercase tracking-wider">{rule.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-8">
                    {!gameStarted && (
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-4">
                                <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                                <span className="text-[10px] font-black tracking-[0.4em] text-red-500 uppercase animate-pulse">Waiting for Commander's Signal</span>
                                <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleEnterWarzone}
                        disabled={!gameStarted}
                        className={`group relative px-16 py-5 font-black text-xs uppercase tracking-[0.5em] overflow-hidden transition-all rounded-xl shadow-2xl ${gameStarted
                            ? "bg-[#e62429] text-white hover:shadow-[0_0_30px_rgba(230,36,41,0.5)] active:scale-95"
                            : "bg-white/5 text-white/20 cursor-not-allowed"
                            }`}
                    >
                        <span className="relative z-10">{gameStarted ? "Enter Warzone" : "System Offline"}</span>
                        {gameStarted && <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
                    </button>
                </div>
            </div>
            <div className="pointer-events-none fixed inset-0 z-20 opacity-[0.06] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
        </div>
    );
};

export default RulesPage;