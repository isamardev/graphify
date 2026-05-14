import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent pt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 text-center relative z-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight text-white">
            Custom Wall Art Design Partner for{' '}
            <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">
              Printing Companies
            </span>
          </h1>

          <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
            Walluxe partners with print brands to create premium, print-ready wall art tailored for modern interiors and
            customer trends.
          </p>

          <p className="text-sm text-[#06B6D4]/90 font-medium mb-10 tracking-wide">
            Designed 300+ artworks · Serving global print brands
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white px-10 h-14 text-base font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(53,132,222,0.3)]"
              onClick={scrollToContact}
            >
              Get Free Sample
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/collections')}
              className="border-white/20 text-white hover:bg-white/10 px-10 h-14 text-base font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
            >
              View Designs
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50">
          <ArrowDown className="w-6 h-6 text-white" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
