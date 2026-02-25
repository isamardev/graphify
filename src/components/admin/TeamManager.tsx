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
import { Team } from '@/lib/adminData';
import { useToast } from '@/hooks/use-toast';

export const TeamManager = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
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

    const normalizeTeam = (team: any): Team => ({
      id: String(team?.id ?? ''),
      name: team?.name || '',
      role: team?.role || '',
      description: team?.description || '',
      image: team?.image || ''
    });

    const loadTeams = async () => {
      try {
        const response = await axios.get(buildApiUrl('teams'));
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        if (!isActive) return;
        setTeams((Array.isArray(payload) ? payload : []).map(normalizeTeam));
      } catch (error) {
        if (!isActive) return;
        setTeams([]);
      }
    };

    loadTeams();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  const resetForm = () => {
    setFormData({ name: '', role: '', description: '', imageUrl: '' });
    setImageFile(null);
    setFileInputKey((prev) => prev + 1);
    setEditingTeam(null);
  };

  const openDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        role: team.role,
        description: team.description,
        imageUrl: team.image
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
      if (!editingTeam && !imageFile) {
        toast({ title: 'Error', description: 'Image file is required', variant: 'destructive' });
        return;
      }

      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('role', formData.role);
      payload.append('description', formData.description);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingTeam) {
        payload.append('_method', 'PUT');
        await axios.post(buildApiUrl(`teams/${editingTeam.id}`), payload);
        toast({ title: 'Success', description: 'Team member updated successfully' });
      } else {
        await axios.post(buildApiUrl('teams'), payload);
        toast({ title: 'Success', description: 'Team member created successfully' });
      }
      const response = await axios.get(buildApiUrl('teams'));
      const teamsPayload = Array.isArray(response.data?.data) ? response.data.data : response.data;
      setTeams((Array.isArray(teamsPayload) ? teamsPayload : []).map((team: any) => ({
        id: String(team?.id ?? ''),
        name: team?.name || '',
        role: team?.role || '',
        description: team?.description || '',
        image: team?.image || ''
      })));
    } catch (error) {
      toast({ title: 'Error', description: 'Team member save failed', variant: 'destructive' });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      try {
        await axios.delete(buildApiUrl(`teams/${id}`));
        const response = await axios.get(buildApiUrl('teams'));
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        setTeams((Array.isArray(payload) ? payload : []).map((team: any) => ({
          id: String(team?.id ?? ''),
          name: team?.name || '',
          role: team?.role || '',
          description: team?.description || '',
          image: team?.image || ''
        })));
        toast({ title: 'Success', description: 'Team member deleted successfully' });
      } catch (error) {
        toast({ title: 'Error', description: 'Team member delete failed', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Team Members</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Edit' : 'Add'} Team Member</DialogTitle>
              <DialogDescription>
                {editingTeam ? 'Update' : 'Create a new'} team member information.
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
                {editingTeam && (formData.imageUrl || editingTeam.image) && (
                  <div className="space-y-2">
                    <Label>Current Image</Label>
                    <img
                      src={normalizeImageUrl(formData.imageUrl || editingTeam.image)}
                      alt={editingTeam.name}
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
                    required={!editingTeam}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingTeam ? 'Update' : 'Create'}</Button>
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{team.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingTeam(team)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(team)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(team.id)}
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
      <Dialog open={!!viewingTeam} onOpenChange={() => setViewingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Member Details</DialogTitle>
          </DialogHeader>
          {viewingTeam && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={normalizeImageUrl(viewingTeam.image)}
                  alt={viewingTeam.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold text-lg">{viewingTeam.name}</h3>
                <Badge variant="secondary" className="mb-2">{viewingTeam.role}</Badge>
              </div>
              <div>
                <Label className="font-medium">Description:</Label>
                <p className="text-sm text-muted-foreground mt-1">{viewingTeam.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
