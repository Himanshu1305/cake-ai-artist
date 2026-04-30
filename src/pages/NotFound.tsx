import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-celebration px-4">
      <Helmet>
        <title>Page Not Found — Cake AI Artist</title>
        <meta name="description" content="This page doesn't exist. Head back to Cake AI Artist — the best AI cake designer for personalized birthday & celebration cakes." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://cakeaiartist.com/404" />
      </Helmet>

      <div className="text-center max-w-xl">
        <h1 className="mb-4 text-4xl md:text-5xl font-bold text-foreground">
          Page Not Found — Design a Personalized Cake Instead
        </h1>
        <p className="mb-2 text-2xl text-party-pink font-semibold" aria-hidden="true">404</p>
        <p className="mb-6 text-xl text-muted-foreground">
          Looks like this cake recipe got lost in the kitchen. The page you're looking for doesn't exist.
        </p>
        <p className="mb-8 text-base text-muted-foreground">
          But hey — design a beautiful personalized cake instead:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="px-5 py-2.5 rounded-lg bg-gradient-party text-white font-semibold hover:opacity-90 transition">
            AI Cake Designer
          </Link>
          <Link to="/community" className="px-5 py-2.5 rounded-lg border-2 border-party-pink text-party-pink font-semibold hover:bg-party-pink/10 transition">
            Cake Gallery
          </Link>
          <Link to="/pricing" className="px-5 py-2.5 rounded-lg border-2 border-party-purple text-party-purple font-semibold hover:bg-party-purple/10 transition">
            Pricing
          </Link>
          <Link to="/blog" className="px-5 py-2.5 rounded-lg border-2 border-party-gold text-foreground font-semibold hover:bg-party-gold/10 transition">
            Cake Design Blog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
