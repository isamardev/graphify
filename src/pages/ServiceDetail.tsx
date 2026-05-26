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
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-light tracking-widest uppercase text-xs">Loading Details...</p>
      </div>
    );
  }

  if (!service && !isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Capability not found</h1>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => navigate('/services')}>
            Back to capabilities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Link to="/services" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to capabilities
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#3584DE] to-[#06B6D4] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-700"></div>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/5]">
                <img 
                  src={normalizeImageUrl(service?.image)} 
                  alt={service?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 to-transparent"></div>
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
                  Capability overview
                </Badge>
                <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tight mb-6">
                  {service?.name}
                </h1>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-[#06B6D4] text-2xl font-bold">{service?.price}</span>
                  <div className="h-4 w-px bg-white/10"></div>
                  <span className="text-gray-500 text-sm uppercase tracking-widest">Print-ready output</span>
                </div>
                <p className="text-xl text-gray-400 font-light leading-relaxed">
                  {service?.description}
                </p>
              </div>

              <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-8 rounded-3xl">
                <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Why teams brief us for this</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: "Brand-aligned concepts", desc: "Subjects, palettes, and crops tuned to your shopper data." },
                    { title: "Studio throughput", desc: "Multiple SKUs per sprint without sacrificing QC." },
                    { title: "File hygiene", desc: "Named layers, bleed, and export presets for your presses." },
                    { title: "Resale licensing", desc: "Commercial terms that cover your retail and trade channels." }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <h4 className="text-[#06B6D4] font-bold text-sm">{item.title}</h4>
                      <p className="text-gray-400 text-xs font-light leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Button 
                size="lg"
                className="w-full bg-[#3584DE] hover:bg-[#3584DE]/90 text-white h-16 text-lg font-bold rounded-2xl shadow-lg shadow-[#3584DE]/20"
                onClick={() => navigate('/contact')}
              >
                Request this deliverable
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
