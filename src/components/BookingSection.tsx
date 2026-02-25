
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Book Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Consultation</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to transform your space? Choose the consultation type that best fits your needs and let's bring your vision to life.
          </p>
        </div>

        {/* Consultation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {consultationOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{option.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">{option.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Calendly CTA */}
        {!showCalendly ? (
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Schedule your free consultation today and let's discuss how we can transform your space with stunning wall art that tells your story.
            </p>
            <Button 
              size="lg"
              onClick={openCalendly}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Schedule Now
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Free consultation • No obligation • Professional advice
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Schedule Your Consultation
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalendly(false)}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Calendly inline widget */}
            <div 
              className="calendly-inline-widget" 
              data-url="https://calendly.com/najmi72110?hide_landing_page_details=1&hide_gdpr_banner=1" 
              style={{ minWidth: '320px', height: '700px' }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default BookingSection;
