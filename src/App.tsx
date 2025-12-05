import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SEOVerification } from "@/components/SEOVerification";
import { initWebVitals } from "@/lib/webVitals";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load other pages
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Tag = lazy(() => import("./pages/Tag"));
const Tags = lazy(() => import("./pages/Tags"));
const Topic = lazy(() => import("./pages/Topic"));
const PillarPage = lazy(() => import("./pages/PillarPage"));
const Guides = lazy(() => import("./pages/Guides"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminArticles = lazy(() => import("./pages/admin/Articles"));
const AdminArticleEditor = lazy(() => import("./pages/admin/ArticleEditor"));
const AdminCurator = lazy(() => import("./pages/admin/Curator"));
const AdminAutomation = lazy(() => import("./pages/admin/Automation"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminSources = lazy(() => import("./pages/admin/Sources"));
const AdminSEOAnalytics = lazy(() => import("./pages/admin/SEOAnalytics"));
const AdminPerformance = lazy(() => import("./pages/admin/Performance"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminSiteSettings = lazy(() => import("./pages/admin/SiteSettings"));
const AdminSubscribers = lazy(() => import("./pages/admin/Subscribers"));
const AdminMessages = lazy(() => import("./pages/admin/Messages"));
const AdminTopicClusters = lazy(() => import("./pages/admin/TopicClustersAdmin"));
const AdminPillarPages = lazy(() => import("./pages/admin/PillarPagesAdmin"));
const AdminGenerateArticle = lazy(() => import("./pages/admin/GenerateArticle"));
const AdminTags = lazy(() => import("./pages/admin/Tags"));
const AdminEducation = lazy(() => import("./pages/admin/EducationAdmin"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const Glossary = lazy(() => import("./pages/Glossary"));
const GlossaryTerm = lazy(() => import("./pages/GlossaryTerm"));
const CarbonCalculator = lazy(() => import("./pages/CarbonCalculator"));

// Educational pages
const Education = lazy(() => import("./pages/education/Education"));
const EducationCourse = lazy(() => import("./pages/education/Course"));
const EducationModule = lazy(() => import("./pages/education/Module"));
const EducationLesson = lazy(() => import("./pages/education/Lesson"));
const EducationQuiz = lazy(() => import("./pages/education/Quiz"));
const EducationLeaderboard = lazy(() => import("./pages/education/Leaderboard"));
const StudentDashboard = lazy(() => import("./pages/education/StudentDashboard"));
const EducationCertificate = lazy(() => import("./pages/education/Certificate"));

const queryClient = new QueryClient();

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-primary">Carregando...</div>
  </div>
);

const App = () => {
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
            <SEOVerification />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/sobre" element={<About />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/guias" element={<Guides />} />
                
                {/* SEO Routes */}
                <Route path="/tag/:slug" element={<Tag />} />
                <Route path="/tags" element={<Tags />} />
                <Route path="/topico/:slug" element={<Topic />} />
                <Route path="/guia/:slug" element={<PillarPage />} />
                
                {/* Legal Pages */}
                <Route path="/privacidade" element={<PrivacyPolicy />} />
                <Route path="/termos" element={<Terms />} />
                
                {/* Tools & Glossary */}
                <Route path="/glossario" element={<Glossary />} />
                <Route path="/glossario/:slug" element={<GlossaryTerm />} />
                <Route path="/calculadora-carbono" element={<CarbonCalculator />} />
                
                {/* Educational routes */}
                <Route path="/educacional" element={<Education />} />
                <Route path="/educacional/curso/:slug" element={<EducationCourse />} />
                <Route path="/educacional/modulo/:courseSlug/:moduleSlug" element={<EducationModule />} />
                <Route path="/educacional/licao/:courseSlug/:moduleSlug/:lessonSlug" element={<EducationLesson />} />
                <Route path="/educacional/quiz/:courseSlug/:moduleSlug" element={<EducationQuiz />} />
                <Route path="/educacional/certificado/:code" element={<EducationCertificate />} />
                <Route path="/educacional/ranking" element={<EducationLeaderboard />} />
                <Route path="/minha-conta" element={<StudentDashboard />} />
                
                {/* Auth routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
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
                <Route path="/admin/generate" element={
                  <ProtectedRoute requiredRole="editor">
                    <AppLayout><AdminGenerateArticle /></AppLayout>
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
                <Route path="/admin/automation" element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout><AdminAutomation /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/topics" element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout><AdminTopicClusters /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/pillar-pages" element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout><AdminPillarPages /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/categories" element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout><AdminCategories /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/tags" element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout><AdminTags /></AppLayout>
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
                <Route path="/admin/performance" element={
                  <ProtectedRoute requiredRole="editor">
                    <AppLayout><AdminPerformance /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout><AdminSettings /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/site-settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout><AdminSiteSettings /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/subscribers" element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout><AdminSubscribers /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/messages" element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout><AdminMessages /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/education" element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout><AdminEducation /></AppLayout>
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
