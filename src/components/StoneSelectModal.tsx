import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";


export default function StoneSelectModal() {
  const { isAdmin } = useAuth();
  const { pendingStoneCount, selectStoneType } = useGame();
  const [selecting, setSelecting] = useState(false);

  const open = !isAdmin && pendingStoneCount > 0;

  const handleSelect = async (stoneType: "block" | "shield") => {
    if (selecting) return;
    setSelecting(true);
    try {
      await selectStoneType(stoneType);
    } finally {
      setSelecting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="border-primary/30 bg-slate-950 text-white sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideClose
      >
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold uppercase tracking-wider text-primary">
            Infinity Stone Acquired
          </DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm text-slate-400">
          You&apos;ve earned an Infinity Stone! Choose one to add to your arsenal:
        </p>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => handleSelect("shield")}
            disabled={selecting}
            className={cn(
              "flex flex-col items-center gap-3 rounded-lg border-2 border-blue-500/50 bg-blue-950/30 p-6",
              "hover:border-blue-500 hover:bg-blue-950/50 disabled:opacity-50 transition-all"
            )}
          >
            <Shield className="h-10 w-10 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Shield Matrix
            </span>
            <span className="text-[10px] text-slate-500">
              Block incoming attacks
            </span>
          </button>
          <button
            onClick={() => handleSelect("block")}
            disabled={selecting}
            className={cn(
              "flex flex-col items-center gap-3 rounded-lg border-2 border-red-500/50 bg-red-950/30 p-6",
              "hover:border-red-500 hover:bg-red-950/50 disabled:opacity-50 transition-all"
            )}
          >
            <Zap className="h-10 w-10 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-300">
              Power Surge
            </span>
            <span className="text-[10px] text-slate-500">
              Lock a rival team
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
