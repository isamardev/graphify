
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <section id="reviews" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Clients Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from the amazing clients who trusted us with their vision
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-600">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="col-span-full text-center text-gray-600">No reviews found.</div>
          ) : (
            getCurrentReviews().map((review, index) => {
              const rating = Math.max(1, Math.min(5, Number(review.rating || 0)));
              return (
                <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex space-x-1 mb-4">
                      {[...Array(rating)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>

                    <blockquote
                      className="text-gray-700 italic mb-4 text-sm leading-relaxed overflow-hidden"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      "{review.text}"
                    </blockquote>

                    <div className="flex items-center space-x-3">
                      {review.image ? (
                        <img 
                          src={normalizeImageUrl(review.image)} 
                          alt={review.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : null}
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                        <p className="text-gray-600 text-xs">{review.role}</p>
                        <p className="text-blue-600 font-medium text-xs">{review.project}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Carousel Navigation */}
        <div className="flex justify-center items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={prevPage}
            className="rounded-full w-10 h-10 p-0"
            disabled={totalPages <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentPage 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          
          <Button 
            variant="outline" 
            onClick={nextPage}
            className="rounded-full w-10 h-10 p-0"
            disabled={totalPages <= 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
