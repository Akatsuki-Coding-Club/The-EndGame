import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { teams } from "@/services/mockData";
import { Shield, Swords, ShieldCheck, ShieldOff } from "lucide-react";

const PowerStonesPanel = () => {
  const { stones, activateShield, deactivateShield, blockTeam, powersDisabled } = useGame();
  const [showBlockSelect, setShowBlockSelect] = useState(false);

  return (
    <div className="glass-card p-4 space-y-4">
      <h3 className="font-display font-bold text-sm uppercase tracking-widest text-secondary neon-text-purple">
        Power Stones
      </h3>

      {powersDisabled && (
        <p className="text-xs font-body text-destructive animate-neon-pulse">⚠ Powers disabled (last 20 min)</p>
      )}

      {/* Shield Stone */}
      <div className="glass-card p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-accent" size={18} />
            <span className="font-body text-sm font-semibold text-foreground">Shield</span>
          </div>
          <span className="text-xs font-display text-muted-foreground">×{stones.shieldCount}</span>
        </div>
        <p className="text-xs font-body text-muted-foreground">Protects from Block attacks</p>
        {stones.shieldActive ? (
          <button onClick={deactivateShield} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-accent/20 text-accent text-xs font-display font-bold uppercase tracking-wider hover:bg-accent/30 transition-colors">
            <ShieldCheck size={14} /> Shield Active — Deactivate
          </button>
        ) : (
          <button onClick={activateShield} disabled={stones.shieldCount <= 0 || powersDisabled} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-muted text-foreground text-xs font-display font-bold uppercase tracking-wider hover:bg-muted/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <ShieldOff size={14} /> Activate Shield
          </button>
        )}
      </div>

      {/* Block Stone */}
      <div className="glass-card p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="text-destructive" size={18} />
            <span className="font-body text-sm font-semibold text-foreground">Block</span>
          </div>
          <span className="text-xs font-display text-muted-foreground">×{stones.blockCount}</span>
        </div>
        <p className="text-xs font-body text-muted-foreground">Block a team for 2 minutes</p>

        {!showBlockSelect ? (
          <button onClick={() => setShowBlockSelect(true)} disabled={stones.blockCount <= 0 || powersDisabled} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-destructive/20 text-destructive text-xs font-display font-bold uppercase tracking-wider hover:bg-destructive/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Swords size={14} /> Use Block Stone
          </button>
        ) : (
          <div className="space-y-2 animate-fade-in">
            <p className="text-xs text-muted-foreground font-body">Select target team:</p>
            <div className="max-h-40 overflow-y-auto scrollbar-thin space-y-1">
              {teams.slice(0, 10).map(t => (
                <button key={t.id} onClick={() => { blockTeam(t.id); setShowBlockSelect(false); }} className="w-full text-left px-3 py-1.5 rounded text-xs font-body hover:bg-muted/50 text-foreground transition-colors">
                  {t.name}
                </button>
              ))}
            </div>
            <button onClick={() => setShowBlockSelect(false)} className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PowerStonesPanel;
