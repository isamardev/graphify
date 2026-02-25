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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-20 text-center text-gray-600">Loading blog...</div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog post not found</h1>
          <Link to="/blogs">
            <Button>Back to Blogs</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-6 py-6">
        <Link to="/blogs">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
        </Link>
      </div>

      {/* Hero Image */}
      <div className="relative h-56 sm:h-72 md:h-96 overflow-hidden">
        <img 
          src={normalizeImageUrl(blog.image)} 
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <Badge className="absolute top-6 left-6 bg-white/90 text-gray-800">
          {blog.tag || 'General'}
        </Badge>
      </div>

      {/* Article Content */}
      <article className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {blog.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-8 text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>{author?.name || 'Unknown Author'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date((blog as any)?.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{Math.max(1, Math.ceil(blog.content.split(/\s+/).filter(Boolean).length / 200))} min read</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Social Share */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <Share2 className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600 font-medium">Share this article:</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('facebook')}
                    className="p-2"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('twitter')}
                    className="p-2"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('linkedin')}
                    className="p-2"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Article Body */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Author Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <img 
                      src={normalizeImageUrl(author?.image)} 
                      alt={author?.name || 'Author'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{author?.name || 'Unknown Author'}</h4>
                      <p className="text-sm text-gray-600">{author?.bio || 'No author bio available.'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Articles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Articles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedBlogs.map((relatedBlog) => (
                    <Link 
                      key={relatedBlog.id}
                      to={`/blogs/${toSlug(relatedBlog.title)}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <img 
                          src={normalizeImageUrl(relatedBlog.image)} 
                          alt={relatedBlog.title}
                          className="w-20 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm line-clamp-2 mb-1">
                            {relatedBlog.title}
                          </h5>
                          <span className="text-xs text-gray-500">
                            {Math.max(1, Math.ceil(relatedBlog.content.split(/\s+/).filter(Boolean).length / 200))} min read
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="p-6 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Ready to Transform Your Space?</h4>
                  <p className="text-sm text-gray-600 mb-4">Get a personalized consultation for your wall art project.</p>
                  <Link to="/#contact">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Get Quote
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </article>

      <WhatsAppButton />
      <FloatingCTA />
      <Footer />
    </div>
  );
};

export default BlogDetail;
