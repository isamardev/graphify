import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import FloatingCTA from '@/components/FloatingCTA';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import { Author, Blog } from '@/lib/adminData';

const Blogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
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

  const requestWithFallback = async <T,>(requests: Array<() => Promise<T>>) => {
    let lastError: unknown;
    for (const request of requests) {
      try {
        return await request();
      } catch (error) {
        if ((error as any)?.response?.status === 404) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }
    throw lastError || new Error('Request failed');
  };

  const authorEndpoints = () => [
    `${apiBase}/api/authors`,
    `${apiBase}/api/author`,
    `${apiBase}/api/authers`
  ];

  useEffect(() => {
    let isActive = true;

    const normalizeAuthor = (author: any): Author => ({
      id: String(author?.id ?? ''),
      name: author?.name || '',
      image: author?.image || '',
      bio: author?.bio || ''
    });

    const normalizeBlog = (blog: any): Blog => ({
      id: String(blog?.id ?? ''),
      tag: blog?.tag || '',
      author_id: blog?.author_id
        ? String(blog.author_id)
        : blog?.auther_id
          ? String(blog.auther_id)
          : '',
      title: blog?.title || '',
      content: blog?.content || '',
      image: blog?.image || '',
      tags: Array.isArray(blog?.tags)
        ? blog.tags
        : typeof blog?.tags === 'string'
          ? blog.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
          : []
    });

    const loadBlogs = async () => {
      try {
        setIsLoading(true);
        const authorUrls = authorEndpoints();
        const [blogsResponse, authorsResponse] = await Promise.all([
          axios.get(`${apiBase}/api/blogs`),
          requestWithFallback(authorUrls.map((endpoint) => () => axios.get(endpoint)))
        ]);
        const blogsPayload = Array.isArray(blogsResponse.data?.data)
          ? blogsResponse.data.data
          : blogsResponse.data;
        const authorsPayload = Array.isArray(authorsResponse.data?.data)
          ? authorsResponse.data.data
          : authorsResponse.data;
        if (!isActive) return;
        setBlogs((Array.isArray(blogsPayload) ? blogsPayload : []).map(normalizeBlog));
        setAuthors((Array.isArray(authorsPayload) ? authorsPayload : []).map(normalizeAuthor));
      } catch (error) {
        if (!isActive) return;
        setBlogs([]);
        setAuthors([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadBlogs();

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

  const getAuthorName = (authorId: string) =>
    authors.find((author) => String(author.id) === String(authorId))?.name || 'Unknown Author';

  const calculateReadTime = (content: string) => {
    const words = content.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  const categories = useMemo(() => {
    const tags = blogs.map((blog) => blog.tag).filter(Boolean);
    const unique = Array.from(new Set(tags));
    return ['All', ...unique];
  }, [blogs]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredBlogs = blogs.filter((blog) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = blog.title.toLowerCase().includes(search) ||
                         blog.content.toLowerCase().includes(search) ||
                         blog.tags.some((tag) => tag.toLowerCase().includes(search));
    const matchesCategory = selectedCategory === 'All' || blog.tag === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
                Insights & Stories
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
                Our <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">Journal</span>
              </h1>
              <p className="text-lg text-gray-400 font-light leading-relaxed">
                Exploring the intersection of art, design, and architecture.
              </p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input 
                type="text" 
                placeholder="Search articles..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-light">Curating our latest stories...</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="col-span-full text-center py-32">
                <p className="text-gray-400 text-lg">No articles found matching your search.</p>
              </div>
            ) : (
              filteredBlogs.map((blog) => {
                const author = authors.find(a => a.id === blog.author_id);
                return (
                  <Link key={blog.id} to={`/blog/${blog.id}`} className="group">
                    <Card className="h-full flex flex-col overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500">
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          src={normalizeImageUrl(blog.image)} 
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60"></div>
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-[#3584DE] text-white border-none rounded-lg px-3 py-1 text-[10px] uppercase tracking-wider">
                            {blog.tag || 'Design'}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-8 pb-4">
                        <h3 className="text-2xl font-bold text-white tracking-tight mb-4 group-hover:text-[#06B6D4] transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        <div className="flex items-center gap-4 text-gray-500 text-xs uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3 h-3" />
                            {author?.name || 'Editorial Team'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            Recently Published
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8 pt-0 mt-auto">
                        <div className="flex items-center text-[#06B6D4] text-sm font-semibold group-hover:gap-2 transition-all">
                          Read Full Article
                          <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <FloatingCTA />
    </div>
  );
};

export default Blogs;
