import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import FloatingCTA from '@/components/FloatingCTA';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Author, Blog } from '@/lib/adminData';

const BlogDetail = () => {
  const { slug } = useParams();
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

    const loadData = async () => {
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

  const blog = useMemo(() => {
    if (!slug) return undefined;
    return blogs.find((item) => toSlug(item.title) === slug);
  }, [blogs, slug]);

  const author = useMemo(
    () => authors.find((item) => String(item.id) === String(blog?.author_id)),
    [authors, blog]
  );

  const relatedBlogs = useMemo(() => {
    if (!blog) return [];
    return blogs
      .filter((item) => item.id !== blog.id && (item.tag && item.tag === blog.tag))
      .slice(0, 2);
  }, [blogs, blog]);

  const shareUrl = window.location.href;
  const shareTitle = blog?.title || '';

  const handleShare = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-light tracking-widest uppercase text-xs">Preparing Story...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Article Not Found</h1>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" asChild>
            <Link to="/blogs">Back to Journal</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <Link to="/blogs" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Journal
          </Link>

          <article className="space-y-12">
            <div className="space-y-8 text-center">
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
                {blog.tag || 'Design Insight'}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                    <img src={normalizeImageUrl(author?.image)} alt={author?.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-gray-300">{author?.name || 'Editorial Team'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Recently Published</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>5 min read</span>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#3584DE] to-[#06B6D4] opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-700"></div>
              <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video">
                <img 
                  src={normalizeImageUrl(blog.image)} 
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="prose prose-invert prose-purple max-w-none">
              <div 
                className="text-gray-300 leading-relaxed text-lg font-light space-y-6"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            <div className="pt-12 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold text-sm uppercase tracking-widest">Share:</span>
                  <div className="flex gap-2">
                    {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                      <Button key={i} variant="outline" size="icon" className="w-10 h-10 rounded-xl border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10">
                        <Icon className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, i) => (
                    <Badge key={i} className="bg-white/5 border-white/10 text-gray-500 rounded-lg px-3 py-1 text-[10px] uppercase tracking-wider">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {author && (
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-8 rounded-3xl mt-20">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 shrink-0">
                    <img src={normalizeImageUrl(author.image)} alt={author.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-bold text-white tracking-tight">Written by {author.name}</h4>
                      <p className="text-[#06B6D4] text-xs font-semibold uppercase tracking-widest">Design Specialist</p>
                    </div>
                    <p className="text-gray-400 text-sm font-light leading-relaxed">
                      {author.bio || "Passionate about transforming spaces through art and design. With years of experience in the industry, our team brings a unique perspective to every project."}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </article>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <FloatingCTA />
    </div>
  );
};

export default BlogDetail;
