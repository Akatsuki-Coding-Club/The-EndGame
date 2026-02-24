import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { GameProvider, useGame } from "@/context/GameContext";
import { TimerProvider } from "@/context/TimerContext";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import TeamLoginPage from "./pages/TeamLoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import RulesPage from "./pages/RulesPage";
import AdminDashboard from "./pages/AdminDashboard";
import LeaderboardPage from "./pages/LeaderboardPage";
// import ThemeDecorations from "./components/ThemeDecorations";
import Landing from "./pages/Landing";
import StoneSelectModal from "./components/StoneSelectModal";
import MissionInterface from "./pages/MissionInterface";
import HeroManager from "./components/HeroManager";
import GameCompletion from "./pages/GameCompletion";
import BlipOverlay from "./components/BlipOverlay";
import AttackOverlay from "./components/AttackOverlay";

const queryClient = new QueryClient();

/* Protected route wrapper */
const ProtectedRoute = ({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  const { gameStarted, gameEnded } = useGame();

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (admin && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (!admin && isAdmin) return <Navigate to="/admin" replace />;

  // 🔒 Game Gatekeeper: block non-admin teams from warzone until Commander starts the game
  // BUT allow access to /concluded page when game has ended
  if (!admin && !isAdmin && !gameStarted && !gameEnded) return <Navigate to="/rules" replace />;

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<TeamLoginPage />} />
    <Route path="/admin" element={<AdminLoginPage />} />
    <Route path="/rules" element={<RulesPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/leaderboard" element={<LeaderboardPage />} />
    <Route path="/admin/dashboard" element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>} />
    <Route path="/mission/:timelineId" element={<ProtectedRoute><MissionInterface /></ProtectedRoute>} />
    <Route path="/mission/:timelineId" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/concluded" element={<ProtectedRoute><GameCompletion /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const GlobalOverlays = () => {
  const { isFrozen, isBlocked } = useGame();
  return (
    <>
      {isFrozen && <BlipOverlay />}
      {isBlocked && <AttackOverlay />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner
        position="top-right"
        toastOptions={{
          className: "backdrop-blur-2xl bg-gradient-to-r from-slate-900/40 to-slate-900/20 border border-white/10 rounded-lg p-4 shadow-2xl",
          classNames: {
            title: "text-sm font-mono font-bold tracking-wider text-slate-100 uppercase",
            description: "text-xs font-mono tracking-wide text-slate-300 mt-2 opacity-90",
            error: "border-l-4 border-l-red-500 from-red-950/30 to-slate-900/20 text-red-400",
            success: "border-l-4 border-l-green-500 from-green-950/30 to-slate-900/20 text-green-400",
            toast: "group",
          }
        }}
      />
      <BrowserRouter>
        {/* <ThemeDecorations /> */}
        <HeroManager />
        <AuthProvider>
          <GameProvider>
            <GlobalOverlays />
            <TimerProvider>
              <AppRoutes />
            </TimerProvider>
            <StoneSelectModal />
          </GameProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
