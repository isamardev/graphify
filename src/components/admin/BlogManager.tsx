import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Eye, User, Calendar } from 'lucide-react';
import axios from 'axios';
import { Blog, Author } from '@/lib/adminData';
import { useToast } from '@/hooks/use-toast';

export const BlogManager = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    tag: '',
    author_id: '',
    title: '',
    content: '',
    imageUrl: '',
    tags: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const { toast } = useToast();
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

  const buildApiUrl = (segment: string) => {
    const base = String(apiBase || '').replace(/\/+$/g, '');
    const root = /\/api$/i.test(base) ? base : `${base}/api`;
    return `${root}/${segment.replace(/^\/+/, '')}`;
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
    buildApiUrl('authors'),
    buildApiUrl('author'),
    buildApiUrl('authers')
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
        const authorUrls = authorEndpoints();
        const [blogsResponse, authorsResponse] = await Promise.all([
          axios.get(buildApiUrl('blogs')),
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
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  const resetForm = () => {
    setFormData({ tag: '', author_id: '', title: '', content: '', imageUrl: '', tags: '' });
    setImageFile(null);
    setFileInputKey((prev) => prev + 1);
    setEditingBlog(null);
  };

  const openDialog = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        tag: blog.tag,
        author_id: blog.author_id,
        title: blog.title,
        content: blog.content,
        imageUrl: blog.image,
        tags: blog.tags.join(', ')
      });
      setImageFile(null);
      setFileInputKey((prev) => prev + 1);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    const tagsValue = tags.join(', ');

    try {
      if (!editingBlog && !imageFile) {
        toast({ title: 'Error', description: 'Image file is required', variant: 'destructive' });
        return;
      }

      const payload = new FormData();
      payload.append('tag', formData.tag);
      payload.append('author_id', formData.author_id);
      payload.append('auther_id', formData.author_id);
      payload.append('title', formData.title);
      payload.append('content', formData.content);
      if (imageFile) {
        payload.append('image', imageFile);
      }
      payload.append('tags', tagsValue);

      if (editingBlog) {
        payload.append('_method', 'PUT');
        await axios.post(buildApiUrl(`blogs/${editingBlog.id}`), payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({ title: 'Success', description: 'Blog updated successfully' });
      } else {
        await axios.post(buildApiUrl('blogs'), payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({ title: 'Success', description: 'Blog created successfully' });
      }
      const response = await axios.get(buildApiUrl('blogs'));
      const blogsPayload = Array.isArray(response.data?.data) ? response.data.data : response.data;
      setBlogs((Array.isArray(blogsPayload) ? blogsPayload : []).map((blog: any) => ({
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
      })));
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.error ||
        'Blog save failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(buildApiUrl(`blogs/${id}`));
        const response = await axios.get(buildApiUrl('blogs'));
        const blogsPayload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        setBlogs((Array.isArray(blogsPayload) ? blogsPayload : []).map((blog: any) => ({
          id: String(blog?.id ?? ''),
          tag: blog?.tag || '',
          author_id: blog?.author_id ? String(blog.author_id) : '',
          title: blog?.title || '',
          content: blog?.content || '',
          image: blog?.image || '',
          tags: Array.isArray(blog?.tags)
            ? blog.tags
            : typeof blog?.tags === 'string'
              ? blog.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
              : []
        })));
        toast({ title: 'Success', description: 'Blog deleted successfully' });
      } catch (error) {
        toast({ title: 'Error', description: 'Blog delete failed', variant: 'destructive' });
      }
    }
  };

  const getAuthorName = (authorId: string) => {
    const author = authors.find(a => a.id === authorId);
    return author?.name || 'Unknown Author';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Journal Articles</h2>
          <p className="text-gray-400 text-sm font-light">Share insights and stories about art and design.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white rounded-xl gap-2 shadow-lg shadow-[#3584DE]/20">
              <Plus className="h-4 w-4" />
              Write Article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-[#0F172A] border-white/10 text-white rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">{editingBlog ? 'Edit Article' : 'New Article'}</DialogTitle>
              <DialogDescription className="text-gray-400 font-light">
                Craft a beautiful story for your readers.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-300 ml-1">Article Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 rounded-xl focus:ring-[#3584DE]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tag" className="text-gray-300 ml-1">Primary Tag</Label>
                    <Input
                      id="tag"
                      placeholder="e.g. Design, Interior, Art"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 rounded-xl focus:ring-[#3584DE]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author" className="text-gray-300 ml-1">Author</Label>
                    <Select 
                      value={formData.author_id} 
                      onValueChange={(value) => setFormData({ ...formData, author_id: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl focus:ring-[#3584DE]">
                        <SelectValue placeholder="Select Author" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-white/10 text-white">
                        {authors.map((author) => (
                          <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-gray-300 ml-1">Feature Image</Label>
                  <div className="flex flex-col gap-4">
                    {(editingBlog || imageFile) && (
                      <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : normalizeImageUrl(formData.imageUrl)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <Input
                      key={fileInputKey}
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="bg-white/5 border-white/10 rounded-xl file:bg-transparent file:text-white file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-gray-300 ml-1">Content (HTML support)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  className="bg-white/5 border-white/10 rounded-xl min-h-[200px] focus:ring-[#3584DE] resize-none font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-gray-300 ml-1">Additional Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="art, decor, luxury..."
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-xl focus:ring-[#3584DE]"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white rounded-xl px-8 shadow-lg shadow-[#3584DE]/20">
                  {editingBlog ? 'Update Article' : 'Publish Article'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-xl">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10">
              <TableHead className="w-[120px]">Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="hidden md:table-cell">Tag</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-gray-500 italic">
                  No articles published yet.
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
                      <img 
                        src={normalizeImageUrl(blog.image)} 
                        alt={blog.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-white tracking-tight">{blog.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                        <img 
                          src={normalizeImageUrl(authors.find(a => a.id === blog.author_id)?.image)} 
                          alt="Author" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-gray-300">
                        {authors.find(a => a.id === blog.author_id)?.name || 'Editorial Team'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="border-[#3584DE]/20 text-[#3584DE] bg-[#3584DE]/5 rounded-lg text-[10px] uppercase tracking-wider">
                      {blog.tag || 'Design'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setViewingBlog(blog); }}
                        className="text-gray-400 hover:text-[#06B6D4] hover:bg-white/5"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDialog(blog)}
                        className="text-gray-400 hover:text-white hover:bg-white/5"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(blog.id)}
                        className="text-gray-400 hover:text-red-400 hover:bg-white/5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewingBlog} onOpenChange={(open) => !open && setViewingBlog(null)}>
        <DialogContent className="sm:max-w-[700px] bg-[#0F172A] border-white/10 text-white rounded-3xl p-0 overflow-hidden">
          {viewingBlog && (
            <div>
              <div className="aspect-video w-full relative">
                <img 
                  src={normalizeImageUrl(viewingBlog.image)} 
                  alt={viewingBlog.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-[#3584DE] text-white border-none">{viewingBlog.tag || 'Design'}</Badge>
                </div>
              </div>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                <div>
                  <h3 className="text-3xl font-bold tracking-tight text-white mb-4">{viewingBlog.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      {authors.find(a => a.id === viewingBlog.author_id)?.name || 'Editorial Team'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      Published recently
                    </span>
                  </div>
                  <div className="prose prose-invert prose-purple prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: viewingBlog.content }} className="text-gray-400 font-light leading-relaxed" />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {viewingBlog.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="bg-white/5 border-white/10 text-gray-500 text-[10px] uppercase tracking-wider">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                
                <Button onClick={() => setViewingBlog(null)} className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl">
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
