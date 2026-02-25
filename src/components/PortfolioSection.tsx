
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
    <section id="portfolio" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Portfolio</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our diverse collection of wall art that transforms spaces across various industries and settings
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categoryOptions.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-6 py-2 transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'hover:bg-gray-100'
              }`}
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-600">Loading portfolio...</div>
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full text-center text-gray-600">No collections found.</div>
          ) : (
          filteredItems.map((item) => (
            <Link key={item.id} to={`/collections/${toSlug(item.title)}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer">
                <div className="relative overflow-hidden">
                  <img 
                    src={normalizeImageUrl(item.image)} 
                    alt={item.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button className="w-full bg-white text-gray-900 hover:bg-gray-100">
                        View Collection
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )))}
        </div>

        <div className="text-center mt-12">
          <Link to="/collections">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full hover:scale-105 transition-all duration-300">
              View All Collections
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
