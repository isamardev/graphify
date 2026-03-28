import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
import axios from 'axios';
import { Category } from '@/lib/adminData';
import { useToast } from '@/hooks/use-toast';

export const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const { toast } = useToast();

  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://data.graphify.art';

  const buildApiUrl = (segment: string) => {
    const base = String(apiBase || '').replace(/\/+$/g, '');
    const root = /\/api$/i.test(base) ? base : `${base}/api`;
    return `${root}/${segment.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    let isActive = true;

    const normalizeCategory = (category: any): Category => ({
      id: String(category?.id ?? ''),
      name: category?.name || '',
      description: category?.description || ''
    });

    const loadCategories = async () => {
      try {
        const response = await axios.get(buildApiUrl('categories'));
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        if (!isActive) return;
        setCategories((Array.isArray(payload) ? payload : []).map(normalizeCategory));
      } catch (error) {
        if (!isActive) return;
        setCategories([]);
      }
    };

    loadCategories();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
  };

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await axios.put(buildApiUrl(`categories/${editingCategory.id}`), formData);
        toast({ title: 'Success', description: 'Category updated successfully' });
      } else {
        await axios.post(buildApiUrl('categories'), formData);
        toast({ title: 'Success', description: 'Category created successfully' });
      }
      const response = await axios.get(buildApiUrl('categories'));
      const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
      setCategories((Array.isArray(payload) ? payload : []).map((category: any) => ({
        id: String(category?.id ?? ''),
        name: category?.name || '',
        description: category?.description || ''
      })));
    } catch (error) {
      toast({ title: 'Error', description: 'Category save failed', variant: 'destructive' });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(buildApiUrl(`categories/${id}`));
        const response = await axios.get(buildApiUrl('categories'));
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        setCategories((Array.isArray(payload) ? payload : []).map((category: any) => ({
          id: String(category?.id ?? ''),
          name: category?.name || '',
          description: category?.description || ''
        })));
        toast({ title: 'Success', description: 'Category deleted successfully' });
      } catch (error) {
        toast({ title: 'Error', description: 'Category delete failed', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Portfolio Categories</h2>
          <p className="text-gray-400 text-sm font-light">Organize your artworks and collections into meaningful groups.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white rounded-xl gap-2 shadow-lg shadow-[#3584DE]/20">
              <Plus className="h-4 w-4" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#0F172A] border-white/10 text-white rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
              <DialogDescription className="text-gray-400 font-light">
                Define a new category to organize your design portfolio.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300 ml-1">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white/5 border-white/10 rounded-xl focus:ring-[#3584DE]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300 ml-1">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="bg-white/5 border-white/10 rounded-xl min-h-[120px] focus:ring-[#3584DE] resize-none"
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white rounded-xl px-8 shadow-lg shadow-[#3584DE]/20">
                  {editingCategory ? 'Update Category' : 'Create Category'}
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
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-20 text-gray-500 italic">
                  No categories created yet.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-bold text-white tracking-tight">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#06B6D4]"></div>
                      {category.name}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-md">
                    <p className="text-gray-400 text-sm font-light truncate">{category.description}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setViewingCategory(category); }}
                        className="text-gray-400 hover:text-[#06B6D4] hover:bg-white/5"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDialog(category)}
                        className="text-gray-400 hover:text-white hover:bg-white/5"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(category.id)}
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

      <Dialog open={!!viewingCategory} onOpenChange={(open) => !open && setViewingCategory(null)}>
        <DialogContent className="sm:max-w-[400px] bg-[#0F172A] border-white/10 text-white rounded-3xl p-8">
          {viewingCategory && (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06B6D4]/10 text-[#06B6D4] text-[10px] uppercase tracking-widest font-bold">
                Category Details
              </div>
              <div>
                <h3 className="text-3xl font-bold tracking-tight text-white mb-4">{viewingCategory.name}</h3>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  {viewingCategory.description}
                </p>
              </div>
              <Button onClick={() => setViewingCategory(null)} className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
