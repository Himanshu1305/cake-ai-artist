import { Link } from 'react-router-dom';
import { useState } from 'react';
import { triggerCookieConsentOpen } from '@/hooks/useCookieConsent';
import { safeGetItem, safeSetItem } from '@/utils/storage';
import { Globe, ChevronDown } from 'lucide-react';

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', path: '/' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', path: '/uk' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', path: '/canada' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', path: '/australia' },
  { code: 'IN', name: 'India', flag: '🇮🇳', path: '/india' },
];

export const Footer = () => {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const savedCountry = safeGetItem('user_country_preference') || 'US';
  const currentCountry = countries.find(c => c.code === savedCountry) || countries[0];

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
    <footer className="bg-gradient-to-br from-party-purple via-party-pink to-party-orange py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white">
        <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Cake AI Artist" className="w-12 h-12 rounded-lg" />
              <h3 className="font-bold text-lg">Cake AI Artist</h3>
            </div>
            <p className="text-sm opacity-90">
              The best AI cake generator for stunning personalized cakes. Create beautiful virtual cake designs in seconds.
            </p>
            {/* Country Selector */}
            <div className="mt-4 relative">
              <button
                onClick={() => setShowCountryPicker(!showCountryPicker)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{currentCountry.flag} {currentCountry.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showCountryPicker ? 'rotate-180' : ''}`} />
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
