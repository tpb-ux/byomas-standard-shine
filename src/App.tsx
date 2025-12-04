import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { initWebVitals } from "@/lib/webVitals";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminArticles from "./pages/admin/Articles";
import AdminArticleEditor from "./pages/admin/ArticleEditor";
import AdminCurator from "./pages/admin/Curator";
import AdminCategories from "./pages/admin/Categories";
import AdminSources from "./pages/admin/Sources";
import AdminSEOAnalytics from "./pages/admin/SEOAnalytics";
import AdminSettings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize Web Vitals monitoring after React mounts
  useEffect(() => {
    initWebVitals();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              
              {/* Auth route */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Admin routes - Protected */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="editor">
                  <AppLayout><AdminDashboard /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/articles" element={
                <ProtectedRoute requiredRole="editor">
                  <AppLayout><AdminArticles /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/articles/new" element={
                <ProtectedRoute requiredRole="editor">
                  <AppLayout><AdminArticleEditor /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/articles/:id" element={
                <ProtectedRoute requiredRole="editor">
                  <AppLayout><AdminArticleEditor /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/curator" element={
                <ProtectedRoute requiredRole="editor">
                  <AppLayout><AdminCurator /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout><AdminCategories /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/sources" element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout><AdminSources /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/seo" element={
                <ProtectedRoute requiredRole="editor">
                  <AppLayout><AdminSEOAnalytics /></AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRole="admin">
                  <AppLayout><AdminSettings /></AppLayout>
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
