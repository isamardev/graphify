
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Pen, Users, Image, Book, Heart, Palette, Building, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuotationSection from '@/components/QuotationSection';
import { Service } from '@/lib/adminData';

const ServicesSection = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://api.walluxe.co';
  const assetBase = (import.meta as any)?.env?.VITE_ASSET_BASE_URL || 'https://api.walluxe.co';

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

  const handleShowAllServices = () => {
    navigate('/services');
  };

  const handleRequestService = () => {
    setIsQuoteOpen(true);
  };

  return (
    <section id="services" className="py-16 md:py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
            Design capabilities
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            What We Build <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">For Your Catalogue</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            From statement pieces to repeatable lines, our subscription design studio covers the wall art formats your print
            operation needs, all aligned to trends and resale licensing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-400 py-20">
              <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-20">
              Capability cards will appear here once linked. Request a brief to preview what we can build.
            </div>
          ) : (
            services.slice(0, 6).map((service, index) => {
              const Icon = iconPool[index % iconPool.length];
              return (
                <Card key={service.id} className="group overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={normalizeImageUrl(service.image)} 
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#06B6D4]" />
                    </div>
                  </div>
                  <CardHeader className="p-6">
                    <CardTitle className="text-xl font-bold text-white mb-3 group-hover:text-[#06B6D4] transition-colors">
                      {service.name}
                    </CardTitle>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 font-light">
                      {service.description}
                    </p>
                  </CardHeader>
                </Card>
              );
            })
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg"
            className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white px-8 rounded-xl h-12 shadow-lg shadow-[#3584DE]/20"
            onClick={handleShowAllServices}
          >
            View capabilities
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="border-white/10 text-white hover:bg-white/5 px-8 rounded-xl h-12"
            onClick={handleRequestService}
          >
            Start Your Design Project
          </Button>
        </div>
      </div>
      <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none">
          <QuotationSection variant="modal" onSubmitted={() => setIsQuoteOpen(false)} />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ServicesSection;
