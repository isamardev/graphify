
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
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center overflow-hidden">
      {/* YouTube Video Background */}
      <div className="absolute inset-0 z-0">
        <iframe
          className="w-full h-full object-cover"
          style={{
            width: '100vw',
            height: '100vh',
            transform: 'scale(1.1)',
            pointerEvents: 'none'
          }}
          src="https://www.youtube.com/embed/SFN0r1LzOCo?autoplay=1&mute=1&loop=1&playlist=SFN0r1LzOCo&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0&cc_load_policy=0&playsinline=1&enablejsapi=0"
          title="Background Video"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
      </div>

      <div className="container mx-auto px-6 py-20 text-center text-white relative z-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Graphify
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-300 font-light">
            Transforming Walls into Stories
          </p>
          
          <p className="text-lg mb-12 text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We create stunning wall art that brings life to any space - from children&apos;s hospitals to corporate offices, 
            cafes to homes. Every wall tells a story, and we&apos;re here to help you tell yours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
              onClick={() => window.location.href = '/collections'}
            >
              Explore Our Collections
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={scrollToConsultation}
              className="border-2 border-white bg-black text-white hover:bg-gray-800 hover:border-gray-300 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
            >
              Book Consultation
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-white/70" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
