import React, { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { Trophy, Zap } from "lucide-react";
import { customToast } from "./ToastProvider";

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
    const { team, isAdmin } = useAuth();
    if (isAdmin) return null;

    const [phase, setPhase] = useState<"idle" | "buildup" | "snap" | "dissolve" | "rival-snap" | "rival-snap-close">("idle");
    const [activeStoneIndex, setActiveStoneIndex] = useState(-1);
    const [hasPlayedRivalSnap, setHasPlayedRivalSnap] = useState(false);
    const [toastFired, setToastFired] = useState(false);

    useEffect(() => {
        if (isAdmin) return;
        if (isSnapping && phase === "idle") {
            setPhase("buildup");
        } else if (snapWinner && snapWinner.teamId !== team?._id && phase === "idle" && !hasPlayedRivalSnap) {
            // Rival snap detected - show a brief white flash before the notification
            setHasPlayedRivalSnap(true);
            setPhase("rival-snap");
            setTimeout(() => setPhase("rival-snap-close"), 6000); // 6 sec white screen for rival teams
        }
    }, [isSnapping, phase, snapWinner, team?._id, hasPlayedRivalSnap, isAdmin]);

    // const isOtherTeamSnap = snapWinner && snapWinner.teamId !== team?._id;

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
            setTimeout(() => setPhase("idle"), 3000);
        }

        if (phase === "rival-snap-close") {
            setTimeout(() => setPhase("idle"), 500);
        }
    }, [phase]);

    useEffect(() => {
        if (!snapWinner || toastFired || isSnapping) return;

        const isRival = snapWinner.teamId !== team?._id;

        if (phase === "idle") {
            if (!isRival || hasPlayedRivalSnap) {
                setToastFired(true);
                customToast.error("Snap effect activated.", { description: "Use of stones is not allowed anymore." });
            }
        }
    }, [snapWinner, toastFired, isSnapping, phase, team?._id, hasPlayedRivalSnap]);



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
                        <p className="text-yellow-500 font-sans text-[10px] tracking-[0.6em] uppercase animate-pulse">Neural Synchronization 100%</p>
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

            {/* PHASE 4: Rival Snap (Long White-out) */}
            {phase === "rival-snap" && (
                <div className="absolute inset-0 bg-white z-[11000] flex items-center justify-center animate-in fade-in duration-500">
                    <div className="w-full h-full bg-white" />
                </div>
            )}

            {/* PHASE 5: Rival Snap Close (TV Close Animation) */}
            {phase === "rival-snap-close" && (
                <div className="absolute inset-0 z-[11000] flex items-center justify-center origin-center">
                    <div className="w-full h-full bg-white animate-[tv-close_0.5s_cubic-bezier(0.23,1,0.32,1)_forwards]" />
                    <style>
                        {`
                          @keyframes tv-close {
                            0% { transform: scale(1, 1); opacity: 1; }
                            50% { transform: scale(1, 0.01); opacity: 1; }
                            100% { transform: scale(0, 0); opacity: 0; }
                          }
                        `}
                    </style>
                </div>
            )}

        </div>
    );
};
