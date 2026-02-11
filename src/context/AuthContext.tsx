import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import * as api from "@/services/api";

export interface Team {
  id: string;
  name: string;
  role?: string;
  score?: number;
}

interface AuthState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  team: Team | null;
  loading: boolean;
  login: (teamName: string, password: string) => Promise<boolean>;
  adminLogin: (teamName: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function toTeam(t: { _id: string; teamName: string; role?: string; score?: number }): Team {
  return {
    id: t._id,
    name: t.teamName,
    role: t.role,
    score: t.score,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    api.clearAuth();
    setTeam(null);
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    if (!api.getToken()) {
      setLoading(false);
      return;
    }
    api
      .getMe()
      .then((me) => {
        setTeam(toTeam(me));
        setIsAdmin(me.role === "admin");
      })
      .catch(() => {
        api.clearAuth();
        setTeam(null);
        setIsAdmin(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (teamName: string, password: string): Promise<boolean> => {
    try {
      const { team: t } = await api.login(teamName, password);
      const next = toTeam(t);
      setTeam(next);
      setIsAdmin(t.role === "admin");
      return true;
    } catch {
      return false;
    }
  }, []);

  const adminLogin = useCallback(async (teamName: string, password: string): Promise<boolean> => {
    try {
      const { team: t } = await api.login(teamName, password);
      if (t.role !== "admin") {
        api.clearAuth();
        return false;
      }
      setTeam(toTeam(t));
      setIsAdmin(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!team || isAdmin,
        isAdmin,
        team,
        loading,
        login,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
