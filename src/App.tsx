import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WardrobeProvider } from "@/contexts/WardrobeContext";
import Dashboard from "./pages/Dashboard";
import Wardrobe from "./pages/Wardrobe";
import AddItem from "./pages/AddItem";
import WeeklyPlanner from "./pages/WeeklyPlanner";
import Laundry from "./pages/Laundry";
import Recommendations from "./pages/Recommendations";
import VirtualTryOn from "./pages/VirtualTryOn";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WardrobeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/wardrobe" element={<Wardrobe />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/planner" element={<WeeklyPlanner />} />
            <Route path="/laundry" element={<Laundry />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/try-on" element={<VirtualTryOn />} />
            <Route path="/history" element={<History />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WardrobeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
