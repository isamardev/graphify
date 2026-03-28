
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
    <div className="min-h-screen bg-transparent">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-16">
            <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
                Our Expertise
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
                Premium <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">Services</span>
              </h1>
              <p className="text-lg text-gray-400 font-light leading-relaxed">
                Comprehensive wall art solutions for every space, style, and purpose. From residential homes to large commercial projects, we bring your vision to life with high-end craftsmanship.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-light">Loading our services...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="col-span-full text-center py-32">
                <p className="text-gray-400 text-lg">No services available at the moment.</p>
              </div>
            ) : (
              services.map((service, index) => {
                const Icon = iconPool[index % iconPool.length];
                return (
                  <Card key={service.id} className="group overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={normalizeImageUrl(service.image)} 
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60"></div>
                      <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-[#3584DE] group-hover:border-[#3584DE] transition-all duration-500">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <CardHeader className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <CardTitle className="text-2xl font-bold text-white tracking-tight group-hover:text-[#06B6D4] transition-colors">
                          {service.name}
                        </CardTitle>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed mb-8 font-light line-clamp-4">
                        {service.description}
                      </p>
                      <Button 
                        onClick={openQuote}
                        className="w-full bg-white/5 border border-white/10 text-white hover:bg-[#3584DE] hover:border-[#3584DE] transition-all duration-300"
                      >
                        Request Quote
                      </Button>
                    </CardHeader>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      <Dialog open={isQuoteOpen} onValueChange={setIsQuoteOpen}>
        <DialogContent className="max-w-4xl p-0 bg-[#0F172A] border-white/10 overflow-y-auto max-h-[90vh]">
          <QuotationSection />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Services;
