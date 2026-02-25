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
import CompletionPage from "./pages/CompletionPage";
import MissionInterface from "./pages/MissionInterface";


import GameCompletion from "./pages/GameCompletion";

import BlipOverlay from "./components/BlipOverlay";
import AttackOverlay from "./components/AttackOverlay";
import { SnapSequence } from "./components/SnapSequence";

const queryClient = new QueryClient();

/* Protected route wrapper */
const ProtectedRoute = ({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  const { gameStarted } = useGame();

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (admin && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (!admin && isAdmin) return <Navigate to="/admin" replace />;

  // 🔒 Game Gatekeeper: block non-admin teams from warzone until Commander starts the game
  if (!admin && !isAdmin && !gameStarted) return <Navigate to="/rules" replace />;

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
    <Route path="/completion" element={<CompletionPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const GlobalOverlays = () => {
  const { isFrozen, isBlocked } = useGame();
  return (
    <>
      {isFrozen && <BlipOverlay />}
      {isBlocked && <AttackOverlay />}
      <SnapSequence />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner
        position="top-right"
        theme="dark"
        richColors
        offset={8}
        toastOptions={{
          className: "font-sans",
          classNames: {
            title: "text-[11px] font-bold tracking-[0.15em] uppercase",
            description: "text-[10px] font-sans tracking-wider opacity-90 mt-0.5 uppercase",
          },
        }}
      />
      <BrowserRouter>
        {/* <ThemeDecorations /> */}

        <AuthProvider>
          <GameProvider>
            <TimerProvider>
              <AppRoutes />
            </TimerProvider>
            <GlobalOverlays />
            <StoneSelectModal />
          </GameProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
