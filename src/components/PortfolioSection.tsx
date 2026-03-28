
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Category, Collection } from '@/lib/adminData';

const PortfolioSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
        const [collectionsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${apiBase}/api/collections`),
          axios.get(`${apiBase}/api/categories`)
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
        setCollections([]);
        setCategories([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadData();

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

  const categoryOptions = useMemo(() => {
    const counts = collections.reduce<Record<string, number>>((acc, collection) => {
      const key = collection.category_id || 'uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const mapped = categories.map((category) => ({
      id: category.id,
      name: category.name,
      count: counts[category.id] || 0
    }));
    return [
      { id: 'all', name: 'All Projects', count: collections.length },
      ...mapped,
      ...(!categories.length && collections.length
        ? [{ id: 'uncategorized', name: 'Uncategorized', count: counts.uncategorized || 0 }]
        : [])
    ];
  }, [categories, collections]);

  const filteredItems = selectedCategory === 'all'
    ? collections
    : collections.filter((item) => (item.category_id || 'uncategorized') === selectedCategory);

  return (
    <section id="portfolio" className="py-16 md:py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 border-[#06B6D4]/20 text-[#06B6D4] bg-[#06B6D4]/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
              Our Portfolio
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Featured <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">Collections</span>
            </h2>
            <p className="text-lg text-gray-400 font-light leading-relaxed">
              Explore our diverse range of custom wall art projects across various sectors and styles.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categoryOptions.map((category) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-400 py-20">
               <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-20">No collections found.</div>
          ) : (
            filteredItems.slice(0, 6).map((item) => (
              <Link 
                key={item.id} 
                to={`/collections/${toSlug(item.title)}`}
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

        <div className="text-center">
          <Link to="/collections">
            <Button 
              size="lg" 
              className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white px-10 h-14 text-base font-semibold rounded-2xl shadow-lg shadow-[#3584DE]/20"
            >
              View Full Gallery
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
