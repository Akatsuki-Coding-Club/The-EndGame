import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { GameProvider } from "@/context/GameContext";
import { TimerProvider } from "@/context/TimerContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import TeamLoginPage from "./pages/TeamLoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import RulesPage from "./pages/RulesPage";
import AdminDashboard from "./pages/AdminDashboard";
import LeaderboardPage from "./pages/LeaderboardPage";

const queryClient = new QueryClient();

/* Protected route wrapper */
const ProtectedRoute = ({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (admin && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (!admin && isAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<TeamLoginPage />} />
    <Route path="/admin-access" element={<AdminLoginPage />} />
    <Route path="/rules" element={<RulesPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    {/* <Route path="/admin" element={<ProtectedRoute admin><AdminPage /></ProtectedRoute>} /> */}
    <Route path="/leaderboard" element={<LeaderboardPage />} />
    <Route path="/admin" element={<AdminDashboard />} />
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
        <AuthProvider>
          <GameProvider>
            <TimerProvider>
              <AppRoutes />
            </TimerProvider>
          </GameProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
