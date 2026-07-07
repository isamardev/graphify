import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mainNavItems } from '@/lib/navLinks';
import { BrandLogo } from '@/components/BrandLogo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-transparent border-t border-white/10 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <BrandLogo imgClassName="h-10 md:h-12 w-auto max-w-[260px] md:max-w-[300px]" />
            </div>
            <p className="text-gray-400 mb-8 leading-relaxed max-w-md">
              Wall art design partner for printing companies, supplying trend-led, print-ready
              files scaled to your catalogue.
            </p>
            <div className="flex items-center space-x-6">
              <Button variant="secondary" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10">
                Follow Us
              </Button>
              <div className="flex space-x-5">
                <a href="https://www.instagram.com/hellowalluxe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/hellowalluxe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300 transform hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Same navigation as the header */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Navigate</h4>
            <ul className="space-y-4">
              {mainNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Get in touch</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300">
                  Contact form
                </Link>
              </li>
              <li className="text-gray-500 text-sm leading-relaxed pt-2">
                Custom wall art tailored to your market, designed for global print brands and growing regional producers.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-500 text-sm">
            © {currentYear} Walluxe. Design Partner for Print Businesses
          </p>
          <div className="flex space-x-8 text-sm">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
