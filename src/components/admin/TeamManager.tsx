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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Team Members</h2>
          <p className="text-gray-400 text-sm font-light">Manage your creative team and their profiles.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white rounded-xl gap-2 shadow-lg shadow-[#3584DE]/20">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#0F172A] border-white/10 text-white rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">{editingTeam ? 'Edit Member' : 'Add New Member'}</DialogTitle>
              <DialogDescription className="text-gray-400 font-light">
                Fill in the details for the team member. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300 ml-1">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white/5 border-white/10 rounded-xl focus:ring-[#3584DE]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-300 ml-1">Role / Specialization</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    className="bg-white/5 border-white/10 rounded-xl focus:ring-[#3584DE]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300 ml-1">Biography</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="bg-white/5 border-white/10 rounded-xl min-h-[100px] focus:ring-[#3584DE] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-gray-300 ml-1">Profile Photo</Label>
                  <div className="flex flex-col gap-4">
                    {editingTeam && !imageFile && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                        <img 
                          src={normalizeImageUrl(editingTeam.image)} 
                          alt={editingTeam.name} 
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
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/5">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#3584DE] hover:bg-[#3584DE]/90 text-white rounded-xl px-8 shadow-lg shadow-[#3584DE]/20">
                  {editingTeam ? 'Update Member' : 'Add Member'}
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
              <TableHead className="w-[80px]">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Bio</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-gray-500 italic">
                  No team members added yet.
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                      <img 
                        src={normalizeImageUrl(team.image)} 
                        alt={team.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-white tracking-tight">{team.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#06B6D4]/20 text-[#06B6D4] bg-[#06B6D4]/5 rounded-lg text-[10px] uppercase tracking-wider">
                      {team.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-md">
                    <p className="text-gray-400 text-sm font-light truncate">{team.description}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setViewingTeam(team); }}
                        className="text-gray-400 hover:text-[#06B6D4] hover:bg-white/5"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDialog(team)}
                        className="text-gray-400 hover:text-white hover:bg-white/5"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(team.id)}
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

      <Dialog open={!!viewingTeam} onOpenChange={(open) => !open && setViewingTeam(null)}>
        <DialogContent className="sm:max-w-[400px] bg-[#0F172A] border-white/10 text-white rounded-3xl p-8">
          {viewingTeam && (
            <div className="text-center space-y-6">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-white/10 mx-auto shadow-2xl">
                <img 
                  src={normalizeImageUrl(viewingTeam.image)} 
                  alt={viewingTeam.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white mb-1">{viewingTeam.name}</h3>
                <p className="text-[#06B6D4] text-xs font-semibold uppercase tracking-widest">{viewingTeam.role}</p>
              </div>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                {viewingTeam.description}
              </p>
              <Button onClick={() => setViewingTeam(null)} className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl">
                Close Profile
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
