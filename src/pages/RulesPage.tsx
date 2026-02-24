import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Skull, Lock, Info, Play, Terminal, ShieldAlert } from "lucide-react";
import Navbar from "../components/Navbar";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/services/api";

const RulesPage = () => {
    const navigate = useNavigate();
    const { gameStarted, showToast, allTeamsState } = useGame();
    const { team } = useAuth();
    const [bgImageUrl, setBgImageUrl] = useState("");
    const [showSecurityAlert, setShowSecurityAlert] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const savedBg = localStorage.getItem("team_session_bg");
        setBgImageUrl(savedBg || "https://i.ibb.co/0p6SgpVW/44aa5903-5c27-4602-ad23-0ec051b8276a.jpg");

        audioRef.current = new Audio("/alert.mp3");
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                // Removed security alert logic
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    const handleEnterWarzone = () => {
        if (!gameStarted) {
            showToast("SYSTEM OFFLINE", "error", "Awaiting Commander's signal.");
            return;
        }
        if (!team) {
            showToast("INITIALIZATION_REQUIRED", "error", "Please log in to your unit first.");
            return;
        }

        const teamRegistered = allTeamsState.some(t => t.teamId === (team.id || (team as any)._id));
        if (!teamRegistered && allTeamsState.length > 0) {
            showToast("TEAM_NOT_REGISTERED", "error", "Contact the administrator.");
            return;
        }
        navigate("/dashboard");
    };

    const rules = [
        { id: "01", title: "Mission First", desc: "Solve missions to earn points — each submission is final.", icon: <Info /> },
        { id: "02", title: "Infinity Stones", desc: "Unlock at 300/600 points; max two stones per team.", icon: <Zap /> },
        { id: "03", title: "Power Block", desc: "Enemies can freeze your editor for 120s via puzzles.", icon: <Lock /> },
        { id: "04", title: "Shield Protocol", desc: "Blocks one stone attack automatically, then dissolves.", icon: <Shield /> },
        { id: "05", title: "The Blip", desc: "Global freeze phase; only Blip puzzles can be solved.", icon: <Skull /> },
        { id: "06", title: "Endgame Phase", desc: "Last 15m disable all stones — pure skill remains.", icon: <Play /> },
    ];

    return (
        <div className="relative h-screen w-full flex flex-col items-center bg-[#050505] font-sans overflow-x-hidden overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overscroll-y-contain">

            {/* BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 blur-[2px] scale-105 transition-all duration-1000"
                    style={{ backgroundImage: `url('${bgImageUrl}')` }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,0.95)_100%)]" />
                <div className="absolute inset-0 bg-red-950/10 mix-blend-color" />
            </div>

            {/* NAVBAR */}
            <div className="w-full sticky top-0 z-50 shrink-0">
                <Navbar />
            </div>

            {/* Security Alert Pop-up Removed */}

            {/* MAIN CONTENT AREA - Flex-1 perfectly centers content vertically without scrolling */}
            <div className="relative z-10 w-full max-w-6xl px-6 flex-1 flex flex-col justify-center items-center py-6">

                {/* Header (Margins reduced) */}
                <div className="w-full mb-8 flex flex-col items-center text-center">
                    <h2 className="text-[10px] tracking-[0.6em] text-red-600 font-black uppercase mb-2">Neural Link Established</h2>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white  uppercase">
                        Engagement <span className="text-[#e62429]">Rules</span>
                    </h1>
                    <div className="h-[2px] w-32 md:w-48 bg-gradient-to-r from-transparent via-red-600 to-transparent mt-3 opacity-50" />
                </div>

                {/* Rules Grid - Rectangular Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-10">
                    {rules.map((rule, index) => (
                        <div
                            key={rule.id}
                            className="group backdrop-blur-xl bg-white/[0.02] border border-white/10 p-5 rounded-2xl hover:border-red-600/50 transition-all duration-500 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 shadow-lg flex items-start gap-4"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Icon on the Left */}
                            <div className="p-3 bg-red-600/10 rounded-xl border border-red-600/20 group-hover:bg-red-600 transition-colors duration-500 shrink-0 shadow-inner">
                                {React.cloneElement(rule.icon as React.ReactElement, { size: 20, className: "group-hover:text-white transition-colors text-red-500" })}
                            </div>

                            {/* Text on the Right */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <h3 className="text-sm md:text-base font-black tracking-tight text-white uppercase group-hover:text-cyan-400 transition-colors truncate">
                                        {rule.title}
                                    </h3>
                                    <span className="text-[9px] font-black text-white/20 tracking-widest shrink-0 ml-2">{rule.id}</span>
                                </div>
                                <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed font-medium uppercase tracking-wider">
                                    {rule.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Action Area */}
                <div className="flex flex-col items-center gap-5">
                    {!gameStarted && (
                        <div className="flex items-center gap-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
                            <span className="text-[9px] font-black tracking-[0.4em] text-red-500 uppercase animate-pulse">Waiting for Commander's Signal</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
                        </div>
                    )}

                    <button
                        onClick={handleEnterWarzone}
                        disabled={!gameStarted}
                        className={`group relative px-12 py-4 font-black text-xs uppercase tracking-[0.5em] overflow-hidden transition-all rounded-xl shadow-2xl ${gameStarted
                            ? "bg-[#e62429] text-white hover:shadow-[0_0_30px_rgba(230,36,41,0.5)] active:scale-95"
                            : "bg-white/5 border border-white/10 text-white/20 cursor-not-allowed"
                            }`}
                    >
                        <span className="relative z-10">{gameStarted ? "Enter Warzone" : "System Offline"}</span>
                        {gameStarted && <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
                    </button>
                </div>
            </div>

            {/* Cinematic Scanlines */}
            <div className="pointer-events-none fixed inset-0 z-20 opacity-[0.06] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
        </div>
    );
};

export default RulesPage;