import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import * as api from "@/services/api";

export interface Team {
  id: string;
  _id: string; // alias for id
  name: string;
  role?: string;
  score?: number;
  snapActivated?: boolean;
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

function toTeam(t: any): Team {
  return {
    id: t._id,
    _id: t._id,
    name: t.teamName,
    role: t.role,
    score: t.score,
    snapActivated: t.snapActivated,
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
    const initAuth = async () => {
      const token = api.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await api.getMe();
        if (me) {
          setTeam(toTeam(me));
          setIsAdmin(me.role === "admin");
        }
      } catch {
        api.clearAuth();
        setTeam(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (teamName: string, password: string): Promise<boolean> => {
    try {
      const { team: t } = await api.login(teamName, password);
      setTeam(toTeam(t));
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
        isLoggedIn: !!team,
        isAdmin,
        team,
        loading,
        login,
        adminLogin,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};