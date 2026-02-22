import React, { useState, useEffect } from "react";
import { Zap, Timer, Trophy, Target } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useTimer } from "@/context/TimerContext";
import { getStoneStatus } from "@/services/api";

const Navbar = () => {
    const { logout, team } = useAuth();
    const { score, allTeamsState, isFrozen, gameStarted } = useGame();
    const { formatted } = useTimer();

    // Default starting stones: Time and Mind
    const [ownedStones, setOwnedStones] = useState<string[]>(['time', 'mind']);

    // Fetch dynamic stone data from the API
    useEffect(() => {
        const fetchStones = async () => {
            try {
                const status = await getStoneStatus();
                if (status && status.stoneType) {
                    // Extract stones that have a count > 0
                    const earned = Object.keys(status.stoneType).filter(key => status.stoneType[key] > 0);
                    // Combine default stones with dynamically earned stones
                    const combined = Array.from(new Set(['time', 'mind', ...earned]));
                    setOwnedStones(combined);
                }
            } catch (error) {
                console.error("Error syncing stone status:", error);
            }
        };

        if (gameStarted) {
            fetchStones();
            // Poll for new stones every 15 seconds
            const interval = setInterval(fetchStones, 15000);
            return () => clearInterval(interval);
        }
    }, [gameStarted]);

    // Calculate rank dynamically
    const currentRank = [...(allTeamsState || [])]
        .sort((a, b) => b.score - a.score)
        .findIndex(t => t.teamId === (team?.id || (team as any)?._id)) + 1;

    // Infinity Stones Configuration
    const infinityStones = [
        { id: "space", label: "Space", color: "#3b82f6", src: "/space-stone.png" },
        { id: "mind", label: "Mind", color: "#eab308", src: "/mind_stone.png" },
        { id: "reality", label: "Reality", color: "#ef4444", src: "/reality-stone.png" },
        { id: "power", label: "Power", color: "#a855f7", src: "/power-stone.png" },
        { id: "time", label: "Time", color: "#22c55e", src: "/time-stone.png" },
        { id: "soul", label: "Soul", color: "#f97316", src: "/soul_stone.jpg" },
    ];

    return (
        <nav className="w-full h-16 border-b border-primary/30 bg-black flex items-center justify-between px-6 sticky top-0 z-50 overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            
            {/* 1. LEFT: AKATSUKI LOGO & TEAM STATUS */}
            <div className="flex items-center gap-4 w-1/3">
                <div className="relative flex items-center justify-center h-10 w-auto">
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
                        <p className="text-[8px] md:text-[9px] font-mono text-cyan-400 uppercase tracking-[0.2em] leading-none opacity-80">
                            {isFrozen ? "System_Locked" : "Neural_Link_Stable"}
                        </p>
                    </div> */}
                </div>
            </div>

            {/* 2. MIDDLE: EXCLUSIVELY INFINITY STONES */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 md:gap-4">
                {infinityStones.map((stone) => {
                    const isUnlocked = ownedStones.includes(stone.id);

                    return (
                        <div 
                            key={stone.id} 
                            // Container is large to accommodate the big stone
                            className="relative flex items-center justify-center w-12 h-12 md:w-16 md:h-16 transition-all duration-500"
                            title={isUnlocked ? `${stone.label} Stone Active` : `Empty Socket`}
                        >
                            {/* SMALL Background Circle / Socket (Always visible, but small) */}
                            <div className="absolute w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#050508] border border-white/10 shadow-[inset_0_4px_8px_rgba(0,0,0,1)] z-0" />

                            {isUnlocked && (
                                <>
                                    {/* BIG Glowing Stone Image (Static glow, no blinking) */}
                                    <img
                                        src={stone.src}
                                        alt={stone.label}
                                        className="w-12 h-12 md:w-16 md:h-16 object-contain z-10 hover:scale-110 transition-transform duration-300"
                                        style={{ filter: `drop-shadow(0 0 15px ${stone.color}) brightness(1.2)` }}
                                    />
                                    {/* Constant Ambient Glow centered on the stone */}
                                    <div 
                                        className="absolute w-10 h-10 rounded-full blur-xl opacity-40 pointer-events-none mix-blend-screen z-0"
                                        style={{ backgroundColor: stone.color }}
                                    />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 3. RIGHT: LIVE STATS HUD */}
            <div className="flex items-center justify-end gap-6 md:gap-8 z-10 w-1/3">
                <div className="text-right flex flex-col items-end hidden lg:flex">
                    <span className="text-[8px] uppercase text-white/30 block tracking-[0.2em] leading-none mb-1">
                        Remaining Time
                    </span>
                    <span className={`text-lg font-bold italic font-mono leading-none drop-shadow-md ${gameStarted ? 'text-red-500' : 'text-slate-500'}`}>
                        {gameStarted ? formatted : "02:00:00"}
                    </span>
                </div>
                
                <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] uppercase text-white/30 block tracking-[0.2em] leading-none mb-1">
                        Global Rank
                    </span>
                    <span className="text-lg font-bold text-yellow-500 italic leading-none drop-shadow-md">
                        {gameStarted ? `#${currentRank}` : "—"}
                    </span>
                </div>
                
                <div className="text-right flex flex-col items-end">
                    <span className="text-[8px] uppercase text-white/30 block tracking-[0.2em] leading-none mb-1">
                        Strategic Points
                    </span>
                    <span className="text-lg font-bold text-cyan-400 leading-none drop-shadow-md">
                        {score ?? 0}
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