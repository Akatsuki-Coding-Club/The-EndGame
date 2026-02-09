import React from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Zap, Snowflake, Users, Trophy } from "lucide-react";

const AdminPage = () => {
  const { allTeamsState, triggerBlip, freezeTeam, unfreezeTeam } = useGame();
  const { logout } = useAuth();

  const sorted = [...allTeamsState].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-secondary neon-text-purple text-lg tracking-wider">ADMIN CONSOLE</h1>
        </div>
        <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors">
          <LogOut size={18} />
        </button>
      </header>

      <main className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
        {/* Blip controls */}
        <div className="glass-card-glow p-6">
          <h2 className="font-display font-bold text-lg text-primary neon-text mb-4 tracking-wider">BLIP CONTROLS</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => triggerBlip(1)} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider neon-glow-btn text-sm">
              <Zap className="inline mr-2" size={16} /> Trigger Blip 1
            </button>
            <button onClick={() => triggerBlip(2)} className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-display font-bold uppercase tracking-wider neon-glow-btn text-sm">
              <Zap className="inline mr-2" size={16} /> Trigger Blip 2
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <Users className="mx-auto mb-2 text-primary" size={24} />
            <p className="text-2xl font-display font-bold text-foreground">{allTeamsState.length}</p>
            <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Teams</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Snowflake className="mx-auto mb-2 text-accent" size={24} />
            <p className="text-2xl font-display font-bold text-foreground">{allTeamsState.filter(t => t.isFrozen).length}</p>
            <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Frozen</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Trophy className="mx-auto mb-2 text-neon-pink" size={24} />
            <p className="text-2xl font-display font-bold text-foreground">{sorted[0]?.teamName || "-"}</p>
            <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Leader</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Zap className="mx-auto mb-2 text-secondary" size={24} />
            <p className="text-2xl font-display font-bold text-foreground">{sorted[0]?.score || 0}</p>
            <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Top Score</p>
          </div>
        </div>

        {/* Leaderboard table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-display font-bold text-primary neon-text tracking-wider">LIVE LEADERBOARD</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Team</th>
                  <th className="px-4 py-3 text-center">Level</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((team, i) => (
                  <tr key={team.teamId} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-display font-bold text-primary">#{i + 1}</td>
                    <td className="px-4 py-3 font-semibold">{team.teamName}</td>
                    <td className="px-4 py-3 text-center">{team.currentLevel}</td>
                    <td className="px-4 py-3 text-center text-accent font-semibold">{team.score}</td>
                    <td className="px-4 py-3 text-center">
                      {team.isFrozen && <span className="text-accent text-xs font-semibold">❄️ FROZEN</span>}
                      {team.isBlocked && <span className="text-destructive text-xs font-semibold">⛔ BLOCKED</span>}
                      {!team.isFrozen && !team.isBlocked && <span className="text-accent text-xs">● Active</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {team.isFrozen ? (
                        <button onClick={() => unfreezeTeam(team.teamId)} className="text-xs px-3 py-1 rounded bg-accent/20 text-accent hover:bg-accent/30 transition-colors">
                          Unfreeze
                        </button>
                      ) : (
                        <button onClick={() => freezeTeam(team.teamId)} className="text-xs px-3 py-1 rounded bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors">
                          Freeze
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
