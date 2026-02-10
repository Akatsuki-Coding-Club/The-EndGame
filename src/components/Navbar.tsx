import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useTimer } from "@/context/TimerContext";
import { Trophy, Timer, Target, Zap } from "lucide-react";

const Navbar = () => {
    const { team } = useAuth();
    const { score, allTeamsState } = useGame();
    const { formatted } = useTimer();

    // Calculate rank dynamically based on allTeamsState
    const currentRank = [...allTeamsState]
        .sort((a, b) => b.score - a.score)
        .findIndex(t => t.teamId === team?.id) + 1;

    return (
        <nav className="w-full h-14 border-b border-primary/30 bg-black flex items-center justify-between px-6 sticky top-0 z-50 overflow-hidden">
            {/* 1. LEFT: AKATSUKI LOGO */}
            <div className="flex items-center gap-4">
                <div className="relative group">
                    {/* <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div> */}
                    <img
                        src="https://i.ibb.co/LXwJLXBp/akatsukilogo-removebg-preview.png"
                        alt="Akatsuki"
                        className="h-[4.5rem] w-auto object-contain 
             drop-shadow-[0_0_12px_rgba(255,0,0,0.35)]
             transition-transform duration-300 
             group-hover:scale-105"
                    />

                </div>
                <div className="h-8 w-[1px] bg-primary/20 mx-2 hidden md:block"></div>

            </div>

            {/* 2. MIDDLE: TEAM NAME */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                {/* <span className="text-[8px] text-primary/50 uppercase tracking-[0.5em] font-bold">Authenticated Unit</span> */}
                <h2 className="text-xl font-bold tracking-widest text-white uppercase neon-text">
                    {team?.name || "GUEST_UNIT"}
                </h2>
            </div>

            {/* 3. RIGHT: LIVE STATS HUD */}
            <div className="flex items-center gap-6">
                {/* Timer */}
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 text-primary animate-pulse">
                        <Timer size={14} />
                        <span className="text-sm font-mono font-bold tracking-tighter">{formatted || "02:00:00"}</span>
                    </div>
                    <span className="text-[8px] text-primary/40 uppercase tracking-widest font-bold">Remaining</span>
                </div>

                <div className="h-8 w-[1px] bg-primary/20"></div>

                {/* Score & Rank */}
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-white">
                            <Target size={12} className="text-primary" />
                            <span className="text-sm font-bold">{score}</span>
                        </div>
                        <span className="text-[8px] text-primary/40 uppercase font-bold">Points</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-white">
                            <Trophy size={12} className="text-primary" />
                            <span className="text-sm font-bold">#{currentRank || "--"}</span>
                        </div>
                        <span className="text-[8px] text-primary/40 uppercase font-bold">Rank</span>
                    </div>
                </div>
            </div>

            {/* Decorative HUD Scanline */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        </nav>
    );
};

export default Navbar;