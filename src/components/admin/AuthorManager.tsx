import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
import axios from 'axios';
import { Author } from '@/lib/adminData';
import { useToast } from '@/hooks/use-toast';

export const AuthorManager = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [viewingAuthor, setViewingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    bio: ''
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

  const authorEndpoints = (id?: string) => {
    if (id) {
      return [
        buildApiUrl(`authors/${id}`),
        buildApiUrl(`author/${id}`),
        buildApiUrl(`authers/${id}`)
      ];
    }
    return [buildApiUrl('authors'), buildApiUrl('author'), buildApiUrl('authers')];
  };

  useEffect(() => {
    let isActive = true;

    const normalizeAuthor = (author: any): Author => ({
      id: String(author?.id ?? ''),
      name: author?.name || '',
      image: author?.image || '',
      bio: author?.bio || ''
    });

    const loadAuthors = async () => {
      try {
        const endpoints = authorEndpoints();
        const response = await requestWithFallback(
          endpoints.map((endpoint) => () => axios.get(endpoint))
        );
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        if (!isActive) return;
        setAuthors((Array.isArray(payload) ? payload : []).map(normalizeAuthor));
      } catch (error) {
        if (!isActive) return;
        setAuthors([]);
      }
    };

    loadAuthors();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  const resetForm = () => {
    setFormData({ name: '', imageUrl: '', bio: '' });
    setImageFile(null);
    setFileInputKey((prev) => prev + 1);
    setEditingAuthor(null);
  };

  const openDialog = (author?: Author) => {
    if (author) {
      setEditingAuthor(author);
      setFormData({
        name: author.name,
        imageUrl: author.image,
        bio: author.bio
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
    
    try {
      if (!editingAuthor && !imageFile) {
        toast({ title: 'Error', description: 'Image file is required', variant: 'destructive' });
        return;
      }

      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('bio', formData.bio);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingAuthor) {
        payload.append('_method', 'PUT');
        const endpoints = authorEndpoints(editingAuthor.id);
        await requestWithFallback(
          endpoints.map((endpoint) => () =>
            axios.post(endpoint, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
          )
        );
        toast({ title: 'Success', description: 'Author updated successfully' });
      } else {
        const endpoints = authorEndpoints();
        await requestWithFallback(
          endpoints.map((endpoint) => () =>
            axios.post(endpoint, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
          )
        );
        toast({ title: 'Success', description: 'Author created successfully' });
      }
      const endpoints = authorEndpoints();
      const response = await requestWithFallback(
        endpoints.map((endpoint) => () => axios.get(endpoint))
      );
      const authorsPayload = Array.isArray(response.data?.data) ? response.data.data : response.data;
      setAuthors((Array.isArray(authorsPayload) ? authorsPayload : []).map((author: any) => ({
        id: String(author?.id ?? ''),
        name: author?.name || '',
        image: author?.image || '',
        bio: author?.bio || ''
      })));
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.error ||
        'Author save failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this author?')) {
      try {
        const endpoints = authorEndpoints(id);
        await requestWithFallback(
          endpoints.map((endpoint) => () => axios.delete(endpoint))
        );
        const listEndpoints = authorEndpoints();
        const response = await requestWithFallback(
          listEndpoints.map((endpoint) => () => axios.get(endpoint))
        );
        const authorsPayload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        setAuthors((Array.isArray(authorsPayload) ? authorsPayload : []).map((author: any) => ({
          id: String(author?.id ?? ''),
          name: author?.name || '',
          image: author?.image || '',
          bio: author?.bio || ''
        })));
        toast({ title: 'Success', description: 'Author deleted successfully' });
      } catch (error) {
        toast({ title: 'Error', description: 'Author delete failed', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Authors</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Author
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAuthor ? 'Edit' : 'Add'} Author</DialogTitle>
              <DialogDescription>
                {editingAuthor ? 'Update' : 'Create a new'} author information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                {editingAuthor && (formData.imageUrl || editingAuthor.image) && (
                  <div className="space-y-2">
                    <Label>Current Image</Label>
                    <img
                      src={normalizeImageUrl(formData.imageUrl || editingAuthor.image)}
                      alt={editingAuthor.name}
                      className="w-24 h-24 rounded-full object-cover"
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
                    required={!editingAuthor}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingAuthor ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Bio</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No authors found
                </TableCell>
              </TableRow>
            ) : (
              authors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell className="font-medium">{author.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{author.bio}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingAuthor(author)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(author)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(author.id)}
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
      <Dialog open={!!viewingAuthor} onOpenChange={() => setViewingAuthor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Author Details</DialogTitle>
          </DialogHeader>
          {viewingAuthor && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={normalizeImageUrl(viewingAuthor.image)}
                  alt={viewingAuthor.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold text-lg">{viewingAuthor.name}</h3>
              </div>
              <div>
                <Label className="font-medium">Bio:</Label>
                <p className="text-sm text-muted-foreground mt-1">{viewingAuthor.bio}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
