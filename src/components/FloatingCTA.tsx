
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show after scrolling 50% of viewport height
      setIsVisible(scrollPosition > windowHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleQuickQuote = () => {
    if (location.pathname !== '/') {
      window.location.href = '/#contact';
      return;
    }
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isMinimized ? (
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white rounded-2xl w-14 h-14 p-0 shadow-[0_0_20px_rgba(53,132,222,0.3)] hover:shadow-[0_0_30px_rgba(53,132,222,0.5)] transition-all duration-500 hover:scale-110 border border-white/10"
        >
          <MessageCircle className="w-7 h-7" />
        </Button>
      ) : (
        <div className="bg-[#0F172A]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 max-w-[280px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white tracking-tight">Quick Concierge</h3>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed font-light">
            Ready to transform your space? Get a personalized proposal in minutes.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={handleQuickQuote}
              className="w-full bg-[#3584DE] hover:bg-[#3584DE]/90 text-white rounded-xl h-11 text-xs font-bold shadow-lg shadow-[#3584DE]/20"
            >
              Request Proposal
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl h-11 text-xs font-bold"
              onClick={() => window.location.href = '/collections'}
            >
              View Collections
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingCTA;
