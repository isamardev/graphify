
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, Heart } from 'lucide-react';
import { Collection, Project } from '@/lib/adminData';

const CollectionDetail = () => {
  const { slug } = useParams();
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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

    const normalizeProject = (project: any): Project => ({
      id: String(project?.id ?? ''),
      title: project?.title || '',
      description: project?.description || '',
      image: project?.image || '',
      collection_id: project?.collection_id ? String(project.collection_id) : '',
      material_used: Array.isArray(project?.material_used)
        ? project.material_used
        : typeof project?.material_used === 'string'
          ? project.material_used.split(',').map((item: string) => item.trim()).filter(Boolean)
          : [],
      perfect_for: Array.isArray(project?.perfect_for)
        ? project.perfect_for
        : typeof project?.perfect_for === 'string'
          ? project.perfect_for.split(',').map((item: string) => item.trim()).filter(Boolean)
          : [],
      features: Array.isArray(project?.features)
        ? project.features
        : typeof project?.features === 'string'
          ? project.features.split(',').map((item: string) => item.trim()).filter(Boolean)
          : []
    });

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [collectionsResponse, projectsResponse] = await Promise.all([
          axios.get(`${apiBase}/api/collections`),
          axios.get(`${apiBase}/api/projects`)
        ]);
        const collectionsPayload = Array.isArray(collectionsResponse.data?.data)
          ? collectionsResponse.data.data
          : collectionsResponse.data;
        const projectsPayload = Array.isArray(projectsResponse.data?.data)
          ? projectsResponse.data.data
          : projectsResponse.data;
        if (!isActive) return;
        setCollections((Array.isArray(collectionsPayload) ? collectionsPayload : []).map(normalizeCollection));
        setProjects((Array.isArray(projectsPayload) ? projectsPayload : []).map(normalizeProject));
      } catch (error) {
        if (!isActive) return;
        setCollections([]);
        setProjects([]);
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

  const collection = useMemo(() => {
    if (!slug) return undefined;
    return collections.find((item) => toSlug(item.title) === slug);
  }, [collections, slug]);

  const artworks = useMemo(() => {
    if (!collection) return [];
    return projects
      .filter((project) => String(project.collection_id) === String(collection.id))
      .map((project) => ({
        id: project.id,
        title: project.title,
        image: project.image || collection.image,
        description: project.description,
        materials: project.material_used.join(', '),
        useCase: project.perfect_for.join(', '),
        features: project.features || []
      }));
  }, [collection, projects]);

  const openModal = (artwork) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-600">Loading collection...</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
          <Button asChild>
            <Link to="/collections">Back to Collections</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center mb-6">
            <Link to="/collections" className="flex items-center text-white hover:text-yellow-400 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Collections
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {collection.title}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {collection.description}
            </p>
          </div>
        </div>
      </section>

      {/* Artwork Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.length === 0 ? (
              <div className="col-span-full text-center text-gray-600">No artworks available.</div>
            ) : (
            artworks.map((artwork) => (
              <Card 
                key={artwork.id} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                onClick={() => openModal(artwork)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={normalizeImageUrl(artwork.image)} 
                    alt={artwork.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button className="w-full bg-white text-gray-900 hover:bg-gray-100">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{artwork.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{artwork.description}</p>
                </CardContent>
              </Card>
            )))}
          </div>
        </div>
      </section>

      {/* Modal Popup */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArtwork && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedArtwork.title}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <img 
                    src={normalizeImageUrl(selectedArtwork.image)} 
                    alt={selectedArtwork.title}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                      Request Quote
                    </Button>
                    <Button variant="outline" className="p-3">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-base text-gray-700">
                    {selectedArtwork.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Materials Used:</h4>
                      <p className="text-gray-600 text-sm">{selectedArtwork.materials}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Perfect For:</h4>
                      <p className="text-gray-600 text-sm">{selectedArtwork.useCase}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedArtwork.features || []).length ? (
                        (selectedArtwork.features || []).map((feature, index) => (
                          <Badge key={index} variant="secondary">{feature}</Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">Custom Sizing</Badge>
                      )}
                    </div>
                  </div>
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

export default CollectionDetail;
