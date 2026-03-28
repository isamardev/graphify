
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { Review } from '@/lib/adminData';

const ReviewsSection = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
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

  const buildApiUrl = (segment: string) => {
    const base = String(apiBase || '').replace(/\/+$/g, '');
    const root = /\/api$/i.test(base) ? base : `${base}/api`;
    return `${root}/${segment.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    let isActive = true;

    const normalizeReview = (review: any): Review => ({
      id: String(review?.id ?? ''),
      name: review?.client_name || review?.name || '',
      role: review?.client_role || review?.role || '',
      project: review?.client_address || review?.project || '',
      rating: Number(review?.rating ?? 5),
      text: review?.review || review?.text || '',
      image: review?.client_image || review?.image || ''
    });

    const loadReviews = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(buildApiUrl('reviews'));
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        if (!isActive) return;
        setReviews((Array.isArray(payload) ? payload : []).map(normalizeReview));
      } catch (error) {
        if (!isActive) return;
        setReviews([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadReviews();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  const reviewsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(reviews.length / reviewsPerPage));

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const getCurrentReviews = () => {
    if (reviews.length === 0) return [];
    const startIndex = currentPage * reviewsPerPage;
    return reviews.slice(startIndex, startIndex + reviewsPerPage);
  };

  return (
    <section id="reviews" className="py-16 md:py-24 bg-transparent relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] -z-10 rounded-full scale-150"></div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl text-left">
            <Badge variant="outline" className="mb-4 border-secondary/20 text-secondary bg-secondary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Client <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">Experiences</span>
            </h2>
            <p className="text-lg text-gray-400 font-light leading-relaxed">
              Hear from the businesses and individuals we've helped transform through custom wall art.
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevPage}
              className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 w-12 h-12"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextPage}
              className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 w-12 h-12"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px]">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-20">No reviews yet.</div>
          ) : (
            getCurrentReviews().map((review) => (
              <Card key={review.id} className="bg-white/5 border-white/10 backdrop-blur-xl p-8 hover:bg-white/10 transition-all duration-500 group">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10">
                      <img 
                        src={normalizeImageUrl(review.image) || 'https://via.placeholder.com/150'} 
                        alt={review.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white group-hover:text-secondary transition-colors">{review.name}</h4>
                      <p className="text-[#06B6D4] text-sm font-medium uppercase tracking-wider">{review.role}</p>
                      <p className="text-gray-500 text-xs mt-1">{review.project}</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <svg className="absolute -top-4 -left-2 w-10 h-10 text-white/5 transform -scale-x-100" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12C14.017 12.5523 13.5693 13 13.017 13H11.017C10.4647 13 10.017 12.5523 10.017 12V9C10.017 7.89543 10.9124 7 12.017 7H19.017C20.1216 7 21.017 7.89543 21.017 9V15C21.017 17.2091 19.2261 19 17.017 19H14.017V21ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.017C5.46472 8 5.017 8.44772 5.017 9V12C5.017 12.5523 4.56928 13 4.017 13H2.017C1.46472 13 1.017 12.5523 1.017 12V9C1.017 7.89543 1.91243 7 3.017 7H10.017C11.1216 7 12.017 7.89543 12.017 9V15C12.017 17.2091 10.2261 19 8.017 19H5.017V21Z" />
                    </svg>
                    <p className="text-gray-300 italic leading-relaxed relative z-10 font-light">
                      "{review.text}"
                    </p>
                  </div>
                  
                  <div className="flex gap-1 mt-auto pt-8">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-[#06B6D4]' : 'text-white/10'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
