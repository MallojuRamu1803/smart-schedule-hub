import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Faculty from "./pages/Faculty";
import FacultyMapping from "./pages/FacultyMapping";
import FacultyAvailability from "./pages/FacultyAvailability";
import Subjects from "./pages/Subjects";
import Rooms from "./pages/Rooms";
import TimeSlots from "./pages/TimeSlots";
import Timetables from "./pages/Timetables";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/departments" element={<ProtectedRoute adminOnly><Departments /></ProtectedRoute>} />
      <Route path="/faculty" element={<ProtectedRoute adminOnly><Faculty /></ProtectedRoute>} />
      <Route path="/faculty-mapping" element={<ProtectedRoute adminOnly><FacultyMapping /></ProtectedRoute>} />
      <Route path="/faculty-availability" element={<ProtectedRoute adminOnly><FacultyAvailability /></ProtectedRoute>} />
      <Route path="/subjects" element={<ProtectedRoute adminOnly><Subjects /></ProtectedRoute>} />
      <Route path="/rooms" element={<ProtectedRoute adminOnly><Rooms /></ProtectedRoute>} />
      <Route path="/time-slots" element={<ProtectedRoute adminOnly><TimeSlots /></ProtectedRoute>} />
      <Route path="/timetables" element={<ProtectedRoute><Timetables /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
