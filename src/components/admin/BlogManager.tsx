import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Blogs</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBlog ? 'Edit' : 'Add'} Blog</DialogTitle>
              <DialogDescription>
                {editingBlog ? 'Update' : 'Create a new'} blog post.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tag">Tag</Label>
                  <Input
                    id="tag"
                    value={formData.tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Select value={formData.author_id} onValueChange={(value) => setFormData(prev => ({ ...prev, author_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an author" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-32"
                    required
                  />
                </div>
                {editingBlog && (formData.imageUrl || editingBlog.image) && (
                  <div className="space-y-2">
                    <Label>Current Image</Label>
                    <img
                      src={normalizeImageUrl(formData.imageUrl || editingBlog.image)}
                      alt={editingBlog.title}
                      className="w-full h-40 rounded-lg object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="image">Image File</Label>
                  <Input
                    key={fileInputKey}
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    required={!editingBlog}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingBlog ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No blogs found
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium max-w-xs truncate">{blog.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getAuthorName(blog.author_id)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{blog.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingBlog(blog)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(blog)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                        className="text-destructive hover:text-destructive"
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

      {/* View Dialog */}
      <Dialog open={!!viewingBlog} onOpenChange={() => setViewingBlog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Blog Details</DialogTitle>
          </DialogHeader>
          {viewingBlog && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={normalizeImageUrl(viewingBlog.image)}
                  alt={viewingBlog.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg">{viewingBlog.title}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="outline">{getAuthorName(viewingBlog.author_id)}</Badge>
                  <Badge variant="secondary">{viewingBlog.tag}</Badge>
                </div>
              </div>
              <div>
                <Label className="font-medium">Content:</Label>
                <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {viewingBlog.content}
                </div>
              </div>
              <div>
                <Label className="font-medium">Tags:</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {viewingBlog.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
