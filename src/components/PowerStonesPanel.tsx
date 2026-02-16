import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Shield, Swords, ShieldCheck, ShieldOff, ZapOff, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const PowerStonesPanel = () => {
  const { stones, activateShield, deactivateShield, blockTeam, powersDisabled, allTeamsState } = useGame();
  const [showBlockSelect, setShowBlockSelect] = useState(false);
  const teamsForBlock = allTeamsState.filter((t) => t.teamId !== "current").slice(0, 15);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center gap-2 border-b border-primary/20 pb-4">
        <Activity className="text-primary animate-pulse" size={16} />
        <h3 className="font-bold text-[10px] uppercase tracking-[0.4em] text-primary/80">
          Infinity Forge
        </h3>
      </div>

      {powersDisabled && (
        <div className="bg-primary/10 border border-primary p-3 animate-neon-pulse">
          <p className="text-[10px] font-bold text-primary text-center tracking-widest uppercase">
            ⚠️ FINAL LOCKDOWN: POWERS OFFLINE
          </p>
        </div>
      )}

      {/* SHIELD STONE - MARK 85 STYLE */}
      <div className={cn(
        "glass-card p-5 border-t-2 relative transition-all duration-500",
        stones.shieldActive ? "border-primary shadow-[0_0_20px_rgba(255,0,0,0.2)]" : "border-white/10"
      )}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-1">Shield Matrix</h4>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Auto-Defense Protocol</p>
          </div>
          <div className="px-2 py-1 bg-black border border-primary/30 text-[10px] text-primary font-mono">
            ×{stones.shieldCount}
          </div>
        </div>

        {/* Energy Bar Decor */}
        <div className="h-1 w-full bg-white/5 mb-6 overflow-hidden">
          <div className={cn(
            "h-full bg-primary transition-all duration-1000",
            stones.shieldActive ? "w-full animate-pulse" : "w-0"
          )} />
        </div>

        <div className="w-full py-3 border border-primary/10 text-primary/60 text-[10px] font-bold uppercase tracking-[0.2em] text-center">
          Shield stones are auto-used when attacked. Count shown above.
        </div>
      </div>

      {/* BLOCK STONE - MARK 85 STYLE */}
      <div className="glass-card p-5 border-t-2 border-white/10 relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-1">Power Surge</h4>
            <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Offensive Neural Block</p>
          </div>
          <div className="px-2 py-1 bg-black border border-primary/30 text-[10px] text-primary font-mono">
            ×{stones.blockCount}
          </div>
        </div>

        {!showBlockSelect ? (
          <button 
            onClick={() => setShowBlockSelect(true)} 
            disabled={stones.blockCount <= 0 || powersDisabled}
            className="w-full py-3 border border-primary text-primary text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-20"
          >
            <div className="flex items-center justify-center gap-2">
              <Swords size={14} /> Execute Block
            </div>
          </button>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <div className="max-h-48 overflow-y-auto scrollbar-thin space-y-1 bg-black/40 p-2 border border-white/5">
              {teamsForBlock.map((t) => (
                <button
                  key={t.teamId}
                  onClick={() => {
                    blockTeam(t.teamId);
                    setShowBlockSelect(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[10px] font-bold tracking-widest hover:bg-primary hover:text-white transition-colors uppercase border border-transparent hover:border-primary"
                >
                  {t.teamName}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowBlockSelect(false)} 
              className="w-full py-2 text-[8px] text-primary/60 uppercase font-bold hover:text-primary"
            >
              Abort Selection
            </button>
          </div>
        )}
      </div>

      {/* Footer System Specs */}
      <div className="pt-6 border-t border-primary/10 text-[8px] text-primary/30 font-mono space-y-1">
        <p>INTEGRITY: 100%</p>
        <p>FORGE_STATUS: CONNECTED</p>
      </div>
    </div>
  );
};

export default PowerStonesPanel;