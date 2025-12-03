import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
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

const App = () => (
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
            <Route path="/projetos" element={<Projects />} />
            <Route path="/projetos/:id" element={<ProjectDetails />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            {/* Auth route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin routes with AppLayout */}
            <Route path="/admin" element={<AppLayout><AdminDashboard /></AppLayout>} />
            <Route path="/admin/articles" element={<AppLayout><AdminArticles /></AppLayout>} />
            <Route path="/admin/articles/new" element={<AppLayout><AdminArticleEditor /></AppLayout>} />
            <Route path="/admin/articles/:id" element={<AppLayout><AdminArticleEditor /></AppLayout>} />
            <Route path="/admin/curator" element={<AppLayout><AdminCurator /></AppLayout>} />
            <Route path="/admin/categories" element={<AppLayout><AdminCategories /></AppLayout>} />
            <Route path="/admin/sources" element={<AppLayout><AdminSources /></AppLayout>} />
            <Route path="/admin/seo" element={<AppLayout><AdminSEOAnalytics /></AppLayout>} />
            <Route path="/admin/settings" element={<AppLayout><AdminSettings /></AppLayout>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
