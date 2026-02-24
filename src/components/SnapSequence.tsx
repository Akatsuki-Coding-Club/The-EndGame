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
    const [showNotification, setShowNotification] = useState(true);
    const [hasPlayedRivalSnap, setHasPlayedRivalSnap] = useState(false);

    useEffect(() => {
        if (snapWinner && snapWinner.teamId !== team?._id && !hasPlayedRivalSnap) {
            setShowNotification(true);
            const timer = setTimeout(() => setShowNotification(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [snapWinner?.teamId, team?._id, hasPlayedRivalSnap]);

    useEffect(() => {
        if (isSnapping && phase === "idle") {
            setPhase("buildup");
        } else if (team?.snapActivated && phase === "idle") {
            setPhase("victory");
        } else if (snapWinner && snapWinner.teamId !== team?._id && phase === "idle" && !hasPlayedRivalSnap) {
            // Rival snap detected - show a brief white flash before the notification
            setHasPlayedRivalSnap(true);
            setPhase("snap");
            setTimeout(() => setPhase("idle"), 1000); // Return to idle so notification shows
        }
    }, [isSnapping, team?.snapActivated, phase, snapWinner, team?._id, hasPlayedRivalSnap]);

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

    // If someone else snapped — Non-blocking notification
    if (snapWinner && !isSnapping && phase === "idle" && snapWinner.teamId !== team?._id && showNotification) {
        return (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xl animate-in fade-in slide-in-from-top-10 duration-1000 pointer-events-none">
                <div className="bg-red-950/40 backdrop-blur-xl border border-red-500/50 p-6 rounded-2xl shadow-[0_0_80px_rgba(239,68,68,0.3)] flex items-center gap-6 animate-pulse">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_40px_rgba(239,68,68,0.6)]">
                        <Zap size={32} className="text-white fill-current" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Timeline Breach</h2>
                        <div className="space-y-1">
                            <p className="text-red-400 font-mono text-[10px] tracking-widest leading-relaxed uppercase">
                                Reality Rewrite Initiated by <span className="text-white font-black">{snapWinner.teamName}</span>
                            </p>
                            <p className="text-white/60 font-mono text-[9px] tracking-widest leading-relaxed uppercase animate-pulse">
                                Stabilize your timeline before the game timer expires.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === "idle") return null;

    return (
        <div className="fixed inset-0 z-[10000] overflow-hidden pointer-events-none">
            {/* PHASE 1: Build-up */}
            {phase === "buildup" && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="relative w-96 h-96">
                        <div className="absolute inset-0 bg-yellow-500/10 blur-[100px] animate-pulse rounded-full" />
                        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_50px_rgba(255,215,0,0.3)]">
                            <path d="M60 180 L50 140 L40 100 L45 60 L60 30 L80 20 L120 20 L140 30 L155 60 L160 100 L150 140 L140 180 Z" fill="#DAA520" opacity="0.1" stroke="#FFD700" strokeWidth="0.5" />

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
                                            className={isActive ? "animate-pulse" : ""}
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
                    <div className="mt-8 text-center space-y-2 relative z-10">
                        <p className="text-yellow-500 font-mono text-[10px] tracking-[0.6em] uppercase animate-pulse">Neural Synchronization 100%</p>
                        <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase [text-shadow:0_0_20px_rgba(255,255,255,0.2)]">Supreme Snap Imminent</h1>
                    </div>
                </div>
            )}

            {/* PHASE 2: The Snap (Intense White-out) */}
            {phase === "snap" && (
                <div className="absolute inset-0 bg-white z-[11000] flex items-center justify-center">
                    <div className="w-full h-full bg-white animate-[white-flash_0.8s_ease-out_forwards]" />
                    {/* Add a radial burst effect */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle,white_0%,transparent_70%)] animate-ping opacity-50" />
                    <style>
                        {`
                          @keyframes white-flash {
                            0% { opacity: 0; transform: scale(0.1); }
                            20% { opacity: 1; transform: scale(1); }
                            100% { opacity: 1; transform: scale(4); }
                          }
                        `}
                    </style>
                </div>
            )}

            {/* PHASE 3: Dissolve (Particles) */}
            {phase === "dissolve" && (
                <div className="absolute inset-0 bg-white z-[11000] animate-[fade-out-white_2s_ease-in_forwards]">
                    <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 200 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-slate-400"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animation: `particle-float ${2 + Math.random() * 3}s linear infinite`,
                                    opacity: Math.random(),
                                }}
                            />
                        ))}
                    </div>
                    <style>
                        {`
                          @keyframes fade-out-white {
                            0% { opacity: 1; }
                            100% { opacity: 0; }
                          }
                          @keyframes particle-float {
                            0% { transform: translateY(0) translateX(0); opacity: 0.8; }
                            100% { transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px); opacity: 0; }
                          }
                        `}
                    </style>
                </div>
            )}

            {/* PHASE 4: Victory Screen */}
            {phase === "victory" && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 fade-in duration-1000 pointer-events-auto">
                    <div className="relative mb-12">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-[120px] rounded-full animate-pulse" />
                        <Trophy size={140} className="text-yellow-500 relative z-10 drop-shadow-[0_0_60px_rgba(255,215,0,0.6)]" />
                        <div className="absolute -inset-4 border border-yellow-500/20 rounded-full animate-spin-slow" />
                    </div>

                    <div className="space-y-6 max-w-3xl">
                        <h1 className="text-6xl font-black italic tracking-tighter victory-text-gold uppercase leading-none drop-shadow-2xl">Absolute Victory</h1>
                        <p className="text-yellow-500/80 font-mono text-[10px] tracking-[0.6em] uppercase border-y border-yellow-500/20 py-4 inline-block">Universe Status: Restored</p>

                        <div className="mt-16 grid grid-cols-2 gap-12 max-w-xl mx-auto">
                            <div className="space-y-2 group">
                                <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Final Designation</p>
                                <p className="text-5xl font-black text-white italic group-hover:text-yellow-500 transition-colors">RANK #1</p>
                            </div>
                            <div className="space-y-2 group">
                                <p className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Team Authority</p>
                                <p className="text-5xl font-black text-white italic truncate group-hover:text-yellow-500 transition-colors">{snapWinner?.teamName || team?.name}</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-6 mt-16 animate-in slide-in-from-bottom-10 duration-1000 delay-500">
                            <p className="text-white/40 font-mono text-[9px] tracking-widest uppercase">The game will conclude for all teams when the temporal clock reaches zero.</p>
                            <button
                                onClick={() => window.location.href = "/dashboard"}
                                className="px-20 py-5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-black uppercase tracking-[0.4em] text-xs rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(234,179,8,0.3)]"
                            >
                                Return to Command Center
                            </button>
                        </div>
                    </div>

                    {/* HUD Flourish */}
                    <div className="absolute bottom-12 left-12 text-left opacity-20 font-mono space-y-2">
                        <p className="text-[10px] tracking-[0.4em] uppercase">Status: OMNIPOTENT</p>
                        <p className="text-[10px] tracking-[0.4em] uppercase">Timelines: CONVERGED</p>
                    </div>
                </div>
            )}
        </div>
    );
};
