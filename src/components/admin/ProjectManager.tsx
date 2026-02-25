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
import { Project, Collection } from '@/lib/adminData';
import { useToast } from '@/hooks/use-toast';

export const ProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    collection_id: '',
    material_used: '',
    perfect_for: '',
    features: ''
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

  const normalizeProject = (project: any): Project => ({
    id: String(project?.id ?? ''),
    title: project?.title || '',
    description: project?.description || '',
    image: project?.image || '',
    collection_id: project?.collection_id ? String(project.collection_id) : '',
    material_used: Array.isArray(project?.material_used)
      ? project.material_used
      : typeof project?.material_used === 'string'
        ? project.material_used.split(',').map((item: string) => item.trim()).filter(Boolean)
        : [],
    perfect_for: Array.isArray(project?.perfect_for)
      ? project.perfect_for
      : typeof project?.perfect_for === 'string'
        ? project.perfect_for.split(',').map((item: string) => item.trim()).filter(Boolean)
        : [],
    features: Array.isArray(project?.features)
      ? project.features
      : typeof project?.features === 'string'
        ? project.features.split(',').map((item: string) => item.trim()).filter(Boolean)
        : []
  });

  const normalizeCollection = (collection: any): Collection => ({
    id: String(collection?.id ?? ''),
    image: collection?.image || '',
    title: collection?.title || '',
    description: collection?.description || '',
    category_id: collection?.category_id ? String(collection.category_id) : '',
    tags: Array.isArray(collection?.tags)
      ? collection.tags
      : typeof collection?.tags === 'string'
        ? collection.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : []
  });

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        const [projectsResponse, collectionsResponse] = await Promise.all([
          axios.get(buildApiUrl('projects')),
          axios.get(buildApiUrl('collections'))
        ]);
        const projectsPayload = Array.isArray(projectsResponse.data?.data)
          ? projectsResponse.data.data
          : projectsResponse.data;
        const collectionsPayload = Array.isArray(collectionsResponse.data?.data)
          ? collectionsResponse.data.data
          : collectionsResponse.data;
        if (!isActive) return;
        setProjects((Array.isArray(projectsPayload) ? projectsPayload : []).map(normalizeProject));
        setCollections((Array.isArray(collectionsPayload) ? collectionsPayload : []).map(normalizeCollection));
      } catch (error) {
        if (!isActive) return;
        setProjects([]);
        setCollections([]);
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      imageUrl: '', 
      collection_id: '', 
      material_used: '', 
      perfect_for: '', 
      features: '' 
    });
    setImageFile(null);
    setFileInputKey((prev) => prev + 1);
    setEditingProject(null);
  };

  const openDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        imageUrl: project.image,
        collection_id: project.collection_id,
        material_used: project.material_used.join(', '),
        perfect_for: project.perfect_for.join(', '),
        features: project.features.join(', ')
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
    
    const materialUsed = formData.material_used.split(',').map(item => item.trim()).filter(Boolean);
    const perfectFor = formData.perfect_for.split(',').map(item => item.trim()).filter(Boolean);
    const features = formData.features.split(',').map(item => item.trim()).filter(Boolean);

    try {
      if (!editingProject && !imageFile) {
        toast({ title: 'Error', description: 'Image file is required', variant: 'destructive' });
        return;
      }

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('collection_id', formData.collection_id);
      if (imageFile) {
        payload.append('image', imageFile);
      }
      materialUsed.forEach((item) => payload.append('material_used[]', item));
      perfectFor.forEach((item) => payload.append('perfect_for[]', item));
      features.forEach((item) => payload.append('features[]', item));

      if (editingProject) {
        payload.append('_method', 'PUT');
        await axios.post(buildApiUrl(`projects/${editingProject.id}`), payload);
        toast({ title: 'Success', description: 'Project updated successfully' });
      } else {
        await axios.post(buildApiUrl('projects'), payload);
        toast({ title: 'Success', description: 'Project created successfully' });
      }
      const response = await axios.get(buildApiUrl('projects'));
      const projectsPayload = Array.isArray(response.data?.data) ? response.data.data : response.data;
      setProjects((Array.isArray(projectsPayload) ? projectsPayload : []).map(normalizeProject));
    } catch (error) {
      toast({ title: 'Error', description: 'Project save failed', variant: 'destructive' });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(buildApiUrl(`projects/${id}`));
        const response = await axios.get(buildApiUrl('projects'));
        const projectsPayload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        setProjects((Array.isArray(projectsPayload) ? projectsPayload : []).map(normalizeProject));
        toast({ title: 'Success', description: 'Project deleted successfully' });
      } catch (error) {
        toast({ title: 'Error', description: 'Project delete failed', variant: 'destructive' });
      }
    }
  };

  const getCollectionTitle = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection?.title || 'Unknown Collection';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Projects</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit' : 'Add'} Project</DialogTitle>
              <DialogDescription>
                {editingProject ? 'Update' : 'Create a new'} project information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
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
                {editingProject && (formData.imageUrl || editingProject.image) && (
                  <div className="space-y-2">
                    <Label>Current Image</Label>
                    <img
                      src={normalizeImageUrl(formData.imageUrl || editingProject.image)}
                      alt={editingProject.title}
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
                    required={!editingProject}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collection">Collection</Label>
                  <Select value={formData.collection_id} onValueChange={(value) => setFormData(prev => ({ ...prev, collection_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material_used">Material Used (comma separated)</Label>
                  <Input
                    id="material_used"
                    value={formData.material_used}
                    onChange={(e) => setFormData(prev => ({ ...prev, material_used: e.target.value }))}
                    placeholder="Wood, Metal, Glass"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perfect_for">Perfect For (comma separated)</Label>
                  <Input
                    id="perfect_for"
                    value={formData.perfect_for}
                    onChange={(e) => setFormData(prev => ({ ...prev, perfect_for: e.target.value }))}
                    placeholder="Office, Home, Restaurant"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features">Features (comma separated)</Label>
                  <Input
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                    placeholder="Durable, Eco-friendly, Modern"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingProject ? 'Update' : 'Create'}</Button>
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
              <TableHead>Collection</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCollectionTitle(project.collection_id)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingProject(project)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(project)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(project.id)}
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
      <Dialog open={!!viewingProject} onOpenChange={() => setViewingProject(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {viewingProject && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={normalizeImageUrl(viewingProject.image)}
                  alt={viewingProject.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg">{viewingProject.title}</h3>
                <Badge variant="outline" className="mb-2">{getCollectionTitle(viewingProject.collection_id)}</Badge>
              </div>
              <div>
                <Label className="font-medium">Description:</Label>
                <p className="text-sm text-muted-foreground mt-1">{viewingProject.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="font-medium">Materials Used:</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {viewingProject.material_used.map((material, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Perfect For:</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {viewingProject.perfect_for.map((use, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {use}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Features:</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {viewingProject.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
