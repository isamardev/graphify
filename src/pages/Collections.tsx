
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const categoryOptions = (() => {
    const counts = collections.reduce<Record<string, number>>((acc, collection) => {
      const key = collection.category_id || 'uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const mapped = categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      count: counts[category.id] || 0
    }));
    return [
      { id: 'all', name: 'All Collections', description: '', count: collections.length },
      ...mapped,
      ...(!categories.length && collections.length
        ? [{ id: 'uncategorized', name: 'Uncategorized', description: '', count: counts.uncategorized || 0 }]
        : [])
    ];
  })();

  const groupedCollections = categoryOptions
    .filter((category) => category.id !== 'all')
    .map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      items: collections.filter((collection) => (collection.category_id || 'uncategorized') === category.id)
    }))
    .filter((group) => group.items.length);

  const filteredGroups = selectedCategory === 'all'
    ? groupedCollections
    : groupedCollections.filter((group) => group.id === selectedCategory);

  const openModal = (collection: Collection) => {
    setSelectedCollection(collection);
    setIsModalOpen(true);
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
              Our <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">Collections</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore our diverse range of wall art designs across different categories and find the perfect piece for your space
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
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
                {category.name}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center text-gray-600">Loading collections...</div>
          ) : loadError ? (
            <div className="text-center text-gray-600">Unable to load collections.</div>
          ) : (
            <div className="space-y-16">
              {filteredGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow-lg p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">{group.name}</h2>
                    {group.description && (
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto">{group.description}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {group.items.map((collection) => {
                      const imageUrl = normalizeImageUrl(collection.image);
                      return (
                        <Card
                          key={collection.id}
                          className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer h-full"
                          onClick={() => openModal(collection)}
                        >
                          <div className="relative overflow-hidden">
                            <img 
                              src={imageUrl} 
                              alt={collection.title}
                              className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-4 left-4 right-4">
                                <Button className="w-full bg-white text-gray-900 hover:bg-gray-100" type="button">
                                  View Collection
                                </Button>
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{collection.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2">{collection.description}</p>
                            {collection.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4">
                                {collection.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {collection.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{collection.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCollection && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedCollection.title}</DialogTitle>
                <DialogDescription className="text-base text-gray-600">
                  {categories.find((cat) => cat.id === selectedCollection.category_id)?.name || 'Uncategorized'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <img
                  src={normalizeImageUrl(selectedCollection.image)}
                  alt={selectedCollection.title}
                  className="w-full h-72 object-cover rounded-lg"
                />
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedCollection.description}</p>
                  </div>
                  {selectedCollection.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCollection.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Collections;
