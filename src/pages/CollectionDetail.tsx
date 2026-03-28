
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft } from 'lucide-react';
import QuotationSection from '@/components/QuotationSection';
import { Collection, Project } from '@/lib/adminData';

const CollectionDetail = () => {
  const { slug } = useParams();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<{
    id: string;
    title: string;
    image: string;
    description: string;
    materials: string;
    useCase: string;
    features: string[];
  } | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
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

    const normalizeProject = (project: any): Project => {
      const rawCollectionId = project?.collection_id ?? project?.collectionId ?? project?.collection?.id;
      return {
      id: String(project?.id ?? ''),
      title: project?.title || '',
      description: project?.description || '',
      image: project?.image || '',
      collection_id: rawCollectionId ? String(rawCollectionId) : '',
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
      };
    };

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

  const openProjectModal = (project: {
    id: string;
    title: string;
    image: string;
    description: string;
    materials: string;
    useCase: string;
    features: string[];
  }) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const openQuote = () => {
    setIsQuoteOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-light tracking-widest uppercase text-xs">Unveiling Masterpiece...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Collection Not Found</h1>
          <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5">
            <Link to="/collections">Back to Collections</Link>
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
          <Link to="/collections" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Collections
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#3584DE] to-[#06B6D4] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-700"></div>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/3]">
                <img 
                  src={normalizeImageUrl(collection.image)} 
                  alt={collection.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/60 to-transparent"></div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
                  Featured Collection
                </Badge>
                <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tight mb-6">
                  {collection.title}
                </h1>
                <p className="text-xl text-gray-400 font-light leading-relaxed">
                  {collection.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {collection.tags.map((tag, idx) => (
                  <Badge key={idx} className="bg-white/5 border-white/10 text-gray-400 hover:text-white transition-colors py-1.5 px-4 rounded-xl text-xs font-medium uppercase tracking-wider">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button 
                size="lg"
                onClick={openQuote}
                className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white px-10 h-14 text-base font-semibold rounded-2xl shadow-lg shadow-[#3584DE]/20"
              >
                Request Custom Design
              </Button>
            </div>
          </div>

          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Project <span className="text-[#06B6D4]">Gallery</span></h2>
              <div className="h-px flex-grow bg-gradient-to-r from-white/10 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artworks.length === 0 ? (
                <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                  <p className="text-gray-500 italic">No projects added to this collection yet.</p>
                </div>
              ) : (
                artworks.map((artwork) => (
                  <Card 
                    key={artwork.id} 
                    className="group overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 cursor-pointer"
                    onClick={() => openProjectModal(artwork)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={normalizeImageUrl(artwork.image)} 
                        alt={artwork.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <Button variant="outline" className="rounded-xl border-white text-white hover:bg-white hover:text-black">
                          Explore Project
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-[#06B6D4] transition-colors">{artwork.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2 font-light">
                        {artwork.description}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="max-w-4xl bg-[#0F172A] border-white/10 text-white p-0 overflow-hidden rounded-3xl">
          {selectedProject && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-[300px] md:h-full">
                <img 
                  src={normalizeImageUrl(selectedProject.image)} 
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 md:p-12 space-y-8 max-h-[80vh] overflow-y-auto">
                <div>
                  <Badge className="bg-[#06B6D4]/10 text-[#06B6D4] border-none mb-4 uppercase tracking-widest text-[10px]">Project Details</Badge>
                  <DialogTitle className="text-3xl font-bold tracking-tight mb-4 text-white">{selectedProject.title}</DialogTitle>
                  <p className="text-gray-400 font-light leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-3">Specifications</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Materials:</span>
                        <span className="text-gray-300 font-medium">{selectedProject.materials}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Use Case:</span>
                        <span className="text-gray-300 font-medium">{selectedProject.useCase}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-3">Key Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.features.map((feature, i) => (
                        <Badge key={i} variant="secondary" className="bg-white/5 border-white/10 text-gray-400 text-[10px] uppercase tracking-wider">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#3584DE] hover:bg-[#3584DE]/90 text-white h-12 rounded-xl"
                  onClick={() => {
                    setIsProjectModalOpen(false);
                    setIsQuoteOpen(true);
                  }}
                >
                  Inquire About Project
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
        <DialogContent className="max-w-4xl p-0 bg-[#0F172A] border-white/10 overflow-y-auto max-h-[90vh]">
          <QuotationSection />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CollectionDetail;
