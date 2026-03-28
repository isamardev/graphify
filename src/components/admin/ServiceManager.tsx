import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Eye } from 'lucide-react';
import axios from 'axios';
import { Service } from '@/lib/adminData';
import { useToast } from '@/hooks/use-toast';

export const ServiceManager = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    description: '',
    price: ''
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

    const normalizeService = (service: any): Service => ({
      id: String(service?.id ?? ''),
      name: service?.name || '',
      image: service?.image || '',
      description: service?.description || '',
      price: service?.price || ''
    });

    const loadServices = async () => {
      try {
        const response = await axios.get(buildApiUrl('services'));
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        if (!isActive) return;
        setServices((Array.isArray(payload) ? payload : []).map(normalizeService));
      } catch (error) {
        if (!isActive) return;
        setServices([]);
      }
    };

    loadServices();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  const resetForm = () => {
    setFormData({ name: '', imageUrl: '', description: '', price: '' });
    setImageFile(null);
    setFileInputKey((prev) => prev + 1);
    setEditingService(null);
  };

  const openDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        imageUrl: service.image,
        description: service.description,
        price: service.price
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
      if (!editingService && !imageFile) {
        toast({ title: 'Error', description: 'Image file is required', variant: 'destructive' });
        return;
      }

      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('price', formData.price);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingService) {
        payload.append('_method', 'PUT');
        await axios.post(buildApiUrl(`services/${editingService.id}`), payload);
        toast({ title: 'Success', description: 'Service updated successfully' });
      } else {
        await axios.post(buildApiUrl('services'), payload);
        toast({ title: 'Success', description: 'Service created successfully' });
      }
      const response = await axios.get(buildApiUrl('services'));
      const servicesPayload = Array.isArray(response.data?.data) ? response.data.data : response.data;
      setServices((Array.isArray(servicesPayload) ? servicesPayload : []).map((service: any) => ({
        id: String(service?.id ?? ''),
        name: service?.name || '',
        image: service?.image || '',
        description: service?.description || '',
        price: service?.price || ''
      })));
    } catch (error) {
      toast({ title: 'Error', description: 'Service save failed', variant: 'destructive' });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(buildApiUrl(`services/${id}`));
        const response = await axios.get(buildApiUrl('services'));
        const servicesPayload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        setServices((Array.isArray(servicesPayload) ? servicesPayload : []).map((service: any) => ({
          id: String(service?.id ?? ''),
          name: service?.name || '',
          image: service?.image || '',
          description: service?.description || '',
          price: service?.price || ''
        })));
        toast({ title: 'Success', description: 'Service deleted successfully' });
      } catch (error) {
        toast({ title: 'Error', description: 'Service delete failed', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Expert Services</h2>
          <p className="text-gray-400 text-sm font-light">Manage the premium services you offer to clients.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white rounded-xl gap-2 shadow-lg shadow-[#3584DE]/20">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-[#0F172A] border-white/10 text-white rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription className="text-gray-400 font-light">
                Define the details for your professional service.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300 ml-1">Service Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 rounded-xl focus:ring-[#3584DE]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-gray-300 ml-1">Starting Price / Label</Label>
                    <Input
                      id="price"
                      placeholder="e.g. $500, Contact us, On request"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 rounded-xl focus:ring-[#3584DE]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-gray-300 ml-1">Service Image</Label>
                  <div className="flex flex-col gap-4">
                    {(editingService || imageFile) && (
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
                <Label htmlFor="description" className="text-gray-300 ml-1">Service Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="bg-white/5 border-white/10 rounded-xl min-h-[120px] focus:ring-[#3584DE] resize-none"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white rounded-xl px-8 shadow-lg shadow-[#3584DE]/20">
                  {editingService ? 'Update Service' : 'Add Service'}
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
              <TableHead className="w-[120px]">Image</TableHead>
              <TableHead>Service Name</TableHead>
              <TableHead>Starting Price</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-gray-500 italic">
                  No services added yet.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
                      <img 
                        src={normalizeImageUrl(service.image)} 
                        alt={service.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-white tracking-tight">{service.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#06B6D4]/20 text-[#06B6D4] bg-[#06B6D4]/5 rounded-lg text-[10px] uppercase tracking-wider">
                      {service.price}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-md">
                    <p className="text-gray-400 text-sm font-light truncate">{service.description}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setViewingService(service); }}
                        className="text-gray-400 hover:text-[#06B6D4] hover:bg-white/5"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDialog(service)}
                        className="text-gray-400 hover:text-white hover:bg-white/5"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(service.id)}
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

      <Dialog open={!!viewingService} onOpenChange={(open) => !open && setViewingService(null)}>
        <DialogContent className="sm:max-w-[500px] bg-[#0F172A] border-white/10 text-white rounded-3xl p-0 overflow-hidden">
          {viewingService && (
            <div>
              <div className="aspect-video w-full">
                <img 
                  src={normalizeImageUrl(viewingService.image)} 
                  alt={viewingService.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-[#06B6D4]/10 text-[#06B6D4] border-none text-[10px] uppercase tracking-widest">
                      Professional Service
                    </Badge>
                    <span className="text-gray-500 text-xs font-bold">{viewingService.price}</span>
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-white mb-4">{viewingService.name}</h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">
                    {viewingService.description}
                  </p>
                </div>
                
                <Button onClick={() => setViewingService(null)} className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl">
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
