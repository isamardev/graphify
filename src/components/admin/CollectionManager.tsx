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
import { Collection, Category } from '@/lib/adminData';
import { useToast } from '@/hooks/use-toast';

export const CollectionManager = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [viewingCollection, setViewingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    description: '',
    category_id: '',
    tags: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const { toast } = useToast();

  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://data.graphify.art';

  const buildApiUrl = (segment: string) => {
    const base = String(apiBase || '').replace(/\/+$/g, '');
    const root = /\/api$/i.test(base) ? base : `${base}/api`;
    return `${root}/${segment.replace(/^\/+/, '')}`;
  };

  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    const base = String(apiBase || '').replace(/\/+$/g, '');
    const assetBase = base.replace(/\/api$/i, '');
    const injectPublic = (p: string) => p.replace(/^\/?storage\/(?!app\/public\/)/i, 'storage/app/public/');
    if (/^(data:|blob:)/i.test(url)) return url;
    if (/^(https?:)?\/\//i.test(url)) {
      try {
        const u = new URL(url);
        u.pathname = injectPublic(u.pathname);
        return u.toString();
      } catch {
        return url;
      }
    }
    try {
      const u = new URL(injectPublic(url.replace(/\\/g, '/')), `${assetBase}/`);
      return u.toString();
    } catch {
      return `${assetBase}/${injectPublic(url.replace(/^\/+/, ''))}`;
    }
  };

  const normalizeCollection = (collection: any): Collection => ({
    id: String(collection?.id ?? ''),
    image: collection?.image || collection?.image_url || collection?.imageUrl || '',
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

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        const [collectionsResponse, categoriesResponse] = await Promise.all([
          axios.get(buildApiUrl('collections')),
          axios.get(buildApiUrl('categories'))
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
        setCollections([]);
        setCategories([]);
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  const resetForm = () => {
    setFormData({ imageUrl: '', title: '', description: '', category_id: '', tags: '' });
    setImageFile(null);
    setFileInputKey((prev) => prev + 1);
    setEditingCollection(null);
  };

  const openDialog = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData({
        imageUrl: collection.image,
        title: collection.title,
        description: collection.description,
        category_id: collection.category_id,
        tags: collection.tags.join(', ')
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
      if (!editingCollection && !imageFile) {
        toast({ title: 'Error', description: 'Image file is required', variant: 'destructive' });
        return;
      }

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('category_id', formData.category_id);
      if (imageFile) {
        payload.append('image', imageFile);
      }
      payload.append('tags', tagsValue);

      if (editingCollection) {
        payload.append('_method', 'PUT');
        await axios.post(buildApiUrl(`collections/${editingCollection.id}`), payload);
        toast({ title: 'Success', description: 'Collection updated successfully' });
      } else {
        await axios.post(buildApiUrl('collections'), payload);
        toast({ title: 'Success', description: 'Collection created successfully' });
      }
      const response = await axios.get(buildApiUrl('collections'));
      const collectionsPayload = Array.isArray(response.data?.data) ? response.data.data : response.data;
      setCollections((Array.isArray(collectionsPayload) ? collectionsPayload : []).map(normalizeCollection));
    } catch (error) {
      toast({ title: 'Error', description: 'Collection save failed', variant: 'destructive' });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      try {
        await axios.delete(buildApiUrl(`collections/${id}`));
        const response = await axios.get(buildApiUrl('collections'));
        const collectionsPayload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        setCollections((Array.isArray(collectionsPayload) ? collectionsPayload : []).map(normalizeCollection));
        toast({ title: 'Success', description: 'Collection deleted successfully' });
      } catch (error) {
        toast({ title: 'Error', description: 'Collection delete failed', variant: 'destructive' });
      }
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Collections</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCollection ? 'Edit' : 'Add'} Collection</DialogTitle>
              <DialogDescription>
                {editingCollection ? 'Update' : 'Create a new'} collection information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {editingCollection && (formData.imageUrl || editingCollection.image) && (
                  <div className="space-y-2">
                    <Label>Current Image</Label>
                    <img
                      src={resolveImageUrl(formData.imageUrl || editingCollection.image)}
                      alt={editingCollection.title}
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
                    required={!editingCollection}
                  />
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Button type="submit">{editingCollection ? 'Update' : 'Create'}</Button>
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
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No collections found
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell className="font-medium">{collection.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCategoryName(collection.category_id)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {collection.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {collection.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{collection.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingCollection(collection)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(collection)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(collection.id)}
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
      <Dialog open={!!viewingCollection} onOpenChange={() => setViewingCollection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collection Details</DialogTitle>
          </DialogHeader>
          {viewingCollection && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={resolveImageUrl(viewingCollection.image)}
                  alt={viewingCollection.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg">{viewingCollection.title}</h3>
                <Badge variant="outline" className="mb-2">{getCategoryName(viewingCollection.category_id)}</Badge>
              </div>
              <div>
                <Label className="font-medium">Description:</Label>
                <p className="text-sm text-muted-foreground mt-1">{viewingCollection.description}</p>
              </div>
              <div>
                <Label className="font-medium">Tags:</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {viewingCollection.tags.map((tag, index) => (
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
