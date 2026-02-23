import React from "react";
import { Globe, Shield, Zap, Skull, Sparkles, Trophy, Brain, Flame, Eye, Clock } from "lucide-react";

export const STONE_PROPERTIES: Record<string, { label: string; color: string; glow: string; icon: React.ReactNode; image: string; desc: string; }> = {
    time: { label: "Time", color: "#34d399", glow: "rgba(52,211,153,0.5)", icon: <Clock size={22} />, image: "/time-stone.png", desc: "Instantly escape this timeline. Progress is saved — re-enter later with the Space Stone." },
    mind: { label: "Mind", color: "#fbbf24", glow: "rgba(251,191,36,0.5)", icon: <Brain size={22} />, image: "/mind_stone.png", desc: "Decrypts a substantial hint for the current objective." },
    space: { label: "Space", color: "#60a5fa", glow: "rgba(96,165,250,0.5)", icon: <Globe size={22} />, image: "/space-stone.png", desc: "Dimensional portal access — use from the Dashboard to re-enter escaped timelines." },
    power: { label: "Power", color: "#c084fc", glow: "rgba(192,132,252,0.5)", icon: <Flame size={22} />, image: "/power-stone.png", desc: "Launch an orbital strike on a rival team to impede their progress." },
    reality: { label: "Reality", color: "#f87171", glow: "rgba(248,113,113,0.5)", icon: <Eye size={22} />, image: "/reality-stone.png", desc: "Rewrite the laws of physics. Your next answer will be accepted as correct." },
    soul: { label: "Soul", color: "#fb923c", glow: "rgba(251,146,60,0.5)", icon: <Skull size={22} />, image: "/soul_stone.jpg", desc: "Sacrifice one of your earned stones to gain a massive point boost." },
};
