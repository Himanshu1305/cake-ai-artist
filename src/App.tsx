import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CookieConsent } from "@/components/CookieConsent";
import { GeoRedirectWrapper } from "@/components/GeoRedirectWrapper";
import { GeoProvider } from "@/contexts/GeoContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import { OrganizationSchema, WebSiteSchema } from "@/components/SEOSchema";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

// Route-level code splitting: keep the homepage in the main bundle for fast LCP,
// load every other route on demand to dramatically shrink the initial JS payload.
const About = lazyWithRetry(() => import("./pages/About"));
const Privacy = lazyWithRetry(() => import("./pages/Privacy"));
const Advertising = lazyWithRetry(() => import("./pages/Advertising"));
const Auth = lazyWithRetry(() => import("./pages/Auth"));
const Gallery = lazyWithRetry(() => import("./pages/Gallery"));
const CommunityGallery = lazyWithRetry(() => import("./pages/CommunityGallery"));
const Terms = lazyWithRetry(() => import("./pages/Terms"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const FAQ = lazyWithRetry(() => import("./pages/FAQ"));
const Pricing = lazyWithRetry(() => import("./pages/Pricing"));
const HowItWorks = lazyWithRetry(() => import("./pages/HowItWorks"));
const UseCases = lazyWithRetry(() => import("./pages/UseCases"));
const Blog = lazyWithRetry(() => import("./pages/Blog"));
const BlogPost = lazyWithRetry(() => import("./pages/BlogPost"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const AdminLogoGenerator = lazyWithRetry(() => import("./pages/AdminLogoGenerator"));
const AdminBlogAnalytics = lazyWithRetry(() => import("./pages/AdminBlogAnalytics"));
const UKLanding = lazyWithRetry(() => import("./pages/UKLanding"));
const CanadaLanding = lazyWithRetry(() => import("./pages/CanadaLanding"));
const AustraliaLanding = lazyWithRetry(() => import("./pages/AustraliaLanding"));
const IndiaLanding = lazyWithRetry(() => import("./pages/IndiaLanding"));
const USALanding = lazyWithRetry(() => import("./pages/USALanding"));
const FreeCakeDesigner = lazyWithRetry(() => import("./pages/FreeCakeDesigner"));
const AiCakeGeneratorFree = lazyWithRetry(() => import("./pages/AiCakeGeneratorFree"));
const ThreeDCakeDesigner = lazyWithRetry(() => import("./pages/ThreeDCakeDesigner"));
const AiBirthdayCakeWithName = lazyWithRetry(() => import("./pages/AiBirthdayCakeWithName"));
const CompleteProfile = lazyWithRetry(() => import("./pages/CompleteProfile"));
const BlogUnsubscribe = lazyWithRetry(() => import("./pages/BlogUnsubscribe"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const EmbedGalleryPage = lazyWithRetry(() =>
  import("./components/EmbeddableGalleryWidget").then((m) => ({ default: m.EmbedGalleryPage }))
);
const PartyPlanner = lazyWithRetry(() => import("./pages/PartyPlanner"));
const PartyPlannerDetail = lazyWithRetry(() => import("./pages/PartyPlannerDetail"));
const PartyRSVP = lazyWithRetry(() => import("./pages/PartyRSVP"));
const SharedCake = lazyWithRetry(() => import("./pages/SharedCake"));
const Recipes = lazyWithRetry(() => import("./pages/Recipes"));
const RecipeDetail = lazyWithRetry(() => import("./pages/RecipeDetail"));


const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GeoProvider>
              <OrganizationSchema
                name="Cake AI Artist"
                url="https://cakeaiartist.com"
                logo="https://cakeaiartist.com/logo.png"
                description="Best AI cake designer for personalized birthday, anniversary, wedding and celebration cakes. Design custom cakes online in 30 seconds — free to try."
              />
              <WebSiteSchema name="Cake AI Artist" url="https://cakeaiartist.com" />
              <ScrollToTop />
              {!/^\/cake\//.test(window.location.pathname) && <CookieConsent />}
              <GeoRedirectWrapper />
              <Suspense fallback={
                <div className="fixed inset-0 flex items-center justify-center bg-background">
                  <div className="w-8 h-8 border-4 border-party-pink border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/advertising" element={<Advertising />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/use-cases" element={<UseCases />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogPost />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/community" element={<CommunityGallery />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/logo-generator" element={<AdminLogoGenerator />} />
                  <Route path="/admin/blog-analytics" element={<AdminBlogAnalytics />} />
                  <Route path="/uk" element={<UKLanding />} />
                  <Route path="/canada" element={<CanadaLanding />} />
                  <Route path="/australia" element={<AustraliaLanding />} />
                  <Route path="/india" element={<IndiaLanding />} />
                  <Route path="/usa" element={<USALanding />} />
                  <Route path="/free-ai-cake-designer" element={<FreeCakeDesigner />} />
                  <Route path="/ai-cake-generator-free" element={<AiCakeGeneratorFree />} />
                  <Route path="/3d-cake-designer" element={<ThreeDCakeDesigner />} />
                  <Route path="/ai-birthday-cake-with-name" element={<AiBirthdayCakeWithName />} />
                  <Route path="/complete-profile" element={<CompleteProfile />} />
                  <Route path="/blog/unsubscribe" element={<BlogUnsubscribe />} />
                  <Route path="/embed/gallery" element={<EmbedGalleryPage />} />
                  <Route path="/party-planner" element={<PartyPlanner />} />
                  <Route path="/party-planner/:id" element={<PartyPlannerDetail />} />
                  <Route path="/rsvp/:token" element={<PartyRSVP />} />
                  <Route path="/cake/:id" element={<SharedCake />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/recipes/:slug" element={<RecipeDetail />} />
                  <Route path="/dashboard" element={<Navigate to="/free-ai-cake-designer" replace />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </GeoProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
