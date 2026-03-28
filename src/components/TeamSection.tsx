
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette } from 'lucide-react';
import { Team } from '@/lib/adminData';

const TeamSection = () => {
  const [teamMembers, setTeamMembers] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(true);
        const response = await axios.get(`${apiBase}/api/teams`);
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        if (!isActive) return;
        setTeamMembers((Array.isArray(payload) ? payload : []).map(normalizeTeam));
      } catch (error) {
        if (!isActive) return;
        setTeamMembers([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadTeams();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  return (
    <section id="team" className="py-16 md:py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
            The Artisans
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Meet Our <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">Creative Team</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            The talented artists and designers behind every masterpiece, bringing your vision to life with passion and expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-20">No team members found.</div>
          ) : (
            teamMembers.map((member) => (
              <Card key={member.id} className="group overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 text-center">
                <CardContent className="p-8">
                  <div className="relative mb-8 inline-block">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-[#06B6D4] transition-colors duration-500">
                      <img 
                        src={normalizeImageUrl(member.image)} 
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[#3584DE] flex items-center justify-center shadow-lg shadow-[#3584DE]/40 transform group-hover:rotate-12 transition-transform duration-500">
                      <Palette className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-[#06B6D4] transition-colors">{member.name}</h3>
                  <p className="text-[#06B6D4] text-xs font-semibold uppercase tracking-widest mb-4">{member.role}</p>
                  <p className="text-gray-400 text-sm leading-relaxed font-light line-clamp-3">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
