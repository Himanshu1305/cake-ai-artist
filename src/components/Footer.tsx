import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-party-purple via-party-pink to-party-orange py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white">
          <div>
            <h3 className="font-bold text-lg mb-4">Cake AI Artist</h3>
            <p className="text-sm opacity-90">
              The best AI cake generator for stunning personalized cakes. Create beautiful virtual cake designs in seconds.
            </p>
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
