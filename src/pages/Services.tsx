
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, Pen, Users, Image, Book, Heart, Palette, Building, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuotationSection from '@/components/QuotationSection';
import { Service } from '@/lib/adminData';

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://data.graphify.art';
  const assetBase = apiBase.replace(/\/api\/?$/i, '');
  const iconPool = [Pen, Users, Image, Book, Heart, Palette, Building, Home];

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

  const openQuote = () => {
    setIsQuoteOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center mb-6">
            <Link to="/" className="flex items-center text-white hover:text-yellow-400 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Our <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive wall art solutions for every space, style, and purpose. From residential homes to large commercial projects.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading ? (
              <div className="col-span-full text-center text-gray-600">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="col-span-full text-center text-gray-600">No services found.</div>
            ) : (
            services.map((service, index) => {
              const IconComponent = iconPool[index % iconPool.length];
              return (
                <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={normalizeImageUrl(service.image)} 
                      alt={service.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl text-gray-900">{service.name}</CardTitle>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {service.price || 'Contact for pricing'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      <h4 className="font-semibold text-gray-900">What's Included:</h4>
                      {(service as any)?.features?.map((feature: string, featureIndex: number) => (
                        <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={openQuote}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      Request This Service
                    </Button>
                  </CardContent>
                </Card>
              );
            }))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Not Sure Which Service You Need?
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Our consultation process helps identify the perfect solution for your space. Let's discuss your vision and create a custom plan.
            </p>
            <Button 
              size="lg"
              onClick={openQuote}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full hover:scale-105 transition-all duration-300"
            >
              Schedule Free Consultation
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none max-h-[90vh] overflow-y-auto">
          <QuotationSection variant="modal" onSubmitted={() => setIsQuoteOpen(false)} />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Services;
