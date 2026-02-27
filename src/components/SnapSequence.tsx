import React, { useEffect, useState } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { Zap } from "lucide-react";
import { customToast } from "./ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import { STONE_PROPERTIES } from "@/lib/stoneConfig";
import { useSnap } from "@/services/api";

/**
 * EXACT COORDINATES FOR G.GLB (450px height)
 * Verified for central palm/knuckle alignment
 */
const STONE_POSITIONS: Record<string, { top: string; left: string }> = {
    soul: { top: "52%", left: "50%" },      // Palm Medallion
    power: { top: "28%", left: "42%" },     // Index Knuckle
    space: { top: "20%", left: "50%" },     // Middle Knuckle
    reality: { top: "28%", left: "58%" },   // Ring Knuckle
    time: { top: "42%", left: "35%" },      // Pinky (Left Side)
    mind: { top: "42%", left: "65%" },      // Thumb (Right Side)
};

const STONES_ORDER = ["space", "power", "reality", "mind", "time", "soul"] as const;

export const SnapSequence = () => {
    const { isSnapping, snapWinner, stones } = useGame();
    const { team, isAdmin } = useAuth();
    if (isAdmin) return null;

    const [phase, setPhase] = useState<"idle" | "intro" | "blackout" | "assembly" | "ready" | "buildup" | "snap" | "dissolve" | "rival-snap" | "rival-snap-close">("idle");
    const [assembledStones, setAssembledStones] = useState<string[]>([]);
    const [hasPlayedRivalSnap, setHasPlayedRivalSnap] = useState(false);
    const [toastFired, setToastFired] = useState(false);

    // Get owned stones safely
    const ownedStones = stones?.ownedStones || [];
    const hasAllStones = ["time", "mind", "space", "power", "reality", "soul"].every(s => ownedStones.includes(s));
    const alreadySnapped = team?.snapActivated;

    // Trigger Logic
    useEffect(() => {
        if (isAdmin) return;

        if (hasAllStones && !alreadySnapped && phase === "idle" && !isSnapping) {
            setAssembledStones([]);
            setPhase("intro");
            setTimeout(() => setPhase("blackout"), 1000);
        } else if (isSnapping && (phase === "idle" || phase === "ready")) {
            setPhase("buildup");
        } else if (snapWinner && snapWinner.teamId !== team?._id && phase === "idle" && !hasPlayedRivalSnap) {
            setHasPlayedRivalSnap(true);
            setPhase("rival-snap");
            setTimeout(() => setPhase("rival-snap-close"), 6000);
        }
    }, [isSnapping, phase, snapWinner, team?._id, hasPlayedRivalSnap, isAdmin, hasAllStones, alreadySnapped]);

    // Phase Sequencing
    useEffect(() => {
        if (phase === "blackout") {
            const timer = setTimeout(() => setPhase("assembly"), 3000);
            return () => clearTimeout(timer);
        }

        if (phase === "assembly") {
            const sequence = ["space", "power", "reality", "mind", "time", "soul"];
            sequence.forEach((stone, i) => {
                setTimeout(() => {
                    setAssembledStones(prev => [...new Set([...prev, stone])]);
                    if (i === sequence.length - 1) {
                        setTimeout(() => setPhase("ready"), 1500);
                    }
                }, i * 900);
            });
        }

        if (phase === "buildup") {
            setTimeout(() => setPhase("snap"), 2000);
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

    const handleExecuteSnap = async () => {
        try {
            await useSnap();
            customToast.success("REALITY REWRITTEN", { description: "The Snap has been executed." });
        } catch (err: any) {
            customToast.error("Snap Failed", { description: err.message || "Failed to execute snap." });
        }
    };

    if (phase === "idle") return null;

    return (
        <div className="fixed inset-0 z-[20000] overflow-hidden bg-black flex items-center justify-center">
            {/* 1. INTRO: Static Gauntlet (1s) */}
            {phase === "intro" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl h-[450px]">
                    <model-viewer
                        src="/model/G.glb"
                        environment-image="neutral" exposure="1.4"
                        style={{ width: '100%', height: '100%', outline: 'none' }}
                    />
                </motion.div>
            )}

            {/* 2. BLACKOUT (3s) */}
            {phase === "blackout" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black z-50 flex items-center justify-center">
                    <span className="text-white/5 text-[10px] tracking-[2em] uppercase">Initializing Resonance...</span>
                </motion.div>
            )}

            {/* 3. ASSEMBLY PHASE: Stones materialized at exact knuckle positions */}
            {phase === "assembly" && (
                <div className="relative w-full max-w-2xl h-[450px] pointer-events-none">
                    {Object.entries(STONE_POSITIONS).map(([stoneId, pos]) => {
                        if (!assembledStones.includes(stoneId)) return null;
                        const cfg = STONE_PROPERTIES[stoneId];
                        return (
                            <motion.div
                                key={stoneId}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="absolute -translate-x-1/2 -translate-y-1/2"
                                style={{ top: pos.top, left: pos.left, zIndex: 100 }}
                            >
                                <img
                                    src={cfg.image}
                                    alt={stoneId}
                                    className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                />
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* 4. READY PHASE: Model appears, Stones disappear */}
            {phase === "ready" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center w-full h-full p-12">
                    <div className="w-full max-w-2xl h-[450px]">
                        <model-viewer
                            src="/model/G.glb"
                            environment-image="neutral" exposure="1.4"
                            style={{ width: '100%', height: '100%', outline: 'none' }}
                        />
                    </div>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center space-y-8 mt-8">
                        <div className="space-y-4">
                            <p className="text-white/40 text-[10px] tracking-[0.6em] uppercase animate-pulse">Gauntlet Integrity Confirmed</p>
                            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">Ready for Snap</h2>
                        </div>
                        <button onClick={handleExecuteSnap} className="group relative px-16 py-8 bg-white/5 border border-white/20 rounded-full transition-all active:scale-95 hover:border-white/50 overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <div className="flex items-center gap-6 relative z-10">
                                <Zap size={24} className="text-white animate-pulse" />
                                <span className="text-2xl font-black tracking-[0.4em] text-white uppercase">Execute Snap</span>
                            </div>
                        </button>
                    </motion.div>
                </motion.div>
            )}

            {/* ACTION PHASES */}
            {phase === "buildup" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black flex items-center justify-center z-[21000]">
                    <h1 className="text-4xl font-black italic text-white uppercase animate-pulse tracking-widest">Snap Imminent</h1>
                </motion.div>
            )}
            {phase === "snap" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-white z-[22000]" />
            )}
            {phase === "dissolve" && (
                <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 2 }} className="absolute inset-0 bg-white z-[22000] flex items-center justify-center">
                    <div className="absolute inset-0 opacity-50">
                        {Array.from({ length: 100 }).map((_, i) => <div key={i} className="absolute w-1 h-1 bg-gray-400 rounded-full" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} />)}
                    </div>
                </motion.div>
            )}

            {/* RIVAL SNAPS */}
            {phase === "rival-snap" && (
                <motion.div initial={{ opacity: 1 }} className="absolute inset-0 bg-white z-[21000]" />
            )}
            {phase === "rival-snap-close" && (
                <motion.div initial={{ opacity: 1 }} className="absolute inset-0 z-[21000] flex items-center justify-center">
                    <div className="w-full h-full bg-white animate-[tv-close_0.5s_forwards]" />
                    <style>{`@keyframes tv-close { 0% { transform: scale(1,1); } 50% { transform: scale(1,0.01); } 100% { transform: scale(0,0); } }`}</style>
                </motion.div>
            )}
        </div>
    );
};
