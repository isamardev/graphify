import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, Palette, X } from 'lucide-react';

const BookingSection = () => {
  const consultationOptions = [
    {
      icon: Users,
      title: "Space Assessment and Recommendations",
      description: "Professional evaluation of your space with tailored design recommendations that maximize visual impact and functionality."
    },
    {
      icon: Palette,
      title: "Style and Theme Consultation", 
      description: "Collaborative session to define your aesthetic preferences, color schemes, and overall design direction for your project."
    },
    {
      icon: Clock,
      title: "Project Timeline and Budget Discussion",
      description: "Detailed planning session covering project phases, realistic timelines, material costs, and investment options."
    },
    {
      icon: Calendar,
      title: "Custom Design Concepts",
      description: "Creative brainstorming session where we develop unique design concepts specifically tailored to your vision and space."
    }
  ];

  const [showCalendly, setShowCalendly] = useState(false);

  useEffect(() => {
    if (showCalendly) {
      // Load Calendly script dynamically when needed
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        // Cleanup script if component unmounts
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [showCalendly]);

  const openCalendly = () => {
    setShowCalendly(true);
  };

  return (
    <section id="booking" className="py-16 md:py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4 border-secondary/20 text-secondary bg-secondary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
            Consultation
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Book Your <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">Consultation</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Ready to transform your space? Choose the consultation type that best fits your needs and let's bring your vision to life.
          </p>
        </div>

        {/* Consultation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {consultationOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <Card key={index} className="group overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500">
                <CardHeader className="p-8 pb-4 flex flex-row items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#06B6D4] group-hover:border-[#06B6D4] transition-all duration-500">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white tracking-tight group-hover:text-[#06B6D4] transition-colors">{option.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-gray-400 text-sm leading-relaxed font-light">{option.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Calendly CTA */}
        {!showCalendly ? (
          <Card className="bg-gradient-to-br from-[#0F172A] to-[#020617] border-white/10 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3584DE] to-[#06B6D4]"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                Ready to Get Started?
              </h3>
              <p className="text-gray-400 mb-10 max-w-2xl mx-auto font-light text-lg">
                Schedule your free consultation today and let's discuss how we can transform your space with stunning wall art that tells your story.
              </p>
              <Button 
                size="lg"
                onClick={openCalendly}
                className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white px-12 h-16 text-lg font-bold rounded-2xl shadow-lg shadow-[#3584DE]/20 transition-all duration-300 hover:scale-105"
              >
                Schedule Now
              </Button>
            </div>
          </Card>
        ) : (
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 min-h-[600px] overflow-hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowCalendly(false)}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </Button>
            <div 
              className="calendly-inline-widget w-full h-[600px]" 
              data-url="https://calendly.com/graphify-art/consultation?hide_landing_page_details=1&hide_gdpr_banner=1&background_color=0f172a&text_color=ffffff&primary_color=3584de"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default BookingSection;