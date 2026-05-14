
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link, useLocation } from 'react-router-dom';
import QuotationSection from '@/components/QuotationSection';
import { mainNavItems } from '@/lib/navLinks';
import { BrandLogo } from '@/components/BrandLogo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const location = useLocation();

  const navItems = mainNavItems;

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      window.location.href = `/${sectionId}`;
      return;
    }
    
    const element = document.getElementById(sectionId.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetQuote = () => {
    setIsQuoteOpen(true);
  };

  return (
    <header className="fixed top-0 w-full bg-white/5 backdrop-blur-lg border-b border-white/10 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3584DE]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <BrandLogo imgClassName="h-8 md:h-9 w-auto max-w-[200px] md:max-w-[240px]" />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.href.startsWith('/#') ? (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300 font-medium text-sm uppercase tracking-wider"
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300 font-medium text-sm uppercase tracking-wider"
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            <Button 
              className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white shadow-lg shadow-[#3584DE]/20"
              onClick={handleGetQuote}
            >
              Get Free Sample
            </Button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
              <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
            </div>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10">
            <nav className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) => (
                item.href.startsWith('/#') ? (
                  <button
                    key={item.name}
                    onClick={() => {
                      scrollToSection(item.href);
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300 font-medium text-sm uppercase tracking-wider text-left"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-400 hover:text-[#06B6D4] transition-all duration-300 font-medium text-sm uppercase tracking-wider"
                  >
                    {item.name}
                  </Link>
                )
              ))}
              <div className="pt-4 border-t border-white/10">
                <Button 
                  className="w-full bg-[#3584DE] hover:bg-[#3584DE]/90 text-white"
                  onClick={() => {
                    handleGetQuote();
                    setIsMenuOpen(false);
                  }}
                >
                  Get Free Sample
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
      <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none">
          <QuotationSection variant="modal" onSubmitted={() => setIsQuoteOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
