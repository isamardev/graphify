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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Design <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Insights</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore the latest trends, insights, and stories from the world of wall art and interior design.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 
                    "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : 
                    "hover:bg-gray-100"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="text-center py-16 text-gray-500">Loading articles...</div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <Link key={blog.id} to={`/blogs/${toSlug(blog.title)}`} className="block h-full">
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                    <div className="relative overflow-hidden">
                      <img 
                        src={normalizeImageUrl(blog.image)} 
                        alt={blog.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-4 left-4 bg-white/90 text-gray-800">
                        {blog.tag || 'General'}
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {getAuthorName(blog.author_id)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date((blog as any)?.created_at || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {blog.content.slice(0, 160)}...
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{calculateReadTime(blog.content)}</span>
                        <span className="inline-flex items-center text-sm font-medium text-blue-600">
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <WhatsAppButton />
      <FloatingCTA />
      <Footer />
    </div>
  );
};

export default Blogs;
