import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShieldDefendModal() {
  const { showShieldOffer, pendingAttackerId, respondToAttack } = useGame();
  const [acting, setActing] = useState(false);

  if (!showShieldOffer) return null;

  const handle = async (action: "useShield" | "continue") => {
    if (acting) return;
    setActing(true);
    try {
      await respondToAttack(pendingAttackerId || "", action);
    } finally {
      setActing(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="border-primary/30 bg-slate-950 text-white sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideClose
      >
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold uppercase tracking-wider text-primary">
            Incoming Attack
          </DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm text-slate-400">
          You are being attacked by another team. Use your Shield to ignore the attack or continue the attack protocol.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => handle("useShield")}
            disabled={acting}
            className={cn(
              "flex flex-col items-center gap-3 rounded-lg border-2 border-blue-500/50 bg-blue-950/30 p-6",
              "hover:border-blue-500 hover:bg-blue-950/50 disabled:opacity-50 transition-all"
            )}
          >
            <Shield className="h-10 w-10 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Use Shield Stone
            </span>
            <span className="text-[10px] text-slate-500">
              Consume one Shield to ignore attack
            </span>
          </button>
          <button
            onClick={() => handle("continue")}
            disabled={acting}
            className={cn(
              "flex flex-col items-center gap-3 rounded-lg border-2 border-red-500/50 bg-red-950/30 p-6",
              "hover:border-red-500 hover:bg-red-950/50 disabled:opacity-50 transition-all"
            )}
          >
            <Zap className="h-10 w-10 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-300">
              Continue Attack
            </span>
            <span className="text-[10px] text-slate-500">Proceed with block protocol</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
