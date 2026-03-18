import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { InstallBanner } from "./components/pwa/InstallBanner";

// Eagerly loaded (critical path)
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";

// Lazy loaded
const Landing = lazy(() => import("./pages/Landing"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Community = lazy(() => import("./pages/Community"));
const Classroom = lazy(() => import("./pages/Classroom"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CreateCommunity = lazy(() => import("./pages/CreateCommunity"));
const Pricing = lazy(() => import("./pages/Pricing"));
const CommunityFeed = lazy(() => import("./pages/community/CommunityFeed"));
const CommunityClassroom = lazy(() => import("./pages/community/CommunityClassroom"));
const CommunityAdmin = lazy(() => import("./pages/community/CommunityAdmin"));
const CommunityClassroomDetail = lazy(() => import("./pages/community/CommunityClassroomDetail"));
const Discover = lazy(() => import("./pages/Discover"));
const Contact = lazy(() => import("./pages/Contact"));
const Install = lazy(() => import("./pages/Install"));
const CommunityEvents = lazy(() => import("./pages/community/CommunityEvents"));
const CommunityMessages = lazy(() => import("./pages/community/CommunityMessages"));



const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallBanner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/c/:slug/events" element={<CommunityEvents />} />
              <Route path="/c/:slug/messages" element={<CommunityMessages />} />
              
              
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
