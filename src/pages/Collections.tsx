
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Category, Collection } from '@/lib/adminData';

const Collections = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const assetBase = (() => {
    const baseUrl = (import.meta as any)?.env?.VITE_API_BASE_URL || '';
    if (!baseUrl) return 'https://data.graphify.art';
    return baseUrl.replace(/\/api\/?$/i, '');
  })();

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

    const normalizeCollection = (collection: any): Collection => ({
      id: String(collection?.id ?? ''),
      image: collection?.image || '',
      title: collection?.title || '',
      description: collection?.description || '',
      category_id: collection?.category_id ? String(collection.category_id) : '',
      tags: Array.isArray(collection?.tags)
        ? collection.tags
        : typeof collection?.tags === 'string'
          ? collection.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
          : []
    });

    const normalizeCategory = (category: any): Category => ({
      id: String(category?.id ?? ''),
      name: category?.name || '',
      description: category?.description || ''
    });

    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [collectionsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${assetBase}/api/collections`),
          axios.get(`${assetBase}/api/categories`)
        ]);
        const collectionsPayload = Array.isArray(collectionsResponse.data?.data)
          ? collectionsResponse.data.data
          : collectionsResponse.data;
        const categoriesPayload = Array.isArray(categoriesResponse.data?.data)
          ? categoriesResponse.data.data
          : categoriesResponse.data;
        if (!isActive) return;
        setCollections((Array.isArray(collectionsPayload) ? collectionsPayload : []).map(normalizeCollection));
        setCategories((Array.isArray(categoriesPayload) ? categoriesPayload : []).map(normalizeCategory));
      } catch (error) {
        if (!isActive) return;
        setLoadError('collections_load_failed');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [assetBase]);

  const filteredCollections = selectedCategory === 'all'
    ? collections
    : collections.filter((item) => (item.category_id || 'uncategorized') === selectedCategory);

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
                  Our Gallery
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                  Design <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">Collections</span>
                </h1>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                    selectedCategory === 'all'
                      ? 'bg-[#3584DE] border-[#3584DE] text-white shadow-lg shadow-[#3584DE]/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  All Works
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
                      selectedCategory === category.id
                        ? 'bg-[#3584DE] border-[#3584DE] text-white shadow-lg shadow-[#3584DE]/20'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-light">Loading our masterpieces...</p>
              </div>
            ) : filteredCollections.length === 0 ? (
              <div className="col-span-full text-center py-32">
                <p className="text-gray-400 text-lg">No collections found in this category.</p>
              </div>
            ) : (
              filteredCollections.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/collection/${item.id}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/5] border border-white/10"
                >
                  <img 
                    src={normalizeImageUrl(item.image)} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <Badge className="w-fit mb-4 bg-white/10 backdrop-blur-md border-white/20 text-[#06B6D4] group-hover:bg-[#06B6D4] group-hover:text-white transition-colors duration-300">
                      {categories.find(c => c.id === item.category_id)?.name || 'General'}
                    </Badge>
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{item.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Collections;
