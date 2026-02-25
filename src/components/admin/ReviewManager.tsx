import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
import axios from 'axios';
import { Review } from '@/lib/adminData';
import { useToast } from '@/hooks/use-toast';

export const ReviewManager = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [viewingReview, setViewingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    project: '',
    rating: 5,
    text: '',
    imageUrl: ''
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

  useEffect(() => {
    let isActive = true;

    const normalizeReview = (review: any): Review => ({
      id: String(review?.id ?? ''),
      name: review?.client_name || review?.name || '',
      role: review?.client_role || review?.role || '',
      project: review?.client_address || review?.project || '',
      rating: Number(review?.rating ?? 5),
      text: review?.review || review?.text || '',
      image: review?.client_image || review?.image || ''
    });

    const loadReviews = async () => {
      try {
        const response = await axios.get(buildApiUrl('reviews'));
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        if (!isActive) return;
        setReviews((Array.isArray(payload) ? payload : []).map(normalizeReview));
      } catch (error) {
        if (!isActive) return;
        setReviews([]);
      }
    };

    loadReviews();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  const resetForm = () => {
    setFormData({ name: '', role: '', project: '', rating: 5, text: '', imageUrl: '' });
    setImageFile(null);
    setFileInputKey((prev) => prev + 1);
    setEditingReview(null);
  };

  const openDialog = (review?: Review) => {
    if (review) {
      setEditingReview(review);
      setFormData({
        name: review.name,
        role: review.role,
        project: review.project,
        rating: review.rating,
        text: review.text,
        imageUrl: review.image
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
      if (!editingReview && !imageFile) {
        toast({ title: 'Error', description: 'Image file is required', variant: 'destructive' });
        return;
      }

      const payload = new FormData();
      payload.append('client_name', formData.name);
      payload.append('client_role', formData.role);
      payload.append('client_address', formData.project);
      payload.append('rating', String(formData.rating));
      payload.append('review', formData.text);
      if (imageFile) {
        payload.append('client_image', imageFile);
      }

      if (editingReview) {
        payload.append('_method', 'PUT');
        await axios.post(buildApiUrl(`reviews/${editingReview.id}`), payload);
        toast({ title: 'Success', description: 'Review updated successfully' });
      } else {
        await axios.post(buildApiUrl('reviews'), payload);
        toast({ title: 'Success', description: 'Review created successfully' });
      }
      const response = await axios.get(buildApiUrl('reviews'));
      const payloadData = Array.isArray(response.data?.data) ? response.data.data : response.data;
      setReviews((Array.isArray(payloadData) ? payloadData : []).map((review: any) => ({
        id: String(review?.id ?? ''),
        name: review?.client_name || review?.name || '',
        role: review?.client_role || review?.role || '',
        project: review?.client_address || review?.project || '',
        rating: Number(review?.rating ?? 5),
        text: review?.review || review?.text || '',
        image: review?.client_image || review?.image || ''
      })));
    } catch (error) {
      toast({ title: 'Error', description: 'Review save failed', variant: 'destructive' });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(buildApiUrl(`reviews/${id}`));
        const response = await axios.get(buildApiUrl('reviews'));
        const payloadData = Array.isArray(response.data?.data) ? response.data.data : response.data;
        setReviews((Array.isArray(payloadData) ? payloadData : []).map((review: any) => ({
          id: String(review?.id ?? ''),
          name: review?.client_name || review?.name || '',
          role: review?.client_role || review?.role || '',
          project: review?.client_address || review?.project || '',
          rating: Number(review?.rating ?? 5),
          text: review?.review || review?.text || '',
          image: review?.client_image || review?.image || ''
        })));
        toast({ title: 'Success', description: 'Review deleted successfully' });
      } catch (error) {
        toast({ title: 'Error', description: 'Review delete failed', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reviews</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingReview ? 'Edit' : 'Add'} Review</DialogTitle>
              <DialogDescription>
                {editingReview ? 'Update' : 'Create a new'} review.
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
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Address</Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min={1}
                    max={5}
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text">Review Text</Label>
                  <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                    required
                  />
                </div>
                {editingReview && (formData.imageUrl || editingReview.image) && (
                  <div className="space-y-2">
                    <Label>Current Image</Label>
                    <img
                      src={normalizeImageUrl(formData.imageUrl || editingReview.image)}
                      alt={editingReview.name}
                      className="w-20 h-20 rounded-full object-cover"
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
                    required={!editingReview}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingReview ? 'Update' : 'Create'}</Button>
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
              <TableHead>Role</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No reviews found
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.name}</TableCell>
                  <TableCell>{review.role}</TableCell>
                  <TableCell>{review.project}</TableCell>
                  <TableCell>{review.rating}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingReview(review)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(review)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(review.id)}
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

      <Dialog open={!!viewingReview} onOpenChange={() => setViewingReview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {viewingReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {viewingReview.image ? (
                  <img
                    src={normalizeImageUrl(viewingReview.image)}
                    alt={viewingReview.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : null}
                <div>
                  <p className="text-sm font-semibold">{viewingReview.name}</p>
                  <p className="text-sm text-muted-foreground">{viewingReview.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Address</Label>
                  <p className="text-sm">{viewingReview.project}</p>
                </div>
                <div>
                  <Label className="font-medium">Rating</Label>
                  <p className="text-sm">{viewingReview.rating}</p>
                </div>
              </div>
              <div>
                <Label className="font-medium">Review</Label>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {viewingReview.text}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
