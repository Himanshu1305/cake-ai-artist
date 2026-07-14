import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useGeoContext } from "@/contexts/GeoContext";
import { resolveRegion, pricingPathForRegion } from "@/utils/countryRouting";
import { RecipesNavDropdown, RecipesMobileMenu } from "@/components/RecipesNavDropdown";

interface SiteHeaderProps {
  /** "transparent" keeps gradient bleed-through; "solid" gives an opaque surface. */
  variant?: "transparent" | "solid";
}

export const SiteHeader = ({ variant = "transparent" }: SiteHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { detectedCountry } = useGeoContext();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRole = async (userId: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (active) setIsAdmin(!!data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setIsLoggedIn(!!session);
      if (session?.user) loadRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) loadRole(session.user.id);
      else setIsAdmin(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const region = useMemo(() => {
    const urlCountry = new URLSearchParams(location.search).get("country");
    return resolveRegion({
      pathname: location.pathname,
      urlCountry,
      detectedCountry,
    });
  }, [detectedCountry, location.pathname, location.search]);

  const pricingHref = pricingPathForRegion(region);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  const navClass =
    variant === "solid"
      ? "sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-party-pink/10"
      : "sticky top-0 z-40 bg-gradient-to-b from-party-pink/10 via-background/95 to-background backdrop-blur-md";

  return (
    <nav className={navClass}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-party-pink hover:opacity-80 transition-opacity drop-shadow-[0_0_8px_hsl(var(--party-pink)/0.4)]"
          >
            <img
              src="/logo.png"
              alt="Cake AI Artist"
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg"
              loading="eager"
              decoding="async"
            />
            <span>Cake AI Artist</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1 items-center">
            <Link to="/how-it-works">
              <Button variant="ghost" size="sm" className="px-2 text-xs lg:text-sm text-foreground/80 hover:text-foreground hover:bg-party-pink/10">How It Works</Button>
            </Link>
            <Link to="/party-planner">
              <Button variant="ghost" size="sm" className="px-2 text-xs lg:text-sm text-foreground/80 hover:text-foreground hover:bg-party-purple/10 gap-1.5">
                Party Planner
                <span className="bg-gradient-to-r from-party-purple to-party-pink text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">PREMIUM</span>
              </Button>
            </Link>
            <Link to={pricingHref}>
              <Button variant="ghost" size="sm" className="relative px-2 text-xs lg:text-sm text-foreground/80 hover:text-foreground hover:bg-party-pink/10">
                Pricing
                <span className="absolute -top-1 -right-1 bg-gradient-party text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">🔥</span>
              </Button>
            </Link>
            <Link to="/use-cases" className="hidden lg:inline-flex">
              <Button variant="ghost" size="sm" className="px-2 text-xs lg:text-sm text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Examples</Button>
            </Link>
            <div className="hidden md:inline-flex"><RecipesNavDropdown /></div>
            <Link to="/community" className="hidden lg:inline-flex">
              <Button variant="ghost" size="sm" className="px-2 text-xs lg:text-sm text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Community</Button>
            </Link>
            <Link to="/blog">
              <Button variant="ghost" size="sm" className="px-2 text-xs lg:text-sm text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Blog</Button>
            </Link>
            <Link to="/faq" className="hidden lg:inline-flex">
              <Button variant="ghost" size="sm" className="px-2 text-xs lg:text-sm text-foreground/80 hover:text-foreground hover:bg-party-pink/10">FAQ</Button>
            </Link>
            {isLoggedIn && (
              <Button onClick={() => navigate("/gallery")} variant="ghost" size="sm" className="px-2 text-xs lg:text-sm text-foreground/80 hover:text-foreground hover:bg-party-pink/10">My Gallery</Button>
            )}
            {isLoggedIn && (
              <Button onClick={() => navigate("/occasions")} variant="ghost" size="sm" className="hidden lg:inline-flex px-2 text-xs lg:text-sm text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Occasions</Button>
            )}
            {isLoggedIn && (
              <Button onClick={() => navigate("/settings")} variant="ghost" size="sm" className="hidden lg:inline-flex px-2 text-xs lg:text-sm text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Settings</Button>
            )}
            {isAdmin && (
              <Button onClick={() => navigate("/admin")} variant="ghost" size="sm" className="px-2 text-xs lg:text-sm text-party-gold hover:text-party-gold/80 hover:bg-party-gold/10">Admin</Button>
            )}
            {isLoggedIn ? (
              <Button onClick={handleLogout} variant="outline" size="sm" className="px-2 text-xs lg:text-sm border-party-pink/30 hover:bg-party-pink/10">Logout</Button>
            ) : (
              <Button onClick={() => navigate("/auth")} size="sm" className="px-3 text-xs lg:text-sm bg-gradient-party hover:opacity-90 text-white border-0">Sign In</Button>
            )}
          </div>

          {/* Mobile Hamburger Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-party-pink/10" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background/95 backdrop-blur-md border-l border-party-pink/20 overflow-y-auto">
              <div className="flex items-center gap-2 mb-6">
                <img src="/logo.png" alt="Cake AI Artist" className="w-10 h-10 rounded-lg" />
                <span className="text-lg font-bold text-party-pink">Cake AI Artist</span>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/how-it-works"><Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">How It Works</Button></Link>
                <Link to="/party-planner">
                  <Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-purple/10">
                    Party Planner
                    <span className="ml-2 bg-gradient-to-r from-party-purple to-party-pink text-white text-[10px] font-bold px-2 py-0.5 rounded-full">PREMIUM</span>
                  </Button>
                </Link>
                <Link to={pricingHref}>
                  <Button variant="ghost" className="w-full justify-start relative text-foreground/80 hover:text-foreground hover:bg-party-pink/10">
                    Pricing
                    <span className="ml-2 bg-gradient-party text-white text-xs px-2 py-0.5 rounded-full">🔥 Sale</span>
                  </Button>
                </Link>
                <Link to="/use-cases"><Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Examples</Button></Link>
                <RecipesMobileMenu />
                <Link to="/community"><Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Community</Button></Link>
                <Link to="/blog"><Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Blog</Button></Link>
                <Link to="/faq"><Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">FAQ</Button></Link>

                {isLoggedIn && (
                  <>
                    <div className="border-t border-party-pink/20 my-2" />
                    <Button onClick={() => navigate("/gallery")} variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">My Gallery</Button>
                    <Button onClick={() => navigate("/occasions")} variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Occasions</Button>
                    <Button onClick={() => navigate("/settings")} variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-party-pink/10">Settings</Button>
                  </>
                )}

                {isAdmin && (
                  <Button onClick={() => navigate("/admin")} variant="ghost" className="w-full justify-start text-party-gold hover:text-party-gold/80 hover:bg-party-gold/10">Admin Dashboard</Button>
                )}

                <div className="border-t border-party-pink/20 my-2" />

                {isLoggedIn ? (
                  <Button onClick={handleLogout} variant="outline" className="w-full border-party-pink/30 hover:bg-party-pink/10">Logout</Button>
                ) : (
                  <Button onClick={() => navigate("/auth")} className="w-full bg-gradient-party hover:opacity-90 text-white border-0">Sign In</Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default SiteHeader;
