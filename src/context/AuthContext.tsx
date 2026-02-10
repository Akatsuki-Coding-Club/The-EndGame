import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { teams, adminCredentials, Team } from "@/services/mockData";

interface AuthState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  team: Team | null;
  login: (id: string, password: string) => boolean;
  adminLogin: (id: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = useCallback((id: string, password: string): boolean => {
    const found = teams.find(t => t.id === id && t.password === password);
    if (found) { setTeam(found); setIsAdmin(false); return true; }
    return false;
  }, []);

  const adminLogin = useCallback((id: string, password: string): boolean => {
    if (id === adminCredentials.id && password === adminCredentials.password) {
      setIsAdmin(true);
      setTeam(null);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => { setTeam(null); setIsAdmin(false); }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!team || isAdmin, isAdmin, team, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
