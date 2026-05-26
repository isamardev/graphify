
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
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://api.walluxe.co';
  const assetBase = (import.meta as any)?.env?.VITE_ASSET_BASE_URL || 'https://api.walluxe.co';
  const iconPool = [Pen, Users, Image, Book, Heart, Palette, Building, Home];

  const normalizeImageUrl = (value?: string) => {
    if (!value) return '';
    if (/^(data:|blob:)/i.test(value)) return value;
    let cleaned = value.replace(/\\/g, '/');

    // Force new domain if old one is present
    if (cleaned.includes('data.graphify.art')) {
      cleaned = cleaned.replace('data.graphify.art', 'api.walluxe.co');
    }

    if (/^(https?:)?\/\//i.test(cleaned)) {
      return cleaned;
    }

    // Clean up common Laravel path prefixes that shouldn't be in the public URL
    cleaned = cleaned.replace(/^\/?(public\/|storage\/app\/public\/|app\/public\/)/i, '');
    
    // Ensure it starts with storage/ for the public URL
    if (!cleaned.startsWith('storage/')) {
      cleaned = 'storage/' + cleaned.replace(/^\//, '');
    }

    return `${assetBase}/${cleaned}`;
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

  const toSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

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
                Design capabilities
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
                Printing Partner <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">Deliverables</span>
              </h1>
              <p className="text-lg text-gray-400 font-light leading-relaxed">
                Explore formats and themes we routinely produce. Each can be bespoke to your SKU plan, substrates, and
                regional trends.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-light">Loading capabilities...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="col-span-full text-center py-32">
                <p className="text-gray-400 text-lg">Capability entries will populate here shortly. Ping us for a sample brief meanwhile.</p>
              </div>
            ) : (
              services.map((service, index) => {
                const Icon = iconPool[index % iconPool.length];
                const detailPath = `/services/${toSlug(service.name)}`;
                return (
                  <Card key={service.id} className="group overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 flex flex-col">
                    <Link
                      to={detailPath}
                      className="block flex-1 min-h-0 rounded-t-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3584DE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
                    >
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
                      <CardHeader className="p-8 pb-4">
                        <div className="flex justify-between items-start mb-4">
                          <CardTitle className="text-2xl font-bold text-white tracking-tight group-hover:text-[#06B6D4] transition-colors">
                            {service.name}
                          </CardTitle>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed font-light line-clamp-4">
                          {service.description}
                        </p>
                      </CardHeader>
                    </Link>
                    <div className="px-8 pb-8">
                      <Button 
                        type="button"
                        onClick={openQuote}
                        className="w-full bg-white/5 border border-white/10 text-white hover:bg-[#3584DE] hover:border-[#3584DE] transition-all duration-300"
                      >
                        Start design project
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <DialogContent className="max-w-4xl p-0 bg-[#0F172A] border-white/10">
          <QuotationSection />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Services;
