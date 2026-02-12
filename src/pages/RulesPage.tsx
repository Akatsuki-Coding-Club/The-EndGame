import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Zap, Skull, Lock, Info, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/services/api";

const RulesPage = () => {
    const navigate = useNavigate();
    const { gameStarted } = useGame();
    const { team } = useAuth();
    const [registeredTeams, setRegisteredTeams] = useState<string[]>([]);

    useEffect(() => {
        const fetchRegisteredTeams = async () => {
            try {
                const teams = await api.getRegisteredTeams();
                console.log("Fetched registered teams:", teams);
                
                // teams is already an array of team._id
                if (Array.isArray(teams)) {
                    setRegisteredTeams(teams);
                } else {
                    setRegisteredTeams([]);
                }
            } catch (error) {
                console.error("Failed to fetch registered teams:", error);
                setRegisteredTeams([]);
            }
        };

        fetchRegisteredTeams();
    }, []);

    const handleEnterWarzone = () => {
        console.log("Enter Warzone clicked");
        console.log("Game Started:", gameStarted);
        console.log("Current Team:", team);
        console.log("Registered Teams:", registeredTeams);

        if (!gameStarted) {
            toast.error("Round not started", {
            description: "Wait for the round to be started",
            // Custom styling to halve the height and add cinematic flair
            className: "h-12 min-h-0 flex items-center bg-slate-950/90 border border-red-500/30 rounded-none shadow-[0_0_15px_rgba(255,0,0,0.1)] p-0",
            classNames: {
                title: "text-[10px] font-bold tracking-[0.2em] text-red-500 font-display pl-4",
                description: "text-[8px] tracking-widest text-red-700 font-mono pl-4",
                toast: "group",
            },
            duration: 3000,
            });
            return;
        }

        // Check if current team is registered in the game
        const teamRegistered = team && Array.isArray(registeredTeams) && registeredTeams.includes(team.id);
        console.log("Team Registered Check:", teamRegistered, "Team ID:", team?.id);
        
        if (!teamRegistered) {
            toast.error("TEAM_NOT_REGISTERED", {
            description: "Team is not registered. Contact the administrator.",
            className: "h-12 min-h-0 flex items-center bg-slate-950/90 border border-red-500/30 rounded-none shadow-[0_0_15px_rgba(255,0,0,0.1)] p-0",
            classNames: {
                title: "text-[10px] font-bold tracking-[0.2em] text-red-500 font-display pl-4",
                description: "text-[8px] tracking-widest text-red-700 font-mono pl-4",
                toast: "group",
            },
            duration: 3000,
            });
            return;
        }

        console.log("All checks passed, navigating to dashboard");
        toast.success("NEURAL_SYNC_COMPLETE", {
            description: "WARZONE_ENTRY_GRANTED",
            className: "h-12 min-h-0 flex items-center bg-slate-950/90 border border-blue-500/30 rounded-none shadow-[0_0_15px_rgba(0,186,255,0.1)] p-0",
            classNames: {
            title: "text-[10px] font-bold tracking-[0.2em] text-blue-400 font-display pl-4",
            description: "text-[8px] tracking-widest text-blue-600 font-mono pl-4",
            },
        });
    
        navigate("/dashboard");
    };
    const rules = [
        {
            id: "01",
            title: "Mission First Always",
            desc: "Solve missions to earn points — each mission can be submitted only once.",
            icon: <Info className="text-red-500" size={20} />,
        },
        {
            id: "02",
            title: "Stones Are Limited",
            desc: "Unlock at 300 and 600 points; maximum two Infinity Stones per team.",
            icon: <Zap className="text-red-500" size={20} />,
        },
        {
            id: "03",
            title: "Power Stone Blocks",
            desc: "Enemies can block your editor for 120 seconds unless you solve the unlock puzzle.",
            icon: <Lock className="text-red-500" size={20} />,
        },
        {
            id: "04",
            title: "Shield Saves Once",
            desc: "Shield blocks one stone attack automatically, then gets consumed.",
            icon: <Shield className="text-red-500" size={20} />,
        },
        {
            id: "05",
            title: "Blip Freezes Teams",
            desc: "The Blip freezes teams in two phases; frozen teams can only solve the Blip puzzle.",
            icon: <Skull className="text-red-500" size={20} />,
        },
        {
            id: "06",
            title: "Final Lockdown Phase",
            desc: "Last 15 minutes disable all stones — only mission solving counts.",
            icon: <Play className="text-red-500" size={20} />,
        },
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen  bg-[#1e293b] text-foreground  p-6 flex flex-col items-center justify-center">

                {/* HUD Header */}
                <div className="w-full max-w-4xl mb-10 flex items-end justify-between border-b border-primary/30 pb-4">
                    <div>
                        <h2 className="text-[10px] tracking-[0.5em] text-red-500 font-bold uppercase opacity-60">System Ready</h2>
                        <h1 className="text-4xl font-bold tracking-tighter neon-text">ENGAGEMENT RULES</h1>
                    </div>
                </div>

                {/* Rules Grid */}
                <div className="grid grid-cols-1 bg-[#1e293b] md:grid-cols-2 gap-4 w-full max-w-4xl">
                    {rules.map((rule, index) => (
                        <div
                            key={rule.id}
                            className="group glass-card p-6 bg-[#1e293b] border-l-2 border-primary/20 hover:border-primary transition-all duration-300 animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-start gap-4">
                                <span className="text-[10px] font-mono text-red-500/40 font-bold">{rule.id}</span>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {rule.icon}
                                        <h3 className="text-sm font-bold tracking-widest uppercase text-red-500/90">{rule.title}</h3>
                                    </div>
                                    <p className="text-xs font-body text-muted-foreground leading-relaxed">
                                        {rule.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Footer */}
                <div className="mt-12 text-center space-y-6">
                    
                    <button
                        onClick={handleEnterWarzone}
                        className="group relative px-12 py-4 bg-[#a34231] text-white font-bold text-sm uppercase tracking-[0.4em] overflow-hidden transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,0,0,0.3)]"
                    >
                        <span className="relative z-10">Enter Warzone</span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                </div>

                {/* Background HUD Decor */}
                <div className="fixed top-10 left-10 w-32 h-32 border-l border-t border-primary/20 pointer-events-none" />
                <div className="fixed bottom-10 right-10 w-32 h-32 border-r border-b border-primary/20 pointer-events-none" />
            </div>
        </>
    );
};

export default RulesPage;