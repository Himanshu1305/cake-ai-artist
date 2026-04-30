import { Link, useLocation } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { triggerCookieConsentOpen } from '@/hooks/useCookieConsent';
import { safeGetItem, safeSetItem } from '@/utils/storage';
import { Globe, ChevronDown } from 'lucide-react';
import { useGeoContext } from '@/contexts/GeoContext';

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', path: '/' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', path: '/uk' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', path: '/canada' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', path: '/australia' },
  { code: 'IN', name: 'India', flag: '🇮🇳', path: '/india' },
];

// Map ISO country codes (and broader regions) to one of our 5 supported entries
const ASIA = ['JP','KR','CN','SG','MY','TH','VN','PH','ID','BD','PK','LK','NP','HK','TW','NZ'];
const EUROPE_MENA = ['DE','FR','IT','ES','NL','BE','PT','SE','NO','DK','FI','PL','AT','CH','IE','GR','CZ','HU','RO','UA','RU','AE','SA','EG','ZA','NG','KE','IL','TR','DZ'];

const resolveCountryCode = (iso: string | null, pathname: string): string => {
  // 1. URL hint wins for landing pages
  if (pathname.startsWith('/india')) return 'IN';
  if (pathname.startsWith('/uk')) return 'UK';
  if (pathname.startsWith('/canada')) return 'CA';
  if (pathname.startsWith('/australia')) return 'AU';

  if (!iso) return 'US';
  const code = iso.toUpperCase();
  if (code === 'IN') return 'IN';
  if (code === 'GB' || code === 'UK') return 'UK';
  if (code === 'CA') return 'CA';
  if (code === 'AU') return 'AU';
  if (code === 'US') return 'US';
  if (ASIA.includes(code)) return 'AU';
  if (EUROPE_MENA.includes(code)) return 'UK';
  return 'US';
};

export const Footer = () => {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const { detectedCountry } = useGeoContext();
  const location = useLocation();

  const currentCountry = useMemo(() => {
    // 1. Explicit user choice (footer picker)
    const saved = safeGetItem('user_country_preference');
    if (saved) {
      const match = countries.find(c => c.code === saved);
      if (match) return match;
    }
    // 2. Geo-detected + URL hint fallback
    const code = resolveCountryCode(detectedCountry, location.pathname);
    return countries.find(c => c.code === code) || countries[0];
  }, [detectedCountry, location.pathname]);

  const handleCookieSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerCookieConsentOpen();
  };

  const handleCountryChange = (country: typeof countries[0]) => {
    safeSetItem('user_country_preference', country.code);
    setShowCountryPicker(false);
    window.location.href = country.path;
  };

  return (
    <footer className="relative bg-gradient-to-br from-party-purple via-party-pink to-party-orange py-12">
      {/* Dark overlay improves WCAG AA contrast for white text on warm gradients */}
      <div className="absolute inset-0 bg-foreground/15 pointer-events-none" aria-hidden="true" />
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white">
        <div>
            <div className="flex items-center gap-3 mb-4">
              <img loading="lazy" decoding="async" src="/logo.png" alt="Cake AI Artist" className="w-12 h-12 rounded-lg" />
              <h3 className="font-bold text-lg">Cake AI Artist</h3>
            </div>
            <p className="text-sm opacity-90">
              The best AI cake generator for stunning personalized cakes. Create beautiful virtual cake designs in seconds.
            </p>
            {/* Country Selector */}
            <div className="mt-4 relative">
              <button
                onClick={() => setShowCountryPicker(!showCountryPicker)}
                aria-label={`Change region — currently ${currentCountry.name}`}
                aria-expanded={showCountryPicker}
                aria-haspopup="menu"
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span>{currentCountry.flag} {currentCountry.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showCountryPicker ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {showCountryPicker && (
                <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg overflow-hidden z-50 min-w-[180px]">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountryChange(country)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-party-pink/10 flex items-center gap-2 transition-colors ${
                        country.code === currentCountry.code ? 'bg-party-pink/20 text-party-pink' : 'text-foreground'
                      }`}
                    >
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/how-it-works" className="hover:underline opacity-90">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/use-cases" className="hover:underline opacity-90">
                  Use Cases
                </Link>
              </li>
              <li>
                <Link to="/free-ai-cake-designer" className="hover:underline opacity-90">
                  Free AI Cake Designer
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:underline opacity-90">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:underline opacity-90">
                  Community Gallery
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:underline opacity-90">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:underline opacity-90">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:underline opacity-90">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline opacity-90">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:underline opacity-90">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:underline opacity-90">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/advertising" className="hover:underline opacity-90">
                  Advertising
                </Link>
              </li>
              <li>
                <button
                  onClick={handleCookieSettings}
                  className="hover:underline opacity-90 text-left"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm opacity-90">
                Email: <a href="mailto:support@cakeaiartist.com" className="hover:underline">support@cakeaiartist.com</a>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm text-white opacity-90">
          <p>&copy; 2025 Cake AI Artist. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
