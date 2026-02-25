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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Categories</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update' : 'Create a new'} category information.
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
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingCategory ? 'Update' : 'Create'}</Button>
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
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingCategory(category)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
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
      <Dialog open={!!viewingCategory} onOpenChange={() => setViewingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
          </DialogHeader>
          {viewingCategory && (
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Name:</Label>
                <p className="text-lg font-semibold">{viewingCategory.name}</p>
              </div>
              <div>
                <Label className="font-medium">Description:</Label>
                <p className="text-sm text-muted-foreground mt-1">{viewingCategory.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
