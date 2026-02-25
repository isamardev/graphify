import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, Pen, Users, Image, Book } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Service } from '@/lib/adminData';

const ServiceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://data.graphify.art';
  const assetBase = apiBase.replace(/\/api\/?$/i, '');

  const normalizeImageUrl = (value?: string) => {
    if (!value) return '';
    if (/^(data:|blob:)/i.test(value)) return value;
    const injectPublic = (p: string) => p.replace(/^\/?storage\/(?!app\/public\/)/i, 'storage/app/public/');
    const cleaned = value.replace(/\\/g, '/');
    if (/^(https?:)?\/\//i.test(cleaned)) {
      try {
        const u = new URL(cleaned);
        u.pathname = injectPublic(u.pathname);
        return u.toString();
      } catch {
        return cleaned;
      }
    }
    if (cleaned.startsWith('/storage') || cleaned.startsWith('storage/')) {
      return `${assetBase}/${injectPublic(cleaned.replace(/^\/?/, ''))}`;
    }
    if (cleaned.startsWith('/')) return cleaned;
    return `/${cleaned}`;
  };

  useEffect(() => {
    let isActive = true;

    const normalizeService = (service: any): Service => ({
      id: String(service?.id ?? ''),
      name: service?.name || '',
      image: service?.image || '',
      description: service?.description || '',
      price: service?.price || ''
    });

    const loadServices = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${apiBase}/api/services`);
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        if (!isActive) return;
        setServices((Array.isArray(payload) ? payload : []).map(normalizeService));
      } catch (error) {
        if (!isActive) return;
        setServices([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadServices();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  const toSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const service = useMemo(() => {
    if (!slug) return undefined;
    return services.find((item) => toSlug(item.name) === slug);
  }, [services, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-600">Loading service...</div>
      </div>
    );
  }

  if (!service && !isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <Button onClick={() => navigate('/services')}>Back to Services</Button>
        </div>
      </div>
    );
  }

  const IconComponent = Pen;
  const features = (service as any)?.features || [];
  const examples = (service as any)?.examples || [];

  const scrollToQuotation = () => {
    navigate('/', { replace: false });
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const scrollToConsultation = () => {
    navigate('/', { replace: false });
    setTimeout(() => {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const openCalendly = () => {
    window.open('https://calendly.com/graphify-consultations/30min', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center mb-6">
            <Link to="/services" className="flex items-center text-white hover:text-yellow-400 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Services
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6">
                <IconComponent className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.name}</h1>
              <p className="text-xl text-gray-300 mb-6">{service.description}</p>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">
                {service.price || 'Contact for pricing'}
              </Badge>
            </div>
            <div>
              <img 
                src={normalizeImageUrl(service.image)} 
                alt={service.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Features */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 mt-6">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={scrollToQuotation}
                    >
                      Get Custom Quote
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={scrollToConsultation}
                    >
                      Book Consultation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Examples */}
            <div className="lg:col-span-2">
              {examples.length > 0 ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Examples & Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {examples.map((example: string, index: number) => (
                      <div key={index} className="group cursor-pointer">
                        <img 
                          src={normalizeImageUrl(example)} 
                          alt={`${service.name} example ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-gray-600">No gallery items available.</div>
              )}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Let's discuss your vision and create a custom plan for your {service.name.toLowerCase()} project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={scrollToQuotation}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full hover:scale-105 transition-all duration-300"
              >
                Get Your Quote
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={scrollToConsultation}
                className="px-8 py-4 rounded-full hover:scale-105 transition-all duration-300"
              >
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
