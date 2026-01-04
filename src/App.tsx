import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CookieConsent } from "@/components/CookieConsent";
import { GeoRedirectWrapper } from "@/components/GeoRedirectWrapper";
import { GeoProvider } from "@/contexts/GeoContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Advertising from "./pages/Advertising";
import Auth from "./pages/Auth";
import Gallery from "./pages/Gallery";
import CommunityGallery from "./pages/CommunityGallery";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Pricing from "./pages/Pricing";
import HowItWorks from "./pages/HowItWorks";
import UseCases from "./pages/UseCases";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import AdminLogoGenerator from "./pages/AdminLogoGenerator";
import UKLanding from "./pages/UKLanding";
import CanadaLanding from "./pages/CanadaLanding";
import AustraliaLanding from "./pages/AustraliaLanding";
import IndiaLanding from "./pages/IndiaLanding";
import FreeCakeDesigner from "./pages/FreeCakeDesigner";
import CompleteProfile from "./pages/CompleteProfile";
import { EmbedGalleryPage } from "./components/EmbeddableGalleryWidget";
import NotFound from "./pages/NotFound";

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
              <ScrollToTop />
              <CookieConsent />
              <GeoRedirectWrapper />
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
                <Route path="/uk" element={<UKLanding />} />
                <Route path="/canada" element={<CanadaLanding />} />
                <Route path="/australia" element={<AustraliaLanding />} />
                <Route path="/india" element={<IndiaLanding />} />
                <Route path="/free-ai-cake-designer" element={<FreeCakeDesigner />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/embed/gallery" element={<EmbedGalleryPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </GeoProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
