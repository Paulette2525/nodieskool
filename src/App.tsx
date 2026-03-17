import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Community from "./pages/Community";
import Classroom from "./pages/Classroom";
import CourseDetail from "./pages/CourseDetail";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import CreateCommunity from "./pages/CreateCommunity";
import Pricing from "./pages/Pricing";
import CommunityFeed from "./pages/community/CommunityFeed";
import CommunityClassroom from "./pages/community/CommunityClassroom";
import CommunityAdmin from "./pages/community/CommunityAdmin";
import CommunityClassroomDetail from "./pages/community/CommunityClassroomDetail";
import Discover from "./pages/Discover";
import Contact from "./pages/Contact";
import Install from "./pages/Install";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-community" element={<CreateCommunity />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/install" element={<Install />} />
            
            {/* Community-scoped routes */}
            <Route path="/c/:slug" element={<CommunityFeed />} />
            <Route path="/c/:slug/community" element={<CommunityFeed />} />
            <Route path="/c/:slug/classroom" element={<CommunityClassroom />} />
            <Route path="/c/:slug/classroom/:id" element={<CommunityClassroomDetail />} />
            <Route path="/c/:slug/admin" element={<CommunityAdmin />} />
            
            {/* Auth and user routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Legacy routes */}
            <Route path="/community" element={<Community />} />
            <Route path="/classroom" element={<Classroom />} />
            <Route path="/classroom/:id" element={<CourseDetail />} />
            <Route path="/admin" element={<Admin />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
