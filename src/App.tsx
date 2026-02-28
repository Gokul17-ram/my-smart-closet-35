import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WardrobeProvider } from "@/contexts/WardrobeContext";
import Dashboard from "./pages/Dashboard";
import Wardrobe from "./pages/Wardrobe";
import AddItem from "./pages/AddItem";
import WeeklyPlanner from "./pages/WeeklyPlanner";
import Laundry from "./pages/Laundry";
import Recommendations from "./pages/Recommendations";
import VirtualTryOn from "./pages/VirtualTryOn";
import History from "./pages/History";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/wardrobe" element={<ProtectedRoute><Wardrobe /></ProtectedRoute>} />
    <Route path="/add-item" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
    <Route path="/planner" element={<ProtectedRoute><WeeklyPlanner /></ProtectedRoute>} />
    <Route path="/laundry" element={<ProtectedRoute><Laundry /></ProtectedRoute>} />
    <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
    <Route path="/try-on" element={<ProtectedRoute><VirtualTryOn /></ProtectedRoute>} />
    <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <WardrobeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </WardrobeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
