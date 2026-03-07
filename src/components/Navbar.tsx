import React, { useState, useEffect } from "react";
import { Zap, Timer, Trophy, Target } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useTimer } from "@/context/TimerContext";
import { getStoneStatus } from "@/services/api";
import { STONE_PROPERTIES } from "@/lib/stoneConfig";

const Navbar = () => {
    const { logout, team } = useAuth();
    const { score, allTeamsState, isFrozen, gameStarted, isBlocked } = useGame();
    const { formatted } = useTimer();

    // Read directly from the dynamically updated context via socket
    const myTeam = allTeamsState?.find(t => t.teamId === (team?.id || (team as any)?._id));
    const ownedStones = (myTeam?.stones || []).map((s: string) => s.toLowerCase());
    const cooldownUntil = myTeam?.cooldownUntil || null;

    const [timeLeft, setTimeLeft] = useState<number>(0);

    // Handle cooldown timer calculation
    useEffect(() => {
        if (!cooldownUntil) {
            setTimeLeft(0);
            return;
        }
        const interval = setInterval(() => {
            const diff = Math.max(0, Math.floor((new Date(cooldownUntil).getTime() - Date.now()) / 1000));
            setTimeLeft(diff);
            if (diff <= 0) clearInterval(interval);
        }, 1000);
        return () => clearInterval(interval);
    }, [cooldownUntil]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const isCooldown = timeLeft > 0 || isBlocked;

    // Calculate rank dynamically
    const currentRank = [...(allTeamsState || [])]
        .sort((a, b) => b.score - a.score)
        .findIndex(t => t.teamId === (team?.id || (team as any)?._id)) + 1;

    const STONES_ORDER = ["space", "mind", "reality", "power", "time", "soul"];

    return (
        <nav className="w-full h-16 border-b border-primary/30 bg-black flex items-center justify-between px-6 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">

            {/* 1. LEFT: AKATSUKI LOGO & TEAM STATUS */}
            <div className="flex items-center gap-4 w-1/3">
                <div className="relative flex items-center justify-center h-12 w-auto">
                    <img
                        src="https://i.ibb.co/LXwJLXBp/akatsukilogo-removebg-preview.png"
                        alt="Akatsuki Logo"
                        className="h-full w-auto object-contain drop-shadow-[0_0_10px_rgba(230,36,41,0.6)]"
                    />
                </div>

                <div className="h-8 w-[1px] bg-white/10 mx-1 hidden md:block"></div>

                {/* Team Name moved to the left to prevent overlap with stones */}
                <div className="flex flex-col justify-center">
                    <h1 className="text-sm md:text-base font-black tracking-widest uppercase text-white/90 leading-tight drop-shadow-md">
                        {team?.name || "UNIT_UNKNOWN"}
                    </h1>
                    {/* <div className="flex items-center gap-2 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isFrozen ? "bg-red-500 animate-pulse shadow-[0_0_5px_red]" : "bg-green-500 shadow-[0_0_5px_lime]"}`} />
                        <p className="text-[8px] md:text-[9px] font-sans text-cyan-400 uppercase tracking-[0.2em] leading-none opacity-80">
                            {isFrozen ? "System_Locked" : "Neural_Link_Stable"}
                        </p>
                    </div> */}
                </div>
            </div>

            {/* 2. MIDDLE: EXCLUSIVELY INFINITY STONES */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-2 md:gap-4 relative">

                    {STONES_ORDER.map((id) => {
                        const stone = STONE_PROPERTIES[id];
                        const isUnlocked = ownedStones.includes(id);
                        return (
                            <div
                                key={id}
                                className="relative flex items-center justify-center w-12 h-12 md:w-16 md:h-16 transition-all duration-500 group"
                            >
                                {/* SMALL Background Circle / Socket (Always visible, but small) */}
                                <div className="absolute w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#050508] border border-white/10 shadow-[inset_0_4px_8px_rgba(0,0,0,1)] z-0" />

                                {isUnlocked && (
                                    <>
                                        {/* BIG Glowing Stone Image (Static glow, no blinking) */}
                                        <img
                                            src={stone.image}
                                            alt={stone.label}
                                            className={`w-12 h-12 md:w-16 md:h-16 object-contain z-10 transition-transform duration-300 ${isCooldown ? "grayscale opacity-40 scale-95" : "hover:scale-110"}`}
                                            style={{ filter: isCooldown ? undefined : `drop-shadow(0 0 15px ${stone.color}) brightness(1.2)` }}
                                        />
                                        {/* Constant Ambient Glow centered on the stone */}
                                        {!isCooldown && (
                                            <div
                                                className="absolute w-10 h-10 rounded-full blur-xl opacity-40 pointer-events-none mix-blend-screen z-0"
                                                style={{ backgroundColor: stone.color }}
                                            />
                                        )}

                                        {/* Custom Tooltip */}
                                        <div className="absolute top-[calc(100%+0.75rem)] left-1/2 -translate-x-1/2 w-72 bg-[#05050a] border border-white/10 border-t-2 rounded-xl p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-[100] shadow-[0_25px_50px_rgba(0,0,0,1)]" style={{ borderTopColor: stone.color }}>
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: stone.color }}>{stone.label} Stone</p>
                                            <p className="text-[10px] text-slate-300 font-sans uppercase tracking-widest leading-relaxed">
                                                {isBlocked ? "System frozen by Power Surge. Artifact inaccessible." : isCooldown ? "Temporal instability detected. Cooldown phase active." : stone.desc}
                                            </p>
                                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#05050a] border-t border-l border-white/10 rotate-45" />
                                        </div>
                                    </>
                                )}

                                {!isUnlocked && (
                                    <div className="absolute top-[calc(100%+0.75rem)] left-1/2 -translate-x-1/2 w-64 bg-black border border-white/5 border-t-2 border-white/20 rounded-xl p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-[100] shadow-2xl">
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-1 text-white/30">Empty Socket</p>
                                        <p className="text-[9px] text-white/10 font-sans uppercase tracking-widest leading-relaxed">Artifact signature not detected in local continuum.</p>
                                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black border-t border-l border-white/5 rotate-45" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. RIGHT: LIVE STATS HUD */}
            <div className="flex items-center justify-end gap-6 md:gap-8 z-10 w-1/3">
                <div className="text-right flex flex-col items-end hidden lg:flex">
                    <span className="text-[8px] uppercase text-white/30 block tracking-[0.2em] leading-none mb-1">
                        Remaining Time
                    </span>
                    <span className={`text-lg font-bold font-sans leading-none drop-shadow-md ${gameStarted ? 'text-red-500' : 'text-slate-500'}`}>
                        {gameStarted ? formatted : "01:30:00"}
                    </span>
                </div>

                <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] uppercase text-white/30 block tracking-[0.2em] leading-none mb-1">
                        Global Rank
                    </span>
                    <span className="text-lg font-bold text-yellow-500 leading-none drop-shadow-md">
                        {gameStarted ? `#${currentRank}` : "—"}
                    </span>
                </div>

                <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] uppercase text-white/30 block tracking-[0.2em] leading-none mb-1">
                        Strategic Points
                    </span>
                    <span className="text-lg font-bold text-cyan-400 leading-none drop-shadow-md">
                        {myTeam?.score ?? score ?? 0}
                    </span>
                </div>

                {/* TERMINATION ACTION */}
                {/* <button
                    onClick={logout}
                    className="group flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[9px] border border-red-500/20 text-red-500/60 px-3 py-1.5 md:px-4 md:py-2 rounded hover:bg-red-500 hover:text-white transition-all uppercase font-black tracking-[0.2em] ml-2 bg-black/50"
                >
                    <Zap size={10} className="group-hover:fill-current md:w-3 md:h-3" /> Abort
                </button> */}
            </div>

            {/* Bottom Scanline */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        </nav>
    );
};

export default Navbar;
