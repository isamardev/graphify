
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

const HeroSection = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToConsultation = () => {
    const consultationSection = document.getElementById('booking');
    if (consultationSection) {
      consultationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 text-center relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-[#06B6D4]">
              Transforming Walls into Stories
            </span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-bold mb-8 leading-tight tracking-tighter">
            <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
              Graphify
            </span>
          </h1>
          
          <p className="text-lg md:text-xl mb-12 text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            We create stunning wall art that brings life to any space - from children&apos;s hospitals to corporate offices, 
            cafes to homes. Every wall tells a story, and we&apos;re here to help you tell yours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white px-10 h-14 text-base font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(53,132,222,0.3)]"
              onClick={() => window.location.href = '/collections'}
            >
              Explore Collections
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={scrollToConsultation}
              className="border-white/20 text-white hover:bg-white/10 px-10 h-14 text-base font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
            >
              Book Consultation
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
