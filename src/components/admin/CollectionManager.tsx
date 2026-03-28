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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Design Collections</h2>
          <p className="text-gray-400 text-sm font-light">Manage your portfolio collections and their artworks.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white rounded-xl gap-2 shadow-lg shadow-[#3584DE]/20">
              <Plus className="h-4 w-4" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-[#0F172A] border-white/10 text-white rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">{editingCollection ? 'Edit Collection' : 'Create Collection'}</DialogTitle>
              <DialogDescription className="text-gray-400 font-light">
                Organize your artworks into a premium collection.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-300 ml-1">Collection Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 rounded-xl focus:ring-[#3584DE]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-gray-300 ml-1">Category</Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl focus:ring-[#3584DE]">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-white/10 text-white">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-gray-300 ml-1">Cover Image</Label>
                  <div className="flex flex-col gap-4">
                    {(editingCollection || imageFile) && (
                      <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
                        <img 
                          src={imageFile ? URL.createObjectURL(imageFile) : resolveImageUrl(formData.imageUrl)}
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
                <Label htmlFor="description" className="text-gray-300 ml-1">Collection Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="bg-white/5 border-white/10 rounded-xl min-h-[100px] focus:ring-[#3584DE] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-gray-300 ml-1">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="modern, minimal, office..."
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
                  {editingCollection ? 'Update Collection' : 'Create Collection'}
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
              <TableHead className="w-[120px]">Cover</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="hidden md:table-cell">Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-gray-500 italic">
                  No collections created yet.
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection) => (
                <TableRow key={collection.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
                      <img 
                        src={resolveImageUrl(collection.image)} 
                        alt={collection.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-white tracking-tight">{collection.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#06B6D4]/20 text-[#06B6D4] bg-[#06B6D4]/5 rounded-lg text-[10px] uppercase tracking-wider">
                      {categories.find(c => c.id === collection.category_id)?.name || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {collection.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] text-gray-500">#{tag}</span>
                      ))}
                      {collection.tags.length > 3 && <span className="text-[10px] text-gray-500">...</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setViewingCollection(collection); }}
                        className="text-gray-400 hover:text-[#06B6D4] hover:bg-white/5"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDialog(collection)}
                        className="text-gray-400 hover:text-white hover:bg-white/5"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(collection.id)}
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

      <Dialog open={!!viewingCollection} onOpenChange={(open) => !open && setViewingCollection(null)}>
        <DialogContent className="sm:max-w-[600px] bg-[#0F172A] border-white/10 text-white rounded-3xl p-0 overflow-hidden">
          {viewingCollection && (
            <div>
              <div className="aspect-video w-full">
                <img 
                  src={resolveImageUrl(viewingCollection.image)} 
                  alt={viewingCollection.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-[#3584DE]/10 text-[#3584DE] border-none text-[10px] uppercase tracking-widest">
                      {categories.find(c => c.id === viewingCollection.category_id)?.name || 'Collection'}
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-white mb-4">{viewingCollection.title}</h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">
                    {viewingCollection.description}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {viewingCollection.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="bg-white/5 border-white/10 text-gray-500 text-[10px] uppercase tracking-wider">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                
                <Button onClick={() => setViewingCollection(null)} className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl">
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
