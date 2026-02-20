import React, { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { Trophy, Zap } from "lucide-react";

const STONE_COLORS = {
    time: "#22c55e",
    mind: "#eab308",
    space: "#3b82f6",
    power: "#a855f7",
    reality: "#ef4444",
    soul: "#f97316",
};

const STONES_ORDER = ["time", "mind", "space", "power", "reality", "soul"] as const;

export const SnapSequence = () => {
    const { isSnapping, snapWinner } = useGame();
    const { team } = useAuth();
    const [phase, setPhase] = useState<"idle" | "buildup" | "snap" | "dissolve" | "victory">("idle");
    const [activeStoneIndex, setActiveStoneIndex] = useState(-1);

    useEffect(() => {
        if (isSnapping && phase === "idle") {
            setPhase("buildup");
        } else if (team?.snapActivated && phase === "idle") {
            setPhase("victory");
        }
    }, [isSnapping, team?.snapActivated, phase]);

    const isOtherTeamSnap = snapWinner && snapWinner.teamId !== team?._id;

    useEffect(() => {
        if (phase === "buildup") {
            let current = 0;
            const interval = setInterval(() => {
                if (current < STONES_ORDER.length) {
                    setActiveStoneIndex(current);
                    current++;
                } else {
                    clearInterval(interval);
                    setTimeout(() => setPhase("snap"), 1000);
                }
            }, 800);
            return () => clearInterval(interval);
        }

        if (phase === "snap") {
            const audio = new Audio("https://www.myinstants.com/media/sounds/thanos-snap-sound-effect-1.mp3");
            audio.play().catch(() => { });
            setTimeout(() => setPhase("dissolve"), 800);
        }

        if (phase === "dissolve") {
            setTimeout(() => setPhase("victory"), 3000);
        }
    }, [phase]);

    // If someone else snapped
    if (snapWinner && !isSnapping && phase !== "victory") {
        return (
            <div className="fixed inset-0 z-[10000] bg-red-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
                <div className="max-w-md space-y-6">
                    <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-pulse">
                        <Zap size={48} className="text-white fill-current" />
                    </div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Timeline Destabilized</h2>
                    <p className="text-red-400 font-mono text-sm tracking-widest leading-relaxed">
                        CRITICAL_ERROR: A rival team has activated the Supreme Snap. Reality is being rewritten.
                    </p>
                    <div className="pt-8">
                        <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] mb-4">Ascended Team</p>
                        <div className="text-2xl font-black text-white border-y border-white/10 py-4 uppercase tracking-widest">
                            {snapWinner.teamName}
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.href = "/dashboard"}
                        className="mt-8 px-12 py-3 border border-red-500/50 text-red-500 font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-red-500/10 transition-all"
                    >
                        Acknowledge Defeat
                    </button>
                </div>
            </div>
        );
    }

    if (phase === "idle") return null;

    return (
        <div className="fixed inset-0 z-[10000] overflow-hidden pointer-events-none">
            {/* PHASE 1: Build-up */}
            {phase === "buildup" && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="relative w-96 h-96">
                        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                            {/* Simplified Gauntlet Outline */}
                            <path d="M60 180 L50 140 L40 100 L45 60 L60 30 L80 20 L120 20 L140 30 L155 60 L160 100 L150 140 L140 180 Z" fill="#DAA520" opacity="0.1" stroke="#FFD700" strokeWidth="1" />

                            {/* Stone Slots */}
                            {STONES_ORDER.map((s, i) => {
                                const angle = (i * 60) * (Math.PI / 180);
                                const x = 100 + 60 * Math.cos(angle - Math.PI / 2);
                                const y = 80 + 60 * Math.sin(angle - Math.PI / 2);
                                const isActive = i <= activeStoneIndex;
                                const color = STONE_COLORS[s];

                                return (
                                    <g key={s}>
                                        <circle
                                            cx={x} cy={y} r="12"
                                            fill={isActive ? color : "#222"}
                                            className={isActive ? "animate-lens-flare" : ""}
                                            style={{ filter: isActive ? `drop-shadow(0 0 15px ${color})` : 'none' }}
                                        />
                                        {isActive && (
                                            <circle cx={x} cy={y} r="25" fill={`url(#flare-${s})`} opacity="0.4" />
                                        )}
                                        <defs>
                                            <radialGradient id={`flare-${s}`}>
                                                <stop offset="0%" stopColor={color} />
                                                <stop offset="100%" stopColor="transparent" />
                                            </radialGradient>
                                        </defs>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                    <div className="mt-8 text-center space-y-2">
                        <p className="text-gold-500 font-mono text-[10px] tracking-[0.5em] uppercase animate-pulse">Synchronizing Core Matrices...</p>
                        <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">Infinity Gauntlet Primed</h1>
                    </div>
                </div>
            )}

            {/* PHASE 2: The Snap (Flash) */}
            {phase === "snap" && (
                <div className="absolute inset-0 bg-white z-[11000] animate-white-out" />
            )}

            {/* PHASE 3: Dissolve (Particles) */}
            {phase === "dissolve" && (
                <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 150 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 rounded-full disintegrate-ash animate-particle-dissolve"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDuration: `${1 + Math.random() * 2}s`,
                                animationDelay: `${Math.random() * 0.5}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* PHASE 4: Victory Screen */}
            {phase === "victory" && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 fade-in duration-1000 pointer-events-auto">
                    <div className="relative mb-12">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-[100px] rounded-full animate-pulse" />
                        <Trophy size={120} className="text-yellow-500 relative z-10 drop-shadow-[0_0_50px_rgba(255,215,0,0.5)]" />
                    </div>

                    <div className="space-y-4 max-w-2xl">
                        <h1 className="text-7xl font-black italic tracking-tighter victory-text-gold uppercase leading-none">Victory Accomplished</h1>
                        <p className="text-yellow-500/80 font-mono text-sm tracking-[0.4em] uppercase">Timeline Successfully Restored</p>

                        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-12">
                            <div className="space-y-1">
                                <p className="text-white/40 text-[10px] uppercase tracking-widest">Final Rank</p>
                                <p className="text-4xl font-black text-white italic">#1</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-white/40 text-[10px] uppercase tracking-widest">Team Identity</p>
                                <p className="text-4xl font-black text-white italic">{snapWinner?.teamName}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.href = "/dashboard"}
                            className="mt-16 px-16 py-4 bg-yellow-600 text-black font-black uppercase tracking-[0.3em] text-xs rounded-sm hover:bg-yellow-500 transition-all active:scale-95"
                        >
                            Return to Hall of Fame
                        </button>
                    </div>

                    <div className="absolute bottom-12 left-12 text-left opacity-30">
                        <p className="text-[10px] font-mono tracking-widest uppercase">Encryption Status: COMPLETED</p>
                        <p className="text-[10px] font-mono tracking-widest uppercase">Reality Status: ANCHORED</p>
                    </div>
                </div>
            )}
        </div>
    );
};
