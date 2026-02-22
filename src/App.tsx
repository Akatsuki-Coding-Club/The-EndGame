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
import TimelinePortal from "./pages/TimelinePortal";
import MissionInterface from "./pages/MissionInterface";

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
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner
        position="top-right"
        toastOptions={{
          // This makes the toast compact (half-width feel)
          className: " rounded-none border-t-2 border-b-0 border-l-0 border-r-0 bg-slate-900/90 backdrop-blur-xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
          classNames: {
            title: "text-[10px] font-display font-bold tracking-[0.2em] uppercase",
            description: "text-[9px] font-body tracking-wider text-slate-400 mt-1 uppercase",
            // Specific energy colors for the top border
            error: "border-primary",   /* Stark Red */
            success: "border-blue-500", /* Arc Blue */
            info: "border-purple-500",  /* Power Purple */
          }
        }}
      />
      <BrowserRouter>
        {/* <ThemeDecorations /> */}
        <AuthProvider>
          <GameProvider>
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
